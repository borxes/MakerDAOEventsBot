const BigNumber = require('bignumber.js');

function formatNumber(number, decimals) {
  BigNumber.set({ ROUNDING_MODE: 4 });
  return Number(new BigNumber(number).toFixed(decimals));
}

function mul(number, factor) {
  return new BigNumber(number).times(new BigNumber(factor));
}

module.exports = {
  formatNumber,
  mul,
};
