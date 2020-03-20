import { NextFunction, Request, Response } from 'express';

/** [middleware] transform all responses */
export function httpResponseTransformMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { send } = res;

  res.send = function(body) {
    const [method, timestamp, path, status, response] = [
      req.method,
      new Date(),
      req.path,
      res.statusCode,
      JSON.parse(body),
    ];

    return send.call(
      this,
      JSON.stringify({ method, timestamp, path, status, response }),
    );
  };

  next();
}
