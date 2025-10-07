const express = require('express');
const { auth } = require('../../middlewares/auth');
const { addNote, getNote, getUpdate, removeNote, getNotes } = require('../../controller/v1/note');

const router = express.Router();

router
.route('/')
.post(auth, addNote)
.get(auth, getNotes);

router
.route('/:noteId')
.get(auth, getNote)
.put(auth, getUpdate)
.delete(auth, removeNote);

module.exports =router;