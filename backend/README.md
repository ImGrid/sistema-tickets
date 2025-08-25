# Sistema de Gestión de Tickets

Proyecto completo de gestión de tickets desarrollado con **Node.js (Express)** para el backend y **React** para el frontend. Permite la administración, seguimiento y resolución de incidencias o solicitudes de soporte en una organización, con enfoque en seguridad y buenas prácticas.

---

## Características principales

- **Autenticación y autorización por roles** (admin, agente, empleado)
- **Gestión de tickets**: creación, asignación, actualización, cierre y eliminación
- **Comentarios y archivos adjuntos** en tickets
- **Panel de control (dashboard)** con estadísticas en tiempo real
- **Auditoría y registro de actividades**
- **Políticas de seguridad avanzadas**: Helmet, CORS, rate limiting, sanitización, logs, control de errores
- **Pruebas de seguridad y casos de uso documentados**
- **Frontend moderno y responsivo** con React

---

## Estructura del proyecto

```
sistema-tickets/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── .env.example
│
├── docs/
│   ├── seguridad.md
│   ├── pruebas-seguridad.md
│   └── arquitectura.md
│
└── README.md
```

---

## Instalación y ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/sistema-tickets.git
cd sistema-tickets
```

### 2. Configura variables de entorno

Copia los archivos `.env.example` a `.env` en `backend/` y `frontend/` y completa los valores necesarios (puerto, URI de MongoDB, claves JWT, etc).

### 3. Instala dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Ejecuta el backend

```bash
cd backend
npm run dev
```

### 5. Ejecuta el frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en [http://localhost:5173](http://localhost:5173) y el backend en [http://localhost:5000/api](http://localhost:5000/api).

---

## Seguridad

- **Helmet**: protege con cabeceras HTTP seguras.
- **CORS**: restringe orígenes permitidos.
- **Rate limiting**: limita peticiones por IP.
- **Sanitización**: limpia datos de entrada para evitar inyecciones.
- **Auditoría**: registra acciones sensibles.
- **Validación**: todos los datos son validados y sanitizados tanto en frontend como backend.
- **Control de errores**: manejo centralizado y seguro de errores.

---

## Pruebas de seguridad

- Pruebas manuales y automáticas de inyección, XSS, acceso no autorizado y DoS.

---

## Endpoints principales (API)

- `POST /api/auth/login` — Login de usuario
- `POST /api/auth/register` — Registro de usuario
- `GET /api/tickets` — Listado de tickets (con filtros)
- `POST /api/tickets` — Crear ticket
- `PUT /api/tickets/:id` — Actualizar ticket
- `DELETE /api/tickets/:id` — Eliminar ticket (admin)
- `GET /api/dashboard/admin` — Dashboard de administrador
- ...y más

---
