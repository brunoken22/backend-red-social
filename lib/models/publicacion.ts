import {Model, DataTypes} from 'sequelize';

export function publicacion(sequelize: any) {
  return sequelize.define('publicar', {
    description: DataTypes.STRING,
    like: DataTypes.INTEGER,
    img: DataTypes.STRING,
    fecha: DataTypes.STRING,
    comentarios: DataTypes.ARRAY(DataTypes.JSON),
  });
}
