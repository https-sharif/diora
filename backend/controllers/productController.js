import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  console.log('Get all products route/controller hit');
  try {
    const isAdmin = req.userDetails && req.userDetails.type === 'admin';
    
    let products;
    if (isAdmin) {
      products = await Product.aggregate([{ $sample: { size: 10 } }]);
      await Product.populate(products, { path: 'shopId', select: 'name status' });
    } else {
      products = await Product.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'shopId',
            foreignField: '_id',
            as: 'shop'
          }
        },
        {
          $match: {
            'shop.status': 'active'
          }
        },
        { $sample: { size: 10 } }
      ]);
      
      await Product.populate(products, { path: 'shopId', select: 'name status' });
    }

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
    const isAdmin = req.userDetails && req.userDetails.type === 'admin';

    const product = await Product.findById(productId).populate('shopId', 'fullName avatar followers shop.rating shop.reviewCount isVerified status');

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    if (!isAdmin && (!product.shopId || product.shopId.status !== 'active')) {
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
    const isAdmin = req.userDetails && req.userDetails.type === 'admin';
    
    let trendingProducts;
    if (isAdmin) {
      trendingProducts = await Product.aggregate([{ $sample: { size: 6 } }]);
    } else {
      trendingProducts = await Product.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'shopId',
            foreignField: '_id',
            as: 'shop'
          }
        },
        {
          $match: {
            'shop.status': 'active'
          }
        },
        { $sample: { size: 6 } }
      ]);
    }

    await Product.populate(trendingProducts, { path: 'shopId', select: 'fullName status' });

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

export const getProductsByShop = async (req, res) => {
  console.log('Get products by shop route/controller hit');
  try {
    const { shopId } = req.params;
    const isAdmin = req.userDetails && req.userDetails.type === 'admin';
    
    const products = await Product.find({ shopId }).populate('shopId', 'fullName avatar status');

    if (!isAdmin && products.length > 0 && products[0].shopId && products[0].shopId.status !== 'active') {
      return res.json({ status: true, products: [] });
    }

    res.json({ status: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
