# eslint-plugin-fidel

asdfa

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

Add `fidel-plugin-id` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "fidel-plugin-id"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "fidel-plugin-id/rule-name": 2
    }
}
```

## Rules

<!-- begin auto-generated rules list -->

| Name                                       | Description                                         |
| :----------------------------------------- | :-------------------------------------------------- |
| [fidel-rule-1](docs/rules/fidel-rule-1.md) | asdfasdf                                            |
| [fidel-rule-2](docs/rules/fidel-rule-2.md) | Detect unknown props passed to a component in React |

<!-- end auto-generated rules list -->


