# Empresa Bit-8 🚀

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
```

### 📂 Arquitectura del Uso de Carpetas

* **📁 CSS/:** Contiene los archivos de hojas de estilo independientes encargados del diseño visual, presentación y diseño responsivo de cada vista.
* **📁 JS/:** Aloja los scripts de JavaScript con la lógica de negocio, manejo de eventos del DOM y la integración con los servicios de Firebase.
* **📁 PAGES/:** Contiene los documentos HTML que estructuran el esqueleto de cada sección de la aplicación.
* **📁 web-componentes/:** Subcarpeta especializada donde se definen los elementos web personalizados (Web Components) que se reutilizan en toda la plataforma.

---

## 🖥️ Funcionalidad de las Páginas

### 🔐 1. Login (Acceso y Registro)

* **Ingreso de Usuarios:** Pantalla de autenticación segura conectada a Firebase para validar credenciales y permitir el acceso al sistema.
* **Registro de Usuarios:** Formulario integrado para dar de alta nuevos accesos a la plataforma de forma rápida.

### 👥 2. Gestión de Usuarios

* **Control Total (CRUD):** Panel administrativo que permite el manejo completo de los usuarios del sistema.
* **Operaciones:** Facilidad para registrar nuevos usuarios, editar sus datos actuales o eliminarlos del sistema según los permisos requeridos.

### 📦 3. Inventario y Creación de Recetas

* **Control de Stock y Proveedores:** Muestra detalladamente cuánta materia prima se tiene en existencia y quién es el proveedor asociado a cada insumo.
* **Estructuración Avanzada:** Permite formular una nueva receta indicando con precisión qué materia prima necesita o, de manera avanzada, qué otra receta preexistente requiere como base.

**Ejemplo de Estructura de una Receta:**

Para entender cómo el sistema procesa los ingredientes, se plantea el siguiente caso práctico al dar de alta un producto:

| Producto / Receta | Insumo Requerido (Tipo) | Cantidad Necesaria |
|---|---|---|
| Galleta | Maíz (Materia Prima) | 50 unidades |
| Galleta | Agua (Materia Prima) | 50 unidades |

### ⚙️ 4. Producción

* **Procesamiento de Recetas:** Módulo encargado de ejecutar y producir las recetas previamente configuradas. Al fabricar (por ejemplo, una Galleta), el sistema descontará automáticamente 50 unidades de Maíz y 50 unidades de Agua de las existencias reales del inventario.
* **Historial de Producción:** Registro cronológico y detallado de todas las producciones que se han realizado en la empresa para auditoría y control de rendimiento.

---

## 📖 Manual de Uso Rápido

1. **Autenticación:** Inicie sesión a través de la página de `login.html` o cree una cuenta nueva si no dispone de una.
2. **Abastecimiento:** Diríjase a `inventory.html` para registrar las materias primas disponibles y sus proveedores.
3. **Estructure el Producto:** En la misma sección de inventario, cree una receta combinando materias primas o anidando otras recetas (ej. Configurar la receta de la Galleta).
4. **Ejecute la Fabricación:** Vaya a `production.html`, seleccione la receta deseada y confirme la producción para descontar el stock.
5. **Auditoría:** Revise el historial en la sección de producción para validar las actividades previas y el consumo generado.