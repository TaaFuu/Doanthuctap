module.exports.generateRandomString = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let kq = "";
    for (let i = 0; i < length; i++) {
        kq += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return kq;
}


module.exports.generateRandomNumber = (length) => {
    const characters = "0123456789";

    let kq = "";
    for (let i = 0; i < length; i++) {
        kq += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return kq;
}

