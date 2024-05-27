if (process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, "public")));

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()                     
.then(() => {
  console.log("Connected to DB"); 
})
.catch((err) => {
  console.log(err)
});

async function main() {          
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {                 //Important
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

// app.get("/", (req, res) => {
//     res.send("Hi, I am Root.");
// })


app.use(session(sessionOptions));       //Important
app.use(flash());                       //Important - FLash must written before All Routes

//Configuring Strategy
app.use(passport.initialize());         //Important
app.use(passport.session());            //Important
passport.use(new LocalStrategy(User.authenticate()));   //Important
passport.serializeUser(User.serializeUser());           //Important
passport.deserializeUser(User.deserializeUser());       //Important


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;         //For accessing the req.user in the ejs forms.
    // console.log(res.locals.success);
    next();
})

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     })

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

//All Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     })

//     await sampleListing.save();
//     console.log("Sample was saved.");
//     res.send("Successful Testing");
// })

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next) => {
    let{statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("Error.ejs", {err});
    // res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("Listening on port 8080");
})