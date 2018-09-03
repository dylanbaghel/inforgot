//THIRD PARTY MODULES
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const async = require('async');
//CUSTOM MODULES FILES
const { User } = require('./../models/User');
//ROUTES

//GET - /users/register USERS REGISTER FORM
router.get('/register', (req, res) => {
    res.render('users/register');
});

//POST - /users ADD NEW USER
router.post('/', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let password2 = req.body.password2;
    let errors = [];

    if (!name) {
        errors.push({ text: 'Name Field Cannot be empty' });
    }
    if (!email) {
        errors.push({ text: 'Email Field Connot be empty' });
    }
    if (!password || !password2) {
        errors.push({ text: 'Password Field Cannot be empty' });
    } else if (password.length < 6) {
        errors.push({ text: 'Password Length Must be greater than 6' });
    }

    if (password !== password2) {
        errors.push({ text: 'Password do not match' });
    }

    if (errors.length > 0) {
        res.render('users/register', { errors, name, email });
    } else {

        User.findOne({
            email
        }).then((user) => {
            if (user) {
                req.flash('error_msg', 'Email Already Taken');
                res.redirect('/users/register');
            } else {
                let user = new User({
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;

                        user.save().then((user) => {
                            req.flash('success_msg', 'Successfully Created an Account Now Can Log In');
                            res.redirect('/users/login');
                        }).catch((e) => {
                            console.log('err', e);
                        });
                    });
                });

            }
        })

    }
});

//GET - /users/login - SHOW LOGIN FORM
router.get('/login', (req, res) => {
    res.render('users/login');
});

//POST - /users/login - LOGIN USER
router.post('/login', passport.authenticate('local', {
        failureRedirect: '/users/login',
        failureFlash: true
    }), (req, res) => {
        if (req.body.rememberme) {
            req.session.cookie.maxAge = 30*24*60*60*1000;

        } else{
            req.session.cookie.maxAge = 60*60*1000;

        }
        res.redirect('/notes');
    }
);

//GET - /users/logout - LOGOUT USER
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged Out Successfully');
    req.session.destroy((err) => {
        res.redirect('/users/login');
    });
});

//GET - /users/forgot - GET FORGOT PASSWORD FORM
router.get('/forgot', (req, res) => {
    res.render('users/forgot');
});

//POST - /users/forgot - SEND USER AN EMAIL
router.post('/forgot', (req, res, next) => {
    crypto.randomBytes(20, (err, buf) => {
        let rand = buf.toString('hex');

        User.findOne({ email: req.body.email }).then((user) => {
            if (!user) {
                req.flash('error_msg', "No Account Found With This Email");
                return res.redirect('/users/forgot');
            }

            user.passwordResetToken = rand;
            user.passwordResetExpires = Date.now() + 60*60*1000;

            user.save().then((user) => {
                
            });

            let transport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                service: 'Gmail',
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            let mailOptions = {
                to: user.email,
                from: `Inforgot App <${process.env.USER}>`,
                subject: 'Password Reset Inforgot App',
                text: `Your Have Request To Change Your Password By Clicking The Forgot Password Link.Click The Below Link To Change Your Password\n\n http://localhost:4100/users/reset/${rand}`
            };

            transport.sendMail(mailOptions).then((response) => {
                req.flash('success_msg', `Password Reset Link Sent To ${user.email}. Check Your Email`);
                res.redirect('/users/forgot');
            });
        })
    })
});

//GET  - /users/reset/:token - GET FORM RESET PASSWORD
router.get('/reset/:token', (req, res) => {
    User.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() }
    }).then((user) => {
        if(!user) {
            req.flash('error_msg', 'Password Reset Token Expired or Invalid.Enter Your Email To Generate token again');
            return res.redirect('/users/forgot');
        }

        res.render('users/reset', { token: req.params.token });
    })
});

//POST - /users/reset/:token - CHANGE PASSWORD
router.post('/reset/:token', (req, res) => {
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;

    if (!password || !confirmPassword) {
        req.flash('error_msg', 'Password Fields Cannot Be Empty');
        res.redirect(`/users/reset/${req.params.token}`);
    } else if (password < 6) {
        req.flash('error_msg', 'Password Must Be Greater Than 5');
        res.redirect(`/users/reset/${req.params.token}`);
    } else if (password !== confirmPassword) {
        req.flash('error_msg', 'Password Do Not Match');
        res.redirect(`/users/reset/${req.params.token}`);
    } else {
        User.findOne({
            passwordResetToken: req.params.token,
            passwordResetExpires: { $gt: Date.now() }
        }).then((user) => {
            if (!user) {
                req.flash('error_msg', 'Password Reset Token Expired or Invalid.Enter Your Email To Generate token again');
                return res.redirect('/users/forgot');
            }

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) throw err;
                    user.password = hash;
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined;

                    user.save().then(() => {
                        req.flash('success_msg', 'Password Changed');
                        res.redirect('/users/login');
                    });
                });
            });
        });
    }

});


module.exports = router;