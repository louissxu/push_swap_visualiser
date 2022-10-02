import {default as ModulePSSolutionLouis} from "./wasm/push_swap_solution_louis"

// Run function with passed in array of strings
// Ref: https://stackoverflow.com/questions/46750777/passing-a-javascript-array-of-strings-to-a-c-function-with-emscripten

function jsToCString(mod: any, s: string) {
  let size = mod.lengthBytesUTF8(s) + 1;
  let ret = mod._malloc(size);
  mod.stringToUTF8(s, ret, size);
  return ret;
}

function jsToCArrayStrings(mod: any, strings: Array<string>) {
  let cStringPointers = strings.map(x => jsToCString(mod, x));
  let cArray = mod._malloc(cStringPointers.length * 4);
  cStringPointers.forEach((cStringPointer, i) => {
    mod.setValue(cArray + (i * 4), cStringPointer, "i8*");
  })
  return cArray
}

function cFreeArrayOfStrings(mod: any, cStringPointers: Array<any>) {
  for (let i = 0; i < cStringPointers.length; i++) {
    mod._free(cStringPointers[i]);
  }
  mod._free(cStringPointers);
}

export function getMovesSolutionLouis(args: Array<string>) {
  let ret = ModulePSSolutionLouis().then((mod: any) => {
    const wrappedMain = mod.cwrap("main", "number", ["number", "number"]);
    const cArgs = jsToCArrayStrings(mod, args);
    const mainReturnValue = wrappedMain(args.length + 1, cArgs);
    cFreeArrayOfStrings(mod, cArgs);
    const result = {
      return: mainReturnValue,
      stdout: mod.stdoutBuffer,
      stderr: mod.stderrBuffer,
    }
    // This would be needed if the wrappedMain is reused
    // mod.stdoutBuffer = [];
    // mod.stderrBuffer = [];
    return result;
  })
  return ret;
}