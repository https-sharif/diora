import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  console.log('Get all products route/controller hit');
  try {
    const products = await Product.find().populate('shopId', 'name');
    res.json({ status: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getProductById = async (req, res) => {
  console.log('Get product by ID route/controller hit');
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('shopId', 'fullName avatar followers shop.rating shop.ratingCount');

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    res.json({ status: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const createProduct = async (req, res) => {
  console.log('Create product route/controller hit');
  try {
    const {
      name,
      price,
      category,
      description,
      sizes,
      variants,
      stock,
      discount,
    } = req.body;

    const shopId = req.user.id;
    const imageUrls = req.files.map(file => file.path);

    const newProduct = new Product({
      shopId,
      name,
      price,
      imageUrl: imageUrls,
      category : JSON.parse(category || '[]'),
      description,
      sizes : JSON.parse(sizes || '[]'),
      variants : JSON.parse(variants || '[]'),
      stock,
      rating: 0,
      reviewCount: 0,
      discount: discount || 0,
    });

    await newProduct.save();
    res.status(201).json({ status: true, product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateProduct = async (req, res) => {
  console.log('Update product route/controller hit');
  try {
    const productId = req.params.productId;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    res.json({ status: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const deleteProduct = async (req, res) => {
  console.log('Delete product route/controller hit');
  try {
    const productId = req.params.productId;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    res.json({ status: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getTrendingProducts = async (req, res) => {
  console.log('Get trending products route/controller hit');
  try {
    const trendingProducts = await Product.aggregate([
      { $sample: { size: 6 } }
    ]);

    await Product.populate(trendingProducts, { path: 'shopId', select: 'fullName' });

    if (!trendingProducts || trendingProducts.length === 0) {
      return res
        .status(200)
        .json({ status: true, message: 'No trending products found', trendingProducts: [] });
    }

    console.log('Trending products:', trendingProducts);

    res.json({ status: true, trendingProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
