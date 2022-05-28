const express = require('express');
const router = express.Router();

// ===== MIDDLEWARES =====

const { productExists } = require('../products/productsMiddlewares');
const { protectToken } = require('../users/usersMiddlewares');

// ===== CONTROLLERS =====

const {
  addProduct,
  updateProduct,
  deleteProductInCart,
  purchase,
} = require('./cartController');

// ===== HTTP REQUEST =====

// ----- APPLY PROTECT TOKEN MIDDLEWARE -----

router.use(protectToken);

router.post('/add-product', addProduct);
router.patch('/update-cart', updateProduct);
router.delete('/:productId', deleteProductInCart);
router.post('/purchase', purchase);

module.exports = { cartRouter: router };
