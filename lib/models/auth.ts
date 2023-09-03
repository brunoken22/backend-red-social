import {Model, DataTypes} from 'sequelize';

export function auth(sequelize: any) {
  return sequelize.define('auth', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
  });
}
