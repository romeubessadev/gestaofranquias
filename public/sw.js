/* Service worker do PWA.
   Regra: navegação NUNCA sai do cache quando há rede. Guardar o index.html
   antigo faz o app inteiro voltar a uma versão anterior, porque o HTML velho
   aponta para pacotes que não existem mais. O cache serve só para abrir
   offline e para os arquivos com hash no nome. */
const VERSAO = "v3";
const CACHE = `gestao-${VERSAO}`;
const OFFLINE = ["/index.html", "/manifest.webmanifest", "/favicon.svg", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(OFFLINE))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Navegação: sempre rede. Só cai no cache se estiver realmente offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches
            .open(CACHE)
            .then((c) => c.put("/index.html", copia))
            .catch(() => undefined);
          return res;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  // Demais arquivos: rede primeiro, cache como reserva.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copia = res.clone();
        caches
          .open(CACHE)
          .then((c) => c.put(req, copia))
          .catch(() => undefined);
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
