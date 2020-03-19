import { compareSync, hash, genSalt } from 'bcryptjs';

export class EncryptService {
  /** create a new hash from the value passed */
  static async createHash(value: string, rounds = 10): Promise<string> {
    const salt = await genSalt(rounds);

    return await hash(value, salt);
  }

  /** validate if the string passed corresponds to the hash */
  public static compareHash(value: string, hash: string): boolean {
    return compareSync(value, hash);
  }
}
