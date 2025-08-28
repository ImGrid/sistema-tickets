# Sistema de Gestión de Tickets

Sistema web para la administración, seguimiento y resolución de incidencias o solicitudes de soporte en organizaciones, desarrollado con Node.js (Express) para el backend y React para el frontend.

### Video de demostración del sistema

Puedes ver una demostración en video del sistema en el siguiente enlace: [Video de demostración]([https://drive.google.com/file/d/1s40N6tDFzAuuoJNkAvwHJbCQgZldWX0w/view?usp=sharing](https://drive.google.com/file/d/1s40N6tDFzAuuoJNkAvwHJbCQgZldWX0w/view?usp=sharing))

## Características principales

- Autenticación y autorización basada en roles (admin, supervisor, agent, employee)
- Gestión completa de tickets: creación, asignación, actualización y cierre
- Sistema de comentarios y archivos adjuntos
- Panel de control diferenciado por rol con estadísticas en tiempo real
- Auditoría y registro de actividades del sistema
- Políticas de seguridad: rate limiting, sanitización, CORS, helmet
- Manejo seguro de archivos con validación de tipos y tamaños

## Arquitectura del sistema

**Backend:**

- Node.js con Express.js
- Base de datos MongoDB con Mongoose
- Autenticación JWT
- Bcrypt para hash de contraseñas
- Sistema de logs con rotación automática

**Frontend:**

- React 18 con hooks
- Context API para manejo de estado
- React Router para navegación
- Tailwind CSS para estilos
- Axios para peticiones HTTP

## Estructura del proyecto

```
sistema-tickets/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── uploads/
│   ├── logs/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Requisitos del sistema

- Node.js 16.x o superior
- MongoDB 4.4 o superior
- npm 8.x o superior

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ImGrid/sistema-tickets.git
cd sistema-tickets
```

### 2. Configurar variables de entorno

**Backend (.env):**

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env` con los siguientes valores:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tickets_db
JWT_SECRET=clave_secreta
JWT_EXPIRE=24h
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
UPLOAD_MAX_SIZE=5242880
```

**Frontend (.env):**

```bash
cd frontend
cp .env.example .env
```

Editar `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Instalar dependencias

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

## Ejecución

### Desarrollo

**1. Iniciar MongoDB**

```bash
# Linux/Mac
sudo systemctl start mongod
# o usando Docker
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

**2. Iniciar el backend**

```bash
cd backend
npm run dev
```

El backend estará disponible en `http://localhost:5000`

**3. Iniciar el frontend**

```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Producción

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## Usuarios de prueba

Una vez iniciado el sistema, registra usuarios con los siguientes datos de ejemplo:

**Administrador:**

- Regístrate normalmente y luego actualiza el rol en la base de datos:

```javascript
db.users.updateOne({ email: "admin@empresa.com" }, { $set: { role: "admin" } });
```

**Roles disponibles:**

- `employee`: Empleado (puede crear y ver sus tickets)
- `agent`: Agente de soporte (puede tomar y resolver tickets)
- `supervisor`: Supervisor (puede ver todos los tickets)
- `admin`: Administrador (acceso completo al sistema)

## API Endpoints principales

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Perfil del usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Tickets

- `GET /api/tickets` - Listar tickets (filtros según rol)
- `POST /api/tickets` - Crear nuevo ticket
- `GET /api/tickets/:id` - Obtener ticket específico
- `PUT /api/tickets/:id` - Actualizar ticket
- `PUT /api/tickets/:id/assign` - Asignar ticket

### Comentarios

- `GET /api/tickets/:ticketId/comments` - Comentarios de un ticket
- `POST /api/tickets/:ticketId/comments` - Agregar comentario
- `PUT /api/comments/:commentId` - Actualizar comentario
- `DELETE /api/comments/:commentId` - Eliminar comentario

### Archivos

- `POST /api/tickets/:ticketId/attachments` - Subir archivos
- `GET /api/tickets/:ticketId/attachments` - Listar archivos
- `GET /api/attachments/:attachmentId/download` - Descargar archivo
- `DELETE /api/attachments/:attachmentId` - Eliminar archivo

### Dashboard

- `GET /api/dashboard` - Dashboard automático según rol
- `GET /api/dashboard/quick` - Estadísticas rápidas
- `GET /api/dashboard/employee` - Dashboard de empleado
- `GET /api/dashboard/agent` - Dashboard de agente
- `GET /api/dashboard/admin` - Dashboard de administrador

### Administración (solo admin)

- `GET /api/users` - Listar usuarios
- `PUT /api/users/:id` - Actualizar usuario
- `PUT /api/users/:id/role` - Cambiar rol
- `PUT /api/users/:id/status` - Activar/desactivar
- `GET /api/audit/logs` - Logs de auditoría
