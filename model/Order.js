const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtTimeOfAdding: {
        type: Number,
        required: true
    },
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        postalCode: {
            type: String,
            required: true
        },
        coordinates: {
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
    postTrackingCode: {
        type: String
    },
    status: {
        type: String,
        enum: ["PROCESSING", "SIPPED", "DELIVERED"],
        default: "PROCESSING",
    },
    authority: {
        type: String,
        unique: true,
        required: true
    },
}, { timestamps: true });

orderSchema.virtual("totalPrice").get(function() {
    return this.items.reduce((total,item) => {
        return total + item.priceAtTimeOfAdding * item.quantity;
    }, 0);
});

const model = mongoose.model('Order', orderSchema);

module.exports = model;