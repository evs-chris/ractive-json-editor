import mainTemplate from './template';

const template = Ractive.parse(mainTemplate);

// TODO: array splicing
// TODO: function editor

function isArray(it) { return !!it && Object.prototype.toString.call(it) === '[object Array]'; }
function getType(it) {
  if (it === null) return 'null';
  else if (typeof it === 'string') return 'string';
  else if (typeof it === 'number') return 'number';
  else if (typeof it === 'boolean') return 'boolean';
  else if (typeof it === 'function') return 'function';
  else if (typeof it === 'object' && isArray(it)) return 'array';
  else if (typeof it === 'object') return 'object';
  else return 'wat';
}
function join(arr) {
  return Ractive.joinKeys.apply(Ractive, arr);
}

const JsonEditor = Ractive.extend({
  template,
  css: "<@ cssHere @>",
  data() {
    return {
      getType,
      toggles: { root: true },
      edits: {},
      keys: {},
      extras: {},
      values: {},
      escapeKey: Ractive.escapeKey,
      editable: true
    };
  },
  renameKey(path, name) {
    const then = path;
    const value = this.get(then);
    path = Ractive.splitKeypath(path);
    const thenKey = path.pop();
    const base = this.get(join(path));
    path.push(name);
    const now = join(path);
    const edit = 'keys.' + Ractive.escapeKey(then);

    delete base[thenKey];
    this.update(then);
    this.set(edit, false);
    this.set(now, value);
  },
  removeKey(path) {
    path = Ractive.splitKeypath(path);
    const key = path.pop();
    const now = join(path);
    const base = this.get(now);
    delete base[key];
    this.update(now);
  },
  addKey(path) {
    const namePath = `values.${Ractive.escapeKey(path)}.name`;
    const name = this.get(namePath);
    if (!name) return;
    path = Ractive.splitKeypath(path);
    path.push(name);
    this.set(join(path), '');
    this.set(namePath, '');
  },
  startEdit(path) {
    path = `edits.${Ractive.escapeKey(path)}`;
    if (this.get(path)) return; // already editing
    this.set(path, true);
  },
  stopEdit(path, key) {
    this.toggle(`${key || 'edits'}.${Ractive.escapeKey(path)}`);
    return false;
  },
  changeType(path) {
    let val = getType(this.get(path));
    const next = this.event.original.target.value;
    if (val !== next) {
      switch (next) {
        case 'wat': val = undefined; break;
        case 'null': val = null; break;
        case 'string': val = ''; break;
        case 'number': val = 0; break;
        case 'boolean': val = false; break;
        case 'array': val = []; break;
        default: val = {}; break;
      }
      this.set(path, val);
    }
  }
});

export default JsonEditor;
