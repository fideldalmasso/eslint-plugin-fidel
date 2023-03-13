/**
 * @fileoverview sdfgsdfgsdfgsdfg
 * @author fidel
 */
"use strict";
/** @type {import('eslint').Rule.RuleModule} */
const fs = require('fs');
const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;
const resolve = require('resolve');
const path = require('path');
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: 'Detect unknown props passed to a component in React',
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    // variables should be defined here
    let x=10;
    let componentName="undefinedFidel"
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      // ImportDeclaration: function (node) {
      //   const {specifiers, source} = node;
      //   if(specifiers[0].local.name === componentName){
      //     console.log(source.value);
      //   }
      //   },
      JSXOpeningElement: function (node) {
      if(!context.getFilename().endsWith(".jsx")){
          // cannot do anything yet
          return;
        }
        const component = node.name.name;
        componentName=component;
        const importPathName = getPathFromImport(component, context.getFilename());
        if (!importPathName) {
          return; // component import file is not found or is not relative
        }
        const { attributes } = node;

        if (!attributes || attributes.length === 0) {
          return;
        }

        const propNames = attributes.map(attr => attr.name.name);

        

        // let filePath ="pillButtonView.jsx";
        let filePath = "";
        if(importPathName.endsWith("Container")){
          // cannot do anything yet
          // containerFilePath=importPathName+".js";
          // filePath=getComponentPathFromContainer(containerFilePath);

          return;
        }else{
          filePath=importPathName.endsWith(".jsx")?importPathName:importPathName+".jsx";
        }


        let allowedProps = [];
        if (filePath) {
          allowedProps = getAllowedProps(component, filePath);
        }else{
          return;
        }

        const unknownProps = propNames.filter(prop => !allowedProps.includes(prop));

        attributes.forEach(attr => {
          if(!allowedProps.includes(attr.name.name)){
            context.report({
              node: attr,
              loc: attr.loc,
              // eslint-disable-next-line eslint-plugin/prefer-message-ids
              message: `Unknown prop passed to ${component}: ${attr.name.name}`,
            });
          }
        });

        // if (unknownProps.length > 0) {
        //   context.report({
        //     node,
        //     // eslint-disable-next-line eslint-plugin/prefer-message-ids
        //     message: `Unknown prop(s) passed to ${component}: ${unknownProps.join(', ')}`,
        //   });
        // }
      },
     
    };
  },
};


function getAllowedProps(componentName, filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  
  let propsList = [];
  
  babelTraverse(ast, {
    VariableDeclarator(path) {
      if(path.node.init && path.node.init.name){
      var nombre = path.node.init.name;
      if(nombre==="props"){
        var props = path.node.id.properties;
        if (props) {
          propsList= props.map((x) => x.key.name);
        }
    }
  }
  }});


  return propsList;
}


function getPathFromImport(componentName, filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  
  let result = "";
  
  babelTraverse(ast, {
    ImportDeclaration(path) {
      const {specifiers, source} = path.node;
      if(source.value.startsWith(".") && specifiers[0].local.name === componentName){
        result = source.value;
      }
    }});
    
    if(result.length>0){
      let directory = filePath.substring(0,filePath.lastIndexOf("/")+1)
      result = path.resolve(directory, result)
      // console.log("The path is: "+ result);

  }
  return result;
}