const CACHE_NAME = 'kids-study-tracker-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './icons/icon-16.png',
  './icons/icon-32.png',
  './icons/favicon.ico',
  './icons/icon-198.png',
  './icons/icon-512.png'
];

// 安装Service Worker并缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 拦截网络请求，网络优先策略
self.addEventListener('fetch', event => {
  // 对于HTML、JS和CSS文件使用网络优先策略
  if (event.request.url.match(/\.(html|js|css)$/)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 请求成功，更新缓存
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 网络请求失败，尝试从缓存获取
          return caches.match(event.request);
        })
    );
  } else {
    // 对于其他资源使用缓存优先策略
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // 如果找到缓存的响应，则返回缓存
          if (response) {
            return response;
          }
          // 否则发起网络请求
          return fetch(event.request);
        })
    );
  }
});

// 清理旧版本缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 立即控制所有页面
  event.waitUntil(self.clients.claim());
});

// 监听消息，处理skipWaiting请求
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
