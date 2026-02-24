/**
 * Created by CTT VNPAY
 */



let express = require('express');
let router = express.Router();

const moment = require('moment');
const mongoose = require('mongoose');
const Product = require('../../models/models.products');
const Carts = require('../../models/models.carts');


router.get('/', function (req, res, next) {
    res.render('orderlist', { title: 'Danh sách đơn hàng' })
});

router.get('/create_payment_url', function (req, res, next) {
    res.render('order', { title: 'Tạo mới đơn hàng', amount: 10000 })
});

router.get('/querydr', function (req, res, next) {

    let desc = 'truy van ket qua thanh toan';
    res.render('querydr', { title: 'Truy vấn kết quả thanh toán' })
});

router.get('/refund', function (req, res, next) {

    let desc = 'Hoan tien GD thanh toan';
    res.render('refund', { title: 'Hoàn tiền giao dịch thanh toán' })
});

router.post('/test', (req, res) => {
    console.log('[TEST] Handler called');
    res.json({ message: 'Test endpoint works' });
});

router.post('/create_payment_url', async function (req, res, next) {
    try {
        console.log('[create_payment_url] START - req.body:', JSON.stringify(req.body));

        // Validate required fields
        const { amount, user_id, language, userInfo } = req.body;
        console.log('[create_payment_url] userInfo from client:', userInfo);
        if (!amount || !user_id) {
            return res.status(400).json({ message: 'Thiếu amount hoặc user_id' });
        }

        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');

        // Get IP address safely
        let ipAddr = (req.headers['x-forwarded-for'] || '').split(',')[0] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            '127.0.0.1';

        let config = require('config');
        let tmnCode = config.get('vnp_TmnCode');
        let secretKey = config.get('vnp_HashSecret');
        let vnpUrl = config.get('vnp_Url');
        let returnUrl = config.get('vnp_ReturnUrl');

        // Create VNPAY parameters
        let orderId = moment(date).format('DDHHmmss');
        let locale = language || 'vn';
        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': locale,
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': 'Thanh toan cho ma GD:' + orderId,
            'vnp_OrderType': 'other',
            'vnp_Amount': Math.round(amount * 100),
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate
        };

        if (req.body.bankCode) {
            vnp_Params['vnp_BankCode'] = req.body.bankCode;
        }

        // Fetch cart from database
        console.log('[create_payment_url] Fetching cart for user_id:', user_id);
        const cart = await Carts.findOne({ user_id: user_id });

        if (!cart || !cart.products || cart.products.length === 0) {
            console.log('[create_payment_url] Cart not found or empty for user_id:', user_id);
            return res.status(400).json({ message: 'Giỏ hàng trống hoặc không tồn tại' });
        }

        console.log('[create_payment_url] Cart found with', cart.products.length, 'items');

        // Fetch product details and compute total
        const itemsDetailed = await Promise.all(cart.products.map(async (item) => {
            const prod = await Product.findById(item.product_id).lean();
            return {
                product_id: item.product_id,
                name: prod ? (prod.title || prod.name) : 'Unknown',
                price: prod ? (prod.price || 0) : 0,
                quantity: item.quantity
            };
        }));

        const totalAmount = itemsDetailed.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        console.log('[create_payment_url] Total amount calculated:', totalAmount);

        // Create order record using unified schema (match COD fields)
        // products: [{ product_id, price, quantity }]
        const products = itemsDetailed.map(it => ({
            product_id: it.product_id,
            price: it.price,
            quantity: it.quantity
        }));

        // Build userInfo to store with order: prefer client-sent values but ensure user_id present
        const finalUserInfo = {
            user_id: cart.user_id,
            fullName: (userInfo && userInfo.fullName) || '',
            phone: (userInfo && userInfo.phone) || '',
            address: (userInfo && userInfo.address) || '',
            email: (userInfo && userInfo.email) || ''
        };

        const newOrder = {
            user_id: cart.user_id,
            cart_id: cart._id,
            userInfo: finalUserInfo,
            products: products,
            discountPercentage: cart.discountPercentage || 0,
            totalPrice: totalAmount,
            paymentMethod: 'vnpay',
            paymentStatus: 'pending', // pending | paid | failed
            status: 0, // 0 = pending, 1 = paid/processing, 2 = failed/cancelled
            created_at: new Date()
        };

        const result = await mongoose.connection.collection('orders').insertOne(newOrder);
        console.log('[create_payment_url] Order inserted with id:', result.insertedId, ' userInfo:', finalUserInfo);

        // Update transaction reference with order ID
        vnp_Params['vnp_TxnRef'] = String(result.insertedId);
        vnp_Params = sortObject(vnp_Params);

        // Generate secure hash
        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require('crypto');
        let hmac = crypto.createHmac('sha512', secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        console.log('[create_payment_url] Payment URL generated successfully');
        return res.json({ paymentUrl: vnpUrl });

    } catch (err) {
        console.error('[create_payment_url] ERROR:', err.message);
        console.error('[create_payment_url] Stack:', err.stack);
        return res.status(500).json({
            message: 'Lỗi server khi tạo đường dẫn thanh toán',
            error: err.message
        });
    }
});

