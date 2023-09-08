import {NextApiRequest, NextApiResponse} from 'next';
import {likePublicacion} from '@/lib/controllers/publicacion';
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
const met = methods({
  post: handlerLikePubli,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
