import { z } from "zod";

const optionalPrice = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }
  return value;
}, z.coerce.number().int().nonnegative().nullable().optional());

console.log("Empty string:", optionalPrice.safeParse(""));
console.log("Undefined:", optionalPrice.safeParse(undefined));
console.log("Null:", optionalPrice.safeParse(null));
