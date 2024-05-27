const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});

        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {            //Login after Signup, It is very similar to req.logout as it also requires a callback.
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to WanderLust!!");
            res.redirect("/listings");
        })

    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to Wanderlust!, You Logged in Successfully");
    let redirectUrl = res.locals.redirectUrl || "/listings";                //Post-Login Page
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {               //req.logout requires a callback which we will give as 'err'
        if(err){
            return next(err);
        }
        req.flash("success", "You are Logged Out now!");
        res.redirect("/listings");
    })
}