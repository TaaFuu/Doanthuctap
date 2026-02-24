const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user_id: String,
        cart_id: String,
        userInfo: {
            fullName: String,
            phone: String,
            address: String,
            email: String
        },
        products: [{
            product_id: String,
            price: Number,
            discountPercentage: Number,
            quantity: Number
        }],
        totalPrice: Number,
        paymentMethod: {
            type: String,
            enum: ["cod"],
            default: "cod"
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending"
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date,
    },
    {
        timestamps: true
    });
const Orders = mongoose.model('Orders', orderSchema, "orders");

module.exports = Orders;