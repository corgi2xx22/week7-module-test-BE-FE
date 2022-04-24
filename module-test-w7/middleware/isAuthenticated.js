const isAuthenticated = (req, res, next) => {
  try {
    const { accesstoken } = req.headers;
    if (!accesstoken || accesstoken !== "123") {
      const error = new Error("Please login");
      error.statusCode = 401;
      throw error;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isAuthenticated;
