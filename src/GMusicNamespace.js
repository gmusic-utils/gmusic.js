import assert from 'assert';

export default class GMusicNamespace {
  constructor(emit, on) {
    this.emit = emit;
    this.on = on;
    this.prototype = {};
  }

  _mapSelectors(selectors) {
    Object.keys(selectors).forEach((selectorKey) => {
      Object.defineProperty(this, `_${selectorKey}El`, {
        get: () => {
          const elem = document.querySelector(selectors[selectorKey]);
          assert(elem, `Failed to find ${selectorKey} element for ${this.constructor}: "${selectors[selectorKey]}"`);
          return elem;
        },
      });
    });
  }

  addMethod(methodName) {
    this.prototype[methodName] = this[methodName].bind(this);
  }

  getPrototype() {
    return this.prototype;
  }
}
