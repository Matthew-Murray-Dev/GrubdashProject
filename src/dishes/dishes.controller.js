const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req, res) {

  const { data: { name,description,price,image_url } = {} } = req.body;
 
  const newDish = {
    id: nextId(),
    name,description,price,image_url
  };
  
  dishes.push(newDish);
  
  res.status(201).json({ data: newDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

function read(req, res) {
  const dishId = Number(req.params.dishId);
  const foundDish = dishes.find((dish) => (dish.id == dishId));
  
  res.json({ data: foundDish });
}

function update(req, res) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => (dish.id === dishId));

  const { data: { name,description,price,image_url } = {} } = req.body;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price=price;
  foundDish.image_url=image_url;

  res.json({ data: foundDish });
}

//~~~~Validation functions~~~~~~~
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
   const foundDish = dishes.find((dish) => (dish.id == dishId));
 
  if (foundDish) {
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${req.params.dishId}`,
  });
}

function idMisMatch(req, res, next){
  const dishId = req.params.dishId;
  let id=req.body.data.id

  if (!id||dishId===id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}


function hasName(req, res, next) {
  const { data: { name } = {} } = req.body;

  if (name&&name!=="") {
    return next();
  }
  next({ status: 400, message: "Dish must include a name" });
}

function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;

  if (description&&description!=="") {
    return next();
  }
  next({ status: 400, message: "Dish must include a description" });
}

function hasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;

  if (price) {
    return next();
  }
  next({ status: 400, message: "Dish must include a price" });
}

function hasPriceValid(req, res, next) {
  const { data: { price } = {} } = req.body;

  if (price>0&&Number.isInteger(price)) {
    return next();
  }
  next({ status: 400, message: "Dish must have a price that is an integer greater than 0" });
}

function hasUrl(req, res, next) {
  const { data: { image_url } = {} } = req.body;

  if (image_url&&image_url!=="") {
    return next();
  }
  next({ status: 400, message: "Dish must include a image_url" });
}

module.exports = {
  create: [hasName,hasDescription,hasPrice,hasPriceValid,hasUrl, create],
  list,
  read: [dishExists, read],
  update: [dishExists, idMisMatch,hasName,hasDescription,hasPrice,hasPriceValid,hasUrl, update],
  dishExists
};
