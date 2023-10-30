import {cloudinary} from '@/lib/cloudinary';
import {conn} from '@/lib/models/conn';
import {Op, Sequelize} from 'sequelize';

type Data = {
  description: string;
  like: number;
  img: string;
  comentarios: any;
  fecha: string;
};
type Token = {
  id: number;
};
type Comentario = {
  fullName: string;
  description: string;
  img: string;
  userId: number;
  open?: boolean;
};
type Publicacion = {
  userId: number;
  description: string;
  like: number;
  img: string;
  fecha: string;
  comentarios: any[];
};
export type DataLike = {
  id: number;
  tipo: string;
};
export async function createPublicacion(tokenData: Token, data: Data) {
  try {
    let imagenUrl;
    if (data.img) {
      imagenUrl = await cloudinary.v2.uploader.upload(data.img, {
        resource_type: 'image',
        discard_original_filename: true,
        format: 'webp',
      });
    }
    const publicacion = await conn.Publicar.create({
      description: data.description,
      like: [],
      img: imagenUrl?.secure_url ? imagenUrl.secure_url : '',
      comentarios: data.comentarios,
      fecha: data.fecha,
      userId: tokenData.id,
    });

    return publicacion;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getAllPulicacionUser(tokenData: Token, offset: string) {
  try {
    const publicacion = await conn.Publicar.findAll({
      limit: 10,
      offset: Number(offset),
      where: {
        userId: tokenData.id,
      },
      order: [['createdAt', 'DESC']],
    });
    if (!publicacion) {
      return [];
    }
    return publicacion;
  } catch (e) {
    return false;
  }
}

export async function getAllPulicacionRedAmigos(
  tokenData: Token,
  offset: string
) {
  try {
    const getUserRes = await conn.User.findOne({
      where: {id: tokenData.id},
    });
    if (getUserRes.amigos.length > 0) {
      const publicacionAll: Array<Publicacion> = await conn.Publicar.findAll({
        limit: 10,
        offset: Number(offset),
        where: {
          userId: [...getUserRes.amigos, tokenData.id],
        },
        order: [['createdAt', 'DESC']],
      });

      if (publicacionAll?.length < 1) {
        return [];
      }
      return publicacionAll;
    }
    const publicacionUser: Array<Publicacion> = await conn.Publicar.findAll({
      limit: 10,
      offset: Number(offset),
      where: {
        userId: tokenData.id,
      },
      order: [['createdAt', 'DESC']],
    });
    return publicacionUser;
  } catch (e) {
    return e;
  }
}

export async function likePublicacion(tokenData: Token, data: DataLike) {
  try {
    const publiLikeExis = await conn.Publicar.findByPk(data.id);

    if (data.tipo == 'like') {
      if (
        publiLikeExis.get('like').length > 0 &&
        publiLikeExis.get('like').includes(tokenData.id)
      )
        return 'Ya le distes Like';
      const publi = await conn.Publicar.update(
        {like: Sequelize.literal(`array_append("like", ${tokenData.id})`)},
        {
          where: {
            id: data.id,
          },
        }
      );
      if (publi) {
        return 'Like con exito';
      }
    }

    if (data.tipo == 'disLike') {
      const publi = await conn.Publicar.update(
        {like: Sequelize.literal(`array_remove("like", ${tokenData.id})`)},
        {
          where: {
            id: data.id,
          },
        }
      );
      if (publi) {
        return 'DisLike con exito';
      }
    }
  } catch (e) {
    return e;
  }
}

export async function comentarioPublicacion(id: string, data: Comentario) {
  try {
    const publicar = await conn.Publicar.findByPk(id);
    if (!data.description) {
      const modComent = await conn.Publicar.update(
        {open: data.open},
        {
          where: {
            id,
          },
        }
      );
      if (modComent) {
        return modComent;
      }
    }
    if (publicar) {
      const comentariosArray = publicar.getDataValue('comentarios');
      comentariosArray.push(data);

      const modComent = await conn.Publicar.update(
        {
          comentarios: comentariosArray,
          open: data.open,
        },
        {
          where: {
            id,
          },
        }
      );
      if (modComent) {
        return modComent;
      }
      return 'Error al comentar';
    }
    return 'No se encontro publicacion';
  } catch (e) {
    return e;
  }
}

export async function getPublicacionId(id: string) {
  try {
    const publicacion = await conn.Publicar.findByPk(id);
    if (!publicacion) {
      return false;
    }
    return publicacion;
  } catch (e) {
    return e;
  }
}

export async function NotiFicacionesUser(tokenData: Token, offset: string) {
  try {
    let publicacion;
    if (offset == '0') {
      publicacion = await conn.Publicar.findAll({
        limit: 15,
        offset: Number(offset),
        where: {
          userId: tokenData.id,
          open: false,
        },
        order: [['createdAt', 'DESC']],
      });
    } else {
      publicacion = await conn.Publicar.findAll({
        limit: 15,
        offset: Number(offset),
        where: {
          userId: tokenData.id,
          open: true,
        },
        order: [['createdAt', 'DESC']],
      });
    }
    console.log('sddada', publicacion.length);

    let dataResponse = publicacion.filter((item: Publicacion) => {
      if (
        item.comentarios[item.comentarios.length - 1].userId != tokenData.id
      ) {
        return item;
      }
    });
    console.log('sddada', dataResponse.length);

    if (dataResponse.length < 15) {
      const additionalCount = 15 - dataResponse.length;
      const additionalPublications = await conn.Publicar.findAll({
        limit: additionalCount,
        where: {
          userId: tokenData.id,
          open: true, // Cambia a false si deseas cualquier otro
          comentarios: {
            [Op.in]: dataResponse,
          },
        },
        order: [['createdAt', 'DESC']],
      });
      console.log('sddada', additionalPublications.length);

      dataResponse = dataResponse.concat(additionalPublications);
      console.log('sddada', dataResponse.length);
    }

    if (!dataResponse) {
      return [];
    }
    console.log('sddada', dataResponse.length);

    return dataResponse;
  } catch (e) {
    return false;
  }
}
