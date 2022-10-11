const CryptoJS = require('crypto-js');
const logger = require("../configs/logger");

const Encrypt = (plainText) => {
    try {
        const encodedWord = CryptoJS.enc.Utf8.parse(plainText); // encodedWord Array object
        const encoded = CryptoJS.enc.Base64.stringify(encodedWord);

        return encoded;

    } catch (e) {
        logger.error(e)
    }
}

const Decrypt = (encoded) => {
    try {
        const encodedWord = CryptoJS.enc.Base64.parse(encoded); // encodedWord via Base64.parse()
        const decoded = CryptoJS.enc.Utf8.stringify(encodedWord);
        return decoded;
    } catch (e) {
        logger.error(e)
    }
}


module.exports = {
    Encrypt,
    Decrypt
};
