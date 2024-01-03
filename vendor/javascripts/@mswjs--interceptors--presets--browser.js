// src/interceptors/fetch/index.ts
import { invariant as invariant2 } from "outvariant";
import { DeferredPromise as DeferredPromise2 } from "@open-draft/deferred-promise";
import { until } from "@open-draft/until";

// src/glossary.ts
var IS_PATCHED_MODULE = Symbol("isPatchedModule");

// src/Interceptor.ts
import { Logger } from "@open-draft/logger";
import { Emitter } from "strict-event-emitter";
function getGlobalSymbol(symbol) {
  return (
    // @ts-ignore https://github.com/Microsoft/TypeScript/issues/24587
    globalThis[symbol] || void 0
  );
}
function setGlobalSymbol(symbol, value) {
  globalThis[symbol] = value;
}
function deleteGlobalSymbol(symbol) {
  delete globalThis[symbol];
}
var Interceptor = class {
  constructor(symbol) {
    this.symbol = symbol;
    this.readyState = "INACTIVE" /* INACTIVE */;
    this.emitter = new Emitter();
    this.subscriptions = [];
    this.logger = new Logger(symbol.description);
    this.emitter.setMaxListeners(0);
    this.logger.info("constructing the interceptor...");
  }
  /**
   * Determine if this interceptor can be applied
   * in the current environment.
   */
  checkEnvironment() {
    return true;
  }
  /**
   * Apply this interceptor to the current process.
   * Returns an already running interceptor instance if it's present.
   */
  apply() {
    const logger = this.logger.extend("apply");
    logger.info("applying the interceptor...");
    if (this.readyState === "APPLIED" /* APPLIED */) {
      logger.info("intercepted already applied!");
      return;
    }
    const shouldApply = this.checkEnvironment();
    if (!shouldApply) {
      logger.info("the interceptor cannot be applied in this environment!");
      return;
    }
    this.readyState = "APPLYING" /* APPLYING */;
    const runningInstance = this.getInstance();
    if (runningInstance) {
      logger.info("found a running instance, reusing...");
      this.on = (event, listener) => {
        logger.info('proxying the "%s" listener', event);
        runningInstance.emitter.addListener(event, listener);
        this.subscriptions.push(() => {
          runningInstance.emitter.removeListener(event, listener);
          logger.info('removed proxied "%s" listener!', event);
        });
        return this;
      };
      this.readyState = "APPLIED" /* APPLIED */;
      return;
    }
    logger.info("no running instance found, setting up a new instance...");
    this.setup();
    this.setInstance();
    this.readyState = "APPLIED" /* APPLIED */;
  }
  /**
   * Setup the module augments and stubs necessary for this interceptor.
   * This method is not run if there's a running interceptor instance
   * to prevent instantiating an interceptor multiple times.
   */
  setup() {
  }
  /**
   * Listen to the interceptor's public events.
   */
  on(event, listener) {
    const logger = this.logger.extend("on");
    if (this.readyState === "DISPOSING" /* DISPOSING */ || this.readyState === "DISPOSED" /* DISPOSED */) {
      logger.info("cannot listen to events, already disposed!");
      return this;
    }
    logger.info('adding "%s" event listener:', event, listener);
    this.emitter.on(event, listener);
    return this;
  }
  once(event, listener) {
    this.emitter.once(event, listener);
    return this;
  }
  off(event, listener) {
    this.emitter.off(event, listener);
    return this;
  }
  removeAllListeners(event) {
    this.emitter.removeAllListeners(event);
    return this;
  }
  /**
   * Disposes of any side-effects this interceptor has introduced.
   */
  dispose() {
    const logger = this.logger.extend("dispose");
    if (this.readyState === "DISPOSED" /* DISPOSED */) {
      logger.info("cannot dispose, already disposed!");
      return;
    }
    logger.info("disposing the interceptor...");
    this.readyState = "DISPOSING" /* DISPOSING */;
    if (!this.getInstance()) {
      logger.info("no interceptors running, skipping dispose...");
      return;
    }
    this.clearInstance();
    logger.info("global symbol deleted:", getGlobalSymbol(this.symbol));
    if (this.subscriptions.length > 0) {
      logger.info("disposing of %d subscriptions...", this.subscriptions.length);
      for (const dispose of this.subscriptions) {
        dispose();
      }
      this.subscriptions = [];
      logger.info("disposed of all subscriptions!", this.subscriptions.length);
    }
    this.emitter.removeAllListeners();
    logger.info("destroyed the listener!");
    this.readyState = "DISPOSED" /* DISPOSED */;
  }
  getInstance() {
    var _a;
    const instance = getGlobalSymbol(this.symbol);
    this.logger.info("retrieved global instance:", (_a = instance == null ? void 0 : instance.constructor) == null ? void 0 : _a.name);
    return instance;
  }
  setInstance() {
    setGlobalSymbol(this.symbol, this);
    this.logger.info("set global instance!", this.symbol.description);
  }
  clearInstance() {
    deleteGlobalSymbol(this.symbol);
    this.logger.info("cleared global instance!", this.symbol.description);
  }
};

