import{isNodeProcess as e}from"is-node-process";import{format as r}from"outvariant";var t=Object.defineProperty;var __export=(e,r)=>{for(var i in r)t(e,i,{get:r[i],enumerable:true})};var i={};__export(i,{blue:()=>blue,gray:()=>gray,green:()=>green,red:()=>red,yellow:()=>yellow});function yellow(e){return`[33m${e}[0m`}function blue(e){return`[34m${e}[0m`}function gray(e){return`[90m${e}[0m`}function red(e){return`[31m${e}[0m`}function green(e){return`[32m${e}[0m`}var s=e();var n=class{constructor(e){this.name=e;this.prefix=`[${this.name}]`;const r=getVariable("DEBUG");const t=getVariable("LOG_LEVEL");const i="1"===r||"true"===r||"undefined"!==typeof r&&this.name.startsWith(r);if(i){this.debug=isDefinedAndNotEquals(t,"debug")?noop:this.debug;this.info=isDefinedAndNotEquals(t,"info")?noop:this.info;this.success=isDefinedAndNotEquals(t,"success")?noop:this.success;this.warning=isDefinedAndNotEquals(t,"warning")?noop:this.warning;this.error=isDefinedAndNotEquals(t,"error")?noop:this.error}else{this.info=noop;this.success=noop;this.warning=noop;this.error=noop;this.only=noop}}prefix;extend(e){return new n(`${this.name}:${e}`)}debug(e,...r){this.logEntry({level:"debug",message:gray(e),positionals:r,prefix:this.prefix,colors:{prefix:"gray"}})}info(e,...r){this.logEntry({level:"info",message:e,positionals:r,prefix:this.prefix,colors:{prefix:"blue"}});const t=new o;return(e,...r)=>{t.measure();this.logEntry({level:"info",message:`${e} ${gray(`${t.deltaTime}ms`)}`,positionals:r,prefix:this.prefix,colors:{prefix:"blue"}})}}success(e,...r){this.logEntry({level:"info",message:e,positionals:r,prefix:`✔ ${this.prefix}`,colors:{timestamp:"green",prefix:"green"}})}warning(e,...r){this.logEntry({level:"warning",message:e,positionals:r,prefix:`⚠ ${this.prefix}`,colors:{timestamp:"yellow",prefix:"yellow"}})}error(e,...r){this.logEntry({level:"error",message:e,positionals:r,prefix:`✖ ${this.prefix}`,colors:{timestamp:"red",prefix:"red"}})}only(e){e()}createEntry(e,r){return{timestamp:new Date,level:e,message:r}}logEntry(e){const{level:r,message:t,prefix:s,colors:n,positionals:o=[]}=e;const a=this.createEntry(r,t);const l=n?.timestamp||"gray";const c=n?.prefix||"gray";const f={timestamp:i[l],prefix:i[c]};const u=this.getWriter(r);u([f.timestamp(this.formatTimestamp(a.timestamp))].concat(null!=s?f.prefix(s):[]).concat(serializeInput(t)).join(" "),...o.map(serializeInput))}formatTimestamp(e){return`${e.toLocaleTimeString("en-GB")}:${e.getMilliseconds()}`}getWriter(e){switch(e){case"debug":case"success":case"info":return log;case"warning":return warn;case"error":return error}}};var o=class{startTime;endTime;deltaTime;constructor(){this.startTime=performance.now()}measure(){this.endTime=performance.now();const e=this.endTime-this.startTime;this.deltaTime=e.toFixed(2)}};var noop=()=>{};function log(e,...t){s?process.stdout.write(r(e,...t)+"\n"):console.log(e,...t)}function warn(e,...t){s?process.stderr.write(r(e,...t)+"\n"):console.warn(e,...t)}function error(e,...t){s?process.stderr.write(r(e,...t)+"\n"):console.error(e,...t)}function getVariable(e){return s?process.env[e]:globalThis[e]?.toString()}function isDefinedAndNotEquals(e,r){return void 0!==e&&e!==r}function serializeInput(e){return"undefined"===typeof e?"undefined":null===e?"null":"string"===typeof e?e:"object"===typeof e?JSON.stringify(e):e.toString()}export{n as Logger};
