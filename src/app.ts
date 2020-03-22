import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import router from '@/routes/router';

import { EnvService } from '@/services/env.service';
import { responseTrasformPipe } from '@/common/http/pipes';

const app = express();
const { port, inDevelopment, env, mongoUri } = new EnvService();

// settings
app.set('port', port);
app.set('environment', env);
app.set('mongoUri', mongoUri);

// global middlewares
app
  .use(cors({
    origin: ['http://localhost:4200'],
    exposedHeaders: 'x-token'
  }))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(helmet());

// use only in development
if (inDevelopment) {
  app.use(morgan('dev'));
}

/** transform responses */
app.use(responseTrasformPipe);

// this is innecesary, only for example
app.get('/', (req, res) => {
  // display available routes
  res.json(['/api/users', '/api/roles']);
});

// set global prefix
app.use('/api', router);

export default app;