// src/utils/uuid.ts
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}

// src/utils/RequestController.ts
import { invariant } from "outvariant";
import { DeferredPromise } from "@open-draft/deferred-promise";
var RequestController = class {
  constructor(request) {
    this.request = request;
    this.responsePromise = new DeferredPromise();
  }
  respondWith(response) {
    invariant(
      this.responsePromise.state === "pending",
      'Failed to respond to "%s %s" request: the "request" event has already been responded to.',
      this.request.method,
      this.request.url
    );
    this.responsePromise.resolve(response);
  }
};

// src/utils/toInteractiveRequest.ts
function toInteractiveRequest(request) {
  const requestController = new RequestController(request);
  Reflect.set(
    request,
    "respondWith",
    requestController.respondWith.bind(requestController)
  );
  return {
    interactiveRequest: request,
    requestController
  };
}

// src/utils/emitAsync.ts
async function emitAsync(emitter, eventName, ...data) {
  const listners = emitter.listeners(eventName);
  if (listners.length === 0) {
    return;
  }
  for (const listener of listners) {
    await listener.apply(emitter, data);
  }
}

// src/utils/isPropertyAccessible.ts
function isPropertyAccessible(obj, key) {
  try {
    obj[key];
    return true;
  } catch (e) {
    return false;
  }
}

// src/interceptors/fetch/index.ts
var _FetchInterceptor = class extends Interceptor {
  constructor() {
    super(_FetchInterceptor.symbol);
  }
  checkEnvironment() {
    return typeof globalThis !== "undefined" && typeof globalThis.fetch !== "undefined";
  }
  setup() {
    const pureFetch = globalThis.fetch;
    invariant2(
      !pureFetch[IS_PATCHED_MODULE],
      'Failed to patch the "fetch" module: already patched.'
    );
    globalThis.fetch = async (input, init) => {
      var _a;
      const requestId = uuidv4();
      const request = new Request(input, init);
      this.logger.info("[%s] %s", request.method, request.url);
      const { interactiveRequest, requestController } = toInteractiveRequest(request);
      this.logger.info(
        'emitting the "request" event for %d listener(s)...',
        this.emitter.listenerCount("request")
      );
      this.emitter.once("request", ({ requestId: pendingRequestId }) => {
        if (pendingRequestId !== requestId) {
          return;
        }
        if (requestController.responsePromise.state === "pending") {
          requestController.responsePromise.resolve(void 0);
        }
      });
      this.logger.info("awaiting for the mocked response...");
      const signal = interactiveRequest.signal;
      const requestAborted = new DeferredPromise2();
      signal.addEventListener(
        "abort",
        () => {
          requestAborted.reject(signal.reason);
        },
        { once: true }
      );
      const resolverResult = await until(async () => {
        const listenersFinished = emitAsync(this.emitter, "request", {
          request: interactiveRequest,
          requestId
        });
        await Promise.race([
          requestAborted,
          // Put the listeners invocation Promise in the same race condition
          // with the request abort Promise because otherwise awaiting the listeners
          // would always yield some response (or undefined).
          listenersFinished,
          requestController.responsePromise
        ]);
        this.logger.info("all request listeners have been resolved!");
        const mockedResponse2 = await requestController.responsePromise;
        this.logger.info("event.respondWith called with:", mockedResponse2);
        return mockedResponse2;
      });
      if (requestAborted.state === "rejected") {
        return Promise.reject(requestAborted.rejectionReason);
      }
      if (resolverResult.error) {
        return Promise.reject(createNetworkError(resolverResult.error));
      }
      const mockedResponse = resolverResult.data;
      if (mockedResponse && !((_a = request.signal) == null ? void 0 : _a.aborted)) {
        this.logger.info("received mocked response:", mockedResponse);
        if (isPropertyAccessible(mockedResponse, "type") && mockedResponse.type === "error") {
          this.logger.info(
            "received a network error response, rejecting the request promise..."
          );
          return Promise.reject(createNetworkError(mockedResponse));
        }
        const responseClone = mockedResponse.clone();
        this.emitter.emit("response", {
          response: responseClone,
          isMockedResponse: true,
          request: interactiveRequest,
          requestId
        });
        const response = new Response(mockedResponse.body, mockedResponse);
        Object.defineProperty(response, "url", {
          writable: false,
          enumerable: true,
          configurable: false,
          value: request.url
        });
        return response;
      }
      this.logger.info("no mocked response received!");
      return pureFetch(request).then((response) => {
        const responseClone = response.clone();
        this.logger.info("original fetch performed", responseClone);
        this.emitter.emit("response", {
          response: responseClone,
          isMockedResponse: false,
          request: interactiveRequest,
          requestId
        });
        return response;
      });
    };
    Object.defineProperty(globalThis.fetch, IS_PATCHED_MODULE, {
      enumerable: true,
      configurable: true,
      value: true
    });
    this.subscriptions.push(() => {
      Object.defineProperty(globalThis.fetch, IS_PATCHED_MODULE, {
        value: void 0
      });
      globalThis.fetch = pureFetch;
      this.logger.info(
        'restored native "globalThis.fetch"!',
        globalThis.fetch.name
      );
    });
  }
};
var FetchInterceptor = _FetchInterceptor;
FetchInterceptor.symbol = Symbol("fetch");
function createNetworkError(cause) {
  return Object.assign(new TypeError("Failed to fetch"), {
    cause
  });
}

