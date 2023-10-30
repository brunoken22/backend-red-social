import {conn} from '@/lib/models/conn';
import {Op, Sequelize} from 'sequelize';
import {Solicitud, Data, Token, getUser} from '../user';
import {getAllPulicacionUser} from '../publicacion';

export async function eliminarAmigo(tokenData: Token, data: Solicitud) {
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
  return [];
}

export async function getAllAmigos(
  tokenData: Token,
  limit: string,
  offset: string
) {
  const user = await conn.User.findByPk(tokenData.id);
  if (user) {
    const amigos = user.get('amigos');
    if (amigos) {
      const users = await conn.User.findAll({
        // limit: Number(limit) > 10 ? 10 : limit,
        // offset: offset,
        where: {
          id: amigos,
        },
      });
      return users;
    }
    return [];
  }
}

export async function getAmigo(id: number, token: Token) {
  try {
    const user = await conn.User.findByPk(id);
    const solicitudesEnviadas = await conn.SolicitudAmistad.findOne({
      where: {
        [Op.or]: [
          {amigoId: token.id, userId: id, estado: 'false'},
          {amigoId: id, userId: token.id, estado: 'false'},
        ],
      },
    });

    const amigo =
      user.get('amigos')?.length > 0
        ? user.get('amigos').includes(token.id)
        : false;

    let valorSolicitud;
    if (solicitudesEnviadas?.dataValues?.id) {
      valorSolicitud = 'pendiente';
    }

    return {user, amigo: valorSolicitud ? valorSolicitud : amigo};
  } catch (e) {
    return e;
  }
}
export async function getPubliAmigo(token: any, offset: string) {
  const publicaciones = await getAllPulicacionUser({id: token}, offset);
  if (publicaciones) {
    return publicaciones;
  }
  return null;
}
