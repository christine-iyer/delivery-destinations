import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderForm from './components/OrderForm';
import OrdersTable from './components/OrdersTable';
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      const response = await axios.post('/api/orders', orderData);
      setOrders([response.data.data, ...orders]);
      setFormVisible(false);
      setError(null);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(
        err.response?.data?.error || 'Failed to create order'
      );
    }
  };

  const handleUpdateOrder = async (orderId, updatedData) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}`, updatedData);
      setOrders(
        orders.map((order) =>
          order.orderId === orderId ? response.data.data : order
        )
      );
      setEditingOrder(null);
      setError(null);
    } catch (err) {
      console.error('Error updating order:', err);
      setError(
        err.response?.data?.error || 'Failed to update order'
      );
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`/api/orders/${orderId}`);
        setOrders(orders.filter((order) => order.orderId !== orderId));
        setError(null);
      } catch (err) {
        console.error('Error deleting order:', err);
        setError(
          err.response?.data?.error || 'Failed to delete order'
        );
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Weekly Orders</h1>
        <p>Manage weekly delivery orders to Google Sheets</p>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        <div className="controls">
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormVisible(!formVisible);
              setEditingOrder(null);
            }}
          >
            {formVisible ? 'Cancel' : '+ New Order'}
          </button>
        </div>

        {formVisible && (
          <OrderForm
            onSubmit={handleCreateOrder}
            onCancel={() => setFormVisible(false)}
          />
        )}

        {editingOrder && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <h2>Edit Order {editingOrder.orderId}</h2>
              <OrderForm
                initialData={{
                  deliveryDestination: editingOrder.deliveryDestination,
                  invoiceTotal: editingOrder.invoiceTotal,
                  numberOfBoxes: editingOrder.numberOfBoxes,
                  status: editingOrder.status,
                  notes: editingOrder.notes,
                }}
                onSubmit={(data) => {
                  handleUpdateOrder(editingOrder.orderId, data);
                }}
                onCancel={() => setEditingOrder(null)}
                isEditMode
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet. Create your first order to get started!</p>
          </div>
        ) : (
          <OrdersTable
            orders={orders}
            onEdit={setEditingOrder}
            onDelete={handleDeleteOrder}
          />
        )}
      </main>
    </div>
  );
}

export default App;
