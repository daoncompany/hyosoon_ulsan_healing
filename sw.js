// PWA(설치 가능한 웹앱) 서비스 워커.
// 우리 사이트(같은 출처)의 정적 파일만 캐싱해서 오프라인/재방문 시 빠르게 뜨도록 하고,
// 구글 폼 제출 등 다른 사이트로 나가는 요청은 절대 건드리지 않고 그대로 통과시킨다.
var CACHE_NAME = 'hyosoon-v2';
var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './img/logo_w.png',
  './img/bg01.png',
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);

  // 다른 사이트(구글 폼 제출 등)로 가는 요청은 캐시 없이 그대로 네트워크로 보낸다.
  if (url.origin !== self.location.origin || e.request.method !== 'GET') {
    return;
  }

  // 우리 사이트 파일: 네트워크를 우선 시도하고, 오프라인이면 캐시로 대체한다.
  e.respondWith(
    fetch(e.request)
      .then(function (res) {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, resClone); });
        return res;
      })
      .catch(function () {
        return caches.match(e.request);
      })
  );
});
