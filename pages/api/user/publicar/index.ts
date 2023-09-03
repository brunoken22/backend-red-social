import {NextApiRequest, NextApiResponse} from 'next';
import {
  createPublicacion,
  getAllPulicacionUser,
} from '@/lib/controllers/publicacion';
import methods from 'micro-method-router';
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';
type Token = {
  id: number;
};
async function handlerCreatePubli(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const body = req.body;
    const publicacion = await createPublicacion(token, body);
    return res.json(publicacion);
  } catch {
    return res.json({message: 'Token Incorrecto'});
  }
}

async function handlerObtenerPubli(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const publicacion = await getAllPulicacionUser(token);
    return res.json(publicacion);
  } catch {
    return res.json({message: 'Token Incorrecto'});
  }
}

const met = methods({
  post: handlerCreatePubli,
  get: handlerObtenerPubli,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
