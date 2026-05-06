const { google } = require('googleapis');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Generate Order ID (e.g., ORD-20240506-001)
const generateOrderId = () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${date}-${random}`;
};

// Get all orders from sheet
const getOrders = async (spreadsheetId) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Orders!A2:I', // Skip header row
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      customerName: row[0] || '',
      deliveryDestination: row[1] || '',
      invoiceTotal: row[2] || '',
      numberOfBoxes: row[3] || '',
      orderId: row[4] || '',
      status: row[5] || '',
      notes: row[6] || '',
      deliveryDate: row[7] || '',
      timestamp: row[8] || '',
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Add new order to sheet
const addOrder = async (spreadsheetId, order) => {
  try {
    const timestamp = new Date().toISOString();
    const orderId = generateOrderId();

    const values = [
      [
        order.customerName,
        order.deliveryDestination,
        order.invoiceTotal,
        order.numberOfBoxes,
        orderId,
        order.status || 'Pending',
        order.notes || '',
        order.deliveryDate,
        timestamp,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Orders!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return {
      ...order,
      timestamp,
      orderId,
      status: order.status || 'Pending',
    };
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

// Update order in sheet
const updateOrder = async (spreadsheetId, orderId, updatedOrder) => {
  try {
    const orders = await getOrders(spreadsheetId);
    const rowIndex = orders.findIndex((order) => order.orderId === orderId);

    if (rowIndex === -1) {
      throw new Error('Order not found');
    }

    const rowNumber = rowIndex + 2; // +2 because header is row 1, data starts at row 2
    const range = `Orders!A${rowNumber}:I${rowNumber}`;

    const values = [
      [
        orders[rowIndex].customerName,
        updatedOrder.deliveryDestination || orders[rowIndex].deliveryDestination,
        updatedOrder.invoiceTotal || orders[rowIndex].invoiceTotal,
        updatedOrder.numberOfBoxes || orders[rowIndex].numberOfBoxes,
        orderId,
        updatedOrder.status || orders[rowIndex].status,
        updatedOrder.notes || orders[rowIndex].notes,
        updatedOrder.deliveryDate || orders[rowIndex].deliveryDate,
        orders[rowIndex].timestamp,
      ],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return { ...orders[rowIndex], ...updatedOrder };
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Delete order from sheet
const deleteOrder = async (spreadsheetId, orderId) => {
  try {
    const orders = await getOrders(spreadsheetId);
    const rowIndex = orders.findIndex((order) => order.orderId === orderId);

    if (rowIndex === -1) {
      throw new Error('Order not found');
    }

    const rowNumber = rowIndex + 2; // +2 because header is row 1, data starts at row 2

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // sheet index
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    });

    return { success: true, orderId };
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

module.exports = {
  sheets,
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  generateOrderId,
};
