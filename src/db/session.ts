import db from 'mongoose';

/** mongoose transaction */
export async function getMongooseSession() {
  return await db.startSession();
}
