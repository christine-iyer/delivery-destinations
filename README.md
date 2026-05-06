# Weekly Orders - Google Sheets Integration

A lightweight React + Express app for managing weekly delivery orders directly to Google Sheets.

## Features

- ✅ **Full CRUD Operations**: Create, read, update, and delete orders
- ✅ **Google Sheets Integration**: All data synced to Google Sheets in real-time
- ✅ **Customer Auto-Lookup**: Email-based customer identification with auto-population
- ✅ **Form-like Interface**: Simple, intuitive UI for data entry
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Auto-Generated IDs**: Order IDs and timestamps created server-side

## Project Structure

```
google-invoice/
├── client/                    # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderForm.js
│   │   │   ├── OrderForm.css
│   │   │   ├── OrdersTable.js
│   │   │   └── OrdersTable.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── data/
│   │   └── customerContactList.csv
│   └── package.json
├── server/                    # Express backend
│   ├── controllers/
│   │   └── orderController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── orders.js
│   ├── utils/
│   │   ├── sheetsAPI.js      # Google Sheets API integration
│   │   └── customerManager.js # Customer list management
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14+) and npm
- Google Cloud Project with Sheets API enabled
- Service Account credentials (JSON file)

### Step 1: Google Cloud Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project called "Weekly Orders"

2. **Enable Google Sheets API**:
   - Search for "Google Sheets API" in the console
   - Click "Enable"

3. **Create a Service Account**:
   - Go to "Service Accounts" in the IAM & Admin section
   - Create a new service account named `weekly-orders-app`
   - Create a JSON key and download it
   - Keep this file safe—it contains credentials

4. **Create the Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet named "Weekly Orders"
   - Create a sheet named "Orders" (default name)
   - Add headers in the first row:
     ```
     Time Stamp | Customer Name | Delivery Destination | Invoice Total | Number of Boxes | Order ID | Status | Notes
     ```
   - Note the **Sheet ID** from the URL (long string between `/d/` and `/edit`)

5. **Share the Sheet**:
   - Share the spreadsheet with your service account email (found in the JSON key)
   - Give it "Editor" access

### Step 2: Backend Setup

1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in the values from your service account JSON and sheet ID:
     ```env
     GOOGLE_SHEET_ID=YOUR_SHEET_ID
     GOOGLE_PROJECT_ID=your-project-id
     GOOGLE_PRIVATE_KEY_ID=your-key-id
     GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
     GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
     GOOGLE_CLIENT_ID=your-client-id
     PORT=5000
     NODE_ENV=development
     ```

3. **Start the server**:
   ```bash
   npm start
   # Or with nodemon for development
   npm run dev
   ```

### Step 3: Frontend Setup

1. **Install dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## API Endpoints

### GET `/api/orders`
Get all orders from the sheet.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-05-06T14:30:00Z",
      "customerName": "3 Bug Farm",
      "deliveryDestination": "Kitchen",
      "invoiceTotal": "150.00",
      "numberOfBoxes": "5",
      "orderId": "ORD-20240506-1234",
      "status": "Pending",
      "notes": "Rush delivery"
    }
  ]
}
```

### POST `/api/orders`
Create a new order.

**Body**:
```json
{
  "email": "3bugfarm@gmail.com",
  "deliveryDestination": "Kitchen",
  "invoiceTotal": "150.00",
  "numberOfBoxes": "5",
  "status": "Pending",
  "notes": "Rush delivery"
}
```

### PUT `/api/orders/:orderId`
Update an existing order.

**Body**: Same fields as POST (but email is not included)

### DELETE `/api/orders/:orderId`
Delete an order.

### GET `/api/orders/customer/lookup?email=example@email.com`
Look up customer name by email.

### GET `/api/orders/emails/list`
Get list of all customer emails for autocomplete.

## Deployment to DigitalOcean

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **SSH into your droplet**:
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Clone or pull the repo**:
   ```bash
   cd /path/to/your/apps
   git clone <repo-url> google-invoice
   cd google-invoice
   ```

4. **Setup backend**:
   ```bash
   cd server
   npm install
   # Create .env file with production values
   nano .env
   ```

5. **Setup frontend build**:
   ```bash
   cd ../client
   npm install
   npm run build  # Creates optimized build in build/ folder
   ```

6. **Serve with Nginx or PM2**:
   - Option A: Use PM2 to run the Express server
   - Option B: Serve the React build with Nginx + proxy to Express

### Using PM2 (Recommended)

```bash
npm install -g pm2
cd /path/to/google-invoice/server
pm2 start server.js --name "weekly-orders"
pm2 save
pm2 startup
```

### Using Nginx

Configure Nginx to:
- Serve the React build from `/path/to/google-invoice/client/build`
- Proxy `/api/` requests to Express on port 5000

## Environment Variables

### Server (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SHEET_ID` | Google Sheet ID | `1a2b3c4d5e6f7g8h9i0j` |
| `GOOGLE_PROJECT_ID` | GCP Project ID | `my-project-12345` |
| `GOOGLE_PRIVATE_KEY_ID` | Service account key ID | `abc123def456` |
| `GOOGLE_PRIVATE_KEY` | Full private key (escaped newlines) | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_CLIENT_EMAIL` | Service account email | `app@project.iam.gserviceaccount.com` |
| `GOOGLE_CLIENT_ID` | Service account client ID | `123456789` |
| `PORT` | Express server port | `5000` |
| `NODE_ENV` | Environment | `production` |

## Development

### Running Locally

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd client
npm start
```

### Building for Production

**Frontend**:
```bash
cd client
npm run build  # Creates optimized build in build/ folder
```

**Backend**: No build step needed, runs Node directly.

## Troubleshooting

### "Customer email not found in contact list"
- Ensure your customer email matches exactly in `customerContactList.csv`
- Check that `client/data/customerContactList.csv` has the correct path

### "Google Sheets authentication failed"
- Verify service account has "Editor" access to the sheet
- Check that all environment variables are set correctly
- Ensure the private key has proper newline escaping in .env

### Sheet not updating
- Check that the sheet structure matches (should have "Orders" sheet)
- Verify headers are in row 1
- Check Google Sheets API quota in Cloud Console

### CORS errors
- Backend CORS is configured to accept all origins in development
- For production, update the CORS settings in `server/server.js`

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
