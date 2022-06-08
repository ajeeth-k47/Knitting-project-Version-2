const {suppliermaster,yarnmaster,colormaster,millmaster,companymaster,diamaster,gaugemaster,taxmaster,fabricmaster} = require('../models/mastermodel');
const {orderlist,yarnlist,programlist,returnyarn,timeline} = require('../models/ordermodel');

exports.orderpage = async(req,res) => {
    try{
      const suppliers = await suppliermaster.find({})
      const orders = await orderlist.find({});
      res.render('orders/order',{suppliers,orders});
    }
    catch(error){
      res.send('error occured' ,error)
    }
  }

exports.searchBySupplier = async(req,res) => {
   try{
    const suppliers = await suppliermaster.find({})
    const orders = await orderlist.find({supplier:{$regex:(req.body.name).toUpperCase()}});
    res.render('orders/order',{suppliers,orders});
   }
   catch(error){
    res.send('error occured' ,error)
  }
}

exports.searchByDate = async(req,res) => {
  try{
    
    const suppliers = await suppliermaster.find({})
    const orders = await orderlist.find({
      supplier:{$regex:(req.body.suplier).toUpperCase()}, 
      orderDate: {
          $gte:req.body.fromdate,
          $lte:req.body.todate
      }
      
  });
    res.render('orders/order',{suppliers,orders});
  }
  catch(error){
    res.send('error occured' ,error)
  }
}

exports.createorderpage = async(req,res) => {
  try{
    const orderslist = await orderlist.find({});
    const length = orderslist.length;
    var today = new Date();
    let orderno = "VF/"+today.getFullYear()+"-"+(today.getFullYear()+1);
    if(length==0)
    {
     orderno = orderno+"/1";
    }
    if(length!=0){
      var lastno = Number((orderslist[length-1].orderNo).slice(13))+1;
      orderno = orderno+"/"+lastno;
    }

    const supplierslist = await suppliermaster.find({});
    const yarncounts = await yarnmaster.find({});
    const mills = await millmaster.find({});
    const colors = await colormaster.find({});
    const companies = await companymaster.find({});
    res.render('orders/createorder',{orderno,supplierslist,yarncounts,mills,colors,companies});
    

  }
  catch(error){
    res.send('error occured' ,error)
  }
}


exports.addorder = async(req,res) => {
  try{

  const formatDate = new Date(req.body.orderDate);
   const newyarn = await yarnlist({
    yarn:req.body.yarncount,
    mill:req.body.mill,
    color:req.body.colour,
    weight:req.body.weight
   });
   
   const neworder = await orderlist({
    orderNo:req.body.orderNumber,
    company:req.body.company,
    orderDate: req.body.orderDate,
    supplier:req.body.supplier,
    yarnCount:[
        newyarn
    ],
    yarnWeight:req.body.weight,
    balanceWeight:req.body.weight,
    status:'Order Created'
   });
   await neworder.save();

   const newActivity = await timeline({
     orderNo:req.body.orderNumber,
     reference:req.body.orderNumber,
     datetime:(formatDate).getDate()+"-"+((formatDate).getMonth()+1)+"-"+(formatDate).getFullYear(),
     action:'Order Creation',
     description:'Yarn Wgt :'+req.body.weight+'Kgs'
   })
   await newActivity.save();

   res.redirect('orderlist');
  }
  catch(error){
    res.send('error occured' ,error);
  }
}

exports.addorderprogram = async(req,res) => {
  try{
    const fabrics = await fabricmaster.find({});
    const dias = await diamaster.find({});
    const gauges = await gaugemaster.find({});
    const taxs = await taxmaster.find({});
    const choosenOrders = await orderlist.find({orderNo:{$regex:(req.body.orderNumber)}});
    const choosenProgram = await programlist.find({orderNo:{$regex:(req.body.orderNumber)}});
    res.render('orders/addorderprogram',{choosenOrders,choosenProgram,fabrics,dias,gauges,taxs});
  // res.send('Program: ',choosenProgram);
  }
  catch(error){
    res.send('error occured' ,error);
  }
}

exports.addyarn = async(req,res) => {
  try{
    const yarncounts = await yarnmaster.find({});
    const mills = await millmaster.find({});
    const colors = await colormaster.find({});
    const orderno = req.body.orderNum;
    res.render('orders/addyarn',{orderno,yarncounts,mills,colors});

  }
  catch(error){
    res.send('error occured' ,error);
  }
}