// src/interceptors/XMLHttpRequest/index.ts
import { invariant as invariant4 } from "outvariant";

// src/interceptors/XMLHttpRequest/XMLHttpRequestProxy.ts
import { until as until2 } from "@open-draft/until";

// src/interceptors/XMLHttpRequest/XMLHttpRequestController.ts
import { invariant as invariant3 } from "outvariant";
import { isNodeProcess } from "is-node-process";

// src/interceptors/XMLHttpRequest/utils/concatArrayBuffer.ts
function concatArrayBuffer(left, right) {
  const result = new Uint8Array(left.byteLength + right.byteLength);
  result.set(left, 0);
  result.set(right, left.byteLength);
  return result;
}

// src/interceptors/XMLHttpRequest/polyfills/EventPolyfill.ts
var EventPolyfill = class {
  constructor(type, options) {
    this.AT_TARGET = 0;
    this.BUBBLING_PHASE = 0;
    this.CAPTURING_PHASE = 0;
    this.NONE = 0;
    this.type = "";
    this.srcElement = null;
    this.currentTarget = null;
    this.eventPhase = 0;
    this.isTrusted = true;
    this.composed = false;
    this.cancelable = true;
    this.defaultPrevented = false;
    this.bubbles = true;
    this.lengthComputable = true;
    this.loaded = 0;
    this.total = 0;
    this.cancelBubble = false;
    this.returnValue = true;
    this.type = type;
    this.target = (options == null ? void 0 : options.target) || null;
    this.currentTarget = (options == null ? void 0 : options.currentTarget) || null;
    this.timeStamp = Date.now();
  }
  composedPath() {
    return [];
  }
  initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.bubbles = !!bubbles;
    this.cancelable = !!cancelable;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
  }
  stopImmediatePropagation() {
  }
};

// src/interceptors/XMLHttpRequest/polyfills/ProgressEventPolyfill.ts
var ProgressEventPolyfill = class extends EventPolyfill {
  constructor(type, init) {
    super(type);
    this.lengthComputable = (init == null ? void 0 : init.lengthComputable) || false;
    this.composed = (init == null ? void 0 : init.composed) || false;
    this.loaded = (init == null ? void 0 : init.loaded) || 0;
    this.total = (init == null ? void 0 : init.total) || 0;
  }
};

