const mongoose = require("mongoose");
const Author = require("./authors");
const booksSchema = new mongoose.Schema(

    {
        bookName: {
            type: String,
            required: true,
            unique: true
        },
        author_id: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author'
        }],
        qty: {
            type: Number,
            default: 10
        },
        pubYear: {
            type: Number
        },
        genre: {
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
        }
    }
)


// booksSchema.pre('save', async function (next) {
//     if (1) {
//         // console.log('here');
//         this.author = ["burraah"];
//     }
//     next();
// })

const Book = new mongoose.model("Book", booksSchema);
module.exports = [Book, Author];
// module.exports = Author;