exports.updateYarn = async(req,res) => {
  try{
    
    const newyarn = new yarnlist({
      yarn:req.body.yarncount,
      mill:req.body.mill,
      color:req.body.colour,
      weight:req.body.weight
    });
    var newWeight;
    var newBalance;
    orderlist.findOne({orderNo:req.body.orderNumber},function(err,foundOrder){
      foundOrder.yarnCount.push(newyarn);
      newWeight = Number(req.body.weight)+foundOrder.yarnWeight;
      newBalance = Number(req.body.weight)+foundOrder.balanceWeight;
      foundOrder.save();
    });
  
    const fabrics = await fabricmaster.find({});
    const dias = await diamaster.find({});
    const gauges = await gaugemaster.find({});
    const taxs = await taxmaster.find({});
    await orderlist.findOneAndUpdate({orderNo:req.body.orderNumber},{yarnWeight:newWeight,balanceWeight:newBalance},{new:true});
    let choosenOrders = await orderlist.find({orderNo:req.body.orderNumber});
    const choosenProgram = await programlist.find({orderNo:{$regex:(req.body.orderNumber)}});
    res.render('orders/addorderprogram',{choosenOrders,choosenProgram,fabrics,dias,gauges,taxs});
  }
  catch(error){
    res.send('error occured' ,error);
  }
}

exports.editdeleteYarn = async(req,res) =>{
  try{
    const order = await orderlist.find({orderNo:req.body.orderNum});
    res.render('orders/EditDeleteYarn',{order})
  }
  catch(error){
    res.send('error occured' ,error);
  }
}

exports.editYarn = async(req,res) =>{
  try{
    const order = await orderlist.find({orderNo:req.body.orderNumber});
    const index = Number(req.body.indexNumber);
    const selectedYarn = order[0].yarnCount[index]; 
    const yarncounts = await yarnmaster.find({});
    const mills = await millmaster.find({});
    const colors = await colormaster.find({});
    res.render('orders/editYarn',{orderno:req.body.orderNumber,index,selectedYarn,yarncounts,mills,colors});
  }
  catch(error){
    res.send('error occured' ,error);
  }
}

exports.editSelectedYarn = async(req,res) =>{
  try{
    const order = await orderlist.find({orderNo:req.body.orderNumber});
    const index = Number(req.body.indexNumber);
    const arry_id = order[0].yarnCount[index]._id;
    const newWeight = order[0].yarnWeight-Number(req.body.oldWeight)+Number(req.body.weight);
    const newBalance = order[0].balanceWeight-Number(req.body.oldWeight)+Number(req.body.weight);
    await orderlist.findOneAndUpdate({orderNo:req.body.orderNumber},{yarnWeight:newWeight,balanceWeight:newBalance},{new:true});
    orderlist.updateOne({orderNo:req.body.orderNumber,"yarnCount._id":arry_id},{'$set':{"yarnCount.$.yarn":req.body.yarn,"yarnCount.$.mill":req.body.mill,"yarnCount.$.color":req.body.color,"yarnCount.$.weight":req.body.weight}},function(err){
      if(err)
      {
          res.send(err);
      }
      
    });
    const fabrics = await fabricmaster.find({});
    const dias = await diamaster.find({});
    const gauges = await gaugemaster.find({});
    const taxs = await taxmaster.find({});
    const choosenOrders = await orderlist.find({orderNo:{$regex:(req.body.orderNumber)}});
    const choosenProgram = await programlist.find({orderNo:{$regex:(req.body.orderNumber)}});
    res.render('orders/addorderprogram',{choosenOrders,choosenProgram,fabrics,dias,gauges,taxs});
   // res.send(order[0].yarnCount[index]+" Id value: "+arry_id);
  }
  catch(error){
    res.send('error occured' ,error);
  }
}


exports.deleteYarn = async(req,res) =>{
  try{
    const order = await orderlist.find({orderNo:req.body.orderNumber});
    const index = Number(req.body.indexNumber);
    const arry_id = order[0].yarnCount[index]._id;
    var newWeight = order[0].yarnWeight-order[0].yarnCount[index].weight;
    var newBalance = order[0].balanceWeight-order[0].yarnCount[index].weight;
    await orderlist.findOneAndUpdate({orderNo:req.body.orderNumber},{yarnWeight:newWeight,balanceWeight:newBalance},{new:true});
   orderlist.updateOne({orderNo:req.body.orderNumber},{"$pull":{"yarnCount":{"_id":arry_id}}},{safe:true,multi:true},function(err){
      if(err)
      {
          res.send(err);
      }
      
    });
    const fabrics = await fabricmaster.find({});
    const dias = await diamaster.find({});
    const gauges = await gaugemaster.find({});
    const taxs = await taxmaster.find({});
    const choosenOrders = await orderlist.find({orderNo:{$regex:(req.body.orderNumber)}});
    const choosenProgram = await programlist.find({orderNo:{$regex:(req.body.orderNumber)}});
    res.render('orders/addorderprogram',{choosenOrders,choosenProgram,fabrics,dias,gauges,taxs});
   // res.send(order[0].yarnCount[index]+" Id value: "+arry_id);
  }
  catch(error){
    res.send('error occured' ,error);
  }
}

