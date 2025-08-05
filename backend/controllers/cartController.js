import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ userId }).populate({
      path: 'products.productId',
      select: 'name price imageUrl description category'
    });

    if (!cart) {
      cart = await Cart.create({ userId, products: [] });
    }

    res.json({ status: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size, variant } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({ userId, products: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.products.findIndex(
      item => 
        item.productId.toString() === productId && 
        item.size === size && 
        item.variant === variant
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.products[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.products.push({ productId, quantity, size, variant });
    }

    await cart.save();
    
    // Populate the cart with product details
    await cart.populate({
      path: 'products.productId',
      select: 'name price imageUrl description category'
    });

    res.json({ status: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

// Update cart item quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, size, variant } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ status: false, message: 'Quantity cannot be negative' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ status: false, message: 'Cart not found' });
    }

    const itemIndex = cart.products.findIndex(
      item => 
        item.productId.toString() === productId && 
        item.size === size && 
        item.variant === variant
    );

    if (itemIndex === -1) {
      return res.status(404).json({ status: false, message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.products.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.products[itemIndex].quantity = quantity;
    }

    await cart.save();
    
    // Populate the cart with product details
    await cart.populate({
      path: 'products.productId',
      select: 'name price imageUrl description category'
    });

    res.json({ status: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size, variant } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ status: false, message: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      item => !(
        item.productId.toString() === productId && 
        item.size === size && 
        item.variant === variant
      )
    );

    await cart.save();
    
    // Populate the cart with product details
    await cart.populate({
      path: 'products.productId',
      select: 'name price imageUrl description category'
    });

    res.json({ status: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, products: [] });
    } else {
      cart.products = [];
      await cart.save();
    }

    res.json({ status: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
