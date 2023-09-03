import jwt from 'jsonwebtoken';
import {cloudinary} from '@/lib/cloudinary';
import {conn} from '@/lib/models/conn';
import {Op, Sequelize} from 'sequelize';

const secrect = process.env.SECRECT as string;

type Solicitud = {
  amigoId: string;
  estado: boolean;
  userId?: number;
};

type Data = {
  email: string;
  fullName: string;
  img: string;
  amigos: [];
};

type Token = {
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
    const user = await conn.User.findOne({
      where: {id: tokenData.id},
    });
    return user;
  } catch (e) {
    return false;
  }
}
export async function modUser(token: string, data: Data) {
  try {
    const tokenData = jwt.verify(token, secrect);
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
      {where: {id: (tokenData as Token).id}}
    );
    return {newuser, img: imagenUrl?.secure_url ? imagenUrl.secure_url : null};
  } catch (e) {
    return false;
  }
}
export async function solicitudDeAmistad(tokenData: Token, data: Solicitud) {
  try {
    const [solicitudUser, create] = await conn.SolicitudAmistad.findOrCreate({
      where: {
        amigoId: data.amigoId,
        userId: tokenData.id,
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
    return false;
  }
}
export async function getSolicitudAmistad(tokenData: Token) {
  try {
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
      const solicitudidsReci = conn.solicitudesReci.map((solicitud: any) =>
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
  } catch (e) {
    return e;
  }
}
export async function getSolicitudAmistadEnvi(tokenData: Token) {
  try {
    const solicitudesReci = await conn.SolicitudAmistad.findAll({
      where: {
        amigoId: tokenData.id,
        estado: 'false',
      },
    });

    if (solicitudesReci.length > 0) {
      const solicitudidsReci = solicitudesReci.map((solicitud: any) =>
        solicitud.get('userId')
      );
      const users = await conn.User.findAll({
        where: {
          id: {
            [Op.in]: solicitudidsReci,
          },
        },
      });
      return users;
    }

    return [];
  } catch (e) {
    return false;
  }
}
export async function aceptarSolicitud(tokenData: Token, data: Solicitud) {
  try {
    const solicitud = await conn.SolicitudAmistad.update(
      {estado: data.estado},
      {
        where: {
          userId: data.amigoId,
        },
      }
    );
    if (solicitud) {
      const ids = [{user: tokenData.id}, {user: data.amigoId}];
      const user1 = await conn.User.update(
        {amigos: Sequelize.literal(`array_append(amigos, ${ids[1].user})`)},
        {
          where: {
            id: ids[0].user,
          },
        }
      );
      const user2 = await conn.User.update(
        {amigos: Sequelize.literal(`array_append(amigos, ${ids[0].user})`)},
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
    return 'Algo fallo';
  } catch (e) {
    return false;
  }
}
export async function eliminarSolicitud(tokenData: Token, data: Solicitud) {
  try {
    const solicitudEnv = await conn.SolicitudAmistad.destroy({
      where: {
        amigoId: tokenData.id,
        userId: data.userId,
      },
      force: true,
    });
    const solicitudReci = await conn.SolicitudAmistad.destroy({
      where: {
        amigoId: data.userId,
        userId: tokenData.id,
      },
      force: true,
    });

    if (solicitudEnv || solicitudReci) {
      return 'Solicitud Eliminada';
    }
    return 'No existe solicitud';
  } catch (e) {
    return e;
  }
}
export async function eliminarAmigo(tokenData: Token, data: Solicitud) {
  try {
    const user1 = await conn.User.update(
      {amigos: conn.sequelize?.literal(`array_remove(amigos, ${data.userId})`)},
      {
        where: {
          id: tokenData.id,
        },
      }
    );
    const user2 = await conn.User.update(
      {
        amigos: conn.sequelize.literal(`array_remove(amigos, ${tokenData.id})`),
      },
      {
        where: {
          id: data.userId,
        },
      }
    );
    if (user1 && user2) {
      return {user1, user2};
    }
    return 'No existe Amigo';
  } catch (e) {
    return e;
  }
}
export async function getAllAmigos(tokenData: Token) {
  try {
    const user = await conn.User.findByPk(tokenData.id);
    if (user) {
      const amigos = user.get('amigos');
      if (amigos) {
        const users = await conn.User.findAll({
          where: {
            id: amigos,
          },
        });
        return users;
      }
      return [];
    }
  } catch (e) {
    return false;
  }
}
export async function getAllUser(tokenData: Token) {
  try {
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

    const solicitudIdsReci = solicitudesReci.map((solicitud: any) =>
      solicitud.get('userId')
    );
    const solicitudIdsEnv = solicitudesEnv.map((solicitud: any) =>
      solicitud.get('amigoId')
    );
    if (
      solicitudIdsReci.length > 0 ||
      solicitudIdsEnv.length > 0 ||
      user?.get('amigos')
    ) {
      const diferUsers = [
        ...solicitudIdsEnv,
        ...(user?.get('amigos') as []),
        (tokenData as Token).id,
        ...solicitudIdsReci,
      ];

      const usersAll = await conn.User.findAll({
        where: {
          id: {
            [Op.notIn]: diferUsers,
          },
        },
      });
      if (usersAll) {
        return usersAll;
      }
    }

    return [];
  } catch (e) {
    return e;
  }
}
