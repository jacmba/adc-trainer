---
id: altimetria
num: 6
title: Altimetría
icon: gauge
wiki: https://wiki.es.ivao.aero/books/controlador-de-aerodromo-adc/chapter/altimetria
---

## Unidades y atmósfera ISA

La posición vertical tiene que medirse de forma precisa y común para separar a las aeronaves **del terreno** y **entre sí**.

- Unidades verticales: **pies (ft)**, la más extendida (1 m = 3,28 ft); metros en algunos países de Europa del Este y Asia.
- Presión: **hectopascales (hPa) = milibares (mb)**; pulgadas de mercurio en parte de América (**1013,25 hPa = 29,92 inHg**).

Todos los instrumentos de presión están calibrados según la **atmósfera estándar ISA**; cualquier diferencia real respecto a ella introduce errores en el altímetro.

| Parámetro ISA | Valor |
|---|---|
| Presión a nivel del mar | **1013,25 hPa** |
| Gradiente de presión (cerca del suelo) | **1 hPa ≈ 27 ft** (no lineal) |
| Temperatura a nivel del mar | **15 °C** |
| Gradiente de temperatura | −1,98 °C por cada 1 000 ft hasta −56,5 °C (luego constante) |

### El altímetro barométrico

Compara la presión estática exterior (tomas estáticas) con la presión que el piloto cala en la **ventanilla de Kollsman**, y muestra la diferencia en pies. Si se cala la presión a nivel del mar, indica distancia al nivel del mar; si se cala otra, indica distancia respecto a esa superficie de presión. En los analógicos: aguja corta = miles, larga = cientos, fina = decenas de miles (y una bandera rayada bajo 10 000 ft en algunos).

## Terminología

| Término | Distancia vertical medida desde… |
|---|---|
| **Altitud** (altitude) | El **nivel medio del mar (MSL)** |
| **Altura** (height) | Una **referencia concreta** (aeródromo, umbral, terreno…) |
| **Elevación** (elevation) | Del MSL a un **punto del terreno** (aeródromo, umbral) |
| **Nivel de vuelo** (FL) | La superficie de presión **1013,25 hPa**, en cientos de pies (6 500 ft → FL65) |
| **Nivel** (level) | Término **genérico**: cualquiera de los anteriores |

## Códigos Q

| Código | Qué es | Con él calado, el altímetro indica… | En tierra marca… | Uso |
|---|---|---|---|---|
| **QFE** | Presión **en el aeródromo** | **Altura** sobre el aeródromo | **0 ft** | Rara vez; **no se usa en España**. MET lo usa para calcular el QNH. |
| **QNH** | Presión del aeródromo **reducida al nivel del mar** | **Altitud** | La **elevación** del aeródromo | Cerca del terreno: despegue, ascenso inicial, aproximación |
| **QNE / SPS** | Presión estándar **1013,25 hPa** | **Nivel de vuelo** (altitud de presión) | — | En ruta, para que todos usen la misma referencia |

Ejemplo: aeródromo a **540 ft** con QFE **990 hPa** → 540 / 27 = 20 hPa → **QNH ≈ 1010 hPa**.

> [!key] Un QNH erróneo puede hacer perder la separación con el terreno. El ATC debe asegurarse de que el QNH se **colaciona** bien; el error típico es **confundir las decenas** (1014 ↔ 1004).

## Altitud, nivel y capa de transición

![fig:transicion|Altitud de transición, capa de transición y nivel de transición]

| Concepto | Definición | Cómo se fija |
|---|---|---|
| **Altitud de transición (TA)** | Altitud **a la cual o por debajo** se vuela con **QNH** (posición en **altitud**). | **Fija**, mínimo 3 000 ft, publicada en el AIP. |
| **Nivel de transición (TL/TRL)** | Nivel **al cual o por encima** se vuela con **1013** (posición en **FL**). Es el nivel de vuelo más bajo utilizable. | **Variable con el QNH**, en pasos de medio nivel (5 hectopies). Lo fija el controlador y lo difunde por ATIS o voz. |
| **Capa de transición** | Espacio entre TA y TL. | Lo más fina posible pero **al menos 1 000 ft**, ajustando el TL. |

**TA en España**: **6 000 ft** en general, salvo **TMA de Madrid y Málaga: 13 000 ft**, **Granada: 7 000 ft**, **Andorra-La Seu d'Urgell: 8 000 ft**.

¿Por qué cambia el TL? Con **QNH bajo**, la superficie de 1013 está *por encima* del nivel del mar, así que un FL dado queda más bajo en altitud real y la capa se estrecha: hay que **subir** el TL. Con **QNH alto** ocurre lo contrario y se puede **bajar** el TL. Ejemplos de la wiki con TA 6 000 ft: con QNH bajo el TL correcto era FL75; con QNH alto, FL65.

### Tabla SOP de nivel de transición (IVAO España)

| QNH (hPa) | 942–959 | 960–977 | 978–995 | 996–1013 | 1014–1031 | 1032–1050 |
|---|---|---|---|---|---|---|
| **TA 6 000 ft** (general) | FL90 | FL85 | FL80 | **FL75** | **FL70** | FL65 |
| **TA 8 000 ft** (La Seu d'Urgell) | FL110 | FL105 | FL100 | FL95 | FL90 | FL85 |
| **TA 13 000 ft** (TMA Madrid, LEMG, LEGR) | FL160 | FL155 | FL150 | FL145 | FL140 | FL135 |

> [!key] Truco: con TA 6 000 ft, el TL es **FL75 entre 996 y 1013** y **FL70 entre 1014 y 1031**. Cada tramo de 18 hPa hacia abajo suma 5 al TL y cada tramo hacia arriba resta 5. Para TA 8 000 suma 20 a la fila de 6 000; para TA 13 000 suma 70.

## Procedimientos de reglaje de altímetro

- **En tierra**: QNH local.
- **Ascenso**: de QNH a 1013 **al cruzar la TA**.
- **Descenso**: de 1013 a QNH **al cruzar el TL**.
- **Atravesando la capa de transición**: en **ascenso** se notifica en **nivel de vuelo**; en **descenso**, en **altitud**.
- **Volando dentro de la capa** (no recomendable): en altitud si no se ha pasado el TL subiendo; en FL si no se ha abandonado la TA bajando.

> [!key] **Flexibilidad europea (también en España)**: se puede pasar a **1013 antes** de la TA si se está a más de **3 000 ft AAL** y se ha sido **autorizado a subir a un nivel de vuelo**; y se puede pasar a **QNH antes** del TL si se ha sido **autorizado a descender a una altitud**. Si luego se nivela, se vuelve a calar según la posición respecto a TA y TL.
