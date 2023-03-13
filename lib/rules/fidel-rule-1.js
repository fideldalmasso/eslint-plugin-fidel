/**
 * @fileoverview asdfasdf
 * @author fidel
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "asdfasdf",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
    messages: {
      someMessageId: 'Some error message',
    },
  },

  create(context) {
    // variables should be defined here

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      // visitor functions for different types of nodes
      Program: function (node) {
        let x = true;
        if (x) {
          context.report({
            node: node,
            messageId: "someMessageId",
            // eslint-disable-next-line eslint-plugin/prefer-message-ids
            
          });
        }
  
      }
      
    };
  },
};
