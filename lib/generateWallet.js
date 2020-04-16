'use strict';
const secp256k1 = require('secp256k1/elliptic');
const SHA3 = require('keccakjs');
const { randomBytes } = require('crypto');

// generate privKey buffer
function getPrivKeyHexStr() {
  while (true) {
    const privKey = randomBytes(32);
    if (secp256k1.privateKeyVerify(privKey)) return privKey.toString('hex');
  }
}

//导入16进制编码的私钥
//e.g. openssl rand -hex 32
function bufferFromHexString(hex_string) {
  if (hex_string.length != 64) {
    return null;
  }
  return Buffer.from(hex_string, 'hex');
}

function getPublicKey(buffer) {
  return secp256k1.publicKeyCreate(buffer, false);
}

/*
 * 地址：公钥的sha3-256编码的后20字节，16进制编码的字符串
 */
function generateAddress(public_key) {
  let h = new SHA3(256);
  h.update(public_key.slice(1)); //去掉前缀
  return h.digest('hex').slice(-40);
}

function importWallet(privHexStr) {
  privHexStr = privHexStr.replace(/^0x/, '');
  privHexStr = privHexStr.toLowerCase();
  const privBuffer = bufferFromHexString(privHexStr);
  const publicKeyHex = getPublicKey(privBuffer);
  const address = generateAddress(publicKeyHex);
  return '0x' + address;
}

function generateWallet() {
  // 生成私钥
  let privHexStr = getPrivKeyHexStr();
  const privBuffer = bufferFromHexString(privHexStr);
  const publicKeyHex = getPublicKey(privBuffer);
  const address = generateAddress(publicKeyHex);
  return {
    priv: '0x' + privHexStr,
    address: '0x' + address,
    privRaw: privHexStr,
    addressRaw: address,
  };
}

function test() {
  console.log(getPrivKeyHexStr().length === 64);
  console.log(importWallet('0x976f9f7772781ff6d1c93941129d417c49a209c674056a3cf5e27e225ee55fa8') === '0x7ef5a6135f1fd6a02593eedc869c6d41d934aef8');
  const obj = generateWallet();
  console.log(importWallet(obj.priv) === obj.address);
}

// test();

generateWallet.importWallet = importWallet;

module.exports = generateWallet;
