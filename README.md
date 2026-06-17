# RENTALIA.MX

Plataforma web para alquiler de habitaciones y espacios de vivienda.

## 🏗️ Arquitectura del Proyecto

```
RENTALIA_WEB/
├── frontend/web/          # Sitio público
├── frontend/admin/        # Panel administrativo (futuro)
├── backend/              # API y servicios (futuro)
├── database/             # Esquemas y migraciones (futuro)
├── docker/               # Infraestructura Docker
├── scripts/              # Scripts de utilidad
└── public/               # Archivos estáticos compartidos
```

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Levantar entorno de desarrollo
./scripts/dev.sh

# O manualmente con Docker
docker-compose up -d web
```

### Construcción

```bash
# Empaquetar para producción
./scripts/build.sh
```

## 🛠️ Stack Tecnológico

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Arquitectura modular con componentes
- Internacionalización (ES/EN)
- Responsive design

### Infraestructura
- Docker & Docker Compose
- Nginx (proxy reverso)
- Preparado para escalabilidad

## 📁 Estructura del Frontend

```
frontend/web/
├── index.html           # Página principal
├── assets/             # Recursos estáticos
│   ├── css/           # Estilos organizados
│   ├── js/            # Scripts modulares
│   └── img/           # Imágenes
├── components/        # Componentes reutilizables
├── pages/            # Páginas específicas
└── locales/          # Archivos de traducción
```

## 🌐 Funcionalidades Actuales

- ✅ Página principal con slider
- ✅ Catálogo de alternativas de vivienda
- ✅ Sistema de experiencias
- ✅ Agendamiento de visitas
- ✅ FAQ y ayuda
- ✅ Soporte multiidioma (ES/EN)
- ✅ Diseño responsive

## 🔮 Roadmap

### Fase 1 (Actual)
- [x] Frontend estático
- [x] Componentes modulares
- [x] Internacionalización

### Fase 2 (Próximo)
- [ ] Backend API (Node.js/Python)
- [ ] Base de datos (PostgreSQL)
- [ ] Autenticación de usuarios
- [ ] Panel administrativo

### Fase 3 (Futuro)
- [ ] Sistema de pagos
- [ ] Notificaciones en tiempo real
- [ ] App móvil
- [ ] Analytics y métricas

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial de Rentalia.mx

## 📞 Contacto

- Web: [rentalia.mx](https://rentalia.mx)
- Email: contacto@rentalia.mx