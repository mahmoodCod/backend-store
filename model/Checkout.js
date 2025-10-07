const mongoose = require('mongoose');

const checkoutItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    priceAtTimeOfPurchase: {
        type: Number,
        required: true,
    },
});

const checkoutShcema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [checkoutItemSchema],
    shippingAddress: {
        postalCode: {
            type: String,
            required: true
        },
        location: {
            lat: {
                type: String,
                required: true
            },
            lng: {
                type: String,
                required: true
            },
        },
        address: {
            type: String,
            required: true
        },
        cityId: {
            type: Number,
            required: true
        },
    },
    authority: {
        type: String,
        unique: true,
        required: true
    },
    expiersAt: {
        //   TTL => Time To Live
        type: Date,
        required: true,
        default: () => Date.now() + 5 * 1000,
    },
}, { timestamps: true });

checkoutShcema.index({ expiersAt: 1 }, { expireAfterSeconds: 0 });

checkoutShcema.virtual("totalPrice").get(function() {
    return this.items.reduce((total,item) => {
        return total + item.priceAtTimeOfPurchase * item.quantity;
    }, 0);
});

const model = mongoose.model('Checkout', checkoutShcema);

module.exports = model;