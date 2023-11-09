import {cloudinary} from '@/lib/cloudinary';
import {conn} from '@/lib/models/conn';
import {off} from 'process';
import {Op, Sequelize} from 'sequelize';
import {getJSDocReturnType} from 'typescript';

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
    if (getUserRes.amigos) {
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
    console.log(publicacionUser.length);
    if (publicacionUser.length) {
      return publicacionUser;
    }
    return [];
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
    publicacion = await conn.Publicar.findAll({
      limit: 15,
      offset: Number(offset),
      where: {
        userId: tokenData.id,
        open: true,
      },
      order: [['createdAt', 'DESC']],
    });
    let newOffset = Number(offset);

    if (publicacion.length < 15) {
      let cuentaAtras = async () => {
        if (publicacion.length >= 15) {
          return;
        }
        const additionalCount = 15 - publicacion.length;
        const additionalPublications = await conn.Publicar.findAll({
          limit: additionalCount,
          offset: newOffset,
          where: {
            userId: tokenData.id,
            open: false,
          },
          order: [['createdAt', 'DESC']],
        });
        if (additionalPublications.length < 1) {
          return;
        }
        let dataResponse = additionalPublications.filter(
          (item: Publicacion) => {
            if (
              item.comentarios.filter(
                (item: any) => item.userId != tokenData.id
              ).length > 0
            ) {
              return item;
            }
          }
        );
        newOffset = newOffset + 15;
        publicacion = publicacion!.concat(dataResponse);
        return cuentaAtras();
      };
      await cuentaAtras();
    }
    return {publicacion, offset: newOffset};
  } catch (e) {
    return false;
  }
}

export async function deletePublicacion(tokenData: Token, id: string) {
  try {
    const publicacion = await conn.Publicar.destroy({
      where: {
        id,
        userId: tokenData.id,
      },
    });
    if (!publicacion) {
      return false;
    }
    return publicacion;
  } catch (e) {
    return e;
  }
}
