# Guía de Despliegue - JC Condominios en Easypanel

## Pasos para Recrear la Aplicación desde Cero

Esta guía se usa cuando Easypanel tiene caché de builds antiguos o cuando necesitas reinstalar.

---

## 1. Eliminar la Aplicación Actual

1. Ir a la aplicación en Easypanel
2. **Detener** la aplicación
3. Ir a **Settings** → **Delete**
4. Confirmar eliminación

---

## 2. Limpiar Datos Antiguos (Opcional)

Si deseas empezar con base de datos limpia:

```bash
rm -rf /opt/jc-condominios/data/*
rm -rf /opt/jc-condominios/uploads/*
```

---

## 3. Crear Nueva Aplicación

1. En Easypanel, clic en **"New App"**
2. Seleccionar **"Docker"**
3. Conectar con **GitHub** y seleccionar repositorio `condominios`
4. **Build Method**: `Dockerfile`
5. **Port**: `3000`
6. Clic en **Create**

---

## 4. Variables de Entorno (REQUIRED)

Agregar estas variables en **Settings → Environment**:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `AUTH_SECRET` | `Mji5sOppRB9iLPCIcOE-BB2StaTErcGo` | Secret para NextAuth (min 32 caracteres) |
| `DATABASE_URL` | `file:./data/dev.db` | Ruta a la base de datos SQLite |
| `NEXTAUTH_URL` | `https://pagpivot-condominios.xfozpf.easypanel.host` | URL de la aplicación |
| `UPLOAD_DIR` | `/app/uploads` | Directorio para archivos subidos |

---

## 5. Volúmenes (REQUIRED)

Configurar estos volúmenes en **Settings → Volumes**:

| Volume Name | Host Path | Container Path | Descripción |
|-------------|-----------|---------------|-------------|
| `data` | `/opt/jc-condominios/data` | `/app/data` | Base de datos SQLite |
| `uploads` | `/opt/jc-condominios/uploads` | `/app/uploads` | Archivos subidos |

---

## 6. Deploy

1. Clic en **Deploy**
2. Esperar a que termine el build (~2-5 minutos)
3. Revisar **Logs** para verificar

---

## 7. Verificación de Logs

**Logs esperados al iniciar:**
```
Starting seed...
Created condominio: Torres de Valle
Created categories
Created admin user: admin@torresdevale.com / admin123
Created super admin: superadmin@jccondominios.com / admin123
Created residents
Created financial records
Seed completed successfully!
```

**Logs de Next.js:**
```
▲ Next.js 14.2.15
  - Local:        http://localhost:80
  - Network:      http://0.0.0.0:80
 ✓ Starting...
 ✓ Ready in Xms
```

---

## 8. Credenciales de Login

Después de deploy exitoso:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@torresdevale.com` | `admin123` |
| Super Admin | `superadmin@jccondominios.com` | `admin123` |
| Residente | `carlos.mendoza@email.com` | `admin123` |

---

## 9. URLs de Acceso

- **Aplicación:** `https://pagpivot-condominios.xfozpf.easypanel.host`
- **Login:** `https://pagpivot-condominios.xfozpf.easypanel.host/login`

---

## 10. Troubleshooting

### Error: "Schema not found" en build
- Verificar que el Dockerfile esté en la raíz del repositorio
- Verificar que `prisma/schema.prisma` exista

### Error: "Credentials invalid" al login
1. Verificar que `NEXTAUTH_URL` esté configurado correctamente
2. Verificar que `AUTH_SECRET` esté configurado
3. Revisar logs para ver si el seed se ejecutó
4. Verificar que la base de datos existe en el volumen

### Error: "Permission denied" en uploads
- Verificar que los volúmenes estén configurados
- Verificar permisos del host path

---

## 11. Estructura del Proyecto

```
jc-condominios/
├── Dockerfile              # Dockerfile de producción
├── prisma/
│   ├── schema.prisma      # Schema de la base de datos
│   ├── seed.ts            # Datos iniciales
│   └── dev.db             # Base de datos SQLite (generada)
├── app/                   # Código de Next.js
├── lib/                   # Librerías (auth, prisma)
├── public/                # Archivos estáticos
└── uploads/               # Archivos subidos (en volumen)
```

---

## 12. Configuración de Dominio (Opcional)

Para agregar dominio personalizado:
1. Settings → Domains
2. Agregar dominio (ej: `condominios.midominio.com`)
3. Easypanel configurará SSL automáticamente

---

## 13. Backup de Base de Datos

```bash
# Copiar archivo de base de datos
cp /opt/jc-condominios/data/dev.db /opt/jc-condominios/data/dev.db.backup-$(date +%Y%m%d)
```

---

Última actualización: 20 Mar 2026
