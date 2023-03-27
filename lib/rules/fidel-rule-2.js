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

const DEBUG_MODE = false;
let cache = null;
const imports = {};

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
    let imports = {};
    return {
      ImportDeclaration: function (node) {
        const { specifiers, source } = node;
        const names = specifiers.map(s => s.local.name);
        const source2 = source.value;
        if (!source2.startsWith('.')) {
          // not relative
          return;
        }
        const thisFilePath = context.getFilename();
        const fullPath = path.resolve(
          thisFilePath.substring(0, thisFilePath.lastIndexOf('/') + 1),
          source2
        );
        let relativePath = fullPath.match(/(src\/.*)/)[1];
        if (relativePath.startsWith('src/components')) {
          relativePath += '.jsx';
        } else {
          relativePath += '.js';
        }

        names.forEach(n => {
          imports[n] = relativePath;
        });

        // console.log(`${names} -> ${relativePath}`);
        // console.log(imports)
      },
      JSXOpeningElement: async function (node) {
        const { attributes } = node;
        const component = node.name.name;

        if (!attributes || attributes.length === 0) {
          return;
        }

        // const propNames = attributes.map(attr => attr.name.name);

        // VIEJO
        // let importPathName = getPathFromImport(component, context.getFilename());
        // NUEVO
        let importPathName = imports[component];
        if (!importPathName) {
          return; // component import file is not found or is not relative
        }

        // convert absolute path to relative path
        // importPathName = importPathName.match(/(src\/.*)/)[1]; //VIEJO

        let data = getCache();
        if (!data) {
          return;
        }

        let filePath = '';
        if (importPathName.includes('Container')) {
          filePath = Object.entries(data['components']).find(
            e => e[1].container === importPathName
          );
          if (!filePath) {
            console.log('Container reference not found in cache .json file');
            return;
          }
          filePath = filePath[0];
          // } else {
          // filePath = importPathName.endsWith('.jsx') ? importPathName : importPathName + '.jsx';
        } else {
          filePath = importPathName;
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
      'CallExpression[callee.name=/GraphOp|graphqlOperation/]': async function (node) {
        let queryName = null;
        let parentModule = null;
        parentModule = node.arguments[0]?.object?.name;
        if (!parentModule) node.parent.argument?.parent?.argument?.arguments[0]?.object?.name; //second try
        if (!parentModule)
          parentModule = node.parent.parent?.argument?.arguments[1]?.arguments[0]?.object?.name; //third try
        if (
          !(node.arguments[0] && node.arguments[0].property && node.arguments[0].property.name) &&
          node.arguments[0].name
        ) {
          queryName = node.arguments[0].name;
        } else {
          queryName = node.arguments[0].property.name;
        }
        if (!queryName) {
          return;
        }
        const queryName2 = node.callee.name + '_' + queryName;
        if (DEBUG_MODE) console.log(`->Analyzing ${queryName2} in file ${context.getFilename()}`);
        // if (DEBUG_MODE) console.log(imports);

        const args =
          node.arguments[1] && node.arguments[1].properties ? node.arguments[1].properties : null;
        if (!args || !args[0].key || !args[0].key.name) {
          if (DEBUG_MODE)
            console.log(
              `Object argument from query couldn't be analyzed. The obj it's probably defined somewhere else, or maybe the call doesn't receive any object.`
            );
          return;
        }
        let argNames = [];
        try {
          argNames = args.map(arg => arg.key.name);
        } catch (e) {
          if (DEBUG_MODE) console.log(`Cannot extract all variables from query call`);
          return;
        }

        let data = getCache();
        if (!data) {
          return;
        }
        let importPathName = imports[parentModule ? parentModule : queryName];
        if (data['queries'][importPathName] === undefined) {
          console.log(`Missing file ${importPathName} from ${queryName} not found in cache.`);
          return;
        }
        if (data['queries'][importPathName][queryName] === undefined) {
          console.log(
            `${queryName} not found in cache. It's probably assigned as an alias in the import`
          );
          return;
        }
        const allowedVariables = data['queries'][importPathName][queryName].queryVariables;
        args.forEach(arg => {
          if (!allowedVariables.includes(arg.key.name)) {
            if (DEBUG_MODE)
              console.log(
                `Variable ${arg.key.name} not found in ${queryName}: allowedV=[${allowedVariables}]`
              );
            context.report({
              node,
              loc: arg.loc,
              message: `Unknown variable in ${queryName}: ${arg.key.name}`
            });
          } else {
            // if (DEBUG_MODE) console.log(`No error in ${queryName}: allowedV=[${allowedVariables}]`);
          }
        });
      }
    };
    // CallExpression: async function (node) {
    //   if (
    //     context.getFilename().toLowerCase().includes('saga') &&
    //     node.arguments.length > 1 &&
    //     node.arguments[0].property &&
    //     node.arguments[0].property.name
    //     // (node.arguments[0].property.name.toLowerCase().includes('querie') ||
    //     //   node.arguments[0].property.name.toLowerCase().includes('query'))
    //   ) {
    //     let queryName = node.arguments[0].property.name;
    //     const args = node.arguments[1].properties;

    //     if (DEBUG_MODE)
    //       console.log('Analyzing ' + queryName + ' in file ' + context.getFilename());
    //     let data = getCache();
    //     if (!data) {
    //       return;
    //     }
    //     if (data['queries'][queryName] === undefined) {
    //       console.log(queryName + ' not found in cache');
    //       return;
    //     }
    //     const allowedVariables = data['queries'][queryName].queryVariables;
    //     args.forEach(arg => {
    //       if (!allowedVariables.includes(arg.key.name)) {
    //         if (DEBUG_MODE)
    //           console.log('Error found in ' + queryName + ' in file ' + context.getFilename());
    //         context.report({
    //           node,
    //           loc: arg.loc,
    //           message: `Unknown variable in ${queryName}: ${arg.key.name}`
    //         });
    //       } else {
    //         if (DEBUG_MODE) console.log('NO ERROR: ' + context.getFilename());
    //       }
    //     });
    //   } else {
    //     let arr = [
    //       context.getFilename().toLowerCase().includes('saga'),
    //       node.arguments.length > 1
    //     ];

    //     if (DEBUG_MODE)
    //       console.log('IGNORED: ' + queryName + ' in file ' + context.getFilename() + ' ' + arr);
    //     return;
    //   }
    // }
    // };
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



// VIEJO: esta funcion busca el path del componente en el import
// function getPathFromImport(componentName, filePath) {
//   const code = fs.readFileSync(filePath, 'utf8');
//   const ast = babelParser.parse(code, {
//     sourceType: 'module',
//     plugins: ['jsx']
//   });

//   let result = '';

//   babelTraverse(ast, {
//     ImportDeclaration(path) {
//       const { specifiers, source } = path.node;
//       if (
//         specifiers &&
//         specifiers[0] &&
//         source.value.startsWith('.') &&
//         specifiers[0].local.name === componentName
//       ) {
//         result = source.value;
//       }
//     }
//   });

//   if (result.length > 0) {
//     let directory = filePath.substring(0, filePath.lastIndexOf('/') + 1);
//     result = path.resolve(directory, result);
//     // console.log("The path is: "+ result);
//   }
//   return result;
// }
