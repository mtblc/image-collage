import Promise from 'bluebird';
import request from 'request';
import fsmod from 'fs';

const fs = Promise.promisifyAll(fsmod);

function downloadPhoto(uri) {
  return new Promise((resolve, reject) => {
    request({ url: uri, encoding: null }, (err, res, body) => {
      if (err) return reject(err);
      return resolve(body);
    });
  });
}

/**
 * @see https://github.com/classdojo/photo-collage/blob/master/index.js#L19
 */
// eslint-disable-next-line import/prefer-default-export
export function getPhoto(src) {
  if (src instanceof Buffer) {
    return src;
  } if (typeof src === 'string') {
    if (/^http/.test(src) || /^ftp/.test(src)) {
      return downloadPhoto(src).catch(() => {
        throw new Error(`Could not download url source: ${src}`);
      });
    }
    return fs.readFileAsync(src).catch(() => {
      throw new Error(`Could not load file source: ${src}`);
    });
  }
  throw new Error(`Unsupported source type: ${src}`);
}
