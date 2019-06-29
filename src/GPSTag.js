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

const GPSTags = {
    0x0000: 'GPSVersionID',
    0x0001: 'GPSLatitudeRef',
    0x0002: 'GPSLatitude',
    0x0003: 'GPSLongitudeRef',
    0x0004: 'GPSLongitude',
    0x0005: 'GPSAltitudeRef',
    0x0006: 'GPSAltitude',
    0x0007: 'GPSTimeStamp',
    0x0008: 'GPSSatellites',
    0x0009: 'GPSStatus',
    0x000A: 'GPSMeasureMode',
    0x000B: 'GPSDOP',
    0x000C: 'GPSSpeedRef',
    0x000D: 'GPSSpeed',
    0x000E: 'GPSTrackRef',
    0x000F: 'GPSTrack',
    0x0010: 'GPSImgDirectionRef',
    0x0011: 'GPSImgDirection',
    0x0012: 'GPSMapDatum',
    0x0013: 'GPSDestLatitudeRef',
    0x0014: 'GPSDestLatitude',
    0x0015: 'GPSDestLongitudeRef',
    0x0016: 'GPSDestLongitude',
    0x0017: 'GPSDestBearingRef',
    0x0018: 'GPSDestBearing',
    0x0019: 'GPSDestDistanceRef',
    0x001A: 'GPSDestDistance',
    0x001B: 'GPSProcessingMethod',
    0x001C: 'GPSAreaInformation',
    0x001D: 'GPSDateStamp',
    0x001E: 'GPSDifferential',
    0x001F: 'GPSHPositioningError',

}

const GPSStrings = {
    'GPSAltitudeRef': {
        0: 'Above Sea Level',
        1: 'Below Sea Level',
    }

}

class GPSTag {

    constructor(tagcode, formatCode, length) {
        this.tagCode = tagcode;
        this.formatCode = formatCode;
        this.length = length;
    }

    processUnsignedByte(data) {

        // Process tags that require extra processing
        switch (GPSTags[this.tagCode]) {
            case 'GPSVersionID':
                return data.join('');
                break;
        }

        // Default handling
        if (this.length == 1) {

            // if the tag string exists in the GPSStrings object
            // Perform the lookup
            let tagString = GPSTags[this.tagCode];
            if (GPSStrings[tagString] != undefined) {
                return GPSStrings[GPSTags[this.tagCode]][data];
            }

            //else 
            return data

        } else if (this.length > 1) {
            // Handle multiple values

            return data.join(', '); // Join the array results
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

        return data;
    }

    processUnsignedLong(data) {
        return data;
    }

    processUnsignedRational(data) {

        // Process tags that require extra processing
        switch (GPSTags[this.tagCode]) {
            case 'GPSLongitude':
            case 'GPSLatitude':
                // return degrees minutes and seconds
                return data[0].result + '° ' + data[1].result + '\' ' + data[2].result.toFixed(2) + '"'
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
        switch (GPSTags[this.tagCode]) {

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
        return GPSTags[this.tagCode];
    }

    getFormatCode() {
        return this.formatCode;
    }

}

module.exports = {
    GPSTags,   // Array of all GPS tags
    GPSTag     // GPS Tag class
}

