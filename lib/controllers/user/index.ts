import {cloudinary} from '@/lib/cloudinary';
import {conn} from '@/lib/models/conn';
import {Op, Sequelize} from 'sequelize';
import {getAllPulicacionRedAmigos} from '../publicacion';
import {getAllAmigos} from '../amigo';
import {nanoid} from 'nanoid';

export type Solicitud = {
  amigoId: number;
  estado: boolean;
  userId?: number;
  rtdb?: string;
};
export type Rooms = {
  message: string;
  fullName: string;
  rtdb?: string;
};
export type Data = {
  email: string;
  fullName: string;
  img: string;
  amigos: [];
};

export type Token = {
  id: number;
};

export async function findOrCreateUser(data: Data) {
  const [user, userCreated] = await conn.User.findOrCreate({
    where: {email: data.email},
    defaults: {
      email: data.email,
      fullName: data.fullName,
    },
  });

  return [user, userCreated];
}
export async function getUser(tokenData: Token) {
  try {
    const getUserRes = await conn.User.findOne({
      where: {id: tokenData.id},
    });
    const getAllPulicacionRedAmigosRes = await getAllPulicacionRedAmigos(
      tokenData,
      getUserRes.get('amigos')
    );
    const getSolicitudAmistadRes = await getSolicitudAmistad(tokenData);
    const getAllAmigosRes = await getAllAmigos(tokenData);
    const getAllUserRes = await getAllUser(tokenData);

    return {
      getUserRes,
      getAllPulicacionRedAmigosRes,
      getSolicitudAmistadRes,
      getAllAmigosRes,
      getAllUserRes,
    };
  } catch (e) {
    return e;
  }
}
export async function modUser(tokenData: Token, data: Data) {
  try {
    let imagenUrl;
    if (data.img) {
      imagenUrl = await cloudinary.v2.uploader.upload(data.img, {
        resource_type: 'image',
        discard_original_filename: true,
        format: 'webp',
      });
    }
    const newuser = await conn.User.update(
      {
        email: data.email,
        fullName: data.fullName,
        img: imagenUrl && imagenUrl.secure_url,
      },
      {where: {id: tokenData.id}}
    );
    return {newuser, img: imagenUrl?.secure_url ? imagenUrl.secure_url : null};
  } catch (e) {
    return e;
  }
}
export async function solicitudDeAmistad(tokenData: Token, data: Solicitud) {
  try {
    if (data.amigoId == tokenData.id) return {message: 'Datos Incorrectos'};
    const [solicitudUser, create] = await conn.SolicitudAmistad.findOrCreate({
      where: {
        [Op.or]: [
          {amigoId: data.amigoId, userId: tokenData.id, estado: 'false'},
          {amigoId: tokenData.id, userId: data.amigoId, estado: 'false'},
        ],
      },
      defaults: {
        amigoId: data.amigoId,
        estado: data.estado,
        userId: tokenData.id,
      },
    });
    if (!create) return 'Ya existe solicitud';
    return solicitudUser;
  } catch (e) {
    return e;
  }
}
export async function getSolicitudAmistad(tokenData: Token) {
  const solicitudesReci = await conn.SolicitudAmistad.findAll({
    where: {
      amigoId: tokenData.id,
      estado: 'false',
    },
  });

  const solicitudesEnv = await conn.SolicitudAmistad.findAll({
    where: {
      userId: tokenData.id,
      estado: 'false',
    },
  });

  if (solicitudesReci.length > 0 || solicitudesEnv.length > 0) {
    const solicitudidsReci = solicitudesReci.map((solicitud: any) =>
      solicitud.get('userId')
    );
    const solicitudidsEnv = solicitudesEnv.map((solicitud: any) =>
      solicitud.get('amigoId')
    );
    const usersReci = await conn.User.findAll({
      where: {
        id: {
          [Op.in]: solicitudidsReci,
        },
      },
    });
    const usersEnv = await conn.User.findAll({
      where: {
        id: {
          [Op.in]: solicitudidsEnv,
        },
      },
    });
    return {usersReci, usersEnv};
  }
  return [];
}
export async function aceptarSolicitud(tokenData: Token, data: Solicitud) {
  try {
    const userData = await conn.User.findByPk(tokenData.id);
    const amigoIdData = await conn.User.findByPk(data.amigoId);
    const existeComun = userData
      ?.get('rtdb')
      ?.some((item: string) => amigoIdData.get('rtdb')?.includes(item));

    if (!existeComun) {
      const idRoom = nanoid(10);
      const usersCollection = conn.firebaseRTDB.ref('/rooms/' + idRoom);
      await usersCollection.set({
        userId: userData.get('id'),
        amigoId: data.amigoId,
      });
      await conn.User.update(
        {
          rtdb: Sequelize.literal(`array_append("rtdb",'${idRoom}')`),
        },
        {
          where: {
            id: {
              [Op.in]: [tokenData.id, data.amigoId],
            },
          },
        }
      );
    }

    const solicitud = await conn.SolicitudAmistad.update(
      {estado: data.estado},
      {
        where: {
          amigoId: tokenData.id,
          userId: data.amigoId,
        },
      }
    );
    if (solicitud) {
      const ids = [{user: tokenData.id}, {user: data.amigoId}];
      const user1 = await conn.User.update(
        {amigos: Sequelize.literal(`array_append("amigos", ${ids[1].user})`)},
        {
          where: {
            id: ids[0].user,
          },
        }
      );
      const user2 = await conn.User.update(
        {amigos: Sequelize.literal(`array_append("amigos", ${ids[0].user})`)},
        {
          where: {
            id: ids[1].user,
          },
        }
      );
      if (user1 && user2) {
        return 'Ahora son Amigos';
      }
    }
    return false;
  } catch (e) {
    console.log(e);
    return e;
  }
}
export async function eliminarSolicitud(tokenData: Token, data: Solicitud) {
  try {
    const solicitud = await conn.SolicitudAmistad.destroy({
      where: {
        [Op.or]: [
          {amigoId: data.userId, userId: tokenData.id},
          {amigoId: tokenData.id, userId: data.userId},
        ],
      },
    });
    if (solicitud) {
      return solicitud;
    }
    return 'No existe solicitud';
  } catch (e) {
    console.log(e);
    return e;
  }
}
export async function getAllUser(tokenData: Token) {
  const user = await conn.User.findByPk(tokenData.id);
  const solicitudesReci = await conn.SolicitudAmistad.findAll({
    where: {
      amigoId: tokenData.id,
      estado: 'false',
    },
  });
  const solicitudesEnv = await conn.SolicitudAmistad.findAll({
    where: {
      userId: tokenData.id,
      estado: 'false',
    },
  });

  const solicitudIdsReci =
    solicitudesReci.length > 0
      ? solicitudesReci.map((solicitud: any) => solicitud.get('userId'))
      : [];
  const solicitudIdsEnv =
    solicitudesEnv.length > 0
      ? solicitudesEnv.map((solicitud: any) => solicitud.get('amigoId'))
      : [];

  const amigosUser = user?.get('amigos') ? (user?.get('amigos') as []) : [];

  let diferUsers: any = [];
  if (
    solicitudIdsReci.length > 0 ||
    solicitudIdsEnv.length > 0 ||
    amigosUser.length > 0
  ) {
    diferUsers = [
      ...solicitudIdsEnv,
      ...amigosUser,
      tokenData.id,
      ...solicitudIdsReci,
    ];
  }
  console.log(diferUsers);
  const usersAll = await conn.User.findAll({
    where: {
      id: {
        [Op.notIn]: diferUsers?.length > 0 ? diferUsers : [tokenData.id],
      },
    },
  });
  if (usersAll) {
    return usersAll;
  }
  return [];
}
export async function chatAmigo(tokenData: Token, data: Rooms) {
  try {
    const usersCollection = conn.firebaseRTDB.ref(
      '/rooms/' + data.rtdb + '/messages'
    );
    await usersCollection.push({
      message: data.message,
      id: tokenData.id,
    });
    return true;
  } catch (e) {
    return e;
  }
}
