import {DataTypes} from 'sequelize';

export function UserModel(sequelize: any) {
  return sequelize.define('user', {
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    img: DataTypes.STRING,
    amigos: DataTypes.ARRAY(DataTypes.INTEGER),
    rtdb: DataTypes.ARRAY(DataTypes.STRING),
  });
}
