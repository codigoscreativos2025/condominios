# Configuración de Despliegue - EasyPanel

## JC Condominios SaaS

Este documento describe la configuración necesaria para desplegar JC Condominios en EasyPanel.

---

## 1. Requisitos Previos

- Cuenta en [EasyPanel](https://easypanel.io/)
- Docker instalado localmente (para pruebas)
- Git configurado

---

## 2. Configuración del Proyecto en EasyPanel

### 2.1 Nueva Aplicación

1. Iniciar sesión en EasyPanel
2. Click en **"New App"**
3. Seleccionar **"Docker"** como tipo de aplicación
4. Conectar con GitHub y seleccionar el repositorio
5. Importar desde `Dockerfile` en la raíz del proyecto

### 2.2 Configuración General

| Campo | Valor |
|-------|-------|
| **App Name** | `jc-condominios` |
| **Build Method** | `Dockerfile` |
| **Port** | `3000` |
| **Health Check** | `/api/health` |

### 2.3 Variables de Entorno

Agregar las siguientes variables de entorno en EasyPanel:

```env
# Base de datos
DATABASE_URL=file:./data/dev.db

# NextAuth v5 - URL de producción (REEMPLAZAR con tu dominio)
NEXTAUTH_URL=https://tu-dominio.com

# NextAuth v5 - Secret generado (generar uno nuevo para producción, mínimo 32 caracteres)
AUTH_SECRET=genera-un-secret-largo-y-aleatorio-minimo-32-caracteres

# Upload
UPLOAD_DIR=/app/uploads

# App URL
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### 2.4 Volumes (Almacenamiento Persistente)

Configurar los siguientes volúmenes para persistencia de datos:

| Volume | Host Path | Container Path | Descripción |
|--------|-----------|----------------|-------------|
| **Data** | `/opt/jc-condominios/data` | `/app/data` | Base de datos SQLite |
| **Uploads** | `/opt/jc-condominios/uploads` | `/app/uploads` | Archivos subidos |

### 2.5 Comandos

**Build Command:**
```bash
npx prisma db push && npm run build
```

**Start Command:**
```bash
npm start
```

---

## 3. Configuración de Dominio y SSL

### 3.1 Dominio Personalizado

1. Ir a **Settings** → **Domains**
2. Agregar tu dominio: `tu-dominio.com`
3. EasyPanel configurará automáticamente SSL con Let's Encrypt

### 3.2 Variables para Producción

Actualizar las variables de entorno con el dominio real:

```env
NEXTAUTH_URL=https://tu-dominio.com
AUTH_SECRET=tu-secret-seguro-de-al-menos-32-caracteres
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 4. Base de Datos SQLite

### 4.1 Ubicación

La base de datos SQLite se almacena en:
```
/app/data/dev.db
```

### 4.2 Backup

Para hacer backup de la base de datos:

```bash
# Dentro del contenedor o via EasyPanel terminal
cp /app/data/dev.db /app/data/dev.db.backup-$(date +%Y%m%d)
```

### 4.3 Restaurar Backup

```bash
# Detener la aplicación primero
# Luego restaurar
cp /app/data/dev.db.backup-YYYYMMDD /app/data/dev.db
```

### 4.4 Migrar a PostgreSQL (Producción Alta Carga)

Para entornos con alto tráfico, migrar a PostgreSQL:

1. **Cambiar en `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Nueva DATABASE_URL:**
```env
DATABASE_URL=postgresql://user:password@host:5432/jc_condominios
```

3. **Configurar volumen adicional para PostgreSQL o usar base de datos gestionada**

---

## 5. Almacenamiento de Archivos

### 5.1 Configuración Local (Default)

Los archivos subidos se guardan en:
```
/app/uploads/
```

### 5.2 Migrar a S3/Cloudflare R2 (Recomendado para Producción)

Para mayor scalability, usar almacenamiento en la nube:

1. **Crear bucket en S3 o R2**
2. **Instalar dependencias adicionales:**
```bash
npm install @aws-sdk/client-s3
```

3. **Crear nuevo endpoint de upload** (ver sección 6)
4. **Configurar variables:**
```env
S3_BUCKET=tu-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=tu-access-key
S3_SECRET_KEY=tu-secret-key
# O para Cloudflare R2:
R2_ACCOUNT_ID=tu-account-id
R2_ACCESS_KEY=tu-access-key
R2_SECRET_KEY=tu-secret-key
```

---

## 6. Webhooks y n8n

### 6.1 Configuración de Webhooks

Los webhooks se configuran desde el panel del Admin de cada condominio. Para que funcionen correctamente:

1. Asegurar que la aplicación sea accesible desde internet (no detrás de firewall)
2. Los webhooks disparan POST requests a URLs configuradas

### 6.2 Eventos Disponibles

| Evento | Descripción |
|--------|-------------|
| `condominio.creado` | Nuevo condominio registrado |
| `residente.creado` | Nuevo residente agregado |
| `pago.registrado` | Pago recibido |
| `ticket.abierto` | Nuevo ticket abierto |
| `ticket.actualizado` | Ticket actualizado |

### 6.3 Payload de Ejemplo

```json
{
  "evento": "pago.registrado",
  "timestamp": "2024-10-15T14:30:00.000Z",
  "data": {
    "pago": {
      "id": "clx123...",
      "monto": 2500,
      "concepto": "Mantenimiento mensual"
    },
    "residente": {
      "id": "res123...",
      "nombre": "Carlos Mendoza",
      "torre": "Torre A",
      "unidad": "302"
    }
  }
}
```

### 6.4 Configuración n8n

En n8n, crear un webhook HTTP Request node:

1. Crear nuevo workflow en n8n
2. Agregar nodo **"Webhook"**
3. Copiar la URL del webhook
4. En JC Condominios Admin → Configuración → Webhooks, agregar la URL
5. Seleccionar eventos a escuchar

---

## 7. Reinstalación desde Cero

Si necesitas reinstalar la aplicación:

### 7.1 Pasos

1. **Eliminar la aplicación en EasyPanel**
2. **Eliminar datos persistentes (si desea empezar limpio):**
   ```bash
   rm -rf /opt/jc-condominios/data/*
   rm -rf /opt/jc-condominios/uploads/*
   ```
3. **Crear nueva aplicación siguiendo los pasos de la sección 2**
4. **Ejecutar seed para datos iniciales:**
   ```bash
   npm run db:seed
   ```

---

## 8. Monitoreo y Logs

### 8.1 Ver Logs

En EasyPanel, ir a **Logs** para ver:
- Logs de aplicación
- Logs de acceso
- Logs de errores

### 8.2 Health Check

Endpoint: `https://tu-dominio.com/api/health`

### 8.3 Métricas

EasyPanel provee métricas básicas:
- CPU usage
- Memory usage
- Request count
- Response times

---

## 9. Actualizaciones

### 9.1 Actualizar Código

1. Hacer push a GitHub
2. EasyPanel detectará el cambio y mostrará "Redeploy"
3. Click en "Redeploy" para aplicar cambios

### 9.2 Actualizar Base de Datos (migrations)

Si hay cambios en el schema:

```bash
npx prisma migrate deploy
```

---

## 10. Troubleshooting

### Problema: "Database locked"
- Causa: La base de datos está siendo accedida por múltiples procesos
- Solución: Reiniciar la aplicación

### Problema: "Connection refused" en uploads
- Causa: El volumen de uploads no está configurado
- Solución: Verificar volúmenes en EasyPanel

### Problema: Webhooks no llegan a n8n
- Causa: La URL del webhook es interna o no es accesible
- Solución: Verificar que la aplicación sea accesible desde internet

### Problema: "Invalid signature" en NextAuth
- Causa: AUTH_SECRET no coincide o falta
- Solución: Verificar que AUTH_SECRET esté configurado (mínimo 32 caracteres)

### Problema: Prisma engine error (libssl.so.1.1 not found)
- Causa: Image uses Alpine which needs libssl1.1
- Solución: Use `node:20-slim` base image (Debian) for better OpenSSL compatibility

---

## 11. Checklist de Producción

- [ ] Configurar `AUTH_SECRET` con un valor seguro de al menos 32 caracteres
- [ ] Configurar dominio con SSL
- [ ] Configurar volúmenes de datos
- [ ] Configurar backups automáticos
- [ ] Revisar rate limiting
- [ ] Configurar logging
- [ ] Probar webhooks
- [ ] Verificar que residentes no puedan ver datos de otros
- [ ] Documentar API keys de usuarios

---

## 12. Contacto y Soporte

Para soporte técnico o reportes de bugs:
- GitHub Issues: https://github.com/codigoscreativos2025/condominios/issues
