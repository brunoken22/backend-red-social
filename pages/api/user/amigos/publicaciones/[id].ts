import {NextApiRequest, NextApiResponse} from 'next';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';
import {getPubliAmigo} from '@/lib/controllers/amigo';
type Token = {
  id: number;
};
async function handlerObtenerPublicaciones(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const {offset, id} = req.query;
    const publicacion = await getPubliAmigo(id, offset as string);
    return res.json(publicacion);
  } catch {
    return res.json({message: 'Token Incorrecto'});
  }
}

const met = methods({
  get: handlerObtenerPublicaciones,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
