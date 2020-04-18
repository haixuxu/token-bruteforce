const util = require('util');
const fs = require('fs');
const path = require('path');
const log = require('single-line-log').stdout;

const generateWallet = require('./lib/generateWallet');
const timeout = require('./lib/timeout');
const readJson = require('./lib/readJson');
const writefile = util.promisify(fs.writeFile);

const savefile = path.resolve(__dirname, `./data/crazylocal_${Date.now()}.json`);
const verifyDataPath = path.resolve(__dirname, './data/tokenViewBigETH.json');
const tokenViewBigObj = readJson(verifyDataPath);
const len = Object.keys(tokenViewBigObj).length;
console.log('\teth account length: ' + len);

var accountList = [];

function writelog() {
  writefile(savefile, JSON.stringify(accountList));
}
let count = 0;

function crazyLocal() {
  loopTask();
  async function loopTask() {
    try {
      while (true) {
        count++;
        let obj = generateWallet();
        let address = obj.address;
        let privateKey = obj.priv;
        log(`\tcurrent test count [${count}] \n\tprivHex:${privateKey}  \n\taddress:${address} \n\tcurrent crazy key count: ${accountList.length}`);
        if (tokenViewBigObj[address]) {
          accountList.push(privateKey);
          console.log(`current key is: ${privateKey}`);
          writelog();
        }
        await timeout(50);
      }
    } catch (err) {
      console.log(err.message);
      // ignore
    }
  }
}

crazyLocal();
