---
id: introduccion
num: 1
title: Introducción al control aéreo
icon: radar
wiki: https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc/chapter/introduccion-al-control-aereo
---

## Los Servicios de Navegación Aérea (SNA / ANS)

Para que la aviación funcione de forma segura y continua, 24 horas al día, alguien tiene que prestar una serie de servicios básicos a las aeronaves. A ese conjunto se le llama **Servicios de Navegación Aérea (SNA, en inglés ANS)**, y los prestan los **proveedores de servicios de navegación aérea (ANSP)**, que pueden ser empresas privadas o entidades estatales.

Los cuatro servicios fundamentales son:

| Sigla | Nombre | Qué hace |
|---|---|---|
| **ATS** | Air Traffic Services – Servicios de tránsito aéreo | Gestiona el tráfico en tiempo real: control, información y alerta. |
| **CNS** | Communications, Navigation and Surveillance | La parte técnica: radios, radioayudas, radares y su mantenimiento. |
| **MET** | Servicio meteorológico | Observaciones y previsiones (METAR, SPECI, TAF, SIGMET…). |
| **AIS** | Aeronautical Information Services | Publica la información aeronáutica: AIP, AIC, NOTAM, PIB. |

Además conviene conocer otros conceptos relacionados:

- **ATM** (Air Traffic Management, gestión del tránsito aéreo): el paraguas que engloba ATFCM, ASM y ATS.
- **SAR** (Search And Rescue): búsqueda y salvamento.
- **FPD** (Flight Procedures Design): diseño de procedimientos de vuelo.

