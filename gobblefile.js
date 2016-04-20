var gobble = require('gobble');
var sander = gobble.sander;
var request = require('request-promise');

var RACTIVE_VERSION = 'edge';
var FNAME = 'ractive-json-editor.js';

// TODO: add an es6 build

function ractive(code, opts) {
  if (gobble.env() === 'production') {
    var r = require('./lib/ractive.js');
    return 'const template = ' + JSON.stringify(r.parse(code)) + ';\nexport default template;';
  } else {
    return 'const template = ' + JSON.stringify(code) + ';\nexport default template;';
  }
}
ractive.defaults = {
  accept: ['.html'],
  ext: '.js'
};

var globalCSS = '';
function grabCSS(code, opts) {
  globalCSS = code;
  return '';
}
grabCSS.defaults = {
  accept: ['.css']
};

function inlineCSS(indir, outdir, opts) {
  return sander.readFile(indir, FNAME).then(function(buf) {
    var code = buf.toString('utf8');

    if (code.indexOf('"<@ cssHere @>"') !== -1) {
      code = code.replace('"<@ cssHere @>"', JSON.stringify(globalCSS));
    }

    return sander.writeFile(outdir, FNAME, code);
  });
}

var src = gobble('src').
  transform('stylus', { compress: true }).
  transform(grabCSS).
  transform(ractive).
  transform('buble', { transforms: { modules: false } }).
  transform('rollup', {
    entry: 'index.js',
    dest: FNAME,
    format: 'umd',
    moduleName: 'JsonEditor'
  }).
  transform(inlineCSS);

if (gobble.env() !== 'production') {
  var sandbox = gobble('sandbox').moveTo('sandbox').
    transform('buble-html').
    transform('stylus-html');
  var lib = gobble('lib').moveTo('lib');
  module.exports = gobble([src, lib, sandbox]);

  sander.stat('lib/ractive.js').then(null, function() {
    request('http://cdn.ractivejs.org/' + RACTIVE_VERSION + '/ractive.js').then(function(text) {
      console.log('getting ' + RACTIVE_VERSION + ' version of Ractive.js...');
      return sander.writeFile('lib/ractive.js', text);
    });
  });
} else module.exports = gobble([src]);