// src/interceptors/XMLHttpRequest/utils/createEvent.ts
var SUPPORTS_PROGRESS_EVENT = typeof ProgressEvent !== "undefined";
function createEvent(target, type, init) {
  const progressEvents = [
    "error",
    "progress",
    "loadstart",
    "loadend",
    "load",
    "timeout",
    "abort"
  ];
  const ProgressEventClass = SUPPORTS_PROGRESS_EVENT ? ProgressEvent : ProgressEventPolyfill;
  const event = progressEvents.includes(type) ? new ProgressEventClass(type, {
    lengthComputable: true,
    loaded: (init == null ? void 0 : init.loaded) || 0,
    total: (init == null ? void 0 : init.total) || 0
  }) : new EventPolyfill(type, {
    target,
    currentTarget: target
  });
  return event;
}

// src/utils/bufferUtils.ts
var encoder = new TextEncoder();
function encodeBuffer(text) {
  return encoder.encode(text);
}
function decodeBuffer(buffer, encoding) {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}
function toArrayBuffer(array) {
  return array.buffer.slice(
    array.byteOffset,
    array.byteOffset + array.byteLength
  );
}

// src/utils/findPropertySource.ts
function findPropertySource(target, propertyName) {
  if (!(propertyName in target)) {
    return null;
  }
  const hasProperty = Object.prototype.hasOwnProperty.call(target, propertyName);
  if (hasProperty) {
    return target;
  }
  const prototype = Reflect.getPrototypeOf(target);
  return prototype ? findPropertySource(prototype, propertyName) : null;
}

// src/utils/createProxy.ts
function createProxy(target, options) {
  const proxy = new Proxy(target, optionsToProxyHandler(options));
  return proxy;
}
function optionsToProxyHandler(options) {
  const { constructorCall, methodCall, getProperty, setProperty } = options;
  const handler = {};
  if (typeof constructorCall !== "undefined") {
    handler.construct = function(target, args, newTarget) {
      const next = Reflect.construct.bind(null, target, args, newTarget);
      return constructorCall.call(newTarget, args, next);
    };
  }
  handler.set = function(target, propertyName, nextValue) {
    const next = () => {
      const propertySource = findPropertySource(target, propertyName) || target;
      const ownDescriptors = Reflect.getOwnPropertyDescriptor(
        propertySource,
        propertyName
      );
      if (typeof (ownDescriptors == null ? void 0 : ownDescriptors.set) !== "undefined") {
        ownDescriptors.set.apply(target, [nextValue]);
        return true;
      }
      return Reflect.defineProperty(propertySource, propertyName, {
        writable: true,
        enumerable: true,
        configurable: true,
        value: nextValue
      });
    };
    if (typeof setProperty !== "undefined") {
      return setProperty.call(target, [propertyName, nextValue], next);
    }
    return next();
  };
  handler.get = function(target, propertyName, receiver) {
    const next = () => target[propertyName];
    const value = typeof getProperty !== "undefined" ? getProperty.call(target, [propertyName, receiver], next) : next();
    if (typeof value === "function") {
      return (...args) => {
        const next2 = value.bind(target, ...args);
        if (typeof methodCall !== "undefined") {
          return methodCall.call(target, [propertyName, args], next2);
        }
        return next2();
      };
    }
    return value;
  };
  return handler;
}

// src/interceptors/XMLHttpRequest/utils/isDomParserSupportedType.ts
function isDomParserSupportedType(type) {
  const supportedTypes = [
    "application/xhtml+xml",
    "application/xml",
    "image/svg+xml",
    "text/html",
    "text/xml"
  ];
  return supportedTypes.some((supportedType) => {
    return type.startsWith(supportedType);
  });
}

// src/utils/parseJson.ts
function parseJson(data) {
  try {
    const json = JSON.parse(data);
    return json;
  } catch (_) {
    return null;
  }
}

// src/utils/responseUtils.ts
var RESPONSE_STATUS_CODES_WITHOUT_BODY = /* @__PURE__ */ new Set([
  101,
  103,
  204,
  205,
  304
]);
function isResponseWithoutBody(status) {
  return RESPONSE_STATUS_CODES_WITHOUT_BODY.has(status);
}

// src/interceptors/XMLHttpRequest/utils/createResponse.ts
function createResponse(request, body) {
  const responseBodyOrNull = isResponseWithoutBody(request.status) ? null : body;
  return new Response(responseBodyOrNull, {
    status: request.status,
    statusText: request.statusText,
    headers: createHeadersFromXMLHttpReqestHeaders(
      request.getAllResponseHeaders()
    )
  });
}
function createHeadersFromXMLHttpReqestHeaders(headersString) {
  const headers = new Headers();
  const lines = headersString.split(/[\r\n]+/);
  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }
    const [name, ...parts] = line.split(": ");
    const value = parts.join(": ");
    headers.append(name, value);
  }
  return headers;
}

