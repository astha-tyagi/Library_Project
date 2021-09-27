const jwt = require("jsonwebtoken");

const User = require("../models/users");

const auth = async (req, res, next) => {
    try {
        // const token = req.cookies.jwt;
        const token = req.headers["x-access-token"];
        const decodedToken = jwt.decode(token);
        console.log(decodedToken.exp);

        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        // console.log(expiresIn);

        const user = await User.findOne({ _id: verifyUser._id })
        // console.log(user.username);

        req.token = token;
        req.user = user;

        next();

    }
    catch (e) {
        res.status(401).send(e);
    }
}


module.exports = auth;