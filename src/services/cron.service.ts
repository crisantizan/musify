import { CronJob } from 'cron';
import { readdir } from 'fs-extra';
import { getAssetPath, removeAsset } from '@/helpers/multer.helper';
import moment from 'moment';
import { FolderAssetType } from '@/typings/asset.typing';

/**
 * second [0-60]
 * minute [0-60]
 * hour [0-23]
 * hour [0-23]
 * day [1-31]
 * month [1-12]
 * day of weekend [0-7]
 */

/** every day at 2:00: */
export const jobService = new CronJob('* * 2 */2 * *', async () => {
  const assets = await Promise.all([
    // read temp images
    readdir(getAssetPath('TEMP_IMAGES')),
    // read temp songs
    readdir(getAssetPath('TEMP_SONGS')),
  ]);

  const types: FolderAssetType[] = ['TEMP_IMAGES', 'TEMP_SONGS'];

  assets.forEach((asset, index) => inspect(asset, types[index]));
});

function inspect(files: string[], type: FolderAssetType) {
  files.forEach(file => {
    const createdDate = new Date(Number(file.split('.')[0]));
    const diff = moment(new Date()).diff(createdDate, 'hours');

    // remove file
    diff > 5 && removeAsset(getAssetPath(type, file));
  });
}
