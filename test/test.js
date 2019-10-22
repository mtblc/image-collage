const assert = require('assert');
const sizeOf = require('image-size');
const photos = require('./data/photos');
const { createCollage } = require('../index');

describe('createCollage', () => {
  let collage;

  before(() => createCollage(photos, 1000).then((result) => {
    collage = result;
  }));

  it('returns an image Buffer', () => {
    assert(collage instanceof Buffer);
  });

  it('returns an image with correct size', () => {
    const size = sizeOf(collage);
    assert(size.width === 1000);
    assert(size.height === 986);
  });
});
