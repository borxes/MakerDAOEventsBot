const moment = require('moment');

const query = updateFreq => {
  // calculate UTC time some minutes ago
  const timeCutoff = moment()
    .utc()
    .subtract(updateFreq, 'seconds')
    .format();

  return `
  {
    allCupActs(filter: {
      time: { greaterThan: \"${timeCutoff}\" }
    }) {
      nodes {
        id
        act
        art
        ink
        ire
        ratio
        tab
        time
        per
        lad
      }
      totalCount
    }
  }
`;
};

module.exports = {
  query,
};
