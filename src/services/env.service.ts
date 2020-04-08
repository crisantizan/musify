import { readFileSync } from 'fs';
import { parse as dotenvParse, DotenvParseOutput } from 'dotenv';
import Joi from '@hapi/joi';
import { getEnvVariablesPath } from '@/helpers/shared.helper';
import { EnvMode } from '@/typings/shared.typing';
import { pathExistsSync } from 'fs-extra';

interface EnvConfig {
  HOST: string;
  PORT: number;
  MONGO_URI: string;
  REDIS_PORT: number;
  REDIS_HOST: string;
  REDIS_PASS: string;
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
    if (process.env.NODE_ENV === 'production' && !pathExistsSync(filePath)) {
    }

    const manually =
      process.env.NODE_ENV === 'production' && !pathExistsSync(filePath);

    const config: EnvConfig | DotenvParseOutput = manually
      ? this.getManually()
      : dotenvParse(readFileSync(filePath));

    this.envConfig = this.validateInput(config);
    EnvService.instance = this;

    return this;
  }

  /** get environment variables manually */
  private getManually(): EnvConfig {
    return {
      HOST: process.env.HOST!,
      PORT: (process.env.PORT as unknown) as number,
      MONGO_URI: process.env.MONGO_URI!,
      REDIS_HOST: process.env.REDIS_HOST!,
      REDIS_PORT: (process.env.REDIS_PORT as unknown) as number,
      REDIS_PASS: process.env.REDIS_PASS!,
    };
  }

  /** validate properties */
  private validateInput(envConfig: DotenvParseOutput | EnvConfig): EnvConfig {
    const schema = Joi.object({
      HOST: Joi.string()
        .default('localhost')
        .required(),
      PORT: Joi.number().required(),
      MONGO_URI: Joi.string().required(),
      REDIS_HOST: Joi.string().required(),
      REDIS_PASS: Joi.string().optional(),
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

  /** redis config */
  get redisConfig() {
    return {
      host: this.envConfig.REDIS_HOST,
      port: this.envConfig.REDIS_PORT,
      password: this.envConfig.REDIS_PASS,
    };
  }
}
