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

  const columns = [];
  let currentColumn = [];
  let width = 0;

  thumbs.forEach((thumb) => {
    if (Math.round(width + thumb.width) > containerWidth) {
      columns.push(currentColumn);
      currentColumn = [];
      width = thumb.width;
    } else {
      width += thumb.width;
    }
    currentColumn.push(thumb);
  });

  if (currentColumn.length > 0) columns.push(currentColumn);

  return columns;
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
export async function createCollage(sources, maxWidth, { layout = 'row', columns = 2 } = {}) {
  const photos = await Promise.all(sources.map(getPhoto));
  const sizes = await Promise.all(photos.map(sizeOf));
  const photosWithSizes = photos.map((photo, index) => ({
    photo,
    ...sizes[index],
  }));

  let items = [];
  if (layout === 'row') {
    items = getRowLayout(photosWithSizes, maxWidth);
  } else if (layout === 'column') {
    items = getColumnLayout(photosWithSizes, maxWidth, columns);
  }
  const canvasHeight = getCanvasHeight(items);
  const canvasWidth = getCanvasWidth(items);
  const positions = getPositions(items);

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

  return canvasCollage.toBuffer();
}
