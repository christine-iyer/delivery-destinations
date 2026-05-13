import React, { useState, useEffect } from 'react';
import axios from 'axios';

import deliveryDestinations from '../data/deliveryDestinations';
import './OrderForm.css';

function OrderForm({ onSubmit, onCancel, initialData, isEditMode }) {
  const [formData, setFormData] = useState({
    customerName: '',
    deliveryDate: '',
    deliveryDestination: '',
    invoiceTotal: '',
    numberOfBoxes: '',
    calculatedFee: 0,
    status: 'Pending',
    notes: '',
  });

  const [customerNames, setCustomerNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate fee based on invoice total (sliding scale)
  const calculateFee = (invoiceTotal) => {
    const total = parseFloat(invoiceTotal) || 0;
    if (total <= 66.66) {
      return 10;
    } else if (total <= 110) {
      return total * 0.15;
    } else if (total <= 200) {
      return total * 0.14;
    } else if (total <= 450) {
      return total * 0.12;
    } else {
      return total * 0.1;
    }
  };

  // Get next Friday
  const getNextFriday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = dayOfWeek === 5 ? 7 : (5 - dayOfWeek + 7) % 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isEditMode && initialData) {
      const dataWithFee = {
        ...initialData,
        calculatedFee: calculateFee(initialData.invoiceTotal || 0),
      };
      setFormData((prev) => ({
        ...prev,
        ...dataWithFee,
      }));
    } else {
      // Set default delivery date to next Friday
      setFormData((prev) => ({
        ...prev,
        deliveryDate: getNextFriday(),
      }));
    }
    fetchCustomerNames();
  }, []);

  const fetchCustomerNames = async () => {
    try {
      const response = await axios.get('/api/orders/customers/list');
      setCustomerNames(response.data.data || []);
    } catch (err) {
      console.error('Error fetching customer names:', err);
    }
  };

  const handleCustomerChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, customerName: name }));
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    
    // Recalculate fee if invoiceTotal changed
    if (name === 'invoiceTotal') {
      updatedData.calculatedFee = calculateFee(value);
    }
    
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isEditMode) {
      // For edit mode, submit without customerName
      const editData = {
        deliveryDate: formData.deliveryDate,
        deliveryDestination: formData.deliveryDestination,
        invoiceTotal: formData.invoiceTotal,
        numberOfBoxes: formData.numberOfBoxes,
        status: formData.status,
        notes: formData.notes,
      };
      onSubmit(editData);
    } else {
      // For create mode, validate required fields
      if (!formData.customerName) {
        setError('Please select a customer');
        setLoading(false);
        return;
      }

      if (
        !formData.deliveryDate ||
        !formData.deliveryDestination ||
        !formData.invoiceTotal ||
        !formData.numberOfBoxes
      ) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      onSubmit({
        customerName: formData.customerName,
        deliveryDate: formData.deliveryDate,
        deliveryDestination: formData.deliveryDestination,
        invoiceTotal: formData.invoiceTotal,
        numberOfBoxes: formData.numberOfBoxes,
        calculatedFee: formData.calculatedFee,
        status: formData.status,
        notes: formData.notes,
      });
    }

    setLoading(false);
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>{isEditMode ? 'Edit Order' : 'Create New Order'}</h3>

        {!isEditMode && (
          <div className="form-group">
            <label htmlFor="customerName">Customer *</label>
            <select
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleCustomerChange}
              required
              className="form-input"
            >
              <option value="">Select a customer...</option>
              {customerNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="deliveryDate">
            Delivery Date (Friday) *
            <span className="field-note">Orders must be for Fridays. Please be mindful when selecting future dates.</span>
          </label>
          <input
            id="deliveryDate"
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="deliveryDestination">Delivery Destination *</label>
          <select
            id="deliveryDestination"
            name="deliveryDestination"
            value={formData.deliveryDestination}
            onChange={handleInputChange}
            required
            className="form-input"
          >
            <option value="">Select a destination...</option>
            {deliveryDestinations.map((destination) => (
              <option key={destination} value={destination}>
                {destination}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="invoiceTotal">Invoice Total (USD) *</label>
            <input
              id="invoiceTotal"
              type="number"
              name="invoiceTotal"
              value={formData.invoiceTotal}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numberOfBoxes">Number of Boxes *</label>
            <input
              id="numberOfBoxes"
              type="number"
              name="numberOfBoxes"
              value={formData.numberOfBoxes}
              onChange={handleInputChange}
              placeholder="0"
              step="1"
              required
              className="form-input"
            />

          <div className="form-group">
            <label htmlFor="calculatedFee">Commission Fee (USD)</label>
            <input
              id="calculatedFee"
              type="text"
              value={formData.calculatedFee.toFixed(2)}
              readOnly
              className="form-input"
            />
          </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any additional notes..."
            rows="3"
            className="form-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default OrderForm;
