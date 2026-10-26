---
id: gestion-transito
num: 9
title: Gestión del tránsito en aeródromo
icon: tower
wiki: https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc/chapter/gestion-de-transito-en-aerodromo-teorico
---

## Procedimientos en tierra

### Definiciones

| Término | Qué incluye |
|---|---|
| **Área de maniobras** | Pistas + calles de rodaje (**sin plataformas**) |
| **Área de movimiento** | Área de maniobras **+ plataformas** |
| **EOBT** | Hora prevista de fuera calzos (empezar a moverse). No confundir con **CTOT** (hora calculada de despegue, slot). |

Los vehículos en **plataforma** no dependen del ATC; para entrar en el **área de maniobras** necesitan autorización.

### Puesta en marcha

Requiere aprobación del controlador:

- Aeronaves que pueden arrancar con GPU o APU y cuya puesta en marcha **afecta al área de movimiento**.
- **Todos los helicópteros** (la estela de los rotores es peligrosa para quien ruede cerca).

Exentos: **VFR ligeros de pistón** con influencia limitada (C172, PA28…). Se aprueba cuando la aeronave va a empezar a rodar al terminar (o la tripulación lo necesita para pruebas); se evita si la **EOBT** aún está lejos.

> [!key] **Chorro de reactor (jet blast)**: no aprobar la puesta en marcha de un reactor si un ligero o un helicóptero va a pasar **por detrás** de él.

### Retroceso (pushback)

La aeronave es empujada hacia atrás por un tractor cuando no tiene espacio para salir por sus medios (no suele hacer falta en puestos remotos ni para ligeros). Lo **aprueba** el ATC ("retroceso aprobado", **nunca "autorizado"**). Comprobar que nadie rueda o está autorizado a rodar por detrás sin haber dado un "ceda el paso".

### Rodaje, backtrack y puntos de espera

- **Rodaje**: el ATC indica las calles **en orden**. Una pista puede usarse para rodar si TWR lo instruye, y **cruzar una pista requiere autorización siempre, aunque no esté en uso**. Los helicópteros sin ruedas pueden hacer **rodaje aéreo**.
- **Backtrack**: entrar en la pista en uso y rodar por ella hasta la cabecera para despegar (cuando no hay calle paralela). Diferencia con rodar por pista: el backtrack termina en salida inmediata.
- **Punto de espera**: posición señalizada justo antes de la pista. **Ninguna parte** de la aeronave puede rebasar la barra de parada sin autorización. Una aeronave que aterriza ha **librado la pista cuando toda ella ha rebasado el punto de espera**. Puede haber puntos de espera intermedios en intersecciones.
- **Apartadero (holding bay)**: zona para detener temporalmente aeronaves (pruebas de motor, dejar pasar).
- **Zona de viraje (turn pad)**: ayuda a girar 180° al final del backtrack; **forma parte de la pista**, no sirve para esperar mientras otro despega o aterriza.

### Despegue y aterrizaje

- Despegue desde cabecera o **intersección**, siempre que se conozcan sus **distancias declaradas reducidas (TORA, TODA, ASDA)**. En pistas **FATO** los helicópteros pueden despegar desde cualquier punto.
- La salida desde intersección se puede dar **a petición del piloto** o **a propuesta del ATC con consentimiento del piloto**.
- **Despegue abortado**: el piloto lo notifica y libra; ATC da instrucciones y pregunta intenciones.
- Tras aterrizar se le dan instrucciones de rodaje al parking; un helicóptero puede ser autorizado a tomar en plataforma.

## Rodadura (GND)

GND gestiona todo el movimiento en superficie **excepto las pistas en uso** (que son de TWR): calles de rodaje, pistas inactivas, puntos de espera, algunas plataformas. Su secuenciación condiciona la eficiencia y seguridad de las salidas. Necesita sector file y cartas de rodaje actualizadas, y dominar la fraseología.

### Pushback

- Si no hay APU, la tripulación puede pedir **arranque cruzado** (un motor con equipo de tierra, retroceso, y el resto con el primero acelerado): hace falta más separación por detrás y más tiempo.
- Factores: meteorología (hielo, arena…), pista activa, ruta de rodaje, atenuación de ruido, aeronaves y personal cercanos.
- Referencias útiles: "retroceso aprobado **aproando al este**", "… precaución B747 a sus 4 completando retroceso", "… hacia la pista 35", "… en Delta".
- Retrocesos **múltiples** solo si las aeronaves se tienen a la vista y no se bloquean; recordar que **los pilotos no ven lo que tienen detrás**.

