const express = require('express');
const router = express.Router();

// ===== MIDDLEWARES =====

const {
  userExists,
  protectToken,
  protectAccountOwner,
} = require('./usersMiddlewares');
const {
  createUserValidations,
  loginValidations,
  checkValidations,
} = require('./usersValidators');

// ===== CONTROLLERS =====

const {
  getAllUsers,
  createUser,
  login,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserOrderById,
} = require('./usersController');

// ===== HTTP REQUEST =====

router
  .route('/')
  .get(getAllUsers)
  .post(createUserValidations, checkValidations, createUser);
router.post('/login', loginValidations, checkValidations, login);

// ----- APPLY PROTECT TOKEN MIDDLEWARE -----

router.use(protectToken);

router.get('/me', getUserProducts);
router.get('/orders', getUserOrders);
router.get('/orders/:orderId', getUserOrderById);
router
  .route('/:userId')
  .patch(userExists, protectAccountOwner, updateUser)
  .delete(userExists, protectAccountOwner, deleteUser);

module.exports = { usersRouter: router };
