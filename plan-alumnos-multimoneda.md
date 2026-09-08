# Plan de trabajo — Multimoneda (USD / USDT / BOB)

Guía para completar la funcionalidad de **múltiples monedas** en **Cuentas Claras**, dividida en **4 prompts secuenciales**. Cada alumno descarga el proyecto, ejecuta **un solo prompt** en Cursor, commitea con **su propio nombre** y pushea.

Este archivo **no** es una iteración de `bitacora.md`. Cada alumno **sí** debe registrar **su propia implementación** en `bitacora.md` cuando termine su prompt.

---

## 1. Asignación (rellenar antes de empezar)

Cada alumno debe aparecer en `git log` con su nombre real. Antes de commitear, verificar:

```bash
git config user.name
git config user.email
```

Si el nombre no es el correcto, configurarlo **solo en este repositorio** (no hace falta `--global`):

```bash
git config user.name "Nombre Apellido"
git config user.email "correo@universidad.edu"
```

| Orden | Alumno (nombre completo) | Prompt que ejecuta | Iteración en bitácora |
|------:|--------------------------|--------------------|------------------------|
| 1 | ________________________ | Prompt 1 — Modelo, tasas y gastos en 3 monedas | Iteración 15 |
| 2 | ________________________ | Prompt 2 — Conversión a USD, centavos del pagador y saldos en USD | Iteración 16 |
| 3 | ________________________ | Prompt 3 — Liquidación en USD + USDT + BOB | Iteración 17 |
| 4 | ________________________ | Prompt 4 — Registrar moneda del pago y cierre | Iteración 18 |

**Regla:** no se salta el orden. El Alumno N no empieza hasta que el Alumno N−1 haya hecho `push` y el resto pueda hacer `pull`.

---

## 2. Resultado final que debemos alcanzar (los 4 prompts juntos)

Al terminar el Prompt 4, la app debe cumplir todo esto:

1. Un gasto se puede registrar en **dólares americanos (USD)**, **USDT** o **bolivianos (BOB)**.
2. Los **saldos** se calculan y se muestran en **USD**.
3. La **liquidación** muestra cada transferencia **primero en USD**, y también su equivalente en **USDT** y **BOB**.
4. Al marcar una transferencia como pagada, se **elige y se guarda** la moneda real del pago (USD, USDT o BOB).
5. Si un monto no se divide exacto en centavos, el **excedente lo absorbe quien pagó** el gasto. La suma de las partes sigue siendo exactamente el monto original (en centavos de USD).
6. Nada de esto rompe participantes, edición/eliminación de gastos, persistencia en `localStorage` ni el historial de liquidaciones ya pagadas.

---

## 3. Decisiones de diseño (obligatorias para los 4)

Todos los prompts deben respetar estas reglas. Si Cursor propone otra cosa, **corregir** para que coincida con este documento.

### 3.1 Monedas

```ts
type Currency = 'USD' | 'USDT' | 'BOB';
```

| Código | Nombre en la UI | Símbolo sugerido |
|--------|-----------------|------------------|
| `USD`  | Dólares         | `$`              |
| `USDT` | USDT            | `USDT`           |
| `BOB`  | Bolivianos      | `Bs.`            |

USDT y USD son monedas **distintas** aunque el tipo de cambio sea 1:1. Siempre se muestran por separado.

### 3.2 Moneda base de cálculo: USD

- Toda la aritmética interna de saldos y deudas se hace en **centavos enteros de USD**.
- Un gasto guarda su monto **original** y su **moneda original** (lo que el usuario tipeó).
- Para calcular, ese monto se convierte a USD con las tasas actuales.
- Los saldos **nunca** se muestran como suma mezclada de Bs. + $ + USDT.

### 3.3 Tasas de cambio (valores por defecto)

Viven en `AppState` para poder editarlas sin tocar código:

```ts
interface ExchangeRates {
  usdToBob: number;   // cuántos bolivianos es 1 USD     — default: 6.96
  usdToUsdt: number;  // cuántos USDT es 1 USD           — default: 1
}
```

Conversiones (redondeo al centavo más cercano, una sola vez):

- A USD:  
  - USD → `round(monto * 100)` centavos  
  - USDT → `round(monto / usdToUsdt * 100)` centavos  
  - BOB → `round(monto / usdToBob * 100)` centavos
