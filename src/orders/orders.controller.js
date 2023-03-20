const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function create(req, res) {
  
  const { data: { deliverTo,mobileNumber,dishes } = {} } = req.body;
 
  const newOrder = {
    id: nextId(),
    deliverTo,mobileNumber,dishes
  };
 
 
  orders.push(newOrder);
  
  res.status(201).json({ data: newOrder });
}

function list(req, res) {
  const { dishId } = req.params;
  
  res.json({ data: orders.filter(dishId ? order => order.dishes.some((dish)=> dish.Id == dishId) : () => true) });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
};

function update(req, res) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => (order.id === orderId));

  const { data: { deliverTo,mobileNumber,dishes } = {} } = req.body;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.dishes=dishes;
  
  res.json({ data: foundOrder });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id == orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

//~~~~~~Validation Functions~~~~~~~~
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(order => order.id == orderId);
  
   if (foundOrder) {
   
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `order id not found: ${orderId}`,
  });
};

function hasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;

  if (deliverTo&&deliverTo!=="") {
    return next();
  }
  next({ status: 400, message: "Order must include a deliverTo" });
}

function hasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;

  if (mobileNumber&&mobileNumber!=="") {
    return next();
  }
  next({ status: 400, message: "Order must include a mobileNumber" });
}

function hasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;

  if (!dishes) {
    return next({ status: 400, message: "Order must include a dish" });
  } else if (!Array.isArray(dishes)||dishes.length<1){
return next({ status: 400, message: "Order must include at least one dish" });}
  else {return next();}
}
//Array.isArray(dishes)
function hasDishQuantity(req, res, next){
   const { data: { dishes } = [] } = req.body;
  
   const index = dishes.findIndex((dish) => !dish.quantity||dish.quantity<1||!Number.isInteger(dish.quantity));
  if (index > -1) {return next({status: 400,message: `Dish ${index} must have a quantity that is an integer greater than 0`})}
 return next();
   
}


function idMisMatch(req, res, next){
  const orderId = req.params.orderId;
  let id=req.body.data.id

  if (!id||orderId===id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
  });
}

function statusCheck(req, res, next){
   const orderId = req.params.orderId;
  const status=req.body.data.status
  
if(status!=="pending")
{return next({status:400,message: "Order must have a status of pending, preparing, out-for-delivery, delivered"})}
  else if (status==="delivered"){return next({status:400,message: "A delivered order cannot be changed"})}
  else {return next();}
}


function orderPending(req,res,next){
const { orderId } = req.params;
  const foundOrder = orders.find(order => order.id === orderId);


  if (foundOrder.status==="pending") {
    return next();
  }
  next({ status: 400, message: "An order cannot be deleted unless it is pending. Returns a 400 status code" });
}





module.exports={list,create:[hasDeliverTo,hasMobileNumber,hasDishes,hasDishQuantity,create],read:[orderExists, read],update:[orderExists,hasDeliverTo,hasMobileNumber,hasDishes,hasDishQuantity,idMisMatch,statusCheck,update],delete:[orderExists,orderPending,destroy]}