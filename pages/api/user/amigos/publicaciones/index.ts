import {NextApiRequest, NextApiResponse} from 'next';
import {getAllPulicacionRedAmigos} from '@/lib/controllers/publicacion';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';
type Token = {
  id: number;
};
async function handlerObtenerPublicacionesAmigos(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const {offset} = req.query;
    const publicacion = await getAllPulicacionRedAmigos(
      token,
      offset as string
    );
    return res.json(publicacion);
  } catch {
    return res.json({message: 'Token Incorrecto'});
  }
}

const met = methods({
  get: handlerObtenerPublicacionesAmigos,

});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
