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

const DEBUG_MODE = true;
let cache = null;

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

        let data = getCache();
        if (!data) {
          return;
        }

        let filePath = '';
        if (importPathName.endsWith('Container')) {
          filePath = Object.entries(data['components']).find(
            e => e[1].container === importPathName + '.js'
          );
          if (!filePath) {
            console.log('Container reference not found in cache .json file');
            return;
          }
          filePath = filePath[0];
        } else {
          filePath = importPathName.endsWith('.jsx') ? importPathName : importPathName + '.jsx';
        }
        let allowedProps = [];
        if (!(data['components'][filePath] && data['components'][filePath].validProps)) {
          // not found in json
          console.log('Props from ' + filePath + " couldn't be detected");
          return;
        }
        allowedProps = data['components'][filePath].validProps;
        attributes.forEach(attr => {
          if (!(attr && attr.name && attr.name.name)) {
            // here, the prop is a <Component /> -> we can't do anything about it
            return;
          }
          if (!allowedProps.includes(attr.name.name)) {
            if (DEBUG_MODE) console.log('Prop Error found in ' + context.getFilename());
            context.report({
              node: attr,
              loc: attr.loc,

              message: `Unknown prop in ${component}: ${attr.name.name}`
            });
          }
        });
      },
      CallExpression: async function (node) {
        if (
          context.getFilename().toLowerCase().includes('saga') &&
          node.arguments.length > 1 &&
          node.arguments[0].property &&
          node.arguments[0].property.name &&
          (node.arguments[0].property.name.toLowerCase().includes('querie') ||
            node.arguments[0].property.name.toLowerCase().includes('query'))
        ) {
          let queryName = node.arguments[0].property.name;
          const args = node.arguments[1].properties;

          let data = getCache();
          if (!data) {
            return;
          }
          const allowedVariables = data['queries'][queryName].queryVariables;
          args.forEach(arg => {
            if (!allowedVariables.includes(arg.key.name)) {
              if (DEBUG_MODE) console.log('Query Error found in ' + context.getFilename());
              context.report({
                node,
                loc: arg.loc,
                message: `Unknown variable in ${queryName}: ${arg.key.name}`
              });
            }else{
              if (DEBUG_MODE) console.log('NO ERROR: ' + context.getFilename());
            }
          });
        } else {
          if (DEBUG_MODE) console.log('IGNORED: ' + context.getFilename());
          return;
        }
      }
    };
  }
};

function getCache() {
  try {
    if (!cache) {
      if (!fs.existsSync('./fidel.json')) {
        console.log('fidel.json file not found. Running python script');
        let ret = reRunPythonScript();
        if (!ret) {
          return false;
        }
      }

      cache = fs.readFileSync('./fidel.json', 'utf8');
      cache = JSON.parse(cache);
      if (cache['date']) {
        const fechaActualizacion = new Date(cache['date']);
        const now = new Date();
        const difference = diff_minutes(now, fechaActualizacion);
        if (difference > 5) {
          console.log('fidel.json file is outdated. Rerunning python script');
          let ret = reRunPythonScript();
          if (!ret) {
            return false;
          }
        }
      }
      return cache;
    } else {
      return cache;
    }
  } catch (err) {
    console.error('cache .json file not found or wrong format');
    return false;
  }
}

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
  if (write_questions.status !== 0) {
    console.log('Error running python script');
    return false;
  }
  console.log('Finished running python file');
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
      if (
        specifiers &&
        specifiers[0] &&
        source.value.startsWith('.') &&
        specifiers[0].local.name === componentName
      ) {
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
