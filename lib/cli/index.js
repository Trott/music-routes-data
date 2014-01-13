module.exports = {
  dir: function (output) {
    console.dir(output);
  },

  exit: function (code) {
    process.exit(code);
  },

  error: function (message) {
    console.error(message);
  },

  argv: require('./argv'),
};
