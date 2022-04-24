const validateQuery = (req, res, next) => {
  try {
    allowQuery = ["page", "city", "company", "rating", "sort", "order"];
    query = Object.keys(req.query);
    query.forEach((item) => {
      if (allowQuery.indexOf(item) === -1) {
        const error = new Error(`${item} Query not allow`);
        error.statusCode = 400;
        throw error;
      }
    });
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validateQuery;