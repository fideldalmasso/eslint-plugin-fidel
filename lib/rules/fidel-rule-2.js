/**
* @fileoverview sdfgsdfgsdfgsdfg
* @author fidel
*/
"use strict";
/** @type {import('eslint').Rule.RuleModule} */
const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;
// const resolve = require('resolve');
const path = require('path');
const fs = require('fs');

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
    
    return {
      JSXOpeningElement: async function (node) {
        const { attributes } = node;
        if(!context.getFilename().endsWith(".jsx")){
          // cannot do anything yet
          return;
        }
        const component = node.name.name;

        if (!attributes || attributes.length === 0) {
          return;
        }
        
        // const propNames = attributes.map(attr => attr.name.name);



        let importPathName = getPathFromImport(component, context.getFilename());
        if (!importPathName) {
          return; // component import file is not found or is not relative
        }

        // convert absolute path to relative path
        importPathName = importPathName.match(/(src\/.*)/s)[1];

        let data;
        try {
          data = fs.readFileSync('./fidel.json', 'utf8');
          data = JSON.parse(data);
        } catch (err) {
          console.error(".json file not found or wrong format");
          return;
        }
      
        let filePath = "";
        if(importPathName.endsWith("Container")){
          filePath = Object.entries(data).find(e=>e[1].container===importPathName+'.js')
          if(!filePath){
            // not found in json
            return;
          }
          filePath=filePath[0];
          // cannot do anything yet
          // containerFilePath=importPathName+".js";
          // filePath=getComponentPathFromContainer(containerFilePath);
          
        }
        filePath=importPathName.endsWith(".jsx")?importPathName:importPathName+".jsx";



        let allowedProps = [];
        allowedProps  = data[filePath]?.validProps;
        if(!allowedProps){
          // not found in json
          return;
        }
        // const unknownProps = propNames.filter(prop => !allowedProps.includes(prop));
        
        attributes.forEach(attr => {
          if(!allowedProps.includes(attr.name.name)){
            context.report({
              node: attr,
              loc: attr.loc,
              
              message: `Unknown prop in ${component}: ${attr.name.name}`,
            });
          }
        });
        
      },
      
    };
  },
};

// function getAllowedProps(componentName, filePath) {
//   const code = fs.readFileSync(filePath, 'utf8');
//   const ast = babelParser.parse(code, {
//     sourceType: 'module',
//     plugins: ['jsx']
//   });
  
//   let propsList = [];
  
//   babelTraverse(ast, {
//     VariableDeclarator(path) {
//       if(path.node.init && path.node.init.name){
//         var nombre = path.node.init.name;
//         if(nombre==="props"){
//           var props = path.node.id.properties;
//           if (props) {
//             propsList= props.map((x) => x.key.name);
//           }
//         }
//       }
//     }});
     
//     return propsList;
//   }
  
  
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