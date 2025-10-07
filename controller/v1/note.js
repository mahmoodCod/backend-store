const { errorResponse, successRespons } = require("../../helpers/respanses");
const Note = require("../../model/Note");
const Product = require("../../model/Product");
const mongoose = require('mongoose');

exports.addNote = async (req,res,next) => {
    try {
        const { content, productId } = req.body;
        const user = req.user;

        const product = await Product.findById(productId);

        if (!product) {
            return errorResponse(res,400, 'Product not found !!');
        };

        const existingNote = await Note.findOne({
            user: user._id,
            product: productId
        });

        if (!existingNote) {
            return errorResponse(res,400, 'Another note already exist for this product !!');
        };

        const newNote = await Note.create({
            content,
            product: productId,
            user: user._id,
        });

        return successRespons(res,201, {
            message: 'Note created successfully :))',
            note: newNote
        });

    } catch (err) {
        next(err);
    };
};

exports.getNotes = async (req,res,next) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10 } = req.query;

        const notes = await Note.find({ user: user._id }.sort({createdAt: -1}).skip((page - 1) * limit).limit(limit)).populate('product').lean();

        let notedProduct = [];
        for (const note of notes) {
            if (note.product) {
                const product = {
                    ...note.product,
                    note: {
                        _id: note._id,
                        content: note.content,
                        createdAt: note.createdAt
                    },
                };

                notedProduct.push(product);
            } else {
                await Note.findByIdAndDelete({ _id: note._id });
            };
        };

        const userTotalNotes = await Note.countDocuments({ user: user._id });

        return successRespons(res,200, {
            products : notedProduct,
            pagination: createPaginationData(page, limit, userTotalNotes, "Notes"),
        });

    } catch (err) {
        next(err);
    };
};

exports.getNote = async (req,res,next) => {
    try {
        const user = req.user;
        const { noteId } = req.params;

        const note = await Note.findById(noteId).populate('user').populate('product').lean();

        if (note?.user?._id.toString() !== user._id.toString()) {
            return errorResponse(res,404, 'Note not found on you have note access to thise note');
        };

        if (!note.product) {
            await Note.findByIdAndDelete(noteId);
            return errorResponse(res,404, 'Thise product has been removed !!');
        };

        const product = {
            ...note.product,
            note: {
                id: note._id,
                content: note.content,
                createdAt: note.createdAt
            },
        };

        return successRespons(res,200, {
            product
        });


    } catch (err) {
        next(err);
    };
};

exports.getUpdate = async (req,res,next) => {
    try {
        const { noteId } = req.params;
        const { content } = req.body;
        const user = req.user;

        const existingNote = await Note.findById(noteId);

        if (existingNote?.user.toString() !== user._id.toString()) {
            return errorResponse(res,404, 'Note not found or you have not access to it !!');
        };

        const updateNote = await Note.findByIdAndUpdate( noteId, {
            content
        }, { new: true }
    );

    return successRespons(res,200, {
        note: updateNote,
        message: "Note updated successfully :))",
    });

    } catch (err) {
        next(err);
    };
};

exports.removeNote = async (req,res,next) => {
    try {
        const user = req.user;
        const { noteId } = req.params;

        if (!mongoose.isValidObjectId(noteId)) {
            return errorResponse(res,400, 'Note id is not valid !!');
        };

        const existingNote = await Note.findById(noteId);

        if(!existingNote || existingNote.user.toString() !== user._id.toString()) {
            return errorResponse(res,404, 'Note not found or you have not access to it !!');
        };

        const deletedNote = await Note.findByIdAndDelete(noteId);

        return successRespons(res,200, {
            message: 'Note deleted successfully :))',
            note: deletedNote,
        });

    } catch (err) {
        next(err);
    };
};





