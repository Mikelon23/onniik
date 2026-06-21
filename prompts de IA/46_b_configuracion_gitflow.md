# Especificaciones de Control de Versiones: GitFlow y Conventional Commits

Este documento define la estructura de ramificación, la política de fusiones y la guía de estilo de commits acordada para el desarrollo del proyecto Onniik.

---

## 1. Estructura de Ramificación (GitFlow)

El repositorio utilizará dos ramas de larga duración y tres tipos de ramas temporales:

### Ramas de Larga Duración
*   `main`: Contiene el código de producción completamente estable. Cada merge a esta rama representa una versión desplegable (tag/release).
*   `develop`: Contiene el código de integración de desarrollo. Todas las nuevas características se fusionan aquí y sirve como base para las ramas de release.

### Ramas Temporales (Corta Duración)
*   `feature/*`: Utilizadas para desarrollar nuevas funcionalidades (ej. `feature/onboarding-wizard`). Se originan de `develop` y se fusionan de vuelta a `develop`.
*   `release/*`: Utilizadas para preparar una nueva versión estable de producción (ej. `release/v1.0.0`). Se originan de `develop` y se fusionan a `develop` y `main`.
*   `hotfix/*`: Utilizadas para resolver fallos críticos de producción. Se originan de `main` y se fusionan a `develop` y `main`.

---

## 2. Política de Commits (Conventional Commits)

Todos los commits del repositorio deben respetar el formato estándar:

```text
<tipo>(<alcance>): <descripción corta en minúsculas>
```

### Tipos Permitidos
*   `feat`: Nueva funcionalidad (ej. `feat(auth): login exclusivo con google sso`).
*   `fix`: Solución a un error (ej. `fix(modal): corregir validacion de desconexion`).
*   `docs`: Cambios en la documentación (ej. `docs(gitflow): agregar acta de gitflow`).
*   `style`: Cambios que no afectan la lógica del código (formato, espaciado).
*   `refactor`: Modificación de código que no corrige errores ni añade características.
*   `test`: Añadir o modificar pruebas unitarias/integración.
*   `chore`: Tareas de mantenimiento, actualización de dependencias de build.
