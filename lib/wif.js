const crypto = require('crypto');
const base58 = require('bs58');

function encode(version, privateHex, compressed) {
  version = Number(version).toString(16);
  var hex = `${version}${privateHex}`;
  if (compressed) {
    hex = hex + '01';
  }
  var rk = Buffer.from(hex, 'hex');
  var checksum1 = crypto.createHash('sha256').update(rk).digest();
  var checksum2 = crypto.createHash('sha256').update(checksum1).digest().slice(0, 4);
  rk = Buffer.concat([rk, checksum2]);
  return base58.encode(rk);
}

function decode(string) {
  var buffer = base58.decode(string);
  if (buffer.length === 37) {
    return {
      version: buffer[0],
      privateKey: buffer.slice(1, 33).toString('hex'),
      compressed: false,
    };
  }
  // invalid length
  if (buffer.length !== 38) throw new Error('Invalid WIF length');
  // invalid compression flag
  if (buffer[33] !== 0x01) throw new Error('Invalid compression flag');

  return {
    version: buffer[0],
    privateKey: buffer.slice(1, 33).toString('hex'),
    compressed: true,
  };
}

// console.log(encode(128, 'ca516a047f5859ab07fc268f542266237eafe7f3d11776a270b95a17f2a927ee', true) === 'L3zzQuchDFE2No3wH3xRPCwEKLE8wrJrSjGrrHGoSaN1Ca5gaGed');
// console.log(decode('L3zzQuchDFE2No3wH3xRPCwEKLE8wrJrSjGrrHGoSaN1Ca5gaGed').privateKey === 'ca516a047f5859ab07fc268f542266237eafe7f3d11776a270b95a17f2a927ee');

module.exports = { encode, decode };
