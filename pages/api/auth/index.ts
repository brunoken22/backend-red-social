import {NextApiRequest, NextApiResponse} from 'next';
import {findOrCreateAuth} from '@/lib/controllers/auth';
import {findOrCreateUser} from '@/lib/controllers/user';
import {apiHandler} from '@/lib/handler';
import {handlerCors} from '@/lib/middleware';
import methods from 'micro-method-router';

async function findCreateUser(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body;
  if (!body) {
    return res.json({message: 'Faltan datos'});
  }
  const [user, userCreated] = await findOrCreateUser(body);
  if (userCreated) {
    const [auth, token] = await findOrCreateAuth((user as any).id, body);
    return res.json({user, token});
  }
  return res.json('Usuario Registrado');
}
const met = methods({
  post: findCreateUser,
});
const conect = apiHandler(met);

export default handlerCors(conect);
