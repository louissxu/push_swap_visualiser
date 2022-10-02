export enum Move {
  Start = "starting state",
  Sa = "sa",
  Sb = "sb",
  Ss = "ss",
  Pa = "pa",
  Pb = "pb",
  Ra = "ra",
  Rb = "rb",
  Rr = "rr",
  Rra = "rra",
  Rrb = "rrb",
  Rrr = "rrr",
}

export function stringToMove(str: string): Move | null {
  switch(str){
    case "sa":
      return Move.Sa;
    case "sb":
      return Move.Sb;
    case "ss":
      return Move.Ss;
    case "pa":
      return Move.Pa;
    case "pb":
      return Move.Pb;
    case "ra":
      return Move.Ra;
    case "rb":
      return Move.Rb;
    case "rr":
      return Move.Rr;
    case "rra":
      return Move.Rra;
    case "rrb":
      return Move.Rrb;
    case "rrr":
      return Move.Rrr;
  }    
  return null;
}