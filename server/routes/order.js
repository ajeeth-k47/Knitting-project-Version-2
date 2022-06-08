const express = require('express');
const order = express.Router();
const orderController = require('../controllers/orderController');


order.get('/orderlist',orderController.orderpage);

order.post('/createorder',orderController.createorderpage);
order.post('/neworder',orderController.addorder);
order.post('/addorderprogram',orderController.addorderprogram);
order.post('/addyarn',orderController.addyarn);
order.post('/updateYarn',orderController.updateYarn);
order.post('/editdeleteYarn',orderController.editdeleteYarn);
order.post('/editYarn',orderController.editYarn);
order.post('/deleteYarn',orderController.deleteYarn);
order.post('/addProgram',orderController.addProgram);
order.post('/returnYarnPage',orderController.returnYarnPage);
order.post('/returnYarn',orderController.returnyarn);
order.post('/activity',orderController.activitylog);
order.post('/editSelectedYarn',orderController.editSelectedYarn);
order.post('/searchbysupplier',orderController.searchBySupplier);
order.post('/searchbydate',orderController.searchByDate);

module.exports = order;