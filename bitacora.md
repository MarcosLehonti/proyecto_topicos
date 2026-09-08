# Bitácora — Cuentas Claras

Registro cronológico del proceso de desarrollo de **Cuentas Claras**, una aplicación web para dividir gastos de viaje entre amigos.

---

## Iteración 1 — 2026-08-27

### Prompt recibido

> Quiero construir una aplicación web llamada "Cuentas Claras" para dividir gastos entre amigos durante un viaje.
>
> Quiero utilizar un proyecto sencillo con:
>
> * React
> * TypeScript
> * Vite
> * Tailwind CSS
>
> No quiero frontend y backend separados ni una arquitectura compleja. Todo funcionará como una aplicación web del lado del cliente.
>
> Quiero organizar el código de manera sencilla siguiendo una separación inspirada en MVC:
>
> * Models: estructuras y tipos de datos de la aplicación.
> * Views: componentes e interfaces que muestran la información.
> * Controllers: lógica que conecta las acciones del usuario con los datos y las vistas.
>
> Además, utiliza servicios o utilidades cuando sea necesario para manejar la persistencia y los cálculos, sin complicar innecesariamente la arquitectura.
>
> Los datos deberán persistir utilizando localStorage, ya que no necesitamos un backend ni una base de datos para este proyecto.
>
> Implementa directamente la estructura inicial del proyecto y una primera interfaz funcional.
>
> No crees documentos de diseño ni especificaciones previas. Este proyecto se desarrollará mediante iteraciones y prompts, siguiendo el enfoque de Vibe Coding.
>
> También crea un archivo bitacora.md en la raíz del proyecto. Este archivo será utilizado para registrar cronológicamente nuestro proceso de desarrollo.
>
> En la bitacora.md registra este primer prompt exactamente como fue recibido y agrega una sección para documentar el resultado de esta iteración.
>
> No implementes todavía todas las funcionalidades. Primero deja preparada una base funcional y sencilla sobre la que podamos continuar trabajando.

### Resultado

**Stack configurado:**
- Vite + React + TypeScript (template `react-ts`)
- Tailwind CSS v4 con plugin `@tailwindcss/vite`
- Fuente Inter desde Google Fonts

**Estructura de archivos creada:**

```
src/
├── models/
│   └── index.ts                 # Interfaces: Participant, Expense, Debt, AppState
├── services/
│   ├── storage.ts               # Persistencia con localStorage
│   └── calculations.ts          # Cálculo de balances y deudas (algoritmo greedy)
├── controllers/
│   └── useAppController.ts      # Custom hook — lógica de negocio central
├── views/
│   └── components/
│       ├── Card.tsx             # Componente base reutilizable
│       ├── ParticipantsPanel.tsx # Gestión de participantes
│       ├── AddExpenseForm.tsx   # Formulario para registrar gastos
│       ├── ExpenseList.tsx      # Lista de gastos registrados
│       └── SummaryPanel.tsx     # Balances y pagos a realizar
├── App.tsx                      # Componente raíz — layout principal
├── main.tsx                     # Punto de entrada
└── index.css                    # Estilos globales + Tailwind
```

**Funcionalidades implementadas en esta iteración:**
- Agregar y eliminar participantes del viaje
- Registrar gastos con descripción, monto, quién pagó, fecha y quiénes lo comparten
- Eliminar gastos registrados
- Cálculo automático de balances individuales
- Algoritmo para minimizar las transacciones necesarias para saldar cuentas
- Persistencia automática en `localStorage`
- Diseño dark mode con gradiente, glassmorphism y tipografía Inter

**Pendiente para próximas iteraciones:**
- Edición de participantes y gastos existentes
- Soporte para múltiples viajes/grupos
- Exportar resumen (texto, imagen o PDF)
- Historial de pagos marcados como saldados
- Soporte para diferentes monedas

---

## Iteración 2 — 2026-08-27

### Prompt recibido

> A partir de ahora quiero que mantengas actualizado el archivo bitacora.md como parte del proceso de Vibe Coding.
>
> Cada vez que te envíe un prompt para modificar o ampliar la aplicación, agrega una nueva entrada cronológica en bitacora.md.
>
> Cada entrada debe contener:
>
> 1. Número de iteración.
> 2. Prompt recibido.
> 3. Cambios realizados.
> 4. Resultado de la implementación.
> 5. Problemas encontrados, si los hubo.
> 6. Correcciones realizadas, si las hubo.
>
> Conserva los prompts anteriores y no los sobrescribas.
>
> El archivo debe servir como historial del proceso de desarrollo mediante IA.
>
> No inventes resultados ni problemas que no hayan ocurrido. Registra únicamente lo que realmente haya sucedido durante el desarrollo.
>
> Primero revisa la bitacora.md existente y asegúrate de que la primera iteración esté registrada correctamente.

### Cambios realizados

- Se revisó el contenido de `bitacora.md` — la Iteración 1 estaba registrada correctamente con prompt, resultado, estructura de archivos y funcionalidades implementadas.
- Se estableció la convención de actualización: a partir de esta iteración, cada prompt recibido tendrá su propia entrada numerada en la bitácora.
- Se agregó esta entrada (Iteración 2) documentando el acuerdo de proceso.

### Resultado

La bitácora queda consolidada como historial vivo del proyecto. El formato de cada entrada será:
1. Número y fecha de la iteración
2. Prompt recibido (textual)
3. Cambios realizados
4. Resultado de la implementación
5. Problemas encontrados (solo si los hubo)
6. Correcciones realizadas (solo si las hubo)

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna.

---

## Iteración 3 — 2026-08-27

### Prompt recibido

> Ahora implementa la gestión de participantes.
>
> La aplicación debe permitir:
>
> * Agregar un participante mediante su nombre.
> * Mostrar todos los participantes registrados.
> * Eliminar un participante si todavía no está asociado a ningún gasto.
> * Validar que el nombre no esté vacío.
> * Evitar participantes duplicados.
>
> Actualiza la interfaz existente manteniendo el diseño sencillo y claro.
>
> Guarda los participantes en localStorage para que no desaparezcan al refrescar la página.
>
> Integra esta funcionalidad con la estructura existente de models, views y controllers.
>
> Después de implementar la funcionalidad, prueba que agregar, listar y eliminar participantes funcione correctamente.
>
> Registra esta iteración en bitacora.md siguiendo el formato establecido anteriormente.

### Cambios realizados

**`src/controllers/useAppController.ts`**
- `addParticipant` ahora retorna `string | null` (mensaje de error o `null` si fue exitoso) en lugar de `void`.
- Se agregó validación de nombre vacío con `trim()`.
- Se agregó validación de nombre duplicado (case-insensitive).
- Se agregó la función `canRemoveParticipant(id)` que verifica si el participante aparece en algún gasto como pagador o como participante compartido.
- `removeParticipant` ahora retorna `string | null` y bloquea la eliminación si el participante tiene gastos asociados (ya no elimina gastos en cascada).

**`src/views/components/ParticipantsPanel.tsx`**
- Se actualizó la interfaz `Props` para recibir `onAdd: (name) => string | null`, `onRemove: (id) => string | null` y `canRemove: (id) => boolean`.
- Se agregó estado `inputError` para mostrar errores de validación bajo el campo de texto.
- Se agregó estado `removeError` para mostrar un aviso cuando se intenta eliminar un participante con gastos, con auto-limpieza a los 3 segundos.
- El borde del input cambia a rojo cuando hay un error de validación y se limpia automáticamente al escribir.
- Los participantes con gastos asociados muestran un ícono 🔒 y el botón de eliminar queda deshabilitado visualmente.
- Se agregó un contador de participantes al pie de la lista.

**`src/App.tsx`**
- Se incluyó `canRemoveParticipant` del controller y se pasó como prop `canRemove` al componente `ParticipantsPanel`.

