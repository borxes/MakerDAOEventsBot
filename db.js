const mongoose = require('mongoose');
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
mongoose.connect(
  `mongodb://${dbUser}:${dbPassword}@ds043605.mlab.com:43605/makerdao`,
  { useNewUrlParser: true }
);

// saving an action to MongoDB
//const db = require('./db');
//const CupAct = require('./ActionModel');

// const testAct = new CupAct({
//   act: 'OPEN',
// });

// testAct.save().then(() => {
//   console.log('done');
//   testAct.db.close();
// });
