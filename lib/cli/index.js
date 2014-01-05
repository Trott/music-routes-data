module.exports = {
  exit: function (code) {
    process.exit(code);
  },

  error: function (message) {
    console.error(message);
  },

  argv: require('./argv'),
};
