# audittv.az Production Kurulum Notlari

Bu proje Traefik + Portainer + Cloudflared yapisina gore ayarlanmistir.

## 1) Preflight

Sunucuda asagidaki kontrolleri gecmeden deploy etmeyin:

```bash
uname -a
echo "$SHELL"
id
pwd
git status -sb || true
ls -ld /datastore
docker --version
docker ps
docker network ls | grep edge
```

Beklenen sabitler:
- Traefik entrypoint: `web`
- Traefik hedefi: `http://127.0.0.1:8080`
- Docker network: `edge` (external)
- Host port acma: yok

## 2) Dizin ve ZIP

```bash
mkdir -p /datastore/audittv
# ZIP bu dizine koyulmali:
# /datastore/audittv/audittv.zip

mkdir -p /datastore/audittv/app
unzip -o /datastore/audittv/audittv.zip -d /datastore/audittv/app

mkdir -p /datastore/audittv/uploads
mkdir -p /datastore/audittv/nginx-logs
mkdir -p /datastore/audittv/data

# Mac artifact temizligi
find /datastore/audittv/app -name "__MACOSX" -type d -prune -exec rm -rf {} +
find /datastore/audittv/app -name "._*" -type f -delete
```

## 3) Image Build (hostta)

Portainer build context sorunu yasarsaniz image'lari hostta build edin:

```bash
docker build -t audittv-backend:latest -f /datastore/audittv/app/Dockerfile.backend /datastore/audittv/app
docker build -t audittv-frontend:latest -f /datastore/audittv/app/Dockerfile.frontend /datastore/audittv/app
```

## 4) Portainer Stack

`/datastore/audittv/app/docker-compose.portainer.yml` dosyasini Portainer Stack olarak deploy edin.

Domain kurallari:
- Frontend: `Host(audittv.az)`
- API: `Host(audittv.az) && (PathPrefix(/api) || PathPrefix(/uploads))`

## 5) Cloudflared / DNS

Cloudflare Zero Trust -> Tunnels -> Public Hostnames:
- `audittv.az` -> `http://127.0.0.1:8080`

DNS kaydi yoksa `ERR_NAME_NOT_RESOLVED` gorulur.

## 6) Test

```bash
curl -H "Host: audittv.az" http://127.0.0.1:8080/
curl -H "Host: audittv.az" http://127.0.0.1:8080/api/health
docker ps | grep audittv
```
