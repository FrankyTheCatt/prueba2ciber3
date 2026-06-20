# To-Do Lab — remediación DevSecOps

> ## ⚠️ ADVERTENCIA
> Aplicación educativa del ramo *Desarrollo Seguro de Software*, UCN. La rama
> `remediacion` contiene las correcciones y pruebas para los cinco hallazgos del lab.

Lista de tareas simple, sin base de datos (datos en memoria), usada para practicar
remediación, pruebas de regresión y controles SAST/DAST en CI.

## Requisitos

- Node.js 20+
- npm

## Instalación

```bash
npm install
npm run dev        # http://localhost:3000
```

## Cuentas de prueba

| Usuario | Contraseña |
|---------|------------|
| alice   | alice123   |
| bob     | bob123     |

## Controles aplicados

| # | Hallazgo | Corrección |
|---|----------|------------|
| V1 | Reflected XSS | Renderizado escapado por React y CSP estricta con nonce |
| V2 | Path Traversal | Nombre validado, ruta confinada y `realpath` contra symlinks |
| V3 | Open Redirect | Solo destinos relativos internos |
| V4 | Missing Security Headers | CSP, anti-clickjacking, nosniff, HSTS y políticas globales |
| V5 | Cookie de sesión insegura | `HttpOnly`, `SameSite=Lax` y `Secure` en producción |

También se retiró el CORS permisivo y se reemplazaron los errores verbosos por
respuestas controladas.

## Verificación con ZAP

El pipeline usa `zap-full-scan.py`; el baseline pasivo no ejercita V1–V3.

## Tests y CI

```bash
npm run dev      # terminal 1
npm test         # terminal 2 (requiere la app en :3000)
```

La suite cubre los cinco hallazgos y casos legítimos. El workflow
`.github/workflows/security.yml` ejecuta auditoría de dependencias, Semgrep,
build, tests y ZAP full-scan; cualquiera de esos controles puede bloquear el CI.
