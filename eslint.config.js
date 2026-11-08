const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["coverage/**", "tmp/**"] },
  {
    files: ["**/*.js", "bin/mrd", "bin/verify"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ["spec/**/*.js"],
    languageOptions: { globals: globals.jasmine },
  },
];
