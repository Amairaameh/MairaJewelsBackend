const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { uploadFileToR2, deleteFileFromR2 } = require('../services/r2.service');

// Helper to find category by either _id or customId or name
const findCategoryByIdOrCustomId = async (id) => {
    if (!id || typeof id !== 'string') return null;
    let category = null;
    const trimmed = id.trim();

    if (trimmed.match(/^[0-9a-fA-F]{24}$/)) {
        category = await Category.findById(trimmed);
    }
    if (!category) {
        category = await Category.findOne({
            $or: [
                { customId: trimmed },
                { customId: trimmed.toUpperCase() },
                { name: new RegExp(`^${trimmed}$`, 'i') }
            ]
        });
    }
    return category;
};

// @desc    Get all categories with product counts
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ order: 1, _id: 1 })
            .lean();

        // Single pass aggregation to calculate product counts per category
        const productCounts = await Product.aggregate([
            { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } }
        ]);

        const countMap = {};
        productCounts.forEach(item => {
            if (item._id) countMap[item._id] = item.count;
        });

        const categoriesWithCount = categories.map(cat => ({
            ...cat,
            id: cat.customId || cat._id,
            productCount: countMap[(cat.name || '').toLowerCase()] || 0
        }));

        res.status(200).json(
            new ApiResponse(200, { categories: categoriesWithCount }, 'Categories retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await findCategoryByIdOrCustomId(req.params.id);

        if (!category) {
            return next(new ApiError(404, `Category not found with identifier ${req.params.id}`));
        }

        const products = await Product.find({
            category: { $regex: new RegExp(`^${category.name}$`, 'i') }
        }).limit(20);

        res.status(200).json(
            new ApiResponse(200, { category, products }, 'Category details retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Create category (Supports JSON and Multipart Cloudflare R2 Upload)
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
    try {
        const { id, customId, name, description, order, isActive } = req.body;
        let image = req.body.image || '';

        if (!name || !name.trim()) {
            return next(new ApiError(400, 'Please provide category name'));
        }

        const trimmedName = name.trim();
        const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
        if (existing) {
            return next(new ApiError(400, 'A category with this name already exists'));
        }

        // Direct upload to Cloudflare R2 if file attached
        if (req.file) {
            const uploadRes = await uploadFileToR2({
                buffer: req.file.buffer,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                folder: 'categories'
            });
            image = uploadRes.url;
        }

        const category = await Category.create({
            customId: customId || id,
            name: trimmedName,
            description: description || '',
            image: image || '',
            order: order !== undefined ? Number(order) : 0,
            isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true
        });

        res.status(201).json(
            new ApiResponse(201, { category }, 'Category created successfully with Cloudflare R2 storage')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update category (Supports JSON and Multipart Cloudflare R2 Upload)
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await findCategoryByIdOrCustomId(req.params.id);

        if (!category) {
            return next(new ApiError(404, `Category not found with identifier ${req.params.id}`));
        }

        let updateData = { ...req.body };

        // Handle R2 image upload
        if (req.file) {
            const uploadRes = await uploadFileToR2({
                buffer: req.file.buffer,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                folder: 'categories'
            });
            updateData.image = uploadRes.url;
        }

        const updated = await Category.findByIdAndUpdate(category._id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json(
            new ApiResponse(200, { category: updated }, 'Category updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category and clean up R2 image
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await findCategoryByIdOrCustomId(req.params.id);

        if (!category) {
            return next(new ApiError(404, `Category not found with identifier ${req.params.id}`));
        }

        if (category.image) {
            await deleteFileFromR2(category.image);
        }

        await Category.findByIdAndDelete(category._id);

        res.status(200).json(
            new ApiResponse(200, { deletedId: category._id }, 'Category deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};
