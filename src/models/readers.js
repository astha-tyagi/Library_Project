const mongoose = require('mongoose');
const readerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    due_date: [{
        type: Date
    }]
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

const Reader = new mongoose.model("Reader", readerSchema);
module.exports = Reader;