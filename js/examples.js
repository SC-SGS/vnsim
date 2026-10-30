// Beispielprogramme je Sprache (de, en, fr, es) (als Strings, damit index.html auch per file:// funktioniert)
var VN = (typeof VN !== 'undefined') ? VN : {};

VN.EXAMPLES = [
  {
    id: 'ausdruck',
    title: {
      de: 'Ausdruck (3 + 4 + 5) · (7 − 2³)', en: 'Expression (3 + 4 + 5) · (7 − 2³)',
      fr: 'Expression (3 + 4 + 5) · (7 − 2³)', es: 'Expresión (3 + 4 + 5) · (7 − 2³)',
    },
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
        OUT             ; Akku ausgeben
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
        OUT             ; output ACC
        HALT

tmp:    DATA  0         ; intermediate result
x:      DATA  0
`,
      fr: `; x = (3 + 4 + 5) * (7 - 2 ** 3)
; Machine à une adresse : un opérande est toujours dans l’accumulateur.
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
        OUT             ; afficher ACC
        HALT

tmp:    DATA  0         ; résultat intermédiaire
x:      DATA  0
`,
      es: `; x = (3 + 4 + 5) * (7 - 2 ** 3)
; Máquina de una dirección: un operando está siempre en el acumulador.
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
        OUT             ; mostrar ACC
        HALT

tmp:    DATA  0         ; resultado intermedio
x:      DATA  0
`,
    },
  },
  {
    id: 'maximum',
    title: {
      de: 'Maximum zweier Zahlen', en: 'Maximum of two numbers',
      fr: 'Maximum de deux nombres', es: 'Máximo de dos números',
    },
    source: {
      de: `; Gibt die größere von zwei eingegebenen Zahlen aus.
        IN              ; Eingabe → Akku
        STORE a
        IN
        STORE b
        LOAD  a
        CMP   b         ; Flags ← a - b
        JGE   ausgabe   ; a - b >= 0  →  a ist größer oder gleich, a steht schon im Akku
        LOAD  b
ausgabe:
        OUT             ; Akku ausgeben
        HALT

a:      DATA  0
b:      DATA  0
`,
      en: `; Outputs the larger of two input numbers.
        IN              ; input → ACC
        STORE a
        IN
        STORE b
        LOAD  a
        CMP   b         ; flags ← a - b
        JGE   output    ; a - b >= 0  →  a is greater or equal, a is already in ACC
        LOAD  b
output:
        OUT             ; output ACC
        HALT

a:      DATA  0
b:      DATA  0
`,
      fr: `; Affiche le plus grand de deux nombres saisis.
        IN              ; entrée → ACC
        STORE a
        IN
        STORE b
        LOAD  a
        CMP   b         ; flags ← a - b
        JGE   sortie    ; a - b >= 0  →  a est supérieur ou égal, a est déjà dans ACC
        LOAD  b
sortie:
        OUT             ; afficher ACC
        HALT

a:      DATA  0
b:      DATA  0
`,
      es: `; Muestra el mayor de dos números introducidos.
        IN              ; entrada → ACC
        STORE a
        IN
        STORE b
        LOAD  a
        CMP   b         ; flags ← a - b
        JGE   salida    ; a - b >= 0  →  a es mayor o igual, a ya está en ACC
        LOAD  b
salida:
        OUT             ; mostrar ACC
        HALT

a:      DATA  0
b:      DATA  0
`,
    },
  },
  {
    id: 'countdown',
    title: {
      de: 'Countdown', en: 'Countdown',
      fr: 'Compte à rebours', es: 'Cuenta atrás',
    },
    source: {
      de: `; Zählt von n bis 1 herunter – nur mit dem Akku, ganz ohne Datenzellen.
; Ausnahme von der Faustregel „vor jedem bedingten Sprung ein CMP“:
; SUB setzt die Flags selbst, das CMP #0 kann entfallen und spart einen Befehl.
        IN              ; Akku = n
schleife:
        OUT
        SUB   #1
        JG    schleife  ; weiter, solange Akku > 0
        HALT
`,
      en: `; Counts down from n to 1 – using only the accumulator, without any data cells.
; Exception to the rule of thumb "a CMP before every conditional jump":
; SUB sets the flags itself, so CMP #0 can be omitted, saving one instruction.
        IN              ; ACC = n
loop:
        OUT
        SUB   #1
        JG    loop      ; continue while ACC > 0
        HALT
`,
      fr: `; Compte à rebours de n à 1 – uniquement avec l’accumulateur, sans cellule de données.
; Exception à la règle pratique « un CMP avant chaque saut conditionnel » :
; SUB positionne lui-même les flags, le CMP #0 peut être omis et économise une instruction.
        IN              ; ACC = n
boucle:
        OUT
        SUB   #1
        JG    boucle    ; continuer tant que ACC > 0
        HALT
`,
      es: `; Cuenta atrás de n a 1, solo con el acumulador, sin celdas de datos.
; Excepción a la regla práctica «un CMP antes de cada salto condicional»:
; SUB modifica los flags por sí mismo, así que el CMP #0 se puede omitir y se ahorra una instrucción.
        IN              ; ACC = n
bucle:
        OUT
        SUB   #1
        JG    bucle     ; seguir mientras ACC > 0
        HALT
`,
    },
  },
  {
    id: 'summe',
    title: {
      de: 'Summe 1 + 2 + … + n', en: 'Sum 1 + 2 + … + n',
      fr: 'Somme 1 + 2 + … + n', es: 'Suma 1 + 2 + … + n',
    },
    source: {
      de: `; Berechnet 1 + 2 + ... + n
        IN
        STORE n
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
ende:   LOAD  summe
        OUT
        HALT

n:      DATA  0
summe:  DATA  0
`,
      en: `; Computes 1 + 2 + ... + n
        IN
        STORE n
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
done:   LOAD  sum
        OUT
        HALT

n:      DATA  0
sum:    DATA  0
`,
      fr: `; Calcule 1 + 2 + ... + n
        IN
        STORE n
        LOAD  #0
        STORE somme
boucle:
        LOAD  n
        CMP   #0
        JLE   fin       ; terminé si n <= 0
        ADD   somme
        STORE somme
        LOAD  n
        SUB   #1
        STORE n
        JMP   boucle
fin:    LOAD  somme
        OUT
        HALT

n:      DATA  0
somme:  DATA  0
`,
      es: `; Calcula 1 + 2 + ... + n
        IN
        STORE n
        LOAD  #0
        STORE suma
bucle:
        LOAD  n
        CMP   #0
        JLE   fin       ; terminado si n <= 0
        ADD   suma
        STORE suma
        LOAD  n
        SUB   #1
        STORE n
        JMP   bucle
fin:    LOAD  suma
        OUT
        HALT

n:      DATA  0
suma:   DATA  0
`,
    },
  },
  {
    id: 'fakultaet',
    title: {
      de: 'Fakultät n!', en: 'Factorial n!',
      fr: 'Factorielle n!', es: 'Factorial n!',
    },
    source: {
      de: `; Berechnet n! = 1 · 2 · ... · n
; Ab n = 8 wird der Zahlenbereich (-9999 … 9999) überschritten.
        IN
        STORE n
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
ende:   LOAD  f
        OUT
        HALT

n:      DATA  0
f:      DATA  1
`,
      en: `; Computes n! = 1 · 2 · ... · n
; From n = 8 on, the number range (-9999 … 9999) is exceeded.
        IN
        STORE n
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
done:   LOAD  f
        OUT
        HALT

n:      DATA  0
f:      DATA  1
`,
      fr: `; Calcule n! = 1 · 2 · ... · n
; À partir de n = 8, l’intervalle des nombres (-9999 … 9999) est dépassé.
        IN
        STORE n
        LOAD  #1
        STORE f
boucle:
        LOAD  n
        CMP   #1
        JLE   fin       ; terminé si n <= 1
        MUL   f
        STORE f
        LOAD  n
        SUB   #1
        STORE n
        JMP   boucle
fin:    LOAD  f
        OUT
        HALT

n:      DATA  0
f:      DATA  1
`,
      es: `; Calcula n! = 1 · 2 · ... · n
; A partir de n = 8 se supera el rango de números (-9999 … 9999).
        IN
        STORE n
        LOAD  #1
        STORE f
bucle:
        LOAD  n
        CMP   #1
        JLE   fin       ; terminado si n <= 1
        MUL   f
        STORE f
        LOAD  n
        SUB   #1
        STORE n
        JMP   bucle
fin:    LOAD  f
        OUT
        HALT

n:      DATA  0
f:      DATA  1
`,
    },
  },
  {
    id: 'liste',
    title: {
      de: 'Summe einer Liste (selbstmodifizierend)', en: 'Sum of a list (self-modifying)',
      fr: 'Somme d’une liste (auto-modifiant)', es: 'Suma de una lista (automodificable)',
    },
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
        LOAD  summe
        OUT
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
        LOAD  sum
        OUT
        HALT

count:  DATA  5
sum:    DATA  0
list:   DATA  3, 1, 4, 1, 5
`,
      fr: `; Somme d’une liste – le programme se modifie lui-même !
; Programme et données partagent la même mémoire (principe de von Neumann).
; Sans adressage indirect, l’adresse dans l’instruction « ADD liste »
; est incrémentée de 1 à chaque passage.
boucle:
        LOAD  somme
instr:  ADD   liste     ; cet opérande est modifié plus bas
        STORE somme
        LOAD  instr+1   ; lire l’adresse dans l’instruction …
        ADD   #1
        STORE instr+1   ; … et la réécrire augmentée de 1
        LOAD  compte
        SUB   #1
        STORE compte
        CMP   #0
        JG    boucle    ; continuer tant que compte > 0
        LOAD  somme
        OUT
        HALT

compte: DATA  5
somme:  DATA  0
liste:  DATA  3, 1, 4, 1, 5
`,
      es: `; Suma de una lista: ¡el programa se modifica a sí mismo!
; Programa y datos comparten la misma memoria (principio de von Neumann).
; Sin direccionamiento indirecto, la dirección de la instrucción
; «ADD lista» se incrementa en 1 en cada vuelta.
bucle:
        LOAD  suma
instr:  ADD   lista     ; este operando se modifica más abajo
        STORE suma
        LOAD  instr+1   ; leer la dirección de la instrucción …
        ADD   #1
        STORE instr+1   ; … y volver a escribirla incrementada en 1
        LOAD  cuenta
        SUB   #1
        STORE cuenta
        CMP   #0
        JG    bucle     ; seguir mientras cuenta > 0
        LOAD  suma
        OUT
        HALT

cuenta: DATA  5
suma:   DATA  0
lista:  DATA  3, 1, 4, 1, 5
`,
    },
  },
];
