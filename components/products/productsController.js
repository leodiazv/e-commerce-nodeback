// ===== UTILS =====

const { catchAsync } = require('../../utils/catchAsync');
const { AppError } = require('../../utils/appError');

// ===== MODELS =====

const { Product } = require('../products/productModel');

// ===== FUNCTIONS =====

const createProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, quantity, categoryId } = req.body;
  const { sessionUser } = req;

  const newProduct = await Product.create({
    title,
    description,
    price,
    quantity,
    userId: sessionUser.id,
    categoryId,
  });

  res.status(201).json({ newProduct });
});

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { status: 'active' },
  });

  res.status(200).json({ products });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { product } = req;

  if (product.status !== 'active') {
    return next(new AppError('Product not active'), 400);
  }

  res.status(200).json({ product });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { product, sessionUser } = req;
  const { title, description, price, quantity } = req.body;

  if (sessionUser.id !== product.userId) {
    return next(new AppError('You do not own this account', 403));
  }

  await product.update({ title, description, price, quantity });

  res.status(200).json({ status: 'success' });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { product, sessionUser } = req;

  if (sessionUser.id !== product.userId) {
    return next(new AppError('You do not own this account', 403));
  }

  await product.update({ status: 'disabled' });

  res.status(200).json({ status: 'success' });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
