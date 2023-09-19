import type {NextApiRequest, NextApiResponse} from 'next';
import {Token, searchUser} from '@/lib/controllers/user';
import {apiHandler} from '@/lib/handler';
import {authMiddelware, handlerCors} from '@/lib/middleware';
const methods = require('micro-method-router');

async function handlerSYNC(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const {fullName} = req.query;
    const users = await searchUser(fullName as string, token);
    res.json(users);
  } catch (e) {
    res.json(e);
  }
}

const met = methods({
  get: handlerSYNC,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);

export default handlerCors(middleware);
