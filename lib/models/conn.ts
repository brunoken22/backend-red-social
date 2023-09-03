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
      max: 3, // Número máximo de conexiones en el pool
      min: 0, // Número mínimo de conexiones en el pool
      idle: 10000, // Tiempo máximo (en milisegundos) que una conexión puede permanecer inactiva en el pool
    },
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
