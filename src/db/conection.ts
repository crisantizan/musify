import mongoose from 'mongoose';

/** connect to mongo database */
export function mongoConnect(uri: string) {
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
}
