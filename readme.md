


# Image Meta JS [![Build Status](https://travis-ci.org/Aaroncunliffe/image-meta-js.svg?branch=master)](https://travis-ci.org/Aaroncunliffe/image-meta-js)

An npm package to parse EXIF data from images with a simple to use interface and minimal dependencies (currently only works with JPEG images)

## Getting Started

### Install
using npm
```
npm install --save image-meta-js
```

### Usage
The constructor expects a DataView to be passed in, DataViews can be created from ArrayBuffers that can be fetched from files many ways. For example allows running using the Node 'fs' package or FileReader in the web browser

```javascript
let imageMeta = new ImageMeta(imageDataView)
let data = imageMeta.data(); // returns object of all found data

// e.g. get exposure triangle
data.FNumber      // 2.8
data.ExposureTime // 1/100
data.ISO          // 800
```

Node:
```javascript
file = fs.readFileSync('./test/img.jpg');
let imageArrayBuffer = file.buffer
let imageDataView = new DataView(imageArrayBuffer);
let imageMeta = new ImageMeta(imageDataView)
```

Browser:
```javascript
let reader = new FileReader();
reader.onload = () => {
  let imageArrayBuffer = reader.result;
  let imageDataView = new DataView(imageArrayBuffer);
  let imageMeta = new ImageMeta(imageDataView);
}
reader.readAsArrayBuffer(file);
```

The full possible tag list can be found [here](https://sno.phy.queensu.ca/~phil/exiftool/TagNames/EXIF.html)

## Tests

Tests using [Mocha](https://www.npmjs.com/package/mocha) and automated on commits using [Travis-CI](https://travis-ci.org)
They are simple tests using images with known values and ensuring that the format handling is working as expected

## License

This project is licensed under the MIT License

#### Useful Resources
- [Image format resource](https://www.media.mit.edu/pia/Research/deepview/exif.html) - Breaks down the image binary into sections
- [All possible tags resource](https://sno.phy.queensu.ca/~phil/exiftool/TagNames/EXIF.html) - Lists all tags according to the spec and their types
- [Sample images](https://github.com/ianare/exif-samples) - sample images with some very specific data such as MakerNote section or GPS tags, useful for testing
