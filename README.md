# image-collage

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/muZk/image-collage.svg?branch=master)](https://travis-ci.org/muZk/image-collage)
[![dependencies Status](https://david-dm.org/muZk/image-collage/status.svg)](https://david-dm.org/muZk/image-collage)

Turns an array of images into a photo collage

## Preview

![preview](https://user-images.githubusercontent.com/1679496/67254073-6b39f700-f451-11e9-9aec-13bb7211ec66.png)

## Installation

    npm install --save image-collage
    
## Usage

```javascript
const { createCollage } = require('image-collage');
const fs = require('fs');

// You can pass an array containing string URLs, file paths or an image Buffer
const photos = [
  'https://images.unsplash.com/photo-1569219420570-273beaf1c05a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1569296226058-3b57006d13fd?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1569910730959-c9f8a6c3f006?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1571125280192-0ba531bd355a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1570005435342-7541f89273e8?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1569099377939-569bbac3c4df?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1569139476647-0e66370a3055?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1569629250494-432d0d5a7d0d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1569613701109-e8b2bdf76ef3?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1571378781535-75e518ec1a21?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
  'https://images.unsplash.com/photo-1570708460963-5139eb12e014?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
];

const collageWidth = 1000;

createCollage(photos, collageWidth).then((imageBuffer) => {
  fs.writeFileSync("out.png", imageBuffer);
});
```

## Acknowledge

Heavily inspired in the following proyects:

- [classdogo](https://github.com/classdojo) for [photo-collage](https://github.com/classdojo/photo-collage)
    - Their API inspired this project API and used a modified version of their `getPhoto` function.
- [neptunian](https://github.com/neptunian) for [react-photo-gallery](https://github.com/neptunian/react-photo-gallery)
    - Used their row layout and column layout implementation. Added copyright in the used files.
