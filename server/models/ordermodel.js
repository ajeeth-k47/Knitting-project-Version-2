const mongoose = require('mongoose');
const conn = require('./database');

const yarnlistSchema = new mongoose.Schema({
    yarn:String,
    mill:String,
    color:String,
    weight:Number
  });


const orderlistSchema = new mongoose.Schema({
    orderNo:String,
    company:String,
    orderDate:Date,
    supplier:String,
    yarnCount:[
        yarnlistSchema
    ],
    yarnWeight:Number,
    balanceWeight:Number,
    status:String
});

const programlistSchema = new mongoose.Schema({
  orderNo:String,
  programNo:String,
  programDate:String,
  fabricType:String,
  dia:Number,
  gauge:Number,
  loopLength:String,
  designNo:String,
  gsm:String,
  Weight:Number,
  targetDate:String,
  price:Number,
  tax:String
})

const returnyarnSchema = new mongoose.Schema({
  orderNo:String,
  returnWeight:Number,
  returnDate:String,
  reason:String
})

const timelineSchema = new mongoose.Schema({
  orderNo:String,
  reference:String,
  datetime:String,
  action:String,
  description:String
})

const orderlist= mongoose.orderDB.model('orderlist', orderlistSchema);
const yarnlist= mongoose.orderDB.model('yarnlist', yarnlistSchema);
const programlist = mongoose.orderDB.model('programlist', programlistSchema); 
const returnyarn = mongoose.orderDB.model('returnyarn', returnyarnSchema); 
const timeline = mongoose.orderDB.model('timeline', timelineSchema);

module.exports = {
  orderlist,
  yarnlist,
  programlist,
  returnyarn,
  timeline,
}