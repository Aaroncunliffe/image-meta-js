
const expect = require('chai').expect;
const fs = require('fs');
const ImageMeta = require('../src/ImageMeta.js');

/**
 * Test returned data against known values for test images
 */

/**
  * Helper function to return the ExifData from a given filename
  * @param String filename
  * @return ExifData object 
  */
function fetchData(filename) {
    file = fs.readFileSync(filename).buffer;
    binary = new DataView(file);
    let exif = new ImageMeta(binary);

    return exif.data();
}

describe('Unsigned Byte Tests', function () {
    it('Test ExifVersion', function () {
        data = fetchData('./test/img.jpg');
        expect(data.ExifVersion).to.be.equal('0231');
    });

    it('Test GPSVersionID', function () {
        data = fetchData('./test/img4.jpg');
        expect(data.GPSVersionID).to.be.equal('3200');
    });
});

describe('ASCII String Tests', function () {
    it('Test Make', function () {
        data = fetchData('./test/img.jpg');
        expect(data.Make).to.be.equal('Canon');
    });

    it('Test Model', function () {
        data = fetchData('./test/img.jpg');
        expect(data.Model).to.be.equal('Canon EOS 800D');
    });

    it('Test Artist', function () {
        data = fetchData('./test/img.jpg');
        expect(data.Artist).to.be.equal('Aaron Cunliffe');
    });

    it('Test Copyright', function () {
        data = fetchData('./test/img.jpg');
        expect(data.Copyright).to.be.equal('Aaroncunliffe@live.co.uk');
    });

    it('Test OwnerName', function () {
        data = fetchData('./test/img.jpg');
        expect(data.OwnerName).to.be.equal('Aaron Cunliffe');
    });
});

describe('Unsigned Short Tests (often represent strings)', function () {
    it('Test ISO', function () {
        data = fetchData('./test/img2.jpg');
        expect(data.ISO).to.be.equal(1600);
    });

    it('Test ColorSpace (string)', function () {
        data = fetchData('./test/img2.jpg');
        expect(data.ColorSpace).to.be.equal('sRGB');
    });

    it('Test ExposureMode (string)', function () {
        data = fetchData('./test/img2.jpg');
        expect(data.ExposureMode).to.be.equal('Auto');
    });

    it('Test WhiteBalance (string)', function () {
        data = fetchData('./test/img2.jpg');
        expect(data.WhiteBalance).to.be.equal('Auto');
    });
});

describe('Unsigned Long Tests', function () {
    it('Test RecommendedExposureIndex', function () {
        data = fetchData('./test/img2.jpg');
        expect(data.RecommendedExposureIndex).to.be.equal(1600);
    });
});

describe('Unsigned Rational Tests', function () {
    it('Test ExposureTime (string)', function () {
        data = fetchData('./test/img3.jpg');
        expect(data.ExposureTime).to.be.equal('1/30');
    });

    it('Test FNumber', function () {
        data = fetchData('./test/img3.jpg');
        expect(data.FNumber).to.be.equal(2.8);
    });

    it('Test FocalLength', function () {
        data = fetchData('./test/img3.jpg');
        expect(data.FocalLength).to.be.equal(105);
    });

    it('Test LensInfo (array)', function () {
        data = fetchData('./test/img5.jpg');
        array = data.LensInfo.split(', ');

        minFocalLength = array[0];
        maxFocalLneght = array[1];

        expect(minFocalLength).to.be.equal('18');
        expect(maxFocalLneght).to.be.equal('55');
    });
});

describe('Signed Rational Tests', function () {
    it('Test ExposureCompensation', function () {
        data = fetchData('./test/img5.jpg');
        expect(data.ExposureCompensation).to.be.equal(0);
    });
});

describe('GPS Tests', function () {
    it('Test GPSAltitudeRef (unsigned byte -> string)', function () {
        data = fetchData('./test/img4.jpg');
        expect(data.GPSAltitudeRef).to.be.equal('Above Sea Level');
    });
    
    it('Test GPSLatitude (unsigned rational -> string)', function () {
        data = fetchData('./test/img4.jpg');
        expect(data.GPSLatitude).to.be.equal('53° 38\' 16.00"');
    });

    it('Test GPSLLongitude (unsigned rational -> string)', function () {
        data = fetchData('./test/img4.jpg');
        expect(data.GPSLongitude).to.be.equal('2° 30\' 22.00"');
    });
});


