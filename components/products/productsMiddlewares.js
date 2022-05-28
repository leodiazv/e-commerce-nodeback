// ===== MODELS =====

const { Product } = require('./productModel');

// ===== UTILS =====

const { catchAsync } = require('../../utils/catchAsync');
const { AppError } = require('../../utils/appError');

// =================

const productExists = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findOne({
    where: { id: productId },
  });

  if (!product) {
    return next(new AppError('Product does not exist with given Id', 404));
  }

  // Add user data to the req object

  req.product = product;

  next();
});

module.exports = { productExists };
