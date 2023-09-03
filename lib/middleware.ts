import {NextApiRequest, NextApiResponse} from 'next';
import parseBearerToken from 'parse-bearer-token';
import {decode} from './jwt';
import NextCors from 'nextjs-cors';

export function authMiddelware(callback: any) {
  return function (req: NextApiRequest, res: NextApiResponse) {
    const token = parseBearerToken(req);

    if (!token) {
      res.status(401).send('No hay Token');
    }

    const tokenVerify = decode(token as string);

    if (tokenVerify) {
      callback(req, res, tokenVerify);
    } else {
      res.status(401).send('Token invalido');
    }
  };
}

export function handlerCors(callback: any) {
  try {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      });
      callback(req, res);
    };
  } catch (e) {
    console.log(e);
  }
}
