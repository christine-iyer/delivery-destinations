const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get customer names for autocomplete (must come before /:orderId routes)
router.get('/customers/list', orderController.getCustomerNames);

// Get all orders
router.get('/', orderController.getAll);

// Create new order
router.post('/', orderController.create);

// Update order
router.put('/:orderId', orderController.update);

// Delete order
router.delete('/:orderId', orderController.delete);

module.exports = router;
