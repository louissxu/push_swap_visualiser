// Used when compiling C program to Wasm module.

// Set module run properties. Including piping stdout and stderr to alternate location
// Ref: https://emscripten.org/docs/api_reference/module.html#creating-the-module-object
Module.noInitialRun = true;
Module.stdoutBuffer = [];
Module.stderrBuffer = [];
Module.print = (text) => {
  Module.stdoutBuffer.push(text);
}
Module.printErr = (text) => {
  Module.stderrBuffer.push(text);
}