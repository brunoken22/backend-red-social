import {conn} from '@/lib/models/conn';
import {Op, Sequelize} from 'sequelize';
import {getAllPulicacionUser} from '../publicacion';
import {Solicitud, Data, Token, getUser} from '../user';

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

export async function getAllAmigos(tokenData: Token) {
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
}

export async function getAmigo(id: number) {
  const user = await conn.User.findByPk(id);
  const publicaciones = await getAllPulicacionUser({id});
  if (publicaciones) {
    return {user, publicaciones};
  }
  return user;
}
