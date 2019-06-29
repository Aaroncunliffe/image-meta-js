
let { ExifTag, ExifTags } = require('./ExifTag.js');
let { GPSTag, GPSTags } = require('./GPSTag.js');


// Tag hexcode accessor and string name
const formats = [
    '', // necessary to offset by 1
    'Unsigned Byte',
    'ASCII String',
    'Unsigned Short',
    'Unsigned Long',
    'Unsigned Rational',
    'Signed Byte',
    'Undefined',
    'Signed Short',
    'Signed Long',
    'Signed Rational',
    'Single Float',
    'Double Float',
];

const tiffEntryLength = 12;

// Offsets - all relative to the App1 marker
const exifOffset = 0x04;
const endianOffset = 0x0A;
const IDF0Offset = 0x0E;

// Markers
const JPEGStart = 0xFFD8;
const TIFFLittleEndian = 0x4949;


module.exports = class ImageMeta {

    constructor(binary, debug = false) {
        this.debug = debug;     // Bool
        this.binary = binary;   // dataview

        // Setup for later variables
        this.isJPEG = this._checkJPEG();
        this.app1Offset = this._getOffsetToAPP1();      // fetch the location of the 0xFFE1 marker
        this.tiffBaseOffset = this.app1Offset + 0x0A;   // start of the TIFF header

        this.exifPresent = this._checkExifStart();
        this.isLittleEndian = this._isLittleEndian();

        this.exifData = {};
        this._log('Constructor complete');
    }

    /**
     * @returns boolean - if JPEG marker exists
     */
    _checkJPEG() {
        let result = binary.getUint16(0x00) == JPEGStart;
        this._log('JPEG marker exists: ' + result);
        return result;
    }

    /**
     * @returns boolean - 'Exif' present in the correct places
     */
    _checkExifStart() {
        // 'Exif' ascii check
        let exifString = 'Exif';

        let result = (this._getStringFromBinary(
            this.binary,
            this.app1Offset + exifOffset,
            exifString.length) == exifString);

        this._log('Exif Present - ' + result);

        return result;
    }

    /**
     * @returns boolean - is little endian
     */
    _isLittleEndian() {
        // First byte of the tiffHeader is 'II' for littleEndian
        // 'MM' for bigEndian
        let result = this.binary.getUint16(this.tiffBaseOffset, false) == TIFFLittleEndian;
        this._log('isLittleEndian - ' + result);

        return result;
    }

    _getOffsetToAPP1() {
        // skip the JPEG marker at the start
        let offset = 2;
        
        // Loop, offset is altered inside the block
        while(offset < this.binary.byteLength) {
            // Grab both bytes
            let markerByte1 = this.binary.getUint8(offset);
            let markerByte2 = this.binary.getUint8(offset + 1);

            // AppN markers start with 0xFF
            if(markerByte1 != 0xFF){
                this._log('invalid marker found: ' + markerByte1 + ' offset: ' + offset);
                return false;
            }

            this._log('marker: ' + markerByte2.toString(16).toUpperCase());

            // App1 marker found
            const App1LastByte = 0xE1;
            if(markerByte2 == App1LastByte) {
                this._log('APP1 marker found at offset: ' + offset);
                return offset;

            } else {
                // Is another APP block, get its length, add it to offset, try the next one
                let appNLength = this.binary.getUint16(offset + 2);
                this._log('APP' + (markerByte2 - 0xe0).toString(10) + ' marker found at offset: ' + offset
                + ' with a length of ' + appNLength);
                offset += 2 + appNLength;
            }

        }
        return false;
    }

    _getOffsetToFirstIFD() {
        //let offset = 0x0C + this.binary.getUint32(0x10, this.isLittleEndian);
        let offset = this.tiffBaseOffset + this.binary.getUint32(this.app1Offset + IDF0Offset, this.isLittleEndian);
        this._log('Offset to first IFD - ' + offset);
        return offset
    }

    _parseImage() {
        // Perform checks
        if (!this.isJPEG) {
            let message = 'Not a valid JPEG';
            this._log(message);
            throw message
        }

        if (!this.exifPresent) {
            let message = 'EXIF data not valid'
            this._log(message);
            throw message
        }

        // Get base offset
        let offset = this._getOffsetToFirstIFD();
        
        // Parse first IFD
        this._log('Parsing IFD0... (offset: ' + offset + ')');
        this._parseTags(offset, 'EXIF');

        // Parse Exif IFD
        if (this.exifData.ExifOffset != undefined) {
            this._log('Parsing Exif SubIFD... ');
            this._parseTags(this.tiffBaseOffset + this.exifData.ExifOffset, 'EXIF');
        }

        // parse GPS tags
        // Parse Exif IFD
        if (this.exifData.GPSInfo != undefined) {
            this._log('Parsing GPSInfo... ');
            this._parseTags(this.tiffBaseOffset + this.exifData.GPSInfo, 'GPS');
        }
    }

    /**
     * Fetch all tags
     */
    _parseTags(offset, type) {
        let tagCount = this.binary.getUint16(offset, this.isLittleEndian);
        this._log('Tag Count - ' + tagCount);

        offset += 2;
        for (var i = 0; i < tagCount; i++) {

            let entryOffset = offset + (i * tiffEntryLength);
            this._parseData(entryOffset, type);
        }
    }

    /**
     * Decode and parse the data at the given entry offset
     * 
     * @param {int} entryOffset - The offset from tiffBaseOffset to the current tag
     * @param {string} type - The type of data {EXIF, GPS}
     */
    _parseData(entryOffset, type) {

        // byte 0-2
        let tagCode = binary.getUint16(entryOffset, this.isLittleEndian);           // the tag code

        // byte 2-4
        let formatCode = binary.getUint16(entryOffset + 2, this.isLittleEndian);    // what the format is

        // byte 4-8
        let length = this.binary.getUint16(entryOffset + 4, this.isLittleEndian)    // Number of values

        // byte 8-12
        // Depending on the length and the type - the data portion of the 12 byte tag 
        // may be the actual data or it may be a pointer to another location.
        let offset = {}
        offset.data = entryOffset + 8;
        // OR
        offset.pointer = (this.app1Offset + endianOffset) +
            binary.getUint16(offset.data, this.isLittleEndian);
        
        let exifTag  = undefined;
        // Create handler object
        if (type == 'EXIF') {
            exifTag = new ExifTag(tagCode, formatCode, length);
        } else if (type == 'GPS') {
            exifTag = new GPSTag(tagCode, formatCode, length);
        } else {
            this._log('Type: ' + type + ' not handled');
            return; // Not handled
        }
        
        switch (formatCode) {
            case 1: // Unsigned byte - 1 byte/component
                this._handleUnsignedByte(exifTag, offset, length, formatCode);
                break;

            case 2: // ASCII string
                // Next 2 bytes is an offset to read the string data from...
                this._handleString(exifTag, offset, length);
                break;

            case 3: // Unsigned Short - 2 bytes/component
                this._handleUnsignedShort(exifTag, offset, length);
                break;

            case 4: // Unsigned Long - 4 bytes/component
                this._handleUnsignedLong(exifTag, offset, length);
                break;

            case 5: // Usigned Rational - 8 bytes/component
                this._handleUnsignedRational(exifTag, offset, length);
                break;
            
            case 7: // Undefined - 1 bytes/component
                this._handleUnsignedByte(exifTag, offset, length);
                break;

            case 10: // Signed Rational - 8 bytes/component
                this._handleSignedRational(exifTag, offset, length);
                break;

            default:
                this._log('Unknown format: ' + formatCode.toString(16)
                    + ' (type: ' + tagCode.toString(16)
                    + ' - ' + ExifTags[tagCode] + ')');
        }
    }

    /**
     * @param {obj} exifTagObj - object to handle the data processing
     * @param {obj} offsetObj - offset for data and pointer in 1 obj
     * @param {int} length - number of components
     */
    _handleUnsignedByte(exifTagObj, offsetObj, length) {
        let data = undefined;
        if(length == 1) {
            data = this.binary.getUint8(offsetObj.data, this.isLittleEndian);
        } else {
            data = []
            let offset = length > 4 ? offsetObj.pointer : offsetObj.data; // data in entry or pointer
            for (let i = 0; i < length; i++) {
                let entryDataOffset = offset + i; // shift 1 byte every loop
                data[i] = this.binary.getUint8(entryDataOffset, this.isLittleEndian);
            }
        }
        let processedData = exifTagObj.processUnsignedByte(data);
        this._setData(exifTagObj, processedData);
    }

    /**
     * 
     * @param {obj} exifTagObj - object to handle the data processing
     * @param {obj} offsetObj - offset for data and pointer in 1 obj
     * @param {int} length - number of components
     */
    _handleString(exifTagObj, offsetObj, length) {
        let data = undefined;
        if (length < 4) {
            data = this._getStringFromBinary(binary, offsetObj.data, length);
        } else {
            data = this._getStringFromBinary(binary, offsetObj.pointer, length);
        }
        let processedData = exifTagObj.processString(data);
        this._setData(exifTagObj, processedData);
    }

    /**
     * 
     * @param {obj} exifTagObj - object to handle the data processing
     * @param {obj} offsetObj - offset for data and pointer in 1 obj
     * @param {int} length - number of components
     */
    _handleUnsignedShort(exifTagObj, offsetObj, length) {
        let entrySize = 2;
        let data = undefined;
        if (length == 1) {
            data = this.binary.getUint16(offsetObj.data, this.isLittleEndian);
            
        } else if (length > 1) {
            data = []
            let offset = length > 2 ? offsetObj.pointer : offsetObj.data; // data in entry or pointer
            for (let i = 0; i < length; i++) {
                let entryDataOffset = offset + (entrySize * i); // shift 8 bytes every loop
                data[i] = this.binary.getUint16(entryDataOffset + 8, this.isLittleEndian);
            }
        }
        let processedData = exifTagObj.processUnsignedShort(data);
        this._setData(exifTagObj, processedData);
    }

    /**
     * @param {obj} exifTagObj - object to handle the data processing
     * @param {obj} offsetObj - offset for data and pointer in 1 obj
     * @param {int} length - number of components
     */
    _handleUnsignedLong(exifTagObj, offsetObj, length) {
        let entrySize = 4;
        let data = undefined;
        
        if (length == 1) {
            data = this.binary.getUint32(offsetObj.data, this.isLittleEndian);
        } else if (length > 1) {
            data = []
            for (let i = 0; i < length; i++) {
                let entryDataOffset = offsetObj.pointer + (entrySize * i); // shift 8 bytes every loop
                data[i] = this.binary.getUint32(entryDataOffset + 8, this.isLittleEndian);
            }
        }
        let processedData = exifTagObj.processUnsignedLong(data);
        this._setData(exifTagObj, processedData);
    }

    /**
     * 
     * @param {obj} exifTagObj - object to handle the data processing
     * @param {obj} offsetObj - offset for data and pointer in 1 obj
     * @param {int} length - number of components
     */
    _handleUnsignedRational(exifTagObj, offsetObj, length) {
        const entrySize = 8;
        let data = undefined;
        if (length == 1) {
            data = {};
            data.numerator = this.binary.getUint32(offsetObj.pointer, this.isLittleEndian);
            data.denominator = this.binary.getUint32(offsetObj.pointer + 4, this.isLittleEndian);
            data.result = data.numerator / data.denominator;
        } else if (length > 1) {
            data = []
            for (let i = 0; i < length; i++) {
                let entryDataOffset = offsetObj.pointer + (entrySize * i); // shift 8 bytes every loop
                let result = {};
                result.numerator = this.binary.getUint32(entryDataOffset, this.isLittleEndian);
                result.denominator = this.binary.getUint32(entryDataOffset + 4, this.isLittleEndian);
                result.result = (result.denominator > 0) ? (result.numerator / result.denominator) : 0; // check for division by 0
                data[i] = result;
            }
            
        }
        let processedData = exifTagObj.processUnsignedRational(data);
        this._setData(exifTagObj, processedData);
    }

    /**
     * @param {obj} exifTagObj - object to handle the data processing
     * @param {obj} offsetObj - offset for data and pointer in 1 obj
     * @param {int} length - number of components
     */
    _handleSignedRational(exifTagObj, offsetObj, length) {
        const entrySize = 8;
        let data = undefined;
        if (length == 1) {
            data = {}
            data.numerator = this.binary.getInt32(offsetObj.pointer, this.isLittleEndian);
            data.denominator = this.binary.getInt32(offsetObj.pointer + 4, this.isLittleEndian);
            data.result = data.numerator / data.denominator;
        } else if (length > 1) {
            let result = []
            data = []
            for (let i = 0; i < length; i++) {
                data.entryDataOffset = offsetObj.pointer + (entrySize * i); // shift 8 bytes every loop
                data.numerator = this.binary.getInt32(entryDataOffset, this.isLittleEndian);
                data.denominator = this.binary.getInt32(entryDataOffset + 4, this.isLittleEndian);
                result[i] = data.numerator / data.denominator;
            }
        }

        let processedData = exifTagObj.processSignedRational(data);
        this._setData(exifTagObj, processedData);
    }

    /**
     * 
     * @param {obj} exifTagObj - obj to perform the lookup
     * @param {mixed} data - the data associated with the tag
     */
    _setData(exifTagObj, data) {
        let tagTypeString = exifTagObj.getTagName(); // the parsed tag string
        if (tagTypeString !== undefined) {
            this.exifData[tagTypeString] = data;
        }
        
        // debug log
        this._log(tagTypeString + '(0x' + exifTagObj.getTagCode().toString(16).toUpperCase() + ')'
            + ': ' + data + ' (format: ' + formats[exifTagObj.getFormatCode()] + ')') ;
    }


    //--------------------------------------------

    /**
     *
     * @returns boolean
     */
    getIsLittleEndian() {
        return this.isLittleEndian;
    }

    /**
     * @returns int
     */
    getFileLengthInBytes() {
        return this.binary.byteLength;
    }

    /**
     * @returns JSON object
     */
    data() {

        this._parseImage();

        return this.exifData;

    }


    //--------------------------------------------

    _getStringFromBinary(buffer, start, length) {
        let end = start + length;
        let str = '';

        for (let i = start; i < end; i++) {
            str += String.fromCharCode(buffer.getUint8(i));
        }
        return str;
    }

    _log(message) {
        if (this.debug) console.log('DEBUG: ' + message);
    }



}
