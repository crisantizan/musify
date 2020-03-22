import { EnvMode, ErrorFieldObject } from '@/typings/shared.typing';
import { join as joinPath } from 'path';

/** get envirironment variables path */
export function getEnvVariablesPath(envMode: EnvMode) {
  return joinPath(__dirname, '..', '..', `.env.${envMode}`);
}

/** generate the error object of field */
export function errorFieldObject(
  field: string,
  message: string,
): ErrorFieldObject {
  return { field, message };
}

/** generate random string */
function generateToken(length: number = 4, addDate = false): string {
  let randomString = '';
  const charts =
    'aAbB0cCd#DeE1fFgGh2HiIjJ3kK$l4LmM5nNoOp6Pq-QrR7sStT8uUv_VwW9xXyYzZ';

  while (randomString.length < length) {
    randomString += charts.charAt(Math.round(Math.random() * charts.length));
  }

  if (addDate) {
    const date = new Date();
    const dateString = date.toISOString().substr(0, 10);

    const time = date
      .toUTCString()
      .match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/)![0]
      .split(':')
      .join('-');

    randomString = `${dateString}T${time}_${randomString}`;
  }

  return randomString;
}