- Desde USD (solo para **mostrar** equivalentes):  
  - USDT = `(usdCents / 100) * usdToUsdt`  
  - BOB = `(usdCents / 100) * usdToBob`

Las tasas se pueden editar en la UI. Al cambiarlas, saldos y liquidación se recalculan. Documentarlo en la bitácora.

### 3.4 Excedente de centavos → lo absorbe quien pagó

Trabajar siempre en **centavos de USD enteros**.

```
usdCents  = conversión del gasto a centavos USD
n         = cantidad de personas que COMPARTEN el gasto
base      = floor(usdCents / n)
remainder = usdCents - base * n     // 0 .. n-1 centavos
```

Regla:

1. Cada persona que **comparte** el gasto asume `base` centavos.
2. Los `remainder` centavos **se suman a la parte de quien pagó** (`paidBy`).
3. Si el pagador **también comparte**, su parte queda `base + remainder` y los demás `base`.
4. Si el pagador **no comparte** ese gasto, los que comparten asumen solo `base` cada uno, y el pagador asume los `remainder` centavos como costo propio (no los recupera).
5. Garantía: `suma de todas las partes === usdCents` siempre. Σ balances = 0.

Ejemplos (en USD, para que el Alumno 2 los use como prueba):

| Gasto | Quién paga | Quiénes comparten | Partes |
|-------|------------|-------------------|--------|
| $10.00 / 3 | Ana (comparte) | Ana, Carlos, Lucía | Ana **3.34**, Carlos 3.33, Lucía 3.33 |
| $1.00 / 3 | Ana (comparte) | Ana, Carlos, Lucía | Ana **0.34**, Carlos 0.33, Lucía 0.33 |
| $10.00 / 3 | Ana (**no** comparte) | Carlos, Lucía, Marcos | Carlos 3.33, Lucía 3.33, Marcos 3.33, Ana absorbe **0.01** |

**Prohibido** volver a usar el método del resto mayor que reparte el centavo extra a los primeros de la lista. Eso queda reemplazado por esta regla.

### 3.5 Qué guarda cada gasto y cada pago

**Gasto (`Expense`)** — el Alumno 1 agrega `currency`. El resto de campos se mantienen.

**Pago de liquidación (`PaymentRecord`)** — el Alumno 4 agrega la moneda en la que se pagó. Hasta entonces, los pagos siguen funcionando como ahora (el monto interno sigue siendo en la unidad de cálculo; a partir del Prompt 2 esa unidad es USD).

### 3.6 Arquitectura (no cambiar)

Seguir MVC ligero:

- `src/models/` — tipos
- `src/services/` — persistencia y cálculos
- `src/controllers/useAppController.ts` — único puente vistas ↔ datos
- `src/views/components/` — UI

Persistencia: `localStorage`, clave actual en `storage.ts`. Usar spread defensivo para que datos viejos (gastos sin `currency`) carguen como **BOB**.

No crear backend. No instalar librerías de dinero ni de tipos de cambio.

### 3.7 Alcance por alumno (no adelantarse)

| Alumno | Hace | No hace |
|--------|------|---------|
| 1 | Tipos, tasas, selector de moneda en gastos, mostrar moneda original | No reescribe `calculations.ts` ni cambia Saldos/Liquidación a USD |
| 2 | Conversión, regla del pagador, saldos en USD | No rediseña la liquidación ni pide moneda al pagar |
| 3 | Liquidación visible en USD + USDT + BOB | No pide aún en qué moneda se pagó |
| 4 | Registrar moneda del pago, historial, pulido y consistencia total | No reabre la lógica matemática salvo bugs evidentes |

---

## 4. Protocolo Git (igual para los 4)

Hacerlo **en este orden**, sin excepciones.

### 4.1 Antes de abrir Cursor

```bash
git pull
npm install
npm run dev
```

Confirmar que la app abre y que `git config user.name` es el nombre del alumno que va a commitear.

### 4.2 En Cursor

1. Abrir el chat del agente.
2. Copiar **todo** el bloque `PROMPT ALUMNO N` (desde `INICIO PROMPT` hasta `FIN PROMPT`).
3. Pegarlo tal cual. No resumirlo ni mezclarlo con el prompt de otro alumno.
4. Dejar que implemente.
5. Revisar en el navegador (`http://localhost:5173/`) lo que pide la sección **Pruebas** de ese prompt.
6. Confirmar que actualizó `bitacora.md` (nueva iteración, prompt textual, sin borrar entradas viejas).

