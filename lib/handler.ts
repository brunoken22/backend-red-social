import {conn} from './models/conn';
import {NextApiResponse, NextApiRequest} from 'next';

export {apiHandler};

function apiHandler(handler: (req: any, res: any, token: any) => {}) {
  return async (req: NextApiRequest, res: NextApiResponse, token: any) => {
    if (!conn.initialized) {
      console.log('CONECTADO');
      await conn.connection();
    }
    handler(req, res, token);
  };
}
