---
id: separaciones
num: 7
title: Separaciones en aeródromo
icon: arrows
wiki: https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc/chapter/separaciones-en-aerodromo
---

## Quién separa a quién

La separación aplicable depende de las reglas de vuelo, la clase de espacio aéreo, las performances y la categoría de estela. En un ATZ/CTR de **clase D** (lo habitual en España):

- **IFR ↔ IFR**: la separación es responsabilidad del **controlador**.
- **IFR ↔ VFR** y **VFR ↔ VFR**: responsabilidad del **piloto**. El controlador da la **información de tránsito esencial** y establece las **secuencias** en el circuito.

Las **operaciones en pista** (despegue, aterrizaje, toma y despegue, aproximación baja…) las autoriza siempre el controlador de aeródromo.

> [!key] La separación mínima básica en un aeródromo es **la propia pista**: nunca dos aeronaves usando la pista a la vez sin cumplir los criterios siguientes.

## Separación en pista

![fig:pista|Cuándo se puede autorizar el despegue o el aterrizaje en la misma pista]

### Despegue – misma pista

(Siempre además de la estela turbulenta.) Se puede autorizar a despegar cuando:

- la aeronave que **acaba de aterrizar ha dejado la pista libre**; o
- la que **acaba de despegar ha cruzado el extremo de la pista**; o
- la que acaba de despegar **ha iniciado un viraje**.

### Despegue – pistas que se cruzan

Respecto a una **salida** previa: que haya **cruzado la intersección** o esté en el aire con un **viraje divergente** sin conflicto.
Respecto a un **aterrizaje** previo: que haya **dejado ambas pistas**, **cruzado la intersección**, o se haya **detenido fuera de la zona protegida** de la pista de despegue.

### Aterrizaje – misma pista

Una aeronave no cruza el umbral para aterrizar hasta que la **salida precedente** haya cruzado el extremo de pista o iniciado un viraje, o hasta que **todas las que acaban de aterrizar** hayan dejado la pista.

### Aterrizaje – pistas que se cruzan

Respecto a una **salida**: que haya cruzado la intersección o esté en el aire en viraje divergente. Respecto a un **aterrizaje**: que haya dejado ambas pistas, cruzado la intersección, o se haya detenido fuera de la zona protegida de la pista intersecante.

> [!key] **"Grado razonable de seguridad"**: se puede autorizar el despegue (o el aterrizaje) si se tiene certeza razonable de que la separación existirá **cuando la aeronave inicie el despegue** (o **cruce el umbral**). En aterrizajes sucesivos, no se autoriza al siguiente hasta que el anterior **haya aterrizado**.

### Pistas paralelas o casi paralelas

Modos posibles: **salidas independientes**; **semi-mixta** (una solo salidas, otra mixta); **mixta**; **segregada** (salidas en una, llegadas en la otra, independientes).

| Operación | Requisitos |
|---|---|
| **Salidas paralelas independientes** (ambas IFR) | Ejes separados **≥ 760 m** y derrotas que **divergen ≥ 15°** inmediatamente tras el despegue (hay SID diseñadas para ello; comprobar que se autoriza la correcta). |
| **Pistas segregadas** | Ejes **≥ 760 m** (−30 m por cada 150 m que la de llegada esté adelantada, +30 m si retrasada); la salida diverge **≥ 30°** de la frustrada adyacente; aproximaciones a la pista de llegada **solo ILS o visual**. |

> [!key] Si una llegada hace una aproximación que **no** es ILS ni visual, la operación deja de ser segregada: TWR espera a que tome antes de autorizar la salida, como si fuera **pista única**.

## Separación en salida

**El controlador de TWR es responsable de la separación en salida.** Aplica dos separaciones:

1. **Por estela turbulenta**: entre **todas** las salidas (IFR **y VFR**). Protege a la segunda aeronave.
2. **Entre salidas sucesivas**: **solo entre dos salidas IFR** consecutivas. Evita que la segunda alcance a la primera ya bajo APP.

### Estela turbulenta en salida (tiempo)

| Segunda (detrás de) | Primera | Pista completa | Desde intersección* |
|---|---|---|---|
| **Ligera** | Media | **2 min** | **3 min** |
| **Ligera** | Pesada | **2 min** | **3 min** |
| **Ligera** | Super | **3 min** | **4 min** |
| **Media** | Pesada | **2 min** | **3 min** |
| **Media** | Super | **3 min** | **4 min** |
| **Pesada** | Super | **2 min** | **3 min** |

\* Intersección **más adelantada** que la de la primera (también desde una paralela a menos de 760 m).

