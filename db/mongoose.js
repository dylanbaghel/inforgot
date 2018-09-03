const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO, { useNewUrlParser: true }).then(() => {
    console.log('Mongo Connected');
}).catch((e) => {
    console.log('Mongo Connection Error', e);
})

module.exports = { mongoose };