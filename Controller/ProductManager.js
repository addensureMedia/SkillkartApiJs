const { Product } = require("../Models/ProductModel");

exports._getProducts = async (req, res) => {
  const products = await Product.find();
  return res.status(200).json({
    status: "success",
    data: products,
  });
};
