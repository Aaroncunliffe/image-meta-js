/**
 * A file that abstracts away all of the value handling from the main class
 * 
 * 1 source of truth to change the data format
 */

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

const ExifTags = {
    // IFD0
    0x0100: 'ImageWidth',
    0x0101: 'ImageHeight',
    0x010F: 'Make',         //
    0x0110: 'Model',
    0x0112:	'Orientation',
    0x011A: 'XResolution',
    0x011B: 'YResolution',
    0x0128: 'ResolutionUnit',
    0x0131: 'Software',
    0x0132: 'ModifyDate',
    0x013B: 'Artist',
    0x0212:	'YCbCrSubSampling',
    0x0213:	'YCbCrPositioning',
    0x8298: 'Copyright',

    // Pointers to other IFDs
    0x8769: 'ExifOffset',
    0x8825:	'GPSInfo',

    // Exif SubIFD
    0x829A: 'ExposureTime',
    0x829D: 'FNumber',
    0x8822: 'ExposureProgram',
    0x8827: 'ISO',
    0x8830: 'SensitivityType',
    0x8832: 'RecommendedExposureIndex',
    0x9000: 'ExifVersion',
    0x9003: 'DateTimeOriginal',
    0x9004: 'CreateDate',
    0x9010: 'OffsetTime',
    0x9201: 'ShutterSpeedValue',
    0x9202: 'ApertureValue',
    0x9203:	'BrightnessValue',
    0x9204: 'ExposureCompensation',
    0x9205: 'MaxApertureValue',
    0x9207: 'MeteringMode',
    0x9209: 'Flash',
    0x920A: 'FocalLength',
    0x927C: 'MakerNote',
    0x9291: 'SubSecTimeOriginal',
    0x9292: 'SubSecTimeDigitized',
    
    0xA001: 'ColorSpace',
    0xA002: 'ExifImageWidth',
    0xA003: 'ExifImageHeight',
    0xA20E: 'FocalPlaneXResolution',
    0xA20F: 'FocalPlaneYResolution',
    0xA210: 'FocalPlaneResolutionUnit',
    0xA401: 'CustomRendered',
    0xA402: 'ExposureMode',
    0xA403: 'WhiteBalance',
    0xA404:	'DigitalZoomRatio',
    0xA405: 'FocalLengthIn35mmFormat',
    0xA406: 'SceneCaptureType',
    0xA420: 'ImageUniqueID',
    0xA430: 'OwnerName',
    0xA431: 'SerialNumber',
    0xA432: 'LensInfo', // focal length and aperture ranges
    0xA433: 'LensMake',
    0xA434: 'LensModel',
    0xA435: 'LensSerialNumber',

}

const ExifStrings = {
    'ResolutionUnit': {
        1: 'None',
        2: 'inches',
        3: 'cm',
    },
    'Orientation': {
        1: 'Horizontal (normal)',
        2: 'Mirror horizontal',
        3: 'Rotate 180',
        4: 'Mirror vertical',
        5: 'Mirror horizontal and rotate 270 CW',
        6: 'Rotate 90 CW',
        7: 'Mirror horizontal and rotate 90 CW',
        8: 'Rotate 270 C',
    },
    'ExposureProgram': {
        0: 'Not Defined',
        1: 'Manual',
        2: 'Program AE',
        3: 'Aperture-priority AE',
        4: 'Shutter speed priority AE',
        5: 'Creative (Slow speed)',
        6: 'Action (High speed)',
        7: 'Portrait',
        8: 'Landscape',
        9: 'Bul',
    },
    'SensitivityType': {
        0: 'Unknown',
        1: 'Standard Output Sensitivity',
        2: 'Recommended Exposure Index',
        3: 'ISO Speed',
        4: 'Standard Output Sensitivity and Recommended Exposure Index',
        5: 'Standard Output Sensitivity and ISO Speed',
        6: 'Recommended Exposure Index and ISO Speed',
        7: 'Standard Output Sensitivity, Recommended Exposure Index and ISO Spee',
    },
    'MeteringMode': {
        0: 'Unknown',
        1: 'Average',
        2: 'Center-weighted average',
        3: 'Spot',
        4: 'Multi-spot',
        5: 'Multi-segment',
        6: 'Partial',
        255: 'Other',
    },
    'Flash': {
        0x0: 'No Flash',
        0x1: 'Fired',
        0x5: 'Fired, Return not detected',
        0x7: 'Fired, Return detected',
        0x8: 'On, Did not fire',
        0x9: 'On, Fired',
        0xD: 'On, Return not detected',
        0xF: 'On, Return detected',
        0x10: 'Off, Did not fire',
        0x14: 'Off, Did not fire, Return not detected',
        0x18: 'Auto, Did not fire',
        0x19: 'Auto, Fired',
        0x1D: 'Auto, Fired, Return not detected',
        0x1F: 'Auto, Fired, Return detected',
        0x20: 'No flash function',
        0x30: 'Off, No flash function',
        0x41: 'Fired, Red-eye reduction',
        0x45: 'Fired, Red-eye reduction, Return not detected',
        0x47: 'Fired, Red-eye reduction, Return detected',
        0x49: 'On, Red-eye reduction',
        0x4D: 'On, Red-eye reduction, Return not detected',
        0x4F: 'On, Red-eye reduction, Return detected',
        0x50: 'Off, Red-eye reduction',
        0x58: 'Auto, Did not fire, Red-eye reduction',
        0x59: 'Auto, Fired, Red-eye reduction',
        0x5D: 'Auto, Fired, Red-eye reduction, Return not detected',
        0x5F: 'Auto, Fired, Red-eye reduction, Return detected',
    },
    'ColorSpace': {
        0x1: 'sRGB',
        0x2: 'Adobe RGB',
        0xFFFD: 'Wide Gamut RGB',
        0xFFFE: 'ICC Profile',
        0xFFFF: 'Uncalibrate',
    },
    'FocalPlaneResolutionUnit': {
        1: 'None',
        2: 'inches',
        3: 'cm',
        4: 'mm',
        5: 'u',
    },
    'CustomRendered': {
        0: 'Normal',
        1: 'Custom',
        3: 'HDR',
        6: 'Panorama',
        8: 'Portrai',
    },
    'ExposureMode': {
        0:'Auto',
        1:'Manual',
        2:'Auto bracket',
    },
    'WhiteBalance': {
        0: 'Auto',
        1: 'Manual',
    },
    'SceneCaptureType': {
        0: 'Standard',
        1: 'Landscape',
        2: 'Portrait',
        3: 'Night',
        4: 'Other',
    },
    'YCbCrPositioning': {
        1: 'Centered',
        2: 'Co-sited',
    }
}


