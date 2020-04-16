const fs = require('fs');

module.exports = function (filepath, initData) {
  try {
    return require(filepath);
  } catch (err) {
    fs.writeFileSync(filepath, JSON.stringify(initData, null, 2));
    return initData;
  }
};
