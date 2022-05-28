const express = require('express');
const router = express.Router();

// ===== MIDDLEWARES =====

const { productExists } = require('./productsMiddlewares');

// ===== CONTROLLERS =====

const {
  protectToken,
  protectAccountOwner,
  userExists,
} = require('../users/usersMiddlewares');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('./productsController');

// ===== HTTP REQUEST =====

router.get('/', getAllProducts);
router.get('/:productId', productExists, getProductById);

// ----- APPLY PROTECT TOKEN MIDDLEWARE -----

router.use(protectToken);

router.route('/').post(createProduct);
router
  .route('/:productId')
  .patch(productExists, updateProduct)
  .delete(productExists, deleteProduct);

module.exports = { productsRouter: router };
