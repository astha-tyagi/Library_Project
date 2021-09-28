require('dotenv').config();
const express = require("express")
const app = express();
const path = require("path");
const hbs = require("hbs");
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const auth = require("./middleware/auth");
const email = require("./middleware/mailer");
const mongoose = require("mongoose");
const _ = require("lodash");


require("./db/conn.js");
const User = require("./models/users");
const Reader = require("./models/readers");
const Author = require("./models/authors");
const Book = require("./models/books");
const e = require('express');
// const Book = m[0];
// const Author = m[1];


const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index")
});

//Logout method is removed as it is being handled by the front end
// app.post("/logout", auth, async (req, res) => {
//     try {
//         //console.log(req.user);
//         req.user.tokens = [];
//         res.clearCookie("jwt");
//         //console.log('logged out');
//         await req.user.save();
//         res.send('you have been logged out');
//     }
//     catch (error) {
//         res.status(500).send(error);
//     }
// });


app.get("/confirm/:user/:token", async (req, res) => {
    try {
        let user = req.params.user;
        let token = req.params.token;
        const foundUser = await User.findOne({ username: user });
        if (token === foundUser.confirmationCode) {
            await User.updateOne({ username: user }, { active: 1 });
            res.status(200).send(`${user} is now an active user`);
        }
        else {
            res.send(`Something is wrong!`);
        }
    }
    catch (err) {
        console.log(`theres some error ` + err);
    }
})

app.post("/forgotpassword", async (req, res) => {
    const uemail = req.body.email;
    async function main() {
        let testAccount = await nodemailer.createTestAccount();

        var transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            name: process.env.EMAIL_NAME,
            port: process.env.EMAIL_PORT,
            type: process.env.EMAIL_TYPE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWD
            }
        });

        const resetToken = crypto.randomBytes(20).toString('hex');
        const user = await User.findOneAndUpdate({ email: uemail }, { resetToken: resetToken });

        var email_content = `<h1>Reset Password</h1>
        <h2>Hello there!</h2>
        <p>Reset your password by clicking down below!</p><br>
        <a href=http://localhost:3000/resetpassword/${user.username}/${resetToken}> Click here</a>`;
        let mailOptions = {
            from: process.env.EMAIL_FROM,
            to: uemail,
            subject: "Test Forgot",
            html: email_content,
        }

        transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.log('email could not be sent');
            }
            else {
                console.log('email sent');
            }
        });

    }

    main().catch(console.error);
    res.send(`Please check your email for a link to reset password!`);
})

app.post("/resetpassword/:user/:token", async (req, res) => {
    try {
        let user = (req.params.user);
        let token = (req.params.token);
        const foundUser = await User.findOne({ username: user });
        if (token == foundUser.resetToken) {

            const newpass = req.body.password;
            const cnewpass = req.body.confirmpassword;
            if (newpass == cnewpass) {
                const pass = await bcrypt.hash(newpass, 10);
                await User.findOneAndUpdate({ username: user }, { password: pass, tokens: [] });
                // console.log(res);
                res.status(200).send(`Password updated!`);
            }
            else {
                res.send('Passwords do not match');
            }
        }
        else {
            res.send('Wrong Token');
        }
    }
    catch (err) {
        console.log(`Error: ` + err);
    }
})

// Removing the login method as signin method is used now.
// app.post("/login", async (req, res) => {
//     try {
//         const username = req.body.username;
//         const password = req.body.password;

//         const useremail = await User.findOne({ username: username });
//         if (useremail.active == 1) {
//             // console.log(`password by user is ${password}`);
//             const isMatch = await bcrypt.compare(password, useremail.password);

//             const token1 = await useremail.generateAuthToken();
//             const token = token1[0];
//             console.log(token);
//             const exp_time1 = Number(process.env.EXPIRY_TIME);
//             const exp_time = new Date(Date.now() + exp_time1);
//             if (token != '') {
//                 res.cookie('jwt', token, {
//                     expires: exp_time,
//                     httpOnly: true
//                 });
//             }
//             if (isMatch) {
//                 res.status(201).send(token1[1]);
//             }
//             else {
//                 res.send(`Wrong password`);
//             }
//         }
//         else {
//             res.send(`Please activate the acc first`);
//         }

//     }
//     catch (e) {
//         res.status(400).send("Invalid Username")
//     }
// })
app.post("/signin", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const useremail = await User.findOne({ username: username });
        if (useremail.active) {
            // console.log(`password by user is ${password}`);
            const isMatch = await bcrypt.compare(password, useremail.password);
            // console.log(token);
            if (isMatch) {
                const tokenAndMessage = await useremail.generateAuthToken();
                const token = tokenAndMessage[0];
                const exp_time1 = Number(process.env.EXPIRY_TIME);
                const exp_time = new Date(Date.now() + exp_time1);
                res.setHeader('x-access-token', token)
                res.status(201).send(tokenAndMessage[1]);
            }
            else {
                res.send(`Wrong password`);
            }
        }
        else {
            res.send(`Please activate the acc first`);
        }

    }
    catch (e) {
        res.status(400).send("Invalid Username")
    }
})

