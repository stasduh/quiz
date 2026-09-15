# Викторина Феликса — Backend

NestJS API согласно `claude/architecture.md` в проекте. Реализованы:

- `POST /api/auth/guest` — гостевой вход по device_id
- `POST /api/auth/link-google` — привязка Google-аккаунта
- `PATCH /api/user/profile` — смена ника / аватара (пресеты)
- `GET /api/round/current` — текущий раунд (вопросы + правильные ответы)
- `POST /api/round/complete` — завершение раунда, начисление очков
- `GET /api/leaderboard` — таблица лидеров
- `POST /api/admin/login` + CRUD `/api/admin/rounds`, `/api/admin/questions` — управление контентом
- **Веб-панель администратора:** `/admin` (статическая HTML-страница, лежит в `public/admin/index.html`, ходит на `/api/admin/*`). Логин/пароль первого админа задаются через `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` при сидировании (по умолчанию `admin@felix-quiz.local` / `change-me-please` — обязательно смени после первого входа).

- **Веб-клиент игры:** `/game` (`public/game/index.html`) — одностраничное SPA на чистом JS, без сборки. Гостевой вход по браузерному UUID (localStorage), адаптивная сетка вариантов ответа (1/2/3 колонки в зависимости от их количества), мгновенная анимация верно/неверно, экран профиля (ник + аватар-эмодзи вместо загрузки картинок), таблица лидеров. `public/index.html` редиректит `/` на `/game/`.
- Клиент игры теперь веб (обычный сайт в браузере, без Flutter/Google Play — см. пометку "Пивот" в `architecture.md`).

## Запуск локально

```bash
npm install
cp .env.example .env   # заполнить DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed    # тестовые раунды 1 и 2
npm run start:dev
```

> В этом облачном окружении (агент-песочница) `binaries.prisma.sh` заблокирован сетевой политикой, поэтому `prisma generate`/`migrate` здесь выполнить не удалось — команды нужно запускать в твоей рабочей среде или в CI, где доступ к этому хосту не ограничен. Остальной код (все `.ts`-файлы) проверен через `tsc --noEmit` и синтаксически корректен — единственные ошибки типов сейчас связаны именно с отсутствующим сгенерированным Prisma Client, они исчезнут после `prisma generate`.

## Деплой на Vercel

- `api/index.ts` — serverless-обёртка над Nest-приложением (`@vendia/serverless-express`).
- `vercel.json` — генерирует Prisma Client перед сборкой.
- В Vercel Project Settings нужно задать переменные окружения: `DATABASE_URL` (Vercel Postgres/Neon, лучше pooled-connection-строку), `JWT_SECRET`, `GOOGLE_CLIENT_ID`.
- Миграции (`prisma migrate deploy`) гонять отдельно (например, вручную из CI) — Vercel build их не запускает.
