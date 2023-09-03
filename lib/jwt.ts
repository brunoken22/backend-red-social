import jwt from 'jsonwebtoken';
export function token(id: number) {
  const token = jwt.sign({id}, process.env.SECRECT as string);
  return token;
}

export function decode(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.SECRECT as string);
    return decoded;
  } catch (e) {
    return null;
  }
}
