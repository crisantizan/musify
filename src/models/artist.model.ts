import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

export interface Artist extends mongoose.Document {
  name: string;
  description: string;
  cover: string;
}

const ArtistSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    cover: { type: String, required: false },
  },
  { timestamps: true },
);

export default model<Artist>('Artist', ArtistSchema);
