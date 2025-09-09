import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res) => {
  console.log('Get cart route/controller hit');
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId }).populate({
      path: 'products.productId',
      select: 'name price imageUrl description category stock',
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

export const addToCart = async (req, res) => {
  console.log('Add to cart route/controller hit');
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    // Check if product is in stock
    if (product.stock <= 0) {
      return res
        .status(400)
        .json({ status: false, message: 'Product is out of stock' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, products: [] });
    }

    const existingItemIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.variant === variant
    );

    let totalRequestedQuantity = quantity;
    if (existingItemIndex > -1) {
      totalRequestedQuantity += cart.products[existingItemIndex].quantity;
    }

    // Check if requested quantity exceeds available stock
    if (totalRequestedQuantity > product.stock) {
      return res
        .status(400)
        .json({ 
          status: false, 
          message: `Only ${product.stock} items available in stock` 
        });
    }

    if (existingItemIndex > -1) {
      cart.products[existingItemIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity, size, variant });
    }

    await cart.save();

    await cart.populate({
      path: 'products.productId',
      select: 'name price imageUrl description category stock',
    });

    res.json({ status: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateCartQuantity = async (req, res) => {
  console.log('Update cart quantity route/controller hit');
  try {
    const userId = req.user.id;
    const { productId, quantity, size, variant } = req.body;

    if (quantity < 0) {
      return res
        .status(400)
        .json({ status: false, message: 'Quantity cannot be negative' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ status: false, message: 'Cart not found' });
    }

    const itemIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.variant === variant
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ status: false, message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      cart.products.splice(itemIndex, 1);
    } else {
      // Validate stock availability for non-zero quantities
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: 'Product not found' });
      }

      if (quantity > product.stock) {
        return res
          .status(400)
          .json({ 
            status: false, 
            message: `Only ${product.stock} items available in stock` 
          });
      }

      cart.products[itemIndex].quantity = quantity;
    }

    await cart.save();

    await cart.populate({
      path: 'products.productId',
      select: 'name price imageUrl description category stock',
    });

    res.json({ status: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const removeFromCart = async (req, res) => {
  console.log('Remove from cart route/controller hit');
  try {
    const userId = req.user.id;
    const { productId, size, variant } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ status: false, message: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.size === size &&
          item.variant === variant
        )
    );

    await cart.save();

    await cart.populate({
      path: 'products.productId',
      select: 'name price imageUrl description category stock',
    });

    res.json({ status: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const clearCart = async (req, res) => {
  console.log('Clear cart route/controller hit');
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
