var mongoose = require('mongoose');

var dealerSchema = require('../schemas/dealer.js');

var Dealer = mongoose.model("Dealer", dealerSchema);

module.exports = Dealer;