
const fs = require('fs');
const expect = require('chai').expect;
const ImageMeta = require('../src/ImageMeta.js');



describe('UByteTest()', function () {
    it('Test unsigned byte handling', function () {

        file = fs.readFileSync('./img.jpg').buffer;
        binary = new DataView(file);
        let exif = new ImageMeta(binary);

        let data = exif.data();
        expect(data.ExifVersion).to.be.equal('0231');

    });
});