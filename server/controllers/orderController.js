const {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
} = require('../utils/sheetsAPI');
const { getCustomerByEmail } = require('../utils/customerManager');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Get all orders
exports.getAll = async (req, res, next) => {
  try {
    const orders = await getOrders(SPREADSHEET_ID);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Create new order
exports.create = async (req, res, next) => {
  try {
    const {
      customerName,
      deliveryDate,
      deliveryDestination,
      invoiceTotal,
      numberOfBoxes,
      status,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !customerName ||
      !deliveryDate ||
      !deliveryDestination ||
      invoiceTotal === null ||
      !numberOfBoxes
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const newOrder = {
      customerName,
      deliveryDate,
      deliveryDestination,
      invoiceTotal,
      numberOfBoxes,
      status,
      notes,
    };

    const result = await addOrder(SPREADSHEET_ID, newOrder);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Update order
exports.update = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { deliveryDate, deliveryDestination, invoiceTotal, numberOfBoxes, status, notes } =
      req.body;

    const updatedOrder = {
      deliveryDate,
      deliveryDestination,
      invoiceTotal,
      numberOfBoxes,
      status,
      notes,
    };

    // Remove undefined fields
    Object.keys(updatedOrder).forEach((key) => {
      if (updatedOrder[key] === undefined) {
        delete updatedOrder[key];
      }
    });

    const result = await updateOrder(SPREADSHEET_ID, orderId, updatedOrder);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Delete order
exports.delete = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const result = await deleteOrder(SPREADSHEET_ID, orderId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get customer names for autocomplete
exports.getCustomerNames = async (req, res, next) => {
  try {
    const { getAllCustomers } = require('../utils/customerManager');
    const names = getAllCustomers();
    res.json({ success: true, data: names });
  } catch (error) {
    next(error);
  }
};
