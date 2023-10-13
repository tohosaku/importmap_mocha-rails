function isNodeProcess(){if("undefined"!==typeof navigator&&"ReactNative"===navigator.product)return true;if("undefined"!==typeof process){const e=process.type;return"renderer"!==e&&"worker"!==e&&!!(process.versions&&process.versions.node)}return false}export{isNodeProcess};

