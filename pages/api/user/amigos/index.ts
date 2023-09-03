import {NextApiRequest, NextApiResponse} from 'next';
import {
  aceptarSolicitud,
  getAllAmigos,
  eliminarAmigo,
} from '@/lib/controllers/user';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';
type Token = {
  id: number;
};
async function handlerAceptarSolciitud(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  const body = req.body;
  const user = await aceptarSolicitud(token, body);
  return res.json(user);
}

async function handlerObtenerAllAmigos(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  const user = await getAllAmigos(token);
  return res.json(user);
}
async function handlerEliminarAmigos(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const body = req.body;
    const user = await eliminarAmigo(token, body);
    return res.json(user);
  } catch {
    return res.json({message: 'Token Incorrecto'});
  }
}
const met = methods({
  get: handlerAceptarSolciitud,
  post: handlerObtenerAllAmigos,
  delete: handlerEliminarAmigos,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
