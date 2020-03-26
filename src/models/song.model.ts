import mongoose, { model } from 'mongoose';
import { AlbumDocument } from './album.model';
const { Schema } = mongoose;

export interface SongDocument extends mongoose.Document {
  number: string;
  name: string;
  duration: number;
  file: string;
  album: AlbumDocument;
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

export const SongModel = model<SongDocument>('Song', SongSchema);
