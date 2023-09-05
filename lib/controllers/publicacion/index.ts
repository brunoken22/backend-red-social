import {cloudinary} from '@/lib/cloudinary';
import {conn} from '@/lib/models/conn';

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

type User = {
  id: number;
  fullName: string;
  email: string;
  img: string;
  amigos: [];
  publicaciones: any;
};
type Publicacion = {
  userId: number;
  description: string;
  like: number;
  img: string;
  fecha: string;
  comentarios: [];
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
      like: Number(data.like),
      img: imagenUrl?.secure_url ? imagenUrl.secure_url : '',
      comentarios: data.comentarios,
      fecha: data.fecha,
      userId: tokenData.id,
    });

    return publicacion;
  } catch (e) {
    return false;
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
  amigosUser: []
) {
  if (amigosUser.length > 0) {
    const publicacionAll: Array<Publicacion> = await conn.Publicar.findAll({
      where: {
        userId: [...amigosUser, tokenData.id],
      },
    });

    if (publicacionAll.length < 1) {
      return [];
    }
    return publicacionAll;
  }
  const publicacionUser: Array<Publicacion> = await conn.Publicar.findAll({
    where: {
      userId: tokenData.id,
    },
  });
  return publicacionUser;
}
