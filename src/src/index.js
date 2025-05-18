class UPLCore {
  constructor(context) {
    this.Context = context;
    this.PluginRunnerContext = void 0;
    this.PluginRunnerContextAwaiters = [];
  }
}
let Core;
function initCore(context) {
  if (Core != void 0) {
    throw new Error("UPL is already initialized!");
  }
  Core = new UPLCore(context);
  context.rcp.preInit("rcp-fe-common-libs", async (api) => {
    if (Core !== void 0) {
      Core.PluginRunnerContext = api.context;
      for (const awaiter of Core.PluginRunnerContextAwaiters) {
        awaiter(Core.PluginRunnerContext);
      }
    }
  });
}
class Once {
  constructor(callback) {
    this._callback = callback;
  }
  trigger() {
    if (this._callback !== void 0) {
      this._callback();
      this._callback = void 0;
    }
  }
}
let _once$1 = new Once(init$5);
let _publishMethod;
function setPublishMethod(method) {
  _publishMethod = method;
}
function init$5() {
  if (_publishMethod !== void 0) {
    return;
  }
  if (Core == void 0) {
    throw new Error("UPL is not initialized!");
  }
  let prCtx = Core.PluginRunnerContext;
  if (prCtx == void 0) {
    throw new Error("UPL: PluginRunnerContext is undefined! Called too soon?");
  }
  _publishMethod = prCtx.socket._dispatcher.publish.bind(prCtx.socket._dispatcher);
}
function fireEvent(endpoint, payload) {
  publishMessage(
    endpoint,
    JSON.stringify(
      [
        8,
        "OnJsonApiEvent",
        { "data": payload }
      ]
    )
  );
}
function publishMessage(endpoint, payload) {
  _once$1.trigger();
  _publishMethod(endpoint, payload);
}
const ws$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  fireEvent,
  publishMessage,
  setPublishMethod
}, Symbol.toStringTag, { value: "Module" }));
let _observer;
const _initOnce$2 = new Once(init$4);
const _entriesCreation = [];
const _entriesDeletion = [];
function matches(element, selector) {
  return Element.prototype.matches.call(element, selector);
}
const observedIframes = /* @__PURE__ */ new WeakSet();
function observeIFrame(iframe) {
  try {
    if (iframe.contentDocument) {
      const iframeObserver = new MutationObserver(observerCallback);
      iframeObserver.observe(iframe.contentDocument, {
        attributes: false,
        childList: true,
        subtree: true
      });
    }
  } catch (error) {
    console.error("Error observing iframe:", iframe, error);
  }
}
function observerHandleElement(element, isNew) {
  if (element instanceof HTMLIFrameElement) {
    if (!observedIframes.has(element)) {
      observedIframes.add(element);
      if (element.contentDocument) {
        observeIFrame(element);
      } else {
        element.addEventListener("load", () => {
          observeIFrame(element);
        });
      }
    }
    return;
  }
  if (isNew) {
    for (const entry of _entriesCreation) {
      try {
        if (matches(element, entry.selector)) {
          entry.callback(element);
        }
      } catch (error) {
        console.error("Error in creation callback for element:", element, error);
      }
    }
  } else {
    for (const entry of _entriesDeletion) {
      try {
        if (matches(element, entry.selector)) {
          entry.callback(element);
        }
      } catch (error) {
        console.error("Error in deletion callback for element:", element, error);
      }
    }
  }
  try {
    for (const child of element.children) {
      observerHandleElement(child, isNew);
    }
  } catch (error) {
    console.error("Error iterating element.children for:", element, error);
  }
  if (element.shadowRoot != null) {
    try {
      for (const child of element.shadowRoot.children) {
        observerHandleElement(child, isNew);
      }
    } catch (error) {
      console.error("Error iterating element.shadowRoot.children for:", element, error);
    }
    if (isNew && _observer) {
      try {
        _observer.observe(element.shadowRoot, { attributes: false, childList: true, subtree: true });
      } catch (error) {
        console.error("Error observing shadowRoot for element:", element, error);
      }
    }
  }
}
function observerCallback(mutationsList) {
  for (const mutation of mutationsList) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        observerHandleElement(node, true);
      }
    }
    for (const node of mutation.removedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        observerHandleElement(node, false);
      }
    }
  }
}
function init$4() {
  _observer = new MutationObserver(observerCallback);
  _observer.observe(document, { attributes: false, childList: true, subtree: true });
  const iframes = document.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    if (iframe instanceof HTMLIFrameElement) {
      if (!observedIframes.has(iframe)) {
        observedIframes.add(iframe);
        if (iframe.contentDocument) {
          observeIFrame(iframe);
        } else {
          iframe.addEventListener("load", () => {
            observeIFrame(iframe);
          });
        }
      }
    }
  });
}
function subscribeToElementCreation(selector, callback) {
  _initOnce$2.trigger();
  _entriesCreation.push({ selector, callback });
}
function subscribeToElementDeletion(selector, callback) {
  _initOnce$2.trigger();
  _entriesDeletion.push({ selector, callback });
}
let loadCallbacks = [];
let loadInitialized = false;
let loadedOnce = false;
function subscribeToLoad(callback) {
  if (!loadInitialized) {
    loadInitialized = true;
    subscribeToElementDeletion(".lol-loading-screen-container", () => {
      if (loadedOnce) {
        return;
      }
      loadedOnce = true;
      for (let callback2 of loadCallbacks) {
        callback2();
      }
    });
  }
  loadCallbacks.push(callback);
}
const observer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  subscribeToElementCreation,
  subscribeToElementDeletion,
  subscribeToLoad
}, Symbol.toStringTag, { value: "Module" }));
const _entriesText = /* @__PURE__ */ new Map();
const _entriesRegex = [];
const _initOnce$1 = new Once(init$3);
function hookPre(path, callback) {
  _initOnce$1.trigger();
  if (typeof path === "string") {
    var entry = _entriesText[path];
    if (entry === void 0) {
      _entriesText.set(path, { pre_callback: callback, post_callback: void 0 });
    } else {
      _entriesText[path].pre_callback = callback;
    }
  } else if (path instanceof RegExp) {
    var index2 = _entriesRegex.findIndex((x) => x[0] == path);
    if (index2 === -1) {
      _entriesRegex.push([path, { pre_callback: callback, post_callback: void 0 }]);
    } else {
      _entriesRegex[index2][1].pre_callback = callback;
    }
  } else {
    throw new TypeError("Invalid path type!");
  }
}
function hookPost(path, callback) {
  _initOnce$1.trigger();
  if (typeof path === "string") {
    var entry = _entriesText[path];
    if (entry === void 0) {
      _entriesText.set(path, { pre_callback: void 0, post_callback: callback });
    } else {
      _entriesText[path].post_callback = callback;
    }
  } else if (path instanceof RegExp) {
    var index2 = _entriesRegex.findIndex((x) => x[0] == path);
    if (index2 === -1) {
      _entriesRegex.push([path, { pre_callback: void 0, post_callback: callback }]);
    } else {
      _entriesRegex[index2][1].post_callback = callback;
    }
  } else {
    throw new TypeError("Invalid path type!");
  }
}
function hookTextPre(path, callback) {
  hookPre(path, (method, endpoint, _, body, original) => {
    if (typeof body !== "string") {
      console.error("UPL: Tried to hook text XHR request but body is not a string!");
      return original(body);
    }
    const _original = (newBody) => {
      original(newBody);
    };
    callback(method, endpoint, body, _original);
  });
}
function hookTextPost(path, callback) {
  hookPost(path, (method, endpoint, request, original) => {
    if (request.responseType !== "" && request.responseType !== "text") {
      console.error("UPL: Tried to hook text XHR request but response is not a string!");
      return original();
    }
    const _original = (response) => {
      if (request.responseText != response) {
        Object.defineProperty(request, "responseText", {
          writable: true,
          value: response
        });
      }
      original();
    };
    callback(method, endpoint, this.responseText, _original);
  });
}
const _xhrOriginalOpen = XMLHttpRequest.prototype.open;
function hookedOpen(method, url) {
  var _a;
  let urlStr = url.toString();
  var entry = _entriesText.get(urlStr);
  if (entry === void 0 && _entriesRegex.length > 0) {
    entry = (_a = _entriesRegex.find((x) => x[0].test(urlStr))) == null ? void 0 : _a[1];
  }
  if (entry !== void 0) {
    let originalSend = this.send;
    this.send = function(body) {
      if (body instanceof Document) {
        return originalSend.apply(this, [body]);
      }
      if (entry.post_callback !== void 0) {
        let originalOnReadyStateChanged = this.onreadystatechange;
        this.onreadystatechange = function(ev) {
          if (this.readyState === 4 && entry.post_callback !== void 0) {
            let original = () => {
              originalOnReadyStateChanged.apply(this, [ev]);
            };
            entry.post_callback(method, urlStr, this, original);
            return;
          }
          return originalOnReadyStateChanged.apply(this, arguments);
        };
      }
      if (entry.pre_callback !== void 0) {
        let original = (content) => {
          body = content;
          originalSend.apply(this, [body]);
        };
        entry.pre_callback(method, urlStr, this, body || null, original);
      } else {
        originalSend.apply(this, [body]);
      }
    };
  }
  _xhrOriginalOpen.apply(this, arguments);
}
function init$3() {
  XMLHttpRequest.prototype.open = hookedOpen;
}
const xhr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hookPost,
  hookPre,
  hookTextPost,
  hookTextPre
}, Symbol.toStringTag, { value: "Module" }));
const _entriesMessageText = /* @__PURE__ */ new Map();
const _entriesMessageRegex = [];
const _once = new Once(init$2);
function hookMessage(endpoint, callback) {
  _once.trigger();
  if (typeof endpoint === "string") {
    _entriesMessageText.set(endpoint, callback);
  } else if (endpoint instanceof RegExp) {
    _entriesMessageRegex.push([endpoint, callback]);
  } else {
    throw new TypeError("Invalid endpoint type!");
  }
}
function hookEvent(endpoint, callback) {
  hookMessage(endpoint, (_endpoint, payload, original) => {
    let payloadObject = JSON.parse(payload);
    let _original = (newPayload) => {
      payloadObject[2].data = newPayload;
      original(JSON.stringify(payloadObject));
    };
    callback(payloadObject[2].eventType, _endpoint, payloadObject[2].data, _original);
  });
}
function initHook(prCtx) {
  let _publishMethod2 = prCtx.socket._dispatcher.publish.bind(prCtx.socket._dispatcher);
  setPublishMethod(_publishMethod2);
  prCtx.socket._dispatcher.publish = function(endpoint, payload) {
    var _a;
    let entry = _entriesMessageText.get(endpoint);
    if (entry === void 0) {
      entry = (_a = _entriesMessageRegex.find((x) => x[0].test(endpoint))) == null ? void 0 : _a[1];
      if (entry === void 0) {
        return _publishMethod2(endpoint, payload);
      }
    }
    let original = (content) => {
      _publishMethod2(endpoint, content);
    };
    return entry(endpoint, payload, original);
  };
}
function init$2() {
  if (Core === void 0) {
    throw new Error("UPL is not initialized!");
  }
  let prCtx = Core.PluginRunnerContext;
  if (prCtx !== void 0) {
    initHook(prCtx);
  } else {
    Core.PluginRunnerContextAwaiters.push((ctx) => {
      initHook(ctx);
    });
  }
}
const ws = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hookEvent,
  hookMessage
}, Symbol.toStringTag, { value: "Module" }));
const _componentEntriesNames = /* @__PURE__ */ new Map();
const _componentEntriesMatching = [];
const _serviceEntriesMatching = [];
const _initOnce = new Once(init$1);
function hookComponentMethodByName(className, methodName, callback) {
  _initOnce.trigger();
  var hookEntry = { method: methodName, callback };
  var entry = _componentEntriesNames.get(className);
  if (entry === void 0) {
    _componentEntriesNames.set(className, { hooks: [hookEntry], mixins: [] });
  } else {
    entry.hooks.push(hookEntry);
  }
}
function hookComponentMethodByMatching(matcher, methodName, callback) {
  _initOnce.trigger();
  var hookEntry = { method: methodName, callback };
  _componentEntriesMatching.push({ matcher, entry: { hooks: [hookEntry], mixins: [] } });
}
function extendClassByName(className, callback) {
  _initOnce.trigger();
  var entry = _componentEntriesNames.get(className);
  if (entry === void 0) {
    _componentEntriesNames.set(className, { hooks: [], mixins: [callback] });
  } else {
    entry.mixins.push(callback);
  }
}
function extendClassByMatching(matcher, callback) {
  _initOnce.trigger();
  _componentEntriesMatching.push({ matcher, entry: { hooks: [], mixins: [callback] } });
}
function hookServiceMethodByMatching(matcher, methodName, callback) {
  _initOnce.trigger();
  var hookEntry = { method: methodName, callback };
  _serviceEntriesMatching.push({ matcher, entry: { hooks: [hookEntry], mixins: [] } });
}
function extendServiceByMatching(matcher, callback) {
  _initOnce.trigger();
  _serviceEntriesMatching.push({ matcher, entry: { hooks: [], mixins: [callback] } });
}
function init$1() {
  let context = Core == null ? void 0 : Core.Context;
  if (context == null) {
    throw new Error("UPL is not initialized!");
  }
  context.rcp.postInit("rcp-fe-ember-libs", async (api) => {
    const originalGetEmber = api.getEmber;
    api.getEmber = function(...args) {
      const result = originalGetEmber.apply(this, args);
      result.then((Ember) => {
        const originalExtend = Ember.Component.extend;
        const originalServiceExtend = Ember.Service.extend;
        Ember.Component.extend = function(...args2) {
          let result2 = originalExtend.apply(this, arguments);
          const potentialObjects = args2.filter((x) => typeof x === "object");
          for (const obj of potentialObjects) {
            for (const entry of _componentEntriesMatching) {
              if (entry.matcher(obj)) {
                result2 = handleEntry(Ember, entry.entry, result2);
              }
            }
          }
          const classNames = potentialObjects.filter((x) => x.classNames && Array.isArray(x.classNames)).map((x) => x.classNames.join(" "));
          for (const className of classNames) {
            const entry = _componentEntriesNames.get(className);
            if (entry === void 0) {
              continue;
            }
            result2 = handleEntry(Ember, entry, result2);
          }
          return result2;
        };
        Ember.Service.extend = function(...args2) {
          let result2 = originalServiceExtend.apply(this, arguments);
          const potentialObjects = args2.filter((x) => typeof x === "object");
          for (const obj of potentialObjects) {
            for (const entry of _serviceEntriesMatching) {
              if (entry.matcher(obj)) {
                result2 = handleEntry(Ember, entry.entry, result2);
              }
            }
          }
          return result2;
        };
        return Ember;
      });
      return result;
    };
  });
}
function handleEntry(Ember, entry, result) {
  const proto = result.proto();
  if (proto.__UPL_IS_HOOKED) {
    return result;
  }
  proto.__UPL_IS_HOOKED = true;
  for (const mixin of entry.mixins) {
    result = result.extend(mixin(Ember));
  }
  for (const hook of entry.hooks) {
    const original = proto[hook.method];
    proto[hook.method] = function(...args) {
      const proxyOriginal = (...args2) => {
        if (original != void 0) {
          return original.apply(this, args2);
        }
      };
      return hook.callback.call(this, Ember, proxyOriginal, ...args);
    };
  }
  return result;
}
const ember = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  extendClassByMatching,
  extendClassByName,
  extendServiceByMatching,
  hookComponentMethodByMatching,
  hookComponentMethodByName,
  hookServiceMethodByMatching
}, Symbol.toStringTag, { value: "Module" }));
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ember,
  ws,
  xhr
}, Symbol.toStringTag, { value: "Module" }));
function init(penguContext) {
  if (penguContext.rcp === void 0 || typeof penguContext.rcp.preInit != "function" || typeof penguContext.rcp.postInit != "function") {
    throw new Error("context is not a valid Pengu Context!");
  }
  initCore(penguContext);
}
export {
  index as hooks,
  init,
  observer,
  ws$1 as ws
};
