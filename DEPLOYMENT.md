# Torolàlana momba ny Fametrahana (Guide de Déploiement)

Ity rafitra ity dia ahitana:
- **Frontend** : React (Vite)
- **Backend** : Laravel 11 / PHP 8.3
- **Base de données** : PostgreSQL

---

## 1. Ireo fanitsiana efa natao tao amin'ny Code

1. **Frontend API URL dynamique** (`frontend/src/services/api.ts`) :
   * Efa mampiasa `import.meta.env.VITE_API_BASE_URL`.
   * Raha eo an-toerana (local) dia mandeha hoazy amin'ny `http://localhost:8000`.
   * Any amin'ny production kosa dia ampy ny mametraka ny variable `VITE_API_BASE_URL`.

2. **Fiarovana ny SPA Routing** (`frontend/vercel.json`) :
   * Efa voaomana ny fitsipika (rewrite) mba tsy hisy fahadisoana 404 rehefa manao *Refresh* na miditra mivantana amin'ny rohy (ohatra: `/login`, `/dashboard`).

3. **Backend PostgreSQL sy CORS** (`backend/.env.example`) :
   * Efa voalamina ny fanitsiana PostgreSQL (`DB_CONNECTION=pgsql`).
   * Efa voaomana ny `CORS_ALLOWED_ORIGINS` sy `SANCTUM_STATEFUL_DOMAINS`.

4. **Docker PHP 8.3** (`backend/Dockerfile`) :
   * Nampifanarahina amin'ny takian'ny Laravel 11 (PHP 8.3).

---

## 2. Safidy 1 : Déploiement Cloud (Vercel + Render + Neon/Supabase)

### A. Base de données PostgreSQL (amin'ny Neon.tech na Supabase na Render)
1. Mamorona tetikasa vaovao ao amin'ny [Neon.tech](https://neon.tech) na [Render](https://render.com).
2. Raiso ny rohy fifandraisana (Connection String / Internal Database URL) na ny:
   * `DB_HOST`
   * `DB_PORT` (5432)
   * `DB_DATABASE`
   * `DB_USERNAME`
   * `DB_PASSWORD`

### B. Backend Laravel (amin'ny Render.com na Railway.app)
1. Mamorona **Web Service** vaovao ao amin'ny Render mampifandray amin'ny repository Backend.
2. Famaritana ny baiko (Commands) :
   * **Build Command** :
     ```bash
     composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache
     ```
   * **Start Command** :
     ```bash
     php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
     ```
3. Ampidiro ao amin'ny **Environment Variables** :
   * `APP_NAME=SRSP`
   * `APP_ENV=production`
   * `APP_DEBUG=false`
   * `APP_KEY` *(Raiso ilay ao amin'ny .env eo an-toerana na ampiasao ny `php artisan key:generate --show`)*
   * `APP_URL=https://votre-backend.onrender.com`
   * `DB_CONNECTION=pgsql`
   * `DB_HOST=...`
   * `DB_PORT=5432`
   * `DB_DATABASE=...`
   * `DB_USERNAME=...`
   * `DB_PASSWORD=...`
   * `FRONTEND_URL=https://votre-frontend.vercel.app`
   * `CORS_ALLOWED_ORIGINS=https://votre-frontend.vercel.app`
   * `SANCTUM_STATEFUL_DOMAINS=votre-frontend.vercel.app`
   * `SESSION_SAME_SITE=none`
   * `SESSION_SECURE_COOKIE=true`
   * `SESSION_DRIVER=database`

### C. Frontend React (amin'ny Vercel.com)
1. Ampifandraiso amin'ny repository Frontend ao amin'ny [Vercel](https://vercel.com).
2. Framework Preset : **Vite**
3. Build Command : `npm run build`
4. Output Directory : `dist`
5. Ampidiro ao amin'ny **Environment Variables** :
   * `VITE_API_BASE_URL=https://votre-backend.onrender.com`

---

## 3. Safidy 2 : Déploiement amin'ny VPS tokana (Docker Compose)

Raha manana VPS (Ubuntu) ianao :
1. Adikao ny tetikasa iray manontolo ao amin'ny serivera.
2. Amboary ny `.env` ao amin'ny `backend/`.
3. Alefaso ny kaomandy :
   ```bash
   docker compose up -d --build
   ```
4. Ataovy ny migration :
   ```bash
   docker compose exec backend php artisan migrate --force
   ```