router.get('/vnpay_return', async function (req, res, next) {
    let vnp_Params = req.query;
    console.log('[vnpay_return] received query:', vnp_Params);

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let config = require('config');
    let tmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    try {
        if (secureHash === signed) {
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

            // Cap nhat lai status của order
            const orderId = req.query.vnp_TxnRef;
            try {
                const oid = new mongoose.Types.ObjectId(orderId);

                const order = await mongoose.connection.collection('orders').findOne({ _id: oid });

                if (order) {
                    // If order not yet paid, deduct stock for each product
                    try {
                        if (order.paymentStatus !== 'paid') {
                            if (order.products && Array.isArray(order.products)) {
                                for (const p of order.products) {
                                    const pid = p.product_id;
                                    const qty = Number(p.quantity || 0);
                                    let pidObj = pid;
                                    try { pidObj = new mongoose.Types.ObjectId(pid); } catch (e) { /* keep as-is */ }
                                    try {
                                        const updateRes = await Product.updateOne({ _id: pidObj }, { $inc: { stock: -qty } });
                                        console.log('[vnpay_return] Deduct stock:', pid, 'qty:', qty, 'update:', updateRes && (updateRes.modifiedCount || updateRes.nModified || JSON.stringify(updateRes)));
                                    } catch (updErr) {
                                        console.error('[vnpay_return] Error updating stock for product', pid, updErr && updErr.message);
                                    }
                                }
                            }
                        } else {
                            console.log('[vnpay_return] Order already paid; skipping stock deduction for order', orderId);
                        }
                    } catch (err) {
                        console.error('[vnpay_return] Error during stock deduction:', err && err.message);
                    }

                    // chuyển trạng thái đơn hàng thành paid khi mã của VNPAY báo thành công
                    const vnpResponseCode = vnp_Params['vnp_ResponseCode'] || req.query.vnp_ResponseCode;
                    if (vnpResponseCode === '00') {
                        await mongoose.connection.collection('orders').updateOne(
                            { _id: oid },
                            { $set: { status: 1, paymentStatus: 'paid', paymentMethod: 'vnpay' } }
                        );

                        // Xóa dữ liệu giỏ hàng
                        const user_id = order.user_id;
                        await mongoose.connection.collection('carts').deleteOne({ user_id: user_id });
                        console.log('[vnpay_return] order updated to paid and cart deleted for user_id:', user_id);
                    } else {
                        console.log('[vnpay_return] vnp_ResponseCode is not success:', vnpResponseCode, ' — not updating order to paid');
                    }
                } else {
                    console.warn('[vnpay_return] order not found for _id:', orderId);
                }
            } catch (innerErr) {
                console.error('[vnpay_return] invalid order id or DB error:', innerErr.message);
            }
        } else {
            console.warn('[vnpay_return] secure hash mismatch');
        }
    } catch (err) {
        console.error('[vnpay_return] unexpected error:', err.stack || err.message);
    }

    // chuyển hướng về frontend với toàn bộ query string nguyên vẹn
    try {
        let frontendBase = null;
        try {
            frontendBase = config.get('frontend_ReturnUrl');
        } catch (e) {
        }
        frontendBase = frontendBase || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
        const redirectUrl = frontendBase.replace(/\/$/, '') + '/vnpay_return?' + querystring.stringify(vnp_Params, { encode: false });
        console.log('[vnpay_return] redirecting to frontend:', redirectUrl);
        res.redirect(redirectUrl);
    } catch (err) {
        console.error('[vnpay_return] redirect error:', err && err.message);
        // Last-resort: fall back to previous localhost:3005 redirect so something happens
        res.redirect('http://localhost:3005/vnpay_return?' + querystring.stringify(vnp_Params, { encode: false }));
    }
});

