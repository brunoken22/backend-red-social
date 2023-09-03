import {Model, DataTypes} from 'sequelize';

export function solicitudAmistad(sequelize: any) {
  return sequelize.define('solicitudAmistad', {
    amigoId: DataTypes.INTEGER,
    estado: DataTypes.BOOLEAN,
  });
}