### 4.3 Commit y push

Un commit por alumno es suficiente (puede ser más de un commit si hace falta un arreglo, siempre con el mismo `user.name`).

```bash
git status
git diff
git add -A
git commit -m "mensaje"
git push
```

Usar el **mensaje de commit** indicado en cada prompt. No usar `--amend` sobre el commit de otro alumno. No hacer force push. No commitear `.env` ni secretos.

### 4.4 Aviso al siguiente

Cuando el `push` termine, avisar al siguiente alumno: *“Prompt N pusheado, ya puedes hacer pull.”*

---

## 5. Cómo pasarle el trabajo a cada alumno

Mensaje corto para WhatsApp / Discord / aula (copiar y completar):

```
Te toca el Prompt N del archivo plan-alumnos-multimoneda.md
1. git pull
2. Verifica: git config user.name  (debe ser TU nombre)
3. En Cursor, pega SOLO el bloque "PROMPT ALUMNO N"
4. Prueba lo que indica el plan
5. Commit con el mensaje del plan y git push
6. Avisa cuando esté en el remoto
No ejecutes prompts de otros alumnos.
```

---

# PROMPT ALUMNO 1

**Quién:** primer alumno de la tabla  
**Iteración bitácora:** 15  
**Mensaje de commit:**

```
feat: permitir registrar gastos en USD, USDT y bolivianos
```

### INICIO PROMPT

```
Lee bitacora.md y el archivo plan-alumnos-multimoneda.md (secciones 2 y 3) para respetar la arquitectura y las decisiones de diseño.

Eres el Alumno 1. Implementa SOLO esta parte. No reescribas calculations.ts. No cambies todavía los saldos ni la liquidación a dólares. No pidas moneda al marcar un pago de liquidación.

Objetivo de esta iteración:
Los gastos deben poder ingresarse y editarse en tres monedas: dólares americanos (USD), USDT y bolivianos (BOB). También debe existir una forma sencilla de ver y editar las tasas de cambio, porque los siguientes alumnos las van a usar.

Requisitos:

1. En src/models/index.ts:
   - Exporta type Currency = 'USD' | 'USDT' | 'BOB'
   - Agrega currency: Currency a Expense
   - Agrega interface ExchangeRates { usdToBob: number; usdToUsdt: number }
   - Agrega exchangeRates: ExchangeRates a AppState
   - Gastos antiguos sin currency deben tratarse como BOB (retrocompatibilidad en storage, no en cada vista)

2. En src/services/storage.ts:
   - DEFAULT_STATE debe incluir exchangeRates: { usdToBob: 6.96, usdToUsdt: 1 }
   - loadState() debe seguir usando spread defensivo con DEFAULT_STATE
   - Si un gasto cargado no tiene currency, asígnale 'BOB' al hidratar el estado

3. Crea src/services/currency.ts (sin usarlo aún para saldos) con helpers puros:
   - CURRENCY_LABELS y CURRENCY_SYMBOLS para USD ($), USDT (USDT), BOB (Bs.)
   - formatMoney(amount, currency) para mostrar el monto original
   - Puedes dejar también firmas de conversión a USD documentadas, pero NO las conectes a calculations.ts en esta iteración

4. Controller (useAppController.ts):
   - addExpense y updateExpense deben recibir y persistir currency
   - Agrega updateExchangeRates(rates) que valide: ambos valores deben ser números > 0
   - Expón updateExchangeRates en el return del hook

5. UI de tasas (sencilla, consistente con el diseño dark actual):
   - Un bloque visible (por ejemplo en el header de App.tsx o un pequeño panel) para editar:
     - Bs. por 1 USD (usdToBob)
     - USDT por 1 USD (usdToUsdt)
   - Valores por defecto 6.96 y 1
   - Guardar en localStorage a través del controller

6. UI de gastos:
   - AddExpenseForm: selector obligatorio de moneda (USD / USDT / BOB) junto al monto. Default sugerido: BOB, para no romper la costumbre actual.
   - ExpenseList: mostrar la moneda original de cada gasto (símbolo + monto). El editor inline también debe permitir cambiar la moneda.
   - Validaciones iguales que ahora (descripción, monto > 0, pagador, al menos un participante) más moneda requerida.

7. No mezcles monedas en el total de la lista de gastos si no puedes convertirlo aún. Si el total dejaría de tener sentido (sumar 100 Bs. + 100 USD), o bien oculta el total único, o muéstralo separado por moneda, o indica que el total unificado llegará en la siguiente iteración. No presentes un solo "Bs. XXX" sumando monedas distintas.

8. Mantén el diseño existente (Tailwind, dark, pestañas). No agregues librerías.

9. Compila con tsc --noEmit. Prueba en el navegador:
   - Crear un gasto en BOB, uno en USD y uno en USDT
   - Editar la moneda de un gasto
   - Cambiar las tasas y refrescar: deben persistir
   - Recargar la página: gastos y tasas siguen ahí
   - Datos viejos sin currency se ven como BOB

10. Registra esta iteración en bitacora.md como Iteración 15, con fecha de hoy, el prompt recibido textual, cambios, resultado, problemas y correcciones SOLO si ocurrieron de verdad. No borres entradas anteriores. No inventes problemas.

Cuando termines, no hagas el trabajo de los alumnos 2, 3 ni 4.
```

