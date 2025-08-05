import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let wishlist = await Wishlist.findOne({ userId }).populate({
      path: 'products',
      select: 'name price imageUrl description category shopId'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
      await wishlist.populate({
        path: 'products',
        select: 'name price imageUrl description category shopId'
      });
    }

    res.json({ status: true, wishlist: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    // Check if item already exists in wishlist
    const itemExists = wishlist.products.includes(productId);
    
    if (itemExists) {
      return res.status(400).json({ status: false, message: 'Product already in wishlist' });
    }

    // Add item to wishlist
    wishlist.products.push(productId);
    await wishlist.save();
    
    // Populate the wishlist with product details
    await wishlist.populate({
      path: 'products',
      select: 'name price imageUrl description category shopId'
    });

    res.json({ status: true, wishlist: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ status: false, message: 'Wishlist not found' });
    }

    // Remove item from wishlist
    wishlist.products = wishlist.products.filter(
      item => item.toString() !== productId
    );

    await wishlist.save();
    
    // Populate the wishlist with product details
    await wishlist.populate({
      path: 'products',
      select: 'name price imageUrl description category shopId'
    });

    res.json({ status: true, wishlist: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

// Toggle item in wishlist (add if not exists, remove if exists)
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    // Check if item exists in wishlist
    const itemIndex = wishlist.products.findIndex(
      item => item.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Remove item from wishlist
      wishlist.products.splice(itemIndex, 1);
    } else {
      // Add item to wishlist
      wishlist.products.push(productId);
    }

    await wishlist.save();
    
    // Populate the wishlist with product details
    await wishlist.populate({
      path: 'products',
      select: 'name price imageUrl description category shopId'
    });

    res.json({ status: true, wishlist: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
