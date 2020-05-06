"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var t=e(require("debug")),r=e(require("licia/isWindows"));require("address"),require("default-gateway");var o=e(require("jimp"));require("licia/isStr");var n=e(require("licia/getPort")),s=e(require("fs")),a=e(require("child_process")),i=e(require("licia/sleep")),c=e(require("licia/toStr")),u=e(require("licia/waitUntil")),l=e(require("licia/concat")),d=e(require("licia/dateFormat")),p=e(require("ws")),m=require("events"),h=e(require("licia/uuid")),w=e(require("licia/stringify"));require("qrcode-terminal");const f=require("qrcode-reader");class y extends m.EventEmitter{constructor(e){super(),this.ws=e,this.ws.addEventListener("message",e=>{this.emit("message",e.data)}),this.ws.addEventListener("close",()=>{this.emit("close")})}send(e){this.ws.send(e)}close(){this.ws.close()}}class g extends m.EventEmitter{constructor(e,r,o){super(),this.puppet=r,this.namespace=o,this.callbacks=new Map,this.transport=e,this.debug=t("automator:protocol:"+this.namespace),this.onMessage=e=>{this.debug(`${d("yyyy-mm-dd HH:MM:ss:l")} ◀ RECV ${e}`);const{id:t,method:r,error:o,result:n,params:s}=JSON.parse(e);if(!t)return this.puppet.emit(r,s);const{callbacks:a}=this;if(t&&a.has(t)){const e=a.get(t);a.delete(t),o?e.reject(Error(o.message)):e.resolve(n)}},this.onClose=()=>{this.callbacks.forEach(e=>{e.reject(Error("Connection closed"))})},this.transport.on("message",this.onMessage),this.transport.on("close",this.onClose)}send(e,t={},r=!0){if(r&&this.puppet.adapter.has(e))return this.puppet.adapter.send(this,e,t);const o=h(),n=w({id:o,method:e,params:t});return this.debug(`${d("yyyy-mm-dd HH:MM:ss:l")} SEND ► ${n}`),new Promise((e,t)=>{try{this.transport.send(n)}catch(e){t(Error("Connection closed"))}this.callbacks.set(o,{resolve:e,reject:t})})}dispose(){this.transport.close()}static createDevtoolConnection(e,t){return new Promise((r,o)=>{const n=new p(e);n.addEventListener("open",()=>{r(new g(new y(n),t,"devtool"))}),n.addEventListener("error",o)})}static createRuntimeConnection(e,r,o){return new Promise((n,s)=>{t("automator:runtime")(`${d("yyyy-mm-dd HH:MM:ss:l")} port=${e}`);const a=new p.Server({port:e});u(async()=>{if(r.runtimeConnection)return!0},o,1e3).catch(e=>{throw Error("Failed to connect to runtime, please make sure the project is running")}),a.on("connection",(function(e){t("automator:runtime")(d("yyyy-mm-dd HH:MM:ss:l")+" connected");const o=new g(new y(e),r,"runtime");r.setRuntimeConnection(o),n(o)})),r.setRuntimeServer(a)})}}const v=t("automator:devtool");async function b(e,t,r){const{port:o,cliPath:n,timeout:s,cwd:p="",account:m="",args:h=[],launch:w=!0}=t;let f=!1,y=!1;if(!1!==w){const t={stdio:"ignore",detached:!0};p&&(t.cwd=p);let r=l(h,[]);r=l(r,["auto","--project"]),r=l(r,[e,"--auto-port",c(o)]),m&&(r=l(r,["--auto-account",m]));try{v("%s %o %o",n,r,t);const e=a.spawn(n,r,t);e.on("error",e=>{f=!0}),e.on("exit",()=>{setTimeout(()=>{y=!0},15e3)}),e.unref()}catch(e){f=!1}}else setTimeout(()=>{y=!0},15e3);const b=await u(async()=>{try{if(f||y)return!0;return await async function(e,t){let r;try{r=await g.createDevtoolConnection(e.wsEndpoint,t)}catch(t){throw Error(`Failed connecting to ${e.wsEndpoint}, check if target project window is opened with automation enabled`)}return r}({wsEndpoint:"ws://127.0.0.1:"+o},r)}catch(e){}},s,1e3);if(f)throw Error(`Failed to launch ${r.devtools.name}, please make sure cliPath is correctly specified`);if(y)throw Error(`Failed to launch ${r.devtools.name} , please make sure http port is open`);return await i(5e3),v(d("yyyy-mm-dd HH:MM:ss:l")+" connected"),b}const q={devtools:{name:"Wechat web devTools",remote:!0,automator:!0,paths:[r?"C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat":"/Applications/wechatwebdevtools.app/Contents/MacOS/cli"],required:["project.config.json","app.json","app.js"],defaultPort:9420,validate:async function(e,t){const r=function(e,t){const r=t.devtools.paths.slice(0);e&&r.unshift(e);for(const e of r)if(s.existsSync(e))return e;throw Error(t.devtools.name+" not found, please specify executablePath option")}(e.executablePath,t);let o=e.port||t.devtools.defaultPort;if(!1!==e.launch)try{o=await async function(e,t){const r=await n(e||t);if(e&&r!==e)throw Error(`Port ${e} is in use, please specify another port`);return r}(o)}catch(t){e.launch=!1}else{o===await n(o)&&(e.launch=!0)}return Object.assign(Object.assign({},e),{port:o,cliPath:r})},async create(e,r,o){const n=await b(e,r,o);return o.compiled?t("automator:devtool")("Waiting for runtime automator"):(t("automator:devtool")("initRuntimeAutomator"),n.send("App.callWxMethod",{method:"$$initRuntimeAutomator",args:[]})),n}},adapter:{"Tool.enableRemoteDebug":{reflect:async(e,t)=>{let{qrCode:r}=await e("Tool.enableRemoteDebug",t,!1);return r&&(r=await function(e){const t=new Buffer(e,"base64");return new Promise(async(e,r)=>{const n=await o.read(t),s=new f;s.callback=function(t,o){if(t)return r(t);e(o.result)},s.decode(n.bitmap)})}(r)),{qrCode:r}}},"App.callFunction":{reflect:async(e,t)=>{return e("App.callFunction",Object.assign(Object.assign({},t),{functionDeclaration:(r=t.functionDeclaration,"}"===r[r.length-1]?r.replace("{","{\nvar uni = wx;\n"):r.replace("=>","=>{\nvar uni = wx;\nreturn ")+"}")}),!1);var r}},"Element.getHTML":{reflect:async(e,t)=>({html:(await e("Element.getWXML",t,!1)).wxml})}}};module.exports=q;
