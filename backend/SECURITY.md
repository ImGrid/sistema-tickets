# SECURITY.md

## Buenas Prácticas de Seguridad

Este proyecto sigue las siguientes buenas prácticas para proteger la información y los usuarios:

### 1. Autenticación y Autorización
- Uso de JWT para autenticación segura.
- Control de acceso por roles (admin, agente, empleado).
- Expiración y revocación de tokens.

### 2. Protección de Datos
- Encriptación de contraseñas con bcrypt.
- No se almacenan contraseñas en texto plano.
- Variables sensibles gestionadas mediante archivos `.env`.

### 3. Seguridad en las Peticiones
- Uso de Helmet para proteger cabeceras HTTP.
- CORS configurado para restringir orígenes permitidos.
- Rate limiting para prevenir ataques de denegación de servicio (DoS).
- Sanitización y validación de todos los datos de entrada.

### 4. Manejo de Errores y Logs
- Manejo centralizado de errores sin exponer información sensible.
- Registro de actividades y auditoría de acciones críticas.
- Monitoreo de intentos sospechosos y alertas en logs.

### 5. Seguridad en el Frontend
- Validación y sanitización de datos antes de enviarlos al backend.
- No exponer información sensible en el código del cliente.
- Uso de HTTPS recomendado en producción.

### 6. Actualizaciones y Dependencias
- Dependencias actualizadas regularmente.
- Uso de herramientas como `npm audit` para detectar vulnerabilidades.

---

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en este proyecto, por favor sigue estos pasos:

1. **No abras un issue público.**
2. Envía un correo detallado a: [tu-email@ejemplo.com]
3. Incluye:
   - Descripción de la vulnerabilidad.
   - Pasos para reproducirla.
   - Impacto potencial.
   - Sugerencias (opcional).

Nos comprometemos a investigar y resolver los problemas de seguridad lo antes posible. ¡Gracias por ayudar a mantener este proyecto seguro!