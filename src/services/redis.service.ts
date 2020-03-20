import { Tedis } from 'tedis';
import { EnvService } from './env.service';

export class RedisService extends Tedis {
  constructor() {
    const { host, redisPort } = new EnvService();

    super({
      host,
      port: redisPort,
    });
  }

  /** generate the user key to get his token */
  public generateUserkey(userId: string) {
    return { redisUserKey: `userKey${userId}` };
  }
}
