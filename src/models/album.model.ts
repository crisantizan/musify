import mongoose, { model, Document } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Album } from '@/modules/album/album.type';
import { PaginationModel } from '@/typings/shared.typing';
const { Schema } = mongoose;

export interface AlbumDocument extends Album, Document {}

const AlbumSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    year: { type: Number, required: true },
    coverImage: {
      id: { type: String, required: false, default: null },
      path: { type: String, required: false, default: null },
    },
    artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  },
  { timestamps: true },
);

AlbumSchema.plugin(paginate);

export const AlbumModel = model<AlbumDocument>(
  'Album',
  AlbumSchema,
) as PaginationModel<AlbumDocument>;