> [!key] Cómo deducirlo: si la segunda es de **igual o mayor** categoría → **no aplica** (salvo intersección). Si es **menor** → **2 min**, o **3 min si la primera es Super** (excepción: pesada tras Super = 2). Si la segunda sale de una **intersección más adelantada** → **+1 min**, y la wiki indica que esta regla **afecta también a pesada tras pesada** (no precisa el valor; consúltalo con tu formador).

![fig:estela-salida|Árbol de decisión de estela turbulenta en salida]

Se aplica cuando las dos aeronaves usan:

1. la **misma pista**;
2. **paralelas a menos de 760 m** (cuentan como pista única);
3. **pistas cruzadas**, si la trayectoria de la segunda cruza la de la primera a la misma altitud o **menos de 1 000 ft por debajo**;
4. **paralelas a 760 m o más**, con la misma condición de cruce.

> [!key] Una **toma y despegue** cuenta como **despegue desde intersección**. El tiempo de estela se cuenta **entre los momentos en que cada una deja de tocar la pista** (rotación/despegue de la primera → despegue de la segunda).

### Salidas IFR sucesivas

Categorías por **velocidad**:

| Categoría | Aeronaves |
|---|---|
| **Lenta** | Pistón y helicópteros |
| **Media** | Turbohélices |
| **Rápida** | Reactores |
| **Muy rápida** | Militares de alto rendimiento (cazas) |

En IVAO: si el aeródromo tiene **procedimiento local** publicado, se aplica ese; si no, la **tabla genérica**:

| Segunda | Primera | Tiempo | Distancia |
|---|---|---|---|
| Todas | **Muy rápida** | 2 min | 4 NM |
| Rápida | **Rápida** | 2 min | 4 NM |
| Media | **Rápida** | 1,5 min | 3 NM |
| Lenta | **Rápida** | 1,5 min | 2 NM |
| Rápida | **Media** | **SUJETA** | **SUJETA** |
| Media | **Media** | 2 min | 3 NM |
| Lenta | **Media** | 1,5 min | 2 NM |
| Rápida / Media / Lenta | **Lenta** | **SUJETA** | **SUJETA** |
| **Muy rápida** | Todas | **SUJETA** | **SUJETA** |

> [!key] Cuando la segunda es **más rápida** que la primera (o la primera es lenta, o la segunda es muy rápida), la salida queda **SUJETA**: hace falta coordinar con APP. Esta separación se aplica **aunque se intercale una llegada** entre las dos salidas.

- **No especificada** → coordinar cada salida con APP.
- **En tiempo**: TWR con APP radar por encima. Cuenta desde que la **primera inicia la carrera de despegue**.
- **En distancia**: si TWR tiene radar autorizado para ello. Cuenta desde el **umbral opuesto** (final de la pista en uso).
- Si se publican ambas, **TWR elige**. La lista por aeródromo está en la web de la división (Procedimientos → Separaciones).
- En **monoposición TWR+APP** no hay separación genérica: el mismo controlador asume ambas.

### Ejemplos resueltos

| Situación | Resultado |
|---|---|
| B737 IFR seguido de A320 IFR | Ambos medios (sin estela); ambos rápidos → **2 min / 4 NM** |
| Dos VFR | **Solo estela turbulenta** |
| B747 (pesado) y C172 VFR desde intersección | Si sale primero el B747: estela + intersección → **3 min**. Mejor: **C172 primero** y el B747 detrás sin separación. |
| B777 IFR seguido de AT72 IFR | Estela pesado→medio **2 min**; rápida→media **1,5 min / 3 NM** → aplicar la mayor: **2 min** |
| B757 IFR seguido de B737 IFR | B757 = pesado cuando va delante → estela 2 min; rápidas → 2 min / 4 NM → **2 min / 4 NM** |

> [!key] **Siempre se aplica la separación más restrictiva** de todas las que correspondan.

## Aeronave sujeta y suelta

TWR **no puede autorizar despegues IFR sin coordinación con APP**, porque al despegar entran en el espacio de APP. En la práctica, una **carta de acuerdo** deja la aprobación dada por defecto; en IVAO esa carta es la **tabla de salidas sucesivas**.

- **Sujeta**: IFR lista para despegar que **necesita la aprobación de APP**.
- **Suelta**: IFR lista para despegar que **ya tiene** la aprobación de APP.

> [!key] Tras una **aproximación frustrada**, la siguiente salida IFR queda **sujeta automáticamente**. Si **no hay APP** conectado, una salida sujeta según la tabla se considera **suelta a los 5 minutos**.

En la coordinación inicial TWR–APP se puede acordar:

1. **Todas sujetas**: TWR pide la suelta de cada una; una vez dada, despega sin aplicar la tabla de sucesivas (ya lo ha tenido en cuenta APP).
2. **Todas sueltas** salvo aviso: TWR despega según la tabla genérica o el procedimiento local; APP puede sujetarlas cuando quiera.
3. Cualquier otro esquema a discreción de APP.

**Procedimiento de suelta**: (1) TWR avisa a APP de que la aeronave está lista (chat, voz en Discord o BAY LIST de Aurora); (2) APP da la suelta estándar, una **suelta condicional** (otro ascenso inicial, que TWR debe reautorizar antes del despegue: "IBE123, enmiende autorización de salida, ascenso inicial altitud 4 000 pies") o todavía no la da; (3) TWR autoriza el despegue.

## Otras consideraciones

- **Toma y despegue**: se separa por estela como un **despegue desde intersección**: normalmente **3 min** desde que rota la primera hasta que lo hace la de la toma y despegue.
- **Umbral desplazado**: la normativa exige en algunos casos estela entre llegadas y salidas con umbral desplazado, pero en IVAO **no se evalúa** en los exámenes ADC de la división (llegada tras salida ni salida tras llegada).

## Separación en llegada

**El controlador de APP separa las llegadas IFR sucesivas** y se las entrega a TWR separadas hasta el ATZ (o distancia cercana desde la que TWR pueda separar visualmente). Aplica:

1. **Estela turbulenta** entre llegadas IFR.
2. **Separación entre llegadas sucesivas**, para que la segunda tenga tiempo mientras la primera libera la pista.

Si TWR ve que la separación no se va a cumplir puede: reducir a la segunda a **velocidad mínima de aproximación**, mandar a la segunda **motor y al aire**, o, si la primera va demasiado lenta, mandar a la **primera** al aire.

### Estela en llegada

| Segunda | Primera | Tiempo | Distancia |
|---|---|---|---|
| **Ligera** | Media | **3 min** | **5 NM** |
| **Ligera** | Pesada | **3 min** | **6 NM** |
| **Ligera** | Super | **4 min** | **8 NM** |
| **Media** | Pesada | **2 min** | **5 NM** |
| **Media** | Super | **3 min** | **7 NM** |
| **Pesada** | Pesada | No aplica | **4 NM** |
| **Pesada** | Super | No aplica | **6 NM** |

- **Distancia (NM)** si APP tiene **vigilancia radar**; **tiempo** si es control **convencional** (la web de la división lo indica por dependencia).
- Primera de **menor** categoría → no aplica. **Misma** categoría → no aplica, **salvo pesado tras pesado en distancia (4 NM)**.
- En tiempo, una **ligera** detrás lleva siempre **3 min**, o **4 min** si la primera es Super.

Se aplica si: ambas aproximan a la **misma pista**; a **paralelas a menos de 760 m**; una vuela **directamente detrás** de otra a la misma altitud o **menos de 1 000 ft por debajo**; o **cruza por detrás** en esas condiciones.

> [!key] **No** se da separación por estela a: (1) **VFR** que aterrizan en la misma pista detrás de una media o pesada; (2) **IFR en aproximación visual** que han notificado el precedente a la vista y han recibido instrucción de **seguirlo y mantener separación propia** (requiere coordinación TWR–APP). En ambos casos se transmite **"precaución estela turbulenta"** y el **piloto** es responsable. Así TWR puede intercalar VFR entre IFR.

### Separación entre llegadas sucesivas

La fija el **procedimiento local** de cada aeródromo (diseño de salidas rápidas, backtracks…). Ejemplos: **Bilbao 8 NM**; **Barcelona** según configuración: WRL con HIRO 3 NM, WRL sin HIRO 3,5 NM, ENR 4,5 NM, WLL 6,5 NM. TWR puede **pedir más separación** (p. ej. muchas salidas esperando).

| Situación | Resultado |
|---|---|
| Santiago (radar): B747 seguido de B737 | Estela 5 NM; local 6 NM (reducible a 3 con TWR) → **6 NM, reducible a 5 NM** coordinando con TWR |
| Santiago: A320 seguido de B767 | Sin estela → **6 NM, reducible a 3 NM** |
| Santiago: C172 VFR entre dos IFR | Sin estela para VFR: entra en final detrás de la primera con "**precaución estela turbulenta**" |
| Santander (convencional): B752 seguido de C172 IFR | Estela pesado→ligera **3 min** |
| A380 seguido de B737 en visual con separación propia | **Sin** mínimos: el piloto del B737 se separa |