### Instrucciones de rodaje

- Incluir **siempre el número de pista** y, en aeródromos complejos, la ruta. **Máximo recomendado: 3 calles** en una instrucción.
- Evitar que dos aeronaves coincidan en la misma intersección a la vez: a una se le ordena **mantener corto** o **ceder el paso** (cuando tenga a la otra a la vista).
- La **información de tránsito en rodadura es obligatoria**: "precaución con…", "siga a…", "ceda el paso a…", "mantenga corto de…".
- Llegadas: localizar a la aeronave y despejar rápido las salidas de pista.

### Rodaje por pista y cruces

- Rodar por una pista en uso lo autoriza **TWR**: GND transfiere al tráfico a TWR antes (salvo coordinación previa).
- **Pista cerrada**: GND puede gestionar el cruce.
- **Pista activa**: GND hace mantener corto y transfiere a TWR; TWR autoriza el cruce y pide "pista libre"; luego devuelve a GND.

> [!key] Lo recomendado para evitar incursiones: que **quien cruza una pista activa esté en frecuencia de TWR** y que sea TWR quien autorice el cruce.

### Selección del punto de espera

- Por seguridad, se despega usando **toda la pista**; el piloto puede pedir una **intersección** (ahorrar rodaje o tiempo) y es él quien decide si le basta.
- El controlador puede **proponer** una intersección informando de la **TORA**; **no puede imponerla** salvo por seguridad, y **nunca** se autoriza sin conocer la TORA desde ella.
- Los ligeros/VFR pueden usar puntos intermedios para no mezclarlos con los IFR.
- En grandes aeropuertos se crean secuencias por estela (pesados a la cabecera, medios a la intersección anterior) para que TWR optimice.

### Transferencias GND ↔ TWR

- **Salidas**: a TWR **al acercarse al punto de espera**.
- **Llegadas**: de TWR a GND **cuando han abandonado la pista** (o se prevé que lo harán sin bloquearla).
- No hay que esperar a que la aeronave se detenga para transferirla.

## Gestión del CTR / ATZ

- **ATZ**: protege los circuitos y el aeródromo; bajo la responsabilidad de TWR.
- **CTR**: protege las aproximaciones y salidas IFR; de TWR o APP según el caso. Empieza en el suelo.

El ejemplo típico: CTR desde la superficie hasta 2 000 ft y al menos 5 NM de radio, circuito por la derecha de la pista 36 a 1 000 ft, puntos de entrada/salida **W, N, S** y un punto de tránsito **WA**.

![fig:ctr|CTR de ejemplo con puntos VFR y circuito]

En clase C, D o E (para VFR) la separación VFR corre a cargo de las tripulaciones con la información e instrucciones del ATC. Los VFR deben mantenerse siempre fuera de nubes.

### IFR en el CTR

El IFR llega **establecido en final** (los puntos VFR no le aplican). TWR da: autorización de aterrizaje o despegue, motor y al aire, "continúe aproximación" como número 2, y restricciones de velocidad (coordinadas con APP).

> [!key] Si, ya autorizado un aterrizaje, TWR sabe de una **incursión** u **obstrucción** en la pista, debe ordenar **motor y al aire**.

### VFR en tránsito

- Contacta **2 minutos antes** del punto de entrada; TWR le da la ruta (puntos, altitud) y le pide notificar.
  > FGJNG, tránsito W, WA, sobre el campo y S, altitud 2 000 pies, notifique WA.
- Puede pedir cruzar **fuera de los puntos publicados**: TWR decide según meteorología (SVFR), noche, tráfico en el CTR y en el circuito.
- **Dos VFR en tránsito**: información de tránsito **a ambos**; cada piloto se separa (rumbo, altitud, visual).
- **VFR en tránsito y VFR en circuito**: imponer al de tránsito una altitud **por encima del circuito** (idealmente **500–1 000 ft** de diferencia) e información a ambos. Los tránsitos no deben sobrevolar la pista a baja altura.
- **VFR en tránsito e IFR en final**: altitud por encima del circuito, evitar que cruce el eje a baja altura, información mutua. **Prever una frustrada**: acelerar el cruce del eje o mantener al VFR apartado hasta que tenga el IFR a la vista y cruce detrás o tras el aterrizaje. (En clase **C** es el ATC quien separa IFR y VFR.)

### Llegadas VFR

Entran por un punto publicado, ruta o directo, llamando 2 minutos antes. Integración:

