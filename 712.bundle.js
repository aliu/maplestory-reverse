(()=>{var e,t,r,n={712:(e,t,r)=>{self.onmessage=async e=>{const t=await r.e(409).then(r.bind(r,409)),{player:n,opponent:o,holes:i}=e.data,s=t.evaluate(n,o,i,5);self.postMessage(s)}}},o={};function i(e){if(o[e])return o[e].exports;var t=o[e]={id:e,exports:{}};return n[e](t,t.exports,i),t.exports}i.m=n,i.c=o,i.d=(e,t)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},i.f={},i.e=e=>Promise.all(Object.keys(i.f).reduce(((t,r)=>(i.f[r](e,t),t)),[])),i.u=e=>e+".bundle.js",i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;i.g.importScripts&&(e=i.g.location+"");var t=i.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");r.length&&(e=r[r.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),i.p=e})(),(()=>{var e={712:1};i.f.i=(t,r)=>{e[t]||importScripts(""+i.u(t))};var t=self.webpackChunkmaplestory_reverse=self.webpackChunkmaplestory_reverse||[],r=t.push.bind(t);t.push=t=>{var[n,o,s]=t;for(var a in o)i.o(o,a)&&(i.m[a]=o[a]);for(s&&s(i);n.length;)e[n.pop()]=1;r(t)}})(),e={},t={592:function(){return{}}},r={409:[592]},i.w={},i.f.wasm=function(n,o){(r[n]||[]).forEach((function(r,s){var a=e[r];if(a)o.push(a);else{var c,u=t[r](),l=fetch(i.p+""+{409:{592:"f364bbf904f27dc63d3a"}}[n][r]+".module.wasm");c=u instanceof Promise&&"function"==typeof WebAssembly.compileStreaming?Promise.all([WebAssembly.compileStreaming(l),u]).then((function(e){return WebAssembly.instantiate(e[0],e[1])})):"function"==typeof WebAssembly.instantiateStreaming?WebAssembly.instantiateStreaming(l,u):l.then((function(e){return e.arrayBuffer()})).then((function(e){return WebAssembly.instantiate(e,u)})),o.push(e[r]=c.then((function(e){return i.w[r]=(e.instance||e).exports})))}}))},i(712)})();