class ExifTag {

    constructor(tagcode, formatCode, length) {
        this.tagCode = tagcode;
        this.formatCode = formatCode;
        this.length = length;
    }

    processUnsignedByte(data) {

        // Process tags that require extra processing
        switch (ExifTags[this.tagCode]) {
            case 'ExifVersion':
                let value = String.fromCharCode(data[0], data[1], data[2], data[3]);
                return value;
                break;
        }

        // Default handling
        if (this.length == 1) {
            return data

        } else if (this.length > 1) {
            let values = [];

            for (let i = 0; i < data.length; i++) {
                values[i] = data[i];
            }

            return values.join(', '); // Join the array results
        }
    }

    /**
     * Build data object and return to handling function
     */
    processString(data) {

        return data;
    }

    /**
     * Build data object and return to handling function
     * 
     * This type is often representational of a string value - we need to do the lookup
     */
    processUnsignedShort(data) {

        // if the tag string exists in the ExifStrings object
        // Perform the lookup
        let tagString = ExifTags[this.tagCode];
        if (ExifStrings[tagString] != undefined) {
            return ExifStrings[ExifTags[this.tagCode]][data];
        }

        // else
        return data;
    }

    processUnsignedLong(data) {
        return data;
    }

    processUnsignedRational(data) {

        // Process tags that require extra processing
        switch (ExifTags[this.tagCode]) {
            case 'ExifVersion':
                console.log('processing');
                return String.fromCharCode(data[0].result, data[1].result, data[2].result, data[3].result);
                break;

            case 'ExposureTime':
                return data.numerator + '/' + data.denominator;
                break;
        }

        // Default handling
        if (this.length == 1) {
            return data.result

        } else if (this.length > 1) {
            let values = [];

            for (let i = 0; i < data.length; i++) {
                values[i] = data[i].result;
            }

            return values.join(', '); // Join the array results
        }

    }


    processSignedRational(data) {

        // Process tags that require extra processing
        switch (ExifTags[this.tagCode]) {
            case 'ShutterSpeedValue:':
            case 'ApertureValue':
            case 'MaxApertureValue':
                return data.result; //Math.pow(2, data.result / 2);
                break;
        }


        // Default handling
        if (this.length == 1) {
            return data.result

        } else if (this.length > 1) {
            let values = [];

            for (let i = 0; i < data.length; i++) {
                values[i] = data[i].result;
            }

            return values.join(', '); // Join the array results
        }
    }

    //----------------------------------------------------------

    getTagCode() {
        return this.tagCode;
    }

    getTagName() {
        return ExifTags[this.tagCode];
    }

    getFormatCode() {
        return this.formatCode;
    }
}

module.exports = {
    ExifTags,   // Array of all EXIF tags
    ExifTag     // the EXIF Tag class
}

