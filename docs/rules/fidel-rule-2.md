# Detect unknown props passed to a component in React (`fidel/fidel-rule-2`)

<!-- end auto-generated rule header -->

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```jsx
import Card from '../cardView';
<Card key={'1234'}/> 
// 'key' prop is not defined in props object inside cardView file
```

Examples of **correct** code for this rule:

```jsx
import Card from '../cardView';
<Card bold={true}/> 
// 'bold' prop is defined in props object inside cardView file
```



If there are any options, describe them here. Otherwise, delete this section.

## When Not To Use It

Give a short description of when it would be appropriate to turn off this rule.

## Further Reading

If there are other links that describe the issue this rule addresses, please include them here in a bulleted list.
