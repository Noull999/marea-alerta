# Validación y backtesting del modelo de riesgo

Cómo demostrar (o refutar) que las predicciones de MareaAlerta concuerdan con
la realidad oficial. **Este es el argumento de venta más importante del
producto:** sin esto, "una app de alertas" es solo una promesa.

> Requiere salida a internet a `datos.gob.cl` y, para el backtest en vivo, la
> app corriendo. El entorno de desarrollo web de Claude puede tener la red
> restringida por allowlist — corre estos scripts localmente o en un entorno
> con acceso.

## 0. Pre-requisito: datos reales

El backtest solo tiene sentido con datos reales cableados. Hoy la clorofila
(40 % del riesgo) e IFOP están sin fuente real (ver
`AUDITORIA_FUENTES_DATOS.md`). Orden: primero cablear datos reales, luego medir.

## 1. Inspeccionar la fuente oficial

Descubre qué publica realmente SERNAPESCA/SUBPESCA y con qué columnas:

```bash
node scripts/inspect-sernapesca.mjs
node scripts/inspect-sernapesca.mjs "veda sanitaria moluscos"
```

Con las columnas reales, afina `FIELD_ALIASES` en `lib/subpesca.ts`.

## 2. Backtest de concordancia "en vivo" (nowcast)

Contrasta el modelo contra las vedas oficiales **activas hoy**:

```bash
npm run dev                 # en otra terminal
node scripts/backtest.mjs   # o: node scripts/backtest.mjs https://tu-app.vercel.app
```

Salida: matriz de confusión + precision / recall / F1, resaltando los
**falsos negativos** (veda activa pero modelo en VERDE → el peor error en una
app de seguridad alimentaria). Cada corrida se agrega a
`scripts/backtest-log.jsonl`.

**Corriéndolo a diario (cron) acumulas un backtest histórico real** sin
necesidad de datos históricos: vas registrando predicción vs realidad día a día.

### Interpretación

| Métrica | Qué mide | Meta |
|---|---|---|
| **Recall** | De las vedas reales, cuántas anticipó el modelo | Alto (no perder vedas) |
| **Precision** | De las alertas, cuántas correspondían a veda | Alto (no saturar de falsas) |
| **Falsos negativos** | Veda real con modelo en VERDE | **Cercano a 0** |

En seguridad alimentaria se prioriza **recall** (mejor una falsa alarma que
una intoxicación), pero demasiados falsos positivos matan la confianza.

## 3. Backtest histórico completo (siguiente nivel)

El nowcast valida "ahora". Para validar el pasado hay dos vías:

1. **Almacenar predicciones diarias** (recomendado): persistir el output de
   `/api/fan-data` cada día. A las pocas semanas tienes una serie real para
   medir anticipación (¿el ROJO apareció N días antes de la veda?).
2. **Reconstruir inputs históricos**: usar Open-Meteo Archive
   (`https://archive-api.open-meteo.com`) para SST/oleaje de fechas pasadas y
   re-ejecutar el cálculo de riesgo contra el calendario histórico de vedas de
   SERNAPESCA. Limitación: la clorofila satelital histórica requiere una fuente
   con credenciales (Copernicus/NASA).

## 4. Métrica estrella para vender

> "En los últimos N meses, el modelo anticipó el **X %** de las vedas oficiales
> de SERNAPESCA con una mediana de **D días** de antelación, con **Y** falsas
> alarmas."

Ese enunciado, respaldado por `backtest-log.jsonl`, es lo que convierte el
producto en algo por lo que una mitilicultora paga.
</content>