app.post("/user", email, async (req, res) => {
    // app.post("/user", async (req, res) => {
    try {
        // const password = req.body.password;
        // const cpassword = req.body.confirmpassword;
        // const emailid = req.body.email;
        // const username = req.body.username;
        console.log('here');
        const { password, cpassword, emailid, username } = req.body;
        if (password === cpassword) {
            const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var confirmationCode = '';
            for (let i = 0; i < 25; i++) {
                confirmationCode += characters[Math.floor(Math.random() * characters.length)];
            }

            var pwd = req.body.password;
            const date = new Date();
            const registerUser = new User({
                username: req.body.username,
                password: pwd,
                confirmpassword: pwd,
                phone: req.body.phone,
                email: req.body.email,
                confirmationCode: confirmationCode
            })
            // console.log(registerUser);

            //remove comments from here
            // async function main() {
            let testAccount = await nodemailer.createTestAccount();

            var transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                name: process.env.EMAIL_NAME,
                port: process.env.EMAIL_PORT,
                type: process.env.EMAIL_TYPE,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWD
                }
            });

            var email_content = `<h1>Email Confirmation</h1>
                <h2>Hello ${username}!</h2>
                <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p><br>
                <a href=http://localhost:3000/confirm/${username}/${confirmationCode}> Click here</a>`;
            let mailOptions = {
                from: process.env.EMAIL_FROM,
                to: emailid,
                subject: "Test Welcome",
                html: email_content,
            }

            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log('email could not be sent');
                }
                else {
                    console.log('email sent');
                }
            });

            // }

            // main().catch(console.error);
            //email trial ends

            //remove comments till here


            const registered = await registerUser.save();
            res.status(201).send(`User Created Successfully!
            Please activate account using link received in your inbox!`);
        } else {
            res.send("Passwords do not match");
        }
    }
    catch (error) {
        res.status(400).send(error);
    }
})

app.post("/addauthor", async (req, res) => {
    try {
        const name = req.body.name;
        const newAuthor = new Author({
            name: name
        })
        await newAuthor.save();
        res.status(201).send(`${name} has been added to list!`);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        res.status(400).send(err);
    }
})

app.get("/allauthors", async (req, res) => {
    try {
        const allAuthors = await Author.find();
        res.status(200).send(allAuthors);
        console.log(allAuthors);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        res.status(400).send(err);
    }
})

app.post("/addbook", async (req, res) => {
    try {

        const bookName = req.body.book;
        const author = req.body.author_id;

        const newBook = new Book({
            bookName: bookName,
            author_id: author
        })

        await newBook.save();

        res.status(201).send(`${bookName} has been added!`);
    }
    catch (error) {
        res.status(400).send(error);
        console.log(`Error: ${error}`);
    }
})

app.get("/allbooks", async (req, res) => {
    try {
        const allBooks = await Book.find()
            .populate('author_id')
            .exec();
        // console.log(allBooks);
        res.status(200).send(allBooks);
    }
    catch (err) {
        res.status(400).send(err);
        console.log(`Error: ${err}`);
    }
})

app.post("/searchbooks", async (req, res) => {
    try {
        const book = req.body.book;
        const author = req.body.author;
        // console.log(author);
        if (!_.isUndefined(book)) {

            //populate- mongoose method starts
            // const resAuthor = await Book
            //     .findOne({ bookName: book })
            //     .select({ author_id: 1, _id: 0 })
            //     .populate('author_id', 'name')
            //     .exec();
            // // console.log(resAuthor.author_id);
            // var authorOfBook = "";
            // let i = 0, count = (resAuthor.author_id).length;
            // for (i; i < count; i++) {
            //     authorOfBook = authorOfBook + ", " + (((resAuthor.author_id).pop()).name);
            // }
            // authorOfBook = authorOfBook.substr(1);
            //populate- mongoose method ends

            //$lookup- mongo method starts
            const resAuthor = await Book.aggregate([
                { $match: { bookName: { $regex: new RegExp(book) } } },
                {
                    $lookup:
                    {
                        from: "authors",
                        localField: "author_id",
                        foreignField: "_id",
                        as: "author_details"
                    }
                },
                { $project: { author_id: 0 } }
            ]);
            //$lookup- mongo method ends

            res.status(200).send(resAuthor);
        }
        else if (!_.isUndefined(author)) {
            // console.log(author);
            // console.log(new RegExp(author));
            // const exp = "\"+author;

            const authorDetails = await Author.aggregate([
                { $match: { name: { $regex: new RegExp(author) } } },
                { $project: { _id: 1 } }])

            var i = 0, count = _.size(authorDetails), resBook = [];

            for (i = 0; i < count; i++) {
                let authorID = authorDetails.pop();
                resBook[i] = await Book
                    .find({ author_id: authorID })
                    .populate('author_id', 'name')
                    .exec();
            }

            res.status(200).send(resBook);
        }
    }
    catch (err) {
        res.status(400).send(err);
        console.log(`Error: ${err}`);
    }
})

