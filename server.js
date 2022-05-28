const { app } = require('./app');

// ===== MODELS =====

const { Cart } = require('./components/carts/cartModel');
const { Order } = require('./components/orders/orderModel');
const { Product } = require('./components/products/productModel');
const {
  ProductsInCart,
} = require('./components/productsInCart/productsInCartModel');
const { User } = require('./components/users/userModel');
const { Category } = require('./components/categories/categoryModel');
const { ProductImg } = require('./components/productImgs/productImgModel');

// ===== UTILS =====

const { db } = require('./utils/database');

// ===== DATABASE CONECCTION

db.authenticate()
  .then(() => console.log('Database authenticate :)'))
  .catch((err) => console.log(err));

db.sync()
  .then(() => console.log('Database synced :)'))
  .catch((err) => console.log(err));

// ===== ESTABLISH MODELS RELATIONS =====

User.hasOne(Cart);
Cart.belongsTo(User);

User.hasMany(Product);
Product.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

Cart.hasMany(ProductsInCart);
ProductsInCart.belongsTo(Cart);

Product.hasOne(ProductsInCart);
ProductsInCart.belongsTo(Product);

Product.hasMany(ProductImg);
ProductImg.belongsTo(Product);

Cart.hasOne(Order);
Order.belongsTo(Cart);

Product.hasMany(Category);
Category.belongsTo(Product);

// ===== SPIN UP SERVER =====

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express app running on port: ${PORT}! :)`);
});
