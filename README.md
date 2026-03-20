# JC Condominios - SaaS Multi-Tenant

Plataforma SaaS para administración integral de condominios con arquitectura multi-tenant.

## Características

- **Multi-Tenant**: Una sola instancia sirve a múltiples condominios
- **RBAC**: Tres niveles de acceso (Super Admin, Admin, Residente)
- **API REST**: Endpoints protegidos para integraciones externas
- **Webhooks**: Sistema de webhooks configurables para n8n
- **Dashboard**: Métricas y visualización de datos financieros
- **Gestión de Residentes**: Directorio completo con estado de cuenta
- **Tickets**: Sistema de consultas y reclamos

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de datos**: SQLite (Prisma ORM)
- **Autenticación**: NextAuth.js v5
- **Despliegue**: EasyPanel (Docker)

## Requisitos

- Node.js 20+
- npm o yarn

## Instalación

```bash
# 1. Clonar repositorio
cd jc-condominios

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Generar cliente Prisma
npm run postinstall

# 5. Crear base de datos
npm run db:push

# 6. Poblar datos de prueba (opcional)
npm run db:seed

# 7. Iniciar en desarrollo
npm run dev
```

## Despliegue Docker

```bash
# Construir imagen
docker build -t jc-condominios .

# Ejecutar con Docker Compose
docker-compose up -d
```

## Credenciales de Prueba (después de seed)

| Rol           | Email                                    | Contraseña |
|---------------|------------------------------ ------------|-------------|
| Admin         | [admin@torresdevale.com] | admin123    |
| Super Admin   | [superadmin@jccondominios.com] | admin123    |
| Residente     | [carlos.mendoza@email.com] | admin123    |

## APIs

### API Pública v1 (requiere API Key)

```bash
# Headers requeridos
x-api-key: TU_API_KEY

# Endpoints
GET  /api/v1/condominios
GET  /api/v1/residentes
POST /api/v1/residentes
GET  /api/v1/recibos
POST /api/v1/recibos
GET  /api/v1/tickets
POST /api/v1/tickets
POST /api/v1/webhook/receive
```

## Webhooks Disponibles

- `condominio.creado`
- `residente.creado`
- `pago.registrado`
- `ticket.abierto`
- `ticket.actualizado`

## Roles y Permisos

| Recurso           | Super Admin | Admin | Residente |
|-------------------|-------------|-------|-----------|
| Dashboard Global  |   ✓           | -     | -         |
| Gestionar Condominios | ✓           | -     | -         |
| Dashboard Condominio | -           | ✓     | -         |
| Gestión Financiera | -           | ✓     | -         |
| Directorio Residentes | -           | ✓     | -         |
| Tickets (atención) | -           | ✓     | -         |
| Mi Perfil           | -           | ✓     | ✓         |
| Mi Estado de Cuenta | -           | ✓     | ✓         |
| Mis Tickets         | -           | ✓     | ✓         |

## Comandos Útiles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run lint         # Linting
npm run db:push      # Sincronizar schema
npm run db:seed      # Poblar datos prueba
npx prisma studio    # GUI base de datos
```

## Licencia

MIT
