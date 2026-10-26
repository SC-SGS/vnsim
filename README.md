# VNSim – Von Neumann Simulator

*[Deutsche Version](README.de.md)*

**▶ Try it: <https://sc-sgs.github.io/vnsim/>** (no installation, runs in any modern browser)

VNSim is an interactive model computer for teaching computer architecture. A simple
accumulator machine following the von Neumann architecture is shown as a diagram; every
instruction runs visibly through the five phases
**Fetch → Decode → Fetch Operands → Execute → Write Back** as a sequence of micro steps,
with values travelling over data, address and control bus.

The user interface is available in **English and German** (switch at the top right, or use
`?lang=en` / `?lang=de` in the URL).

![VNSim screenshot](docs/screenshot-en.png)

## Features

- Program and data share **one memory** (von Neumann principle) – programs can even modify themselves.
- Step through the execution by micro step, phase or instruction, or run with adjustable speed and animation.
- Memory cells can be edited directly; a disassembly column shows how each cell is interpreted.
- Numbers in decimal, hexadecimal or binary (16-bit two's complement).
- Counters for instructions, clock cycles (micro steps) and memory accesses – to compare the cost of programs.
- Share programs as links (`…/vnsim/#p=…`), e.g. on slides, QR codes or exercise sheets.
- Presentation mode for projectors (key **P**).
- Works offline: just open `index.html` – no build step, no dependencies.

## The machine

- 100 memory cells (addresses 0 … 99), each holding an integer from −9999 to 9999.
- An instruction occupies two cells (opcode, operand).
- Registers: accumulator (ACC), operand register, flags **Z** (zero) and **N** (negative),
  program counter, instruction register, input and output register.

### Instruction set

| Code | Instruction | Effect |
|---|---|---|
| 00 | `HALT` | Stop the program (so empty memory halts immediately) |
| 01 / 11 | `LOAD x` / `LOAD #n` | ACC ← mem[x] or n |
| 02 | `STORE x` | mem[x] ← ACC |
| 03 / 13 | `ADD` | ACC ← ACC + value |
| 04 / 14 | `SUB` | ACC ← ACC − value |
| 05 / 15 | `MUL` | ACC ← ACC · value |
| 06 / 16 | `DIV` | ACC ← ACC // value (as in Python) |
| 07 / 17 | `MOD` | ACC ← ACC % value (as in Python) |
| 08 / 18 | `CMP` | Set flags from ACC − value, ACC unchanged |
| 20 | `JMP z` | Always jump |
| 21 … 26 | `JE JNE JL JLE JG JGE` | Jump depending on Z/N (equal, not equal, less, …) |
| 30 | `IN x` | mem[x] ← input |
| 31 / 41 | `OUT x` / `OUT #n` | output ← mem[x] or n |

Immediate values (`#n`) use opcode + 10. The flags are set by ADD, SUB, MUL, DIV, MOD and CMP,
but not by LOAD (like `mov` on x86).

### Assembler directive `DATA`

`DATA` is not a machine instruction but a directive for the assembler: `name: DATA v1, v2, …`
places the values in the next free memory cells; `name` is the address of the first cell.
The machine itself does not know `DATA` – if such a cell is executed as an instruction, its value
is taken as an opcode.

### Colours in memory

| Colour | Meaning |
|---|---|
| yellow | instruction (opcode, operand) – produced by the assembler or fetched as an instruction at run time |
| blue | data – created with `DATA` or written at run time (`STORE`, `IN`) |
| yellow with blue corner | program cell overwritten at run time (self-modifying code) |

Bright yellow marks the access of the current micro step (red border when writing); a thick blue
border marks the cell the program counter points to.

### Syntax

```
; comment
start:  LOAD  #5      ; immediate value
        ADD   x       ; value at address x
        STORE 42      ; address as a number
        STORE x+1     ; the cell after x
        JMP   start
x:      DATA  7, 8    ; data cells
```

Upper and lower case are treated the same; labels start a line and end with `:`.

## Usage

| | |
|---|---|
| **▶ Start** | run until HALT (F5) |
| **⏭ Step** | one micro step, phase or instruction, see “Step size” (F10) |
| **Pause / Reset** | Space / Esc |
| **Link** | copies a link containing the current program |
| **Present** | presentation mode (P) |

The program is also kept in the browser's local storage.

## Development

Plain HTML, CSS and JavaScript without dependencies or build step; `index.html` must keep working
when opened via `file://`. Main files:

| File | Purpose |
|---|---|
| `js/isa.js` | instruction table |
| `js/assembler.js` | source code → memory image |
| `js/machine.js` | machine state and instruction cycle as micro steps (no DOM) |
| `js/view.js` | SVG diagram and animation |
| `js/app.js` | user interface |
| `js/i18n.js` | German and English texts |
| `js/examples.js` | example programs (both languages) |

Tests: open `tests/index.html` in a browser, or headless:

```sh
chromium --headless --dump-dom "file://$PWD/tests/index.html" | grep -o 'id="summary"[^<]*'
```

## Author and license

Dirk Pflüger, University of Stuttgart.

Code: [MIT License](LICENSE). Font: TeX Gyre Heros, GUST Font License (see `fonts/`).
