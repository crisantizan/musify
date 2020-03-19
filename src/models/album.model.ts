import mongoose, { model } from 'mongoose';
import { Artist } from './artist.model';
const { Schema } = mongoose;

export interface Album extends mongoose.Document {
  title: string;
  description: string;
  year: number;
  cover: string;
  artist: Artist;
}

const AlbumSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    year: { type: Number, required: true },
    cover: { type: String, required: false },
    artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  },
  { timestamps: true },
);

export default model<Album>('Album', AlbumSchema);
