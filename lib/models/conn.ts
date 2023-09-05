import {Sequelize} from 'sequelize';
import pg from 'pg';
import {auth} from './auth';
import {UserModel} from './user';
import {publicacion} from './publicacion';
import {solicitudAmistad} from './solicitud-amistad';

export let conn: any = {
  initialized: false,
  connection,
  sequelize: null,
};
async function connection() {
  const sequelize = new Sequelize(process.env.SEQUELIZE as string, {
    dialectModule: pg,
    pool: {
      max: 1,
      min: 0,
      idle: 500,
    },
  });
  conn.sequelize = sequelize;
  conn.Auth = auth(sequelize);
  conn.User = UserModel(sequelize);
  conn.Publicar = publicacion(sequelize);
  conn.SolicitudAmistad = solicitudAmistad(sequelize);

  await conn.User.hasOne(conn.Auth);
  await conn.User.hasMany(conn.Publicar);
  await conn.User.hasMany(conn.SolicitudAmistad);

  // await sequelize.sync({force: true});
  conn.initialized = true;
}
