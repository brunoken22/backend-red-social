import {NextApiRequest, NextApiResponse} from 'next';
import {chatAmigo} from '@/lib/controllers/user';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';

type Token = {
  id: number;
};

export async function sendMessage(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  const data = req.body;
  const dataMessage = await chatAmigo(token, data);
  return res.json(dataMessage);
}

const met = methods({
  post: sendMessage,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
