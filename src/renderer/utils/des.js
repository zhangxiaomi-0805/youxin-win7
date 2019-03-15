/**
 *
 *  DES
 *
 **/
import CryptoJS from 'crypto-js'
import store from '../store'
var DES = {
  accountSecret: 'asdasdhhq192hd1f',
  pwdSecret: '8fgt6jhk45frgt5k'
}

/**
 * DES加密
 * @params type 1-账号加密，2-密码加密，3-其他
 */
DES.encryptByDES = function (string, type) {
  let secret = store.state.currentUserSecret
  if (type === 1) {
    secret = this.accountSecret
  } else if (type === 2) {
    secret = this.pwdSecret
  }
  let keyHex = CryptoJS.enc.Utf8.parse(secret)
  let encrypted = CryptoJS.DES.encrypt(string, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.ciphertext.toString()
}

// DES  ECB模式解密
DES.decryptByDESModeEBC = function (ciphertext, type) {
  let secret = store.state.currentUserSecret
  if (type === 1) {
    secret = this.accountSecret
  } else if (type === 2) {
    secret = this.pwdSecret
  }
  let keyHex = CryptoJS.enc.Utf8.parse(secret)
  let decrypted = CryptoJS.DES.decrypt({
    ciphertext: CryptoJS.enc.Hex.parse(ciphertext)
  }, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  let resultValue = decrypted.toString(CryptoJS.enc.Utf8)
  return resultValue
}

export default DES
