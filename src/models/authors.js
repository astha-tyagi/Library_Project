const mongoose = require("mongoose");
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
    // ,
    // createdAt: {
    //     type: Date,
    //     required: true,
    //     default: Date.now
    // },
    // updatedAt: {
    //     type: Date,
    //     required: true,
    //     default: Date.now
    // }
}, { timestamps: {} })

const Author = new mongoose.model("Author", authorSchema);
module.exports = Author;