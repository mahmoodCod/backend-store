const { createPayment, verifyPayment } = require("../../services/zarinpal");
const { createCheckoutValidator } = require("../../validators/checkout");
const Checkout = require('../../model/Checkout')
const Cart = require('../../model/Cart');
const Order = require('../../model/Order');
const { errorResponse, successRespons } = require("../../helpers/respanses");
const Product = require("../../model/Product");

exports.createCheckout = async (req,res,next) => {
    try {
        const user = req.user;
        const { shippingAddress } = req.body;

        await createCheckoutValidator.validate(req.body, { abortEarly: false });

        const cart = await Cart.findOne({ user: user._id }).populate('items.product').populate('items.seller');

        if (!cart?.items?.length) {
            return errorResponse(res,400, 'Cart is empty or not found !!');
        };

        const checkoutItems = [];

        for (const item of cart.items) {
            const { product, seller } = item;

            const sellerDetails =  product.sellers.find((sellerInfo) => sellerInfo.seller.toString() === seller._id.toString());

            if (!sellerDetails) {
                return errorResponse(res,400, 'Seller not does sell this product !!');
            };

            checkoutItems.push({
                product: product._id,
                seller: seller._id,
                quantity: item.quantity,
                priceAtTimeOfPurchase: sellerDetails.price,
            });
        };

        const newCheckout = new Checkout({
            user: user._id,
            items: checkoutItems,
            shippingAddress,
        });

        const payment = await createPayment({
            amountInRial: newCheckout.totalPrice,
            description: `سفارش با شناسه ${newCheckout._id}`,
            mobile: '09932916534'
        });
        newCheckout.authority = payment.authority;

        await newCheckout.save();

        return successRespons(res,201, {
            message: 'Checkout created successfully :))',
            checkout: newCheckout,
            paymentUrl: payment.paymentUrl,
        });
    } catch (err) {
        next(err);
    };
};

exports.verifyCheckout = async (req,res,next) => {
    try {
        const { Status, Authority: authority } = req.query;

        const alreadyCreateOrder = await Order.findOne({ authority });
        if(alreadyCreateOrder) {
            return errorResponse(res,400, 'Payment already verified !!');
        };

        const checkout = await Checkout.findOne({ authority });
        if(!checkout) {
            return errorResponse(res,404, 'Checkout not found !!');
        };

        const payment = await verifyPayment({
            authority,
            amountInRial: checkout.totalPrice,
        });

        if (![ 100, 101 ].includes(payment.data.code)) {
            return errorResponse(res,400, 'Payment not verified !!');
        };

        const order = new Order({
            user: checkout.user,
            authority: checkout.authority,
            items: checkout.items,
            shippingAddress: checkout.shippingAddress
        });

        await order.save();

        for (const item of checkout.items) {
            const product = await Product.findById(item.product);

            if (product) {
                const sellerInfo = product.sellers.find((sellerData) => 
                    sellerData.seller.toString() === item.seller.toString()
                );

                sellerInfo.stock -= item.quantity;
                await product.save();
            };
        };

        await Cart.findByIdAndUpdate({ user: checkout.user }, { items: [] });

        await checkout.deleteOne({ _id: checkout._id });

        return successRespons(res,200, {
            message: "Payment verified :))",
            order,
        });
    } catch (err) {
        next(err);
    };
};

