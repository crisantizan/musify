import mongoose from 'mongoose';

/** connect to mongo database */
export function mongoConnect(uri: string) {
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.info('[mongodb] connection is succesfully'))
    .catch(err => console.error(err));
}
