import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, notes } = req.body;

    const cart = await Cart.findOne({ userId }).populate('products.productId');

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Cart is empty',
      });
    }

    let subtotal = 0;
    const orderItems = [];
    const stockUpdates = [];

    for (const cartItem of cart.products) {
      const product = cartItem.productId;

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          status: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`,
        });
      }

      let itemPrice = product.price;
      if (product.discount && product.discount > 0) {
        itemPrice = product.price - (product.price * product.discount) / 100;
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

      stockUpdates.push({
        productId: product._id,
        originalStock: product.stock,
        newStock: product.stock - cartItem.quantity,
        quantityOrdered: cartItem.quantity,
      });
    }

    const shippingFee = subtotal > 100 ? 0 : 10;
    const total = subtotal + shippingFee;

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const orderNumber = `ORD${year}${month}${day}${random}`;

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
    }

    await Cart.findOneAndUpdate(
      { userId },
      { $set: { products: [] } },
      { new: true }
    );

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
      message: 'Something went wrong while placing the order',
    });
  }
};

export const createStripeSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('items.productId');

    if (!order)
      return res
        .status(404)
        .json({ status: false, message: 'Order not found' });

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `diora://order-success?orderId=${order._id}`,
      cancel_url: `diora://order-cancel?orderId=${order._id}`,
      metadata: { orderId: order._id.toString() },
    });

    res.json({ sessionUrl: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    res
      .status(500)
      .json({ status: false, message: 'Failed to create Stripe session' });
  }
};

export const getUserOrders = async (req, res) => {
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
      message: 'Something went wrong while fetching orders',
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let order = await Order.findOne({ _id: orderId })
      .populate('userId', 'fullName email')
      .populate('items.productId', 'name imageUrl shopId');

    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: 'Order not found' });
    }

    if (userRole === 'shop') {
      const shopItems = order.items.filter(
        (item) => item.productId?.shopId?.toString() === userId
      );

      if (shopItems.length === 0) {
        return res
          .status(404)
          .json({ status: false, message: 'Order not found' });
      }

      order = {
        ...order.toObject(),
        items: shopItems,
      };
    } else {
      if (order.userId._id.toString() !== userId) {
        return res
          .status(403)
          .json({ status: false, message: 'Not your order' });
      }
    }

    res.json({ status: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const updateData = { status };

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery)
      updateData.estimatedDelivery = new Date(estimatedDelivery);

    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    })
      .populate('userId', 'fullName email')
      .populate('items.productId', 'name imageUrl shopId');

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
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
      message: 'Something went wrong while updating order status',
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    if (!['processing', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        status: false,
        message: 'Order cannot be cancelled at this stage',
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
      message: 'Something went wrong while cancelling the order',
    });
  }
};

export const getShopOrders = async (req, res) => {
  try {
    const shopId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const matchQuery = {
      'items.productId': { $exists: true },
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
          as: 'productDetails',
        },
      },
      {
        $match: {
          'productDetails.shopId': new mongoose.Types.ObjectId(shopId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'customer',
        },
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
                $in: ['$$this.productId', '$productDetails._id'],
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);

    const totalOrders = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $match: {
          'productDetails.shopId': new mongoose.Types.ObjectId(shopId),
        },
      },
      { $count: 'total' },
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
      message: 'Something went wrong while fetching shop orders',
    });
  }
};

export const orderSuccess = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).send('Order ID is required');

    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) return res.status(404).send('Order not found');

    res.send(`
      <html>
        <head>
          <title>Order Success - Diora</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #fafafa;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: white;
              padding: 2rem;
              border-radius: 16px;
              box-shadow: 0 8px 24px rgba(0,0,0,0.08);
              max-width: 420px;
              width: 100%;
              text-align: center;
            }
            .logo {
              width: 120px;
              margin-bottom: 1rem;
            }
            h1 {
              font-size: 1.5rem;
              color: #222;
              margin-bottom: 0.5rem;
            }
            p {
              margin: 0.25rem 0;
              color: #555;
            }
            .items {
              list-style: none;
              padding: 0;
              margin: 1rem 0 0;
              text-align: left;
            }
            .items li {
              padding: 0.5rem 0;
              border-bottom: 1px solid #eee;
              color: #333;
            }
            .total {
              font-weight: bold;
              font-size: 1.1rem;
              margin-top: 0.5rem;
              color: #000;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Thank you for your order!</h1>
            <p>Order #: ${order.orderNumber}</p>
            <p class="total">Total: $${order.total.toFixed(2)}</p>
            <h3>Items:</h3>
            <ul class="items">
              ${order.items
                .map((item) => `<li>${item.name} x ${item.quantity}</li>`)
                .join('')}
            </ul>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

export const orderCancel = async (req, res) => {
  const { orderId } = req.query;

  res.send(`
    <html>
      <head>
        <title>Order Canceled</title>
      </head>
      <body>
        <h1>❌ Your order was canceled</h1>
        ${orderId ? `<p>Order ID: ${orderId}</p>` : ''}
        <p>If this was a mistake, you can try placing your order again.</p>
      </body>
    </html>
  `);
};
