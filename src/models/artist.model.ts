import mongoose, { model, Document } from 'mongoose';
import { Artist, ArtistCreate } from '@/modules/artist/artist.type';
const { Schema } = mongoose;

export interface ArtistDocument extends Artist, Document {}

const ArtistSchema = new Schema<ArtistCreate>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: false, default: null },
  },
  { timestamps: true },
);

ArtistSchema.set('toJSON', { virtuals: true });

export default model<ArtistDocument>('Artist', ArtistSchema);