![wiki:https://wiki.es.ivao.aero/uploads/images/gallery/2022-07/scaled-1680-/ZrXsna-y-atm.jpg|Relación entre los SNA y la ATM]

### ATS – Servicios de tránsito aéreo

Sus objetivos son cinco: evitar colisiones entre aeronaves; evitar colisiones entre aeronaves y obstáculos en el área de maniobras; acelerar y ordenar el flujo de tránsito; asesorar e informar para que los vuelos se desarrollen de forma segura y eficaz; y avisar y ayudar a los organismos de búsqueda y salvamento cuando una aeronave lo necesite. El **control de tránsito aéreo (ATC)** es uno de estos servicios ATS.

### CNS – Comunicaciones, Navegación y Vigilancia

Es la infraestructura técnica que da soporte a la navegación, con tres pilares:

- **Comunicaciones**: tierra-aire y tierra-tierra, tanto voz (radio piloto-controlador, telefonía entre dependencias) como datos (radar, planes de vuelo).
- **Navegación**: las radioayudas (VOR, NDB, DME, ILS…) y los sistemas por satélite que permiten a la aeronave saber dónde está.
- **Vigilancia**: lo que permite al controlador ver la posición de las aeronaves (radares, multilateración, ADS…).

Hay dos tipos de radar que conviene distinguir:

| | **PSR – Radar primario** | **SSR – Radar secundario** |
|---|---|---|
| Principio | Emite y recibe el eco reflejado en el blanco. | Interroga y la aeronave **responde con su transpondedor**. |
| ¿Necesita colaboración de la aeronave? | No | Sí |
| Qué obtiene | Solo posición. | Posición + código (modo A) + altitud/nivel (modo C) + datos adicionales como indicativo o IAS (modo S). |
| Uso | Detectar blancos no cooperativos y afinar la precisión. | Es el radar más usado hoy en ATC. |

### MET – Servicio meteorológico

Proporciona observaciones actualizadas y previsiones fiables. En España lo presta **AEMET**, con estaciones meteorológicas aeronáuticas, oficinas de aeródromo y de vigilancia, que generan METAR, SPECI, TAF, SIGMET, etc. A escala mundial lo complementan centros como los **WAFC** (pronóstico de área, Londres y Washington), **VAAC** (cenizas volcánicas), **TCAC** (ciclones tropicales) y los centros especializados en dispersión de material radiactivo.

### AIS – Servicio de información aeronáutica

Publica la información necesaria para operar con seguridad: el **AIP** (con sus enmiendas y suplementos), las **AIC**, los **NOTAM** y los boletines de información previa al vuelo (**PIB**). En España lo presta **ENAIRE**, que además ofrece herramientas digitales (Insignia, Insignia-VFR, AIP electrónico, ICARO) dentro del concepto **AIM** (gestión de la información aeronáutica).

### SAR y FPD

- **SAR**: servicio permanente que busca aeronaves siniestradas y a sus ocupantes. En España depende del Ejército del Aire y del Espacio, con tres **RCC** (centros de coordinación de salvamento): Madrid, Palma y Canarias.
- **FPD**: diseña, documenta, valida y revisa los procedimientos de vuelo (conjuntos de maniobras predeterminadas, IFR o VFR, publicados para los pilotos).

### ATM – Gestión del tránsito aéreo

- **ATFCM** (gestión de flujo y capacidad): equilibra la demanda con la capacidad de aeródromos y sectores, y asigna **SLOTs** que retrasan despegues en origen para no saturar un sector. En IVAO solo se usa en **grandes eventos**, con slots de salida reservados por adelantado.
- **ASM** (gestión del espacio aéreo): diseña sectores, áreas restringidas, prohibidas y peligrosas, rutas condicionales, etc. En IVAO lo llevan los departamentos ATC y de Operaciones Especiales.
- **ATS**: control, información y alerta (ver siguiente apartado).

## Servicios de tránsito aéreo (ATS)

Los ATS gestionan en tiempo real el tráfico en un aeródromo o en un volumen de espacio aéreo. Son tres:

| Servicio | Objetivo |
|---|---|
| **Control (ATC)** | Prevenir colisiones entre aeronaves y con obstáculos en el área de maniobras, y acelerar y ordenar el tráfico. |
| **Información de vuelo (FIS)** | Asesorar e informar para la marcha segura y eficaz de los vuelos. |
| **Alerta (ALRS)** | Avisar y ayudar a los organismos de búsqueda y salvamento. |

> [!key] Quien da control también da información y alerta. Y **cualquier** dependencia ATS (de control o de información) presta siempre servicio de alerta.

### Servicio de control (ATC)

El ATC **separa** a las aeronaves para garantizar la seguridad, y además ordena y agiliza el tráfico. Lo hace mediante **autorizaciones**, **instrucciones** e **información**. Según el entorno, hay tres tipos:

- **Control de aeródromo** (en IVAO, "Torre"): el aeródromo y su entorno cercano (ATZ o CTR). Puede repartirse en DEL (autorizaciones), GND (rodadura) y TWR (torre). Se presta desde una torre de control; hoy empiezan a implantarse las **torres remotas o digitales**, que controlan uno o varios aeródromos con cámaras desde otro lugar.
- **Control de aproximación**: el entorno de uno o varios aeródromos (CTR, CTA, TMA). Secuencia y separa llegadas, salidas y sobrevuelos a baja cota. Puede desdoblarse (aproximación, final, salidas…) y prestarse desde la torre, una oficina de aproximación o un centro de control (ACC/TACC). Puede ser **con vigilancia (radar)** o **por procedimientos**. Con poco tráfico, una sola persona puede llevar torre y aproximación ("monoposición").
- **Control de área**: el tráfico en ruta. En IVAO se identifica con el sufijo **_CTR**. Los sectores se agrupan o desdoblan según la demanda. Se presta desde un ACC.

### Servicio de información de vuelo (FIS)

Da a las tripulaciones, en tiempo real, información de tránsito que pueda afectarles, asesoramiento anticolisión a petición, meteorología, estado de radioayudas y aeropuertos, áreas especiales, etc. Al no ser control, **no da instrucciones ni autorizaciones** ni separa aeronaves. Algunos países tienen estaciones **FSS** con este papel.

Dos casos particulares que no hay que confundir:

| | **AFIS** | **ATIS** |
|---|---|---|
| Qué es | Servicio de información de vuelo de aeródromo, prestado por **personas** (AFISO). | Emisión **automática y continua** de información del aeródromo. |
| ¿Interactúa con pilotos? | Sí | No |
| Contenido | Tráfico en circuito y en tierra, meteorología, viento en cabeceras, estado de la pista… | METAR, pistas en uso, aproximaciones, radioayudas, rodaduras cerradas, frecuencias… |
| Separación | La mantienen los pilotos; el AFIS no autoriza ni instruye. | — |

### Servicio de alerta (ALRS)

Avisa a los organismos de búsqueda y salvamento y los apoya. Lo presta cualquiera que dé control o información. Tiene tres fases:

| Fase | Se activa cuando… |
|---|---|
| **INCERFA** (incertidumbre) | No hay comunicación con la aeronave en los **30 min** siguientes a cuando debía haberse recibido, o no llega en los **30 min** siguientes a su hora prevista (salvo que no haya dudas sobre su seguridad). Se empiezan a recabar datos de otras dependencias. |
| **ALERFA** (alerta) | a) Tras la incertidumbre siguen sin noticias; b) autorizada a aterrizar, no lo hace en los **5 min** siguientes a la hora prevista y no hay comunicación; c) informes de funcionamiento anormal, pero sin que sea probable un aterrizaje forzoso; d) sospecha o conocimiento de **interferencia ilícita**. Se avisa al centro de coordinación de salvamento. |
| **DETRESFA** (peligro) | a) Tras la alerta, todo sigue siendo infructuoso y se supone peligro; b) se considera agotado o insuficiente el combustible; c) funcionamiento anormal que hace probable un aterrizaje forzoso; d) aterrizaje forzoso inminente o ya producido. Notificación inmediata a salvamento. |

