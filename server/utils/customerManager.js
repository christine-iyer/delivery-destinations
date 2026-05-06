const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

let customersCache = null;

// Load customer list from CSV
const loadCustomers = () => {
  if (customersCache) {
    return customersCache;
  }

  try {
    const csvPath = path.join(
      __dirname,
      '../../client/data/customerContactList.csv'
    );
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Create email to customer name mapping
    customersCache = {};
    records.forEach((record) => {
      customersCache[record.Email.toLowerCase()] = record.Customer;
    });

    return customersCache;
  } catch (error) {
    console.error('Error loading customer list:', error);
    return {};
  }
};

// Get customer name by email
const getCustomerByEmail = (email) => {
  const customers = loadCustomers();
  return customers[email.toLowerCase()] || null;
};

// Get all unique customers
const getAllCustomers = () => {
  const customers = loadCustomers();
  const uniqueCustomers = [...new Set(Object.values(customers))];
  return uniqueCustomers.sort();
};

// Get all emails
const getAllEmails = () => {
  const customers = loadCustomers();
  return Object.keys(customers);
};

module.exports = {
  loadCustomers,
  getCustomerByEmail,
  getAllCustomers,
  getAllEmails,
};
