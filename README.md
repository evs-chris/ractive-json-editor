# ractive-json-editor

A JSON tree-ish editor for any old data. Check out the [demo](https://evs-chris.github.io/ractive-json-editor).

## Getting it

Well for now, you just clone this repo, `npm i`, and `npm run-script build`.

## Usage

Assuming you have something like:

```js
Ractive.components.JsonEditor = JsonEditor;
```

you can set the `root` and whether or not the data is `editable`(default `true`).

```html
<JsonEditor root="{{some.obj}}" />
<JsonEditor root="{{some.obj}}" editable="false" />
```
