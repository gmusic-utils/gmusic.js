import Emitter from 'events';

import VolumeNamespace from './namespaces/VolumeNamespace';

const namespaces = {};

class GMusic extends Emitter {
  constructor() {
    super();
    Object.keys(namespaces).forEach((namespaceName) => {
      const namespaceClasses = namespaces[namespaceName];
      namespaceClasses.forEach((NamespaceClass) => {
        const namespace = new NamespaceClass(this.emit.bind(this), this.on.bind(this));
        this[namespaceName] = Object.assign(this[namespaceName] || {}, namespace.getPrototype(), NamespaceClass.ENUMS || {});
      });
    });
  }

  static addNamespace(namespaceName, namespaceClass) {
    namespaces[namespaceName] = namespaces[namespaceName] || [];
    namespaces[namespaceName].push(namespaceClass);
  }
}

GMusic.addNamespace('volume', VolumeNamespace);

export default GMusic;
