# Drift effect - matematicka logika

Zdroj v kodu:

- `js/workstation/effects/drift/DriftEngine.js`
- `js/workstation/effects/drift/driftPanel.js`
- `js/workstation/controls/bindDriftControls.js`
- `js/workstation/controls/bindTransport.js`

## Co efekt dela

Drift je predevsim barevny morph. Nehybe pixely v prostoru, ale meni jejich barevny vzhled v case. Efekt jede po casove ose `progress` od `0` do `1`, a podle toho plynule prechazi mezi nekolika ulozenymi barevnymi looky.

Kazdy pixel se zpracuje samostatne:

1. vezme se puvodni RGB,
2. aplikuje se jas,
3. otoci se hue/barva pres matici,
4. upravi se jednotlive RGB kanaly,
5. upravi se kontrast,
6. upravi se saturace,
7. aplikuje se gamma,
8. vysledek se primicha zpet k originalu podle `Smooth`,
9. pres cely obraz se jeste polozi barva z palety v rezimu `overlay`.

## Casova osa

Transport meni hodnotu:

```txt
progress += speed * deltaTime * 60
```

Kdyz `progress > 1`, vrati se na `0`.

Slider `Speed` ma rozsah:

```txt
0.001 az 0.02
```

Drift pouziva `progress` k vyberu mezi ctyrmi keyframy.

## Keyframy looku

Efekt ma pole `KEYS`. Kazdy keyframe obsahuje:

```txt
b      brightness multiplier
c      contrast
s      saturation
h      hue rotation, degrees
r      red channel gain
g      green channel gain
b2     blue channel gain
gamma  gamma correction
```

Aktualni look se pocita interpolaci mezi sousednimi keyframy:

```txt
scaled = progress * (pocetKeyframu - 1)
index  = floor(scaled)
mixRaw = scaled - index
mix    = ease(mixRaw)
```

Ease funkce:

```txt
ease(t) = t * t * (3 - 2 * t)
```

Kazda hodnota looku potom:

```txt
value = A * (1 - mix) + B * mix
```

## Smooth

Slider `Smooth` ma rozsah:

```txt
1 az 5
```

V kodu ale funguje opacne nez by nazev mohl znit: cim vyssi `Smooth`, tim slabsi efekt.

```txt
effectAmount = lerp(1.0, 0.25, (smooth - 1) / 4)
```

Tedy:

```txt
Smooth = 1 => efekt jede na 100 %
Smooth = 5 => efekt jede na 25 %
```

Na konci se upraveny pixel micha s originalem:

```txt
final = original * (1 - effectAmount) + processed * effectAmount
```

## Hue Bias

Slider `Hue Bias` ma rozsah:

```txt
-180 az 180 stupnu
```

Finalni hue rotace:

```txt
finalHue = look.h + hueBias
rad = finalHue * PI / 180
```

Pak se pouzije barevna rotacni matice:

```txt
nr =
  (.299 + .701*cos + .168*sin) * r +
  (.587 - .587*cos + .330*sin) * g +
  (.114 - .114*cos - .497*sin) * b

ng =
  (.299 - .299*cos - .328*sin) * r +
  (.587 + .413*cos + .035*sin) * g +
  (.114 - .114*cos + .292*sin) * b

nb =
  (.299 - .300*cos + 1.250*sin) * r +
  (.587 - .588*cos - 1.050*sin) * g +
  (.114 + .886*cos - .203*sin) * b
```

## Kanalove gainy a kontrast

Po hue rotaci se upravi kanaly a kontrast:

```txt
r = (nr * look.r  - 128) * look.c + 128
g = (ng * look.g  - 128) * look.c + 128
b = (nb * look.b2 - 128) * look.c + 128
```

`128` je stred. Kontrast tedy roztahuje nebo stahuje hodnoty kolem stredni sede.

## Saturace

Nejdriv se spocita seda:

```txt
gray = (r + g + b) / 3
```

Potom se kazdy kanal vzdali nebo priblizi k sede:

```txt
r = gray + (r - gray) * look.s
g = gray + (g - gray) * look.s
b = gray + (b - gray) * look.s
```

Kdyz `look.s > 1`, barvy jsou sytejsi.
Kdyz `look.s < 1`, barvy jsou bliz sede.

## Gamma

Gamma cast:

```txt
r = 255 * pow(clamp(r / 255, 0, 1), 1 / look.gamma)
g = 255 * pow(clamp(g / 255, 0, 1), 1 / look.gamma)
b = 255 * pow(clamp(b / 255, 0, 1), 1 / look.gamma)
```

## Paleta

Po zpracovani pixelu se obraz vykresli do docasneho bufferu a pres nej se polozi `paletteColor`:

```txt
globalCompositeOperation = "overlay"
fillStyle = paletteColor
fillRect(0, 0, width, height)
```

To znamena: paleta neni obycejne prebarveni pixelu, ale overlay blend pres hotovy drift look.

## Dulezite poznamky

- Drift je aktualne barevny efekt, ne prostorovy displacement.
- `progress` pouziva jen Drift, FM ho zatim ignoruje.
- `Smooth` je ve skutecnosti spise sila efektu obracene: nizsi hodnota = silnejsi Drift.
- `Speed` se uklada i do `drift.state.speed`, ale skutecnou animaci bere `bindTransport.js` primo ze slideru `#speed`.
- Paleta ovlivnuje efekt az na konci pres canvas `overlay`.
