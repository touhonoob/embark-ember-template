/* eslint-disable */

const EmbarkJS = require("/home/peter/source/embark-ember-template/embarkArtifacts/modules/embarkjs").default;
export default EmbarkJS;
global.EmbarkJS = EmbarkJS

const Web3 = global.__Web3 || require('/home/peter/source/embark-ember-template/embarkArtifacts/modules/web3');
global.Web3 = Web3;/*global Web3*/
const embarkJSConnectorWeb3 = {};

embarkJSConnectorWeb3.init = function(config) {
  global.web3 = config.web3 || global.web3;
  // Check if the global web3 object uses the old web3 (0.x)
  if (global.web3 && typeof global.web3.version !== 'string') {
    // If so, use a new instance using 1.0, but use its provider
    this.web3 = new Web3(global.web3.currentProvider);
  } else {
    this.web3 = global.web3 || new Web3();
  }
  global.web3 = this.web3;
};

embarkJSConnectorWeb3.getInstance = function () {
  return this.web3;
};

embarkJSConnectorWeb3.getAccounts = function () {
  return this.web3.eth.getAccounts(...arguments);
};

embarkJSConnectorWeb3.getNewProvider = function (providerName, ...args) {
  return new Web3.providers[providerName](...args);
};

embarkJSConnectorWeb3.setProvider = function (provider) {
  return this.web3.setProvider(provider);
};

embarkJSConnectorWeb3.getCurrentProvider = function () {
  return this.web3.currentProvider;
};

embarkJSConnectorWeb3.getDefaultAccount = function () {
  return this.web3.eth.defaultAccount;
};

embarkJSConnectorWeb3.setDefaultAccount = function (account) {
  this.web3.eth.defaultAccount = account;
};

embarkJSConnectorWeb3.newContract = function (options) {
  return new this.web3.eth.Contract(options.abi, options.address);
};

embarkJSConnectorWeb3.send = function () {
  return this.web3.eth.sendTransaction(...arguments);
};

embarkJSConnectorWeb3.toWei = function () {
  return this.web3.toWei(...arguments);
};

embarkJSConnectorWeb3.getNetworkId = function () {
  return this.web3.eth.net.getId();
};

EmbarkJS.Blockchain.registerProvider('web3', embarkJSConnectorWeb3);
EmbarkJS.Blockchain.setProvider('web3', {});
if (!global.__Web3) {
  const web3ConnectionConfig = require('/home/peter/source/embark-ember-template/embarkArtifacts/config/blockchain.json');
  EmbarkJS.Blockchain.connect(web3ConnectionConfig, (err) => {if (err) { console.error(err); } });
}
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

/* global module require */
const {
  fromEvent,
  merge,
  throwError
} = require('rxjs');

const {
  map,
  mergeMap
} = require('rxjs/operators');

function sendMessage(options, callback) {
  let topics, ttl, payload;
  topics = options.topic;
  const data = options.data;
  ttl = options.ttl || 100;
  const powTime = options.powTime || 3;
  const powTarget = options.powTarget || 0.5;
  const sig = options.sig;
  const fromAscii = options.fromAscii;
  const toHex = options.toHex;
  const symKeyID = options.symKeyID;
  const post = options.post;

  if (topics) {
    topics = toHex(topics).slice(0, 10);
  }

  payload = (0, _stringify.default)(data);
  let message = {
    sig: sig,
    // signs the message using the keyPair ID
    ttl: ttl,
    payload: fromAscii(payload),
    powTime: powTime,
    powTarget: powTarget
  };

  if (topics) {
    message.topic = topics;
  }

  if (options.pubKey) {
    message.pubKey = options.pubKey; // encrypt using a given pubKey
  } else if (options.symKeyID) {
    message.symKeyID = options.symKeyID; // encrypts using given sym key ID
  } else {
    message.symKeyID = symKeyID; // encrypts using the sym key ID
  }

  if (topics === undefined && message.symKeyID && !message.pubKey) {
    callback("missing option: topic");
  } else {
    post(message, callback);
  }
}

function listenTo(options) {
  let topics = options.topic;
  const toAscii = options.toAscii;
  const toHex = options.toHex;
  const sig = options.sig;
  const subscribe = options.subscribe;
  const symKeyID = options.symKeyID;
  let subOptions = {};

  if (topics) {
    if (typeof topics === 'string') {
      topics = [toHex(topics).slice(0, 10)];
    } else {
      topics = topics.map(t => toHex(t).slice(0, 10));
    }

    subOptions.topics = topics;
  }

  if (options.minPow) {
    subOptions.minPow = options.minPow;
  }

  if (options.usePrivateKey === true) {
    subOptions.privateKeyID = options.privateKeyID || sig;
  } else {
    subOptions.symKeyID = symKeyID;
  }

  const emitter = subscribe('messages', subOptions);
  const obsData = fromEvent(emitter, 'data').pipe(map(result => ({
    data: JSON.parse(toAscii(result.payload)),
    payload: result.payload,
    recipientPublicKey: result.recipientPublicKey,
    result,
    sig: result.sig,
    time: result.timestamp,
    topic: toAscii(result.topic)
  })));
  const obsErr = fromEvent(emitter, 'error').pipe(mergeMap(throwError));
  const obsSub = merge(obsData, obsErr);
  obsSub.shhSubscription = emitter;
  return obsSub;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sendMessage,
    listenTo
  };
}
//# sourceMappingURL=communicationFunctions.js.map
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