> [!ivao] En IVAO **no se simulan** las fases de alerta ni el aviso a salvamento: solo se atiende a las aeronaves que simulan urgencias o emergencias.

## La posición de Torre (TWR)

El controlador de aeródromo o local (TWR) presta servicio ATC en un área alrededor del aeródromo. Su trabajo central es **gestionar las pistas activas y el circuito de tránsito**. Si DEL y GND no existen o no están abiertas, TWR asume también sus funciones.

**TWR es responsable de**: despegues y aterrizajes en todas las pistas; toda operación en pista (alineación, cruce, backtrack…); el circuito de aeródromo; y la separación durante despegues y aterrizajes. En concreto se ocupa de las salidas desde el punto de espera (y los cruces de pista), de las **llegadas IFR establecidas en final** y del **tráfico VFR que entra en el CTR o en el circuito**.

> [!key] **TWR nunca es responsable de**: las llegadas IFR **antes** de establecerse en final; el tráfico IFR en ruta; las salidas IFR **por encima de 1000 ft AGL** tras el despegue; ni los VFR fuera del CTR o a más de **2 minutos** de entrar en él.

Su zona de responsabilidad es el **CTR**, que va desde la superficie hasta un límite superior publicado en las cartas.

### Tareas principales

**Elección de la pista activa.** La decide TWR, principalmente según el viento: se aterriza y despega con viento de cara. Si cambia, avisa a todos los controladores adyacentes y actualiza el ATIS.

**Alineación al final del rodaje.** TWR alinea en pista a las aeronaves que llegan al punto de espera cuando la situación lo permite. **No se puede autorizar a alinear** si:

- hay una llegada IFR establecida en final a menos de **5–6 NM**;
- se ha autorizado a aterrizar a cualquier aeronave, esté a la distancia que esté;
- se ha autorizado a despegar a una aeronave y la que se alinea tendría que cruzar su trayectoria desde otro punto de espera.

Para ganar tiempo se pueden alinear varias aeronaves a la vez en distintos puntos de espera de la misma pista.

**Rodaje entre pistas paralelas cercanas.** Las calles que unen dos pistas casi paralelas las lleva normalmente TWR: autoriza cada cruce o, si no puede, ordena mantener corto del punto de espera para evitar incursiones.

**Operaciones en pista.** TWR es responsable de alinear, backtrack, rodar por pista, cruzar y despegar. Solo autoriza a despegar con la pista y la trayectoria de ascenso inicial libres. **No se puede autorizar a despegar** si:

- hay una aeronave en la parte de pista utilizable para el despegue;
- una aeronave está cruzando esa parte de la pista;
- otra aeronave está despegando y aún no ha sobrevolado el final de pista ni se ha apartado del eje;
- ya hay una aeronave autorizada a aterrizar;
- ya hay otra aeronave en un punto de espera autorizada a despegar.

La pista puede usarse para rodar si ahorra tiempo sin afectar a los aterrizajes, y se instruye **backtrack** cuando el piloto necesita toda la longitud de pista. Los cruces de pistas no cerradas son de TWR; puede canalizarlos a través de GND (TWR autoriza a GND y GND lo transmite), aunque lo recomendable es tener al tráfico en frecuencia de TWR.

**Transferencia tras el despegue.** Salidas y frustradas se transfieren poco después del despegue a DEP, o si no está, a APP, o si no, a CTR (en ese orden). En la práctica **hacia 1000 ft AGL y pasado el umbral**, cuando el piloto ya está en una fase más cómoda. Nunca se espera al límite del espacio de TWR.