- **Por defecto**: al principio o a mitad del **viento en cola**.
- **Alternativa**: en **base** si acorta.
- **Última**: **directa a final** si viene dentro de **±30°** del eje.

> [!key] Las aeronaves **ya en el circuito tienen prioridad** sobre las que entran. El circuito se considera **lleno con 4 aeronaves**.

Si está lleno: **órbita (360°) sobre un punto VFR** ("orbite por la derecha sobre WA"), con altitud y tiempo previsto si hace falta. Con varias llegadas, se integran por orden y todas reciben información de tránsito.

Al autorizar a base, la aeronave girará a final al terminar la base.

### Salidas VFR

Lo clásico es salir por un **punto de notificación**: "abandone el CTR por NW3, viento…, pista 27 autorizado a despegar". También por rutas publicadas (obligatorias a veces de noche, en SVFR, por ruido o por IFR) o con un rumbo ("continúe rumbo de pista…", "al noreste"). Pasado el punto, en E, F o G pueden seguir sin servicio ATC o pedir FIS. Salir por **arriba** del CTR exige coordinación con la unidad radar adyacente.

## Gestión del control de Torre

TWR evita colisiones entre: aeronaves en su zona (incluido el circuito), aeronaves en el área de maniobras (si no hay GND), aeronaves aterrizando y despegando, y vehículos en el área de maniobras ("Follow-me" en IVAO). Vigila continuamente las operaciones; en la realidad es visual con apoyo radar, en IVAO al revés (radar, con visual opcional).

### Elección de la pista en uso

Normalmente se despega y aterriza **con viento de cara**, salvo que la seguridad, la configuración, la meteorología, las aproximaciones disponibles o el tráfico aconsejen otra. Factores: viento en superficie, circuito, longitud, ayudas a la aproximación, atenuación de ruido. Analizar el **TAF** para no cambiar de configuración durante la sesión. Con viento flojo (**< 6 kt**, a veces hasta 8–10) pesan más otros factores: aproximación de precisión, restricciones meteorológicas, ruido, restricciones nocturnas.

- Si una tripulación pide otra pista, **la seguridad prevalece sobre el ruido**.
- TWR puede autorizar en cualquier pista no cerrada o en sentido contrario manteniendo la separación.
- Al cambiar de pista: avisar a adyacentes y **actualizar el ATIS**.

**El ruido no decide la pista** cuando: la superficie está contaminada (nieve, agua, hielo…); aterrizaje IMC con techo **< 500 ft** o visibilidad **< 1 900 m**; aproximación con mínimos > 300 ft y techo **< 800 ft** o visibilidad **< 3 000 m**; despegue con visibilidad **< 1 900 m**; windshear o tormentas; **viento cruzado > 15 kt** o **de cola > 5 kt** (con rachas). Además, una pista no se elige por ruido para aterrizar si no tiene ILS o indicador visual de pendiente.

> [!ivao] Los **fallos de radioayudas no se simulan** en IVAO.

### Salidas

- La autorización de salida especifica, si hace falta para separar: dirección de despegue y viraje, rumbo o pista hasta retomar la derrota, nivel a mantener, cuándo/dónde cambiar de nivel, otras maniobras. Con SID publicada, normalmente se autoriza la SID.
- Con SID acordadas, TWR **no necesita coordinar** cada salida; solo si se cambia la autorización estándar. APP debe conocer el **orden de salidas y la pista**.
- **Posiciones designadas** donde se dan autorizaciones (sin esperar a que llamen): plataforma lista para moverse; punto de espera; alineada en pista; desde mitad del viento en cola hasta final; en pista tras aterrizar; al salir de la última calle de rodaje.
- **Secuencia**: normalmente por orden de "listo", pero se puede alterar para **el máximo de salidas con el mínimo retraso medio**, teniendo en cuenta tipo y performance, ruta tras el despegue, intervalos, estela, slots y tipo de vuelo.
- No se emite el despegue hasta que la **autorización de salida** se haya transmitido y colacionado. El despegue incluye el **designador de pista**.

**Despegue inmediato**: en el punto de espera, entrar y despegar **sin detenerse** (si no puede, declinar); ya alineado, despegar sin demora. Al alinear con esa intención: "alinee y mantenga, **preparado para salida inmediata**".

### Llegadas

- APP crea la secuencia; **TWR mantiene la separación hasta el umbral**. La autorización de aterrizaje incluye la pista.
- Para agilizar se puede pedir: mantener corto de una intersección tras aterrizar; aterrizar **más allá de la zona de toma** (p. ej. un VFR en pista larga); salir por una calle concreta; acelerar el abandono.

