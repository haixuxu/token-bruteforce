const axios = require('axios');
const fs = require('fs');
const path = require('path');
const timeout = require('./lib/timeout');
const readJson = require('./lib/readJson');
const promiseReduce = require('./lib/promiseReduce');

function getUrl(currentPage, pageSize) {
  return `https://eth.tokenview.com/api/tx/unusual/amount/${currentPage}/${pageSize}`;
}

const oneHour = 1000 * 60 * 60;
const from = Date.now() - oneHour * 24 * 7;
const to = Date.now() + oneHour * 24;

async function fetchtarget(type) {
  try {
    let query = { network: 'eth', from: from / 1000, to: to / 1000, amount: '100', currency: 'eth' };
    let savepath = path.join(__dirname, './data/tokenViewBigETH.json');
    if (type === 'btc') {
      savepath = path.join(__dirname, './data/tokenViewBigBTC.json');
      query = { network: 'btc', from: from / 1000, to: to / 1000, amount: '100', currency: 'btc' };
    }
    const localObj = readJson(savepath, {});

    const resp = await axios.post(getUrl(1, 10), query);
    const bizData = resp.data;
    const total = bizData.data.total;
    const pageCount = Math.ceil(total / 100);
    console.log('total page :' + pageCount);
    const tasks = [...Array(pageCount).keys()].map((temp) => {
      return async function() {
        console.log(`fetch page ${temp + 1} data...`);
        const resp2 = await axios.post(getUrl(temp + 1, 100), query);
        const bizData = resp2.data;
        if (bizData && bizData.data) {
          const data = bizData.data.data || [];
          data.forEach((temp) => {
            const key1 = temp.addr;
            const key2 = temp.to_addr;
            if (!localObj[key1]) {
              localObj[key1] = 1;
            }
            if (!localObj[key2]) {
              localObj[key1] = 1;
            }
          });
          await timeout(2000);
        }
      };
    });

    await promiseReduce(tasks);
    fs.writeFileSync(savepath, JSON.stringify(localObj, null, 2), 'utf8');
    console.log(`write ${Object.keys(localObj).length} count data  to ${savepath}`);
  } catch (err) {
    console.log(err.message);
  }
}

fetchtarget('eth');
