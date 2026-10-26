# VNSim – Von-Neumann-Simulator

*[English version](README.md)*

**▶ Ausprobieren: <https://sc-sgs.github.io/vnsim/>** (ohne Installation, läuft in jedem aktuellen Browser)

VNSim ist ein interaktiver Modellrechner für die Lehre. Ein einfacher Von-Neumann-Rechner mit
Akkumulator wird als Schaubild dargestellt; jeder Befehl läuft sichtbar in den fünf Phasen
**Fetch → Decode → Fetch Operands → Execute → Write Back** als Folge von Mikroschritten ab,
und die Werte wandern über Daten-, Adress- und Steuerbus.

Die Oberfläche gibt es auf **Deutsch und Englisch** (Umschalter oben rechts oder `?lang=de` /
`?lang=en` in der Adresse).

![VNSim-Screenshot](docs/screenshot-de.png)

## Funktionen

- Programm und Daten liegen im **selben Speicher** (Von-Neumann-Prinzip) – Programme können sich sogar selbst verändern.
- Ausführung in Mikroschritten, Phasen oder Befehlen, oder als Dauerlauf mit einstellbarem Tempo und Animation.
- Speicherzellen direkt bearbeiten; eine Spalte zeigt, wie jede Zelle als Befehl gelesen wird.
- Zahlen dezimal, hexadezimal oder binär (16-Bit-Zweierkomplement).
- Zähler für Befehle, Takte (Mikroschritte) und Speicherzugriffe – zum Vergleich der Kosten von Programmen.
- Programme als Link teilen (`…/vnsim/#p=…`), z. B. auf Folien, als QR-Code oder auf Übungsblättern.
- Beamer-Modus (Taste **P**).
- Läuft offline: einfach `index.html` öffnen – kein Build, keine Abhängigkeiten.

## Maschine

- 100 Speicherzellen (Adressen 0 … 99), jede mit einer ganzen Zahl von −9999 bis 9999.
- Ein Befehl belegt zwei Zellen (Opcode, Operand).
- Register: Akku, Operandenregister, Flags **Z** (null) und **N** (negativ), Befehlszähler,
  Befehlsregister, Ein- und Ausgaberegister.

### Befehlssatz

| Code | Befehl | Wirkung |
|---|---|---|
| 00 | `HALT` | Programm anhalten (leerer Speicher hält also sofort an) |
| 01 / 11 | `LOAD x` / `LOAD #n` | Akku ← Speicher[x] bzw. n |
| 02 | `STORE x` | Speicher[x] ← Akku |
| 03 / 13 | `ADD` | Akku ← Akku + Wert |
| 04 / 14 | `SUB` | Akku ← Akku − Wert |
| 05 / 15 | `MUL` | Akku ← Akku · Wert |
| 06 / 16 | `DIV` | Akku ← Akku // Wert (wie Python) |
| 07 / 17 | `MOD` | Akku ← Akku % Wert (wie Python) |
| 08 / 18 | `CMP` | Flags aus Akku − Wert, Akku bleibt unverändert |
| 20 | `JMP z` | Springe immer |
| 21 … 26 | `JE JNE JL JLE JG JGE` | Springe abhängig von Z/N (gleich, ungleich, kleiner, …) |
| 30 | `IN x` | Speicher[x] ← Eingabe |
| 31 / 41 | `OUT x` / `OUT #n` | Ausgabe ← Speicher[x] bzw. n |

Direktwerte (`#n`) haben den Opcode + 10. Die Flags werden von ADD, SUB, MUL, DIV, MOD und CMP gesetzt,
nicht von LOAD (wie `mov` bei x86).

### Assembler-Direktive `DATA`

`DATA` ist kein Befehl der Maschine, sondern eine Anweisung an den Assembler: `name: DATA w1, w2, …`
legt die Werte in die nächsten freien Speicherzellen; `name` ist die Adresse der ersten Zelle.
Die Maschine selbst kennt `DATA` nicht – wird eine solche Zelle als Befehl ausgeführt, gilt ihr Wert
als Opcode.

### Farben im Speicher

| Farbe | Bedeutung |
|---|---|
| gelb | Befehl (Opcode, Operand) – vom Assembler erzeugt oder zur Laufzeit als Befehl geholt |
| blau | Daten – mit `DATA` angelegt oder zur Laufzeit beschrieben (`STORE`, `IN`) |
| gelb mit blauer Ecke | zur Laufzeit überschriebene Programmzelle (selbstmodifizierender Code) |

Kräftig gelb ist der Zugriff im aktuellen Mikroschritt (roter Rahmen beim Schreiben); ein dicker blauer
Rahmen zeigt die Zelle, auf die der Befehlszähler zeigt.

### Syntax

```
; Kommentar
start:  LOAD  #5      ; Direktwert
        ADD   x       ; Wert an Adresse x
        STORE 42      ; Adresse als Zahl
        STORE x+1     ; Zelle nach x
        JMP   start
x:      DATA  7, 8    ; Datenzellen
```

Groß-/Kleinschreibung spielt keine Rolle; Labels stehen am Zeilenanfang und enden mit `:`.

## Bedienung

| | |
|---|---|
| **▶ Start** | läuft bis HALT (F5) |
| **⏭ Schritt** | ein Mikroschritt, eine Phase oder ein Befehl, je nach „Schrittweite“ (F10) |
| **Pause / Reset** | Leertaste / Esc |
| **Link** | kopiert eine Adresse, die das aktuelle Programm enthält |
| **Beamer** | Präsentationsmodus (P) |

Das Programm wird außerdem im Browser gemerkt.

## Entwicklung

Reines HTML/CSS/JavaScript ohne Abhängigkeiten und ohne Build; `index.html` muss auch über
`file://` funktionieren. Wichtige Dateien:

| Datei | Inhalt |
|---|---|
| `js/isa.js` | Befehlstabelle |
| `js/assembler.js` | Quelltext → Speicherabbild |
| `js/machine.js` | Zustand und Befehlszyklus als Mikroschritte (ohne DOM) |
| `js/view.js` | SVG-Schaubild und Animation |
| `js/app.js` | Bedienoberfläche |
| `js/i18n.js` | deutsche und englische Texte |
| `js/examples.js` | Beispielprogramme (beide Sprachen) |

Tests: `tests/index.html` im Browser öffnen oder headless:

```sh
chromium --headless --dump-dom "file://$PWD/tests/index.html" | grep -o 'id="summary"[^<]*'
```

## Autor und Lizenz

Dirk Pflüger, Universität Stuttgart.

Code: [MIT-Lizenz](LICENSE). Schrift: TeX Gyre Heros, GUST Font License (siehe `fonts/`).
