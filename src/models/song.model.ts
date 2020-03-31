import mongoose, { model, Document } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { PaginationModel } from '@/typings/shared.typing';
import { Song } from '@/modules/song/song.type';
const { Schema } = mongoose;

export interface SongDocument extends Song, Document {}

const SongSchema = new Schema(
  {
    name: { type: String, required: true },
    duration: { type: String, required: true },
    coverImage: { type: String, required: false, default: null },
    file: { type: String, required: true },
    album: { type: Schema.Types.ObjectId, ref: 'Album', required: true },
  },
  { timestamps: true },
);

SongSchema.plugin(paginate);

export const SongModel = model<SongDocument>(
  'Song',
  SongSchema,
) as PaginationModel<SongDocument>;
