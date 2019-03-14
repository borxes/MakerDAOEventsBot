// Standard library imports

require('dotenv').config();

// Third party imports

const moment = require('moment');
const Telegram = require('telegraf/telegram');
const { GraphQLClient } = require('graphql-request');
const CronJob = require('cron').CronJob;

// Local imports
const { formatNumber } = require('./helpers');
const { query } = require('./query');

// Constants

const UPDATE_FREQ = 60; // check every X seconds

// Telegram and GraphQL clients

const telegram = new Telegram(process.env.BOT_TOKEN);
const MKR_ENDPOINT = 'https://sai-mainnet.makerfoundation.com/v1';
const client = new GraphQLClient(MKR_ENDPOINT, { headers: {} });

// returns messages about the MakerDAO event
const buildMessage = node => {
  const { id, act, art, ink, ire, ratio, tab, time, per, lad } = node;
  const str =
    `CDP ID: ${id}\n` +
    `Action: *${act}*\n` +
    `Debt (in _DAI_): *${formatNumber(art, 2)}*\n` +
    `Collateral (in _PETH_): *${formatNumber(ink, 2)}*\n` +
    `Collateralization ratio: *${formatNumber(ratio, 2)}%*\n` +
    `Collateral value (in _$USD_): ${formatNumber(tab, 2)}\n`;
  return str;
};

const explainer = node => {
  const { id, act, art, ink, ire, ratio, tab, time, per, lad } = node;
  const [prettyArt, prettyInk, prettyRatio] = [
    formatNumber(art, 2),
    formatNumber(ink, 2),
    formatNumber(ratio, 2),
  ];

  const riskify = ratio => {
    const riskCutoff = 190;
    return ratio === '0'
      ? ''
      : `The collateralization ratio is ${prettyRatio}% ` +
          `which is ${ratio < riskCutoff ? '*risky*' : '_safe_'} ` +
          `(current liquidation ratio is 150%)`;
  };

  let result = '\n\n*Explanation*: ';
  switch (act) {
    case 'OPEN':
      result += `A good lad ${lad} just opened a brand new CDP.`;
      break;
    case 'LOCK':
      result +=
        `More PETH has been locked in CDP ${id}, so now it has ${prettyInk} ` +
        `PETH as a collateral. ${riskify(ratio)}`;
      break;
    case 'FREE':
      if (art === '0') {
        result += `All PETH has been withdrawn from CDP ${id} but it's still active.`;
      } else {
        result +=
          `Some PETH has been withdrawn from CDP ${id}, so now it has ${prettyArt} ` +
          `PETH as a collateral. ${riskify(ratio)}`;
      }
      break;
    case 'SHUT':
      result += `CDP ${id} has been shut down. Goodbye, we will miss you.`;
      break;
    case 'DRAW':
      result +=
        `Some DAI has been drawn from CDP ${id}, so the total debt now is ` +
        `${prettyArt} against ${prettyInk} PETH collateral. ${riskify(ratio)}`;
      break;
    case 'WIPE':
      result +=
        `Some DAI has been repaid to CDP ${id}, so the total debt now is ` +
        `${prettyArt} against ${prettyInk} PETH collateral. ${riskify(ratio)}`;
      break;
    case 'BITE':
      result +=
        `Some tasty liquidation action took place on CDP ${id}.` +
        ` ${
          ink === '0' ? 'All' : 'Some'
        } of its collateral was auctioned and ${ink} ` +
        ` PETH is still locked in the CDP.`;
      break;
    case 'GIVE':
      result += `CDP ${id} has been transferred to a new owner ${lad}.`;
      break;
  }

  return result;
};

const mainTask = () => {
  console.log(`${moment().format()}: Main Task running`);
  const actsQuery = query(UPDATE_FREQ);
  client.request(actsQuery).then(data => {
    console.log(`Received gql data: ${JSON.stringify(data)}`);
    data.allCupActs.nodes.forEach(node => {
      const message = buildMessage(node) + explainer(node);
      telegram
        .sendMessage('@makerdaoevents', message, { parse_mode: 'Markdown' })
        .then(data => {
          console.log(`Poasting ${message}`);
        })
        .catch(err => {
          console.log(`Telegram error: ${err}`);
        });
    });
  });
};

const job = new CronJob('*/1 * * * *', mainTask);
job.start();
console.log('Cron job started');
