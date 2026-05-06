import React from 'react';
import './OrdersTable.css';

function OrdersTable({ orders, onEdit, onDelete }) {
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString() +
      ' ' +
      new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
  };

  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return '$' + parseFloat(value).toFixed(2);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="orders-table-container">
      <div className="table-responsive">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Timestamp</th>
              <th>Customer Name</th>
              <th>Delivery Date</th>
              <th>Delivery Destination</th>
              <th>Invoice Total</th>
              <th>Boxes</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="order-row">
                <td className="order-id">{order.orderId}</td>
                <td className="timestamp">
                  {formatDate(order.timestamp)}
                </td>
                <td className="customer-name">{order.customerName}</td>
                <td className="delivery-date">
                  {new Date(order.deliveryDate).toLocaleDateString()}
                </td>
                <td className="delivery-destination">
                  {order.deliveryDestination}
                </td>
                <td className="invoice-total">
                  {formatCurrency(order.invoiceTotal)}
                </td>
                <td className="boxes-count">{order.numberOfBoxes}</td>
                <td className="status">
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="notes" title={order.notes}>
                  {order.notes || '-'}
                </td>
                <td className="actions">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => onEdit(order)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => onDelete(order.orderId)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersTable;
