# Партии — учёт товаров с QR

Веб-система учёта товаров по партиям: админка с ролями, фото/видео (локально и YouTube), QR для потребителей и PWA-сканер.

## Стек

- Next.js 15 (App Router) + TypeScript
- Prisma + **PostgreSQL**
- Auth.js (Credentials)
- PWA (`manifest` + service worker)
- Деплой: **Railway** (`nixpacks.toml`)

## Быстрый старт (локально)

Нужен PostgreSQL (например Docker):

```bash
docker run --name batch-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=batch_tracker -p 5432:5432 -d postgres:16
cp .env.example .env
# DATABASE_URL уже подходит к контейнеру выше
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Railway

1. Создайте проект на [Railway](https://railway.app) и добавьте сервис из GitHub-репозитория.
2. Добавьте плагин **PostgreSQL** и привяжите `DATABASE_URL` к веб-сервису.
3. Задайте переменные:

| Переменная | Значение |
|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_APP_URL` | публичный URL приложения (`https://….up.railway.app`) |
| `CRON_SECRET` | случайная строка для джобы медиа |
| `DATABASE_URL` | из плагина Postgres (обычно подтягивается сам) |

4. Volume на путь `/data` (уже используется кодом через `DATA_DIR=/data`), иначе загруженные файлы пропадут при редеплое.
5. После деплоя: вход `admin@local` / `Admin123!` — сразу смените пароль.
6. Cron (каждые 10–15 мин): `curl -H "Authorization: Bearer $CRON_SECRET" https://ВАШ-URL/api/jobs/media-pipeline`

Сборка ставит `ffmpeg` через Nixpacks для сжатия архива видео.

## Переменные окружения

См. `.env.example`. Опционально YouTube: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` (`npm run youtube:auth`).

## Учётная запись по умолчанию

После seed:

- **Email:** `admin@local`
- **Пароль:** `Admin123!`
- **Роль:** `SUPER_ADMIN`

## Роли

| Роль | Права |
|---|---|
| `VIEWER` | Просмотр товаров, партий, журнала |
| `EDITOR` | + создание/редактирование партий и медиа |
| `ADMIN` | + CRUD товаров |
| `SUPER_ADMIN` | + управление пользователями |

## Ключевые маршруты

| Путь | Назначение |
|---|---|
| `/login` | Вход |
| `/admin` | Дашборд и поиск |
| `/admin/products` | Товары |
| `/admin/batches` | Партии, медиа, QR |
| `/admin/users` | Пользователи (супер-админ) |
| `/admin/audit` | Журнал изменений |
| `/b/[token]` | Публичная страница партии (QR) |
| `/scan` | Мобильный сканер QR (PWA) |

## Видео-пайплайн

1. Загрузка на сервер → 2. фон: YouTube → 3. сжатие в `storage/archive/` → 4. удаление через 90 дней.  
**QR не меняется** (`/b/{publicToken}`).

```bash
npm run media:pipeline
```

## Скрипты

- `npm run dev` — разработка
- `npm run build` / `npm start` — прод
- `npm run db:deploy` — миграции
- `npm run db:seed` — сид админа (только если ещё нет)
- `npm run youtube:auth` — refresh token YouTube
- `npm run media:pipeline` — очередь YouTube/архив + purge
