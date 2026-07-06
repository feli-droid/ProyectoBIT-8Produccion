# ProyectoBIT-8Produccion# Empresa Bit-8 🚀

**Empresa Bit-8** es una aplicación web interactiva diseñada para la gestión integral del ciclo de producción. Permite administrar el inventario de materias primas con sus respectivos proveedores, configurar recetas personalizadas con dependencias de insumos u otras recetas, y ejecutar órdenes de producción manteniendo un historial completo de las operaciones realizadas.

> **Nota Académica:** Este proyecto fue desarrollado con fines académicos para demostrar la aplicación de conceptos de programación web, manipulación del DOM, Web Components, consumo de Firebase y desarrollo Front-End utilizando JavaScript.

---

## 🛠️ Características Principales y Enfoque Técnico

* **💻 Diseño UX/UI & Responsive:** Interfaz intuitiva, limpia y completamente adaptada a dispositivos móviles, tablets y ordenadores de escritorio.
* **⚡ Buenas Prácticas Aplicadas:** Código modular, separación limpia de responsabilidades (HTML/CSS/JS), manipulación eficiente del DOM y persistencia de datos en tiempo real mediante el consumo de **Firebase**.
* **🧩 Componentes Web Reutilizables:** Implementación de arquitectura modular mediante Web Components nativos para optimizar el mantenimiento y escalabilidad de la interfaz.

---

## 📂 Estructura del Proyecto

Basado en la arquitectura del repositorio, el proyecto se organiza bajo la siguiente estructura que separa la presentación, los estilos y la lógica de negocio:

```text
PROYECTOBIT-8PRODUCCION/
├── CSS/
│   ├── inventory.css
│   ├── login.css
│   ├── production.css
│   └── user management.css
├── JS/
│   ├── inventory.js
│   ├── login.js
│   ├── production.js
│   └── User management.js
├── PAGES/
│   ├── inventory.html
│   ├── login.html
│   ├── production.html
│   ├── User management.html
│   └── web-componentes/      # Componentes Web Reutilizables
│       ├── formulario-registro.js
│       ├── nav-name.js
│       └── selector-productos.js
└── README.md