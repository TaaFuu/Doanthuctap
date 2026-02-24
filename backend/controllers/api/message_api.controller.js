const UserChatbox = require('../../models/models.userchatbox');
const Bot = require('../../models/models.bot');


exports.message = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Text cannot be empty" });
        }

        const user = await UserChatbox.create({
            sender: "user",
            text: text.trim()
        });

        const botResponses = {

            // ===== LỜI CHÀO CHUYÊN NGHIỆP =====
            "xin chào": "Dạ em xin chào anh/chị! Em có thể hỗ trợ mình xem điện thoại Apple, Samsung, Xiaomi hay Oppo ạ?",
            "chào": "Em chào anh/chị! Mình đang muốn tìm mẫu điện thoại nào để em tư vấn ạ?",
            "hello": "Xin chào anh/chị! Em sẵn sàng hỗ trợ tìm sản phẩm phù hợp nhất cho mình ạ!",
            "hi": "Chào anh/chị! Anh/chị đang quan tâm dòng máy nào để em giới thiệu chi tiết ạ?",

            // ===== LỜI TẠM BIỆT CHUYÊN NGHIỆP =====
            "tạm biệt": "Dạ em cảm ơn anh/chị đã ghé shop! Nếu cần hỗ trợ thêm anh/chị cứ nhắn cho em ạ. Chúc anh/chị 1 ngày thật vui!",
            "bye": "Cảm ơn anh/chị rất nhiều! Khi nào cần tư vấn thêm, em luôn sẵn sàng hỗ trợ ạ!",
            "cảm ơn": "Dạ em cảm ơn anh/chị! Anh/chị muốn xem thêm mẫu nào nữa không ạ?",

            // ===== HỎI SẢN PHẨM THEO HÃNG =====
            "apple có gì?": "Dạ Apple hiện có iPhone 15 Pro, iPhone 17 Pro Max và nhiều mẫu mới ạ. Anh/chị muốn xem mẫu nào?",
            "samsung có gì?": "Samsung đang có Galaxy S24 Ultra, Note 20 và Galaxy A17 5G ạ.",
            "xiaomi có gì?": "Xiaomi mới có Xiaomi 15T 5G pin 5500mAh rất đáng mua ạ.",
            "oppo có gì?": "Oppo có A78, Find X9 với camera cực đẹp đó anh/chị!",

            // ===== HỎI GIÁ =====
            "giá iphone": "Hiện iPhone 15 Pro giá 3.334.445.556 VND, iPhone 17 Pro Max giá 37.990.000 VND ạ.",
            "giá samsung s24 ultra": "Samsung Galaxy S24 Ultra đang có giá khoảng 35.000.000 VND ạ.",
            "giá xiaomi 15t": "Xiaomi 15T 5G có giá 14.490.000 VND anh/chị nha.",
            "giá oppo find x9": "OPPO Find X9 giá 19.990.000 VND, pin lớn, chụp ảnh đẹp ạ.",

            // ===== HỎI TỒN KHO =====
            "apple còn hàng không": "Dạ còn anh/chị nhé! Apple vẫn đang có đủ hàng.",
            "samsung còn hàng không": "Samsung còn hàng ạ, S24 Ultra còn 457 chiếc.",
            "xiaomi còn hàng không": "Xiaomi 15T 5G hiện còn 64 máy anh/chị nhé.",
            "oppo còn hàng không": "Oppo A78 và Find X9 đều còn hàng số lượng lớn ạ.",

            // ===== THÔNG SỐ KỸ THUẬT =====
            "iphone 15 pro": "iPhone 15 Pro: 512GB bộ nhớ, chip mạnh, camera chụp đêm tốt…",
            "oppo find x9": "Find X9: Màn 6.59'', RAM 12GB, ROM 256GB, Camera sau 50MP OIS + 50MP OIS + 50MP + 2MP, Pin 7025mAh.",
            "pin xiaomi 15t": "Xiaomi 15T có pin 5500mAh, dùng rất bền ạ.",

            // ===== SO SÁNH CẤU HÌNH =====
            "so sánh iphone và samsung": "iPhone mạnh về chip, độ ổn định, quay video tốt. Samsung mạnh về camera zoom, pin lớn và màn hình đẹp.",
            "so sánh samsung và xiaomi": "Samsung mạnh về camera – Xiaomi mạnh về pin và giá rẻ.",
            "so sánh iphone và xiaomi": "iPhone mạnh về hiệu năng và độ bền; Xiaomi giá mềm – pin trâu.",
            "so sánh oppo và samsung": "Oppo mạnh về selfie; Samsung mạnh về màn hình và hiệu năng.",

            // ===== GỢI Ý MUA HÀNG =====
            "tôi muốn mua điện thoại": "Anh/chị ưu tiên pin trâu, chụp hình đẹp hay hiệu năng mạnh để em chọn đúng máy ạ?",
            "nên mua hãng nào": "Ổn định thì iPhone; màn đẹp thì Samsung; pin khỏe thì Xiaomi; selfie đẹp thì Oppo ạ!",

            // ===== THÔNG TIN LIÊN HỆ SHOP =====
            "liên hệ shop": "Anh/chị có thể liên hệ qua Hotline: 0901 234 567 hoặc Zalo 0901 234 567 ạ!",
            "shop ở đâu": "Shop tại 18A/1 Cộng Hòa, Phường Tân Sơn Nhất, TP.HCM ạ.",
            "địa chỉ shop": "104 Nguyễn Văn Trỗi, Phường Phú Nhuận, TP.HCM anh/chị nhé!",
            "hotline": "Hotline hỗ trợ 24/7: 0901 234 567.",
            "zalo shop": "Zalo tư vấn nhanh: 0901 234 567.",
            "facebook shop": "Fanpage: facebook.com/shopmobile.",
            "giờ làm việc": "Shop mở cửa 7h–22h mỗi ngày.",
            "tư vấn": "Anh/chị cần tư vấn thì gọi hoặc nhắn Zalo 0901 234 567 ạ.",
            "chăm sóc khách hàng": "CSKH hỗ trợ 24/7 qua Hotline 0901 234 567."
        };

        const normalized = text.toLowerCase().trim();
        const botText = botResponses[normalized] || "Dạ em chưa rõ ý anh/chị ạ ❤️. Anh/chị mô tả giúp em chi tiết hơn để em hỗ trợ đúng nhu cầu nhất nhé!";

        const bot = await Bot.create({
            sender: "bot",
            text: botText
        });

        res.status(200).json({
            userMessage: user,
            botMessage: bot
        });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
