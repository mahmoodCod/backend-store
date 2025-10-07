const express = require('express');
const path = require('path');
const { setHeaders } = require('./middlewares/headers');
const authRouter = require('./routes/v1/auth');
const usersRouter = require('./routes/v1/user');
const sellersRouter = require('./routes/v1/seller');
const locationsRouter = require('./routes/v1/location');
const categoriesRouter = require('./routes/v1/category');
const productsRouter = require('./routes/v1/product');
const notesRouter = require('./routes/v1/note');
const { redirectToProduct }  = require('./controller/v1/shortLink');
const sellerRequestRouter = require('./routes/v1/sellerRequest');
const { errorHandler } = require('./middlewares/errorHandler');
const commentRouter = require('./routes/v1/comment');
const cartRouter = require('./routes/v1/cart');
const orderRouter = require('./routes/v1/order');
const checkoutRouter = require('./routes/v1/checkout');
const apiDocRouter = require('./routes/v1/apidoc');

const app = express();
app.use(express.static(path.join(__dirname, "public"))); // برای فایل های public 
app.use(express.urlencoded({limits: '30mb' ,extended: true})); // برای فایل های اپلودی
app.use(express.json({ limits: '30mb' }));
app.use(setHeaders);

//* Router
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/sellers', sellersRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/notes', notesRouter);
app.use('/p/:shortIdentifire', redirectToProduct);
app.use('/api/v1/seller-request', sellerRequestRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/checkout', checkoutRouter);
app.use('/apis', apiDocRouter);


app.use((req,res) => {
    console.log('This path is not found :', req.path);

    return res.status(404).json({
        message: "404! path not found.please double check the path / method"
    });
});

app.use(errorHandler);

module.exports = app;