router.get('/vnpay_ipn', async function (req, res, next) {
    console.log('vnpay_ipn');
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let config = require('config');
    let secretKey = config.get('vnp_HashSecret');
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL 
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL 
    if (secureHash === signed) { // kiểm tra checksum
        if (checkOrderId) {
            if (checkAmount) {
                if (paymentStatus == "0") { // kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                    try {
                        const oid = new mongoose.Types.ObjectId(orderId);
                        // Fetch order to inspect current paymentStatus and products
                        const order = await mongoose.connection.collection('orders').findOne({ _id: oid });
                        if (!order) {
                            console.error('[vnpay_ipn] Order not found for _id:', orderId);
                            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
                        }

                        if (rspCode == "00") {
                            // success: deduct stock only if not already paid
                            try {
                                if (order.paymentStatus !== 'paid') {
                                    if (order.products && Array.isArray(order.products)) {
                                        for (const p of order.products) {
                                            const pid = p.product_id;
                                            const qty = Number(p.quantity || 0);
                                            let pidObj = pid;
                                            try { pidObj = new mongoose.Types.ObjectId(pid); } catch (e) { /* keep as-is */ }
                                            try {
                                                const updateRes = await Product.updateOne({ _id: pidObj }, { $inc: { stock: -qty } });
                                                console.log('[vnpay_ipn] Deduct stock:', pid, 'qty:', qty, 'update:', updateRes && (updateRes.modifiedCount || updateRes.nModified || JSON.stringify(updateRes)));
                                            } catch (updErr) {
                                                console.error('[vnpay_ipn] Error updating stock for product', pid, updErr && updErr.message);
                                            }
                                        }
                                    }
                                } else {
                                    console.log('[vnpay_ipn] Order already paid; skipping stock deduction for order', orderId);
                                }
                            } catch (err) {
                                console.error('[vnpay_ipn] Error during stock deduction:', err && err.message);
                            }

                            // update order payment status
                            await mongoose.connection.collection('orders').updateOne(
                                { _id: oid },
                                { $set: { paymentStatus: 'paid', status: 1, paymentMethod: 'vnpay' } }
                            );
                            res.status(200).json({ RspCode: '00', Message: 'Success' });
                        }
                        else {
                            // failed
                            await mongoose.connection.collection('orders').updateOne(
                                { _id: oid },
                                { $set: { paymentStatus: 'failed', status: 2, paymentMethod: 'vnpay' } }
                            );
                            res.status(200).json({ RspCode: '00', Message: 'Success' });
                        }
                    } catch (dbErr) {
                        console.error('[vnpay_ipn] DB update error:', dbErr.message);
                        res.status(200).json({ RspCode: '01', Message: 'Order not found or invalid id' });
                    }
                }
                else {
                    res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
                }
            }
            else {
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
            }
        }
        else {
            res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
    }
    else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
});

router.post('/querydr', async function (req, res, next) {

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let config = require('config');
    let crypto = require("crypto");

    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;

    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'querydr';
    let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;

    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let currCode = 'VND';
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;

    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest("hex");

    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };
    // /merchant_webapi/api/transaction
    try {
        const resp = await fetch(vnp_Api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });
        const respBody = await resp.text();
        console.log('VNPAY querydr response:', resp.status, respBody);
        // forward the response body to caller
        res.status(resp.status).send(respBody);
    } catch (err) {
        console.error('Error calling VNPAY querydr API:', err);
        res.status(500).json({ error: 'VNPAY request failed' });
    }

});

router.post('/refund', async function (req, res, next) {

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let config = require('config');
    let crypto = require("crypto");

    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    let vnp_Amount = req.body.amount * 100;
    let vnp_TransactionType = req.body.transType;
    let vnp_CreateBy = req.body.user;

    let currCode = 'VND';

    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'refund';
    let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;


    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    let vnp_TransactionNo = '0';

    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest("hex");

    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TransactionType': vnp_TransactionType,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_Amount': vnp_Amount,
        'vnp_TransactionNo': vnp_TransactionNo,
        'vnp_CreateBy': vnp_CreateBy,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };

    try {
        const resp = await fetch(vnp_Api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });
        const respBody = await resp.text();
        console.log('VNPAY refund response:', resp.status, respBody);
        res.status(resp.status).send(respBody);
    } catch (err) {
        console.error('Error calling VNPAY refund API:', err);
        res.status(500).json({ error: 'VNPAY refund request failed' });
    }

});

// API: get order by id (used by frontend after VNPAY redirect to confirm status)
router.get('/get/:id', async function (req, res, next) {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: 'Missing id' });
        let oid;
        try {
            oid = new mongoose.Types.ObjectId(id);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid order id' });
        }
        const order = await mongoose.connection.collection('orders').findOne({ _id: oid });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        return res.json(order);
    } catch (err) {
        console.error('[order.get] error:', err && err.message);
        return res.status(500).json({ message: 'Server error', error: err && err.message });
    }
});

function sortObject(obj) {
    obj = JSON.parse(JSON.stringify(obj));
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    });
    return sorted;
}


module.exports = router;