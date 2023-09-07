import {NextApiRequest, NextApiResponse} from 'next';
import {
  solicitudDeAmistad,
  getSolicitudAmistad,
  eliminarSolicitud,
} from '@/lib/controllers/user';
const methods = require('micro-method-router');
import {authMiddelware, handlerCors} from '@/lib/middleware';
import {apiHandler} from '@/lib/handler';
type Token = {
  id: number;
};

async function handlerCreateSolicitudAmistrad(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  const body = await req.body;
  const solicitud = await solicitudDeAmistad(token, body);
  return res.json(solicitud);
}

async function handlerObtenerSolicitudAmistad(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  const solicitudes = await getSolicitudAmistad(token);
  return res.json(solicitudes);
}

async function handlerEliminarSolicitud(
  req: NextApiRequest,
  res: NextApiResponse,
  token: Token
) {
  const body = await req.body;
  console.log('FDS', body);
  console.log('FDS', token);

  const user = await eliminarSolicitud(token, body);
  return res.json(user);
}
const met = methods({
  post: handlerCreateSolicitudAmistrad,
  get: handlerObtenerSolicitudAmistad,
  delete: handlerEliminarSolicitud,
});

const conect = apiHandler(met);
const middleware = authMiddelware(conect);
export default handlerCors(middleware);
