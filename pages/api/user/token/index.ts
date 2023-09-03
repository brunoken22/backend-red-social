import {NextApiRequest, NextApiResponse} from 'next';
import {modUser, getUser} from '@/lib/controllers/user';
import {modAuth} from '@/lib/controllers/auth';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';

type Token = {
  id: number;
};

export async function modiUser(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  const data = await req.body;
  const user = await modUser(token, data);
  const auth = await modAuth(token, data);
  return res.json({user, auth});
}

export async function obtenerUser(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  const user = await getUser(token);
  return res.json(user);
}
const met = methods({
  get: obtenerUser,
  patch: modiUser,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
