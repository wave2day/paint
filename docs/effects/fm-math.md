# FM effect - matematicka logika

Zdroj v kodu:

- `js/workstation/effects/fm/FM.js`
- `js/workstation/effects/fm/fmPanel.js`
- `js/workstation/effects/fm/fmState.js`
- `js/workstation/controls/bindFMControls.js`
- `js/workstation/controls/bindKnobs.js`

## Co efekt dela

FM efekt vytvari cernobile nebo magentove pruhy podle sinusove vlny. Jas puvodniho pixelu moduluje fazi te sinusovky, proto se obraz meni na vlnovou / scanline / frekvencni strukturu.

Na rozdil od Driftu FM nepouziva `progress`, takze aktualne neni sam od sebe casove animovany. Meni se hlavne podle knobu a slideru.

Kazdy pixel se zpracuje samostatne:

1. vezme se puvodni RGB,
2. spocita se jas pixelu,
3. podle `Flow` se lokalne posune souradnice,
4. podle `Angle` se urci smer vzorkovani,
5. spocita se sinusova FM hodnota,
6. vysledek se prevede na 0 az 255,
7. aplikuje se threshold a smooth,
8. aplikuje se nelinearni gamma-like krivka,
9. volitelne se obraz zabarvi do magenty,
10. vysledek se primicha k originalu pres `Blend`.
11. pres hotovy obraz se jeste polozi barva z palety v rezimu `multiply`.

## Jas pixelu

Pro kazdy pixel:

```txt
brightness = ((r + g + b) / 3) / 255
```

`brightness` je tedy v rozsahu:

```txt
0 az 1
```

## Flow field

Flow dela horizontalni vlnovy posun zavisly na radku `y` a jasu pixelu:

```txt
flowOffset = sin(y * 0.01 + brightness * 4) * flow * 120
```

Kdyz `flow = 0`, zadny posun neni.
Kdyz `flow = 1`, posun muze byt priblizne `-120 az +120 px`.

## Smer vzorkovani

Knob `Angle` nastavuje uhel:

```txt
angle = value * PI
```

Tedy rozsah:

```txt
0 az 180 stupnu
```

Pouzije se jen projekce souradnice do jedne osy:

```txt
sampleX = (x + flowOffset) * cos(angle) + y * sin(angle)
```

To znamena, ze `Angle` otaci smer pruhu / vln.

## FM signal

Hlavni sinus:

```txt
v = sin(sampleX * freq + brightness * depth)
```

Kde:

```txt
freq  = knobValue * 0.1
depth = knobValue * 80
```

Vyklad:

- `freq` urcuje hustotu pruhu v prostoru.
- `depth` urcuje, jak moc jas puvodniho obrazu ohne fazi sinusovky.
- vyssi `depth` znamena, ze tvar puvodniho obrazu vic rozbije / deformuje vlny.

Sinus `v` je v rozsahu:

```txt
-1 az 1
```

Prevod na jas:

```txt
c = (v * 0.5 + 0.5) * 255
```

Tak vznikne hodnota:

```txt
0 az 255
```

## Threshold a Smooth

Threshold slider:

```txt
threshold = sliderValue * 255
```

Smooth slider:

```txt
smooth = sliderValue
smoothWidth = smooth * 120
```

Pak:

```txt
edge = c - threshold
final = 128 + (edge / smoothWidth) * 255
```

Vyklad:

- `Threshold` posouva hranici, kde se vlna lame do svetle/tmave.
- `Smooth` urcuje sirku prechodu kolem threshold.
- nizky `Smooth` dela tvrde, ostre prahy.
- vyssi `Smooth` dela mekci prechody.

Pozor: slider `Smooth` ma v HTML minimum `0`. Kdyz je presne `0`, `smoothWidth` je `0`, a rovnice deli nulou. V praxi to muze vytvaret extremne tvrdy nebo nestabilni vystup. Lepsi minimum by bylo napr. `0.001` nebo pocitat:

```txt
smoothWidth = max(smooth, 0.001) * 120
```

## Nelinearni krivka

Po threshold casti se aplikuje:

```txt
final = pow(final / 255, 1.8) * 255
```

Pak clamp:

```txt
final = clamp(final, 0, 255)
```

Tahle krivka ztmavuje stredy a zvysuje kontrast vysledne vlny.

## Colorize

Knob `Color` nastavuje:

```txt
colorize = knobValue
```

Kdyz je `colorize > 0`, finalni seda hodnota se micha s magentou:

```txt
tint = rgb(255, 0, 255)

fr = final * (1 - colorize) + tint.r * colorize
fg = final * (1 - colorize) + tint.g * colorize
fb = final * (1 - colorize) + tint.b * colorize
```

Pri `colorize = 0` je vystup cernobily.
Pri `colorize = 1` jde vystup silne do magenty.

Tohle je lokalni obarveni primo v pixelove smycce. Je oddelene od palety.

## Blend

Knob `Blend` micha puvodni obraz s FM vystupem:

```txt
out.r = original.r * (1 - blend) + fm.r * blend
out.g = original.g * (1 - blend) + fm.g * blend
out.b = original.b * (1 - blend) + fm.b * blend
```

Rozsah:

```txt
blend = 0 az 1
```

Pri `blend = 0` je videt original.
Pri `blend = 1` je videt cisty FM vystup.

Alpha kanal se nastavi natvrdo:

```txt
out.a = 255
```

## Paleta

Po vypoctu vsech pixelu se FM obraz vykresli do docasneho bufferu. Pres nej se pak polozi `paletteColor` v rezimu `multiply`:

```txt
globalCompositeOperation = "multiply"
fillStyle = paletteColor
fillRect(0, 0, width, height)
```

Vychozi `fmState.paletteColor` je:

```txt
#ff00ff
```

To znamena, ze FM ma dve barevne vrstvy:

1. `Color` knob micha vysledek s natvrdo danou magentou primo v pixelech.
2. Paleta se aplikuje az na konci jako canvas `multiply`.

## Parametry z UI

Knoby jsou normalizovane `0 az 1`. V kodu se mapuji takto:

```txt
Freq  = value * 0.1
Depth = value * 80
Angle = value * PI
Flow  = value
Blend = value
Color = value
```

Slidery:

```txt
Smooth    = value            // 0 az 1
Threshold = value * 255      // 0 az 255
```

## Dulezite poznamky

- FM aktualne ignoruje `progress`, takze nema vnitrni animaci podle transportu.
- FM pouziva paletu az na konci pres canvas `multiply`.
- `Color` knob je nezavisly na palete a micha pixelovou hodnotu s natvrdo danou magentou `rgb(255, 0, 255)`.
- `Smooth = 0` je matematicky problem, protoze deli nulou.
- `Depth` je hlavni "FM" cast: jas obrazku moduluje fazi sinusove vlny.
- `Flow` nedeformuje primo vystupni pixelovy sampling z obrazku, ale deformuje souradnici, ktera vstupuje do sinusovky.