### FIN PROMPT

**Pruebas mínimas que el Alumno 1 debe hacer antes de commitear**

- [ ] Selector USD / USDT / BOB al crear gasto
- [ ] La lista muestra la moneda correcta de cada gasto
- [ ] Se puede editar la moneda
- [ ] Tasas 6.96 y 1 editables y persistentes
- [ ] `npx tsc --noEmit` sale 0
- [ ] `bitacora.md` tiene Iteración 15

---

# PROMPT ALUMNO 2

**Quién:** segundo alumno de la tabla  
**Iteración bitácora:** 16  
**Mensaje de commit:**

```
feat: calcular saldos en USD y asignar el excedente de centavos a quien pagó
```

### INICIO PROMPT

```
Lee bitacora.md y plan-alumnos-multimoneda.md (secciones 2 y 3, sobre todo 3.2, 3.3 y 3.4). Revisa lo que implementó el Alumno 1: Currency, Expense.currency, ExchangeRates, currency.ts, selector de moneda y tasas.

Eres el Alumno 2. Implementa SOLO esta parte. No rediseñes la pantalla de Liquidación (eso es Alumno 3). No pidas ni guardes la moneda en la que se marca un pago (eso es Alumno 4).

Objetivo de esta iteración:
Todos los saldos se calculan internamente en centavos de USD y se muestran en dólares americanos. Si un gasto no se puede dividir en centavos exactos, el excedente lo absorbe quien pagó.

Requisitos:

1. Completa src/services/currency.ts (o el archivo de conversión que haya dejado el Alumno 1):
   - toUsdCents(amount, currency, rates): number
   - fromUsdCents(usdCents, targetCurrency, rates): number  (para mostrar equivalentes; Alumno 3 lo usará, decláralo ya)
   - Usar Math.round y aritmética en enteros. Nada de sumar floats en un bucle.

2. Reescribe la distribución en src/services/calculations.ts:
   - Elimina el método del resto mayor que daba el centavo extra a los primeros índices.
   - Nueva función, por ejemplo distributeSharesForPayer(usdCents, participantIds, paidBy):
     * base = floor(usdCents / n)
     * remainder = usdCents % n
     * cada id en participantIds recibe base
     * remainder se suma SIEMPRE a paidBy (esté o no en participantIds)
     * la suma de partes (incluyendo remainder del pagador) === usdCents
   - calculateBalances, calculateDetailedBalances y calculateDebts deben:
     * recibir también exchangeRates
     * convertir CADA gasto a USD con toUsdCents ANTES de repartir
     * operar solo en centavos USD
     * devolver montos en USD (no en Bs.)
   - ParticipantBalance sigue significando lo mismo (totalPaid, totalOwed, balance, settledOut, settledIn, adjustedBalance) pero ahora esas cifras están en USD.
   - Los PaymentRecord.amountCents existentes pasan a interpretarse como centavos USD a partir de ahora. Documenta eso en un comentario breve. No migres datos viejos con una fórmula mágica: es un proyecto académico de iteraciones.

3. Actualiza las firmas y todos los call sites (SummaryPanel, SettlementPanel si ya llama a calculateDebts, tests locales). Pasa state.exchangeRates.

4. SummaryPanel (pestaña Saldos):
   - Total gastado en USD (suma de gastos convertidos, no suma de montos originales)
   - Columnas Pagó / Corresponde / Balance en USD, con símbolo $
   - Si hay pagos de liquidación, la columna Liquidó y el balance ajustado también en USD
   - La suma de balances debe ser $ 0.00 (0 centavos)
   - Leyenda igual: + le deben, − debe, 0 a mano
   - No muestres Bs. como unidad principal de esta pestaña

5. Pruebas obligatorias con node o un pequeño script temporal (puedes borrarlo después, o dejarlo fuera del commit si es ruido). Casos:
   - $10.00 USD / 3 personas, paga Ana y Ana comparte → 3.34, 3.33, 3.33 (Ana absorbe 1 centavo)
   - $1.00 USD / 3 → 0.34, 0.33, 0.33 para el pagador y los otros
   - Bs. 69.60 con tasa 6.96 → equivale a $10.00 USD, luego se divide según la regla
   - Un gasto USDT con usdToUsdt = 1 se comporta como USD
   - Mezclar un gasto en BOB y uno en USD: el saldo unificado está en USD y Σ balances = 0
   - Pagador que NO comparte: los demás reciben solo base; el pagador absorbe remainder; Σ = 0

6. Compila con tsc --noEmit. Verifica en la pestaña Saldos con datos reales de la UI.

7. Registra Iteración 16 en bitacora.md con el prompt textual, cambios reales, resultado y problemas solo si ocurrieron. No borres entradas anteriores.

No implementes el desglose USDT/BOB de la liquidación ni el selector de moneda al pagar.
```