**Llegadas IFR.** TWR las recibe de APP ya establecidas en final y no debe llevar en su frecuencia **más de 3 llegadas IFR** en el eje de final. Mantiene la separación entre ellas y no debe dudar en dar **restricciones de velocidad**.

**Aterrizajes.** **No se puede autorizar a aterrizar** si: la pista está ocupada; una aeronave la está cruzando; otra está despegando y no ha pasado el final de pista o no ha despejado el eje; ya hay otra autorizada a aterrizar; o hay una aeronave en el punto de espera autorizada a despegar. La autorización se da **en cuanto la pista quede libre**, como en la realidad.

**Transferencia en tierra.** Con la pista libre, TWR pasa el tráfico a GND.

**VFR que entran y salen.** El controlador adyacente transfiere al VFR **2 minutos antes** de entrar en la zona; un VFR que viene de espacio no controlado debe llamar **entre 1 y 2 minutos antes**. Si sigue por espacio C o D, TWR lo transfiere 2 minutos antes de salir; si sigue por espacio no controlado o por debajo de una zona controlada, se le asigna código no controlado (**7000**) y se le invita a pasar a **UNICOM 122.800**. TWR debe informar si hay ATC que preste información y alerta por encima.

**Información de tránsito.** Debe ser **mutua** y darse de forma que el piloto tenga, o vaya a tener, el tráfico a la vista. Solo la **confirmación explícita** del piloto ("tránsito a la vista") garantiza que sirve para separarse.

**Integración en el circuito VFR.** Todo VFR que llega se integra en el circuito. Opciones (de más larga a más directa):

1. Por **barlovento (viento en cara)**, cruzando sobre el aeródromo al menos **500 ft por encima** de la altitud del circuito.
2. En el **tramo de viento en cola** (al principio o a mitad).
3. **Semidirecta en base**.
4. **Directa a final** (final larga) si el rumbo de llegada difiere menos de **30°** del de la pista.

Se elige según lo que facilite la trayectoria al piloto, el orden del resto del circuito y la convivencia con llegadas y salidas IFR. No hay receta: cuentan la experiencia y el sentido común.

![fig:circuito|Circuito de tránsito de aeródromo y formas de integración]

### Otras tareas

**Tránsito VFR.** TWR presta ATC a todos los VFR en tránsito sobre aeródromos de clase **C y D**; en clase **E** solo si el piloto lo pide. Emite una autorización de tránsito, pide notificar el punto de salida y puede indicar rutas publicadas o no, altitud y zonas de entrenamiento. Durante todo el tránsito da información de tránsito y alerta.

**Motor y al aire (go-around).** El piloto puede frustrar en cualquier momento (aproximación no estabilizada, pista ocupada, cizalladura, pérdida de referencias…) y la decisión es solo suya. Tras la notificación se recomienda dar instrucciones de ascenso inicial coordinadas con APP/DEP antes de transferirlo. Si una aeronave llega a unas **2 NM** del umbral y la pista no está libre, **TWR debe ordenar el motor y al aire** (si el piloto no lo ha hecho ya).

### Procedimientos especiales de IVAO

Son **obligatorios**, porque cubren situaciones propias de la red:

- **Fichas de progresión (strips)**: TWR comprueba que estén bien rellenas, sobre todo la SID ("Cleared WP") y el nivel ("Cleared FL"). Si el piloto se desconecta, TWR rellena la ficha antes de transferir.
- **Liberación a UNICOM**: sin DEP ni APP, TWR transfiere al CTR si está, o libera al piloto a **UNICOM 122.800** al pasar de **1000 ft**.
- **Zona no controlada**: a una aeronave que se acerca sin haber llamado se le puede enviar un **FORCE ACT** 2–3 minutos antes de entrar, tras asignarle código de transpondedor.
- **Pilotos que no responden**: si despega sin autorización o se conecta en pista activa sin contactar, se le envía un FORCE ACT. Si no responde, no sintoniza el ATIS en **1 minuto** o sigue moviéndose, se repite el FORCE ACT con un chat privado (con educación), se avisa a los demás controladores y, si sigue sin respuesta, se llama a un supervisor con `.WALLOP <motivo en inglés>`.
- **Aproximación IFR**: no se usa FORCE ACT con aeronaves en aproximación IFR fuera del eje de final; sí con un piloto a menos de **12 NM** que esté en UNICOM.
- **Transpondedor**: modo **TX al entrar en pista activa** y **STANDBY al desalojarla**. Se tolera ponerlo en TX en el punto de espera y en STANDBY nada más aterrizar.