// src/interceptors/XMLHttpRequest/XMLHttpRequestController.ts
var IS_MOCKED_RESPONSE = Symbol("isMockedResponse");
var IS_NODE = isNodeProcess();
var XMLHttpRequestController = class {
  constructor(initialRequest, logger) {
    this.initialRequest = initialRequest;
    this.logger = logger;
    this.method = "GET";
    this.url = null;
    this.events = /* @__PURE__ */ new Map();
    this.requestId = uuidv4();
    this.requestHeaders = new Headers();
    this.responseBuffer = new Uint8Array();
    this.request = createProxy(initialRequest, {
      setProperty: ([propertyName, nextValue], invoke) => {
        switch (propertyName) {
          case "ontimeout": {
            const eventName = propertyName.slice(
              2
            );
            this.request.addEventListener(eventName, nextValue);
            return invoke();
          }
          default: {
            return invoke();
          }
        }
      },
      methodCall: ([methodName, args], invoke) => {
        var _a;
        switch (methodName) {
          case "open": {
            const [method, url] = args;
            if (typeof url === "undefined") {
              this.method = "GET";
              this.url = toAbsoluteUrl(method);
            } else {
              this.method = method;
              this.url = toAbsoluteUrl(url);
            }
            this.logger = this.logger.extend(`${this.method} ${this.url.href}`);
            this.logger.info("open", this.method, this.url.href);
            return invoke();
          }
          case "addEventListener": {
            const [eventName, listener] = args;
            this.registerEvent(eventName, listener);
            this.logger.info("addEventListener", eventName, listener);
            return invoke();
          }
          case "setRequestHeader": {
            const [name, value] = args;
            this.requestHeaders.set(name, value);
            this.logger.info("setRequestHeader", name, value);
            return invoke();
          }
          case "send": {
            const [body] = args;
            if (body != null) {
              this.requestBody = typeof body === "string" ? encodeBuffer(body) : body;
            }
            this.request.addEventListener("load", () => {
              if (typeof this.onResponse !== "undefined") {
                const fetchResponse = createResponse(
                  this.request,
                  /**
                   * The `response` property is the right way to read
                   * the ambiguous response body, as the request's "responseType" may differ.
                   * @see https://xhr.spec.whatwg.org/#the-response-attribute
                   */
                  this.request.response
                );
                this.onResponse.call(this, {
                  response: fetchResponse,
                  isMockedResponse: IS_MOCKED_RESPONSE in this.request,
                  request: fetchRequest,
                  requestId: this.requestId
                });
              }
            });
            const fetchRequest = this.toFetchApiRequest();
            const onceRequestSettled = ((_a = this.onRequest) == null ? void 0 : _a.call(this, {
              request: fetchRequest,
              requestId: this.requestId
            })) || Promise.resolve();
            onceRequestSettled.finally(() => {
              if (this.request.readyState < this.request.LOADING) {
                this.logger.info(
                  "request callback settled but request has not been handled (readystate %d), performing as-is...",
                  this.request.readyState
                );
                if (IS_NODE) {
                  this.request.setRequestHeader("X-Request-Id", this.requestId);
                }
                return invoke();
              }
            });
            break;
          }
          default: {
            return invoke();
          }
        }
      }
    });
  }
  registerEvent(eventName, listener) {
    const prevEvents = this.events.get(eventName) || [];
    const nextEvents = prevEvents.concat(listener);
    this.events.set(eventName, nextEvents);
    this.logger.info('registered event "%s"', eventName, listener);
  }
  /**
   * Responds to the current request with the given
   * Fetch API `Response` instance.
   */
  respondWith(response) {
    this.logger.info(
      "responding with a mocked response: %d %s",
      response.status,
      response.statusText
    );
    define(this.request, IS_MOCKED_RESPONSE, true);
    define(this.request, "status", response.status);
    define(this.request, "statusText", response.statusText);
    define(this.request, "responseURL", this.url.href);
    this.request.getResponseHeader = new Proxy(this.request.getResponseHeader, {
      apply: (_, __, args) => {
        this.logger.info("getResponseHeader", args[0]);
        if (this.request.readyState < this.request.HEADERS_RECEIVED) {
          this.logger.info("headers not received yet, returning null");
          return null;
        }
        const headerValue = response.headers.get(args[0]);
        this.logger.info(
          'resolved response header "%s" to',
          args[0],
          headerValue
        );
        return headerValue;
      }
    });
    this.request.getAllResponseHeaders = new Proxy(
      this.request.getAllResponseHeaders,
      {
        apply: () => {
          this.logger.info("getAllResponseHeaders");
          if (this.request.readyState < this.request.HEADERS_RECEIVED) {
            this.logger.info("headers not received yet, returning empty string");
            return "";
          }
          const headersList = Array.from(response.headers.entries());
          const allHeaders = headersList.map(([headerName, headerValue]) => {
            return `${headerName}: ${headerValue}`;
          }).join("\r\n");
          this.logger.info("resolved all response headers to", allHeaders);
          return allHeaders;
        }
      }
    );
    Object.defineProperties(this.request, {
      response: {
        enumerable: true,
        configurable: false,
        get: () => this.response
      },
      responseText: {
        enumerable: true,
        configurable: false,
        get: () => this.responseText
      },
      responseXML: {
        enumerable: true,
        configurable: false,
        get: () => this.responseXML
      }
    });
    const totalResponseBodyLength = response.headers.has("Content-Length") ? Number(response.headers.get("Content-Length")) : (
      /**
       * @todo Infer the response body length from the response body.
       */
      void 0
    );
    this.logger.info("calculated response body length", totalResponseBodyLength);
    this.trigger("loadstart", {
      loaded: 0,
      total: totalResponseBodyLength
    });
    this.setReadyState(this.request.HEADERS_RECEIVED);
    this.setReadyState(this.request.LOADING);
    const finalizeResponse = () => {
      this.logger.info("finalizing the mocked response...");
      this.setReadyState(this.request.DONE);
      this.trigger("load", {
        loaded: this.responseBuffer.byteLength,
        total: totalResponseBodyLength
      });
      this.trigger("loadend", {
        loaded: this.responseBuffer.byteLength,
        total: totalResponseBodyLength
      });
    };
    if (response.body) {
      this.logger.info("mocked response has body, streaming...");
      const reader = response.body.getReader();
      const readNextResponseBodyChunk = async () => {
        const { value, done } = await reader.read();
        if (done) {
          this.logger.info("response body stream done!");
          finalizeResponse();
          return;
        }
        if (value) {
          this.logger.info("read response body chunk:", value);
          this.responseBuffer = concatArrayBuffer(this.responseBuffer, value);
          this.trigger("progress", {
            loaded: this.responseBuffer.byteLength,
            total: totalResponseBodyLength
          });
        }
        readNextResponseBodyChunk();
      };
      readNextResponseBodyChunk();
    } else {
      finalizeResponse();
    }
  }
  responseBufferToText() {
    return decodeBuffer(this.responseBuffer);
  }
  get response() {
    this.logger.info(
      "getResponse (responseType: %s)",
      this.request.responseType
    );
    if (this.request.readyState !== this.request.DONE) {
      return null;
    }
    switch (this.request.responseType) {
      case "json": {
        const responseJson = parseJson(this.responseBufferToText());
        this.logger.info("resolved response JSON", responseJson);
        return responseJson;
      }
      case "arraybuffer": {
        const arrayBuffer = toArrayBuffer(this.responseBuffer);
        this.logger.info("resolved response ArrayBuffer", arrayBuffer);
        return arrayBuffer;
      }
      case "blob": {
        const mimeType = this.request.getResponseHeader("Content-Type") || "text/plain";
        const responseBlob = new Blob([this.responseBufferToText()], {
          type: mimeType
        });
        this.logger.info(
          "resolved response Blob (mime type: %s)",
          responseBlob,
          mimeType
        );
        return responseBlob;
      }
      default: {
        const responseText = this.responseBufferToText();
        this.logger.info(
          'resolving "%s" response type as text',
          this.request.responseType,
          responseText
        );
        return responseText;
      }
    }
  }
  get responseText() {
    invariant3(
      this.request.responseType === "" || this.request.responseType === "text",
      "InvalidStateError: The object is in invalid state."
    );
    if (this.request.readyState !== this.request.LOADING && this.request.readyState !== this.request.DONE) {
      return "";
    }
    const responseText = this.responseBufferToText();
    this.logger.info('getResponseText: "%s"', responseText);
    return responseText;
  }
  get responseXML() {
    invariant3(
      this.request.responseType === "" || this.request.responseType === "document",
      "InvalidStateError: The object is in invalid state."
    );
    if (this.request.readyState !== this.request.DONE) {
      return null;
    }
    const contentType = this.request.getResponseHeader("Content-Type") || "";
    if (typeof DOMParser === "undefined") {
      console.warn(
        "Cannot retrieve XMLHttpRequest response body as XML: DOMParser is not defined. You are likely using an environment that is not browser or does not polyfill browser globals correctly."
      );
      return null;
    }
    if (isDomParserSupportedType(contentType)) {
      return new DOMParser().parseFromString(
        this.responseBufferToText(),
        contentType
      );
    }
    return null;
  }
  errorWith(error) {
    this.logger.info("responding with an error");
    this.setReadyState(this.request.DONE);
    this.trigger("error");
    this.trigger("loadend");
  }
  /**
   * Transitions this request's `readyState` to the given one.
   */
  setReadyState(nextReadyState) {
    this.logger.info(
      "setReadyState: %d -> %d",
      this.request.readyState,
      nextReadyState
    );
    if (this.request.readyState === nextReadyState) {
      this.logger.info("ready state identical, skipping transition...");
      return;
    }
    define(this.request, "readyState", nextReadyState);
    this.logger.info("set readyState to: %d", nextReadyState);
    if (nextReadyState !== this.request.UNSENT) {
      this.logger.info('triggerring "readystatechange" event...');
      this.trigger("readystatechange");
    }
  }
  /**
   * Triggers given event on the `XMLHttpRequest` instance.
   */
  trigger(eventName, options) {
    const callback = this.request[`on${eventName}`];
    const event = createEvent(this.request, eventName, options);
    this.logger.info('trigger "%s"', eventName, options || "");
    if (typeof callback === "function") {
      this.logger.info('found a direct "%s" callback, calling...', eventName);
      callback.call(this.request, event);
    }
    for (const [registeredEventName, listeners] of this.events) {
      if (registeredEventName === eventName) {
        this.logger.info(
          'found %d listener(s) for "%s" event, calling...',
          listeners.length,
          eventName
        );
        listeners.forEach((listener) => listener.call(this.request, event));
      }
    }
  }
  /**
   * Converts this `XMLHttpRequest` instance into a Fetch API `Request` instance.
   */
  toFetchApiRequest() {
    this.logger.info("converting request to a Fetch API Request...");
    const fetchRequest = new Request(this.url.href, {
      method: this.method,
      headers: this.requestHeaders,
      /**
       * @see https://xhr.spec.whatwg.org/#cross-origin-credentials
       */
      credentials: this.request.withCredentials ? "include" : "same-origin",
      body: ["GET", "HEAD"].includes(this.method) ? null : this.requestBody
    });
    const proxyHeaders = createProxy(fetchRequest.headers, {
      methodCall: ([methodName, args], invoke) => {
        switch (methodName) {
          case "append":
          case "set": {
            const [headerName, headerValue] = args;
            this.request.setRequestHeader(headerName, headerValue);
            break;
          }
          case "delete": {
            const [headerName] = args;
            console.warn(
              `XMLHttpRequest: Cannot remove a "${headerName}" header from the Fetch API representation of the "${fetchRequest.method} ${fetchRequest.url}" request. XMLHttpRequest headers cannot be removed.`
            );
            break;
          }
        }
        return invoke();
      }
    });
    define(fetchRequest, "headers", proxyHeaders);
    this.logger.info("converted request to a Fetch API Request!", fetchRequest);
    return fetchRequest;
  }
};
function toAbsoluteUrl(url) {
  if (typeof location === "undefined") {
    return new URL(url);
  }
  return new URL(url.toString(), location.href);
}
function define(target, property, value) {
  Reflect.defineProperty(target, property, {
    // Ensure writable properties to allow redefining readonly properties.
    writable: true,
    enumerable: true,
    value
  });
}

