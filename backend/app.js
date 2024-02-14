const express = require("express");
const port = process.env.PORT || "3000";
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

require("./db");
require("./models/User");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./upload/images");
    },
    filename: function (req, file, cb) {
        return cb(null, `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`)
    }
})

const authRoutes = require("./routes/AuthRoutes");
const requiredToken = require("./middlewares/AuthTokenRequired");

const upload = multer({
    storage: storage
});

app.use(bodyParser.json());
app.use(authRoutes);
app.use(express.urlencoded({ extended: false }));

app.get("/", requiredToken, (req, res) => {
    res.send(req.user);
});

app.post("/upload", upload.single("profileImage"), (req, res) => {
    res.json({
        success: true,
        profile_url: `http://localhost:3000/${req.file.fieldname}`
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});