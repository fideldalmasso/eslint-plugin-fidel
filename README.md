# eslint-plugin-fidel

This plugin add rules for detecting unknown props passed to React components, following View-Container pattern.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-fidel`:

```sh
npm install eslint-plugin-fidel --save-dev
```

## Usage

Add `fidel` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "fidel"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "fidel/fidel-rule-2": 1
    }
}
```

## Rules

<!-- begin auto-generated rules list -->

| Name                                       | Description                                             |
| :----------------------------------------- | :------------------------------------------------------ |
| [fidel-rule-1](docs/rules/fidel-rule-1.md) | This rule fires with error always, for testing purposes |
| [fidel-rule-2](docs/rules/fidel-rule-2.md) | Detect unknown props passed to a component in React     |

<!-- end auto-generated rules list -->


