const express = require('express');
const { auth } = require('../../middlewares/auth');
const roleGuard = require('../../middlewares/roleGuard');
const { createComment, getComment, getAllComments, removeComment, updateComment, createReply, updateReply, removeReply } = require('../../controller/v1/comment');

const router = express.Router();

router.route('/')
.post(auth, createComment)
.get(getComment);

router.route('/all').get(auth, roleGuard('ADMIN'), getAllComments);

router.route('/:commentId')
.delete(auth, roleGuard('ADMIN'), removeComment)
.patch(auth,updateComment);

router.route('/:commentId/reply')
.post(auth, createReply);

router.route('/:commentId/reply/:replyId')
.patch(auth, updateReply)
.delete(auth, removeReply);

module.exports = router;