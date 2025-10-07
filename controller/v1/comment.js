const { errorResponse, successRespons } = require("../../helpers/respanses");
const Product = require("../../model/Product");
const Comment = require('../../model/Comment');
const { createPaginationData } = require('../../utils/index');
const { createCommentValidator, addReplyValidator, updateCommentValidator } = require('../../validators/comment');
const { isValidObjectId } = require("mongoose");

exports.createComment = async (req,res,next) => {
    try {
        const user = req.user;
        const { content, rating, productId } = req.body;

        await createCommentValidator.validate({
            content,
            productId,
            rating,
        }, { abortEarly: false});
        const product = await Product.findOne({ _id: productId });

        if (!product) {
            return errorResponse(res,404, 'Product not found !!');
        };

        const newComment = await Comment.create({
            product: product._id,
            user: user._id,
            content,
            rating,
            replies: [],
        });

        return successRespons(res,201, {
            message: 'Comment created successfully :))',
            comment: newComment
        });
    } catch (err) {
        next(err);
    };
};

exports.getComment = async (req,res,next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find()
      .sort({
        createdAt: "desc",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("product")
      .populate("user", "-addresses")
      .populate({
        path: "replies",
        populate: { path: "user", select: "-addresses" },
      });

    const totalComments = await Comment.countDocuments();

    return successResponse(res, 200, {
      comments,
      pagination: createPaginationData(page, limit, totalComments, "Comments"),
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllComments = async (req,res,next) => {
  try {
    const { page = 1 , limit = 10 } = req.query;

    const comments = await Comment.find()
    .sort({
      createdAt: "desc",
    }).skip(( page  - 1 ) * limit).limit(limit).populate('product').populate('user', '-addresses').populate({
      path: 'replies',
      populate: { path: "user", select: "-addresses" }
    });

    const totalComments = await Comment.countDocuments();

    return successRespons(res,200, {
      comments,
      pagination: createPaginationData( page, limit, totalComments, 'Comments' )
    });
  } catch (err) {
    next(err);
  };
};

exports.removeComment = async (req,res,next) => {
    try {
        const { commentId } = req.params;

        if (!isValidObjectId(commentId)) {
            return errorResponse(res,400, 'Comment id is not valid !!');
        };

        const deleteComment = await Comment.findByIdAndDelete(commentId);

        if (!deleteComment) {
            return errorResponse(res,400, 'Comment not found !!');
        };

        return successRespons(res,200, {
            message: 'Comment deleted successfully :))',
            comment: deleteComment
        });

    } catch (err) {
        next(err);
    };
};

exports.updateComment = async (req,res,next) => {
    try {
        const { commentId } = req.params;
        const { content, rating } = req.body;
        const user = req.user;
    
        await updateCommentValidator.validate(
          { content, rating },
          {
            abortEarly: false,
          }
        );
    
        const comment = await Comment.findById(commentId);
    
        if (!comment) {
          return errorResponse(res, 404, "Comment not found !!");
        }
    
        if (comment.user.toString() !== user._id.toString()) {
          return errorResponse(res, 403, "You have not access to this action !!");
        }
    
        const updatedComment = await Comment.findByIdAndUpdate(
          commentId,
          {
            content,
            rating,
          },
          { new: true }
        );
    
        return successResponse(res, 200, {
          message: "Comment updated successfully :))",
          comment: updatedComment,
        });
      } catch (err) {
        next(err);
      }
};

exports.createReply = async (req,res,next) => {
    try {
        const user = req.user;
        const { content } = req.body;
        const { commentId } = req.params;

        if (!isValidObjectId(commentId)) {
            return errorResponse(res,400, 'Comment id is not valid !!');
        };
    
        await addReplyValidator.validate({
          content,
        }, { abortEarly: false });

        const reply = await Comment.findByIdAndUpdate(commentId,{
            $push: {
                replies: {
                  content,
                  user: user._id,
                },
              },
        }, { new: true });
    
        if (!reply) {
            return errorResponse(res,404, 'Comment not found !!');
        };
    
        return successRespons(res, 200, {
          reply
        });

    } catch (err) {
        next(err);
    };
};

exports.updateReply = async (req,res,next) => {
    try {

    } catch (err) {
        next(err);
    };
};

exports.removeReply = async (req,res,next) => {
    try {
        const { commentId, replyId } = req.params;
        const user = req.user;
    
        if (!isValidObjectId(commentId) || !isValidObjectId(replyId)) {
          return errorResponse(res, 400, "Comment or Reply id is not correct !!");
        }
    
        const comment = await Comment.findById(commentId);
        if (!comment) {
          return errorResponse(res, 404, "Comment not found !!");
        }
    
        const reply = comment.replies.id(replyId);
        if (!reply) {
          return errorResponse(res, 404, "Reply not found !!");
        }
    
        if (reply.user.toString() !== user._id.toString()) {
          return errorResponse(res, 403, "You have not access to this action !!");
        }
    
        comment.replies.pull(replyId);
        await comment.save();
    
        return successRespons(res, 200, {
          message: "Reply deleted successfully :))",
        });
      } catch (err) {
        next(err);
      }
};
