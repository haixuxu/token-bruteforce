const axios = require('axios');
const fs = require('fs');
const path = require('path');
const timeout = require('./lib/timeout');
const readJson = require('./lib/readJson');
const promiseReduce = require('./lib/promiseReduce');

const savepath = path.join(__dirname, './data/tokenViewBig.json');
const localObj = readJson(savepath, {});

function getUrl(currentPage, pageSize) {
  return `https://eth.tokenview.com/api/tx/unusual/amount/${currentPage}/${pageSize}`;
}

const accounts = [];
const oneHour = 1000 * 60 * 60;
const from = Date.now() - oneHour * 24 * 7;
const to = Date.now() + oneHour * 24;
const query = { network: 'eth', from: from / 1000, to: to / 1000, amount: '100', currency: 'eth' };

async function fetchtarget() {
  try {
    const resp = await axios.post(getUrl(1, 10), query);
    const bizData = resp.data;
    const total = bizData.data.total;
    const pageCount = Math.ceil(total / 100);
    console.log('total page :' + pageCount);
    const tasks = [...Array(pageCount).keys()].map((temp) => {
      return async function () {
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
    console.log(`write ${accounts.length} count data  to ${savepath}`);
  } catch (err) {
    console.log(err.message);
  }
}

fetchtarget();
