const jsonwebtoken = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");

require("dotenv").config();

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "You must be logged in, token not given" });
    }
    const token = authorization.replace("Bearer ", "");
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (error, payload) => {
        if (error) {
            return res.status(401).json({ error: "You must be logged in, token invalid" });
        }
        const { _id } = payload;
        User.findById(_id).then(userData => {
            req.user = userData;
            next();
        });
    });
}