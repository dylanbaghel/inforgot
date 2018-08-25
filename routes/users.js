//THIRD PARTY MODULES
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
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
        errors.push({text: 'Name Field Cannot be empty'});
    }
    if (!email) {
        errors.push({text: 'Email Field Connot be empty'});
    }
    if (!password || !password2) {
        errors.push({text: 'Password Field Cannot be empty'});
    } else if (password.length < 6) {
        errors.push({text: 'Password Length Must be greater than 6'});
    } 

    if (password !== password2) {
        errors.push({text: 'Password do not match'});
    }

    if (errors.length > 0) {
        res.render('users/register', {errors, name, email});
    } else {
        
        User.findOne({
            email
        }).then((user) => {
            if(user) {
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
                        if(err) throw err;
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
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/notes',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//GET - /users/logout - LOGOUT USER
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged Out Successfully');
    res.redirect('/users/login');
});


module.exports = router;