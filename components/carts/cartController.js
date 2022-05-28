// ===== UTILS =====

const { catchAsync } = require('../../utils/catchAsync');
const { AppError } = require('../../utils/appError');

// ===== MODELS =====

const { Cart } = require('../carts/cartModel');
const { Product } = require('../products/productModel');
const { ProductsInCart } = require('../productsInCart/productsInCartModel');
const { Order } = require('../orders/orderModel');

// ===== FUNCTIONS =====

const addProduct = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;

  // Verificar si el carrito existe y si no lo crea
  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: [{ model: ProductsInCart }],
  });

  if (!cart) {
    await Cart.create({ userId: sessionUser.id });
  }

  // Verifica si el producto existe y si la cantidad requerida esta disponible

  const product = await Product.findOne({
    where: { id: productId },
  });

  if (product.quantity < quantity) {
    return next(new AppError('The quantity required is not available'));
  }

  // Verifica si el producto ya esta en el carrito para agregarlo, activarlo o enviar error

  const productInCart = await ProductsInCart.findOne({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (!productInCart) {
    await ProductsInCart.create({
      cartId: cart.id,
      productId,
      quantity,
    });
  } else if (productInCart.status === 'removed') {
    await productInCart.update({ status: 'active' });
  } else {
    return next(new AppError('Product has already been added', 400));
  }

  res.status(201).json({ status: 'success' });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { productId, newQty } = req.body;
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id },
    include: [{ model: ProductsInCart }],
  });

  // Verifica si el producto existe y si la cantidad requerida esta disponible

  const product = await Product.findOne({
    where: { id: productId },
  });

  if (product.quantity < newQty) {
    return next(new AppError('The quantity required is not available'));
  }

  // Update product quantity

  const productInCart = await ProductsInCart.findOne({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (newQty === 0) {
    await productInCart.update({ quantity: 0, status: 'removed' });
  } else {
    await productInCart.update({
      quantity: productInCart.quantity + newQty,
      status: 'active',
    });
  }

  res.status(201).json({ status: 'success' });
});

const deleteProductInCart = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id },
  });

  const productInCart = await ProductsInCart.findOne({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  await productInCart.update({ quantity: 0, status: 'removed' });

  res.status(200).json({ status: 'success' });
});

const purchase = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!cart) {
    return next('Cart not found', 400);
  }

  const productsInCart = await ProductsInCart.findAll({
    where: {
      cartId: cart.id,
      status: 'active',
    },
    include: {
      model: Product,
      attributes: ['price'],
    },
  });

  if (!productsInCart) {
    return next(new AppError('Cart is empty', 400));
  }

  // Update products stock

  for (let i = 0; i < productsInCart.length; i++) {
    await Product.decrement(
      { quantity: productsInCart[i].quantity },
      { where: { id: productsInCart[i].productId } }
    );
  }

  // Create order

  /*   const totalPrice = async () => {
    let total = 0;
    for (let i = 0; i < productsInCart.length; i++) {
      total +=
        productsInCart[i].quantity *
        (await Product.findOne({ where: { id: productsInCart[i].productId } }))
          .price;
    }

    return total;
  }; 

  console.log(await totalPrice()); */

  let totalPrice = 0;
  const calculateTotalPrice = () => {
    for (let i = 0; i < productsInCart.length; i++) {
      totalPrice +=
        productsInCart[i].quantity * productsInCart[i].product.price;
    }

    //return totalPrice;
  };

  calculateTotalPrice();

  for (let i = 0; i < productsInCart.length; i++) {
    productsInCart[i].update({ status: 'purchased' });
  }

  cart.update({ status: 'purchased' });

  await Order.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
  });

  res.status(201).json({ productsInCart });
});

module.exports = { addProduct, updateProduct, deleteProductInCart, purchase };