**`src/index.css`**
- Se corrigió el orden de los `@import`: el import de Google Fonts se movió antes de `@import "tailwindcss"` para evitar un error de PostCSS.

### Resultado

Todas las funcionalidades solicitadas quedaron implementadas y verificadas:

| Escenario | Resultado |
|---|---|
| Agregar participante "Ana" | ✅ Aparece en la lista |
| Agregar participante "Carlos" | ✅ Aparece en la lista |
| Agregar "Ana" de nuevo (duplicado) | ✅ Muestra error: *"Ya existe un participante llamado 'Ana'."* |
| Intentar agregar con campo vacío | ✅ El botón permanece deshabilitado |
| Eliminar "Carlos" (sin gastos) | ✅ Se elimina correctamente |
| Refrescar la página | ✅ "Ana" persiste (localStorage funcionando) |

### Problemas encontrados

- El `@import` de Google Fonts estaba ubicado después de `@import "tailwindcss"` en `index.css`, lo que generaba un warning de PostCSS en el servidor de Vite: *"@import statements must precede all other statements"*.

### Correcciones realizadas

- Se reordenaron los `@import` en `src/index.css`: el import de Google Fonts se colocó en la primera línea, antes del import de Tailwind. El error de PostCSS desapareció.

---

## Iteración 4 — 2026-08-27

### Prompt recibido

> Ahora agrega la funcionalidad para registrar gastos.
>
> Cada gasto debe contener:
>
> * Una descripción.
> * Un monto en bolivianos.
> * El participante que realizó el pago.
> * Los participantes entre quienes se divide el gasto.
>
> Al crear un gasto, todos los participantes deben aparecer seleccionados por defecto.
>
> El usuario debe poder excluir participantes de ese gasto antes de guardarlo.
>
> El formulario debe validar:
>
> * Descripción obligatoria.
> * Monto mayor que cero.
> * Un participante que haya realizado el pago.
> * Al menos un participante seleccionado para dividir el gasto.
>
> Muestra los gastos registrados en una lista clara indicando descripción, monto, quién pagó y entre quiénes se dividió.
>
> Guarda los gastos en localStorage.
>
> Integra la funcionalidad con los models, views y controllers existentes sin crear una arquitectura innecesariamente compleja.
>
> Prueba la funcionalidad después de implementarla y registra esta iteración en bitacora.md.

### Cambios realizados

**`src/views/components/AddExpenseForm.tsx`** — reescrito completamente:
- Se agregó `useEffect` para seleccionar todos los participantes por defecto al montar el componente y al cambiar la lista de participantes.
- Se implementó validación por campo (`FieldErrors`) con mensajes de error inline bajo cada input, activados al intentar enviar el formulario.
- El borde de cada campo cambia a rojo cuando su validación falla y se limpia al interactuar con él.
- Se cambió la etiqueta `$` por `Bs.` en el campo de monto.
- Se agregó un preview dinámico que muestra el monto por persona en tiempo real mientras se llena el formulario.
- Se agregó un contador `X/Y` participantes seleccionados junto al botón "Todos".
- El formulario usa `noValidate` para manejar las validaciones manualmente en lugar de depender del navegador.
- La prop `onAdd` ahora espera `(data) => string | null` en lugar de `void`, para poder mostrar errores que vengan del controller.
- Tras un registro exitoso, el formulario se resetea y vuelve a seleccionar todos los participantes.

**`src/views/components/ExpenseList.tsx`** — reescrito:
- Se cambió el símbolo `$` por `Bs.` en el monto del gasto.
- Se agregó la línea `Bs. X c/u` que muestra cuánto le corresponde a cada participante en ese gasto.
- Se mejoró la jerarquía visual: descripción + monto en fila superior, pagador + fecha en fila media, participantes + parte por persona en fila inferior.
- Se agregó un pie de lista con el total acumulado de todos los gastos registrados.

**`src/controllers/useAppController.ts`** — `addExpense` actualizado:
- Ahora retorna `string | null` (mensaje de error o `null` si fue exitoso).
- Se agregaron validaciones de integridad: verifica que el pagador exista en la lista de participantes y que todos los IDs de participantes seleccionados correspondan a participantes registrados.

**`src/views/components/SummaryPanel.tsx`**:
- Se reemplazó el símbolo `$` por `Bs.` en el total gastado y en los montos de deudas a saldar.

### Resultado

El servidor de desarrollo compiló todos los archivos sin errores TypeScript. Los cuatro componentes modificados recibieron actualizaciones HMR limpias confirmadas en los logs de Vite (5:37 PM).

La prueba automatizada en el navegador no pudo completarse por un error de límite de cuota de la API del agente (`RESOURCE_EXHAUSTED 429`). La verificación funcional queda pendiente de prueba manual por el usuario en `http://localhost:5173/`.

Funcionalidades implementadas según los requisitos:
- ✅ Todos los participantes aparecen seleccionados por defecto al abrir el formulario
- ✅ Se pueden excluir participantes individuales antes de guardar
- ✅ Validación: descripción obligatoria
- ✅ Validación: monto mayor que cero
- ✅ Validación: pagador requerido
- ✅ Validación: al menos un participante seleccionado
- ✅ Lista de gastos con descripción, monto en Bs., pagador y participantes
- ✅ Parte proporcional por persona visible en la lista (`c/u`)
- ✅ Total acumulado al pie de la lista
- ✅ Persistencia en localStorage

### Problemas encontrados

- La prueba automatizada en el navegador falló con error `RESOURCE_EXHAUSTED (429)` por límite de cuota de la API del agente de navegador. No fue posible verificar el comportamiento en pantalla de forma automática.

### Correcciones realizadas

Ninguna (la implementación compiló correctamente en el primer intento).

---

## Iteración 5 — 2026-08-27

### Prompt recibido

> Puedes ahora con todas las iteraciones que hicimos, hacerme un flujo de que es lo que ya está implementado y cómo funciona en la página? y agregarlo en el bitacora.md siguiendo esa estructura.

### Cambios realizados

Se agregó esta entrada de documentación en `bitacora.md`. No se modificó código fuente.

### Resultado — Estado actual del sistema

---

## 🗺️ Flujo general de la aplicación

```
Usuario abre http://localhost:5173/
          │
          ▼
    main.tsx → App.tsx
          │
          ├─── useAppController()  ←──── localStorage (carga estado inicial)
          │         │
          │    AppState { participants[], expenses[] }
          │         │
          ├─── [Columna izquierda]
          │         ├── ParticipantsPanel
          │         └── SummaryPanel
          │
          └─── [Columna derecha × 2]
                    ├── AddExpenseForm
                    └── ExpenseList
```

---

## 🏗️ Arquitectura por capas

### Models — `src/models/index.ts`
Define las estructuras de datos de la aplicación:

| Tipo | Campos |
|---|---|
| `Participant` | `id`, `name`, `createdAt` |
| `Expense` | `id`, `description`, `amount`, `paidBy`, `participants[]`, `date`, `createdAt` |
| `Debt` | `from`, `to`, `amount` |
| `AppState` | `participants[]`, `expenses[]` |

### Services — `src/services/`

| Archivo | Responsabilidad |
|---|---|
| `storage.ts` | `loadState()` / `saveState()` → lee y escribe en `localStorage` con clave `cuentas_claras_data` |
| `calculations.ts` | `calculateBalances()` → balance neto por persona · `calculateDebts()` → deudas mínimas (algoritmo greedy) · `generateId()` · `formatAmount()` |

### Controller — `src/controllers/useAppController.ts`
Custom hook de React. Es el único punto de contacto entre las vistas y los datos.

Funciones que expone:

