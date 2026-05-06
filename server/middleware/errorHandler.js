const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.message.includes('UNAUTHENTICATED')) {
    return res.status(401).json({ error: 'Google Sheets authentication failed' });
  }

  if (err.message.includes('PERMISSION_DENIED')) {
    return res.status(403).json({ error: 'Permission denied accessing Google Sheets' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
