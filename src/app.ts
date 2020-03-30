import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import router from '@/routes/router';

import { EnvService } from '@/services/env.service';
import { responseTrasformPipe } from '@/common/http/pipes';
import { HttpException } from './common/http/exceptions/http.exception';
import { MulterError } from 'multer';
import { HttpStatus } from './common/enums';

const app = express();
const { port, inDevelopment, env, mongoUri } = new EnvService();

// settings
app.set('port', port);
app.set('environment', env);
app.set('mongoUri', mongoUri);

// global middlewares
app
  .use(
    cors({
      origin: ['http://localhost:4200'],
      exposedHeaders: 'x-token',
    }),
  )
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(helmet());

// use only in development
if (inDevelopment) {
  app.use(morgan('dev'));
}

/** transform responses */
app.use(responseTrasformPipe);

// set global prefix
app.use('/api', router);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  if (err instanceof HttpException) {
    res.status(err.status).json(err.body);
  }

  // file not found
  if (err.code === 'ENOENT') {
    return res.status(err.statusCode).json('file not found');
  }

  // multer errors
  if (err instanceof MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json('file uploader: file is too big');
      case 'LIMIT_UNEXPECTED_FILE':
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(`file uploader: ${err.field} is an unexpected field`);
    }
  }
};
app.use(errorHandler);

// this is innecesary, only for example
app.get('/', (req, res) => {
  // display available routes
  res.json(['/api/users', '/api/roles']);
});

export default app;
