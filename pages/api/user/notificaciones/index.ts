import {NextApiRequest, NextApiResponse} from 'next';
import {NotiFicacionesUser} from '@/lib/controllers/publicacion';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';
type Token = {
  id: number;
};

async function handlerObtenerNoti(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const {offset} = req.query;
    const publicacion = await NotiFicacionesUser(token, offset as string);
    return res.json(publicacion);
  } catch {
    return res.json({message: 'Token Incorrecto'});
  }
}

const met = methods({
  get: handlerObtenerNoti,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
