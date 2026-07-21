# Instalación local

## Backend

```powershell
git clone https://github.com/ODelgadoDev/tengoclima-backend.git
cd tengoclima-backend

python -m venv venv
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
Copy-Item .env.example .env

python manage.py migrate
python manage.py createsuperuser
python manage.py check
python manage.py runserver
```

Servicios:

```text
API:     http://127.0.0.1:8000/api/
Swagger: http://127.0.0.1:8000/api/docs/
Admin:   http://127.0.0.1:8000/admin/
```

## Frontend

```powershell
git clone https://github.com/ODelgadoDev/tengoclima-frontend.git
cd tengoclima-frontend\frontend

Copy-Item .env.example .env
pnpm install
pnpm dev
```

Aplicación:

```text
http://localhost:5173
```

## Validación

Backend:

```powershell
python manage.py check
python manage.py showmigrations
```

Frontend:

```powershell
pnpm lint
pnpm build
```

## Problemas comunes

### No se encuentra `package.json`

Ejecuta pnpm desde la carpeta `frontend`.

### 401

Inicia sesión otra vez. El access token puede haber expirado.

### Imágenes o comprobantes no se envían

No fuerces manualmente `Content-Type` al enviar `FormData`.

### Falta una columna en SQLite

Verifica y aplica las migraciones:

```powershell
python manage.py makemigrations
python manage.py migrate
```
