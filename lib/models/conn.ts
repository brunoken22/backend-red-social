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
  });
  conn.sequelize = sequelize;
  conn.Auth = auth(sequelize);
  conn.User = UserModel(sequelize);
  conn.Publicar = publicacion(sequelize);
  conn.SolicitudAmistad = solicitudAmistad(sequelize);

  conn.User.hasOne(conn.Auth);
  conn.User.hasMany(conn.Publicar);
  conn.User.hasMany(conn.SolicitudAmistad);
  await sequelize.sync({alter: true});
  conn.initialized = true;
}
