import {NextApiRequest, NextApiResponse} from 'next';
import {getAllUser} from '@/lib/controllers/user';
import methods from 'micro-method-router';
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';
export const dynamic = 'force-dynamic';
type Token = {
  id: number;
};
async function handlerObtenerAllUser(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const users = await getAllUser(token);
    return res.json(users);
  } catch (e) {
    return res.json(e);
  }
}

const met = methods({
  get: handlerObtenerAllUser,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
