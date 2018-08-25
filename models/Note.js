const mongoose = require('mongoose');

let NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    note: {
        type: String,
        required: true
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

let Note = mongoose.model('Note', NoteSchema);
module.exports = {Note};