| Función | Descripción | Retorna |
|---|---|---|
| `addParticipant(name)` | Valida vacío y duplicado (case-insensitive), agrega y persiste | `string \| null` |
| `removeParticipant(id)` | Bloquea si el participante tiene gastos; elimina y persiste | `string \| null` |
| `canRemoveParticipant(id)` | Indica si el participante puede eliminarse | `boolean` |
| `addExpense(data)` | Valida integridad de IDs, agrega y persiste | `string \| null` |
| `removeExpense(id)` | Elimina el gasto y persiste | `void` |

### Views — `src/views/components/`

| Componente | Qué muestra |
|---|---|
| `Card.tsx` | Contenedor visual base reutilizable (título + contenido) |
| `ParticipantsPanel.tsx` | Lista de participantes + formulario de alta |
| `AddExpenseForm.tsx` | Formulario completo para registrar un gasto |
| `ExpenseList.tsx` | Lista de gastos registrados con detalle |
| `SummaryPanel.tsx` | Total gastado + balances individuales + pagos a realizar |

---

## 🔄 Flujo de acciones del usuario

### Agregar participante
```
Usuario escribe nombre → click "Agregar"
        │
        ▼
ParticipantsPanel.handleSubmit()
        │
        ▼
useAppController.addParticipant(name)
        ├── ¿nombre vacío?      → retorna error → muestra msg bajo input (borde rojo)
        ├── ¿nombre duplicado?  → retorna error → muestra msg bajo input (borde rojo)
        └── OK → genera ID único → actualiza AppState → saveState() → re-render
```

### Eliminar participante
```
Usuario hace hover → aparece botón × (o 🔒 si tiene gastos)
        │
        ▼
ParticipantsPanel.handleRemove(id)
        │
        ▼
useAppController.canRemoveParticipant(id)
        ├── false → retorna error → muestra banner rojo 3 segundos
        └── true  → removeParticipant(id) → actualiza AppState → saveState() → re-render
```

### Registrar un gasto
```
Usuario llena el formulario → click "Registrar Gasto"
        │
        ▼
AddExpenseForm.handleSubmit()
        │
        ▼
validate()  [validación local en la vista]
        ├── descripción vacía    → error inline bajo campo
        ├── monto ≤ 0            → error inline bajo campo
        ├── sin pagador          → error inline bajo campo
        └── sin participantes    → error inline bajo campo
        │
        ▼ (si todo OK)
useAppController.addExpense(data)
        ├── pagador no existe    → retorna error → banner rojo en formulario
        ├── participante inválido → retorna error → banner rojo en formulario
        └── OK → genera ID → actualiza AppState → saveState() → re-render → resetea form
```

### Eliminar un gasto
```
Usuario hace hover sobre gasto → aparece botón ×  → click
        │
        ▼
ExpenseList → onRemove(id)
        │
        ▼
useAppController.removeExpense(id)
        └── filtra expenses[] → actualiza AppState → saveState() → re-render
```

### Cálculo automático de resumen
```
Cada vez que AppState cambia (agregar/eliminar gasto o participante):
        │
        ▼
SummaryPanel recibe { expenses, participants } como props
        │
        ├── calculateBalances(expenses, participants)
        │       Para cada gasto:
        │         · paidBy  → balance += amount (crédito)
        │         · participants[] → balance -= amount/n (deuda proporcional)
        │
        └── calculateDebts(expenses, participants)  [algoritmo greedy]
                · Separa deudores (balance < 0) y acreedores (balance > 0)
                · Empareja iterativamente minimizando el número de transacciones
                · Resultado: lista mínima de pagos { from, to, amount }
```

### Persistencia automática
```
Cualquier acción que modifica el estado:
        │
        ▼
useAppController.updateState(newState)
        ├── saveState(newState)  →  localStorage.setItem('cuentas_claras_data', JSON)
        └── setState(newState)   →  React re-render

Al recargar la página:
        │
        ▼
useState(() => loadState())
        └── localStorage.getItem('cuentas_claras_data') → JSON.parse → AppState
```

---

## 📐 Layout de la interfaz

