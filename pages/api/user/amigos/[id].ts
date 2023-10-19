import {NextApiRequest, NextApiResponse} from 'next';
import {getAmigo} from '@/lib/controllers/amigo';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';
type Token = {
  id: number;
};

async function handlerObtenerAmigoId(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const {id, offset} = req.query;
    const amigo: any = await getAmigo(Number(id), token);
    if (!amigo.user.id) res.json(false);
    return res.json(amigo);
  } catch (e) {
    return res.json(e);
  }
}

const met = methods({
  get: handlerObtenerAmigoId,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