### FIN PROMPT

**Pruebas mínimas que el Alumno 2 debe hacer antes de commitear**

- [ ] Saldos se leen en `$` / USD
- [ ] Gasto en Bs. y gasto en USD conviven y el balance queda en USD
- [ ] $10 entre 3: quien pagó tiene 3.34, los otros 3.33
- [ ] Suma de balances = 0.00
- [ ] `npx tsc --noEmit` sale 0
- [ ] `bitacora.md` tiene Iteración 16

---

# PROMPT ALUMNO 3

**Quién:** tercer alumno de la tabla  
**Iteración bitácora:** 17  
**Mensaje de commit:**

```
feat: mostrar la liquidación en USD, USDT y bolivianos
```

### INICIO PROMPT

```
Lee bitacora.md y plan-alumnos-multimoneda.md (secciones 2, 3.1, 3.3 y 3.5). Revisa SettlementPanel.tsx, calculations.ts (calculateDebts) y currency.ts dejados por los alumnos 1 y 2.

Eres el Alumno 3. Implementa SOLO esta parte. No agregues todavía el selector "¿en qué moneda estás pagando?" al marcar una transferencia (eso es Alumno 4). No toques la regla matemática del excedente ni la conversión a USD salvo que esté rota de forma evidente; si está rota, corrígela y documéntalo.

Objetivo de esta iteración:
La pestaña Liquidación debe mostrar cada transferencia principalmente en dólares americanos, y también el equivalente en USDT y en bolivianos, usando las tasas actuales.

Requisitos:

1. Cada transferencia pendiente (salida de calculateDebts, que ya está en USD) se muestra así:
   - Línea principal: Deudor → Acreedor y monto en USD (ejemplo: "Diego → Ana    $ 40.00")
   - Debajo o al lado, texto secundario más pequeño: equivalente USDT y equivalente Bs., por ejemplo:
     USDT 40.00    ·    Bs. 278.40
   - Los equivalentes se calculan con fromUsdCents (o la función equivalente) y state.exchangeRates
   - Si cambias las tasas en la UI, los equivalentes de liquidación deben actualizarse al re-render

2. El total pendiente a transferir también se muestra primero en USD y, en secundario, USDT y BOB.

3. Las transferencias ya completadas (lista histórica de payments) deben mostrar igual: principal USD, secundario USDT y BOB. amountCents se interpreta como centavos USD (decisión del Alumno 2).

4. Conserva: marcar ○ / desmarcar ✓, estado "¡Liquidación completa!", pendientes vs completadas, estados vacíos claros.

5. No mezcles unidades. Nunca muestres el monto principal de liquidación como "Bs." si el cálculo ya está en USD.

6. Responsive: en móvil los equivalentes pueden ir en una segunda fila; en desktop pueden ir a la derecha bajo el monto USD. Mantén el look actual (dark, glass, badges).

7. Compila con tsc --noEmit. Prueba:
   - Varios gastos mixtos (USD + BOB + USDT) generan transferencias en USD
   - Con usdToBob = 6.96, $10 se ve también como Bs. 69.60 y USDT 10.00 (si usdToUsdt = 1)
   - Cambiar usdToBob a 7.00 actualiza los equivalentes Bs. sin cambiar el USD principal
   - Marcar y desmarcar una transferencia sigue funcionando
   - Σ de equivalentes no necesita ser "mágica": la verdad contable es el USD; BOB/USDT son conversión de visualización

8. Registra Iteración 17 en bitacora.md con el prompt textual y lo que realmente implementaste. No borres entradas anteriores. No adelantes el registro de moneda de pago.
```

