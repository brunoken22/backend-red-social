import {conn} from '@/lib/models/conn';
import {Op} from 'sequelize';
import {Solicitud, Token} from '../user';
import {getAllPulicacionUser} from '../publicacion';

export async function eliminarAmigo(tokenData: Token, data: Solicitud) {
  try {
    let complete = [];
    let count = 1;
    const users = [{userId: data.userId}, {userId: tokenData.id}];
    for (let i of users) {
      const userData = await conn.User.findByPk(i.userId);
      const amigosUser = userData.get('amigos');
      const newAmigos = amigosUser.filter(
        (item: number) => item != users[count].userId
      );
      const result = await conn.User.update(
        {
          amigos: newAmigos,
        },
        {
          where: {
            id: i.userId,
          },
        }
      );
      complete.push(result);
      count--;
    }
    if (complete.length) {
      return complete;
    }
    return false;
  } catch (e) {
    return e;
  }
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
