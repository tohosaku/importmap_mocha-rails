var e=class extends Error{constructor(e,t,s){super(`Possible EventEmitter memory leak detected. ${s} ${t.toString()} listeners added. Use emitter.setMaxListeners() to increase limit`);this.emitter=e;this.type=t;this.count=s;this.name="MaxListenersExceededWarning"}};var t=class{static listenerCount(e,t){return e.listenerCount(t)}constructor(){this.events=new Map;this.maxListeners=t.defaultMaxListeners;this.hasWarnedAboutPotentialMemoryLeak=false}_emitInternalEvent(e,t,s){this.emit(e,t,s)}_getListeners(e){return Array.prototype.concat.apply([],this.events.get(e))||[]}_removeListener(e,t){const s=e.indexOf(t);s>-1&&e.splice(s,1);return[]}_wrapOnceListener(e,t){const onceListener=(...s)=>{this.removeListener(e,onceListener);return t.apply(this,s)};Object.defineProperty(onceListener,"name",{value:t.name});return onceListener}setMaxListeners(e){this.maxListeners=e;return this}getMaxListeners(){return this.maxListeners}eventNames(){return Array.from(this.events.keys())}emit(e,...t){const s=this._getListeners(e);s.forEach((e=>{e.apply(this,t)}));return s.length>0}addListener(t,s){this._emitInternalEvent("newListener",t,s);const r=this._getListeners(t).concat(s);this.events.set(t,r);if(this.maxListeners>0&&this.listenerCount(t)>this.maxListeners&&!this.hasWarnedAboutPotentialMemoryLeak){this.hasWarnedAboutPotentialMemoryLeak=true;const s=new e(this,t,this.listenerCount(t));console.warn(s)}return this}on(e,t){return this.addListener(e,t)}once(e,t){return this.addListener(e,this._wrapOnceListener(e,t))}prependListener(e,t){const s=this._getListeners(e);if(s.length>0){const r=[t].concat(s);this.events.set(e,r)}else this.events.set(e,s.concat(t));return this}prependOnceListener(e,t){return this.prependListener(e,this._wrapOnceListener(e,t))}removeListener(e,t){const s=this._getListeners(e);if(s.length>0){this._removeListener(s,t);this.events.set(e,s);this._emitInternalEvent("removeListener",e,t)}return this}off(e,t){return this.removeListener(e,t)}removeAllListeners(e){e?this.events.delete(e):this.events.clear();return this}listeners(e){return Array.from(this._getListeners(e))}listenerCount(e){return this._getListeners(e).length}rawListeners(e){return this.listeners(e)}};var s=t;s.defaultMaxListeners=10;export{s as Emitter,e as MemoryLeakError};