/* global EmbarkJS Web3 listenTo sendMessage */
// for the whisper v5 and web3.js 1.0
let __embarkWhisperNewWeb3 = {};

__embarkWhisperNewWeb3.setProvider = function (options) {
  const self = this;
  let provider;

  if (options === undefined) {
    provider = "localhost:8546";
  } else {
    provider = options.server + ':' + options.port;
  } // TODO: take into account type


  self.web3 = new Web3(new Web3.providers.WebsocketProvider("ws://" + provider, options.providerOptions));
  self.web3.currentProvider.on('connect', () => {
    self.getWhisperVersion(function (err, version) {
      if (err) {
        console.log("whisper not available");
      } else if (version >= 5) {
        self.web3.shh.newSymKey().then(id => {
          self.symKeyID = id;
        });
        self.web3.shh.newKeyPair().then(id => {
          self.sig = id;
        });
      } else {
        throw new Error("version of whisper not supported");
      }

      self.whisperVersion = self.web3.version.whisper;
    });
  });
  self.web3.currentProvider.on('error', () => {
    console.log("whisper not available");
  });
};

__embarkWhisperNewWeb3.sendMessage = function (options) {
  const data = options.data || options.payload;

  if (!data) {
    throw new Error("missing option: data");
  }

  (0, _assign.default)(options, {
    sig: this.sig,
    fromAscii: EmbarkJS.Utils.fromAscii,
    toHex: this.web3.utils.toHex,
    symKeyID: options.symKeyID || this.symKeyID,
    post: this.web3.shh.post,
    data
  });
  sendMessage(options, err => {
    if (err) {
      throw new Error(err);
    }
  });
};

__embarkWhisperNewWeb3.listenTo = function (options) {
  (0, _assign.default)(options, {
    toAscii: EmbarkJS.Utils.toAscii,
    toHex: this.web3.utils.toHex,
    sig: this.sig,
    subscribe: this.web3.shh.subscribe,
    symKeyID: options.symKeyID || this.symKeyID
  });
  return listenTo(options);
};

__embarkWhisperNewWeb3.getWhisperVersion = function (cb) {
  // 1) Parity does not implement shh_version JSON-RPC method
  // 2) web3 1.0 still does not implement web3_clientVersion
  // so we must do all by our own
  const self = this;

  self.web3._requestManager.send({
    method: 'web3_clientVersion',
    params: []
  }, (err, clientVersion) => {
    if (err) return cb(err);

    if (clientVersion.indexOf("Parity-Ethereum//v2") === 0) {
      // This is Parity
      self.web3.shh.getInfo(function (err) {
        if (err) {
          return cb(err, 0);
        } // TOFIX Assume Whisper v6 until there's a way to understand it via JSON-RPC


        return cb(err, 6);
      });
    } else {
      // Assume it is a Geth compliant client
      self.web3.shh.getVersion(function (err, version) {
        cb(err, version);
      });
    }
  });
};

__embarkWhisperNewWeb3.isAvailable = function () {
  return new _promise.default((resolve, reject) => {
    if (!this.web3.shh) {
      return resolve(false);
    }

    try {
      this.getWhisperVersion(err => {
        resolve(Boolean(!err));
      });
    } catch (err) {
      reject(err);
    }
  });
};
//# sourceMappingURL=embarkjs.js.map
EmbarkJS.Messages.registerProvider('whisper', __embarkWhisperNewWeb3);
const IpfsApi = global.IpfsApi || require('/home/peter/source/embark-ember-template/embarkArtifacts/modules/ipfs-api');
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

/*global IpfsApi*/
const __embarkIPFS = {};
const NoConnectionError = 'No IPFS connection. Please ensure to call Embark.Storage.setProvider()';

__embarkIPFS.setProvider = function (options) {
  const self = this;
  return new _promise.default(function (resolve, reject) {
    try {
      if (!options) {
        self._config = options;
        self._ipfsConnection = IpfsApi('localhost', '5001');
        self._getUrl = "http://localhost:8080/ipfs/";
      } else {
        const ipfsOptions = {
          host: options.host || options.server,
          protocol: 'http'
        };

        if (options.protocol) {
          ipfsOptions.protocol = options.protocol;
        }

        if (options.port && options.port !== 'false') {
          ipfsOptions.port = options.port;
        }

        self._ipfsConnection = IpfsApi(ipfsOptions);
        self._getUrl = options.getUrl || "http://localhost:8080/ipfs/";
      }

      resolve(self);
    } catch (err) {
      console.error(err);
      self._ipfsConnection = null;
      reject(new Error('Failed to connect to IPFS'));
    }
  });
};

