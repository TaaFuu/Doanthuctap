const productApi = require('./products.api_router');
const categoryApi = require('./category.api_router');
const userApi = require('./user.api_router');
const cartApi = require('./cart.api_router');
const checkoutApi = require('./checkout.api_router');
const cartMiddlewareApi = require("../../middlewares/api/cart_api.middleware");
const userMiddlewareApi = require("../../middlewares/api/user_api.middleware");
const chatbox = require('./message.api_route');


module.exports = (app) => {
  app.use(cartMiddlewareApi.cartId);
  app.use(userMiddlewareApi.infoUser);
  app.use('/api/products', productApi);
  app.use('/api/categories', categoryApi);
  app.use('/api/user', userApi);
  app.use('/api/cart', cartApi);
  app.use('/api/checkout', checkoutApi);
  app.use('/api/chatbox', chatbox);
};