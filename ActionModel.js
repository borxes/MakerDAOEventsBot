const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cupActSchema = new Schema({
  act: String,
  art: String,
  block: Number,
  deleted: Boolean,
  cid: Number,
  ink: String,
  lad: String,
  pip: String,
  ratio: String,
  tab: String,
  time: Date,
  tx: String,
});

const CupAct = mongoose.model('CupActSchema', cupActSchema);

module.exports = CupAct;
