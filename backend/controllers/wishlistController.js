import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res) => {
  console.log('Get wishlist route/controller hit');
  try {
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ userId }).populate({
      path: 'products',
      select: 'name price imageUrl description category shopId',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
      await wishlist.populate({
        path: 'products',
        select: 'name price imageUrl description category shopId',
      });
    }

    res.json({ status: true, wishlist: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const addToWishlist = async (req, res) => {
  console.log('Add to wishlist route/controller hit');
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    const itemExists = wishlist.products.includes(productId);

    if (itemExists) {
      return res
        .status(400)
        .json({ status: false, message: 'Product already in wishlist' });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name price imageUrl description category shopId',
    });

    res.json({ status: true, wishlist: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const removeFromWishlist = async (req, res) => {
  console.log('Remove from wishlist route/controller hit');
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res
        .status(404)
        .json({ status: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.toString() !== productId
    );

    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name price imageUrl description category shopId',
    });

    res.json({ status: true, wishlist: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const toggleWishlist = async (req, res) => {
  console.log('Toggle wishlist route/controller hit');
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    const itemIndex = wishlist.products.findIndex(
      (item) => item.toString() === productId
    );

    if (itemIndex > -1) {
      wishlist.products.splice(itemIndex, 1);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name price imageUrl description category shopId',
    });

    res.json({ status: true, wishlist: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
