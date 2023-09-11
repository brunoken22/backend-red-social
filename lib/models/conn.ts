import {Sequelize} from 'sequelize';
import pg from 'pg';
import {auth} from './auth';
import {UserModel} from './user';
import {publicacion} from './publicacion';
import {solicitudAmistad} from './solicitud-amistad';
import admin from 'firebase-admin';

export let conn: any = {
  initialized: false,
  connection,
  sequelize: null,
  firebaseRTDB: null,
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
  const serviceAccount = JSON.parse(process.env.FIREBASE_CONNECTION as string);
  if (!admin.apps.length) {
    console.log('Conectado a firebase');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_RTDB,
    });
  }
  conn.firebaseRTDB = admin.database();
  conn.sequelize = sequelize;
  conn.Auth = auth(sequelize);
  conn.User = UserModel(sequelize);
  conn.Publicar = publicacion(sequelize);
  conn.SolicitudAmistad = solicitudAmistad(sequelize);

  await conn.User.hasOne(conn.Auth);
  await conn.User.hasMany(conn.Publicar);
  await conn.User.hasMany(conn.SolicitudAmistad);

  await sequelize.sync({alter: true});
  conn.initialized = true;
}
