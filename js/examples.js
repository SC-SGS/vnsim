// Beispielprogramme je Sprache (als Strings, damit index.html auch per file:// funktioniert)
var VN = (typeof VN !== 'undefined') ? VN : {};

VN.EXAMPLES = [
  {
    id: 'ausdruck',
    title: { de: 'Ausdruck (3 + 4 + 5) · (7 − 2³)', en: 'Expression (3 + 4 + 5) · (7 − 2³)' },
    source: {
      de: `; x = (3 + 4 + 5) * (7 - 2 ** 3)
; Einadressmaschine: ein Operand steht immer im Akku.
        LOAD  #2
        MUL   #2
        MUL   #2        ; Akku = 2 ** 3
        STORE h
        LOAD  #7
        SUB   h         ; Akku = 7 - 8
        STORE h
        LOAD  #3
        ADD   #4
        ADD   #5        ; Akku = 3 + 4 + 5
        MUL   h
        STORE x
        OUT   x
        HALT

h:      DATA  0         ; Zwischenergebnis
x:      DATA  0
`,
      en: `; x = (3 + 4 + 5) * (7 - 2 ** 3)
; One-address machine: one operand is always in the accumulator.
        LOAD  #2
        MUL   #2
        MUL   #2        ; ACC = 2 ** 3
        STORE tmp
        LOAD  #7
        SUB   tmp       ; ACC = 7 - 8
        STORE tmp
        LOAD  #3
        ADD   #4
        ADD   #5        ; ACC = 3 + 4 + 5
        MUL   tmp
        STORE x
        OUT   x
        HALT

tmp:    DATA  0         ; intermediate result
x:      DATA  0
`,
    },
  },
  {
    id: 'maximum',
    title: { de: 'Maximum zweier Zahlen', en: 'Maximum of two numbers' },
    source: {
      de: `; Gibt die größere von zwei eingegebenen Zahlen aus.
        IN    a
        IN    b
        LOAD  a
        CMP   b         ; Flags ← a - b
        JGE   a_max     ; a - b >= 0  →  a ist größer oder gleich
        OUT   b
        HALT
a_max:  OUT   a
        HALT

a:      DATA  0
b:      DATA  0
`,
      en: `; Outputs the larger of two input numbers.
        IN    a
        IN    b
        LOAD  a
        CMP   b         ; flags ← a - b
        JGE   a_max     ; a - b >= 0  →  a is greater or equal
        OUT   b
        HALT
a_max:  OUT   a
        HALT

a:      DATA  0
b:      DATA  0
`,
    },
  },
  {
    id: 'countdown',
    title: { de: 'Countdown', en: 'Countdown' },
    source: {
      de: `; Zählt von n bis 1 herunter.
; Ausnahme von der Faustregel „vor jedem bedingten Sprung ein CMP“:
; SUB setzt die Flags selbst, das CMP #0 kann entfallen und spart einen Befehl.
        IN    n
schleife:
        OUT   n
        LOAD  n
        SUB   #1
        STORE n
        JG    schleife  ; weiter, solange n > 0
        HALT

n:      DATA  0
`,
      en: `; Counts down from n to 1.
; Exception to the rule of thumb "a CMP before every conditional jump":
; SUB sets the flags itself, so CMP #0 can be omitted, saving one instruction.
        IN    n
loop:
        OUT   n
        LOAD  n
        SUB   #1
        STORE n
        JG    loop      ; continue while n > 0
        HALT

n:      DATA  0
`,
    },
  },
  {
    id: 'summe',
    title: { de: 'Summe 1 + 2 + … + n', en: 'Sum 1 + 2 + … + n' },
    source: {
      de: `; Berechnet 1 + 2 + ... + n
        IN    n
        LOAD  #0
        STORE summe
schleife:
        LOAD  n
        CMP   #0
        JLE   ende      ; fertig, wenn n <= 0
        ADD   summe
        STORE summe
        LOAD  n
        SUB   #1
        STORE n
        JMP   schleife
ende:   OUT   summe
        HALT

n:      DATA  0
summe:  DATA  0
`,
      en: `; Computes 1 + 2 + ... + n
        IN    n
        LOAD  #0
        STORE sum
loop:
        LOAD  n
        CMP   #0
        JLE   done      ; finished when n <= 0
        ADD   sum
        STORE sum
        LOAD  n
        SUB   #1
        STORE n
        JMP   loop
done:   OUT   sum
        HALT

n:      DATA  0
sum:    DATA  0
`,
    },
  },
  {
    id: 'fakultaet',
    title: { de: 'Fakultät n!', en: 'Factorial n!' },
    source: {
      de: `; Berechnet n! = 1 · 2 · ... · n
; Ab n = 8 wird der Zahlenbereich (-9999 … 9999) überschritten.
        IN    n
        LOAD  #1
        STORE f
schleife:
        LOAD  n
        CMP   #1
        JLE   ende      ; fertig, wenn n <= 1
        MUL   f
        STORE f
        LOAD  n
        SUB   #1
        STORE n
        JMP   schleife
ende:   OUT   f
        HALT

n:      DATA  0
f:      DATA  1
`,
      en: `; Computes n! = 1 · 2 · ... · n
; From n = 8 on, the number range (-9999 … 9999) is exceeded.
        IN    n
        LOAD  #1
        STORE f
loop:
        LOAD  n
        CMP   #1
        JLE   done      ; finished when n <= 1
        MUL   f
        STORE f
        LOAD  n
        SUB   #1
        STORE n
        JMP   loop
done:   OUT   f
        HALT

n:      DATA  0
f:      DATA  1
`,
    },
  },
  {
    id: 'liste',
    title: { de: 'Summe einer Liste (selbstmodifizierend)', en: 'Sum of a list (self-modifying)' },
    source: {
      de: `; Summe einer Liste – das Programm verändert sich selbst!
; Programm und Daten liegen im selben Speicher (von-Neumann-Prinzip).
; Ohne indirekte Adressierung wird die Adresse im Befehl „ADD liste“
; bei jedem Durchlauf um 1 erhöht.
schleife:
        LOAD  summe
befehl: ADD   liste     ; dieser Operand wird unten verändert
        STORE summe
        LOAD  befehl+1  ; Adresse aus dem Befehl lesen …
        ADD   #1
        STORE befehl+1  ; … und um 1 erhöht zurückschreiben
        LOAD  anzahl
        SUB   #1
        STORE anzahl
        CMP   #0
        JG    schleife  ; weiter, solange anzahl > 0
        OUT   summe
        HALT

anzahl: DATA  5
summe:  DATA  0
liste:  DATA  3, 1, 4, 1, 5
`,
      en: `; Sum of a list – the program modifies itself!
; Program and data share the same memory (von Neumann principle).
; Without indirect addressing, the address in the instruction
; "ADD list" is incremented by 1 in every iteration.
loop:
        LOAD  sum
instr:  ADD   list      ; this operand is modified below
        STORE sum
        LOAD  instr+1   ; read the address from the instruction …
        ADD   #1
        STORE instr+1   ; … and write it back incremented by 1
        LOAD  count
        SUB   #1
        STORE count
        CMP   #0
        JG    loop      ; continue while count > 0
        OUT   sum
        HALT

count:  DATA  5
sum:    DATA  0
list:   DATA  3, 1, 4, 1, 5
`,
    },
  },
];
