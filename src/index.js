import Promise from 'bluebird';
import sizeOf from 'image-size';
import Canvas from 'canvas';
import { computeRowLayout } from './layouts/justified';
import { findIdealNodeSearch } from './utils/findIdealNodeSearch';
import { getPhoto } from './utils/photo';

function getRowLayout(photos, containerWidth, targetRowHeight = 300) {
  let limitNodeSearch = 2;

  if (containerWidth >= 450) {
    limitNodeSearch = findIdealNodeSearch({ containerWidth, targetRowHeight });
  }

  const thumbs = computeRowLayout({
    containerWidth,
    limitNodeSearch,
    targetRowHeight,
    margin: 0,
    photos,
  });

  const rows = [];
  let currentRow = [];
  let width = 0;

  thumbs.forEach((thumb) => {
    if (Math.round(width + thumb.width) > containerWidth) {
      rows.push(currentRow);
      currentRow = [];
      width = thumb.width;
    } else {
      width += thumb.width;
    }
    currentRow.push(thumb);
  });

  if (currentRow.length > 0) rows.push(currentRow);

  return rows;
}

function getCanvasWidth(rows) {
  return rows[0].reduce((width, element) => width + element.width, 0);
}

function getCanvasHeight(rows) {
  return rows.reduce((height, row) => height + row[0].height, 0);
}

function getPositions(rows) {
  let y = 0;

  return rows.map((row) => {
    let x = 0;
    const position = row.map((thumb) => {
      const thumbX = x;
      x += thumb.width;
      return { x: thumbX, y };
    });
    y += row[0].height;
    return position;
  });
}

// eslint-disable-next-line import/prefer-default-export
export async function createCollage(sources, maxWidth, mimeType = 'image/png') {
  const photos = await Promise.all(sources.map(getPhoto));
  const sizes = await Promise.all(photos.map(sizeOf));
  const photosWithSizes = photos.map((photo, index) => ({
    photo,
    ...sizes[index],
  }));
  const rows = getRowLayout(photosWithSizes, maxWidth);
  const canvasHeight = getCanvasHeight(rows);
  const canvasWidth = getCanvasWidth(rows);
  const positions = getPositions(rows);

  const canvasCollage = Canvas.createCanvas(canvasWidth, canvasHeight);
  const ctx = canvasCollage.getContext('2d');

  rows.forEach((row, i) => {
    row.forEach(({ height, width, photo }, j) => {
      const img = new Canvas.Image();
      const { x, y } = positions[i][j];
      img.src = photo;
      ctx.drawImage(img, x, y, width, height);
    });
  });

  return canvasCollage.toBuffer(mimeType);
}