exports.addProgram = async(req,res) =>{
  try{
    const order = await orderlist.find({orderNo:req.body.programOrderNum});
    const programs = await programlist.find({});
    const length = programs.length;
    var today = new Date();
    //-------------------------------Generating ProgramNo-------------------------
    let programno = "KP/"+today.getFullYear()+"-"+(today.getFullYear()+1);
    if(length==0)
    {
     programno = programno+"/1";
    }
    if(length!=0){
      var lastno = Number((programs[length-1].programNo).slice(13))+1;
      programno = programno+"/"+lastno;
    }

   //----------------------------Checking the feasibility of order creation-----------
    if(req.body.weight<=order[0].balanceWeight)
    {
    
    var newWeight = order[0].balanceWeight-req.body.weight;
    await orderlist.findOneAndUpdate({orderNo:req.body.programOrderNum},{status:'Program Created',balanceWeight:newWeight},{new:true});
    const programDate = new Date();
    const newprogramDate = programDate.getDate()+"-"+(programDate.getMonth()+1)+"-"+programDate.getFullYear();
    const targetDate = new Date(req.body.targetdate);
    const newtargetDate = targetDate.getDate()+"-"+(targetDate.getMonth()+1)+"-"+targetDate.getFullYear();
    const newProgram = new programlist({
      orderNo:req.body.programOrderNum,
      programNo:programno,
      programDate:newprogramDate,
      fabricType:req.body.fabricType,
      dia:Number(req.body.dia),
      gauge:Number(req.body.gauge),
      loopLength:req.body.looplength,
      designNo:req.body.dc,
      gsm:req.body.gsm,
      Weight:req.body.weight,
      targetDate:newtargetDate,
      price:req.body.price,
      tax:req.body.tax
    });
    await newProgram.save();

    
   const newActivity = await timeline({
    orderNo:req.body.programOrderNum,
    reference:programno,
    datetime:newprogramDate,
    action:'Program Creation',
    description:'Yarn Wgt'+req.body.weight+'Kgs'
   })
   await newActivity.save();

    }
    const fabrics = await fabricmaster.find({});
    const dias = await diamaster.find({});
    const gauges = await gaugemaster.find({});
    const taxs = await taxmaster.find({});
    const choosenOrders = await orderlist.find({orderNo:{$regex:(req.body.programOrderNum)}});
    const choosenProgram = await programlist.find({orderNo:{$regex:(req.body.programOrderNum)}});
    res.render('orders/addorderprogram',{choosenOrders,choosenProgram,fabrics,dias,gauges,taxs});
  }
  catch(error)
  {
    res.send('error occured' ,error);
  }
}


//------------------return yarn-----------------

exports.returnYarnPage = async(req,res) =>{
  try{
   const choosenOrders = await orderlist.find({orderNo:{$regex:(req.body.orderNumber)}});
   const returns = await returnyarn.find({orderNo:{$regex:(req.body.orderNumber)}});
    res.render('orders/returnYarn',{choosenOrders,returns});
  }
  catch(error)
  {
    res.send('error occured' ,error);
  }
}


exports.returnyarn = async(req,res) => {
  try{
    const order = await orderlist.find({orderNo:req.body.orderNum});

    if(req.body.weight<=order[0].balanceWeight){
      let today = new Date();
      today = today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear();
      let newWeight = order[0].yarnWeight-req.body.weight;
      let newBalance = order[0].balanceWeight-req.body.weight;
      await orderlist.findOneAndUpdate({orderNo:req.body.orderNum},{yarnWeight:newWeight,balanceWeight:newBalance},{new:true});
      const newReturn = await returnyarn({
        orderNo:req.body.orderNum,
        returnWeight:req.body.weight,
        returnDate:today,
        reason:req.body.reason
      });
      await newReturn.save();
      const returns = await returnyarn.find({orderNo:{$regex:(req.body.orderNum)}});
      res.render('orders/returnYarn',{choosenOrders:order,returns});
    }

    else{
      res.redirect('orderlist');
    }
  }
  catch(error){
    res.send('error occured' ,error);
  }
}

exports.activitylog = async(req,res) => {
  try{
     const activities = await timeline.find({orderNo:{$regex:(req.body.orderNumber)}});
     const choosenOrders = await orderlist.find({orderNo:{$regex:(req.body.orderNumber)}});
     res.render('orders/timeline',{choosenOrders,activities});
  }
  catch(error){
    res.send('error occured' ,error);
  }
}