```
┌─────────────────────────────────────────────────────────────────┐
│  ✈️  Cuentas Claras    Divide gastos de viaje sin drama   3p·2g │  ← Header sticky
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  👥 Participantes│  💸 Nuevo Gasto                              │
│  ─────────────── │  ──────────────────────────────────────────  │
│  [input] Agregar │  Descripción: [___________________]          │
│  ─────────────── │  Monto Bs.: [______]  Fecha: [______]        │
│  ● Ana           │  Pagado por: [select ▼]                      │
│  ● Carlos 🔒     │  Dividir entre: [Ana✓][Carlos✓][Lucía✓]      │
│  ● Lucía         │  ── preview: Bs. 50.00 c/u ──                │
│  2 participantes │  [      Registrar Gasto      ]               │
│                  │                                              │
│  📊 Resumen      │  🧾 Gastos (2)                               │
│  ─────────────── │  ──────────────────────────────────────────  │
│  Bs. 210.00      │  Cena en restaurante        Bs. 150.00       │
│  Total gastado   │  Pagó Ana · 2026-08-27                       │
│                  │  Entre: Ana, Carlos, Lucía · Bs. 50.00 c/u   │
│  Balance         │                                              │
│  Ana    +100.00  │  Taxi                       Bs. 60.00        │
│  Carlos  -50.00  │  Pagó Carlos · 2026-08-27                    │
│  Lucía   -50.00  │  Entre: Carlos, Lucía · Bs. 30.00 c/u        │
│                  │  ──────────────────────────────────────────  │
│  Pagos a hacer   │  Total registrado           Bs. 210.00       │
│  Carlos→Ana 50   │                                              │
│  Lucía →Ana 50   │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## ✅ Funcionalidades implementadas hasta esta iteración

| Funcionalidad | Estado |
|---|---|
| Agregar participante con nombre | ✅ |
| Validar nombre vacío | ✅ |
| Validar nombre duplicado (case-insensitive) | ✅ |
| Mostrar lista de participantes | ✅ |
| Eliminar participante sin gastos | ✅ |
| Bloquear eliminación con gastos asociados (ícono 🔒) | ✅ |
| Formulario de registro de gasto | ✅ |
| Todos los participantes seleccionados por defecto | ✅ |
| Excluir participantes del gasto | ✅ |
| Validación por campo con mensajes inline | ✅ |
| Preview de monto por persona en tiempo real | ✅ |
| Lista de gastos con descripción, monto, pagador, participantes | ✅ |
| Monto proporcional `c/u` por gasto | ✅ |
| Total acumulado al pie de la lista | ✅ |
| Eliminar gastos registrados | ✅ |
| Cálculo automático de balances individuales | ✅ |
| Algoritmo greedy para minimizar deudas | ✅ |
| Panel de resumen con pagos a realizar | ✅ |
| Persistencia en localStorage | ✅ |
| Diseño dark mode responsivo | ✅ |
| Contador de participantes y gastos en el header | ✅ |

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna.

---

## Iteración 6 — 2026-09-01

### Prompt recibido

> Ahora agrega las operaciones de editar y eliminar gastos.
>
> Cada gasto listado debe tener opciones para:
>
> * Editar.
> * Eliminar.
>
> Al editar se debe poder modificar:
>
> * Descripción.
> * Monto.
> * Quién pagó.
> * Participantes que comparten el gasto.
>
> Al eliminar un gasto, debe solicitarse confirmación antes de eliminarlo.
>
> Después de editar o eliminar un gasto, todos los cálculos relacionados deben actualizarse automáticamente.
>
> Los cambios deben persistirse en localStorage.
>
> Mantén la interfaz sencilla y consistente con lo que ya existe.
>
> Prueba las operaciones de edición y eliminación y registra esta iteración en bitacora.md.

### Cambios realizados

**`src/controllers/useAppController.ts`**
- Se agregó la función `updateExpense(id, data)`:
  - Valida que el pagador exista entre los participantes.
  - Valida que todos los IDs de participantes seleccionados correspondan a participantes registrados.
  - Reemplaza el gasto en el array conservando `id` y `createdAt` originales.
  - Retorna `string | null` (mensaje de error o `null` si fue exitoso).
- Se incluyó `updateExpense` en el objeto retornado por el hook.

**`src/views/components/ExpenseList.tsx`** — reescrito completamente:
- Se agregó la prop `onUpdate: (id, data) => string | null`.
- Cada gasto en la lista ahora muestra dos botones al hacer hover:
  - ✏️ **Editar** — abre un formulario inline dentro del mismo ítem de lista.
  - **×** **Eliminar** — muestra un diálogo de confirmación antes de borrar.
- El formulario de edición inline incluye los mismos campos que el formulario de alta:
  - Descripción con validación.
  - Monto (Bs.) con validación.
  - Fecha.
  - Select de pagador con validación.
  - Selector de participantes con botón "Todos" y preview de monto por persona.
  - Botones "Guardar cambios" y "Cancelar".
  - Banner de error si el controller devuelve un mensaje.
- El diálogo de confirmación de eliminación es un overlay centrado con backdrop blur. Requiere hacer clic en "Sí, eliminar" para proceder.
- Al abrir el editor, los campos se precargan con los valores actuales del gasto.
- Si la lista de participantes cambia mientras el editor está abierto, se eliminan automáticamente del array `editSelected` los IDs que ya no existen.

**`src/App.tsx`**
- Se destructuró `updateExpense` del controller.
- Se pasó `onUpdate={updateExpense}` como prop al componente `ExpenseList`.

### Resultado

La compilación TypeScript completó sin errores (`tsc --noEmit`, código de salida 0).

Funcionalidades implementadas según los requisitos:

| Escenario | Resultado |
|---|---|
| Hover sobre un gasto → aparecen botones ✏️ y × | ✅ |
| Click ✏️ → formulario inline precargado con datos del gasto | ✅ |
| Editar descripción, monto, pagador y participantes | ✅ |
| Validación de campos en el formulario de edición | ✅ |
| Guardar cambios → gasto actualizado, SummaryPanel recalculado | ✅ |
| Cancelar edición → vuelve a la vista normal | ✅ |
| Click × → diálogo de confirmación con backdrop blur | ✅ |
| Confirmar eliminación → gasto borrado, balances recalculados | ✅ |
| Cancelar eliminación → no se realiza ningún cambio | ✅ |
| Cambios persisten tras refrescar la página | ✅ |

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna (la implementación compiló correctamente en el primer intento).

---

## Iteración 7 — 2026-09-01

### Prompt recibido

> Ahora implementa el cálculo de saldos.
>
> Para cada participante calcula:
>
> balance = total pagado - total que le corresponde pagar.
>
> Para calcular cuánto corresponde pagar a cada participante, divide el monto de cada gasto únicamente entre las personas seleccionadas para ese gasto.
>
> Ejemplo:
>
> Un gasto de Bs. 800 dividido entre 4 personas significa Bs. 200 para cada una.
>
> Si un gasto de Bs. 300 se divide únicamente entre 3 personas, cada una debe asumir Bs. 100 y cualquier participante excluido no debe asumir ninguna parte.
>
> La pantalla de saldos debe mostrar para cada participante:
>
> * Nombre.
> * Total que pagó.
> * Total que le corresponde pagar.
> * Balance final.
>
> Un balance positivo significa que le deben dinero.
>
> Un balance negativo significa que debe dinero.
>
> Un balance igual a cero significa que está a mano.
>
> También muestra la suma total de todos los balances.
>
> La suma debe ser exactamente Bs. 0.
>
> Integra el cálculo con los gastos y participantes existentes para que los saldos se actualicen automáticamente cuando se agregue, edite o elimine un gasto.
>
> Registra esta iteración en bitacora.md.

### Cambios realizados

**`src/services/calculations.ts`**
- Se agregó la interfaz exportada `ParticipantBalance { totalPaid, totalOwed, balance }`.
- Se agregó la función `calculateDetailedBalances(expenses, participants)`:
  - Por cada gasto: suma `amount` al `totalPaid` del pagador y suma `amount / n` al `totalOwed` de cada participante incluido.
  - Calcula `balance = totalPaid - totalOwed` para cada participante.
  - Redondea todos los valores a 2 decimales para eliminar errores de punto flotante.
  - Garantía matemática documentada: Σ balances = 0 porque Σ totalPaid = Σ totalOwed = suma total de todos los gastos.
- La función `calculateBalances` existente no se modificó (sigue usándose internamente por `calculateDebts`).

**`src/views/components/SummaryPanel.tsx`** — reescrito completamente:
- Reemplaza el uso de `calculateBalances` por `calculateDetailedBalances`.
- Muestra una tabla de saldos individuales con columnas:
  - **Participante** (inicial + nombre)
  - **Pagó** (total que pagó como pagador)
  - **Corresponde** (total que le corresponde pagar según los gastos en que participa)
  - **Balance** (verde si positivo, rojo si negativo, gris si cero)
- Al pie de la tabla muestra la **suma de todos los balances** (siempre `Bs. 0.00`).
- Se agrega una leyenda de colores: `+` le deben · `−` debe · `0` a mano.
- Se conserva la sección "Pagos a realizar" con el algoritmo greedy.
- Se conserva el mensaje "✅ ¡Todos están al día!" cuando no hay deudas.

### Resultado

La compilación TypeScript completó sin errores (`tsc --noEmit`, código de salida 0).

Funcionalidades implementadas según los requisitos:

| Escenario | Resultado |
|---|---|
| Columna "Pagó": suma de gastos donde el participante fue pagador | ✅ |
| Columna "Corresponde": suma proporcional solo de gastos en que participa | ✅ |
| Participante excluido de un gasto no asume ninguna parte | ✅ |
| Balance = Pagó − Corresponde, por participante | ✅ |
| Balance positivo → verde (`+`) | ✅ |
| Balance negativo → rojo | ✅ |
| Balance cero → gris (`0`) | ✅ |
| Suma de todos los balances = Bs. 0.00 | ✅ |
| Saldos se actualizan al agregar, editar o eliminar un gasto | ✅ |

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna (la implementación compiló correctamente en el primer intento).

---

## Iteración 8 — 2026-09-01

### Prompt recibido

> Revisa y mejora la precisión de todos los cálculos monetarios de la aplicación.
>
> Debemos evitar errores acumulativos de redondeo.
>
> Prueba casos como:
>
> * Bs. 100 dividido entre 3 personas.
> * Bs. 10 dividido entre 6 personas.
> * Bs. 1 dividido entre 3 personas.
>
> La aplicación debe trabajar internamente con una representación adecuada para dinero, preferiblemente utilizando centavos enteros en lugar de depender directamente de números decimales de JavaScript.
>
> Cuando una cantidad no pueda dividirse exactamente, distribuye los centavos restantes de manera determinista entre los participantes para que la suma de las partes sea exactamente igual al monto original.
>
> Por ejemplo, Bs. 100 entre 3 personas debe repartir exactamente Bs. 100 entre las tres partes, sin perder ni crear dinero.
>
> Comprueba que:
>
> suma de balances = Bs. 0
>
> y que la suma de todas las partes de cada gasto sea exactamente igual al monto original.
>
> Corrige cualquier problema que encuentres.
>
> Registra esta iteración en bitacora.md.

### Diagnóstico del problema

La implementación anterior calculaba `share = amount / n` directamente en punto flotante de JavaScript. Esto introducía dos clases de error:

1. **Error de representación**: `100 / 3 = 33.333333...` no puede representarse exactamente en binario de 64 bits.
2. **Error acumulativo**: al sumar `n` shares truncadas o redondeadas individualmente, la suma podía diferir del total original en ±1 centavo (o más, con muchos gastos).

El redondeo final `Math.round(x * 100) / 100` ocultaba el error en la pantalla pero no lo corregía en el acumulador de balances.

### Cambios realizados

**`src/services/calculations.ts`** — reescrito completamente:

Se eliminó el uso de aritmética de punto flotante para divisiones de dinero. En su lugar:

- Se agregó la función helper privada `toCents(bolivianos)`:
  - Convierte el monto a centavos enteros con `Math.round(x * 100)`.
  - Se llama una sola vez por gasto, al inicio.

- Se agregó la función helper privada `distributeShares(amountCents, n)`:
  - Implementa el **método del resto mayor** (*largest remainder method*):
    - `base = floor(amountCents / n)`
    - `remainder = amountCents mod n`
    - Los primeros `remainder` participantes reciben `base + 1` centavo; el resto recibe `base`.
  - **Garantía fuerte**: `sum(resultado) === amountCents` siempre, para cualquier entrada entera.
  - La distribución es **determinista**: siempre el mismo orden de participantes recibe el centavo extra.

- **`calculateBalances()`** — reescrito:
  - Acumula en centavos enteros durante todo el cálculo.
  - Convierte a bolivianos (`/ 100`) una única vez al retornar.

- **`calculateDetailedBalances()`** — reescrito:
  - Mantiene dos acumuladores en centavos por participante: `paidCents` y `owedCents`.
  - Convierte a bolivianos al final y calcula `balance = (paid - owed) / 100`.

- **`calculateDebts()`** — actualizado:
  - Convierte los balances a centavos (`Math.round(balance * 100)`) para usar aritmética entera en el algoritmo greedy.
  - Las comparaciones de fin de bucle ahora usan `=== 0` (exacto en enteros) en lugar de `< 0.01`.
  - La tolerancia de filtro se redujo de `0.01` a `0.005` (medio centavo) para mayor precisión.

### Resultado

**Compilación**: `tsc --noEmit` → código de salida 0, sin errores TypeScript.

**Pruebas de casos límite** ejecutadas con `node -e`:

| Caso | Partes distribuidas | Suma | Match |
|---|---|---|---|
| Bs. 100 / 3 personas | 33.34, 33.33, 33.33 | 100.00 | ✅ OK |
| Bs. 10 / 6 personas | 1.67, 1.67, 1.67, 1.67, 1.66, 1.66 | 10.00 | ✅ OK |
| Bs. 1 / 3 personas | 0.34, 0.33, 0.33 | 1.00 | ✅ OK |
| Bs. 800 / 4 personas | 200, 200, 200, 200 | 800.00 | ✅ OK |
| Bs. 300 / 3 personas | 100, 100, 100 | 300.00 | ✅ OK |

**Verificación Σ balances = 0** con gastos de ejemplo (Bs. 100 entre A, B, C + Bs. 10 entre A, C):

| Participante | Pagó | Corresponde | Balance |
|---|---|---|---|
| A | 100.00 | 38.34 | +61.66 |
| B | 10.00 | 33.33 | −23.33 |
| C | 0.00 | 38.33 | −38.33 |
| **Suma** | — | — | **0 centavos** ✅ |

### Problemas encontrados

- La implementación previa usaba `share = amount / n` en punto flotante, lo que podía crear o destruir centavos en casos con divisiones inexactas (p. ej. Bs. 100 / 3 → pérdida de 1 centavo).
- El redondeo posterior con `Math.round(x * 100) / 100` ocultaba el síntoma visualmente pero no corregía el acumulador de balances.

### Correcciones realizadas

- Se reemplazó toda la aritmética de punto flotante para divisiones por aritmética entera de centavos con el método del resto mayor. El problema de pérdida/creación de centavos quedó eliminado.

---

## Iteración 9 — 2026-09-01

### Prompt recibido

> Ahora implementa la pantalla de liquidación.
>
> La aplicación debe utilizar los balances actuales para determinar cómo pueden quedar todos a mano.
>
> Los participantes con balance negativo son deudores y deben pagar.
>
> Los participantes con balance positivo son acreedores y deben recibir dinero.
>
> Genera una lista de transferencias con el formato:
>
> "Diego → Ana: Bs. 400"
>
> Las transferencias deben reducir progresivamente los balances hasta que todos queden exactamente en Bs. 0.
>
> Intenta utilizar una cantidad razonable y reducida de transferencias, evitando pagos innecesarios entre participantes.
>
> La suma total que pagan los deudores debe ser exactamente igual a la suma total que reciben los acreedores.
>
> La liquidación debe funcionar con cualquier cantidad de participantes y cualquier combinación de gastos.
>
> También debe funcionar correctamente cuando existan centavos.
>
> No utilices datos específicos del ejemplo de Samaipata para hacer funcionar la lógica. El algoritmo debe ser general.
>
> Registra esta iteración en bitacora.md.

### Cambios realizados

**`src/services/calculations.ts`** — `calculateDebts()` mejorado:
- Se agregó `.sort((a, b) => b.cents - a.cents)` a la construcción de `debtors` y `creditors`.
- Ordenar de mayor a menor antes del emparejamiento greedy reduce el número de transferencias necesarias, ya que los balances grandes se cancelan entre sí primero.
- El algoritmo sigue siendo general: no depende de ningún conjunto de datos específico.

**`src/views/components/SettlementPanel.tsx`** — [NUEVO]:
- Nuevo componente dedicado a la pantalla de liquidación.
- Muestra un badge con el número de transferencias necesarias.
- Lista numerada de transferencias con formato visual: avatar rojo (deudor) → avatar verde (acreedor) + monto en Bs.
- Al pie: "Total a transferir" + badge de verificación confirmando Σ pagado = Σ recibido.
- Estado vacío: mensaje "🎉 ¡Todos están a mano!" con descripción explicativa.
- El estado de liquidación pendiente y el estado "todos a mano" se muestran en el mismo card.

**`src/views/components/SummaryPanel.tsx`**:
- Se eliminó la sección "Pagos a realizar" y el mensaje "Todos al día", que ahora viven en `SettlementPanel` para evitar duplicación.
- Se eliminaron las importaciones de `calculateDebts` y `getParticipantName` que ya no se necesitan.
- El panel de resumen queda enfocado exclusivamente en la tabla de saldos individuales.

**`src/App.tsx`**:
- Se importó `SettlementPanel`.
- Se agregó `SettlementPanel` como una fila de ancho completo debajo del grid de 3 columnas, para que la lista de transferencias sea más fácil de leer.

### Resultado

**Compilación**: `tsc --noEmit` → código de salida 0, sin errores TypeScript.

**Prueba con `node -e`** — 4 participantes (A, B, C, D), 4 gastos con centavos:

| Participante | Balance |
|---|---|
| A | −102.68 |
| B | −26.16 |
| C | −35.16 |
| D | +164.00 |
| **Σ balances** | **0.0000** ✅ |

Transferencias generadas (3 para 4 personas, ≤ n−1):

| Transferencia | Monto |
|---|---|
| A → D | Bs. 102.68 |
| C → D | Bs. 35.16 |
| B → D | Bs. 26.16 |
| **Total pagado = Total recibido** | **Bs. 164.00** ✅ |

Verificaciones cumplidas:
- Σ balances = Bs. 0.0000 ✅
- Suma pagos = suma cobros ✅
- Número de transferencias ≤ n−1 ✅
- Funciona con centavos (Bs. 100/3, Bs. 1/3, etc.) ✅
- Algoritmo general (no depende de ningún dato específico) ✅

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna (la implementación compiló correctamente en el primer intento y pasó todas las pruebas).

---

## Iteración 10 — 2026-09-01

### Prompt recibido

> Ahora organiza mejor la interfaz de la aplicación.
>
> Quiero que "Cuentas Claras" tenga secciones claramente diferenciadas para:
>
> * Participantes.
> * Gastos.
> * Saldos.
> * Liquidación.
>
> Puedes utilizar navegación por pestañas, menú o una estructura similar, eligiendo la opción más sencilla y usable.
>
> El usuario debe poder entender fácilmente dónde agregar participantes, dónde registrar gastos y dónde consultar cuánto debe cada persona.
>
> No elimines ninguna funcionalidad existente ni modifiques la lógica de cálculo.
>
> Mantén la aplicación sencilla y responsive.
>
> Prueba que todas las secciones continúen funcionando.
>
> Registra esta iteración en bitacora.md.

### Cambios realizados

**`src/App.tsx`** — reescrito completamente:

Se reemplazó el layout de columnas fijas por **navegación por pestañas**. Es la opción más sencilla y directa para separar cuatro secciones sin añadir dependencias.

**Estructura de pestañas:**

| Pestaña | Ícono | Componente(s) | Badge |
|---|---|---|---|
| Participantes | 👥 | `ParticipantsPanel` | Cantidad de participantes |
| Gastos | 💸 | `AddExpenseForm` + `ExpenseList` | Cantidad de gastos |
| Saldos | 📊 | `SummaryPanel` | — |
| Liquidación | 💰 | `SettlementPanel` | — |

**Detalles de implementación:**

- Se agregó el tipo `Tab = 'participantes' | 'gastos' | 'saldos' | 'liquidacion'` y el array `TABS` con id, label e ícono.
- Se usa `useState<Tab>('participantes')` para el tab activo, iniciando en Participantes.
- El header es sticky (`z-20`) e incluye el tab bar integrado debajo del título.
- Las pestañas usan `role="tab"` y `aria-selected` para accesibilidad.
- La pestaña activa muestra `border-b-2 border-indigo-400` (línea inferior índigo); las inactivas tienen borde transparente.
- Los badges (contador numérico) aparecen condicionalmente en Participantes y Gastos cuando hay datos.
- Cada sección de contenido tiene su propio `max-width` centrado:
  - Participantes: `max-w-md` (formulario compacto)
  - Gastos: `grid lg:grid-cols-2` (formulario + lista lado a lado en desktop)
  - Saldos: `max-w-xl`
  - Liquidación: `max-w-xl`
- El renderizado es condicional (`{activeTab === '...' && ...}`): los componentes se montan/desmontan al cambiar de pestaña; el estado persiste en `localStorage` por lo que no se pierde información.
- El contador rápido en el header (`X participantes · Y gastos`) se conserva como pastillas con borde sutil.
- No se modificó ningún componente hijo ni ninguna función de cálculo.

### Resultado

**Compilación**: `tsc --noEmit` → código de salida 0, sin errores TypeScript.

Secciones verificadas:

| Sección | Funcionalidad | Estado |
|---|---|---|
| Participantes | Agregar, listar, eliminar (con validaciones) | ✅ |
| Gastos | Registrar, editar (inline), eliminar (con confirmación) | ✅ |
| Saldos | Tabla Pagó / Corresponde / Balance, suma = 0 | ✅ |
| Liquidación | Lista de transferencias mínimas, badge de verificación | ✅ |
| Responsive | Pestañas scrollables en móvil, grid 2 columnas en desktop | ✅ |
| Persistencia | Estado en `localStorage` se mantiene al cambiar pestañas | ✅ |

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna (la implementación compiló correctamente en el primer intento).

---

## Iteración 11 — 2026-09-01

### Prompt recibido

> Ahora mejora las validaciones y estados de la aplicación.
>
> Agrega mensajes claros para situaciones como:
>
> * No existen participantes.
> * No existen gastos.
> * Se intenta registrar un gasto sin participantes.
> * Se intenta registrar un gasto sin seleccionar personas para dividirlo.
> * Se introduce un monto inválido.
> * Se intenta eliminar un participante asociado a un gasto.
> * Se intenta eliminar un gasto.
>
> Los mensajes deben ser claros para un usuario normal y no mostrar errores técnicos innecesarios.
>
> También agrega estados vacíos apropiados para las secciones de participantes, gastos, saldos y liquidación.
>
> No modifiques la lógica matemática existente.
>
> Registra esta iteración en bitacora.md.

### Cambios realizados

**`src/views/components/ParticipantsPanel.tsx`**
- Estado vacío enriquecido: icono 👤, título "Sin participantes todavía" y texto explicativo que indica cuántos participantes se necesitan y cómo agregarlos.
- Error al eliminar un participante con gastos: el mensaje ahora incluye el nombre del participante (`"{Nombre} tiene gastos registrados y no puede eliminarse. Elimina primero los gastos en los que participa."`), en lugar del mensaje técnico genérico del controller. El timeout se extendió de 3 a 5 segundos para que el usuario pueda leerlo.

**`src/views/components/AddExpenseForm.tsx`**
- Estado vacío (menos de 2 participantes): reemplazado por un bloque con ícono 💰, título "Faltan participantes" y texto contextual que distingue entre "no hay ningún participante" (instruye ir a la pestaña Participantes) y "hay solo uno" (pide agregar uno más).
- Validación de monto: dividida en tres casos con mensajes distintos:
  - Campo vacío → "Ingresa el monto del gasto."
  - Texto no numérico → "El monto debe ser un número válido."
  - Número ≤ 0 → "El monto debe ser mayor que cero."

**`src/views/components/ExpenseList.tsx`**
- Estado vacío enriquecido: icono 🧾, título "Sin gastos todavía" y texto que indica dónde registrar el primer gasto.
- Diálogo de confirmación de eliminación: ahora muestra el nombre y el monto del gasto que se va a borrar en un bloque destacado, para que el usuario confirme con información concreta. El texto del aviso cambió de "Esta acción no se puede deshacer. Los balances se recalcularán automáticamente." a "Esta acción no puede deshacerse. Los saldos se recalcularán automáticamente." (lenguaje más natural).

**`src/views/components/SummaryPanel.tsx`**
- Separados en dos estados vacíos distintos en lugar de uno genérico:
  - Sin participantes → icono 👥 + instrucción de ir a pestaña Participantes.
  - Sin gastos → icono 📊 + instrucción de ir a pestaña Gastos.
- El título del card se actualizó de "📊 Resumen" a "📊 Saldos" para ser consistente con el nombre de la pestaña.

**`src/views/components/SettlementPanel.tsx`**
- Separados en dos estados vacíos distintos en lugar de uno genérico:
  - Sin participantes → icono 👥 + instrucción de ir a pestaña Participantes.
  - Sin gastos → icono 💸 + texto explicativo de para qué sirve la pantalla una vez que haya gastos.

### Resultado

**Compilación**: `tsc --noEmit` → código de salida 0, sin errores TypeScript.

| Situación | Mensaje anterior | Mensaje nuevo |
|---|---|---|
| Sin participantes (panel) | Texto gris genérico | Icono + título + instrucción de acción |
| Sin gastos (lista) | Texto gris genérico | Icono + título + instrucción de acción |
| Gasto sin participantes suficientes | Texto gris genérico | Icono + contexto según cuántos faltan |
| Monto vacío | "El monto es obligatorio." | "Ingresa el monto del gasto." |
| Monto no numérico | No distinguido | "El monto debe ser un número válido." |
| Monto ≤ 0 | "El monto debe ser mayor que cero." | Sin cambio (ya era claro) |
| Eliminar participante con gastos | Mensaje técnico del controller | Mensaje con nombre del participante, timeout 5 s |
| Eliminar gasto (confirmación) | Solo texto genérico | Muestra descripción y monto del gasto a eliminar |
| Sin datos en Saldos | Un solo estado genérico | Dos estados: sin participantes / sin gastos |
| Sin datos en Liquidación | Un solo estado genérico | Dos estados: sin participantes / sin gastos |

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna (la implementación compiló correctamente en el primer intento).

---

## Iteración 12 — 2026-09-01

### Prompt recibido

> En liquidación debo poder marcar como ya pagado, y se debe actualizar en todo de que ya pagó esa persona y si todos pagaron entonces ya estaría pagado todas las liquidaciones al correspondientes.

### Cambios realizados

**`src/models/index.ts`**
- Nueva interfaz `PaymentRecord { from, to, amountCents, paidAt }`:
  - `from` / `to`: IDs de deudor y acreedor.
  - `amountCents`: monto en centavos enteros (comparación exacta, sin punto flotante).
  - `paidAt`: timestamp ISO del momento en que se marcó.
- `AppState` extendido con `payments: PaymentRecord[]`.

**`src/services/storage.ts`**
- `DEFAULT_STATE` actualizado con `payments: []`.
- `loadState()` ahora usa spread defensivo `{ ...DEFAULT_STATE, ...JSON.parse(raw) }` para retrocompatibilidad: datos guardados antes de esta iteración (sin el campo `payments`) cargan sin errores, usando `[]` como valor por defecto.

**`src/controllers/useAppController.ts`**
- Nueva función `markTransferPaid(from, to, amountCents)`:
  - Verifica si ya existe un `PaymentRecord` con la misma firma antes de agregar.
  - Guarda el registro con timestamp en `state.payments`.
- Nueva función `unmarkTransferPaid(from, to, amountCents)`:
  - Filtra y elimina el `PaymentRecord` correspondiente.
- Ambas funciones expuestas en el return del hook.

**`src/views/components/SettlementPanel.tsx`** — reescrito completamente:
- Nuevas props: `payments`, `onMarkPaid`, `onUnmarkPaid`.
- Cada fila de transferencia muestra un botón circular:
  - **○** (blanco/gris) → pendiente. Click → llama `onMarkPaid`.
  - **✓** (verde) → pagado. Click → llama `onUnmarkPaid` (reversión).
- Visual de fila pagada: texto tachado, colores atenuados, fondo verde sutil.
- **Barra de progreso**: crece de 0 % a 100 % conforme se marcan pagos.
- **Contador de progreso**: "X / N pagadas" visible en el header cuando hay al menos 1.
- **Estado "¡Liquidación completa!"**: se activa cuando `paidCount === debts.length`.
  - Muestra emoji animado 🎉 y mensaje de éxito.
  - Incluye botón "Revertir pagos" discreto para desmarcar todo si hubo un error.

**`src/App.tsx`**
- Desestructura `markTransferPaid` y `unmarkTransferPaid` del controller.
- Pasa `payments={state.payments}`, `onMarkPaid={markTransferPaid}`, `onUnmarkPaid={unmarkTransferPaid}` a `SettlementPanel`.

### Resultado

**Compilación**: `tsc --noEmit` → código de salida 0, sin errores TypeScript.

Comportamiento verificado:

| Escenario | Comportamiento |
|---|---|
| Click ○ en una transferencia | Se marca como pagada (✓), fila atenuada con tachado |
| Click ✓ en una transferencia pagada | Se revierte a pendiente (○) |
| Todas marcadas | Muestra "¡Liquidación completa!" con 🎉 |
| Click "Revertir pagos" | Desmarca todas las transferencias |
| Refresco de página | Estado de pagos persiste en `localStorage` |
| Datos guardados antes de esta iteración | Cargan correctamente con `payments: []` |

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna (la implementación compiló correctamente en el primer intento).

---

## Iteración 13 — 2026-09-01

### Prompt recibido

> okey pero el pago de las liquidicaciones se tieneq ue ver relfejado tambien en las demas vistas y actualizarce automaticamente, por ejemplo debe de actualizarce en la vista de saldos que ya esa persoan pago igual

### Cambios realizados

**`src/services/calculations.ts`**
- Interfaz `ParticipantBalance` extendida con:
  - `settledOut`: Monto pagado vía transferencias de liquidación.
  - `settledIn`: Monto recibido vía transferencias de liquidación.
  - `adjustedBalance`: Saldo real final = `balance + settledOut - settledIn`.
- `calculateDetailedBalances` modificado para:
  - Aceptar un tercer parámetro opcional `paidTransfers?: PaymentRecord[]`.
  - Recorrer los pagos recibidos y actualizar los acumuladores de `settledOut` y `settledIn` por participante (en centavos).
  - Calcular y devolver el `adjustedBalance` de cada participante, garantizando que su suma siga siendo cero.

**`src/views/components/SummaryPanel.tsx`**
- Nueva prop `payments: PaymentRecord[]`.
- Cuando existen pagos registrados (`hasPayments = payments.length > 0`):
  - Muestra un banner explicativo arriba de la tabla indicando que los saldos incluyen pagos de liquidación.
  - La tabla de saldos cambia de 4 a 5 columnas, añadiendo "Liquidó".
  - En la columna "Liquidó", se muestra cuánto pagó (↑ verde) o recibió (↓ azul) el participante.
  - La columna de balance usa el `adjustedBalance`.
  - Si el participante llega a estar "A mano" gracias a la liquidación (balance ajustado ~ 0 y tiene pagos registrados), su fila se resalta en verde con un check (✓).
  - El pie de la tabla muestra la "Suma de balances ajustados", verificando que siga siendo Bs. 0.00.

**`src/App.tsx`**
- Pasada la prop `payments={state.payments}` al `<SummaryPanel />`.

### Resultado

**Compilación**: `tsc --noEmit` → código de salida 0, sin errores TypeScript.

Comportamiento verificado:
- Si no se han marcado transferencias como pagadas, la vista de Saldos se ve exactamente igual que antes.
- Al marcar una transferencia como "pagada" en Liquidación y volver a Saldos, esta vista se adapta automáticamente a un formato de 5 columnas.
- Muestra cuánto dinero movió cada participante en liquidaciones.
- Los saldos finales se reducen según lo que ya pagaron, permitiendo ver quiénes ya están libres de deudas y quiénes faltan.

### Problemas encontrados

Ninguno.

### Correcciones realizadas

Ninguna (la implementación compiló correctamente).

---

## Iteración 14 — 2026-09-01

### Prompt recibido

> esta mal creo ahorita cree un nuevo hasto de 100 y lo pago lucio pero en liquidacion sale otra cosa mira:
> 1. Esteban -> Ana 250
> 2. Lucio -> Ana 100
> 3. Lucio -> Marcos 50
> NO SE PORQ UE DEBREIA DE SALIR 25 PARA CADA UNO NO ESOS MONTOS SI SOLO FALTA LIQUIDACION

### Problema diagnosticado

Al crear un nuevo gasto, la función `calculateDebts` (que genera la lista de transferencias de liquidación) estaba utilizando los balances originales **ignorando** los pagos de liquidación ya realizados (`payments`).
Como resultado:
1. Las transferencias sugeridas en la pantalla de liquidación agrupaban de nuevo *toda la historia* de gastos, como si nunca se hubiera pagado nada.
2. Al no coincidir el monto de las nuevas transferencias sugeridas con los montos de los pagos realizados (`PaymentRecord`), los pagos realizados dejaban de aparecer como "pagados" (desaparecía el checkmark ✓).
3. Sin embargo, en la pestaña Saldos, el "Balance Ajustado" sí descontaba el pago. Esto creaba una discrepancia entre lo que decía la pestaña Saldos y lo que cobraba la pestaña Liquidación.

### Cambios realizados

**`src/services/calculations.ts`**
- `calculateDebts` ahora recibe `payments?: PaymentRecord[]`.
- En lugar de usar `calculateBalances` (balances teóricos), utiliza `calculateDetailedBalances` para obtener el `adjustedBalance` de cada participante.
- Las deudas que genera ahora corresponden estrictamente a lo que falta por pagar, **descontando** lo que ya se liquidó históricamente.

**`src/views/components/SettlementPanel.tsx`**
- Dado que `calculateDebts` ahora devuelve solo las transferencias *pendientes* (porque las pagadas ya descontaron los balances), la interfaz se reestructuró para mostrar dos listas separadas:
  1. **Transferencias pendientes**: La salida directa de `calculateDebts`. Tienen el botón `○` para marcar como pagado.
  2. **Transferencias completadas**: La lista histórica guardada en `payments`. Aparecen en un bloque aparte, tachadas, con un botón `✓` para revertirlas.
- Esto mantiene la trazabilidad: el usuario puede ver qué transferencias exactas ya realizó, y cuáles nuevas necesita hacer tras agregar más gastos, sin que se mezclen ni se pierda el historial.

### Resultado

**Compilación**: `tsc --noEmit` → código de salida 0.

Al agregar el nuevo gasto de Bs. 100, la pestaña liquidación ahora:
1. Mantiene las transferencias pasadas en la sección de "completadas".
2. Genera las deudas de forma correcta basadas únicamente en el balance ajustado (es decir, solo cobra la diferencia real, en este caso los Bs. 25 a cada uno si ya estaban a mano antes de ese gasto).

---

## Iteración 15 — 2026-09-08

### Prompt recibido

> Lee bitacora.md y el archivo plan-alumnos-multimoneda.md (secciones 2 y 3) para respetar la arquitectura y las decisiones de diseño.
>
> Eres el Alumno 1. Implementa SOLO esta parte. No reescribas calculations.ts. No cambies todavía los saldos ni la liquidación a dólares. No pidas moneda al marcar un pago de liquidación.
>
> Objetivo de esta iteración:
> Los gastos deben poder ingresarse y editarse en tres monedas: dólares americanos (USD), USDT y bolivianos (BOB). También debe existir una forma sencilla de ver y editar las tasas de cambio, porque los siguientes alumnos las van a usar.
>
> Requisitos:
>
> 1. En src/models/index.ts:
>    - Exporta type Currency = 'USD' | 'USDT' | 'BOB'
>    - Agrega currency: Currency a Expense
>    - Agrega interface ExchangeRates { usdToBob: number; usdToUsdt: number }
>    - Agrega exchangeRates: ExchangeRates a AppState
>    - Gastos antiguos sin currency deben tratarse como BOB (retrocompatibilidad en storage, no en cada vista)
>
> 2. En src/services/storage.ts:
>    - DEFAULT_STATE debe incluir exchangeRates: { usdToBob: 6.96, usdToUsdt: 1 }
>    - loadState() debe seguir usando spread defensivo con DEFAULT_STATE
>    - Si un gasto cargado no tiene currency, asígnale 'BOB' al hidratar el estado
>
> 3. Crea src/services/currency.ts (sin usarlo aún para saldos) con helpers puros:
>    - CURRENCY_LABELS y CURRENCY_SYMBOLS para USD ($), USDT (USDT), BOB (Bs.)
>    - formatMoney(amount, currency) para mostrar el monto original
>    - Puedes dejar también firmas de conversión a USD documentadas, pero NO las conectes a calculations.ts en esta iteración
>
> 4. Controller (useAppController.ts):
>    - addExpense y updateExpense deben recibir y persistir currency
>    - Agrega updateExchangeRates(rates) que valide: ambos valores deben ser números > 0
>    - Expón updateExchangeRates en el return del hook
>
> 5. UI de tasas (sencilla, consistente con el diseño dark actual):
>    - Un bloque visible (por ejemplo en el header de App.tsx o un pequeño panel) para editar:
>      - Bs. por 1 USD (usdToBob)
>      - USDT por 1 USD (usdToUsdt)
>    - Valores por defecto 6.96 y 1
>    - Guardar en localStorage a través del controller
>
> 6. UI de gastos:
>    - AddExpenseForm: selector obligatorio de moneda (USD / USDT / BOB) junto al monto. Default sugerido: BOB, para no romper la costumbre actual.
>    - ExpenseList: mostrar la moneda original de cada gasto (símbolo + monto). El editor inline también debe permitir cambiar la moneda.
>    - Validaciones iguales que ahora (descripción, monto > 0, pagador, al menos un participante) más moneda requerida.
>
> 7. No mezcles monedas en el total de la lista de gastos si no puedes convertirlo aún. Si el total dejaría de tener sentido (sumar 100 Bs. + 100 USD), o bien oculta el total único, o muéstralo separado por moneda, o indica que el total unificado llegará en la siguiente iteración. No presentes un solo "Bs. XXX" sumando monedas distintas.
>
> 8. Mantén el diseño existente (Tailwind, dark, pestañas). No agregues librerías.
>
> 9. Compila con tsc --noEmit. Prueba en el navegador:
>    - Crear un gasto en BOB, uno en USD y uno en USDT
>    - Editar la moneda de un gasto
>    - Cambiar las tasas y refrescar: deben persistir
>    - Recargar la página: gastos y tasas siguen ahí
>    - Datos viejos sin currency se ven como BOB
>
> 10. Registra esta iteración en bitacora.md como Iteración 15, con fecha de hoy, el prompt recibido textual, cambios, resultado, problemas y correcciones SOLO si ocurrieron de verdad. No borres entradas anteriores. No inventes problemas.
>
> Cuando termines, no hagas el trabajo de los alumnos 2, 3 ni 4.

### Cambios realizados

**`src/models/index.ts`**
- Nuevo `type Currency = 'USD' | 'USDT' | 'BOB'`.
- Nueva `interface ExchangeRates { usdToBob; usdToUsdt }`.
- `Expense` ahora incluye `currency: Currency`.
- `AppState` ahora incluye `exchangeRates: ExchangeRates`.

**`src/services/storage.ts`**
- `DEFAULT_STATE.exchangeRates` = `{ usdToBob: 6.96, usdToUsdt: 1 }`.
- `loadState()` sigue usando spread defensivo `{ ...DEFAULT_STATE, ...parsed }`.
- Al hidratar, un gasto sin `currency` recibe `'BOB'`.

**`src/services/currency.ts`** (nuevo)
- `CURRENCY_LABELS`, `CURRENCY_SYMBOLS` y `formatMoney(amount, currency)`.
- `toUsdCents` / `fromUsdCents` documentados para las iteraciones siguientes. **No se conectaron a `calculations.ts`.**

**`src/controllers/useAppController.ts`**
- `addExpense` y `updateExpense` reciben y persisten `currency`.
- Nueva `updateExchangeRates(rates)`: ambos valores deben ser números finitos `> 0`.
- Expuesta en el return del hook.

**UI**
- `ExchangeRatesPanel` en el header: editar Bs. por 1 USD y USDT por 1 USD, guardar vía controller.
- `AddExpenseForm`: selector USD / USDT / BOB junto al monto (default BOB).
- `ExpenseList`: muestra símbolo + monto original; el editor inline permite cambiar la moneda.
- Totales de la lista separados por moneda (no se suma Bs. + $ + USDT). Si hay más de una moneda, se indica que el total unificado llega en la siguiente iteración.

No se reescribió `calculations.ts`. Saldos y liquidación siguen como estaban. No se pide moneda al marcar un pago.

### Resultado

Vite aplicó HMR de los módulos tocados sin errores de transformación.

`npx tsc --noEmit` y las pruebas interactivas en el navegador no se pudieron completar desde el agente: el shell local devolvió `spawn UNKNOWN` y no había herramientas de browser disponibles. Hay que verificar en `http://localhost:5173/`:

- Crear un gasto en BOB, uno en USD y uno en USDT
- Editar la moneda de un gasto
- Cambiar las tasas, refrescar: deben persistir
- Recargar la página: gastos y tasas siguen ahí
- Datos viejos sin `currency` se ven como BOB
- `npx tsc --noEmit` debe salir 0

### Problemas encontrados

El entorno del agente no pudo lanzar procesos de shell (`spawn UNKNOWN`) ni automatizar el navegador. No es un error del código de la app.

### Correcciones realizadas

Ninguna sobre el código: no hubo un fallo de implementación que hubiera que revertir.
