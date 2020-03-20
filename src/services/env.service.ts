import { readFileSync } from 'fs';
import { parse as dotenvParse, DotenvParseOutput } from 'dotenv';
import Joi from '@hapi/joi';
import { getEnvVariablesPath } from '@/helpers/shared.helper';
import { EnvMode } from '@/typings/shared.typing';

interface EnvConfig {
  HOST: string;
  PORT: number;
  MONGO_URI: string;
  REDIS_PORT: number;
}

/** get environment variables */
export class EnvService {
  private envConfig!: EnvConfig;
  private static instance: EnvService;

  constructor() {
    if (!!EnvService.instance) {
      return EnvService.instance;
    }

    // first instance
    const filePath = getEnvVariablesPath(process.env.NODE_ENV as EnvMode);
    const config = dotenvParse(readFileSync(filePath));

    this.envConfig = this.validateInput(config);
    EnvService.instance = this;

    return this;
  }

  /** validate properties */
  private validateInput(envConfig: DotenvParseOutput): EnvConfig {
    const schema = Joi.object({
      HOST: Joi.string()
        .default('localhost')
        .required(),
      PORT: Joi.number().required(),
      MONGO_URI: Joi.string().required(),
      REDIS_PORT: Joi.number()
        .default(6379)
        .required(),
    });

    const { error, value } = schema.validate(envConfig);

    if (!!error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return value;
  }

  /** app host */
  get host(): string {
    return this.envConfig.HOST;
  }

  /** app port */
  get port(): number {
    return this.envConfig.PORT;
  }

  /** environment */
  get env(): EnvMode {
    return process.env.NODE_ENV as EnvMode;
  }

  /** indicates if app running in development */
  get inDevelopment(): boolean {
    return this.env === 'development';
  }

  /** mongo uri connection */
  get mongoUri(): string {
    return this.envConfig.MONGO_URI;
  }

  /** redis port */
  get redisPort(): number {
    return this.envConfig.REDIS_PORT;
  }
}
