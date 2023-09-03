import {NextApiRequest, NextApiResponse} from 'next';
import {signin} from '@/lib/controllers/auth';
import {apiHandler} from '@/lib/handler';
import {handlerCors} from '@/lib/middleware';
import methods from 'micro-method-router';

async function handlerSignin(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body;
  const [user, token] = await signin(body);
  return res.json({
    user,
    token,
  });
}
const met = methods({
  post: handlerSignin,
});
const conect = apiHandler(met);

export default handlerCors(conect);
