# Cuentas Claras

Cuentas Claras es una aplicación web para dividir gastos de viaje de manera sencilla y sin complicaciones. Desarrollada con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Características

- **Gestión de Participantes**: Agrega y elimina participantes del viaje.
- **Registro de Gastos**: Añade gastos en Dólares (USD), USDT o Bolivianos (BOB), indicando quién pagó y entre quiénes se divide.
- **Cálculo de Saldos en USD**: Visualiza balances consolidados en dólares (USD) garantizando suma cero con absorción de centavos por el pagador.
- **Liquidación Multimoneda**: Muestra transferencias óptimas en USD con equivalentes en USDT y BOB, registrando la moneda real en la que se pagó cada liquidación.

## 🏗️ Estructura del Código

El proyecto sigue una arquitectura basada en componentes y controladores personalizados (hooks):

- `src/`
  - `controllers/`: Contiene la lógica de estado global (`useAppController.ts`) que maneja participantes, gastos y pagos.
  - `services/`: Contiene la lógica de negocio y utilidades independientes de React.
    - `calculations.ts`: Algoritmos para calcular saldos y determinar las transferencias óptimas.
    - `storage.ts`: Manejo de persistencia.
  - `views/components/`: Componentes de interfaz de usuario de React (Paneles, Formularios, Listas, etc.).
  - `App.tsx`: Componente principal que orquesta las diferentes vistas (pestañas).
  - `main.tsx`: Punto de entrada de la aplicación.
  - `index.css`: Estilos globales e integración de Tailwind.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19
- **Lenguaje**: TypeScript
- **Herramienta de Build**: Vite
- **Estilos**: Tailwind CSS 4
- **Linter**: Oxlint

## 🚦 Cómo Correr el Proyecto

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

### 1. Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (recomendado versión 18 o superior).

### 2. Instalación de Dependencias
Abre tu terminal en la carpeta del proyecto y ejecuta:
```bash
npm install
```

### 3. Servidor de Desarrollo
Para iniciar la aplicación en modo desarrollo:
```bash
npm run dev
```
Esto abrirá un servidor local (típicamente en `http://localhost:5173/`).

### 4. Construcción para Producción
Para compilar la aplicación y prepararla para producción:
```bash
npm run build
```

## 📜 Licencia
Este proyecto fue creado para la materia de Tópicos.
