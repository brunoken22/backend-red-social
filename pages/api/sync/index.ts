import type {NextApiRequest, NextApiResponse} from 'next';
import {index} from '@/lib/algolia';
import {conn} from '@/lib/models/conn';
import {apiHandler} from '@/lib/handler';
import {handlerCors} from '@/lib/middleware';
const methods = require('micro-method-router');

async function handlerSYNC(req: NextApiRequest, res: NextApiResponse) {
  const usersReci = await conn.User.findAll();
  const object = usersReci.map((user: any) => {
    return {
      objectID: user.id,
      ...user.dataValues,
    };
  });
  await index.saveObjects(object);

  res.json(usersReci);
}
const met = methods({
  get: handlerSYNC,
});

const conect = apiHandler(met);

export default handlerCors(conect);
