import {cloudinary} from '@/lib/cloudinary';
import {conn} from '@/lib/models/conn';
import {Sequelize} from 'sequelize';

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
  comentarios: [];
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

export async function getAllPulicacionUser(tokenData: Token) {
  try {
    const publicacion = await conn.Publicar.findAll({
      where: {
        userId: tokenData.id,
      },
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
  limit: string,
  offset: string
) {
  try {
    const getUserRes = await conn.User.findOne({
      where: {id: tokenData.id},
    });
    if (getUserRes.amigos.length > 0) {
      const publicacionAll: Array<Publicacion> = await conn.Publicar.findAll({
        // limit: Number(limit) > 15 ? 15 : limit,
        // offset: offset,
        where: {
          userId: [...getUserRes.amigos, tokenData.id],
        },
      });

      if (publicacionAll?.length < 1) {
        return [];
      }
      return publicacionAll;
    }
    const publicacionUser: Array<Publicacion> = await conn.Publicar.findAll({
      // limit: Number(limit) > 15 ? 15 : limit,
      // offset: offset,
      where: {
        userId: tokenData.id,
      },
      // include: await conn.User,
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