__embarkIPFS.isAvailable = function () {
  return new _promise.default(resolve => {
    if (!this._ipfsConnection) {
      return resolve(false);
    }

    this._ipfsConnection.id().then(id => {
      resolve(Boolean(id));
    }).catch(err => {
      console.error(err);
      resolve(false);
    });
  });
};

__embarkIPFS.saveText = function (text) {
  const self = this;
  return new _promise.default(function (resolve, reject) {
    if (!self._ipfsConnection) {
      return reject(new Error(NoConnectionError));
    }

    self._ipfsConnection.add(self._ipfsConnection.Buffer.from(text), function (err, result) {
      if (err) {
        return reject(err);
      }

      resolve(result[0].path);
    });
  });
};

__embarkIPFS.get = function (hash) {
  const self = this; // TODO: detect type, then convert if needed
  //var ipfsHash = web3.toAscii(hash);

  return new _promise.default(function (resolve, reject) {
    if (!self._ipfsConnection) {
      var connectionError = new Error(NoConnectionError);
      return reject(connectionError);
    }

    self._ipfsConnection.get(hash, function (err, files) {
      if (err) {
        return reject(err);
      }

      resolve(files[0].content.toString());
    });
  });
};

__embarkIPFS.uploadFile = function (inputSelector) {
  const self = this;
  const file = inputSelector[0].files[0];

  if (file === undefined) {
    throw new Error('no file found');
  }

  return new _promise.default(function (resolve, reject) {
    if (!self._ipfsConnection) {
      return reject(new Error(NoConnectionError));
    }

    const reader = new FileReader();

    reader.onloadend = function () {
      const buffer = self._ipfsConnection.Buffer.from(reader.result);

      self._ipfsConnection.add(buffer, function (err, result) {
        if (err) {
          return reject(err);
        }

        resolve(result[0].path);
      });
    };

    reader.readAsArrayBuffer(file);
  });
};

__embarkIPFS.getUrl = function (hash) {
  return (this._getUrl || "http://localhost:8080/ipfs/") + hash;
};

__embarkIPFS.resolve = function (name, callback) {
  callback = callback || function () {};

  if (!this._ipfsConnection) {
    return callback(new Error(NoConnectionError));
  }

  this._ipfsConnection.name.resolve(name).then(res => {
    callback(null, res.Path);
  }).catch(() => {
    callback(name + " is not registered");
  });
};

__embarkIPFS.register = function (addr, callback) {
  callback = callback || function () {};

  if (!this._ipfsConnection) {
    return new Error(NoConnectionError);
  }

  if (addr.length !== 46 || !addr.startsWith('Qm')) {
    return callback('String is not an IPFS hash');
  }

  this._ipfsConnection.name.publish("/ipfs/" + addr).then(res => {
    callback(null, res.Name);
  }).catch(() => {
    callback(addr + " could not be registered");
  });
};
//# sourceMappingURL=embarkjs.js.map
EmbarkJS.Storage.registerProvider('ipfs', __embarkIPFS);
var whenEnvIsLoaded = function(cb) {
  if (typeof document !== 'undefined' && document !== null && !/comp|inter|loaded/.test(document.readyState)) {
      document.addEventListener('DOMContentLoaded', cb);
  } else {
    cb();
  }
}
whenEnvIsLoaded(function() {
  
EmbarkJS.Messages.setProvider('whisper', {"server":"localhost","port":8546,"type":"ws"});
});

var whenEnvIsLoaded = function(cb) {
  if (typeof document !== 'undefined' && document !== null && !/comp|inter|loaded/.test(document.readyState)) {
      document.addEventListener('DOMContentLoaded', cb);
  } else {
    cb();
  }
}
whenEnvIsLoaded(function() {
  
EmbarkJS.Storage.setProviders([{"provider":"ipfs","host":"localhost","port":5001,"getUrl":"http://localhost:8080/ipfs/"}]);
});

var whenEnvIsLoaded = function(cb) {
  if (typeof document !== 'undefined' && document !== null && !/comp|inter|loaded/.test(document.readyState)) {
      document.addEventListener('DOMContentLoaded', cb);
  } else {
    cb();
  }
}
"use strict";

const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:${location.port}`);
ws.addEventListener('message', evt => {
  if (evt.data === 'outputDone') {
    location.reload(true);
  }
});
//# sourceMappingURL=reload-on-change.js.map
/* eslint-enable */