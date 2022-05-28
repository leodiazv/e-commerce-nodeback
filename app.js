const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

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

// Add security headers

app.use(helmet());

// Compress responses
app.use(compression());

// Log incoming request

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
else app.use(morgan('combined'));

// Limit IP request
const limiter = rateLimit({
  max: 10000,
  windowMs: 1 * 60 * 60 * 1000, // 1 hr
  message: 'Too many requests from this IP',
});

app.use(limiter);

// ===== ENDPOINTS =====

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartRouter);

// ===== GLOBAL ERROR HANDLER

app.use('*', globalErrorHandler);

module.exports = { app };
