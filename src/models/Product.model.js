const mongoose = require('mongoose');
const { parsePrice, formatPrice } = require('../utils/priceFormatter');

const ProductSchema = new mongoose.Schema({
    customId: {
        type: String,
        trim: true,
        uppercase: true,
        index: true
    },
    sku: {
        type: String,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a product title'],
        trim: true,
        maxlength: [250, 'Product name cannot exceed 250 characters']
    },
    slug: {
        type: String,
        trim: true,
        lowercase: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Please assign a category'],
        trim: true,
        index: true
    },
    subcategory: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: String,
        default: 'R 0.00'
    },
    priceNum: {
        type: Number,
        required: [true, 'Please specify numeric price'],
        min: [0, 'Price must be greater than or equal to 0'],
        index: true
    },
    originalPrice: {
        type: String,
        default: ''
    },
    originalPriceNum: {
        type: Number,
        default: null
    },
    metal: {
        type: String,
        default: '18K Gold',
        trim: true,
        index: true
    },
    gem: {
        type: String,
        default: 'Diamond',
        trim: true,
        index: true
    },
    specs: {
        type: String,
        default: '',
        trim: true
    },
    color: {
        type: String,
        default: '',
        trim: true
    },
    colors: {
        type: [String],
        default: []
    },
    sizes: {
        type: String,
        default: '',
        trim: true
    },
    badge: {
        type: String,
        default: '',
        trim: true
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
    },
    images: {
        type: [String],
        default: []
    },
    thumbs: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    inStock: {
        type: Boolean,
        default: true,
        index: true
    },
    stock: {
        type: Number,
        default: 10,
        min: 0
    },
    countInStock: {
        type: Number,
        default: 10,
        min: 0
    },
    stockQty: {
        type: Number,
        default: 10,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5
    },
    reviewsCount: {
        type: Number,
        default: 12
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: {
        type: [String],
        default: []
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Auto-generate customId, slug, and normalize price/images/stock before save
ProductSchema.pre('save', function() {
    // Generate customId / SKU if not provided
    if (!this.customId && this.name) {
        const clean = this.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const prefix = clean.length >= 3 ? clean.substring(0, 3) : (clean + 'PRD').substring(0, 3);
        const randNum = Math.floor(1000 + Math.random() * 9000);
        this.customId = `${prefix}-${randNum}`;
    }
    if (!this.sku) {
        this.sku = this.customId;
    }

    // Generate URL-friendly slug
    if (!this.slug && this.name) {
        const baseSlug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        this.slug = `${baseSlug}-${(this.customId || '').toLowerCase()}`.replace(/-+$/, '');
    }

    // Sync image arrays
    if (this.images && this.images.length > 0) {
        if (!this.image) this.image = this.images[0];
        if (!this.thumbs || this.thumbs.length === 0) this.thumbs = [...this.images];
    } else if (this.thumbs && this.thumbs.length > 0) {
        if (!this.image) this.image = this.thumbs[0];
        if (!this.images || this.images.length === 0) this.images = [...this.thumbs];
    } else if (this.image) {
        this.images = [this.image];
        this.thumbs = [this.image];
    }

    // Sync colors array and color string
    if (this.colors && Array.isArray(this.colors) && this.colors.length > 0) {
        if (!this.color) {
            this.color = this.colors.join(', ');
        }
    } else if (this.color && (!this.colors || this.colors.length === 0)) {
        this.colors = this.color.split(',').map(c => c.trim()).filter(Boolean);
    }

    // Ensure formatted price & priceNum sync
    if (this.priceNum !== undefined && this.priceNum !== null) {
        this.priceNum = parsePrice(this.priceNum);
        this.price = formatPrice(this.priceNum);
    } else if (this.price) {
        this.priceNum = parsePrice(this.price);
        this.price = formatPrice(this.priceNum);
    }

    // Sync stock fields (stock, countInStock, stockQty, inStock)
    const stockVal = this.stock !== undefined
        ? Number(this.stock)
        : (this.countInStock !== undefined
            ? Number(this.countInStock)
            : (this.stockQty !== undefined ? Number(this.stockQty) : 10));

    this.stock = stockVal;
    this.countInStock = stockVal;
    this.stockQty = stockVal;
    if (this.inStock === undefined) {
        this.inStock = stockVal > 0;
    }
});

// Virtual fields for frontend compatibility
ProductSchema.virtual('colour')
    .get(function() { return this.color; })
    .set(function(val) { this.color = val; });

ProductSchema.virtual('availableSizes')
    .get(function() { return this.sizes; })
    .set(function(val) { this.sizes = val; });

ProductSchema.virtual('gemstone')
    .get(function() { return this.gem; })
    .set(function(val) { this.gem = val; });

// Indexes for fast lookup, full-text search, and compound filtering
ProductSchema.index({ name: 'text', description: 'text', specs: 'text', color: 'text', sizes: 'text', category: 'text' });
ProductSchema.index({ category: 1, priceNum: 1 });
ProductSchema.index({ featured: 1, inStock: 1 });
ProductSchema.index({ badge: 1 });
ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
