import Promise from 'bluebird';
import sizeOf from 'image-size';
import Canvas from 'canvas';
import { computeRowLayout } from './layouts/justified';
import { computeColumnLayout } from './layouts/columns';
import { findIdealNodeSearch } from './utils/findIdealNodeSearch';
import { getPhoto } from './utils/photo';

function getColumnLayout(photos, containerWidth, totalColumns = 4) {
  const thumbs = computeColumnLayout({
    containerWidth,
    margin: 0,
    photos,
    columns: totalColumns,
  });

  return thumbs;
}

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

function getRowCanvasWidth(rows) {
  return rows[0].reduce((width, element) => width + element.width, 0);
}

function getRowCanvasHeight(rows) {
  return rows.reduce((height, row) => height + row[0].height, 0);
}

function getRowPositions(rows) {
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

function createRowCollage({ photos, maxWidth }) {
  const items = getRowLayout(photos, maxWidth);
  const canvasHeight = getRowCanvasHeight(items);
  const canvasWidth = getRowCanvasWidth(items);
  const positions = getRowPositions(items);

  const canvasCollage = Canvas.createCanvas(canvasWidth, canvasHeight, 'png');
  const ctx = canvasCollage.getContext('2d');

  items.forEach((item, i) => {
    item.forEach(({ height, width, photo }, j) => {
      const img = new Canvas.Image();
      const { x, y } = positions[i][j];
      img.src = photo;
      ctx.drawImage(img, x, y, width, height);
    });
  });

  return canvasCollage;
}

function createColumnCollage({ photos, maxWidth, columns }) {
  let totalColumns = columns;
  if (totalColumns === undefined) {
    totalColumns = 1;
    if (maxWidth >= 500) totalColumns = 2;
    if (maxWidth >= 900) totalColumns = 3;
    if (maxWidth >= 1500) totalColumns = 4;
  }

  const items = getColumnLayout(photos, maxWidth, columns);
  const canvasHeight = items[items.length - 1].containerHeight;
  const canvasWidth = items[0].width * columns;

  const canvasCollage = Canvas.createCanvas(canvasWidth, canvasHeight, 'png');
  const ctx = canvasCollage.getContext('2d');

  items.forEach(({
    height, width, photo, top, left,
  }) => {
    const img = new Canvas.Image();
    img.src = photo;
    ctx.drawImage(img, left, top, width, height);
  });

  return canvasCollage;
}

// eslint-disable-next-line import/prefer-default-export
export async function createCollage(sources, maxWidth, { layout = 'row', columns } = {}) {
  const photos = await Promise.all(sources.map(getPhoto));
  const sizes = await Promise.all(photos.map(sizeOf));
  const photosWithSizes = photos.map((photo, index) => ({
    photo,
    ...sizes[index],
  }));

  let canvasCollage;

  if (layout === 'row') {
    canvasCollage = createRowCollage({ photos: photosWithSizes, maxWidth });
  } else if (layout === 'column') {
    canvasCollage = createColumnCollage({ photos: photosWithSizes, maxWidth, columns });
  }

  return canvasCollage.toBuffer();
}
