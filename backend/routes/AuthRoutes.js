const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

require("dotenv").config();

async function mailer(recieverMail, code) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "mursaleenansari085@gmail.com",
            pass: "yvkxirpakwgaylxy",
        }
    });
    let info = await transporter.sendMail({
        from: "mursaleenansari085@gmail.com",
        to: `${recieverMail}`,
        subject: "Signup Verification",
        text: `Your Verification Code is ${code}`,
        html: `<b>Your Verification Code is ${code}</b>`,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

router.post("/signup", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const user = new User({ name, email, password, confirmPassword });
    try {
        await user.save();
        const token = jsonwebtoken.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.send({ message: "User Registered Successfully", token });
    } catch (error) {
        console.log(error);
    }
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }
    const savedUser = await User.findOne({ email: email });
    if (!savedUser) {
        return res.status(422).json({ error: "Invalid Credentials" });
    }
    try {
        bcrypt.compare(password, savedUser.password, (error, result) => {
            if (result) {
                console.log("Password matched");
                const token = jsonwebtoken.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
                res.send({ token });
            }
            else {
                console.log("Password does not match");
                return res.status(422).json({ error: "Invalid Credentials" });
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});

router.post("/verify", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }
    User.findOne({ email: email }).then(async (savedUser) => {
        if (!savedUser) {
            return res.status(422).json({ error: "Invalid Credentials" });
        }
        try {
            let verificationCode = Math.floor(100000 + Math.random() * 900000);
            let user = [{ name, email, password, verificationCode }]
            await mailer(email, verificationCode);
            res.send({ message: "Verification Code Sent to your Email", userdata: user });
        }
        catch (error) {
            console.log(error);
        }
    });
});


module.exports = router;