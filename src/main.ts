// register alias in javascript files
if (process.env.NODE_ENV === 'production') {
  require('module-alias/register');
}

import app from '@/app';
import { config } from 'dotenv';
import { getEnvVariablesPath } from '@/helpers/shared.helper';
import { EnvMode } from './typings/shared.typing';
import { mongoConnect } from './db/conection';
import { jobService } from './services/cron.service';

// load environment variables according to mode
config({
  path: getEnvVariablesPath(process.env.NODE_ENV as EnvMode),
});

async function bootstrap() {
  const [port, env, mongoUri] = [
    app.get('port'),
    app.get('environment'),
    app.get('mongoUri'),
  ];

  try {
    await mongoConnect(mongoUri);

    const server = app.listen(port, () => {
      console.info(`[${env}] server running on port: ${port}`);

      // start running cron job
      // env === 'production' && jobService.start();
    });

    // 4 minutes
    server.timeout = 4 * 60000;
  } catch (error) {
    console.error(error);
  }
}

bootstrap();
