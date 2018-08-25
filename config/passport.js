const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');

//CUSTOM MODULES FILES
const { User } = require('./../models/User');


const passportLocal = (passport) => {
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        User.findOne({
            email
        }).then((user) => {
            if(!user) {
                return done(null, false, {message: 'No User Found'});
            }

            //PASSWORD MATCH
            bcrypt.compare(password, user.password).then((isMatch) => {
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Password Incorrect'});
                }
            }).catch((e) => {
                throw e;
            })
        }).catch((e) => {
            throw e;
        });
    }));

    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};

module.exports = {passportLocal};