"use strict";

module.exports = {
  root: true,
  extends: [
    // "eslint:recommended",
    // "plugin:eslint-plugin/recommended",
    // "plugin:node/recommended",
  ],
  "parser": "@babel/eslint-parser",
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
    "babelOptions": {
      "presets": ["@babel/preset-react"]
    }
  },
  env: {
    node: true,
  },
  plugins:['fidel-plugin-id'],
  rules: {
    // "fidel-plugin-id/fidel-rule-1": "error",
    "fidel-plugin-id/fidel-rule-2": "warn",
    "react-hooks/exhaustive-deps": "off",
  },
  overrides: [
    {
      files: ["tests/**/*.js"],
      env: { mocha: true },
    },
  ],
};
