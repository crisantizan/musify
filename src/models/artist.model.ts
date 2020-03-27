import mongoose, { model, Document } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Artist } from '@/modules/artist/artist.type';
import { PaginationModel } from '@/typings/shared.typing';
const { Schema } = mongoose;

export interface ArtistDocument extends Artist, Document {}

const ArtistSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: false, default: null },
  },
  { timestamps: true },
);

ArtistSchema.plugin(paginate);

export const ArtistModel: PaginationModel<ArtistDocument> = model<
  ArtistDocument
>('Artist', ArtistSchema) as PaginationModel<ArtistDocument>;
