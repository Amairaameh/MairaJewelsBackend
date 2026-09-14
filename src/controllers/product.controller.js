const Product = require('../models/Product.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { uploadMultipleFilesToR2, uploadFileToR2, deleteFileFromR2, deleteMultipleFilesFromR2 } = require('../services/r2.service');

// Helper to find product by either MongoDB _id, customId, sku, or slug
const findProductByIdOrCustomId = async (id) => {
    if (!id || typeof id !== 'string') return null;

    let product = null;
    const trimmedId = id.trim();

    // Check if valid MongoDB ObjectId
    if (trimmedId.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(trimmedId);
    }

    if (!product) {
        product = await Product.findOne({
            $or: [
                { customId: trimmedId },
                { customId: trimmedId.toUpperCase() },
                { sku: trimmedId },
                { sku: trimmedId.toUpperCase() },
                { slug: trimmedId.toLowerCase() }
            ]
        });
    }

    return product;
};

// @desc    Get all products with advanced filtering, sorting, pagination
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        const {
            category,
            subcategory,
            metal,
            gem,
            badge,
            featured,
            inStock,
            minPrice,
            maxPrice,
            search,
            sort,
            page = 1,
            limit = 50
        } = req.query;

        let query = {};

        // Category filter
        if (category && category !== 'All' && category !== 'all') {
            query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
        }

        // Subcategory filter
        if (subcategory) {
            query.subcategory = { $regex: new RegExp(subcategory.trim(), 'i') };
        }

        // Metal filter
        if (metal && metal !== 'All' && metal !== 'all') {
            query.metal = { $regex: new RegExp(metal.trim(), 'i') };
        }

        // Gemstone filter
        if (gem && gem !== 'All' && gem !== 'all') {
            query.gem = { $regex: new RegExp(gem.trim(), 'i') };
        }

        // Badge filter
        if (badge && badge !== 'All') {
            query.badge = badge.trim().toUpperCase();
        }

        // Featured filter
        if (featured !== undefined) {
            query.featured = featured === 'true' || featured === true || featured === '1';
        }

        // InStock filter
        if (inStock !== undefined) {
            query.inStock = inStock === 'true' || inStock === true || inStock === '1';
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.priceNum = {};
            if (minPrice !== undefined && minPrice !== '') {
                const parsedMin = parseFloat(minPrice);
                if (!isNaN(parsedMin)) query.priceNum.$gte = parsedMin;
            }
            if (maxPrice !== undefined && maxPrice !== '') {
                const parsedMax = parseFloat(maxPrice);
                if (!isNaN(parsedMax)) query.priceNum.$lte = parsedMax;
            }
            if (Object.keys(query.priceNum).length === 0) {
                delete query.priceNum;
            }
        }

        // Search across title, SKU, description, specs, category, color
        if (search && search.trim()) {
            const searchTerm = search.trim();
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { customId: { $regex: searchTerm, $options: 'i' } },
                { sku: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { details: { $regex: searchTerm, $options: 'i' } },
                { specs: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { badge: { $regex: searchTerm, $options: 'i' } },
                { color: { $regex: searchTerm, $options: 'i' } },
                { sizes: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Sorting options
        let sortOption = { createdAt: -1 };
        if (sort === 'price-asc') sortOption = { priceNum: 1 };
        else if (sort === 'price-desc') sortOption = { priceNum: -1 };
        else if (sort === 'name-asc') sortOption = { name: 1 };
        else if (sort === 'name-desc') sortOption = { name: -1 };
        else if (sort === 'rating') sortOption = { rating: -1, reviewsCount: -1 };
        else if (sort === 'oldest') sortOption = { createdAt: 1 };
        else if (sort === 'newest') sortOption = { createdAt: -1 };

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const skip = (pageNum - 1) * limitNum;

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .allowDiskUse(true);

        const pages = Math.ceil(total / limitNum) || 1;

        res.status(200).json(
            new ApiResponse(200, {
                total,
                count: products.length,
                page: pageNum,
                pages,
                hasNextPage: pageNum < pages,
                hasPrevPage: pageNum > 1,
                products
            }, 'Products retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID, customId, sku, or slug
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
    try {
        const product = await findProductByIdOrCustomId(req.params.id);

        if (!product) {
            return next(new ApiError(404, `Product not found with identifier: ${req.params.id}`));
        }

        // Related products in the same category
        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        })
            .limit(4)
            .select('name price priceNum image images customId category inStock rating reviewsCount');

        res.status(200).json(
            new ApiResponse(200, { product, related }, 'Product details retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Create new product (Supports both JSON body and Direct Multipart Image Upload to Cloudflare R2)
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        const {
            id,
            customId,
            sku,
            name,
            category,
            subcategory,
            price,
            priceNum,
            originalPrice,
            originalPriceNum,
            metal,
            gem,
            specs,
            color,
            colour,
            sizes,
            availableSizes,
            badge,
            image,
            images,
            thumbs,
            description,
            details,
            stock,
            countInStock,
            stockQty,
            inStock,
            featured,
            tags
        } = req.body;

        if (!name || !category || (price === undefined && priceNum === undefined)) {
            return next(new ApiError(400, 'Please provide product name, category, and price'));
        }

        // Handle direct multipart uploaded files if present
        let uploadedImages = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const r2UploadResults = await uploadMultipleFilesToR2(req.files, 'products');
            uploadedImages = r2UploadResults.map(res => res.url);
        } else if (req.file) {
            const r2UploadResult = await uploadFileToR2({
                buffer: req.file.buffer,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                folder: 'products'
            });
            uploadedImages = [r2UploadResult.url];
        }

        // Resolve images array
        let parsedImages = [];
        if (uploadedImages.length > 0) {
            parsedImages = uploadedImages;
        } else if (images) {
            parsedImages = Array.isArray(images) ? images : (typeof images === 'string' ? [images] : []);
        } else if (thumbs) {
            parsedImages = Array.isArray(thumbs) ? thumbs : (typeof thumbs === 'string' ? [thumbs] : []);
        } else if (image) {
            parsedImages = [image];
        } else {
            parsedImages = ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'];
        }

        const calculatedPriceNum = priceNum !== undefined
            ? Number(priceNum)
            : parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;

        const formattedPrice = price || `R ${calculatedPriceNum.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Auto-derive metal and gemstone from specs if not specified
        let resolvedMetal = metal || '';
        let resolvedGem = gem || '';
        const specsText = `${specs || ''} ${description || ''} ${details || ''} ${name || ''}`;

        if (!resolvedMetal) {
            if (/24K/i.test(specsText)) resolvedMetal = '24K Gold';
            else if (/Rose\s*Gold/i.test(specsText)) resolvedMetal = 'Rose Gold';
            else if (/White\s*Gold/i.test(specsText)) resolvedMetal = '18K White Gold';
            else if (/Platinum/i.test(specsText)) resolvedMetal = 'Platinum';
            else resolvedMetal = '18K Gold';
        }

        if (!resolvedGem) {
            if (/Emerald/i.test(specsText)) resolvedGem = 'Emerald';
            else if (/Sapphire/i.test(specsText)) resolvedGem = 'Sapphire';
            else if (/Ruby/i.test(specsText)) resolvedGem = 'Ruby';
            else if (/Pearl/i.test(specsText)) resolvedGem = 'Pearl';
            else resolvedGem = 'Diamond';
        }

        const resolvedStock = stock !== undefined
            ? Number(stock)
            : (countInStock !== undefined
                ? Number(countInStock)
                : (stockQty !== undefined ? Number(stockQty) : 10));

        const resolvedColor = color !== undefined ? color : (colour !== undefined ? colour : '');
        const resolvedSizes = sizes !== undefined ? sizes : (availableSizes !== undefined ? availableSizes : '');

        let parsedTags = [];
        if (tags) {
            parsedTags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);
        }

        const product = await Product.create({
            customId: customId || id || sku,
            sku: sku || customId || id,
            name: name.trim(),
            category: category.trim(),
            subcategory: subcategory ? subcategory.trim() : '',
            price: formattedPrice,
            priceNum: calculatedPriceNum,
            originalPrice: originalPrice || '',
            originalPriceNum: originalPriceNum ? Number(originalPriceNum) : undefined,
            metal: resolvedMetal,
            gem: resolvedGem,
            specs: specs || '',
            color: resolvedColor,
            sizes: resolvedSizes,
            badge: badge ? badge.trim() : '',
            image: parsedImages[0],
            images: parsedImages,
            thumbs: parsedImages,
            description: description || '',
            details: details || '',
            stock: resolvedStock,
            countInStock: resolvedStock,
            stockQty: resolvedStock,
            inStock: inStock !== undefined ? (inStock === 'true' || inStock === true) : (resolvedStock > 0),
            featured: featured === 'true' || featured === true,
            tags: parsedTags
        });

        res.status(201).json(
            new ApiResponse(201, { product }, 'Product created successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update product (Supports JSON body and Multipart Image Upload to Cloudflare R2)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        let updateData = { ...req.body };

        let product = await findProductByIdOrCustomId(req.params.id);
        if (!product) {
            return next(new ApiError(404, `Product not found with identifier: ${req.params.id}`));
        }

        // Handle multipart uploaded files
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const r2UploadResults = await uploadMultipleFilesToR2(req.files, 'products');
            const newImageUrls = r2UploadResults.map(res => res.url);
            updateData.images = newImageUrls;
            updateData.thumbs = newImageUrls;
            updateData.image = newImageUrls[0];
        } else if (req.file) {
            const r2UploadResult = await uploadFileToR2({
                buffer: req.file.buffer,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                folder: 'products'
            });
            updateData.image = r2UploadResult.url;
            updateData.images = [r2UploadResult.url, ...(product.images || []).filter(img => img !== product.image)];
            updateData.thumbs = updateData.images;
        }

        // Field aliases sync
        if (updateData.colour !== undefined && updateData.color === undefined) {
            updateData.color = updateData.colour;
        }
        if (updateData.availableSizes !== undefined && updateData.sizes === undefined) {
            updateData.sizes = updateData.availableSizes;
        }

        // Stock synchronization
        if (updateData.stock !== undefined || updateData.countInStock !== undefined || updateData.stockQty !== undefined) {
            const resolvedStock = updateData.stock !== undefined
                ? Number(updateData.stock)
                : (updateData.countInStock !== undefined
                    ? Number(updateData.countInStock)
                    : Number(updateData.stockQty));
            updateData.stock = resolvedStock;
            updateData.countInStock = resolvedStock;
            updateData.stockQty = resolvedStock;
            if (updateData.inStock === undefined) {
                updateData.inStock = resolvedStock > 0;
            }
        }

        // Price formatting
        if (updateData.priceNum !== undefined) {
            updateData.priceNum = Number(updateData.priceNum);
            if (!updateData.price) {
                updateData.price = `R ${updateData.priceNum.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        } else if (updateData.price && updateData.priceNum === undefined) {
            updateData.priceNum = parseFloat(String(updateData.price).replace(/[^0-9.]/g, '')) || 0;
        }

        // Image array sync if images passed in body
        if (updateData.images) {
            const imgs = Array.isArray(updateData.images) ? updateData.images : [updateData.images];
            updateData.images = imgs;
            updateData.thumbs = imgs;
            if (!updateData.image && imgs.length > 0) {
                updateData.image = imgs[0];
            }
        } else if (updateData.thumbs) {
            const ths = Array.isArray(updateData.thumbs) ? updateData.thumbs : [updateData.thumbs];
            updateData.images = ths;
            updateData.thumbs = ths;
            if (!updateData.image && ths.length > 0) {
                updateData.image = ths[0];
            }
        }

        // Tags parsing
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(
            new ApiResponse(200, { product: updatedProduct }, 'Product updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product and its Cloudflare R2 images
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await findProductByIdOrCustomId(req.params.id);

        if (!product) {
            return next(new ApiError(404, `Product not found with identifier: ${req.params.id}`));
        }

        // Cleanup associated images from Cloudflare R2 if applicable
        const imagesToDelete = [
            product.image,
            ...(product.images || []),
            ...(product.thumbs || [])
        ].filter(Boolean);

        if (imagesToDelete.length > 0) {
            await deleteMultipleFilesFromR2(imagesToDelete);
        }

        await Product.findByIdAndDelete(product._id);

        res.status(200).json(
            new ApiResponse(200, { deletedId: product._id, customId: product.customId }, 'Product and associated assets deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk delete products
// @route   POST /api/v1/products/bulk-delete
// @access  Private/Admin
exports.bulkDeleteProducts = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return next(new ApiError(400, 'Please provide an array of product IDs to delete'));
        }

        const products = await Product.find({
            $or: [
                { _id: { $in: ids.filter(id => id.match(/^[0-9a-fA-F]{24}$/)) } },
                { customId: { $in: ids } },
                { sku: { $in: ids } }
            ]
        });

        if (products.length === 0) {
            return next(new ApiError(404, 'No matching products found to delete'));
        }

        // Collect all images for batch R2 cleanup
        const allImages = [];
        products.forEach(prod => {
            if (prod.image) allImages.push(prod.image);
            if (prod.images) allImages.push(...prod.images);
        });

        if (allImages.length > 0) {
            await deleteMultipleFilesFromR2(allImages);
        }

        const productDbIds = products.map(p => p._id);
        const deleteResult = await Product.deleteMany({ _id: { $in: productDbIds } });

        res.status(200).json(
            new ApiResponse(200, {
                deletedCount: deleteResult.deletedCount,
                deletedIds: productDbIds
            }, 'Products deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle product status (featured / inStock / isActive)
// @route   PATCH /api/v1/products/:id/toggle
// @access  Private/Admin
exports.toggleProductStatus = async (req, res, next) => {
    try {
        const { field } = req.body; // 'featured' | 'inStock' | 'isActive'

        if (!['featured', 'inStock', 'isActive'].includes(field)) {
            return next(new ApiError(400, 'Invalid field to toggle. Allowed: featured, inStock, isActive'));
        }

        const product = await findProductByIdOrCustomId(req.params.id);
        if (!product) {
            return next(new ApiError(404, `Product not found with identifier: ${req.params.id}`));
        }

        product[field] = !product[field];
        await product.save();

        res.status(200).json(
            new ApiResponse(200, { product }, `Product ${field} status toggled to ${product[field]}`)
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get product analytics / statistics
// @route   GET /api/v1/products/stats
// @access  Private/Admin
exports.getProductStats = async (req, res, next) => {
    try {
        const [totalProducts, outOfStock, featuredCount, categoriesCount] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ inStock: false }),
            Product.countDocuments({ featured: true }),
            Product.distinct('category')
        ]);

        res.status(200).json(
            new ApiResponse(200, {
                totalProducts,
                outOfStock,
                inStockCount: totalProducts - outOfStock,
                featuredCount,
                totalCategories: categoriesCount.length,
                categories: categoriesCount
            }, 'Product statistics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};