> [!key] **Nunca** se pide a una aeronave **pesada** que aterrice más allá de la zona de toma de contacto.

### Circuito, prioridades y otros

- En el circuito se mantiene separación suficiente, salvo dentro de una **formación**, aeronaves en zonas o pistas diferentes aptas para operaciones simultáneas, y operaciones especiales de IVAO.
- La entrada al circuito se autoriza según el tráfico, en cualquier tramo. Un IFR en aproximación instrumental aterriza **directo** salvo circling.
- **Aeronave que sigue en pista**: si no se puede ver que ha salido, se le pide notificar **pista libre**, que se da cuando **toda la aeronave ha rebasado la barra de parada**.
- **LVP**: las inicia TWR y avisa a APP cuando empiezan y terminan las operaciones CAT II/III.

### Separación reducida en la misma pista

Solo si está **publicada en procedimientos locales** de la división. **Nunca entre una salida y una llegada.** Condiciones: estela siempre; visibilidad **≥ 5 000 m**; techo **≥ 1 000 ft**; cola **≤ 5 kt**; radar disponible; información de tránsito a la siguiente; frenado no afectado.

| Categoría | Aeronaves |
|---|---|
| **1** | Monomotor de hélice, MTOW **≤ 2 000 kg** |
| **2** | Monomotor de hélice de 2 000–7 000 kg, o bimotor de hélice < 7 000 kg |
| **3** | Resto |

| Precedente | Distancia mínima recorrida (aterrizada en movimiento sin backtrack, o en el aire) |
|---|---|
| Cat. 1 o 2, siguiente cat. 1 | **600 m** |
| Cat. 1 o 2, siguiente cat. 2 | **1 500 m** |
| Cat. 3 (cualquier siguiente) | **2 400 m** |

(Para salidas, la distancia se mide desde la posición de la aeronave que despega a continuación.)

### Suspensión del VFR

Cualquier controlador de aeródromo puede suspender el VFR por seguridad, y **debe** hacerlo si no hay VMC. Entonces: retener salidas VFR; hacer volver a los VFR locales o aprobar SVFR; avisar a APP/ACC; informar del motivo. Los **SVFR** (con aprobación de APP) se pueden autorizar para entrar a aterrizar, despegar y salir, cruzar u operar localmente en el CTR, **uno a uno**, y no se vectorizan salvo emergencia.

### Información de tránsito esencial

Se transmite sin demora: es cualquier aeronave o vehículo en o cerca de la pista a usar, o en la zona de despegue y ascenso o de aproximación final, que suponga riesgo de colisión.

### Uso del radar en torre

Vigilar la trayectoria en final y en las proximidades, establecer la separación entre salidas sucesivas y ayudar a la navegación de los VFR.

## Gestión del tráfico VFR

- Entrada y salida de la zona: como en el apartado de la posición TWR (2 min, 1–2 min desde no controlado, **7000** y **UNICOM 122.800** al salir a espacio no controlado).
- **Para TWR, el VFR es la parte más difícil**: información de tránsito mutua y confirmación de "a la vista".
- Tras la información, el controlador asigna el **orden de aterrizaje** (número 1, 2, 3…) y el piloto se ajusta.

### Soluciones cuando el circuito se complica

| Técnica | Útil cuando… | Cuidado con… |
|---|---|---|
| **Alargar el viento en cola** | El VFR nº 2 debe pasar por detrás de un IFR en final | Que no pierda el aeródromo de vista, salga del CTR o sobrevuele zonas urbanas bajo |
| **Órbitas de 360° en viento en cola** | CTR pequeño o circuito corto donde no se puede alargar | Viento cruzado fuerte, bucles repetidos que acercan a la pista |
| **Orbitar sobre un punto VFR** | Circuito muy cargado y varios IFR | Hay que resecuenciar; información de tránsito obligatoria en el punto; asignar altitudes |
| **Retener tomas y despegues** y priorizar tomas finales | Más de 4 en el circuito | — |
| **Vuelo local temporal o desvío** | Casos extremos, tras mucha espera | Último recurso |

**Tránsito VFR**: servicio ATC a todos en clase **C y D**; en **E** solo si lo pide. Autorización de tránsito, punto de salida a notificar, información de tránsito y alerta durante todo el tránsito.

## Gestión del tráfico IFR

La gestión IFR de la torre se apoya en el tema de **separaciones**: estela, salidas sucesivas, sujeta/suelta y separación en llegada.
