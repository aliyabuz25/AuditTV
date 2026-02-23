# AuditTV

Bu repo, AuditTV platformunun tek kod tabaninda calisan frontend + backend sistemini icerir.
Sistem amaci:
- Icerik odakli web sitesi yayini
- Admin panelinden icerik yonetimi
- Form/muracaat toplama
- Dosya yukleme ve statik servis
- Docker + Traefik + Portainer ile production yayin

## 1. Sistem Bilesenleri

### Frontend
- Teknoloji: React 19 + TypeScript + Vite
- Kaynak klasorleri: `pages/`, `components/`, `site/`
- Build ciktisi: `dist/`
- Production servis: Nginx (`Dockerfile.frontend`, `nginx.conf`)

### Backend
- Teknoloji: Node.js + Express
- Giris noktasi: `server/index.js`
- Gorevleri:
  - `/api/*` endpointleri
  - admin login/session yonetimi
  - sitemap/content saklama
  - form/muracaat kaydi
  - dosya upload (`/uploads`)
  - SMTP ile e-posta bildirimi (opsiyonel)

### Veri Katmani
- Veritabani: SQLite (`better-sqlite3`)
- Ana dosya: `data/site.db` (container icinde `/app/data/site.db`)
- Tablolar:
  - `site_content`
  - `course_requests`
  - `form_submissions`
  - `admin_users`
  - `admin_sessions`

### Dosya Depolama
- Upload dosyalari: `uploads/` (container icinde `/app/uploads`)
- Sitemap JSON: `current-sitemap.json` ve DB senkronizasyonu
- Nginx loglari (production): `/app/nginx-logs`

## 2. Istek Akisi (Production)

1. Kullanici `https://audittv.az` adresine gelir.
2. Cloudflared tunnel trafigi `http://127.0.0.1:8080` hedefine yollar.
3. Traefik, `edge` network uzerinden servislere route eder:
   - `Host(audittv.az)` -> frontend (Nginx)
   - `Host(audittv.az) && (PathPrefix(/api) || PathPrefix(/uploads))` -> backend (Express)
4. Frontend, API cagrilarini `/api/...` relative path ile backend'e gonderir.
5. Backend gerekirse SQLite ve dosya sistemi ile calisir, JSON response doner.

## 3. Ortam Degiskenleri

### Frontend
- `VITE_API_BASE_URL`
  - Bos ise relative calisir (`/api/...`) ve Traefik arkasinda sorunsuzdur.
  - Lokal farkli bir API hedefi istersen dolu verilebilir.
- `VITE_API_PROXY_TARGET`
  - Sadece local dev proxy icin kullanilir.
  - Varsayilan: `http://localhost:3001`

### Backend
- `PORT` (varsayilan: `3001`)
- `SQLITE_PATH`
- `SITEMAP_FILE`
- `UPLOADS_DIR`
- `PUBLIC_BASE_URL`
  - Upload response icindeki `absoluteUrl` alanini override eder.
  - `url` alani her zaman relative olarak doner (`/uploads/<file>`).

## 4. Local Gelistirme

Onkosul:
- Node.js 20+

Kurulum:
```bash
npm install
```

Backend'i ayri terminalde calistir:
```bash
npm run api
```

Frontend'i ayri terminalde calistir:
```bash
npm run dev
```

Lokal adresler:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

Not:
- Vite dev server, `/api` ve `/uploads` pathlerini backend'e proxyler.

## 5. Production (Docker + Traefik + Portainer)

Bu repo production icin asagidaki dosyalari icerir:
- `Dockerfile.backend`
- `Dockerfile.frontend`
- `nginx.conf`
- `docker-compose.portainer.yml`

### Beklenen server sabitleri
- Traefik entrypoint: `web`
- Traefik hedefi: `127.0.0.1:8080`
- Docker network: `edge` (external)
- Host port publish: yok

### Kalici dizinler
- `/datastore/audittv/app`
- `/datastore/audittv/uploads`
- `/datastore/audittv/nginx-logs`
- `/datastore/audittv/data`

### Image build (host tarafinda)
```bash
docker build -t audittv-backend:latest -f /datastore/audittv/app/Dockerfile.backend /datastore/audittv/app
docker build -t audittv-frontend:latest -f /datastore/audittv/app/Dockerfile.frontend /datastore/audittv/app
```

### Stack deploy
- `docker-compose.portainer.yml` dosyasini Portainer Stack olarak deploy et.
- Servisler sadece Traefik label ile expose edilir, host port acilmaz.

## 6. Test ve Dogrulama

Traefik uzerinden hizli test:
```bash
curl -H "Host: audittv.az" http://127.0.0.1:8080/
curl -H "Host: audittv.az" http://127.0.0.1:8080/api/health
```

Container dogrulama:
```bash
docker ps | grep audittv
```

## 7. Dikkat Edilecek Noktalar

- Traefik API rule'unda parantezleri koru.
- Uzun label satirlarini YAML icinde tek tirnakla tut.
- `__MACOSX` ve `._*` artifaktlarini deployden once temizle.
- API path seti degisirse (ornegin `/cdn`) router rule'una ekle.
