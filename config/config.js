const env = process.env.NODE_ENV || 'development';
console.log('env*******', env);

if (env === 'development') {
    process.env.PORT = 4100;
    process.env.MONGO = 'mongodb://localhost:27017/InForgotApp'
} else if(env === 'production') {
    process.env.MONGO = 'mongodb://dylan:dylananya2244@ds133202.mlab.com:33202/inforgot-app'
}