// src/interceptors/XMLHttpRequest/XMLHttpRequestProxy.ts
function createXMLHttpRequestProxy({
  emitter,
  logger
}) {
  const XMLHttpRequestProxy = new Proxy(globalThis.XMLHttpRequest, {
    construct(target, args, newTarget) {
      logger.info("constructed new XMLHttpRequest");
      const originalRequest = Reflect.construct(target, args, newTarget);
      const prototypeDescriptors = Object.getOwnPropertyDescriptors(
        target.prototype
      );
      for (const propertyName in prototypeDescriptors) {
        Reflect.defineProperty(
          originalRequest,
          propertyName,
          prototypeDescriptors[propertyName]
        );
      }
      const xhrRequestController = new XMLHttpRequestController(
        originalRequest,
        logger
      );
      xhrRequestController.onRequest = async function({ request, requestId }) {
        const { interactiveRequest, requestController } = toInteractiveRequest(request);
        this.logger.info("awaiting mocked response...");
        emitter.once("request", ({ requestId: pendingRequestId }) => {
          if (pendingRequestId !== requestId) {
            return;
          }
          if (requestController.responsePromise.state === "pending") {
            requestController.respondWith(void 0);
          }
        });
        const resolverResult = await until2(async () => {
          this.logger.info(
            'emitting the "request" event for %s listener(s)...',
            emitter.listenerCount("request")
          );
          await emitAsync(emitter, "request", {
            request: interactiveRequest,
            requestId
          });
          this.logger.info('all "request" listeners settled!');
          const mockedResponse2 = await requestController.responsePromise;
          this.logger.info("event.respondWith called with:", mockedResponse2);
          return mockedResponse2;
        });
        if (resolverResult.error) {
          this.logger.info(
            "request listener threw an exception, aborting request...",
            resolverResult.error
          );
          xhrRequestController.errorWith(resolverResult.error);
          return;
        }
        const mockedResponse = resolverResult.data;
        if (typeof mockedResponse !== "undefined") {
          this.logger.info(
            "received mocked response: %d %s",
            mockedResponse.status,
            mockedResponse.statusText
          );
          if (mockedResponse.type === "error") {
            this.logger.info(
              "received a network error response, rejecting the request promise..."
            );
            xhrRequestController.errorWith(new TypeError("Network error"));
            return;
          }
          return xhrRequestController.respondWith(mockedResponse);
        }
        this.logger.info(
          "no mocked response received, performing request as-is..."
        );
      };
      xhrRequestController.onResponse = async function({
        response,
        isMockedResponse,
        request,
        requestId
      }) {
        this.logger.info(
          'emitting the "response" event for %s listener(s)...',
          emitter.listenerCount("response")
        );
        emitter.emit("response", {
          response,
          isMockedResponse,
          request,
          requestId
        });
      };
      return xhrRequestController.request;
    }
  });
  return XMLHttpRequestProxy;
}

