const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readJson = require('./lib/readJson');

function getUrl(type) {
  return `https://btc.tokenview.com/api/address/top200rich/${type}`;
}

async function fetchtTopRich(type) {
  try {
    let savepath = path.join(__dirname, './data/tokenViewBigETH.json');
    if (type === 'btc') {
      savepath = path.join(__dirname, './data/tokenViewBigBTC.json');
    }
    const localObj = readJson(savepath, {});
    console.log('local data length: ' + Object.keys(localObj).length);
    const resp = await axios.get(getUrl(type));
    const bizData = resp.data;
    const addrList = bizData.data.addrList;
    addrList.forEach((temp) => (localObj[temp.addr] = 1));
    fs.writeFileSync(savepath, JSON.stringify(localObj, null, 2), 'utf8');
    console.log(`write ${Object.keys(localObj).length} count data  to ${savepath}`);
  } catch (err) {
    console.log(err.message);
  }
}

fetchtTopRich('eth');
