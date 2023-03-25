"use strict";

module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:eslint-plugin/recommended",
    "plugin:node/recommended",
  ],
  "parserOptions": {
    "ecmaVersion": 8,
    "requireConfigFile": false,
    "allowImportExportEverywhere": true,
    "sourceType": "module",
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "impliedStrict": true,
      "jsx": true,
      "modules": true
    },
  },
  env: {
    node: true,
  },
  plugins:[],
  rules: {
    "indent": ["error", 2],
  },
  overrides: [
    {
      files: ["tests/**/*.js"],
      env: { mocha: true },
    },
  ],
};
