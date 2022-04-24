const sendResponse = (statusCode, data, message, res, next) => {
  const result = { data, message };
  return res.status(statusCode).send(result);
};

module.exports = sendResponse;