### FIN PROMPT

**Pruebas mínimas que el Alumno 3 debe hacer antes de commitear**

- [ ] Cada transferencia muestra `$` como monto principal
- [ ] Debajo/al lado aparecen USDT y Bs. equivalentes
- [ ] Cambiar la tasa BOB cambia solo el equivalente en bolivianos
- [ ] Marcar pagado / revertir sigue igual
- [ ] `npx tsc --noEmit` sale 0
- [ ] `bitacora.md` tiene Iteración 17

---

# PROMPT ALUMNO 4

**Quién:** cuarto alumno de la tabla  
**Iteración bitácora:** 18  
**Mensaje de commit:**

```
feat: registrar la moneda en la que se paga cada liquidación
```

### INICIO PROMPT

```
Lee bitacora.md y plan-alumnos-multimoneda.md completo (especialmente 2, 3.5 y el resultado final). Revisa models, useAppController (markTransferPaid / unmarkTransferPaid), SettlementPanel y SummaryPanel.

Eres el Alumno 4. Cierra la funcionalidad. No reescribas de cero los cálculos si ya cumplen USD + excedente al pagador. Sí debes integrar y pulir para que las 4 pestañas sean coherentes.

Objetivo de esta iteración:
Al marcar una transferencia como pagada, el usuario elige si pagó en dólares americanos, USDT o bolivianos. Esa moneda (y el monto equivalente en esa moneda) queda registrada y se ve en el historial. Los saldos siguen actualizándose automáticamente.

Requisitos:

1. Extiende PaymentRecord en src/models/index.ts:
   - currency: Currency        // moneda REAL en la que se pagó
   - paidAmount: number        // monto en esa moneda (el equivalente al momento de pagar)
   - Conserva from, to, amountCents (centavos USD de la deuda cancelada), paidAt
   - Datos viejos sin currency: al hidratar, usa currency: 'USD' y paidAmount = amountCents/100 (spread defensivo en storage)

2. Controller:
   - markTransferPaid(from, to, amountCents, currency) debe:
     * calcular paidAmount con las tasas actuales (fromUsdCents)
     * guardar currency, paidAmount, amountCents, paidAt
     * no duplicar la misma firma (from, to, amountCents) si ya existe
   - unmarkTransferPaid sigue identificando por (from, to, amountCents)
   - Si hay un "Revertir pagos", también debe seguir funcionando

3. SettlementPanel:
   - Al hacer click en ○ (pendiente) NO se marque en silencio: mostrar un mini-paso para elegir moneda USD / USDT / BOB
     (modal, popover o botones inline; elige lo más simple y consistente con el diálogo de borrar gasto)
   - Mostrar el equivalente que se va a registrar, según la moneda elegida, antes de confirmar
   - Tras confirmar, la fila pasa a completadas
   - En transferencias completadas, además del USD principal y los equivalentes, mostrar claramente:
     "Pagado en USDT 40.00" / "Pagado en Bs. 278.40" / "Pagado en $ 40.00"
     según currency y paidAmount guardados (no recalcular con tasas nuevas: el historial es lo que se pagó ese día)
   - El USD principal de la deuda sí es amountCents (lo que se descontó del saldo)

4. Saldos:
   - Deben seguir usando amountCents en USD para el adjustedBalance (como dejó el Alumno 2)
   - Si es natural, un texto breve de que los pagos de liquidación se descuentan en USD aunque se hayan entregado en Bs. o USDT

5. Mensajes claros, sin jerga técnica:
   - Si intenta marcar sin elegir moneda → "Elige la moneda en la que se realizó el pago."
   - Estados vacíos existentes se conservan

6. Recorre las 4 pestañas y corrige inconsistencias de etiquetas (si alguna vista todavía dice Bs. como unidad principal de saldos/liquidación, cámbiala a USD). Los gastos individuales SÍ deben seguir mostrando su moneda original.

7. Compila con tsc --noEmit. Prueba de punta a punta:
   - Gastos mixtos USD + USDT + BOB
   - Saldos en USD, suma 0
   - Liquidación principal en USD con equivalentes USDT y Bs.
   - Marcar pago en BOB: historial dice pagado en Bs. XXX; el saldo del deudor baja en USD
   - Marcar otro pago en USDT y otro en USD
   - Si todos pagan, "¡Liquidación completa!"
   - Refrescar la página: monedas de pago persisten
   - Revertir un pago lo quita del historial y el saldo vuelve a adeudarse
   - Centavos: $10 / 3, el pagador absorbe 0.01

8. Opcional breve: actualiza README.md (2-4 líneas) indicando las tres monedas, que los saldos son en USD y que se registra la moneda del pago. No reescribas el README entero.

9. Registra Iteración 18 en bitacora.md con el prompt textual y el resultado real. Esta es la iteración que cierra el pedido de multimoneda. No borres entradas anteriores. No inventes problemas.
```

