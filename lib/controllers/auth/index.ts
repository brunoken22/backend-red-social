import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {conn} from '@/lib/models/conn';

const secrect = process.env.SECRECT as string;
type Data = {
  email: string;
  password: string;
};
type Token = {
  id: number;
};
function getSHA256ofString(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export async function findOrCreateAuth(id: string, data: Data) {
  const token = jwt.sign({id}, secrect);

  const [auth, created] = await conn.Auth.findOrCreate({
    where: {email: data.email},
    defaults: {
      email: data.email,
      password: getSHA256ofString(data.password),
      userId: id,
    },
  });
  return [auth, token];
}
export async function signin(data: Data) {
  const auth = await conn.Auth.findOne({
    where: {email: data.email, password: getSHA256ofString(data.password)},
  });
  if (auth) {
    const token = jwt.sign({id: auth.get('userId')}, secrect);
    const user = await conn.User.findByPk(auth.get('userId') as number);
    return [user, token];
  }
  return [false, null];
}
export async function modAuth(tokenData: Token, data: Data) {
  try {
    const auth = await conn.Auth.update(
      {
        password: getSHA256ofString(data.password),
      },
      {where: {userId: tokenData.id}}
    );
    return auth;
  } catch (e) {
    return false;
  }
}
