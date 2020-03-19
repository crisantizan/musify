import mongoose, { model } from 'mongoose';
import { Album } from './album.model';
const { Schema } = mongoose;

export interface Song extends mongoose.Document {
  number: string;
  name: string;
  duration: number;
  file: string;
  album: Album;
}

const SongSchema = new Schema(
  {
    number: { type: String, required: true },
    name: { type: String, required: true },
    duration: { type: String, required: true },
    file: { type: String, required: true },
    album: { type: Schema.Types.ObjectId, ref: 'Album', required: true },
  },
  { timestamps: true },
);

export default model<Song>('Song', SongSchema);