### FIN PROMPT

**Pruebas mínimas que el Alumno 4 debe hacer antes de commitear**

- [ ] Al marcar pagado, obliga a elegir USD / USDT / BOB
- [ ] El historial muestra “Pagado en …” con la moneda real
- [ ] El saldo (USD) sí descuenta esa transferencia
- [ ] Recargar no pierde la moneda del pago
- [ ] Recorrido de las 4 pestañas sin etiquetas viejas de “todo en Bs.” en Saldos/Liquidación
- [ ] `npx tsc --noEmit` sale 0
- [ ] `bitacora.md` tiene Iteración 18
- [ ] README menciona las 3 monedas (si se tocó)

---

## 6. Checklist final (cuando los 4 hayan pusheado)

Un alumno (cualquiera) hace `git pull` y verifica:

```bash
git log --format="%h %an %s" -8
npx tsc --noEmit
npm run dev
```

En `git log` deben verse **los 4 nombres**. En la app:

| Criterio | OK |
|----------|----|
| Gastos en USD, USDT y BOB | ☐ |
| Saldos en dólares americanos | ☐ |
| Liquidación principal en USD + equivalentes USDT y Bs. | ☐ |
| Pago de liquidación registra la moneda usada | ☐ |
| Excedente de centavos lo absorbe quien pagó el gasto | ☐ |
| Persistencia al refrescar | ☐ |
| `bitacora.md` con iteraciones 15 a 18, sin borrar las 1–14 | ☐ |

---

## 7. Si algo sale mal

| Problema | Qué hacer |
|----------|-----------|
| El alumno anterior no pusheó | No empezar. Pedir el push. |
| `git pull` trae conflictos | Resolver con el grupo; no borrar el trabajo del otro. |
| Cursor implementó el prompt del siguiente alumno | Revertir esos archivos (`git checkout -- archivo`) o pedir que deje solo el alcance de su número. |
| `user.name` era el de otra persona | No reescribir historia ajena. Corregir `git config user.name` y hacer un commit nuevo con el nombre correcto si hace falta. |
| Datos viejos en el navegador se ven raros | Es normal: `localStorage` local. Probar en ventana incógnito o borrar la clave `cuentas_claras_data_v3`. |

---

## 8. Recordatorio

- **No** registrar en `bitacora.md` el prompt que pidió crear este plan.
- **Sí** registrar en `bitacora.md` cada uno de los Prompt 1–4 cuando se implementen.
- Un prompt por persona, en orden, un `user.name` real por commit.
