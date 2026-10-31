/* Hunter System service worker: works offline after the first visit. Bump VERSION when files change. */
var VERSION="hunter-v28";
var CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==VERSION;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  var req=e.request;if(req.method!=="GET")return;
  var url=new URL(req.url);
  if(url.origin===location.origin&&(req.mode==="navigate"||url.pathname.endsWith(".html"))){
    /* network first for the page so updates arrive, cache fallback when offline */
    e.respondWith(fetch(req).then(function(r){var cp=r.clone();caches.open(VERSION).then(function(c){c.put("index.html",cp);});return r;}).catch(function(){return caches.match("index.html");}));return;
  }
  /* cache first for everything else, including Google Fonts */
  e.respondWith(caches.match(req).then(function(hit){return hit||fetch(req).then(function(r){if(r&&(r.ok||r.type==="opaque")){var cp=r.clone();caches.open(VERSION).then(function(c){c.put(req,cp);});}return r;});}));
});