// src/interceptors/XMLHttpRequest/index.ts
var _XMLHttpRequestInterceptor = class extends Interceptor {
  constructor() {
    super(_XMLHttpRequestInterceptor.interceptorSymbol);
  }
  checkEnvironment() {
    return typeof globalThis.XMLHttpRequest !== "undefined";
  }
  setup() {
    const logger = this.logger.extend("setup");
    logger.info('patching "XMLHttpRequest" module...');
    const PureXMLHttpRequest = globalThis.XMLHttpRequest;
    invariant4(
      !PureXMLHttpRequest[IS_PATCHED_MODULE],
      'Failed to patch the "XMLHttpRequest" module: already patched.'
    );
    globalThis.XMLHttpRequest = createXMLHttpRequestProxy({
      emitter: this.emitter,
      logger: this.logger
    });
    logger.info(
      'native "XMLHttpRequest" module patched!',
      globalThis.XMLHttpRequest.name
    );
    Object.defineProperty(globalThis.XMLHttpRequest, IS_PATCHED_MODULE, {
      enumerable: true,
      configurable: true,
      value: true
    });
    this.subscriptions.push(() => {
      Object.defineProperty(globalThis.XMLHttpRequest, IS_PATCHED_MODULE, {
        value: void 0
      });
      globalThis.XMLHttpRequest = PureXMLHttpRequest;
      logger.info(
        'native "XMLHttpRequest" module restored!',
        globalThis.XMLHttpRequest.name
      );
    });
  }
};
var XMLHttpRequestInterceptor = _XMLHttpRequestInterceptor;
XMLHttpRequestInterceptor.interceptorSymbol = Symbol("xhr");

// src/presets/browser.ts
var browser_default = [
  new FetchInterceptor(),
  new XMLHttpRequestInterceptor()
];
export {
  browser_default as default
};
