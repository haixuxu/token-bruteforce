/** Create Bitcoin Address */
const crypto = require(`crypto`);
const ecdh = crypto.createECDH('secp256k1');
const bs58 = require(`bs58`);

function createBitcoinAddress() {
  // 0 - Having a private ECDSA key
  var privateKey = crypto.randomBytes(32);
  //   console.log(`Private key:[${privateKey.toString(`hex`)}]`);
  // 1 - Take the corresponding public key generated with it (33 bytes, 1 byte 0x02 (y-coord is even),
  // and 32 bytes corresponding to X coordinate)
  ecdh.setPrivateKey(privateKey);
  var cpublicKey = Buffer.from(ecdh.getPublicKey('hex', 'compressed'), 'hex');
  //   console.log(`Public key:[${cpublicKey.toString(`hex`).toUpperCase()}]`);
  // 2 - Perform SHA-256 hashing on the public key
  var sha1 = crypto.createHash(`sha256`).update(cpublicKey).digest();
  //   console.log(`SHA-256:[${sha1.toString(`hex`)}]`);
  // 3 - Perform RIPEMD-160 hashing on the result of SHA-256
  var ripemd160 = crypto.createHash(`rmd160`).update(sha1).digest();
  //   console.log(`RIPEMD-160:[${ripemd160.toString(`hex`)}]`);
  // 4 - Add version byte in front of RIPEMD-160 hash (0x00 for Main Network, 0x6f for Testnet)
  const version = Buffer.from([0x00]);
  var extendedPriKey = Buffer.alloc(ripemd160.length + version.length);
  extendedPriKey = Buffer.concat([version, ripemd160], extendedPriKey.length);
  //   console.log(`Extended RIPEMD-160:[${extendedPriKey.toString(`hex`)}]`);
  // 5 - Perform SHA-256 hash on the extended RIPEMD-160 result
  var sha2 = crypto.createHash(`sha256`).update(extendedPriKey).digest();
  //   console.log(`SHA-256:[${sha2.toString(`hex`)}]`);
  // 6 - Perform SHA-256 hash on the result of the previous SHA-256 hash
  var sha3 = crypto.createHash(`sha256`).update(sha2).digest();
  //   console.log(`SHA-256:[${sha3.toString(`hex`)}]`);
  // 7 - Take the first 4 bytes of the second SHA-256 hash. This is the address checksum
  var checksum = Buffer.alloc(4);
  sha3.copy(checksum, 0, 0, checksum.length);
  //   console.log(`Checksum:[${checksum.toString(`hex`)}]`);
  // 8 - Add the 4 checksum bytes from stage 7 at the end of extended RIPEMD-160 hash from stage 4.
  // This is the 25-byte binary Bitcoin Address.
  var btcAddress = Buffer.alloc(extendedPriKey.length + checksum.length);
  btcAddress = Buffer.concat([extendedPriKey, checksum], btcAddress.length);
  //   console.log(`25-byte binary bitcoin address:[${btcAddress.toString(`hex`)}]`);
  // 9 - Convert the result from a byte string into a base58 string using Base58Check encoding.
  // This is the most commonly used Bitcoin Address format
  var address = bs58.encode(btcAddress);
  //   console.log(address);
  return {
    priv: privateKey.toString(`hex`),
    address: address,
  };
  //   console.log(`Address:[${address}]`);
}

createBitcoinAddress();

module.exports = createBitcoinAddress;
