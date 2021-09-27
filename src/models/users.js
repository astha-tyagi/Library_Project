const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            //required: true
        },
        // confirmpassword: {
        //     type: String,
        //     required: true
        // },
        phone: {
            type: Number,
            required: true,
            unique: true,
            match: '^[6-9]\d{9}$'
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        active: {
            type: Boolean,
            default: 0
        },
        confirmationCode: {
            type: String,
            required: true,
        },
        resetToken: {
            type: String
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        tokens: [{
            token: {
                type: String,
                required: true,
            }
        }]

    }
)
userSchema.methods.generateAuthToken = async function () {
    try {
        var len = (this.tokens.length);
        var flag = (len == 0) ? 0 : 1;
        len--;

        //flag is set if length is not zero, i.e. if user is already logged in
        //console.log(`Flag is ${flag} and tokens is ${this.tokens}`);
        if (flag) {
            var tokenToDecode = this.tokens[len].token;
            const decodedToken = jwt.decode(tokenToDecode);
            var iat = Number(decodedToken.iat.toString());
            const cur_dt = Date.now().toString();
            // console.log(cur_dt);
            iat = iat * 1000;
            // console.log(iat);
            var diff = cur_dt - iat;
        }
        else {
            diff = 0;
        }
        //To check if the user is logged in already or not
        if ((diff == 0) || (diff >= process.env.EXPIRY_TIME)) {
            const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY, {
                expiresIn: process.env.EXPIRY_TIME // 
            });
            this.tokens = this.tokens.concat({ token: token });
            await this.save();
            var msg = "Logged in Successfully";
            return [token, msg];
        }
        else if (diff < process.env.EXPIRY_TIME) {
            var msg = "You are already logged in";
            return ['', msg];
        }


        // if (Date.now() >= (iat * 1000)) {
        //     console.log(Date.now());
        //     console.log(iat * 1000);
        //     console.log(`Hey! You're already logged in`);
        // }
        // else {
        //     const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        //     this.tokens = this.tokens.concat({ token: token });
        //     await this.save();
        //     return token;
        // }

        // const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        // this.tokens = this.tokens.concat({ token: token });
        // await this.save();
        // return token;
    }
    catch (error) {
        res.send('the error is ' + error);
    }
}

userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})
//pre matlab save ko call karne se pehle

const User = new mongoose.model("User", userSchema);
module.exports = User;