/**
 * @fileoverview sdfgsdfgsdfgsdfg
 * @author fidel
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/fidel-rule-2"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run("fidel-rule-2", rule, {
  valid: [
    // give me some code that won't trigger a warning
  ],

  invalid: [
    {
      code: "ssdfsds",
      errors: [{ message: "Fill me in.", type: "Me too" }],
    },
  ],
});
