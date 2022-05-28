const express = require('express');
const cors = require('cors');

// ===== CONTROLLERS =====

const { globalErrorHandler } = require('./utils/globalErrorHandler');

// ===== INIT EXPRESS APP =====

const app = express();

// ===== ENABLE CORS =====

app.use(cors());

// ===== ENABLE INCOMING JSON DATA =====

app.use(express.json());

// ===== ROUTERS =====

const { usersRouter } = require('./components/users/users.Routes');
const { productsRouter } = require('./components/products/products.Routes');
const { cartRouter } = require('./components/carts/cart.Routes');

// ===== ENDPOINTS =====

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartRouter);

// ===== GLOBAL ERROR HANDLER

app.use('*', globalErrorHandler);

module.exports = { app };
