/**
 *
 *  DES
 *
 **/
import CryptoJS from 'crypto-js'
var DES = {
  secret: '8fgt6jhk45frgt5k'
}

// DES加密
DES.encryptByDES = function (string) {
  var keyHex = CryptoJS.enc.Utf8.parse(this.secret)
  var encrypted = CryptoJS.DES.encrypt(string, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.ciphertext.toString()
}

// DES  ECB模式解密
DES.decryptByDESModeEBC = function (ciphertext) {
  var keyHex = CryptoJS.enc.Utf8.parse(this.secret)
  var decrypted = CryptoJS.DES.decrypt({
    ciphertext: CryptoJS.enc.Hex.parse(ciphertext)
  }, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  var resultValue = decrypted.toString(CryptoJS.enc.Utf8)
  return resultValue
}

export default DES
