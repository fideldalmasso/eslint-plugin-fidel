/**
 * @fileoverview sdfgsdfgsdfgsdfg
 * @author fidel
 */
'use strict';
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
      url: null // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [] // Add a schema if the rule has options
  },

  create(context) {
    return {
      JSXOpeningElement: async function (node) {
        const { attributes } = node;
        if (!context.getFilename().endsWith('.jsx')) {
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
        importPathName = importPathName.match(/(src\/.*)/)[1];

        let data;
        try {
          if (!fs.existsSync('./fidel.json')) {
            console.log('fidel.json file not found. Running python script');
            let ret = reRunPythonScript();
            if(!ret){
              return;
            }
          }

          data = fs.readFileSync('./fidel.json', 'utf8');
          data = JSON.parse(data);
          if (data['date']) {
            const fechaActualizacion = new Date(data['date']);
            const now = new Date();
            const difference = diff_minutes(now, fechaActualizacion);
            if (difference > 5) {
              console.log('fidel.json file is outdated');
              let ret = reRunPythonScript();
              if(!ret){
                return;
              }
            }
          }
        } catch (err) {
          console.error('cache .json file not found or wrong format');
          return;
        }

        let filePath = '';
        if (importPathName.endsWith('Container')) {
          filePath = Object.entries(data).find(e => e[1].container === importPathName + '.js');
          if (!filePath) {
            console.log("container reference not found in cache .json file");
            return;
          }
          filePath = filePath[0];
        }
        filePath = importPathName.endsWith('.jsx') ? importPathName : importPathName + '.jsx';

        let allowedProps = [];
        allowedProps = data[filePath].validProps;
        if (!allowedProps) {
          // not found in json
          console.log("allowed props not found in cache .json file");
          return;
        }
        attributes.forEach(attr => {
          if (!allowedProps.includes(attr.name.name)) {
            context.report({
              node: attr,
              loc: attr.loc,

              message: `Unknown prop in ${component}: ${attr.name.name}`
            });
          }
        });
      }
    };
  }
};

function diff_minutes(dt1, dt2) {
  var diff = (dt1.getTime() - dt2.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}

function reRunPythonScript() {
  const cp = require('child_process');
  const write_questions = cp.spawnSync(
    'python',
    ['./node_modules/eslint-plugin-fidel/lib/util/createCache.py'],
    { stdio: 'inherit' }
  );
  if(write_questions.status !== 0) {
    console.log('Error running python script');
    return false;
  }
  console.log('finished running python file');
  return true;
}

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

  let result = '';

  babelTraverse(ast, {
    ImportDeclaration(path) {
      const { specifiers, source } = path.node;
      if (source.value.startsWith('.') && specifiers[0].local.name === componentName) {
        result = source.value;
      }
    }
  });

  if (result.length > 0) {
    let directory = filePath.substring(0, filePath.lastIndexOf('/') + 1);
    result = path.resolve(directory, result);
    // console.log("The path is: "+ result);
  }
  return result;
}