const util = require('util');
const fs = require('fs');
const path = require('path');

const createBtcWallet = require('./lib/createBtcWallet');
const timeout = require('./lib/timeout');
const readJson = require('./lib/readJson');
const writefile = util.promisify(fs.writeFile);

const savefile = path.resolve(__dirname, `./data/crazylocal_${Date.now()}.json`);
const verifyDataPath = path.resolve(__dirname, './data/tokenViewBigBTC.json');
const tokenViewBigObj = readJson(verifyDataPath);
console.log(Object.keys(tokenViewBigObj).length);

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
        let obj = createBtcWallet();
        let address = obj.address;
        let privateKey = obj.priv;
        console.log(`test[${count}] privHex:${privateKey}  address:${address} current crazy key count: ${accountList.length}`);
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
