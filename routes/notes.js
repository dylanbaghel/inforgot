//THIRD PARTY MODULES
const express = require('express');
const router = express.Router();

//CUSTOM MODULE FILES
const { Note } = require('./../models/Note');
const { authenticate } = require('./../middleware/auth');
//ROUTES

//GET - /notes/add - GET ADD NEW NOTES FORM
router.get('/add', authenticate, (req, res) => {
    res.render('notes/add');
});

//POST - /notes - CREATE NEW NOTE
router.post('/', authenticate, (req, res) => {
    const title = req.body.title;
    const enteredNote = req.body.note;
    let errors = [];

    if(!title) {
        errors.push({text: 'Please Enter Title'});
    }
    if(!enteredNote) {
        errors.push({text: 'Note Area Cannot Be Blank'});
    }

    if(errors.length > 0) {
        res.render('notes/add', {errors});
    } else {
        let note = new Note({
            title, 
            'note': enteredNote,
            _creator: req.user.id
        });
        note.save().then((note) => {
            req.flash('success_msg', 'Note Added Successfully');
            res.redirect('/notes');
        }).catch((e) => {
            res.redirect('/notes/add');
        })
    }
});

//GET - /notes - LIST ALL NOTES
router.get('/', authenticate, (req, res) => {
    Note.find({
        _creator: req.user.id
    }).then((notes) => {
        res.render('notes/notes', {notes});
    }).catch((e) => {
        throw e;
    });
});

//GET - /notes/:id  - LIST PARTICULAR NOTE
router.get('/:id/show', authenticate, (req, res) => {
    const id = req.params.id;
    
    Note.findOne({
        _id: id,
        _creator: req.user.id
    }).then((note) => {
        if (note._creator.toHexString() !== req.user.id) {
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/notes');
        } else {
            res.render('notes/show', {note});
        }
    }).catch((e) => {
        res.redirect('/notes');
    })
});

//GET - /notes/:id/edit - SHOW EDIT NOTE FORM   
router.get('/:id/edit', authenticate, (req, res) => {
    Note.findOne({
        _id: req.params.id
    }).then((note) => {
        if (note._creator.toHexString() !== req.user.id) {
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/notes');
        } else {
            res.render('notes/edit', {note});
        }

    })
});

//PUT - /notes/:id - UPDATE NOTE VIA EDIT NOTE FORM
router.put('/:id', authenticate,  (req, res) => {
    let errors = [];

    if (!req.body.title) {
        errors.push({text: 'Title Cannot Be Empty'});
    }
    if (!req.body.note) {
        errors.push({text: 'Note Cannot Be Empty'});
    }

    if (errors.length > 0) {
        res.redirect(`/notes/${req.params.id}/edit`);
    } else {
        Note.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                title: req.body.title,
                note: req.body.note
            }
        }).then((note) => {
            req.flash('success_msg', 'Note Edit Successfully');
            res.redirect(`/notes/${req.params.id}/show`);
        });
    }

});

//DELETE - /notes/:id - DELETE NOTE
router.delete('/:id', authenticate, (req, res) => {
    Note.findOneAndRemove({
        _id: req.params.id
    }).then((note) => {
        req.flash('success_msg', 'Note Deleted Successfully');
        res.redirect('/notes');
    })
});


module.exports = router;