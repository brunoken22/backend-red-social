import {NextApiRequest, NextApiResponse} from 'next';
import {findOrCreateAuth} from '@/lib/controllers/auth';
import {findOrCreateUser} from '@/lib/controllers/user';
import {apiHandler} from '@/lib/handler';
import {handlerCors} from '@/lib/middleware';
const methods = require('micro-method-router');

async function findCreateUser(req: NextApiRequest, res: NextApiResponse) {
  try {
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
  } catch (e) {
    res.json(e);
  }
}
const met = methods({
  post: findCreateUser,
});
const conect = apiHandler(met);

export default handlerCors(conect);
