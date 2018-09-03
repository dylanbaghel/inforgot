const env = process.env.NODE_ENV || 'development';
const keys = require('./keys');
console.log('env*******', env);

if (env === 'development') {
    process.env.PORT = 4100;
    process.env.USER = keys.auth.user;
    process.env.PASS = keys.auth.pass;
    process.env.MONGO = 'mongodb://localhost:27017/InForgotApp'
} else if(env === 'production') {

}