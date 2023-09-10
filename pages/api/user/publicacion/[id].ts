import {NextApiRequest, NextApiResponse} from 'next';
import {
  likePublicacion,
  comentarioPublicacion,
} from '@/lib/controllers/publicacion';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';

type Token = {
  id: number;
};

async function handlerLikePubli(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const {id} = req.query;
    const data = req.body;
    const publicacion = await likePublicacion(token, {
      id: Number(id),
      tipo: data.tipo as string,
    });
    return res.json(publicacion);
  } catch (e) {
    return res.json(e);
  }
}
async function handlerComentarioPublicacion(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  try {
    const {id} = req.query;
    const data = req.body;
    const publicacion = await comentarioPublicacion(id as string, data);
    return res.json(publicacion);
  } catch (e) {
    return res.json(e);
  }
}
const met = methods({
  post: handlerLikePubli,
  patch: handlerComentarioPublicacion,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