app.patch("/changeAuthorName", async (req, res) => {
    try {
        const { old_name, new_name } = req.body;
        const newDocument = await Author.findOneAndUpdate({ name: old_name }, { name: new_name });
        if (newDocument) {
            res.status(200).send(`Changed`);
        }
    }
    catch (err) {
        console.log(`Error: ${err}`);
        res.status(400).send(err);
    }
})

app.patch("/editBookDetails", async (req, res) => {
    const bookID = req.body.bookID;
    if (!_.isUndefined(req.body.qty)) { var qty = req.body.qty }
    if (!_.isUndefined(req.body.bookName)) { var bookName = req.body.bookName }

    const resBook = await Book.findOneAndUpdate(
        { _id: bookID },
        { bookName, qty }
    );
    res.status(200).send(resBook);
})

app.post("/addReader", async (req, res) => {
    const { name } = req.body;
    const newReader = new Reader({
        name: name
    })
    await newReader.save();
    res.status(200).send(newReader);
})

app.get("/allReaders", async (req, res) => {
    const allReaders = await Reader.find()
        .populate
        ({
            path: 'books',
            populate: {
                path: 'author_id',
                model: 'Author',
                select: 'name'
            }
        })
        .exec();
    // const allReaders = await Reader.aggregate([
    //     {
    //         $lookup:
    //         {
    //             from: "Book",
    //             localField: "books",
    //             foreignField: "_id",
    //             as: "nameOfBook"
    //         }
    //     }
    // ])
    res.status(200).send(allReaders);
})

app.patch("/issueBook", async (req, res) => {
    try {
        const { rid, books } = req.body;
        const noOfBooks = _.size(books);
        let books_arr = [];
        let dueDate_arr = [];
        let dd = new Date(+new Date + 12096e5);

        for (let i = 0; i < noOfBooks; i++) {
            let book = await Book.findOne({ _id: books[i] })
            if (book.qty > 0) {
                books_arr[i] = books[i];
                dueDate_arr[i] = dd;
                await Book.findOneAndUpdate({ _id: book._id }, { $inc: { qty: -1 } });
            }
        }

        if (!_.isUndefined(rid)) {
            const resReader = await Reader.findOneAndUpdate(
                { _id: rid },
                { books: books_arr, due_date: dueDate_arr }
            );
            res.status(200).send(resReader);
        }
    }
    catch (err) {
        console.log(`Error: ${err}`);
        res.status(400).send(err);
    }
})

app.patch("/returnBook", async (req, res) => {
    try {
        var { rid, book } = req.body;
        const resReader1 = await Reader.findOne(
            { _id: rid }
        );

        const books_arr = resReader1.books;
        const due_dates = resReader1.due_date;
        console.log(books_arr);
        for (let i = 0; i < (_.size(book)); i++) {
            // console.log('here1');
            // if (books_arr.includes(book[i])) {
            // console.log('here');
            var book1 = await Book.findOneAndUpdate({ _id: book[i] },
                { $inc: { qty: +1 } });
            // { $inc: { qty: +1 } }, { updatedAt: new Date() });

            books_arr.splice((resReader1.books).indexOf(book[i]), 1);
            due_dates.splice((resReader1.books).indexOf(book[i]), 1);
            // }
            // else {
            //     console.log('Else');
            // }
        }

        const resReader2 = await Reader.findOneAndUpdate({ _id: rid },
            { books: books_arr, due_date: due_dates });

        // console.log(typeof x);
        // for (let i = 0; i < 1; i++) {
        //     let search = new mongoose.Types.ObjectId("614aac58b48bc217d6a477c9");
        //     console.log(search);
        //     console.log(x);
        //     console.log(x.indexOf(search));
        // }
        // db.students.updateOne({ _id: 3 }, [{ $set: { "test3": 98, modified: "$$NOW" } }])
        // var newvalues = { $set: { updatedAt: new Date() } };

        // for (x in resReader) {
        // resReader.updatedAt = new Date();
        // await resReader.save();
        // }
        // cong(._findIndex(x, '6149508ddb93be9fb64f7ca0'));
        // const res = x.filter(bookIndex);

        // console.log(res)

        // function bookIndex(book) {
        //     let book_arr = [];
        //     for (let i = 0; i < count(book); i++) {
        //         if ()
        //             book_arr[i] =
        //     }
        //     return book != '6149508ddb93be9fb64f7ca0';
        // }
        res.status(200).send(resReader2);
    }
    catch (err) {
        console.log(`Error: ${err}`);
        res.status(400).send(err);
    }
})

app.listen(port, () => {
    console.log(`server is running at port ${port}`);
});