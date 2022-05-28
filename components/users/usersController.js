const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// ===== UTILS =====

const { catchAsync } = require('../../utils/catchAsync');
const { AppError } = require('../../utils/appError');

// ===== MODELS =====

const { User } = require('./userModel');
const { Cart } = require('../carts/cartModel');
const { ProductsInCart } = require('../productsInCart/productsInCartModel');
const { Product } = require('../products/productModel');
const { Order } = require('../orders/orderModel');

// ===== FUNCTIONS =====
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    include: [{ model: Cart, include: { model: ProductsInCart } }],
  });

  res.status(200).json({ users });
});

const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
  });

  newUser.password = undefined;

  res.status(201).json({ newUser });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email, status: 'active' } });

  if (!user) {
    return next(new AppError('Email or password invalid', 400));
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return next(new AppError('Email or password invalid', 400));
  }

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_INT,
  });

  user.password = undefined;

  res.status(200).json({ user, token });
});

const getUserProducts = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const userProducts = await Product.findAll({
    where: { userId: sessionUser.id },
  });

  res.status(200).json({ userProducts });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { name, email } = req.body;

  await user.update({ name, email });

  res.status(200).json({ status: 'success' });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'disabled' });

  res.status(200).json({ status: 'success' });
});

const getUserOrders = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const orders = await Order.findAll({
    where: { userId: sessionUser.id },
    include: [
      {
        model: Cart,
        include: { model: ProductsInCart, where: { status: 'purchased' } },
      },
    ],
  });

  res.status(200).json({ orders });
});

const getUserOrderById = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { orderId } = req.params;

  const order = await Order.findOne({
    where: { userId: sessionUser.id, id: orderId },
    include: [
      {
        model: Cart,
        include: { model: ProductsInCart, where: { status: 'purchased' } },
      },
    ],
  });

  if (!order) {
    return next(new AppError('Order not found', 400));
  }

  res.status(200).json({ order });
});

module.exports = {
  getAllUsers,
  createUser,
  login,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserOrderById,
};
