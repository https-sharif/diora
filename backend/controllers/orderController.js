import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const createOrder = async (req, res) => {
  console.log('Create order route/controller hit');
  try {
    const userId = req.user.id;
    const {
      shippingAddress,
      paymentMethod,
      notes,
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ 
        status: false, 
        message: 'Cart is empty' 
      });
    }

    // Calculate totals and prepare order items
    let subtotal = 0;
    const orderItems = [];
    const stockUpdates = []; // Track stock updates for rollback if needed

    for (const cartItem of cart.products) {
      const product = cartItem.productId;
      
      // Check if product has sufficient stock
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ 
          status: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}` 
        });
      }

      // Calculate price (with discount if applicable)
      let itemPrice = product.price;
      if (product.discount && product.discount > 0) {
        itemPrice = product.price - (product.price * product.discount / 100);
      }

      const itemTotal = itemPrice * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.imageUrl[0],
        price: itemPrice,
        quantity: cartItem.quantity,
        size: cartItem.size,
        variant: cartItem.variant,
      });

      // Track stock update for this product
      stockUpdates.push({
        productId: product._id,
        originalStock: product.stock,
        newStock: product.stock - cartItem.quantity,
        quantityOrdered: cartItem.quantity,
      });
    }

    // Calculate shipping fee (free shipping over $100)
    const shippingFee = subtotal > 100 ? 0 : 10;
    const total = subtotal + shippingFee;

    // Generate order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD${year}${month}${day}${random}`;

    // Create the order
    const newOrder = new Order({
      orderNumber,
      userId,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      shippingAddress,
      notes,
    });

    await newOrder.save();

    // Update product stock quantities
    try {
      for (const stockUpdate of stockUpdates) {
        await Product.findByIdAndUpdate(
          stockUpdate.productId,
          { $inc: { stock: -stockUpdate.quantityOrdered } },
          { new: true }
        );
      }
    } catch (stockError) {
      console.error('Error updating stock:', stockError);
      // If stock update fails, we should ideally rollback the order
      // For now, we'll log the error but continue with the order
      // In production, consider implementing a transaction or compensation logic
    }

    // Clear the user's cart after successful order
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { products: [] } },
      { new: true }
    );

    // Populate the order for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('userId', 'fullName email')
      .populate('items.productId', 'name imageUrl shopId');

    res.status(201).json({
      status: true,
      message: 'Order placed successfully',
      order: populatedOrder,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Something went wrong while placing the order' 
    });
  }
};

export const getUserOrders = async (req, res) => {
  console.log('Get user orders route/controller hit');
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ userId })
      .populate('items.productId', 'name imageUrl shopId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments({ userId });

    res.json({
      status: true,
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders,
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Something went wrong while fetching orders' 
    });
  }
};

export const getOrderById = async (req, res) => {
  console.log('Get order by ID route/controller hit');
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('userId', 'fullName email')
      .populate('items.productId', 'name imageUrl shopId');

    if (!order) {
      return res.status(404).json({ 
        status: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      status: true,
      order,
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Something went wrong while fetching the order' 
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  console.log('Update order status route/controller hit');
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const updateData = { status };
    
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('userId', 'fullName email')
     .populate('items.productId', 'name imageUrl shopId');

    if (!order) {
      return res.status(404).json({ 
        status: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      status: true,
      message: 'Order status updated successfully',
      order,
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Something went wrong while updating order status' 
    });
  }
};

export const cancelOrder = async (req, res) => {
  console.log('Cancel order route/controller hit');
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ 
        status: false, 
        message: 'Order not found' 
      });
    }

    // Only allow cancellation if order is in processing or confirmed status
    if (!['processing', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        status: false, 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      status: true,
      message: 'Order cancelled successfully',
      order,
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Something went wrong while cancelling the order' 
    });
  }
};

export const getShopOrders = async (req, res) => {
  console.log('Get shop orders route/controller hit');
  try {
    const shopId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build query to find orders containing products from this shop
    const matchQuery = {
      'items.productId': { $exists: true }
    };

    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $match: {
          'productDetails.shopId': new mongoose.Types.ObjectId(shopId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $project: {
          orderNumber: 1,
          status: 1,
          total: 1,
          subtotal: 1,
          shippingFee: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          createdAt: 1,
          trackingNumber: 1,
          estimatedDelivery: 1,
          shippingAddress: 1,
          'customer.fullName': 1,
          'customer.email': 1,
          'customer.avatar': 1,
          items: {
            $filter: {
              input: '$items',
              cond: {
                $in: ['$$this.productId', '$productDetails._id']
              }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    // Get total count for pagination
    const totalOrders = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $match: {
          'productDetails.shopId': new mongoose.Types.ObjectId(shopId)
        }
      },
      { $count: 'total' }
    ]);

    const total = totalOrders.length > 0 ? totalOrders[0].total : 0;

    res.json({
      status: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalOrders: total,
    });

  } catch (error) {
    console.error('Error fetching shop orders:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Something went wrong while fetching shop orders' 
    });
  }
};
