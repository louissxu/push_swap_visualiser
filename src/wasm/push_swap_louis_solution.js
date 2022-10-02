
var Module = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(Module) {
  Module = Module || {};



// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != 'undefined' ? Module : {};

// See https://caniuse.com/mdn-javascript_builtins_object_assign

// See https://caniuse.com/mdn-javascript_builtins_bigint64array

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise(function(resolve, reject) {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});
["_main","_malloc","_free","_fflush","onRuntimeInitialized"].forEach((prop) => {
  if (!Object.getOwnPropertyDescriptor(Module['ready'], prop)) {
    Object.defineProperty(Module['ready'], prop, {
      get: () => abort('You are getting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
      set: () => abort('You are setting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
    });
  }
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
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

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = true;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  let toLog = e;
  if (e && typeof e == 'object' && e.stack) {
    toLog = [e, e.stack];
  }
  err('exiting due to exception: ' + toLog);
}

if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof importScripts == 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      const data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    let data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer == 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data == 'object');
    return data;
  };

  readAsync = function readAsync(f, onload, onerror) {
    setTimeout(() => onload(readBinary(f)), 0);
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit == 'function') {
    quit_ = (status, toThrow) => {
      logExceptionOnExit(toThrow);
      quit(status);
    };
  }

  if (typeof print != 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console == 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  if (!(typeof window == 'object' || typeof importScripts == 'function')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
// include: web_or_worker_shell_read.js


  read_ = (url) => {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = (title) => document.title = title;
} else
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

if (Module['quit']) quit_ = Module['quit'];legacyModuleProp('quit', 'quit_');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify setWindowTitle in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('read', 'read_');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(!ENVIRONMENT_IS_WORKER, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");




var STACK_ALIGN = 16;
var POINTER_SIZE = 4;

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': case 'u8': return 1;
    case 'i16': case 'u16': return 2;
    case 'i32': case 'u32': return 4;
    case 'i64': case 'u64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length - 1] === '*') {
        return POINTER_SIZE;
      }
      if (type[0] === 'i') {
        const bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      }
      return 0;
    }
  }
}

// include: runtime_debug.js


function legacyModuleProp(prop, newName) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get: function() {
        abort('Module.' + prop + ' has been replaced with plain ' + newName + ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)');
      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort('`Module.' + prop + '` was supplied but `' + prop + '` not included in INCOMING_MODULE_JS_API');
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

function missingLibrarySymbol(sym) {
  if (typeof globalThis !== 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get: function() {
        // Can't `abort()` here because it would break code that does runtime
        // checks.  e.g. `if (typeof SDL === 'undefined')`.
        var msg = '`' + sym + '` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line';
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        warnOnce(msg);
        return undefined;
      }
    });
  }
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get: function() {
        var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// end include: runtime_debug.js


// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');
var noExitRuntime = Module['noExitRuntime'] || true;legacyModuleProp('noExitRuntime', 'noExitRuntime');

// include: wasm2js.js


// wasm2js.js - enough of a polyfill for the WebAssembly object so that we can load
// wasm2js code that way.

// Emit "var WebAssembly" if definitely using wasm2js. Otherwise, in MAYBE_WASM2JS
// mode, we can't use a "var" since it would prevent normal wasm from working.
/** @suppress{duplicate, const} */
var
WebAssembly = {
  // Note that we do not use closure quoting (this['buffer'], etc.) on these
  // functions, as they are just meant for internal use. In other words, this is
  // not a fully general polyfill.
  /** @constructor */
  Memory: function(opts) {
    this.buffer = new ArrayBuffer(opts['initial'] * 65536);
  },

  Module: function(binary) {
    // TODO: use the binary and info somehow - right now the wasm2js output is embedded in
    // the main JS
  },

  /** @constructor */
  Instance: function(module, info) {
    // TODO: use the module and info somehow - right now the wasm2js output is embedded in
    // the main JS
    // This will be replaced by the actual wasm2js code.
    this.exports = (
function instantiate(asmLibraryArg) {
function Table(ret) {
  // grow method not included; table is not growable
  ret.set = function(i, func) {
    this[i] = func;
  };
  ret.get = function(i) {
    return this[i];
  };
  return ret;
}

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 1024, "MHgAZGl1eFhwAGRpADAxMjM0NTY3ODlhYmNkZWYAcnJiAHBiAHNhAHJyYQBwYQBkaXV4WAAwWAAwMTIzNDU2Nzg5ADAAY3NwZGl1eFglMC0jICsxMjM0NTY3ODkuAC0AMC0jICsAKG51bGwpAGNzcGRpdXhYJQAgACVzCgBFcnJvcgoA");
  base64DecodeToExistingUint8Array(bufferView, 1156, "kAZQAA==");
  base64DecodeToExistingUint8Array(bufferView, 1160, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
}
function asmFunc(env) {
 var memory = env.memory;
 var buffer = memory.buffer;
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var abort = env.abort;
 var nan = NaN;
 var infinity = Infinity;
 var fimport$0 = env.fd_write;
 var fimport$1 = env.emscripten_resize_heap;
 var global$0 = 5244560;
 var global$1 = 0;
 var global$2 = 0;
 var global$3 = 0;
 var i64toi32_i32$HIGH_BITS = 0;
 // EMSCRIPTEN_START_FUNCS
;
 function $0() {
  $147();
 }
 
 function $1($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[$3_1 >> 2] = HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0;
    $86(1145 | 0, $3_1 | 0) | 0;
    HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
    continue label$2;
   };
  }
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $2($0_1) {
  $0_1 = $0_1 | 0;
  HEAP32[$0_1 >> 2] = 0;
  HEAP32[($0_1 + 4 | 0) >> 2] = 0;
  return;
 }
 
 function $3($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $11(HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] = 0;
  HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $4($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $9(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    break label$1;
   }
   $14((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0);
   label$3 : {
    if (!((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
   }
   HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $5($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $9(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    break label$1;
   }
   $13(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0);
   if (!((HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
    break label$1
   }
   HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $6($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $35_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0;
  HEAP32[($3_1 + 20 | 0) >> 2] = $16((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 4 | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[(HEAP32[($3_1 + 20 | 0) >> 2] | 0) >> 2] | 0;
   HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 2] = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
   $139(HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0);
   label$3 : {
    if (!((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 2] = 0;
   }
   HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
  }
  $35_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $35_1 | 0;
 }
 
 function $7($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $33_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
  HEAP32[($3_1 + 20 | 0) >> 2] = $15(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[(HEAP32[($3_1 + 20 | 0) >> 2] | 0) >> 2] | 0;
   HEAP32[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 2] = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
   $139(HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0);
   label$3 : {
    if (!((HEAP32[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
   }
   HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
  }
  $33_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $33_1 | 0;
 }
 
 function $8($0_1) {
  $0_1 = $0_1 | 0;
  return $18(HEAP32[$0_1 >> 2] | 0 | 0) | 0 | 0;
 }
 
 function $9($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $21_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $138(12 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[(HEAP32[($3_1 + 4 | 0) >> 2] | 0) >> 2] = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $21_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $21_1 | 0;
 }
 
 function $10($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!(((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0 | (((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0) | 0)) {
     break label$2
    }
    break label$1;
   }
   FUNCTION_TABLE[HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0](HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0);
   $139(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $11($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!(((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0 | (((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0) | 0)) {
     break label$2
    }
    break label$1;
   }
   label$3 : {
    label$4 : while (1) {
     if (!((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$3
     }
     HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     $10(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
     HEAP32[($4_1 + 12 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
     continue label$4;
    };
   }
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $12($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    label$4 : while (1) {
     if (!((HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$3
     }
     HEAP32[($3_1 + 8 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     continue label$4;
    };
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  }
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $13($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!(((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0 | (((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0) | 0)) {
     break label$2
    }
    break label$1;
   }
   label$3 : {
    if ((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$3
    }
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
    HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    break label$1;
   }
   HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0;
   HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
   HEAP32[((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0) + 8 | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  }
  return;
 }
 
 function $14($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!(((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0 | (((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) ^ -1 | 0) & 1 | 0) | 0)) {
     break label$2
    }
    break label$1;
   }
   label$3 : {
    if ((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$3
    }
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
    HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    break label$1;
   }
   HEAP32[($4_1 + 4 | 0) >> 2] = $12(HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) | 0;
   HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 8 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $15($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    if ((HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$3
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($3_1 + 4 | 0) >> 2] = HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0;
   HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] = HEAP32[((HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
   label$4 : {
    if (!((HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$4
    }
    HEAP32[((HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $16($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $40_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    if ((HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$3
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($3_1 + 4 | 0) >> 2] = $12(HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0) | 0;
   label$4 : {
    label$5 : {
     if (!((HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
      break label$5
     }
     HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] = 0;
     break label$4;
    }
    HEAP32[((HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
   }
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $40_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $40_1 | 0;
 }
 
 function $17($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $37_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) == (HEAP32[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[$4_1 >> 2] = $15(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    HEAP32[($4_1 + 12 | 0) >> 2] = HEAP32[$4_1 >> 2] | 0;
    break label$1;
   }
   label$3 : {
    if (!((HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[((HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] = HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0;
   }
   HEAP32[((HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
   HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
   HEAP32[($4_1 + 12 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  }
  $37_1 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  global$0 = $4_1 + 16 | 0;
  return $37_1 | 0;
 }
 
 function $18($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 1 | 0;
    HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
    continue label$2;
   };
  }
  return HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0;
 }
 
 function $19($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $9_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $138(4 | 0) | 0;
  HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] = HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0;
  $9_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $9_1 | 0;
 }
 
 function $20($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $19(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  $6_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $21($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $44_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = HEAP32[($4_1 + 24 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    label$3 : while (1) {
     if (!((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$2
     }
     HEAP32[($4_1 + 8 | 0) >> 2] = FUNCTION_TABLE[HEAP32[($4_1 + 20 | 0) >> 2] | 0 | 0](HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0) | 0;
     label$4 : {
      if ((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
       break label$4
      }
      HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
      break label$1;
     }
     HEAP32[($4_1 + 4 | 0) >> 2] = $9(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
     label$5 : {
      if ((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
       break label$5
      }
      $139(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
      HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
      break label$1;
     }
     $14($4_1 + 16 | 0 | 0, HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0);
     HEAP32[($4_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     continue label$3;
    };
   }
   HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
  }
  $44_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  global$0 = $4_1 + 32 | 0;
  return $44_1 | 0;
 }
 
 function $22($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $49_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 28 | 0) >> 2] = $2_1;
  $2($5_1 + 8 | 0 | 0);
  i64toi32_i32$0 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  $49_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $0_1;
  HEAP32[i64toi32_i32$0 >> 2] = $49_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($5_1 + 24 | 0) >> 2] = HEAP32[$1_1 >> 2] | 0;
  label$1 : {
   label$2 : {
    label$3 : while (1) {
     if (!((HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$2
     }
     HEAP32[($5_1 + 20 | 0) >> 2] = FUNCTION_TABLE[HEAP32[($5_1 + 28 | 0) >> 2] | 0 | 0](HEAP32[(HEAP32[($5_1 + 24 | 0) >> 2] | 0) >> 2] | 0) | 0;
     label$4 : {
      if ((HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
       break label$4
      }
      break label$1;
     }
     $4($0_1 | 0, HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0);
     HEAP32[($5_1 + 24 | 0) >> 2] = HEAP32[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     continue label$3;
    };
   }
  }
  global$0 = $5_1 + 32 | 0;
  return;
 }
 
 function $23($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $55_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[$0_1 >> 2] | 0;
  label$1 : {
   label$2 : {
    label$3 : while (1) {
     if (!((HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$2
     }
     HEAP32[$5_1 >> 2] = FUNCTION_TABLE[HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0](HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0;
     label$4 : {
      if ((HEAP32[$5_1 >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
       break label$4
      }
      HEAP32[($5_1 + 28 | 0) >> 2] = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
      break label$1;
     }
     HEAP32[($5_1 + 8 | 0) >> 2] = $83(HEAP32[$5_1 >> 2] | 0 | 0) | 0;
     label$5 : {
      if ((HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
       break label$5
      }
      FUNCTION_TABLE[HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0](HEAP32[$5_1 >> 2] | 0);
      HEAP32[($5_1 + 28 | 0) >> 2] = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
      break label$1;
     }
     $80($5_1 + 12 | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0);
     label$6 : {
      if (!((HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
       break label$6
      }
      HEAP32[($5_1 + 16 | 0) >> 2] = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
     }
     HEAP32[($5_1 + 4 | 0) >> 2] = HEAP32[((HEAP32[($5_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     continue label$3;
    };
   }
   HEAP32[($5_1 + 28 | 0) >> 2] = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
  }
  $55_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
  global$0 = $5_1 + 32 | 0;
  return $55_1 | 0;
 }
 
 function $24($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  i64toi32_i32$2 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = HEAP32[i64toi32_i32$2 >> 2] | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = i64toi32_i32$1;
  label$1 : {
   if (!(($8($3_1 + 8 | 0 | 0) | 0) >>> 0 >= 2 >>> 0 & 1 | 0)) {
    break label$1
   }
   HEAP32[($3_1 + 24 | 0) >> 2] = $7(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 20 | 0) >> 2] = $7(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0) | 0;
   $5(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0);
   $5(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0);
  }
  $80((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 16 | 0 | 0, $83($76(1061 | 0) | 0 | 0) | 0 | 0);
  global$0 = $3_1 + 32 | 0;
  return;
 }
 
 function $25($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $7((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0) | 0;
  $5(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0);
  $80((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0 | 0, $83($76(1068 | 0) | 0 | 0) | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $26($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $7(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  $5((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0);
  $80((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0 | 0, $83($76(1058 | 0) | 0 | 0) | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $27($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $7(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  $4(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0);
  $80((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0 | 0, $83($76(1065 | 0) | 0 | 0) | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $28($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $7((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0) | 0;
  $4((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0);
  $80((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0 | 0, $83($76(1055 | 0) | 0 | 0) | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $29($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $6(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  $5(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0);
  $80((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0 | 0, $83($76(1064 | 0) | 0 | 0) | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $30($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $6((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0) | 0;
  $5((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0);
  $80((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0 | 0, $83($76(1054 | 0) | 0 | 0) | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $31($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $34((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
     break label$1
    }
    $28(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
    HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + -1 | 0;
    continue label$2;
   };
  }
  label$3 : {
   label$4 : while (1) {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
     break label$3
    }
    $30(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
    HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    continue label$4;
   };
  }
  $25(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $32($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    $25(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
    continue label$2;
   };
  }
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $33($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $34(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
     break label$1
    }
    $27(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
    HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + -1 | 0;
    continue label$2;
   };
  }
  label$3 : {
   label$4 : while (1) {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
     break label$3
    }
    $29(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
    HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    continue label$4;
   };
  }
  $26(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $34($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $140_1 = 0, $49_1 = 0, $170 = 0, $56_1 = 0;
  $4_1 = global$0 - 48 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 40 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 36 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 32 | 0) >> 2] = 0;
  HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[(HEAP32[($4_1 + 40 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($4_1 + 28 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    label$3 : {
     if (!((HEAP32[(HEAP32[(HEAP32[($4_1 + 28 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) == (HEAP32[($4_1 + 36 | 0) >> 2] | 0 | 0) & 1 | 0)) {
      break label$3
     }
     break label$1;
    }
    HEAP32[($4_1 + 32 | 0) >> 2] = (HEAP32[($4_1 + 32 | 0) >> 2] | 0) + 1 | 0;
    HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[((HEAP32[($4_1 + 28 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
    continue label$2;
   };
  }
  label$4 : {
   label$5 : {
    if (!((HEAP32[($4_1 + 28 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$5
    }
    HEAP32[($4_1 + 44 | 0) >> 2] = 0;
    break label$4;
   }
   i64toi32_i32$2 = HEAP32[($4_1 + 40 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $140_1 = i64toi32_i32$0;
   i64toi32_i32$0 = $4_1;
   HEAP32[($4_1 + 16 | 0) >> 2] = $140_1;
   HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$1;
   label$6 : {
    if (!((($8($4_1 + 16 | 0 | 0) | 0) - (HEAP32[($4_1 + 32 | 0) >> 2] | 0) | 0 | 0) < (HEAP32[($4_1 + 32 | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$6
    }
    $49_1 = HEAP32[($4_1 + 32 | 0) >> 2] | 0;
    i64toi32_i32$2 = HEAP32[($4_1 + 40 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
    $170 = i64toi32_i32$1;
    i64toi32_i32$1 = $4_1;
    HEAP32[($4_1 + 8 | 0) >> 2] = $170;
    HEAP32[($4_1 + 12 | 0) >> 2] = i64toi32_i32$0;
    HEAP32[($4_1 + 44 | 0) >> 2] = $49_1 - ($8($4_1 + 8 | 0 | 0) | 0) | 0;
    break label$4;
   }
   HEAP32[($4_1 + 44 | 0) >> 2] = HEAP32[($4_1 + 32 | 0) >> 2] | 0;
  }
  $56_1 = HEAP32[($4_1 + 44 | 0) >> 2] | 0;
  global$0 = $4_1 + 48 | 0;
  return $56_1 | 0;
 }
 
 function $35($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if (HEAP32[(HEAP32[(HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) {
     break label$2
    }
    break label$1;
   }
   $24(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  }
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $36($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$2 = 0, $122_1 = 0, $132_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  i64toi32_i32$2 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $122_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $3_1;
  HEAP32[$3_1 >> 2] = $122_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = i64toi32_i32$1;
  $22($3_1 + 8 | 0 | 0, $3_1 | 0, 1 | 0);
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $132_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $3_1;
  HEAP32[($3_1 + 16 | 0) >> 2] = $132_1;
  HEAP32[($3_1 + 20 | 0) >> 2] = i64toi32_i32$0;
  $69($3_1 + 16 | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!(($37($3_1 + 16 | 0 | 0, 0 | 0, 1 | 0, 2 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
     break label$2
    }
    break label$1;
   }
   label$3 : {
    label$4 : {
     if (!(($37($3_1 + 16 | 0 | 0, 1 | 0, 0 | 0, 2 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
      break label$4
     }
     $24(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
     break label$3;
    }
    label$5 : {
     label$6 : {
      if (!(($37($3_1 + 16 | 0 | 0, 2 | 0, 1 | 0, 0 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
       break label$6
      }
      $24(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
      $29(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
      break label$5;
     }
     label$7 : {
      label$8 : {
       if (!(($37($3_1 + 16 | 0 | 0, 2 | 0, 0 | 0, 1 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
        break label$8
       }
       $27(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
       break label$7;
      }
      label$9 : {
       label$10 : {
        if (!(($37($3_1 + 16 | 0 | 0, 0 | 0, 2 | 0, 1 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
         break label$10
        }
        $24(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
        $27(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
        break label$9;
       }
       label$11 : {
        if (!(($37($3_1 + 16 | 0 | 0, 1 | 0, 2 | 0, 0 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
         break label$11
        }
        $29(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
       }
      }
     }
    }
   }
  }
  $3($3_1 + 16 | 0 | 0, 2 | 0);
  global$0 = $3_1 + 32 | 0;
  return;
 }
 
 function $37($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $35_1 = 0;
  $6_1 = global$0 - 32 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 12 | 0) >> 2] = $3_1;
  HEAP32[($6_1 + 8 | 0) >> 2] = HEAP32[(HEAP32[($6_1 + 24 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!($66(HEAP32[(HEAP32[($6_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, $6_1 + 20 | 0 | 0) | 0)) {
     break label$2
    }
    HEAP32[($6_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($6_1 + 8 | 0) >> 2] = HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
   label$3 : {
    if (!($66(HEAP32[(HEAP32[($6_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, $6_1 + 16 | 0 | 0) | 0)) {
     break label$3
    }
    HEAP32[($6_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($6_1 + 8 | 0) >> 2] = HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
   label$4 : {
    if (!($66(HEAP32[(HEAP32[($6_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, $6_1 + 12 | 0 | 0) | 0)) {
     break label$4
    }
    HEAP32[($6_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($6_1 + 28 | 0) >> 2] = 1;
  }
  $35_1 = HEAP32[($6_1 + 28 | 0) >> 2] | 0;
  global$0 = $6_1 + 32 | 0;
  return $35_1 | 0;
 }
 
 function $38($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 0 | 0);
  $36(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  $25(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $39($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 0 | 0);
  $33(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 1 | 0);
  $36(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  $25(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  $25(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $40($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $115_1 = 0, $171 = 0;
  $4_1 = global$0 - 48 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 44 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 40 | 0) >> 2] = $1_1;
  i64toi32_i32$2 = HEAP32[($4_1 + 44 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $115_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $4_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $115_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($4_1 + 36 | 0) >> 2] = (((($8($4_1 + 16 | 0 | 0) | 0) + (HEAP32[($4_1 + 40 | 0) >> 2] | 0) | 0) - 1 | 0) >>> 0) / ((HEAP32[($4_1 + 40 | 0) >> 2] | 0) >>> 0) | 0;
  HEAP32[($4_1 + 32 | 0) >> 2] = Math_imul((HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) / (2 | 0) | 0, HEAP32[($4_1 + 36 | 0) >> 2] | 0);
  HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 32 | 0) >> 2] | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    i64toi32_i32$2 = HEAP32[($4_1 + 44 | 0) >> 2] | 0;
    i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
    $171 = i64toi32_i32$1;
    i64toi32_i32$1 = $4_1;
    HEAP32[($4_1 + 8 | 0) >> 2] = $171;
    HEAP32[($4_1 + 12 | 0) >> 2] = i64toi32_i32$0;
    HEAP32[($4_1 + 24 | 0) >> 2] = $8($4_1 + 8 | 0 | 0) | 0;
    label$3 : {
     label$4 : while (1) {
      if (!((HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
       break label$3
      }
      label$5 : {
       label$6 : {
        if (!((HEAP32[($4_1 + 32 | 0) >> 2] | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
         break label$6
        }
        if (!((HEAP32[(HEAP32[(HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < ((HEAP32[($4_1 + 32 | 0) >> 2] | 0) + (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0 | 0) & 1 | 0)) {
         break label$6
        }
        $26(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
        break label$5;
       }
       label$7 : {
        label$8 : {
         if (!(((HEAP32[($4_1 + 28 | 0) >> 2] | 0) - (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
          break label$8
         }
         if (!((HEAP32[(HEAP32[(HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < (HEAP32[($4_1 + 28 | 0) >> 2] | 0 | 0) & 1 | 0)) {
          break label$8
         }
         $26(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
         $28(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
         break label$7;
        }
        $27(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
       }
      }
      HEAP32[($4_1 + 24 | 0) >> 2] = (HEAP32[($4_1 + 24 | 0) >> 2] | 0) + -1 | 0;
      continue label$4;
     };
    }
    HEAP32[($4_1 + 32 | 0) >> 2] = (HEAP32[($4_1 + 32 | 0) >> 2] | 0) + (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0;
    HEAP32[($4_1 + 28 | 0) >> 2] = (HEAP32[($4_1 + 28 | 0) >> 2] | 0) - (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0;
    continue label$2;
   };
  }
  global$0 = $4_1 + 48 | 0;
  return;
 }
 
 function $41($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  i64toi32_i32$2 = (HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  HEAP32[$3_1 >> 2] = HEAP32[i64toi32_i32$2 >> 2] | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($3_1 + 24 | 0) >> 2] = ($8($3_1 | 0) | 0) - 1 | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($3_1 + 20 | 0) >> 2] = (HEAP32[($3_1 + 24 | 0) >> 2] | 0) - 1 | 0;
    label$3 : {
     if (!((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
      break label$3
     }
     HEAP32[($3_1 + 20 | 0) >> 2] = 0;
    }
    HEAP32[($3_1 + 16 | 0) >> 2] = $34((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) | 0;
    HEAP32[($3_1 + 12 | 0) >> 2] = $34((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) | 0;
    label$4 : {
     label$5 : {
      label$6 : {
       if (($60(HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0) | 0 | 0) < ($60(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) & 1 | 0) {
        break label$6
       }
       if (!((HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) == (HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) & 1 | 0)) {
        break label$5
       }
      }
      $31(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0);
      HEAP32[($3_1 + 24 | 0) >> 2] = (HEAP32[($3_1 + 24 | 0) >> 2] | 0) + -1 | 0;
      break label$4;
     }
     $31(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0);
     $31(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0);
     $24(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
     HEAP32[($3_1 + 24 | 0) >> 2] = (HEAP32[($3_1 + 24 | 0) >> 2] | 0) - 2 | 0;
    }
    continue label$2;
   };
  }
  global$0 = $3_1 + 32 | 0;
  return;
 }
 
 function $42($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $40(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 8 | 0);
  $41(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $43($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $130_1 = 0, $186 = 0, $253 = 0;
  $5_1 = global$0 - 64 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 60 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 56 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 52 | 0) >> 2] = $2_1;
  i64toi32_i32$2 = HEAP32[($5_1 + 60 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $130_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $5_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = $130_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($5_1 + 48 | 0) >> 2] = (((($8($5_1 + 16 | 0 | 0) | 0) + (HEAP32[($5_1 + 52 | 0) >> 2] | 0) | 0) - 1 | 0) >>> 0) / ((HEAP32[($5_1 + 52 | 0) >> 2] | 0) >>> 0) | 0;
  HEAP32[($5_1 + 44 | 0) >> 2] = (((HEAP32[($5_1 + 52 | 0) >> 2] | 0) + (HEAP32[($5_1 + 56 | 0) >> 2] | 0) | 0) - 1 | 0 | 0) / (HEAP32[($5_1 + 56 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($5_1 + 44 | 0) >> 2] = (((HEAP32[($5_1 + 44 | 0) >> 2] | 0) + 1 | 0 | 0) / (2 | 0) | 0) << 1 | 0;
  i64toi32_i32$2 = HEAP32[($5_1 + 60 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $186 = i64toi32_i32$1;
  i64toi32_i32$1 = $5_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $186;
  HEAP32[($5_1 + 28 | 0) >> 2] = i64toi32_i32$0;
  HEAP32[($5_1 + 36 | 0) >> 2] = (($8($5_1 + 24 | 0 | 0) | 0) - Math_imul((HEAP32[($5_1 + 52 | 0) >> 2] | 0 | 0) / (2 | 0) | 0, HEAP32[($5_1 + 48 | 0) >> 2] | 0) | 0) - Math_imul((HEAP32[($5_1 + 44 | 0) >> 2] | 0 | 0) / (2 | 0) | 0, HEAP32[($5_1 + 48 | 0) >> 2] | 0) | 0;
  HEAP32[($5_1 + 40 | 0) >> 2] = (HEAP32[($5_1 + 36 | 0) >> 2] | 0) + Math_imul(HEAP32[($5_1 + 48 | 0) >> 2] | 0, HEAP32[($5_1 + 44 | 0) >> 2] | 0) | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[(HEAP32[($5_1 + 60 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    i64toi32_i32$2 = HEAP32[($5_1 + 60 | 0) >> 2] | 0;
    i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
    i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
    $253 = i64toi32_i32$0;
    i64toi32_i32$0 = $5_1;
    HEAP32[($5_1 + 8 | 0) >> 2] = $253;
    HEAP32[($5_1 + 12 | 0) >> 2] = i64toi32_i32$1;
    HEAP32[($5_1 + 32 | 0) >> 2] = $8($5_1 + 8 | 0 | 0) | 0;
    label$3 : {
     label$4 : while (1) {
      if (!((HEAP32[($5_1 + 32 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
       break label$3
      }
      label$5 : {
       label$6 : {
        if (!((HEAP32[($5_1 + 36 | 0) >> 2] | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[(HEAP32[($5_1 + 60 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
         break label$6
        }
        if (!((HEAP32[(HEAP32[(HEAP32[(HEAP32[($5_1 + 60 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < (HEAP32[($5_1 + 40 | 0) >> 2] | 0 | 0) & 1 | 0)) {
         break label$6
        }
        $26(HEAP32[($5_1 + 60 | 0) >> 2] | 0 | 0);
        break label$5;
       }
       $27(HEAP32[($5_1 + 60 | 0) >> 2] | 0 | 0);
      }
      HEAP32[($5_1 + 32 | 0) >> 2] = (HEAP32[($5_1 + 32 | 0) >> 2] | 0) + -1 | 0;
      continue label$4;
     };
    }
    HEAP32[($5_1 + 40 | 0) >> 2] = (HEAP32[($5_1 + 40 | 0) >> 2] | 0) + Math_imul((HEAP32[($5_1 + 44 | 0) >> 2] | 0 | 0) / (2 | 0) | 0, HEAP32[($5_1 + 48 | 0) >> 2] | 0) | 0;
    HEAP32[($5_1 + 36 | 0) >> 2] = (HEAP32[($5_1 + 36 | 0) >> 2] | 0) - Math_imul((HEAP32[($5_1 + 44 | 0) >> 2] | 0 | 0) / (2 | 0) | 0, HEAP32[($5_1 + 48 | 0) >> 2] | 0) | 0;
    continue label$2;
   };
  }
  global$0 = $5_1 + 64 | 0;
  return;
 }
 
 function $44($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 32 | 0;
  HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = HEAP32[(HEAP32[($5_1 + 24 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    label$3 : while (1) {
     if (!((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$2
     }
     label$4 : {
      if (!((HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[($5_1 + 12 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$4
      }
      if (!((HEAP32[(HEAP32[(HEAP32[($5_1 + 12 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < (HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$4
      }
      HEAP32[($5_1 + 28 | 0) >> 2] = 1;
      break label$1;
     }
     HEAP32[($5_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     continue label$3;
    };
   }
   HEAP32[($5_1 + 28 | 0) >> 2] = 0;
  }
  return HEAP32[($5_1 + 28 | 0) >> 2] | 0 | 0;
 }
 
 function $45($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $39_1 = 0;
  $5_1 = global$0 - 32 | 0;
  HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = $2_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[(HEAP32[($5_1 + 24 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$2
    }
    if (!((HEAP32[(HEAP32[(HEAP32[(HEAP32[($5_1 + 24 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < (HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($5_1 + 28 | 0) >> 2] = 1;
    break label$1;
   }
   HEAP32[($5_1 + 12 | 0) >> 2] = HEAP32[(HEAP32[($5_1 + 24 | 0) >> 2] | 0) >> 2] | 0;
   HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
   label$3 : while (1) {
    $39_1 = 0;
    label$4 : {
     if (!((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$4
     }
     $39_1 = (HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0);
    }
    label$5 : {
     if (!($39_1 & 1 | 0)) {
      break label$5
     }
     label$6 : {
      if (!((HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[($5_1 + 12 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$6
      }
      if (!((HEAP32[(HEAP32[(HEAP32[($5_1 + 12 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < (HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$6
      }
      HEAP32[($5_1 + 28 | 0) >> 2] = 1;
      break label$1;
     }
     label$7 : {
      if (!((HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$7
      }
      if (!((HEAP32[(HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < (HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$7
      }
      HEAP32[($5_1 + 28 | 0) >> 2] = 0;
      break label$1;
     }
     label$8 : {
      if (!((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) == (HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$8
      }
      break label$5;
     }
     label$9 : {
      if (!((HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) == (HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$9
      }
      break label$5;
     }
     HEAP32[($5_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0;
     continue label$3;
    }
    break label$3;
   };
   HEAP32[($5_1 + 28 | 0) >> 2] = 1;
  }
  return HEAP32[($5_1 + 28 | 0) >> 2] | 0 | 0;
 }
 
 function $46($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $133_1 = 0, $156_1 = 0, $187 = 0;
  $4_1 = global$0 - 48 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 44 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 40 | 0) >> 2] = $1_1;
  i64toi32_i32$2 = HEAP32[($4_1 + 44 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $133_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $4_1;
  HEAP32[$4_1 >> 2] = $133_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($4_1 + 36 | 0) >> 2] = (((($8($4_1 | 0) | 0) + (HEAP32[($4_1 + 40 | 0) >> 2] | 0) | 0) - 1 | 0) >>> 0) / ((HEAP32[($4_1 + 40 | 0) >> 2] | 0) >>> 0) | 0;
  i64toi32_i32$2 = HEAP32[($4_1 + 44 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $156_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $156_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = i64toi32_i32$0;
  HEAP32[($4_1 + 32 | 0) >> 2] = (($8($4_1 + 8 | 0 | 0) | 0) - Math_imul((HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) / (2 | 0) | 0, HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0) + (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0;
  i64toi32_i32$2 = HEAP32[($4_1 + 44 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $187 = i64toi32_i32$0;
  i64toi32_i32$0 = $4_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $187;
  HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($4_1 + 28 | 0) >> 2] = (($8($4_1 + 16 | 0 | 0) | 0) - Math_imul((HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) / (2 | 0) | 0, HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0) - (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    label$3 : {
     label$4 : while (1) {
      if (!(($44(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 32 | 0) >> 2] | 0 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
       break label$3
      }
      label$5 : {
       label$6 : {
        if (!(((HEAP32[($4_1 + 32 | 0) >> 2] | 0) - (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
         break label$6
        }
        if (!((HEAP32[(HEAP32[(HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < (HEAP32[($4_1 + 32 | 0) >> 2] | 0 | 0) & 1 | 0)) {
         break label$6
        }
        $26(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
        break label$5;
       }
       label$7 : {
        label$8 : {
         if (!((HEAP32[($4_1 + 28 | 0) >> 2] | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
          break label$8
         }
         if (!((HEAP32[(HEAP32[(HEAP32[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) < ((HEAP32[($4_1 + 28 | 0) >> 2] | 0) + (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0 | 0) & 1 | 0)) {
          break label$8
         }
         $26(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
         $28(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
         break label$7;
        }
        label$9 : {
         label$10 : {
          if (!($45(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 32 | 0) >> 2] | 0 | 0) | 0)) {
           break label$10
          }
          $27(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
          break label$9;
         }
         $29(HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0);
        }
       }
      }
      continue label$4;
     };
    }
    HEAP32[($4_1 + 32 | 0) >> 2] = (HEAP32[($4_1 + 32 | 0) >> 2] | 0) + (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0;
    HEAP32[($4_1 + 28 | 0) >> 2] = (HEAP32[($4_1 + 28 | 0) >> 2] | 0) - (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0;
    continue label$2;
   };
  }
  global$0 = $4_1 + 48 | 0;
  return;
 }
 
 function $47($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $55_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[(HEAP32[(HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) == (HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$2
    }
    $25(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
    break label$1;
   }
   HEAP32[$5_1 >> 2] = $34((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0;
   label$3 : {
    label$4 : while (1) {
     if (!((HEAP32[(HEAP32[(HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) != (HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) & 1 | 0)) {
      break label$3
     }
     label$5 : {
      label$6 : {
       if (!((HEAP32[(HEAP32[(HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) == (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
        break label$6
       }
       if (!((HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0 | 0) < ((HEAP32[($5_1 + 8 | 0) >> 2] | 0) - 1 | 0 | 0) & 1 | 0)) {
        break label$6
       }
       $25(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
       $27(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
       $55_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
       HEAP32[$55_1 >> 2] = (HEAP32[$55_1 >> 2] | 0) + 1 | 0;
       break label$5;
      }
      label$7 : {
       label$8 : {
        if (!((HEAP32[$5_1 >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
         break label$8
        }
        $28(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
        HEAP32[$5_1 >> 2] = (HEAP32[$5_1 >> 2] | 0) - 1 | 0;
        break label$7;
       }
       label$9 : {
        label$10 : {
         if (!((HEAP32[$5_1 >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
          break label$10
         }
         $30(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
         HEAP32[$5_1 >> 2] = (HEAP32[$5_1 >> 2] | 0) + 1 | 0;
         break label$9;
        }
       }
      }
     }
     continue label$4;
    };
   }
   $25(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
  }
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $48($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $161 = 0, $190 = 0, $211 = 0;
  $4_1 = global$0 - 64 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 60 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 56 | 0) >> 2] = $1_1;
  i64toi32_i32$2 = (HEAP32[($4_1 + 60 | 0) >> 2] | 0) + 8 | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $161 = i64toi32_i32$0;
  i64toi32_i32$0 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $161;
  HEAP32[($4_1 + 12 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($4_1 + 52 | 0) >> 2] = (((($8($4_1 + 8 | 0 | 0) | 0) + (HEAP32[($4_1 + 56 | 0) >> 2] | 0) | 0) - 1 | 0) >>> 0) / ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) >>> 0) | 0;
  i64toi32_i32$2 = (HEAP32[($4_1 + 60 | 0) >> 2] | 0) + 8 | 0;
  i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $190 = i64toi32_i32$1;
  i64toi32_i32$1 = $4_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $190;
  HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$0;
  HEAP32[($4_1 + 48 | 0) >> 2] = ($8($4_1 + 16 | 0 | 0) | 0) - (HEAP32[($4_1 + 52 | 0) >> 2] | 0) | 0;
  i64toi32_i32$2 = (HEAP32[($4_1 + 60 | 0) >> 2] | 0) + 8 | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $211 = i64toi32_i32$0;
  i64toi32_i32$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $211;
  HEAP32[($4_1 + 28 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($4_1 + 44 | 0) >> 2] = ($8($4_1 + 24 | 0 | 0) | 0) - 1 | 0;
  HEAP32[($4_1 + 36 | 0) >> 2] = HEAP32[($4_1 + 48 | 0) >> 2] | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[((HEAP32[($4_1 + 60 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($4_1 + 40 | 0) >> 2] = (HEAP32[($4_1 + 44 | 0) >> 2] | 0) - 1 | 0;
    label$3 : {
     if (!((HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
      break label$3
     }
     HEAP32[($4_1 + 40 | 0) >> 2] = 0;
    }
    label$4 : {
     label$5 : {
      label$6 : {
       if (($60($34((HEAP32[($4_1 + 60 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0) <= ($60($34((HEAP32[($4_1 + 60 | 0) >> 2] | 0) + 8 | 0 | 0, HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0) & 1 | 0) {
        break label$6
       }
       if ((HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0) == (HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) & 1 | 0) {
        break label$6
       }
       if (!((HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0) < (HEAP32[($4_1 + 36 | 0) >> 2] | 0 | 0) & 1 | 0)) {
        break label$5
       }
      }
      $47(HEAP32[($4_1 + 60 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0, $4_1 + 36 | 0 | 0);
      HEAP32[($4_1 + 44 | 0) >> 2] = (HEAP32[($4_1 + 44 | 0) >> 2] | 0) - 1 | 0;
      break label$4;
     }
     $47(HEAP32[($4_1 + 60 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 40 | 0) >> 2] | 0 | 0, $4_1 + 36 | 0 | 0);
     $47(HEAP32[($4_1 + 60 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0, $4_1 + 36 | 0 | 0);
     $24(HEAP32[($4_1 + 60 | 0) >> 2] | 0 | 0);
     HEAP32[($4_1 + 44 | 0) >> 2] = (HEAP32[($4_1 + 44 | 0) >> 2] | 0) - 2 | 0;
    }
    label$7 : {
     if (!((HEAP32[($4_1 + 36 | 0) >> 2] | 0 | 0) > (HEAP32[($4_1 + 44 | 0) >> 2] | 0 | 0) & 1 | 0)) {
      break label$7
     }
     label$8 : {
      label$9 : while (1) {
       if (!((HEAP32[($4_1 + 36 | 0) >> 2] | 0 | 0) > (HEAP32[($4_1 + 48 | 0) >> 2] | 0 | 0) & 1 | 0)) {
        break label$8
       }
       $29(HEAP32[($4_1 + 60 | 0) >> 2] | 0 | 0);
       HEAP32[($4_1 + 36 | 0) >> 2] = (HEAP32[($4_1 + 36 | 0) >> 2] | 0) - 1 | 0;
       continue label$9;
      };
     }
     HEAP32[($4_1 + 44 | 0) >> 2] = (HEAP32[($4_1 + 48 | 0) >> 2] | 0) - 1 | 0;
     HEAP32[($4_1 + 48 | 0) >> 2] = (HEAP32[($4_1 + 48 | 0) >> 2] | 0) - (HEAP32[($4_1 + 52 | 0) >> 2] | 0) | 0;
     label$10 : {
      if (!((HEAP32[($4_1 + 48 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
       break label$10
      }
      HEAP32[($4_1 + 48 | 0) >> 2] = 0;
     }
     HEAP32[($4_1 + 36 | 0) >> 2] = HEAP32[($4_1 + 48 | 0) >> 2] | 0;
    }
    continue label$2;
   };
  }
  global$0 = $4_1 + 64 | 0;
  return;
 }
 
 function $49($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $36_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $2_1;
  $2($5_1 | 0);
  i64toi32_i32$0 = HEAP32[$5_1 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
  $36_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $0_1;
  HEAP32[i64toi32_i32$0 >> 2] = $36_1;
  HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[$1_1 >> 2] | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    $4($0_1 | 0, FUNCTION_TABLE[HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0](HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) | 0 | 0);
    HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
    continue label$2;
   };
  }
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $50($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, $95_1 = 0, $105_1 = 0, $125_1 = 0, $138_1 = 0, $68_1 = 0;
  $3_1 = global$0 - 64 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 60 | 0) >> 2] = $0_1;
  i64toi32_i32$2 = HEAP32[($3_1 + 60 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $95_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $3_1;
  HEAP32[$3_1 >> 2] = $95_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = i64toi32_i32$1;
  $49($3_1 + 24 | 0 | 0, $3_1 | 0, 1 | 0);
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  $105_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $3_1 + 32 | 0;
  HEAP32[i64toi32_i32$1 >> 2] = $105_1;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$2 = (HEAP32[($3_1 + 60 | 0) >> 2] | 0) + 8 | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $125_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $125_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = i64toi32_i32$1;
  $49($3_1 + 16 | 0 | 0, $3_1 + 8 | 0 | 0, 1 | 0);
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
  $138_1 = i64toi32_i32$1;
  i64toi32_i32$1 = ($3_1 + 32 | 0) + 8 | 0;
  HEAP32[i64toi32_i32$1 >> 2] = $138_1;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  HEAP32[($3_1 + 48 | 0) >> 2] = 0;
  HEAP32[($3_1 + 56 | 0) >> 2] = 0;
  $43($3_1 + 32 | 0 | 0, 4 | 0, 32 | 0);
  $32($3_1 + 32 | 0 | 0);
  $46($3_1 + 32 | 0 | 0, 32 | 0);
  $48($3_1 + 32 | 0 | 0, 32 | 0);
  HEAP32[($3_1 + 56 | 0) >> 2] = $59(HEAP32[($3_1 + 48 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 52 | 0) >> 2] = $18(HEAP32[($3_1 + 56 | 0) >> 2] | 0 | 0) | 0;
  $3($3_1 + 32 | 0 | 0, 2 | 0);
  $3(($3_1 + 32 | 0) + 8 | 0 | 0, 2 | 0);
  $81(($3_1 + 32 | 0) + 16 | 0 | 0, 2 | 0);
  $11(HEAP32[($3_1 + 56 | 0) >> 2] | 0 | 0, 2 | 0);
  $68_1 = HEAP32[($3_1 + 52 | 0) >> 2] | 0;
  global$0 = $3_1 + 64 | 0;
  return $68_1 | 0;
 }
 
 function $51($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$2 = 0, $82_1 = 0, $92_1 = 0, $112_1 = 0, $125_1 = 0, $55_1 = 0;
  $3_1 = global$0 - 64 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 60 | 0) >> 2] = $0_1;
  i64toi32_i32$2 = HEAP32[($3_1 + 60 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $82_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $3_1;
  HEAP32[$3_1 >> 2] = $82_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = i64toi32_i32$1;
  $49($3_1 + 24 | 0 | 0, $3_1 | 0, 1 | 0);
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  $92_1 = i64toi32_i32$1;
  i64toi32_i32$1 = $3_1 + 40 | 0;
  HEAP32[i64toi32_i32$1 >> 2] = $92_1;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  i64toi32_i32$2 = (HEAP32[($3_1 + 60 | 0) >> 2] | 0) + 8 | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $112_1 = i64toi32_i32$0;
  i64toi32_i32$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $112_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = i64toi32_i32$1;
  $49($3_1 + 16 | 0 | 0, $3_1 + 8 | 0 | 0, 1 | 0);
  i64toi32_i32$2 = $3_1;
  i64toi32_i32$1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
  $125_1 = i64toi32_i32$1;
  i64toi32_i32$1 = ($3_1 + 40 | 0) + 8 | 0;
  HEAP32[i64toi32_i32$1 >> 2] = $125_1;
  HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
  HEAP32[($3_1 + 56 | 0) >> 2] = 0;
  HEAP32[($3_1 + 36 | 0) >> 2] = 0;
  $57($3_1 + 40 | 0 | 0);
  HEAP32[($3_1 + 36 | 0) >> 2] = $59(HEAP32[($3_1 + 56 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 32 | 0) >> 2] = $18(HEAP32[($3_1 + 36 | 0) >> 2] | 0 | 0) | 0;
  $3($3_1 + 40 | 0 | 0, 2 | 0);
  $3(($3_1 + 40 | 0) + 8 | 0 | 0, 2 | 0);
  $81(($3_1 + 40 | 0) + 16 | 0 | 0, 2 | 0);
  $11(HEAP32[($3_1 + 36 | 0) >> 2] | 0 | 0, 2 | 0);
  $55_1 = HEAP32[($3_1 + 32 | 0) >> 2] | 0;
  global$0 = $3_1 + 64 | 0;
  return $55_1 | 0;
 }
 
 function $52($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $50(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = $51(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($3_1 + 8 | 0) >> 2] | 0) >>> 0 < (HEAP32[($3_1 + 4 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$2
    }
    $43(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 4 | 0, 32 | 0);
    $32(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
    $46(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 32 | 0);
    $48(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 32 | 0);
    break label$1;
   }
   $57(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  }
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $53($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (HEAP32[($4_1 + 8 | 0) >> 2] | 0) {
     break label$2
    }
    if (HEAP32[($4_1 + 4 | 0) >> 2] | 0) {
     break label$2
    }
    HEAP32[($4_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    if (HEAP32[($4_1 + 4 | 0) >> 2] | 0) {
     break label$3
    }
    HEAP32[($4_1 + 12 | 0) >> 2] = 1;
    break label$1;
   }
   label$4 : {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
     break label$4
    }
    HEAP32[($4_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[$4_1 >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   label$5 : {
    label$6 : while (1) {
     if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) > (1 | 0) & 1 | 0)) {
      break label$5
     }
     HEAP32[$4_1 >> 2] = Math_imul(HEAP32[$4_1 >> 2] | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0);
     HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + -1 | 0;
     continue label$6;
    };
   }
   HEAP32[($4_1 + 12 | 0) >> 2] = HEAP32[$4_1 >> 2] | 0;
  }
  return HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $54($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $26_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    label$4 : while (1) {
     if (!((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) > ($53(2 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0 | 0) & 1 | 0)) {
      break label$3
     }
     HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 1 | 0;
     continue label$4;
    };
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $26_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $26_1 | 0;
 }
 
 function $55($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  $25(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
  i64toi32_i32$2 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = HEAP32[i64toi32_i32$2 >> 2] | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = i64toi32_i32$1;
  label$1 : {
   label$2 : {
    if (!(($8($3_1 + 8 | 0 | 0) | 0) >>> 0 <= 1 >>> 0 & 1 | 0)) {
     break label$2
    }
    break label$1;
   }
   HEAP32[($3_1 + 24 | 0) >> 2] = HEAP32[(HEAP32[(HEAP32[(HEAP32[($3_1 + 28 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0;
   HEAP32[($3_1 + 20 | 0) >> 2] = HEAP32[(HEAP32[(HEAP32[((HEAP32[(HEAP32[($3_1 + 28 | 0) >> 2] | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0;
   if (!(((HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) / (2 | 0) | 0 | 0) == ((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) / (2 | 0) | 0 | 0) & 1 | 0)) {
    break label$1
   }
   label$3 : {
    if (!(((HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) % (2 | 0) | 0 | 0) > ((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) % (2 | 0) | 0 | 0) & 1 | 0)) {
     break label$3
    }
    $24(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
   }
  }
  global$0 = $3_1 + 32 | 0;
  return;
 }
 
 function $56($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  i64toi32_i32$2 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = HEAP32[i64toi32_i32$2 >> 2] | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = i64toi32_i32$1;
  label$1 : {
   label$2 : {
    if (!(($8($3_1 + 8 | 0 | 0) | 0) >>> 0 <= 1 >>> 0 & 1 | 0)) {
     break label$2
    }
    break label$1;
   }
   HEAP32[($3_1 + 24 | 0) >> 2] = HEAP32[(HEAP32[(HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0;
   HEAP32[($3_1 + 20 | 0) >> 2] = HEAP32[(HEAP32[(HEAP32[((HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0;
   if (!(((HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) / (2 | 0) | 0 | 0) == ((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) / (2 | 0) | 0 | 0) & 1 | 0)) {
    break label$1
   }
   label$3 : {
    if (!(((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) % (2 | 0) | 0 | 0) > ((HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) % (2 | 0) | 0 | 0) & 1 | 0)) {
     break label$3
    }
    $29(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
    $29(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
    $24(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
    $27(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
    $27(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0);
   }
  }
  global$0 = $3_1 + 32 | 0;
  return;
 }
 
 function $57($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $228 = 0, $274 = 0, $338 = 0, $351 = 0, $418 = 0, $461 = 0, $523 = 0, $562 = 0, $635 = 0;
  $3_1 = global$0 - 96 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 92 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 88 | 0) >> 2] = 1;
  i64toi32_i32$2 = HEAP32[($3_1 + 92 | 0) >> 2] | 0;
  i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  $228 = i64toi32_i32$0;
  i64toi32_i32$0 = $3_1;
  HEAP32[($3_1 + 64 | 0) >> 2] = $228;
  HEAP32[($3_1 + 68 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($3_1 + 84 | 0) >> 2] = $54($8($3_1 + 64 | 0 | 0) | 0 | 0) | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 88 | 0) >> 2] | 0 | 0) < (HEAP32[($3_1 + 84 | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$1
    }
    label$3 : {
     label$4 : {
      if (!(((HEAP32[($3_1 + 88 | 0) >> 2] | 0) + 1 | 0 | 0) < (HEAP32[($3_1 + 84 | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$4
      }
      i64toi32_i32$2 = HEAP32[($3_1 + 92 | 0) >> 2] | 0;
      i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
      $274 = i64toi32_i32$1;
      i64toi32_i32$1 = $3_1;
      HEAP32[($3_1 + 40 | 0) >> 2] = $274;
      HEAP32[($3_1 + 44 | 0) >> 2] = i64toi32_i32$0;
      HEAP32[($3_1 + 80 | 0) >> 2] = $8($3_1 + 40 | 0 | 0) | 0;
      label$5 : {
       label$6 : while (1) {
        if (!((HEAP32[($3_1 + 80 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
         break label$5
        }
        label$7 : {
         label$8 : {
          if (((HEAP32[(HEAP32[(HEAP32[(HEAP32[($3_1 + 92 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) / ($53(2 | 0, (HEAP32[($3_1 + 88 | 0) >> 2] | 0) + 1 | 0 | 0) | 0 | 0) | 0 | 0) % (2 | 0) | 0) {
           break label$8
          }
          $26(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
          break label$7;
         }
         $27(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
        }
        HEAP32[($3_1 + 80 | 0) >> 2] = (HEAP32[($3_1 + 80 | 0) >> 2] | 0) + -1 | 0;
        continue label$6;
       };
      }
      i64toi32_i32$2 = (HEAP32[($3_1 + 92 | 0) >> 2] | 0) + 8 | 0;
      i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
      i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
      $338 = i64toi32_i32$0;
      i64toi32_i32$0 = $3_1;
      HEAP32[($3_1 + 24 | 0) >> 2] = $338;
      HEAP32[($3_1 + 28 | 0) >> 2] = i64toi32_i32$1;
      HEAP32[($3_1 + 76 | 0) >> 2] = $8($3_1 + 24 | 0 | 0) | 0;
      i64toi32_i32$2 = HEAP32[($3_1 + 92 | 0) >> 2] | 0;
      i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
      $351 = i64toi32_i32$1;
      i64toi32_i32$1 = $3_1;
      HEAP32[($3_1 + 32 | 0) >> 2] = $351;
      HEAP32[($3_1 + 36 | 0) >> 2] = i64toi32_i32$0;
      HEAP32[($3_1 + 80 | 0) >> 2] = $8($3_1 + 32 | 0 | 0) | 0;
      label$9 : {
       label$10 : while (1) {
        if (!((HEAP32[($3_1 + 80 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
         break label$9
        }
        label$11 : {
         label$12 : {
          if (((HEAP32[(HEAP32[(HEAP32[(HEAP32[($3_1 + 92 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) / ($53(2 | 0, HEAP32[($3_1 + 88 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0) % (2 | 0) | 0) {
           break label$12
          }
          $26(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
          break label$11;
         }
         $56(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
         $27(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
         $56(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
        }
        HEAP32[($3_1 + 80 | 0) >> 2] = (HEAP32[($3_1 + 80 | 0) >> 2] | 0) + -1 | 0;
        continue label$10;
       };
      }
      i64toi32_i32$2 = (HEAP32[($3_1 + 92 | 0) >> 2] | 0) + 8 | 0;
      i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
      i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
      $418 = i64toi32_i32$0;
      i64toi32_i32$0 = $3_1;
      HEAP32[($3_1 + 16 | 0) >> 2] = $418;
      HEAP32[($3_1 + 20 | 0) >> 2] = i64toi32_i32$1;
      HEAP32[($3_1 + 80 | 0) >> 2] = ($8($3_1 + 16 | 0 | 0) | 0) - (HEAP32[($3_1 + 76 | 0) >> 2] | 0) | 0;
      label$13 : {
       label$14 : while (1) {
        if (!((HEAP32[($3_1 + 80 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
         break label$13
        }
        $55(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
        HEAP32[($3_1 + 80 | 0) >> 2] = (HEAP32[($3_1 + 80 | 0) >> 2] | 0) + -1 | 0;
        continue label$14;
       };
      }
      i64toi32_i32$2 = (HEAP32[($3_1 + 92 | 0) >> 2] | 0) + 8 | 0;
      i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
      $461 = i64toi32_i32$1;
      i64toi32_i32$1 = $3_1;
      HEAP32[($3_1 + 8 | 0) >> 2] = $461;
      HEAP32[($3_1 + 12 | 0) >> 2] = i64toi32_i32$0;
      HEAP32[($3_1 + 80 | 0) >> 2] = $8($3_1 + 8 | 0 | 0) | 0;
      label$15 : {
       label$16 : while (1) {
        if (!((HEAP32[($3_1 + 80 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
         break label$15
        }
        label$17 : {
         label$18 : {
          if (!(((HEAP32[(HEAP32[(HEAP32[((HEAP32[($3_1 + 92 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) / ($53(2 | 0, HEAP32[($3_1 + 88 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0) % (2 | 0) | 0)) {
           break label$18
          }
          $55(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
          break label$17;
         }
         $28(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
        }
        HEAP32[($3_1 + 80 | 0) >> 2] = (HEAP32[($3_1 + 80 | 0) >> 2] | 0) + -1 | 0;
        continue label$16;
       };
      }
      i64toi32_i32$2 = (HEAP32[($3_1 + 92 | 0) >> 2] | 0) + 8 | 0;
      i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
      i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
      $523 = i64toi32_i32$0;
      i64toi32_i32$0 = $3_1;
      HEAP32[$3_1 >> 2] = $523;
      HEAP32[($3_1 + 4 | 0) >> 2] = i64toi32_i32$1;
      HEAP32[($3_1 + 80 | 0) >> 2] = $8($3_1 | 0) | 0;
      label$19 : {
       label$20 : while (1) {
        if (!((HEAP32[($3_1 + 80 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
         break label$19
        }
        $55(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
        HEAP32[($3_1 + 80 | 0) >> 2] = (HEAP32[($3_1 + 80 | 0) >> 2] | 0) + -1 | 0;
        continue label$20;
       };
      }
      HEAP32[($3_1 + 88 | 0) >> 2] = (HEAP32[($3_1 + 88 | 0) >> 2] | 0) + 2 | 0;
      break label$3;
     }
     i64toi32_i32$2 = HEAP32[($3_1 + 92 | 0) >> 2] | 0;
     i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
     i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
     $562 = i64toi32_i32$1;
     i64toi32_i32$1 = $3_1;
     HEAP32[($3_1 + 56 | 0) >> 2] = $562;
     HEAP32[($3_1 + 60 | 0) >> 2] = i64toi32_i32$0;
     HEAP32[($3_1 + 80 | 0) >> 2] = $8($3_1 + 56 | 0 | 0) | 0;
     label$21 : {
      label$22 : while (1) {
       if (!((HEAP32[($3_1 + 80 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
        break label$21
       }
       label$23 : {
        label$24 : {
         if (((HEAP32[(HEAP32[(HEAP32[(HEAP32[($3_1 + 92 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) / ($53(2 | 0, HEAP32[($3_1 + 88 | 0) >> 2] | 0 | 0) | 0 | 0) | 0 | 0) % (2 | 0) | 0) {
          break label$24
         }
         $56(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
         $26(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
         $56(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
         break label$23;
        }
        $56(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
        $27(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
        $56(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
       }
       HEAP32[($3_1 + 80 | 0) >> 2] = (HEAP32[($3_1 + 80 | 0) >> 2] | 0) + -1 | 0;
       continue label$22;
      };
     }
     i64toi32_i32$2 = (HEAP32[($3_1 + 92 | 0) >> 2] | 0) + 8 | 0;
     i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
     i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
     $635 = i64toi32_i32$0;
     i64toi32_i32$0 = $3_1;
     HEAP32[($3_1 + 48 | 0) >> 2] = $635;
     HEAP32[($3_1 + 52 | 0) >> 2] = i64toi32_i32$1;
     HEAP32[($3_1 + 80 | 0) >> 2] = $8($3_1 + 48 | 0 | 0) | 0;
     label$25 : {
      label$26 : while (1) {
       if (!((HEAP32[($3_1 + 80 | 0) >> 2] | 0 | 0) > (0 | 0) & 1 | 0)) {
        break label$25
       }
       $55(HEAP32[($3_1 + 92 | 0) >> 2] | 0 | 0);
       HEAP32[($3_1 + 80 | 0) >> 2] = (HEAP32[($3_1 + 80 | 0) >> 2] | 0) + -1 | 0;
       continue label$26;
      };
     }
     HEAP32[($3_1 + 88 | 0) >> 2] = (HEAP32[($3_1 + 88 | 0) >> 2] | 0) + 1 | 0;
    }
    continue label$2;
   };
  }
  global$0 = $3_1 + 96 | 0;
  return;
 }
 
 function $58($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $89_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    if ((HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$3
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$4 : {
    label$5 : {
     label$6 : {
      if ($78(HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, 1058 | 0, 3 | 0) | 0) {
       break label$6
      }
      if (!($78(HEAP32[(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0 | 0, 1068 | 0, 3 | 0) | 0)) {
       break label$5
      }
     }
     label$7 : {
      if ($78(HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, 1068 | 0, 3 | 0) | 0) {
       break label$7
      }
      if (!($78(HEAP32[(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0 | 0, 1058 | 0, 3 | 0) | 0)) {
       break label$5
      }
     }
     label$8 : {
      if ($78(HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, 1065 | 0, 3 | 0) | 0) {
       break label$8
      }
      if (!($78(HEAP32[(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0 | 0, 1064 | 0, 4 | 0) | 0)) {
       break label$5
      }
     }
     label$9 : {
      if ($78(HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, 1064 | 0, 4 | 0) | 0) {
       break label$9
      }
      if (!($78(HEAP32[(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0 | 0, 1065 | 0, 3 | 0) | 0)) {
       break label$5
      }
     }
     label$10 : {
      if ($78(HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, 1055 | 0, 3 | 0) | 0) {
       break label$10
      }
      if (!($78(HEAP32[(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0 | 0, 1054 | 0, 4 | 0) | 0)) {
       break label$5
      }
     }
     if ($78(HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0 | 0, 1054 | 0, 4 | 0) | 0) {
      break label$4
     }
     if ($78(HEAP32[(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0 | 0, 1055 | 0, 3 | 0) | 0) {
      break label$4
     }
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 1;
    break label$1;
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = 0;
  }
  $89_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $89_1 | 0;
 }
 
 function $59($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $64_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 20 | 0) >> 2] = $21(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, 1 | 0) | 0;
  HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
    break label$1;
   }
   label$3 : {
    if ((HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$3
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
    break label$1;
   }
   label$4 : {
    label$5 : while (1) {
     if (!((HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$4
     }
     label$6 : {
      label$7 : {
       if (!($58(HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0) | 0)) {
        break label$7
       }
       HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0;
       HEAP32[($3_1 + 8 | 0) >> 2] = $17($3_1 + 20 | 0 | 0, HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) | 0;
       $10(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, 2 | 0);
       HEAP32[($3_1 + 8 | 0) >> 2] = $17($3_1 + 20 | 0 | 0, HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0) | 0;
       $10(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, 2 | 0);
       label$8 : {
        label$9 : {
         if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
          break label$9
         }
         HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
         break label$8;
        }
        HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
       }
       break label$6;
      }
      HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     }
     continue label$5;
    };
   }
   HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
  }
  $64_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $64_1 | 0;
 }
 
 function $60($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = Math_imul(HEAP32[($3_1 + 4 | 0) >> 2] | 0, -1);
    break label$1;
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $61($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $13_1 = 0, $30_1 = 0, $38_1 = 0, $54_1 = 0, $58_1 = 0, $71_1 = 0, $84_1 = 0, $125_1 = 0, $132_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = 0;
  HEAP32[($4_1 + 8 | 0) >> 2] = 0;
  HEAP32[($4_1 + 4 | 0) >> 2] = 0;
  $13_1 = 24;
  label$1 : {
   label$2 : {
    if (!((((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) << $13_1 | 0) >> $13_1 | 0 | 0) == (45 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($4_1 + 16 | 0) >> 2] = (HEAP32[($4_1 + 16 | 0) >> 2] | 0) + 1 | 0;
    HEAP32[($4_1 + 4 | 0) >> 2] = 1;
    $30_1 = 24;
    label$3 : {
     if (((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) << $30_1 | 0) >> $30_1 | 0) {
      break label$3
     }
     HEAP32[($4_1 + 28 | 0) >> 2] = 0;
     break label$1;
    }
   }
   label$4 : {
    label$5 : while (1) {
     $38_1 = 24;
     if (!((((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) << $38_1 | 0) >> $38_1 | 0 | 0) == (48 | 0) & 1 | 0)) {
      break label$4
     }
     HEAP32[($4_1 + 16 | 0) >> 2] = (HEAP32[($4_1 + 16 | 0) >> 2] | 0) + 1 | 0;
     continue label$5;
    };
   }
   label$6 : while (1) {
    $54_1 = 24;
    $58_1 = 0;
    label$7 : {
     if (!(((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) << $54_1 | 0) >> $54_1 | 0)) {
      break label$7
     }
     $58_1 = (HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) < (10 | 0);
    }
    label$8 : {
     if (!($58_1 & 1 | 0)) {
      break label$8
     }
     $71_1 = 24;
     label$9 : {
      if ($71(((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) << $71_1 | 0) >> $71_1 | 0 | 0, 1080 | 0) | 0) {
       break label$9
      }
      HEAP32[($4_1 + 28 | 0) >> 2] = 0;
      break label$1;
     }
     HEAP32[($4_1 + 8 | 0) >> 2] = Math_imul(HEAP32[($4_1 + 8 | 0) >> 2] | 0, 10);
     $84_1 = 24;
     HEAP32[($4_1 + 8 | 0) >> 2] = (HEAP32[($4_1 + 8 | 0) >> 2] | 0) + ((((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) << $84_1 | 0) >> $84_1 | 0) - 48 | 0) | 0;
     HEAP32[($4_1 + 16 | 0) >> 2] = (HEAP32[($4_1 + 16 | 0) >> 2] | 0) + 1 | 0;
     HEAP32[($4_1 + 12 | 0) >> 2] = (HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 1 | 0;
     continue label$6;
    }
    break label$6;
   };
   label$10 : {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 0) == (1 | 0) & 1 | 0)) {
     break label$10
    }
    HEAP32[($4_1 + 8 | 0) >> 2] = Math_imul(HEAP32[($4_1 + 8 | 0) >> 2] | 0, -1);
   }
   label$11 : {
    label$12 : {
     if ((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) > (2147483647 | 0) & 1 | 0) {
      break label$12
     }
     if ((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) < (-2147483648 | 0) & 1 | 0) {
      break label$12
     }
     $125_1 = 24;
     if (!(((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) << $125_1 | 0) >> $125_1 | 0)) {
      break label$11
     }
    }
    HEAP32[($4_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[(HEAP32[($4_1 + 20 | 0) >> 2] | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   HEAP32[($4_1 + 28 | 0) >> 2] = 1;
  }
  $132_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  global$0 = $4_1 + 32 | 0;
  return $132_1 | 0;
 }
 
 function $62($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + ((HEAP32[($3_1 + 8 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    $139(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + ((HEAP32[($3_1 + 8 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] | 0 | 0);
    HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  $139(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $63($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $25_1 = 0, i64toi32_i32$1 = 0;
  $5_1 = global$0 - 48 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 44 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 40 | 0) >> 2] = $2_1;
  HEAP32[(HEAP32[($5_1 + 40 | 0) >> 2] | 0) >> 2] = 0;
  $2($5_1 + 8 | 0 | 0);
  i64toi32_i32$1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  HEAP32[$0_1 >> 2] = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
  HEAP32[($0_1 + 4 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($5_1 + 36 | 0) >> 2] = (HEAP32[($5_1 + 44 | 0) >> 2] | 0) + 4 | 0;
  label$1 : {
   label$2 : {
    label$3 : while (1) {
     if (!((HEAP32[(HEAP32[($5_1 + 36 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$2
     }
     $25_1 = 24;
     HEAP32[($5_1 + 24 | 0) >> 2] = $72(HEAP32[(HEAP32[($5_1 + 36 | 0) >> 2] | 0) >> 2] | 0 | 0, (32 << $25_1 | 0) >> $25_1 | 0 | 0) | 0;
     HEAP32[($5_1 + 20 | 0) >> 2] = 0;
     label$4 : {
      label$5 : while (1) {
       if (!((HEAP32[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 20 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
        break label$4
       }
       HEAP32[($5_1 + 32 | 0) >> 2] = $138(4 | 0) | 0;
       label$6 : {
        if ((HEAP32[($5_1 + 32 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
         break label$6
        }
        break label$4;
       }
       HEAP32[($5_1 + 28 | 0) >> 2] = $61(HEAP32[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 20 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 32 | 0) >> 2] | 0 | 0) | 0;
       label$7 : {
        if (HEAP32[($5_1 + 28 | 0) >> 2] | 0) {
         break label$7
        }
        $3($0_1 | 0, 2 | 0);
        $139(HEAP32[($5_1 + 32 | 0) >> 2] | 0 | 0);
        HEAP32[(HEAP32[($5_1 + 40 | 0) >> 2] | 0) >> 2] = 1;
        $62(HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0);
        break label$1;
       }
       $4($0_1 | 0, HEAP32[($5_1 + 32 | 0) >> 2] | 0 | 0);
       HEAP32[($5_1 + 20 | 0) >> 2] = (HEAP32[($5_1 + 20 | 0) >> 2] | 0) + 1 | 0;
       continue label$5;
      };
     }
     $62(HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0);
     HEAP32[($5_1 + 36 | 0) >> 2] = (HEAP32[($5_1 + 36 | 0) >> 2] | 0) + 4 | 0;
     continue label$3;
    };
   }
  }
  global$0 = $5_1 + 48 | 0;
  return;
 }
 
 function $64($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$2 = 0, $37_1 = 0, i64toi32_i32$1 = 0, $71_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $0_1;
  i64toi32_i32$2 = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = HEAP32[i64toi32_i32$2 >> 2] | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($3_1 + 20 | 0) >> 2] = $23($3_1 + 8 | 0 | 0, 1 | 0, 2 | 0) | 0;
  $65(HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    if (!((HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   label$4 : while (1) {
    $37_1 = 0;
    label$5 : {
     if (!((HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$5
     }
     $37_1 = (HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0);
    }
    label$6 : {
     if (!($37_1 & 1 | 0)) {
      break label$6
     }
     label$7 : {
      if (!((HEAP32[(HEAP32[(HEAP32[($3_1 + 16 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) == (HEAP32[(HEAP32[(HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
       break label$7
      }
      $81($3_1 + 20 | 0 | 0, 2 | 0);
      HEAP32[($3_1 + 28 | 0) >> 2] = 1;
      break label$1;
     }
     HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     continue label$4;
    }
    break label$4;
   };
   $81($3_1 + 20 | 0 | 0, 2 | 0);
   HEAP32[($3_1 + 28 | 0) >> 2] = 0;
  }
  $71_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $71_1 | 0;
 }
 
 function $65($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $47_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $84(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 20 | 0) >> 2] = 1;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) == (1 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($3_1 + 20 | 0) >> 2] = 0;
    HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    label$3 : {
     label$4 : while (1) {
      if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) < ((HEAP32[($3_1 + 24 | 0) >> 2] | 0) - 1 | 0 | 0) & 1 | 0)) {
       break label$3
      }
      label$5 : {
       if (!(($66(HEAP32[(HEAP32[($3_1 + 16 | 0) >> 2] | 0) >> 2] | 0 | 0, HEAP32[(HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0 | 0) | 0 | 0) > (0 | 0) & 1 | 0)) {
        break label$5
       }
       $67(HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0, HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0);
       HEAP32[($3_1 + 20 | 0) >> 2] = 1;
      }
      HEAP32[($3_1 + 12 | 0) >> 2] = (HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 1 | 0;
      HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
      continue label$4;
     };
    }
    continue label$2;
   };
  }
  $47_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $47_1 | 0;
 }
 
 function $66($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  return (HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0) - (HEAP32[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 2] | 0) | 0 | 0;
 }
 
 function $67($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0;
  HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] = HEAP32[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 2] | 0;
  HEAP32[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
  return;
 }
 
 function $68($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $31_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 1;
    break label$1;
   }
   label$3 : {
    if (!((HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 1;
    break label$1;
   }
   label$4 : while (1) {
    $31_1 = 0;
    label$5 : {
     if (!((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$5
     }
     $31_1 = (HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0);
    }
    label$6 : {
     if (!($31_1 & 1 | 0)) {
      break label$6
     }
     label$7 : {
      label$8 : {
       if (!((HEAP32[(HEAP32[(HEAP32[($3_1 + 4 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) <= (HEAP32[(HEAP32[(HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >> 2] | 0) >> 2] | 0 | 0) & 1 | 0)) {
        break label$8
       }
       break label$7;
      }
      HEAP32[($3_1 + 12 | 0) >> 2] = 0;
      break label$1;
     }
     HEAP32[($3_1 + 4 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     continue label$4;
    }
    break label$4;
   };
   HEAP32[($3_1 + 12 | 0) >> 2] = 1;
  }
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $69($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$1 = 0, $39_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  i64toi32_i32$2 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
  HEAP32[$3_1 >> 2] = HEAP32[i64toi32_i32$2 >> 2] | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = i64toi32_i32$1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $65($23($3_1 | 0, 1 | 0, 2 | 0) | 0 | 0) | 0;
  HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[(HEAP32[($3_1 + 28 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($3_1 + 20 | 0) >> 2] = 0;
    HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
    label$3 : {
     label$4 : while (1) {
      if (!($66(HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0, HEAP32[(HEAP32[($3_1 + 16 | 0) >> 2] | 0) >> 2] | 0 | 0) | 0)) {
       break label$3
      }
      HEAP32[($3_1 + 20 | 0) >> 2] = (HEAP32[($3_1 + 20 | 0) >> 2] | 0) + 1 | 0;
      HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
      continue label$4;
     };
    }
    HEAP32[(HEAP32[(HEAP32[($3_1 + 16 | 0) >> 2] | 0) >> 2] | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
    HEAP32[($3_1 + 16 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
    continue label$2;
   };
  }
  $81($3_1 + 24 | 0 | 0, 2 | 0);
  $39_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $39_1 | 0;
 }
 
 function $70($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$2 = 0, $278 = 0, $368 = 0, $378 = 0, $401 = 0, $429 = 0, $457 = 0, $485 = 0, $513 = 0, $541 = 0, $569 = 0, $218 = 0;
  $4_1 = global$0 - 128 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 124 | 0) >> 2] = 0;
  HEAP32[($4_1 + 120 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 116 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($4_1 + 120 | 0) >> 2] | 0 | 0) == (1 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($4_1 + 124 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($4_1 + 112 | 0) >> 2] = 0;
   $63($4_1 + 80 | 0 | 0, HEAP32[($4_1 + 116 | 0) >> 2] | 0 | 0, $4_1 + 112 | 0 | 0);
   i64toi32_i32$2 = $4_1;
   i64toi32_i32$0 = HEAP32[($4_1 + 80 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[($4_1 + 84 | 0) >> 2] | 0;
   $278 = i64toi32_i32$0;
   i64toi32_i32$0 = $4_1 + 88 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $278;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   label$3 : {
    if (!(HEAP32[($4_1 + 112 | 0) >> 2] | 0)) {
     break label$3
    }
    $3($4_1 + 88 | 0 | 0, 2 | 0);
    $137(2 | 0, 1149 | 0, 6 | 0) | 0;
    HEAP32[($4_1 + 124 | 0) >> 2] = 0;
    break label$1;
   }
   label$4 : {
    if (!(($64($4_1 + 88 | 0 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
     break label$4
    }
    $137(2 | 0, 1149 | 0, 6 | 0) | 0;
    $3($4_1 + 88 | 0 | 0, 2 | 0);
    HEAP32[($4_1 + 124 | 0) >> 2] = 0;
    break label$1;
   }
   label$5 : {
    if (!(($68($4_1 + 88 | 0 | 0) | 0 | 0) == (1 | 0) & 1 | 0)) {
     break label$5
    }
    $3($4_1 + 88 | 0 | 0, 2 | 0);
    HEAP32[($4_1 + 124 | 0) >> 2] = 0;
    break label$1;
   }
   $69($4_1 + 88 | 0 | 0) | 0;
   $2($4_1 + 72 | 0 | 0);
   i64toi32_i32$2 = $4_1;
   i64toi32_i32$1 = HEAP32[($4_1 + 72 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[($4_1 + 76 | 0) >> 2] | 0;
   $368 = i64toi32_i32$1;
   i64toi32_i32$1 = ($4_1 + 88 | 0) + 8 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $368;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   HEAP32[($4_1 + 104 | 0) >> 2] = 0;
   i64toi32_i32$2 = $4_1 + 88 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $378 = i64toi32_i32$0;
   i64toi32_i32$0 = $4_1;
   HEAP32[($4_1 + 56 | 0) >> 2] = $378;
   HEAP32[($4_1 + 60 | 0) >> 2] = i64toi32_i32$1;
   label$6 : {
    label$7 : {
     if (!(($8($4_1 + 56 | 0 | 0) | 0) >>> 0 <= 1 >>> 0 & 1 | 0)) {
      break label$7
     }
     break label$6;
    }
    i64toi32_i32$2 = $4_1 + 88 | 0;
    i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
    i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
    $401 = i64toi32_i32$1;
    i64toi32_i32$1 = $4_1;
    HEAP32[($4_1 + 48 | 0) >> 2] = $401;
    HEAP32[($4_1 + 52 | 0) >> 2] = i64toi32_i32$0;
    label$8 : {
     label$9 : {
      if (!(($8($4_1 + 48 | 0 | 0) | 0 | 0) == (2 | 0) & 1 | 0)) {
       break label$9
      }
      $35($4_1 + 88 | 0 | 0);
      break label$8;
     }
     i64toi32_i32$2 = $4_1 + 88 | 0;
     i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
     i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
     $429 = i64toi32_i32$0;
     i64toi32_i32$0 = $4_1;
     HEAP32[($4_1 + 40 | 0) >> 2] = $429;
     HEAP32[($4_1 + 44 | 0) >> 2] = i64toi32_i32$1;
     label$10 : {
      label$11 : {
       if (!(($8($4_1 + 40 | 0 | 0) | 0 | 0) == (3 | 0) & 1 | 0)) {
        break label$11
       }
       $36($4_1 + 88 | 0 | 0);
       break label$10;
      }
      i64toi32_i32$2 = $4_1 + 88 | 0;
      i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
      i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
      $457 = i64toi32_i32$1;
      i64toi32_i32$1 = $4_1;
      HEAP32[($4_1 + 32 | 0) >> 2] = $457;
      HEAP32[($4_1 + 36 | 0) >> 2] = i64toi32_i32$0;
      label$12 : {
       label$13 : {
        if (!(($8($4_1 + 32 | 0 | 0) | 0 | 0) == (4 | 0) & 1 | 0)) {
         break label$13
        }
        $38($4_1 + 88 | 0 | 0);
        break label$12;
       }
       i64toi32_i32$2 = $4_1 + 88 | 0;
       i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
       i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
       $485 = i64toi32_i32$0;
       i64toi32_i32$0 = $4_1;
       HEAP32[($4_1 + 24 | 0) >> 2] = $485;
       HEAP32[($4_1 + 28 | 0) >> 2] = i64toi32_i32$1;
       label$14 : {
        label$15 : {
         if (!(($8($4_1 + 24 | 0 | 0) | 0 | 0) == (5 | 0) & 1 | 0)) {
          break label$15
         }
         $39($4_1 + 88 | 0 | 0);
         break label$14;
        }
        i64toi32_i32$2 = $4_1 + 88 | 0;
        i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
        i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
        $513 = i64toi32_i32$1;
        i64toi32_i32$1 = $4_1;
        HEAP32[($4_1 + 16 | 0) >> 2] = $513;
        HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$0;
        label$16 : {
         label$17 : {
          if (!(($8($4_1 + 16 | 0 | 0) | 0) >>> 0 < 50 >>> 0 & 1 | 0)) {
           break label$17
          }
          $57($4_1 + 88 | 0 | 0);
          break label$16;
         }
         i64toi32_i32$2 = $4_1 + 88 | 0;
         i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
         i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
         $541 = i64toi32_i32$0;
         i64toi32_i32$0 = $4_1;
         HEAP32[($4_1 + 8 | 0) >> 2] = $541;
         HEAP32[($4_1 + 12 | 0) >> 2] = i64toi32_i32$1;
         label$18 : {
          label$19 : {
           if (!(($8($4_1 + 8 | 0 | 0) | 0) >>> 0 < 150 >>> 0 & 1 | 0)) {
            break label$19
           }
           $42($4_1 + 88 | 0 | 0);
           break label$18;
          }
          i64toi32_i32$2 = $4_1 + 88 | 0;
          i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
          i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
          $569 = i64toi32_i32$1;
          i64toi32_i32$1 = $4_1;
          HEAP32[$4_1 >> 2] = $569;
          HEAP32[($4_1 + 4 | 0) >> 2] = i64toi32_i32$0;
          label$20 : {
           label$21 : {
            if (!(($8($4_1 | 0) | 0) >>> 0 < 600 >>> 0 & 1 | 0)) {
             break label$21
            }
            $52($4_1 + 88 | 0 | 0);
            break label$20;
           }
           $57($4_1 + 88 | 0 | 0);
          }
         }
        }
       }
      }
     }
    }
   }
   HEAP32[($4_1 + 68 | 0) >> 2] = $59(HEAP32[($4_1 + 104 | 0) >> 2] | 0 | 0) | 0;
   $1(HEAP32[($4_1 + 68 | 0) >> 2] | 0 | 0);
   $81(($4_1 + 88 | 0) + 16 | 0 | 0, 2 | 0);
   $11(HEAP32[($4_1 + 68 | 0) >> 2] | 0 | 0, 2 | 0);
   $3($4_1 + 88 | 0 | 0, 2 | 0);
   $3(($4_1 + 88 | 0) + 8 | 0 | 0, 2 | 0);
  }
  $218 = HEAP32[($4_1 + 124 | 0) >> 2] | 0;
  global$0 = $4_1 + 128 | 0;
  return $218 | 0;
 }
 
 function $71($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $18_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    label$3 : while (1) {
     if (!(((HEAPU8[(HEAP32[($4_1 + 4 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0 | 0) != (0 & 255 | 0 | 0) & 1 | 0)) {
      break label$2
     }
     $18_1 = 24;
     label$4 : {
      if (!((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) == (((HEAPU8[(HEAP32[($4_1 + 4 | 0) >> 2] | 0) >> 0] | 0) << $18_1 | 0) >> $18_1 | 0 | 0) & 1 | 0)) {
       break label$4
      }
      HEAP32[($4_1 + 12 | 0) >> 2] = 1;
      break label$1;
     }
     HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 1 | 0;
     continue label$3;
    };
   }
   HEAP32[($4_1 + 12 | 0) >> 2] = 0;
  }
  return HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $72($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0, $28_1 = 0, $39_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP8[($4_1 + 23 | 0) >> 0] = $1_1;
  $7_1 = 24;
  HEAP32[($4_1 + 16 | 0) >> 2] = $73(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0, ((HEAPU8[($4_1 + 23 | 0) >> 0] | 0) << $7_1 | 0) >> $7_1 | 0 | 0) | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $138(((HEAP32[($4_1 + 16 | 0) >> 2] | 0) + 1 | 0) << 2 | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($4_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   $28_1 = 24;
   HEAP32[($4_1 + 8 | 0) >> 2] = $74(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0, ((HEAPU8[($4_1 + 23 | 0) >> 0] | 0) << $28_1 | 0) >> $28_1 | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0;
   label$3 : {
    if (!(HEAP32[($4_1 + 8 | 0) >> 2] | 0)) {
     break label$3
    }
    $75(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, (HEAP32[($4_1 + 16 | 0) >> 2] | 0) + 1 | 0 | 0);
    HEAP32[($4_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  }
  $39_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  global$0 = $4_1 + 32 | 0;
  return $39_1 | 0;
 }
 
 function $73($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $23_1 = 0, $27_1 = 0, $41_1 = 0, $45_1 = 0, $59_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP8[($4_1 + 11 | 0) >> 0] = $1_1;
  HEAP32[$4_1 >> 2] = 0;
  HEAP32[($4_1 + 4 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!(((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != (0 & 255 | 0 | 0) & 1 | 0)) {
     break label$1
    }
    $23_1 = 24;
    $27_1 = 24;
    label$3 : {
     if (!((((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) << $23_1 | 0) >> $23_1 | 0 | 0) != (((HEAPU8[($4_1 + 11 | 0) >> 0] | 0) << $27_1 | 0) >> $27_1 | 0 | 0) & 1 | 0)) {
      break label$3
     }
     $41_1 = 24;
     $45_1 = 24;
     label$4 : {
      if ((((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 1 | 0) | 0) >> 0] | 0) << $41_1 | 0) >> $41_1 | 0 | 0) == (((HEAPU8[($4_1 + 11 | 0) >> 0] | 0) << $45_1 | 0) >> $45_1 | 0 | 0) & 1 | 0) {
       break label$4
      }
      $59_1 = 24;
      if (((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 1 | 0) | 0) >> 0] | 0) << $59_1 | 0) >> $59_1 | 0) {
       break label$3
      }
     }
     HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) + 1 | 0;
    }
    HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  return HEAP32[$4_1 >> 2] | 0 | 0;
 }
 
 function $74($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $24_1 = 0, $28_1 = 0, $43_1 = 0, $53_1 = 0, $57_1 = 0, $66_1 = 0, $73_1 = 0, $91_1 = 0, $123_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
  HEAP8[($5_1 + 23 | 0) >> 0] = $1_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = 0;
  HEAP32[($5_1 + 8 | 0) >> 2] = 0;
  label$1 : {
   label$2 : {
    label$3 : while (1) {
     if (!(((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[($5_1 + 8 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != (0 & 255 | 0 | 0) & 1 | 0)) {
      break label$2
     }
     label$4 : {
      label$5 : while (1) {
       $24_1 = 24;
       $28_1 = 24;
       if (!((((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[($5_1 + 8 | 0) >> 2] | 0) | 0) >> 0] | 0) << $24_1 | 0) >> $24_1 | 0 | 0) == (((HEAPU8[($5_1 + 23 | 0) >> 0] | 0) << $28_1 | 0) >> $28_1 | 0 | 0) & 1 | 0)) {
        break label$4
       }
       HEAP32[($5_1 + 8 | 0) >> 2] = (HEAP32[($5_1 + 8 | 0) >> 2] | 0) + 1 | 0;
       continue label$5;
      };
     }
     $43_1 = 24;
     label$6 : {
      if (!(((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[($5_1 + 8 | 0) >> 2] | 0) | 0) >> 0] | 0) << $43_1 | 0) >> $43_1 | 0)) {
       break label$6
      }
      HEAP32[($5_1 + 4 | 0) >> 2] = 0;
      label$7 : while (1) {
       $53_1 = 24;
       $57_1 = 24;
       $66_1 = 0;
       label$8 : {
        if (!((((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0) | 0) >> 0] | 0) << $53_1 | 0) >> $53_1 | 0 | 0) != (((HEAPU8[($5_1 + 23 | 0) >> 0] | 0) << $57_1 | 0) >> $57_1 | 0 | 0) & 1 | 0)) {
         break label$8
        }
        $73_1 = 24;
        $66_1 = (((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0) | 0) >> 0] | 0) << $73_1 | 0) >> $73_1 | 0 | 0) != (0 | 0);
       }
       label$9 : {
        if (!($66_1 & 1 | 0)) {
         break label$9
        }
        HEAP32[($5_1 + 4 | 0) >> 2] = (HEAP32[($5_1 + 4 | 0) >> 2] | 0) + 1 | 0;
        continue label$7;
       }
       break label$7;
      };
      $91_1 = $79(HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, (HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0 | 0) | 0;
      HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 12 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] = $91_1;
      label$10 : {
       if ((HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 12 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
        break label$10
       }
       HEAP32[($5_1 + 28 | 0) >> 2] = 1;
       break label$1;
      }
      HEAP32[($5_1 + 12 | 0) >> 2] = (HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 1 | 0;
      HEAP32[($5_1 + 8 | 0) >> 2] = (HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[($5_1 + 4 | 0) >> 2] | 0) | 0;
     }
     continue label$3;
    };
   }
   HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 12 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] = 0;
   HEAP32[($5_1 + 28 | 0) >> 2] = 0;
  }
  $123_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
  global$0 = $5_1 + 32 | 0;
  return $123_1 | 0;
 }
 
 function $75($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0) >>> 0 < (HEAP32[($4_1 + 8 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$1
    }
    label$3 : {
     if (!((HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$3
     }
     $139(HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) << 2 | 0) | 0) >> 2] | 0 | 0);
    }
    HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  $139(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $76($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $43_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 16 | 0) >> 2] = $77(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 20 | 0) >> 2] = $138(((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 1 | 0) << 0 | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
    break label$1;
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = 0;
   label$3 : {
    label$4 : while (1) {
     if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0) >>> 0 < (HEAP32[($3_1 + 16 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
      break label$3
     }
     HEAP8[((HEAP32[($3_1 + 20 | 0) >> 2] | 0) + (HEAP32[($3_1 + 12 | 0) >> 2] | 0) | 0) >> 0] = HEAPU8[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + (HEAP32[($3_1 + 12 | 0) >> 2] | 0) | 0) >> 0] | 0;
     HEAP32[($3_1 + 12 | 0) >> 2] = (HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 1 | 0;
     continue label$4;
    };
   }
   HEAP8[((HEAP32[($3_1 + 20 | 0) >> 2] | 0) + (HEAP32[($3_1 + 12 | 0) >> 2] | 0) | 0) >> 0] = 0;
   HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
  }
  $43_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $43_1 | 0;
 }
 
 function $77($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!(((HEAPU8[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + (HEAP32[($3_1 + 8 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != (0 & 255 | 0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  return HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0;
 }
 
 function $78($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $15_1 = 0, $11_1 = 0, $20_1 = 0, $27_1 = 0;
  $5_1 = global$0 - 32 | 0;
  HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = 0;
  label$1 : while (1) {
   $11_1 = 24;
   $15_1 = 0;
   label$2 : {
    if (!(((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[($5_1 + 12 | 0) >> 2] | 0) | 0) >> 0] | 0) << $11_1 | 0) >> $11_1 | 0)) {
     break label$2
    }
    $20_1 = 24;
    $27_1 = 24;
    $15_1 = 0;
    if (!((((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[($5_1 + 12 | 0) >> 2] | 0) | 0) >> 0] | 0) << $20_1 | 0) >> $20_1 | 0 | 0) == (((HEAPU8[((HEAP32[($5_1 + 20 | 0) >> 2] | 0) + (HEAP32[($5_1 + 12 | 0) >> 2] | 0) | 0) >> 0] | 0) << $27_1 | 0) >> $27_1 | 0 | 0) & 1 | 0)) {
     break label$2
    }
    $15_1 = (HEAP32[($5_1 + 12 | 0) >> 2] | 0) >>> 0 < (HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0;
   }
   label$3 : {
    if (!($15_1 & 1 | 0)) {
     break label$3
    }
    HEAP32[($5_1 + 12 | 0) >> 2] = (HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 1 | 0;
    continue label$1;
   }
   break label$1;
  };
  label$4 : {
   label$5 : {
    if (!((HEAP32[($5_1 + 12 | 0) >> 2] | 0) >>> 0 < (HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$5
    }
    HEAP32[($5_1 + 28 | 0) >> 2] = ((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[($5_1 + 12 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0) - ((HEAPU8[((HEAP32[($5_1 + 20 | 0) >> 2] | 0) + (HEAP32[($5_1 + 12 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0) | 0;
    break label$4;
   }
   HEAP32[($5_1 + 28 | 0) >> 2] = 0;
  }
  return HEAP32[($5_1 + 28 | 0) >> 2] | 0 | 0;
 }
 
 function $79($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $82_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!(((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[($5_1 + 12 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != (0 & 255 | 0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($5_1 + 12 | 0) >> 2] = (HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  label$3 : {
   if (!((HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0 > (HEAP32[($5_1 + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
    break label$3
   }
   HEAP32[($5_1 + 16 | 0) >> 2] = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  }
  label$4 : {
   if (!((HEAP32[($5_1 + 20 | 0) >> 2] | 0) >>> 0 > (HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
    break label$4
   }
   HEAP32[($5_1 + 20 | 0) >> 2] = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
  }
  HEAP32[($5_1 + 8 | 0) >> 2] = (HEAP32[($5_1 + 16 | 0) >> 2] | 0) - (HEAP32[($5_1 + 20 | 0) >> 2] | 0) | 0;
  HEAP32[($5_1 + 4 | 0) >> 2] = $138(((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + 1 | 0) << 0 | 0 | 0) | 0;
  label$5 : {
   label$6 : {
    if ((HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$6
    }
    HEAP32[($5_1 + 28 | 0) >> 2] = 0;
    break label$5;
   }
   HEAP32[$5_1 >> 2] = 0;
   label$7 : {
    label$8 : while (1) {
     if (!(((HEAP32[($5_1 + 20 | 0) >> 2] | 0) + (HEAP32[$5_1 >> 2] | 0) | 0) >>> 0 < (HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
      break label$7
     }
     HEAP8[((HEAP32[($5_1 + 4 | 0) >> 2] | 0) + (HEAP32[$5_1 >> 2] | 0) | 0) >> 0] = HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 20 | 0) >> 2] | 0) + (HEAP32[$5_1 >> 2] | 0) | 0) | 0) >> 0] | 0;
     HEAP32[$5_1 >> 2] = (HEAP32[$5_1 >> 2] | 0) + 1 | 0;
     continue label$8;
    };
   }
   HEAP8[((HEAP32[($5_1 + 4 | 0) >> 2] | 0) + (HEAP32[$5_1 >> 2] | 0) | 0) >> 0] = 0;
   HEAP32[($5_1 + 28 | 0) >> 2] = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
  }
  $82_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
  global$0 = $5_1 + 32 | 0;
  return $82_1 | 0;
 }
 
 function $80($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if ((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    break label$1;
   }
   HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0;
   label$3 : {
    label$4 : while (1) {
     if (!((HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$3
     }
     HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
     continue label$4;
    };
   }
   HEAP32[((HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  }
  return;
 }
 
 function $81($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    label$3 : {
     if (!((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$3
     }
     if ((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
      break label$2
     }
    }
    break label$1;
   }
   label$4 : while (1) {
    if (!((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
    $82(HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
    HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0;
    continue label$4;
   };
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $82($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    label$3 : {
     if (!((HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
      break label$3
     }
     if ((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
      break label$2
     }
    }
    break label$1;
   }
   FUNCTION_TABLE[HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0](HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0);
   $139(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0);
  }
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $83($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $19_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $138(8 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[(HEAP32[($3_1 + 4 | 0) >> 2] | 0) >> 2] = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $19_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $19_1 | 0;
 }
 
 function $84($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$1
    }
    HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 1 | 0;
    HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0;
    continue label$2;
   };
  }
  return HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0;
 }
 
 function $85($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $19_1 = 0, $23_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = 0;
  HEAP32[($5_1 + 16 | 0) >> 2] = $88(HEAP32[($5_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   if (!((HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$1
   }
   $19_1 = $95(HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($5_1 + 12 | 0) >> 2] = (HEAP32[($5_1 + 12 | 0) >> 2] | 0) + $19_1 | 0;
   $96(HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0);
  }
  $23_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  global$0 = $5_1 + 32 | 0;
  return $23_1 | 0;
 }
 
 function $86($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $23_1 = 0, $43_1 = 0, $37_1 = 0, $44_1 = 0, $50_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = 0;
  HEAP32[$4_1 >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!(((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != (0 & 255 | 0 | 0) & 1 | 0)) {
     break label$1
    }
    $23_1 = 24;
    label$3 : {
     label$4 : {
      if (!((((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) << $23_1 | 0) >> $23_1 | 0 | 0) == (37 | 0) & 1 | 0)) {
       break label$4
      }
      $37_1 = $85(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $4_1 + 4 | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) | 0;
      HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) + $37_1 | 0;
      break label$3;
     }
     $43_1 = 1;
     $44_1 = $137($43_1 | 0, (HEAP32[($4_1 + 12 | 0) >> 2] | 0) + (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0 | 0, $43_1 | 0) | 0;
     HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) + $44_1 | 0;
     HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    }
    continue label$2;
   };
  }
  $50_1 = HEAP32[$4_1 >> 2] | 0;
  global$0 = $4_1 + 16 | 0;
  return $50_1 | 0;
 }
 
 function $87($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $11_1 = 0, $25_1 = 0, $39_1 = 0, $49_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  $11_1 = 24;
  label$1 : {
   label$2 : {
    if (!($71(((HEAPU8[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $11_1 | 0) >> $11_1 | 0 | 0, 1120 | 0) | 0)) {
     break label$2
    }
    HEAP32[$5_1 >> 2] = $89(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $25_1 = 24;
   label$3 : {
    label$4 : {
     if (!($71(((HEAPU8[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $25_1 | 0) >> $25_1 | 0 | 0, 1081 | 0) | 0)) {
      break label$4
     }
     HEAP32[$5_1 >> 2] = $91(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0;
     break label$3;
    }
    $39_1 = 24;
    label$5 : {
     label$6 : {
      if (!($71(((HEAPU8[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $39_1 | 0) >> $39_1 | 0 | 0, 1116 | 0) | 0)) {
       break label$6
      }
      HEAP32[$5_1 >> 2] = $92(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0) | 0;
      break label$5;
     }
     HEAP32[$5_1 >> 2] = 1;
    }
   }
  }
  $49_1 = HEAP32[$5_1 >> 2] | 0;
  global$0 = $5_1 + 16 | 0;
  return $49_1 | 0;
 }
 
 function $88($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $11_1 = 0, $21_1 = 0, $40_1 = 0, $46_1 = 0, $60_1 = 0, $78_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = $2_1;
  $11_1 = 24;
  label$1 : {
   label$2 : {
    if (!((((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $11_1 | 0) >> $11_1 | 0 | 0) != (37 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($5_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   $21_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
   HEAP32[$21_1 >> 2] = (HEAP32[$21_1 >> 2] | 0) + 1 | 0;
   HEAP32[($5_1 + 12 | 0) >> 2] = $94() | 0;
   label$3 : {
    if ((HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$3
    }
    HEAP32[($5_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($5_1 + 8 | 0) >> 2] = 0;
   label$4 : while (1) {
    $40_1 = 24;
    $46_1 = 0;
    label$5 : {
     if (!($71(((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $40_1 | 0) >> $40_1 | 0 | 0, 1093 | 0) | 0)) {
      break label$5
     }
     $46_1 = (HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) == (0 | 0);
    }
    label$6 : {
     if (!($46_1 & 1 | 0)) {
      break label$6
     }
     $60_1 = 24;
     label$7 : {
      if (!($71(((HEAPU8[((HEAP32[($5_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $60_1 | 0) >> $60_1 | 0 | 0, 1133 | 0) | 0)) {
       break label$7
      }
      HEAP32[($5_1 + 8 | 0) >> 2] = $93(HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 16 | 0) >> 2] | 0 | 0) | 0;
      label$8 : {
       if (HEAP32[($5_1 + 8 | 0) >> 2] | 0) {
        break label$8
       }
       HEAP32[($5_1 + 28 | 0) >> 2] = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
       break label$1;
      }
     }
     HEAP32[($5_1 + 8 | 0) >> 2] = $87(HEAP32[($5_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 20 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0) | 0;
     continue label$4;
    }
    break label$4;
   };
   $139(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
   HEAP32[($5_1 + 28 | 0) >> 2] = 0;
  }
  $78_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
  global$0 = $5_1 + 32 | 0;
  return $78_1 | 0;
 }
 
 function $89($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $11_1 = 0, $30_1 = 0, $49_1 = 0, $68_1 = 0, $87_1 = 0, $102_1 = 0;
  $5_1 = global$0 - 16 | 0;
  HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $1_1;
  HEAP32[$5_1 >> 2] = $2_1;
  $11_1 = 24;
  label$1 : {
   label$2 : {
    label$3 : {
     if (!((((HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $11_1 | 0) >> $11_1 | 0 | 0) == (48 | 0) & 1 | 0)) {
      break label$3
     }
     HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] = HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] | 0 | 1 | 0;
     break label$2;
    }
    $30_1 = 24;
    label$4 : {
     label$5 : {
      if (!((((HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $30_1 | 0) >> $30_1 | 0 | 0) == (45 | 0) & 1 | 0)) {
       break label$5
      }
      HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] = HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] | 0 | 2 | 0;
      break label$4;
     }
     $49_1 = 24;
     label$6 : {
      label$7 : {
       if (!((((HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $49_1 | 0) >> $49_1 | 0 | 0) == (35 | 0) & 1 | 0)) {
        break label$7
       }
       HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] = HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] | 0 | 4 | 0;
       break label$6;
      }
      $68_1 = 24;
      label$8 : {
       label$9 : {
        if (!((((HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $68_1 | 0) >> $68_1 | 0 | 0) == (32 | 0) & 1 | 0)) {
         break label$9
        }
        HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] = HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] | 0 | 8 | 0;
        break label$8;
       }
       $87_1 = 24;
       label$10 : {
        label$11 : {
         if (!((((HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $87_1 | 0) >> $87_1 | 0 | 0) == (43 | 0) & 1 | 0)) {
          break label$11
         }
         HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] = HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] | 0 | 16 | 0;
         break label$10;
        }
        HEAP32[($5_1 + 12 | 0) >> 2] = 1;
        break label$1;
       }
      }
     }
    }
   }
   $102_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
   HEAP32[$102_1 >> 2] = (HEAP32[$102_1 >> 2] | 0) + 1 | 0;
   HEAP32[($5_1 + 12 | 0) >> 2] = 0;
  }
  return HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $90($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) >= (48 | 0) & 1 | 0)) {
     break label$2
    }
    if (!((HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) <= (57 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 1;
    break label$1;
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = 0;
  }
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $91($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $13_1 = 0, $17_1 = 0, $26_1 = 0, $29_1 = 0, $32_1 = 0, $36_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  HEAP32[((HEAP32[($5_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    $13_1 = 24;
    if (!($90(((HEAPU8[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $13_1 | 0) >> $13_1 | 0 | 0) | 0)) {
     break label$1
    }
    $17_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
    HEAP32[($17_1 + 12 | 0) >> 2] = Math_imul(HEAP32[($17_1 + 12 | 0) >> 2] | 0, 10);
    $26_1 = 24;
    $29_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
    HEAP32[($29_1 + 12 | 0) >> 2] = (HEAP32[($29_1 + 12 | 0) >> 2] | 0) + (((HEAPU8[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 8 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $26_1 | 0) >> $26_1 | 0) | 0;
    $32_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
    HEAP32[($32_1 + 12 | 0) >> 2] = (HEAP32[($32_1 + 12 | 0) >> 2] | 0) - 48 | 0;
    $36_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
    HEAP32[$36_1 >> 2] = (HEAP32[$36_1 >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  global$0 = $5_1 + 16 | 0;
  return 0 | 0;
 }
 
 function $92($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $11_1 = 0, $21_1 = 0, $37_1 = 0, $41_1 = 0, $50_1 = 0, $53_1 = 0, $56_1 = 0, $60_1 = 0, $65_1 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $1_1;
  HEAP32[$5_1 >> 2] = $2_1;
  $11_1 = 24;
  label$1 : {
   label$2 : {
    if (!((((HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $11_1 | 0) >> $11_1 | 0 | 0) != (46 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($5_1 + 12 | 0) >> 2] = 1;
    break label$1;
   }
   $21_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
   HEAP32[$21_1 >> 2] = (HEAP32[$21_1 >> 2] | 0) + 1 | 0;
   HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] = HEAP32[(HEAP32[$5_1 >> 2] | 0) >> 2] | 0 | 32 | 0;
   HEAP32[((HEAP32[$5_1 >> 2] | 0) + 8 | 0) >> 2] = 0;
   label$3 : {
    label$4 : while (1) {
     $37_1 = 24;
     if (!($90(((HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $37_1 | 0) >> $37_1 | 0 | 0) | 0)) {
      break label$3
     }
     $41_1 = HEAP32[$5_1 >> 2] | 0;
     HEAP32[($41_1 + 8 | 0) >> 2] = Math_imul(HEAP32[($41_1 + 8 | 0) >> 2] | 0, 10);
     $50_1 = 24;
     $53_1 = HEAP32[$5_1 >> 2] | 0;
     HEAP32[($53_1 + 8 | 0) >> 2] = (HEAP32[($53_1 + 8 | 0) >> 2] | 0) + (((HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($5_1 + 4 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $50_1 | 0) >> $50_1 | 0) | 0;
     $56_1 = HEAP32[$5_1 >> 2] | 0;
     HEAP32[($56_1 + 8 | 0) >> 2] = (HEAP32[($56_1 + 8 | 0) >> 2] | 0) - 48 | 0;
     $60_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
     HEAP32[$60_1 >> 2] = (HEAP32[$60_1 >> 2] | 0) + 1 | 0;
     continue label$4;
    };
   }
   HEAP32[($5_1 + 12 | 0) >> 2] = 0;
  }
  $65_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  global$0 = $5_1 + 16 | 0;
  return $65_1 | 0;
 }
 
 function $93($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $12_1 = 0, $21_1 = 0, $25_1 = 0, $35_1 = 0, $44_1 = 0, $55_1 = 0, $64_1 = 0, $75_1 = 0, $84_1 = 0, $95_1 = 0, $111_1 = 0, $120_1 = 0, $131_1 = 0, $140_1 = 0, $151_1 = 0, $160 = 0, $171 = 0, $180 = 0, $193 = 0, $28_1 = 0, $48_1 = 0, $68_1 = 0, $88_1 = 0, $104_1 = 0, $124_1 = 0, $144_1 = 0, $164 = 0, $184 = 0, $198 = 0;
  $6_1 = global$0 - 32 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 12 | 0) >> 2] = $3_1;
  $12_1 = 24;
  label$1 : {
   label$2 : {
    label$3 : {
     if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $12_1 | 0) >> $12_1 | 0 | 0) == (99 | 0) & 1 | 0)) {
      break label$3
     }
     $21_1 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
     HEAP32[($6_1 + 12 | 0) >> 2] = $21_1 + 4 | 0;
     $25_1 = 24;
     $28_1 = $97(((HEAP32[$21_1 >> 2] | 0) << $25_1 | 0) >> $25_1 | 0 | 0) | 0;
     HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $28_1;
     break label$2;
    }
    $35_1 = 24;
    label$4 : {
     label$5 : {
      if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $35_1 | 0) >> $35_1 | 0 | 0) == (100 | 0) & 1 | 0)) {
       break label$5
      }
      $44_1 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
      HEAP32[($6_1 + 12 | 0) >> 2] = $44_1 + 4 | 0;
      $48_1 = $100(HEAP32[$44_1 >> 2] | 0 | 0) | 0;
      HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $48_1;
      break label$4;
     }
     $55_1 = 24;
     label$6 : {
      label$7 : {
       if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $55_1 | 0) >> $55_1 | 0 | 0) == (105 | 0) & 1 | 0)) {
        break label$7
       }
       $64_1 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
       HEAP32[($6_1 + 12 | 0) >> 2] = $64_1 + 4 | 0;
       $68_1 = $101(HEAP32[$64_1 >> 2] | 0 | 0) | 0;
       HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $68_1;
       break label$6;
      }
      $75_1 = 24;
      label$8 : {
       label$9 : {
        if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $75_1 | 0) >> $75_1 | 0 | 0) == (112 | 0) & 1 | 0)) {
         break label$9
        }
        $84_1 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
        HEAP32[($6_1 + 12 | 0) >> 2] = $84_1 + 4 | 0;
        $88_1 = $102(HEAP32[$84_1 >> 2] | 0 | 0) | 0;
        HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $88_1;
        break label$8;
       }
       $95_1 = 24;
       label$10 : {
        label$11 : {
         if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $95_1 | 0) >> $95_1 | 0 | 0) == (37 | 0) & 1 | 0)) {
          break label$11
         }
         $104_1 = $103() | 0;
         HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $104_1;
         break label$10;
        }
        $111_1 = 24;
        label$12 : {
         label$13 : {
          if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $111_1 | 0) >> $111_1 | 0 | 0) == (115 | 0) & 1 | 0)) {
           break label$13
          }
          $120_1 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
          HEAP32[($6_1 + 12 | 0) >> 2] = $120_1 + 4 | 0;
          $124_1 = $104(HEAP32[$120_1 >> 2] | 0 | 0) | 0;
          HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $124_1;
          break label$12;
         }
         $131_1 = 24;
         label$14 : {
          label$15 : {
           if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $131_1 | 0) >> $131_1 | 0 | 0) == (117 | 0) & 1 | 0)) {
            break label$15
           }
           $140_1 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
           HEAP32[($6_1 + 12 | 0) >> 2] = $140_1 + 4 | 0;
           $144_1 = $105(HEAP32[$140_1 >> 2] | 0 | 0) | 0;
           HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $144_1;
           break label$14;
          }
          $151_1 = 24;
          label$16 : {
           label$17 : {
            if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $151_1 | 0) >> $151_1 | 0 | 0) == (120 | 0) & 1 | 0)) {
             break label$17
            }
            $160 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
            HEAP32[($6_1 + 12 | 0) >> 2] = $160 + 4 | 0;
            $164 = $106(HEAP32[$160 >> 2] | 0 | 0) | 0;
            HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $164;
            break label$16;
           }
           $171 = 24;
           label$18 : {
            label$19 : {
             if (!((((HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0) << $171 | 0) >> $171 | 0 | 0) == (88 | 0) & 1 | 0)) {
              break label$19
             }
             $180 = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
             HEAP32[($6_1 + 12 | 0) >> 2] = $180 + 4 | 0;
             $184 = $108(HEAP32[$180 >> 2] | 0 | 0) | 0;
             HEAP32[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = $184;
             break label$18;
            }
            HEAP32[($6_1 + 28 | 0) >> 2] = 1;
            break label$1;
           }
          }
         }
        }
       }
      }
     }
    }
   }
   HEAP8[((HEAP32[($6_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 0] = HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 20 | 0) >> 2] | 0) >> 2] | 0) | 0) >> 0] | 0;
   $193 = HEAP32[($6_1 + 20 | 0) >> 2] | 0;
   HEAP32[$193 >> 2] = (HEAP32[$193 >> 2] | 0) + 1 | 0;
   HEAP32[($6_1 + 28 | 0) >> 2] = 0;
  }
  $198 = HEAP32[($6_1 + 28 | 0) >> 2] | 0;
  global$0 = $6_1 + 32 | 0;
  return $198 | 0;
 }
 
 function $94() {
  var $2_1 = 0, $24_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[($2_1 + 8 | 0) >> 2] = $138(20 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($2_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($2_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[(HEAP32[($2_1 + 8 | 0) >> 2] | 0) >> 2] = 0;
   HEAP8[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] = 0;
   HEAP32[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] = 0;
   HEAP32[($2_1 + 12 | 0) >> 2] = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
  }
  $24_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
  global$0 = $2_1 + 16 | 0;
  return $24_1 | 0;
 }
 
 function $95($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $18_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $118(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[$3_1 >> 2] = $117(HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   $112(HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0);
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[$3_1 >> 2] | 0;
  }
  $18_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $18_1 | 0;
 }
 
 function $96($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  label$1 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$1
   }
   $139(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0);
   HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0) >> 2] = 0;
  }
  $139(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $97($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $19_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP8[($3_1 + 11 | 0) >> 0] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $138(2 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP8[(HEAP32[($3_1 + 4 | 0) >> 2] | 0) >> 0] = HEAPU8[($3_1 + 11 | 0) >> 0] | 0;
   HEAP8[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 1 | 0) >> 0] = 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $19_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $19_1 | 0;
 }
 
 function $98($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $68_1 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 20 | 0) >> 2] = $99(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 16 | 0) >> 2] = $138(((HEAP32[($3_1 + 20 | 0) >> 2] | 0) + 1 | 0) << 0 | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 16 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    if (HEAP32[($3_1 + 24 | 0) >> 2] | 0) {
     break label$3
    }
    HEAP8[(HEAP32[($3_1 + 16 | 0) >> 2] | 0) >> 0] = 48;
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
   label$4 : {
    if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
     break label$4
    }
    HEAP8[(HEAP32[($3_1 + 16 | 0) >> 2] | 0) >> 0] = 45;
   }
   label$5 : {
    if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
     break label$5
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = Math_imul(HEAP32[($3_1 + 12 | 0) >> 2] | 0, -1);
   }
   HEAP32[($3_1 + 8 | 0) >> 2] = 0;
   label$6 : {
    label$7 : while (1) {
     if (!(HEAP32[($3_1 + 12 | 0) >> 2] | 0)) {
      break label$6
     }
     HEAP8[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + (((HEAP32[($3_1 + 20 | 0) >> 2] | 0) - (HEAP32[($3_1 + 8 | 0) >> 2] | 0) | 0) - 1 | 0) | 0) >> 0] = ((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) % (10 | 0) | 0) + 48 | 0;
     HEAP32[($3_1 + 12 | 0) >> 2] = (HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) / (10 | 0) | 0;
     HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 1 | 0;
     continue label$7;
    };
   }
   HEAP8[((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0) >> 0] = 0;
   HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
  }
  $68_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $68_1 | 0;
 }
 
 function $99($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if (HEAP32[($3_1 + 8 | 0) >> 2] | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 1;
    break label$1;
   }
   HEAP32[($3_1 + 4 | 0) >> 2] = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
   HEAP32[$3_1 >> 2] = 0;
   label$3 : {
    if (!((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) < (0 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[$3_1 >> 2] = 1;
    HEAP32[($3_1 + 4 | 0) >> 2] = Math_imul(HEAP32[($3_1 + 4 | 0) >> 2] | 0, -1);
   }
   label$4 : {
    label$5 : while (1) {
     if (!(HEAP32[($3_1 + 4 | 0) >> 2] | 0)) {
      break label$4
     }
     HEAP32[$3_1 >> 2] = (HEAP32[$3_1 >> 2] | 0) + 1 | 0;
     HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) / (10 | 0) | 0;
     continue label$5;
    };
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[$3_1 >> 2] | 0;
  }
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $100($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $98(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $101($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $100(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $102($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $111(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $103() {
  var $2_1 = 0, $5_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[($2_1 + 12 | 0) >> 2] = $76(1141 | 0) | 0;
  $5_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
  global$0 = $2_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $104($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $15_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 8 | 0) >> 2] = $76(1126 | 0) | 0;
    break label$1;
   }
   HEAP32[($3_1 + 8 | 0) >> 2] = $76(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  }
  $15_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $15_1 | 0;
 }
 
 function $105($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $109(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 1080 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $106($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  $6_1 = $111(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $107($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  label$1 : {
   if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) >= (97 | 0) & 1 | 0)) {
    break label$1
   }
   if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) <= (122 | 0) & 1 | 0)) {
    break label$1
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = ((HEAP32[($3_1 + 12 | 0) >> 2] | 0) - 97 | 0) + 65 | 0;
  }
  return HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $108($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $23_1 = 0, $26_1 = 0, $33_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $106(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($3_1 + 4 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!(((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + (HEAP32[($3_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != (0 & 255 | 0 | 0) & 1 | 0)) {
     break label$1
    }
    $23_1 = 24;
    $26_1 = $107(((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + (HEAP32[($3_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) << $23_1 | 0) >> $23_1 | 0 | 0) | 0;
    HEAP8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + (HEAP32[($3_1 + 4 | 0) >> 2] | 0) | 0) >> 0] = $26_1;
    HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  $33_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $33_1 | 0;
 }
 
 function $109($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $52_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $77(HEAP32[($4_1 + 20 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = $110(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 16 | 0) >> 2] | 0 | 0) | 0;
  HEAP32[($4_1 + 8 | 0) >> 2] = $138(((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 1 | 0) << 0 | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($4_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    if (HEAP32[($4_1 + 24 | 0) >> 2] | 0) {
     break label$3
    }
    HEAP8[(HEAP32[($4_1 + 8 | 0) >> 2] | 0) >> 0] = HEAPU8[(HEAP32[($4_1 + 20 | 0) >> 2] | 0) >> 0] | 0;
   }
   HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
   label$4 : {
    label$5 : while (1) {
     if (!(HEAP32[($4_1 + 24 | 0) >> 2] | 0)) {
      break label$4
     }
     HEAP8[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) - 1 | 0) | 0) >> 0] = HEAPU8[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + (((HEAP32[($4_1 + 24 | 0) >> 2] | 0) >>> 0) % ((HEAP32[($4_1 + 16 | 0) >> 2] | 0) >>> 0) | 0) | 0) >> 0] | 0;
     HEAP32[($4_1 + 24 | 0) >> 2] = ((HEAP32[($4_1 + 24 | 0) >> 2] | 0) >>> 0) / ((HEAP32[($4_1 + 16 | 0) >> 2] | 0) >>> 0) | 0;
     HEAP32[($4_1 + 4 | 0) >> 2] = (HEAP32[($4_1 + 4 | 0) >> 2] | 0) + -1 | 0;
     continue label$5;
    };
   }
   HEAP8[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + (HEAP32[($4_1 + 12 | 0) >> 2] | 0) | 0) >> 0] = 0;
   HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
  }
  $52_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  global$0 = $4_1 + 32 | 0;
  return $52_1 | 0;
 }
 
 function $110($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (HEAP32[($4_1 + 8 | 0) >> 2] | 0) {
     break label$2
    }
    HEAP32[($4_1 + 12 | 0) >> 2] = 1;
    break label$1;
   }
   HEAP32[$4_1 >> 2] = 0;
   label$3 : {
    label$4 : while (1) {
     if (!(HEAP32[($4_1 + 8 | 0) >> 2] | 0)) {
      break label$3
     }
     HEAP32[$4_1 >> 2] = (HEAP32[$4_1 >> 2] | 0) + 1 | 0;
     HEAP32[($4_1 + 8 | 0) >> 2] = ((HEAP32[($4_1 + 8 | 0) >> 2] | 0) >>> 0) / ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) >>> 0) | 0;
     continue label$4;
    };
   }
   HEAP32[($4_1 + 12 | 0) >> 2] = HEAP32[$4_1 >> 2] | 0;
  }
  return HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $111($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $6_1 = $109(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0, 1037 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $6_1 | 0;
 }
 
 function $112($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  label$1 : {
   if (!((HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$1
   }
   $139(HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0);
  }
  label$2 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$2
   }
   $139(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0);
  }
  label$3 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$3
   }
   $139(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0);
  }
  label$4 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$4
   }
   $139(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0);
  }
  label$5 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$5
   }
   $139(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0 | 0);
  }
  $139(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0);
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $113($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $137(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, $77(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $114($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP8[($4_1 + 15 | 0) >> 0] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $137(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, $4_1 + 15 | 0 | 0, 1 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return;
 }
 
 function $115($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $16_1 = 0, $30_1 = 0, $44_1 = 0, $47_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  label$1 : {
   if (!((HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$1
   }
   $16_1 = $116(HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0, 1 | 0) | 0;
   HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $16_1 | 0;
  }
  label$2 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$2
   }
   $30_1 = $116(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0, 1 | 0) | 0;
   HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $30_1 | 0;
  }
  label$3 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$3
   }
   $44_1 = $116(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0, 1 | 0) | 0;
   HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $44_1 | 0;
  }
  $47_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $47_1 | 0;
 }
 
 function $116($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $8_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $113(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0);
  $8_1 = $77(HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $4_1 + 16 | 0;
  return $8_1 | 0;
 }
 
 function $117($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $31_1 = 0, $43_1 = 0, $57_1 = 0, $60_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $115(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$1
   }
   label$2 : {
    label$3 : {
     if (!(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0)) {
      break label$3
     }
     HEAP32[($3_1 + 4 | 0) >> 2] = 0;
     label$4 : {
      label$5 : while (1) {
       if (!((HEAP32[($3_1 + 4 | 0) >> 2] | 0) >>> 0 < (HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
        break label$4
       }
       $31_1 = 24;
       $114(((HEAPU8[((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) + (HEAP32[($3_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) << $31_1 | 0) >> $31_1 | 0 | 0, 1 | 0);
       HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 1 | 0;
       HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 1 | 0;
       continue label$5;
      };
     }
     break label$2;
    }
    $43_1 = $116(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0, 1 | 0) | 0;
    HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $43_1 | 0;
   }
  }
  label$6 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$6
   }
   $57_1 = $116(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0 | 0, 1 | 0) | 0;
   HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $57_1 | 0;
  }
  $60_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $60_1 | 0;
 }
 
 function $118($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $6_1 = 0, $19_1 = 0, $32_1 = 0, $45_1 = 0, $58_1 = 0, $71_1 = 0, $84_1 = 0, $97_1 = 0, $110_1 = 0, $122_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  $6_1 = 24;
  label$1 : {
   label$2 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $6_1 | 0) >> $6_1 | 0 | 0) == (99 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $124(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $19_1 = 24;
   label$3 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $19_1 | 0) >> $19_1 | 0 | 0) == (100 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $127(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $32_1 = 24;
   label$4 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $32_1 | 0) >> $32_1 | 0 | 0) == (105 | 0) & 1 | 0)) {
     break label$4
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $128(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $45_1 = 24;
   label$5 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $45_1 | 0) >> $45_1 | 0 | 0) == (112 | 0) & 1 | 0)) {
     break label$5
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $129(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $58_1 = 24;
   label$6 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $58_1 | 0) >> $58_1 | 0 | 0) == (37 | 0) & 1 | 0)) {
     break label$6
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $130(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $71_1 = 24;
   label$7 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $71_1 | 0) >> $71_1 | 0 | 0) == (115 | 0) & 1 | 0)) {
     break label$7
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $131(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $84_1 = 24;
   label$8 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $84_1 | 0) >> $84_1 | 0 | 0) == (117 | 0) & 1 | 0)) {
     break label$8
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $132(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $97_1 = 24;
   label$9 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $97_1 | 0) >> $97_1 | 0 | 0) == (120 | 0) & 1 | 0)) {
     break label$9
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $133(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   $110_1 = 24;
   label$10 : {
    if (!((((HEAPU8[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $110_1 | 0) >> $110_1 | 0 | 0) == (88 | 0) & 1 | 0)) {
     break label$10
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = $134(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0) | 0;
    break label$1;
   }
   HEAP32[($3_1 + 12 | 0) >> 2] = 0;
  }
  $122_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $122_1 | 0;
 }
 
 function $119() {
  var $2_1 = 0, $26_1 = 0;
  $2_1 = global$0 - 16 | 0;
  global$0 = $2_1;
  HEAP32[($2_1 + 8 | 0) >> 2] = $138(24 | 0) | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($2_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($2_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[(HEAP32[($2_1 + 8 | 0) >> 2] | 0) >> 2] = 0;
   HEAP32[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($2_1 + 8 | 0) >> 2] | 0) + 20 | 0) >> 2] = 0;
   HEAP32[($2_1 + 12 | 0) >> 2] = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
  }
  $26_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
  global$0 = $2_1 + 16 | 0;
  return $26_1 | 0;
 }
 
 function $120($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 16 | 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  HEAP32[$5_1 >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[$5_1 >> 2] | 0) >>> 0 < (HEAP32[($5_1 + 4 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$1
    }
    HEAP8[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + (HEAP32[$5_1 >> 2] | 0) | 0) >> 0] = HEAPU8[((HEAP32[($5_1 + 8 | 0) >> 2] | 0) + (HEAP32[$5_1 >> 2] | 0) | 0) >> 0] | 0;
    HEAP32[$5_1 >> 2] = (HEAP32[$5_1 >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  return HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0;
 }
 
 function $121($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $15_1 = 0, $28_1 = 0, $41_1 = 0, $60_1 = 0, $73_1 = 0, $76_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = 0;
  label$1 : {
   if (!((HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$1
   }
   $15_1 = $77(HEAP32[(HEAP32[($3_1 + 12 | 0) >> 2] | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $15_1 | 0;
  }
  label$2 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$2
   }
   $28_1 = $77(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $28_1 | 0;
  }
  label$3 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$3
   }
   $41_1 = $77(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $41_1 | 0;
  }
  label$4 : {
   label$5 : {
    if (!(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0)) {
     break label$5
    }
    HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + (HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0) | 0;
    break label$4;
   }
   label$6 : {
    if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
     break label$6
    }
    $60_1 = $77(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) | 0;
    HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $60_1 | 0;
   }
  }
  label$7 : {
   if (!((HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$7
   }
   $73_1 = $77(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + $73_1 | 0;
  }
  $76_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $76_1 | 0;
 }
 
 function $122($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0;
  $5_1 = global$0 - 32 | 0;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
  HEAP32[($5_1 + 16 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0 < (HEAP32[($5_1 + 20 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$1
    }
    HEAP8[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + (HEAP32[($5_1 + 16 | 0) >> 2] | 0) | 0) >> 0] = HEAP32[($5_1 + 24 | 0) >> 2] | 0;
    HEAP32[($5_1 + 16 | 0) >> 2] = (HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  return HEAP32[($5_1 + 28 | 0) >> 2] | 0 | 0;
 }
 
 function $123($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $56_1 = 0, $44_1 = 0, $64_1 = 0, $69_1 = 0, $72_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = $121(HEAP32[($4_1 + 20 | 0) >> 2] | 0 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($4_1 + 16 | 0) >> 2] | 0) >>> 0 < (HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$2
    }
    HEAP32[($4_1 + 12 | 0) >> 2] = (HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) - (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0;
    HEAP32[($4_1 + 8 | 0) >> 2] = $138(((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 1 | 0) << 0 | 0 | 0) | 0;
    label$3 : {
     if ((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
      break label$3
     }
     HEAP32[($4_1 + 28 | 0) >> 2] = 1;
     break label$1;
    }
    HEAP8[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + (HEAP32[($4_1 + 12 | 0) >> 2] | 0) | 0) >> 0] = 0;
    label$4 : {
     label$5 : {
      if (!((HEAP32[(HEAP32[($4_1 + 24 | 0) >> 2] | 0) >> 2] | 0) & 2 | 0)) {
       break label$5
      }
      $44_1 = $122(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, 32 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0;
      HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 20 | 0) >> 2] = $44_1;
      break label$4;
     }
     label$6 : {
      label$7 : {
       if (!((HEAP32[(HEAP32[($4_1 + 24 | 0) >> 2] | 0) >> 2] | 0) & 1 | 0)) {
        break label$7
       }
       label$8 : {
        if (!((HEAP32[(HEAP32[($4_1 + 24 | 0) >> 2] | 0) >> 2] | 0) & 32 | 0)) {
         break label$8
        }
        $56_1 = 24;
        if ($71(((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $56_1 | 0) >> $56_1 | 0 | 0, 1071 | 0) | 0) {
         break label$7
        }
       }
       $64_1 = $122(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, 48 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0;
       HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 8 | 0) >> 2] = $64_1;
       break label$6;
      }
      $69_1 = $122(HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0, 32 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0;
      HEAP32[(HEAP32[($4_1 + 20 | 0) >> 2] | 0) >> 2] = $69_1;
     }
    }
   }
   HEAP32[($4_1 + 28 | 0) >> 2] = 0;
  }
  $72_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  global$0 = $4_1 + 32 | 0;
  return $72_1 | 0;
 }
 
 function $124($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $27_1 = 0, $34_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $119() | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[$3_1 >> 2] = $138(2 | 0) | 0;
   label$3 : {
    if ((HEAP32[$3_1 >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$3
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   $27_1 = $120(HEAP32[$3_1 >> 2] | 0 | 0, HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0, 2 | 0) | 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $27_1;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 16 | 0) >> 2] = 1;
   $123(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $34_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $34_1 | 0;
 }
 
 function $125($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0, $15_1 = 0, $43_1 = 0, $74_1 = 0, $25_1 = 0, $32_1 = 0, $39_1 = 0, $70_1 = 0, $101_1 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
  $7_1 = 24;
  label$1 : {
   if (!($71(((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $7_1 | 0) >> $7_1 | 0 | 0, 1034 | 0) | 0)) {
    break label$1
   }
   $15_1 = 24;
   label$2 : {
    label$3 : {
     if (!((((HEAPU8[(HEAP32[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0) >> 0] | 0) << $15_1 | 0) >> $15_1 | 0 | 0) == (45 | 0) & 1 | 0)) {
      break label$3
     }
     $25_1 = $76(1118 | 0) | 0;
     HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = $25_1;
     break label$2;
    }
    label$4 : {
     label$5 : {
      if (!((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0) & 16 | 0)) {
       break label$5
      }
      $32_1 = $76(1124 | 0) | 0;
      HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = $32_1;
      break label$4;
     }
     label$6 : {
      if (!((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0) & 8 | 0)) {
       break label$6
      }
      $39_1 = $76(1143 | 0) | 0;
      HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = $39_1;
     }
    }
   }
  }
  $43_1 = 24;
  label$7 : {
   if (!((((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $43_1 | 0) >> $43_1 | 0 | 0) == (120 | 0) & 1 | 0)) {
    break label$7
   }
   if (!((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0) & 4 | 0)) {
    break label$7
   }
   if (!((HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$7
   }
   label$8 : {
    if (!($78(HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0, 1091 | 0, 2 | 0) | 0)) {
     break label$8
    }
    $70_1 = $76(1024 | 0) | 0;
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = $70_1;
   }
  }
  $74_1 = 24;
  label$9 : {
   if (!((((HEAPU8[((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $74_1 | 0) >> $74_1 | 0 | 0) == (88 | 0) & 1 | 0)) {
    break label$9
   }
   if (!((HEAP32[(HEAP32[($4_1 + 12 | 0) >> 2] | 0) >> 2] | 0) & 4 | 0)) {
    break label$9
   }
   if (!((HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0)) {
    break label$9
   }
   label$10 : {
    if (!($78(HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0, 1091 | 0, 2 | 0) | 0)) {
     break label$10
    }
    $101_1 = $76(1077 | 0) | 0;
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = $101_1;
   }
  }
  global$0 = $4_1 + 16 | 0;
  return 0 | 0;
 }
 
 function $126($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $7_1 = 0, $56_1 = 0, $32_1 = 0, $47_1 = 0, $86_1 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $1_1;
  $7_1 = 24;
  label$1 : {
   label$2 : {
    label$3 : {
     if (!($71(((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $7_1 | 0) >> $7_1 | 0 | 0, 1027 | 0) | 0)) {
      break label$3
     }
     HEAP32[($4_1 + 16 | 0) >> 2] = $77(HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) | 0;
     label$4 : {
      if (!((HEAP32[($4_1 + 16 | 0) >> 2] | 0) >>> 0 < (HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
       break label$4
      }
      HEAP32[($4_1 + 12 | 0) >> 2] = (HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) - (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0;
      $32_1 = $138(((HEAP32[($4_1 + 12 | 0) >> 2] | 0) + 1 | 0) << 0 | 0 | 0) | 0;
      HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 8 | 0) >> 2] = $32_1;
      label$5 : {
       if ((HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
        break label$5
       }
       HEAP32[($4_1 + 28 | 0) >> 2] = 1;
       break label$1;
      }
      $47_1 = $122(HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0, 48 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0;
      HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 8 | 0) >> 2] = $47_1;
      HEAP8[((HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) + (HEAP32[($4_1 + 12 | 0) >> 2] | 0) | 0) >> 0] = 0;
     }
     break label$2;
    }
    $56_1 = 24;
    label$6 : {
     if (!((((HEAPU8[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 0] | 0) << $56_1 | 0) >> $56_1 | 0 | 0) == (115 | 0) & 1 | 0)) {
      break label$6
     }
     label$7 : {
      if (!(($77(HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) | 0) >>> 0 > (HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
       break label$7
      }
      if (!((HEAP32[(HEAP32[($4_1 + 24 | 0) >> 2] | 0) >> 2] | 0) & 32 | 0)) {
       break label$7
      }
      HEAP8[((HEAP32[((HEAP32[($4_1 + 20 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) + (HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) | 0) >> 0] = 0;
     }
    }
   }
   HEAP32[($4_1 + 28 | 0) >> 2] = 0;
  }
  $86_1 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  global$0 = $4_1 + 32 | 0;
  return $86_1 | 0;
 }
 
 function $127($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $16_1 = 0, $29_1 = 0, $41_1 = 0, $45_1 = 0, $54_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $119() | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   $16_1 = 24;
   label$3 : {
    label$4 : {
     if (!((((HEAPU8[(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0) >> 0] | 0) << $16_1 | 0) >> $16_1 | 0 | 0) == (45 | 0) & 1 | 0)) {
      break label$4
     }
     $29_1 = $76((HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0) + 1 | 0 | 0) | 0;
     HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $29_1;
     break label$3;
    }
    label$5 : {
     label$6 : {
      if ($78(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0, 1091 | 0, 2 | 0) | 0) {
       break label$6
      }
      if (!((HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0) & 32 | 0)) {
       break label$6
      }
      $41_1 = $76(1155 | 0) | 0;
      HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $41_1;
      break label$5;
     }
     $45_1 = $76(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0) | 0;
     HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $45_1;
    }
   }
   $125(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   $126(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   $123(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $54_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $54_1 | 0;
 }
 
 function $128($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $127(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $129($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $15_1 = 0, $18_1 = 0, $25_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $119() | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   $15_1 = $76(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $15_1;
   $18_1 = $76(1024 | 0) | 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 4 | 0) >> 2] = $18_1;
   $126(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   $123(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $25_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $25_1 | 0;
 }
 
 function $130($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $15_1 = 0, $20_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $119() | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   $15_1 = $76(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $15_1;
   $123(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $20_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $20_1 | 0;
 }
 
 function $131($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $15_1 = 0, $22_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $119() | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   $15_1 = $76(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $15_1;
   $126(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   $123(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $22_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $22_1 | 0;
 }
 
 function $132($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $23_1 = 0, $27_1 = 0, $34_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $119() | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    label$4 : {
     if ($78(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0, 1091 | 0, 2 | 0) | 0) {
      break label$4
     }
     if (!((HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0) & 32 | 0)) {
      break label$4
     }
     $23_1 = $76(1155 | 0) | 0;
     HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $23_1;
     break label$3;
    }
    $27_1 = $76(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0) | 0;
    HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $27_1;
   }
   $126(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   $123(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $34_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $34_1 | 0;
 }
 
 function $133($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $23_1 = 0, $27_1 = 0, $36_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = $119() | 0;
  label$1 : {
   label$2 : {
    if ((HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) != (0 | 0) & 1 | 0) {
     break label$2
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    label$4 : {
     if ($78(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0, 1091 | 0, 2 | 0) | 0) {
      break label$4
     }
     if (!((HEAP32[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 2] | 0) & 32 | 0)) {
      break label$4
     }
     $23_1 = $76(1155 | 0) | 0;
     HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $23_1;
     break label$3;
    }
    $27_1 = $76(HEAP32[((HEAP32[($3_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0 | 0) | 0;
    HEAP32[((HEAP32[($3_1 + 4 | 0) >> 2] | 0) + 12 | 0) >> 2] = $27_1;
   }
   $125(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   $126(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   $123(HEAP32[($3_1 + 8 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
   HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  }
  $36_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return $36_1 | 0;
 }
 
 function $134($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  $5_1 = $133(HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) | 0;
  global$0 = $3_1 + 16 | 0;
  return $5_1 | 0;
 }
 
 function $135() {
  return 1160 | 0;
 }
 
 function $136($0_1) {
  $0_1 = $0_1 | 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   return 0 | 0;
  }
  HEAP32[($135() | 0) >> 2] = $0_1;
  return -1 | 0;
 }
 
 function $137($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $2_1;
  HEAP32[($3_1 + 8 | 0) >> 2] = $1_1;
  $2_1 = $136(fimport$0($0_1 | 0, $3_1 + 8 | 0 | 0, 1 | 0, $3_1 + 4 | 0 | 0) | 0 | 0) | 0;
  $1_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
  global$0 = $3_1 + 16 | 0;
  return ($2_1 ? -1 : $1_1) | 0;
 }
 
 function $138($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $5_1 = 0, $7_1 = 0, $8_1 = 0, $3_1 = 0, $2_1 = 0, $11_1 = 0, $6_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $9_1 = 0, i64toi32_i32$2 = 0, $10_1 = 0, $1_1 = 0, $79_1 = 0, $92_1 = 0, $103_1 = 0, $111_1 = 0, $119_1 = 0, $209 = 0, $220 = 0, $228 = 0, $236 = 0, $271 = 0, $338 = 0, $345 = 0, $352 = 0, $443 = 0, $454 = 0, $462 = 0, $470 = 0, $1156 = 0, $1163 = 0, $1170 = 0, $1292 = 0, $1294 = 0, $1354 = 0, $1361 = 0, $1368 = 0, $1599 = 0, $1606 = 0, $1613 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : {
       label$6 : {
        label$7 : {
         label$8 : {
          label$9 : {
           label$10 : {
            label$11 : {
             label$12 : {
              if ($0_1 >>> 0 > 244 >>> 0) {
               break label$12
              }
              label$13 : {
               $2_1 = HEAP32[(0 + 1164 | 0) >> 2] | 0;
               $3_1 = $0_1 >>> 0 < 11 >>> 0 ? 16 : ($0_1 + 11 | 0) & -8 | 0;
               $4_1 = $3_1 >>> 3 | 0;
               $0_1 = $2_1 >>> $4_1 | 0;
               if (!($0_1 & 3 | 0)) {
                break label$13
               }
               label$14 : {
                label$15 : {
                 $5_1 = (($0_1 ^ -1 | 0) & 1 | 0) + $4_1 | 0;
                 $4_1 = $5_1 << 3 | 0;
                 $0_1 = $4_1 + 1204 | 0;
                 $4_1 = HEAP32[($4_1 + 1212 | 0) >> 2] | 0;
                 $3_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
                 if (($0_1 | 0) != ($3_1 | 0)) {
                  break label$15
                 }
                 HEAP32[(0 + 1164 | 0) >> 2] = $2_1 & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
                 break label$14;
                }
                HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
                HEAP32[($0_1 + 8 | 0) >> 2] = $3_1;
               }
               $0_1 = $4_1 + 8 | 0;
               $5_1 = $5_1 << 3 | 0;
               HEAP32[($4_1 + 4 | 0) >> 2] = $5_1 | 3 | 0;
               $4_1 = $4_1 + $5_1 | 0;
               HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 1 | 0;
               break label$1;
              }
              $6_1 = HEAP32[(0 + 1172 | 0) >> 2] | 0;
              if ($3_1 >>> 0 <= $6_1 >>> 0) {
               break label$11
              }
              label$16 : {
               if (!$0_1) {
                break label$16
               }
               label$17 : {
                label$18 : {
                 $79_1 = $0_1 << $4_1 | 0;
                 $0_1 = 2 << $4_1 | 0;
                 $0_1 = $79_1 & ($0_1 | (0 - $0_1 | 0) | 0) | 0;
                 $0_1 = ($0_1 + -1 | 0) & ($0_1 ^ -1 | 0) | 0;
                 $92_1 = $0_1;
                 $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
                 $4_1 = $92_1 >>> $0_1 | 0;
                 $5_1 = ($4_1 >>> 5 | 0) & 8 | 0;
                 $103_1 = $5_1 | $0_1 | 0;
                 $0_1 = $4_1 >>> $5_1 | 0;
                 $4_1 = ($0_1 >>> 2 | 0) & 4 | 0;
                 $111_1 = $103_1 | $4_1 | 0;
                 $0_1 = $0_1 >>> $4_1 | 0;
                 $4_1 = ($0_1 >>> 1 | 0) & 2 | 0;
                 $119_1 = $111_1 | $4_1 | 0;
                 $0_1 = $0_1 >>> $4_1 | 0;
                 $4_1 = ($0_1 >>> 1 | 0) & 1 | 0;
                 $4_1 = ($119_1 | $4_1 | 0) + ($0_1 >>> $4_1 | 0) | 0;
                 $0_1 = $4_1 << 3 | 0;
                 $5_1 = $0_1 + 1204 | 0;
                 $0_1 = HEAP32[($0_1 + 1212 | 0) >> 2] | 0;
                 $7_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
                 if (($5_1 | 0) != ($7_1 | 0)) {
                  break label$18
                 }
                 $2_1 = $2_1 & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
                 HEAP32[(0 + 1164 | 0) >> 2] = $2_1;
                 break label$17;
                }
                HEAP32[($7_1 + 12 | 0) >> 2] = $5_1;
                HEAP32[($5_1 + 8 | 0) >> 2] = $7_1;
               }
               HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
               $7_1 = $0_1 + $3_1 | 0;
               $4_1 = $4_1 << 3 | 0;
               $5_1 = $4_1 - $3_1 | 0;
               HEAP32[($7_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
               HEAP32[($0_1 + $4_1 | 0) >> 2] = $5_1;
               label$19 : {
                if (!$6_1) {
                 break label$19
                }
                $3_1 = ($6_1 & -8 | 0) + 1204 | 0;
                $4_1 = HEAP32[(0 + 1184 | 0) >> 2] | 0;
                label$20 : {
                 label$21 : {
                  $8_1 = 1 << ($6_1 >>> 3 | 0) | 0;
                  if ($2_1 & $8_1 | 0) {
                   break label$21
                  }
                  HEAP32[(0 + 1164 | 0) >> 2] = $2_1 | $8_1 | 0;
                  $8_1 = $3_1;
                  break label$20;
                 }
                 $8_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
                }
                HEAP32[($3_1 + 8 | 0) >> 2] = $4_1;
                HEAP32[($8_1 + 12 | 0) >> 2] = $4_1;
                HEAP32[($4_1 + 12 | 0) >> 2] = $3_1;
                HEAP32[($4_1 + 8 | 0) >> 2] = $8_1;
               }
               $0_1 = $0_1 + 8 | 0;
               HEAP32[(0 + 1184 | 0) >> 2] = $7_1;
               HEAP32[(0 + 1172 | 0) >> 2] = $5_1;
               break label$1;
              }
              $9_1 = HEAP32[(0 + 1168 | 0) >> 2] | 0;
              if (!$9_1) {
               break label$11
              }
              $0_1 = ($9_1 + -1 | 0) & ($9_1 ^ -1 | 0) | 0;
              $209 = $0_1;
              $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
              $4_1 = $209 >>> $0_1 | 0;
              $5_1 = ($4_1 >>> 5 | 0) & 8 | 0;
              $220 = $5_1 | $0_1 | 0;
              $0_1 = $4_1 >>> $5_1 | 0;
              $4_1 = ($0_1 >>> 2 | 0) & 4 | 0;
              $228 = $220 | $4_1 | 0;
              $0_1 = $0_1 >>> $4_1 | 0;
              $4_1 = ($0_1 >>> 1 | 0) & 2 | 0;
              $236 = $228 | $4_1 | 0;
              $0_1 = $0_1 >>> $4_1 | 0;
              $4_1 = ($0_1 >>> 1 | 0) & 1 | 0;
              $7_1 = HEAP32[(((($236 | $4_1 | 0) + ($0_1 >>> $4_1 | 0) | 0) << 2 | 0) + 1468 | 0) >> 2] | 0;
              $4_1 = ((HEAP32[($7_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
              $5_1 = $7_1;
              label$22 : {
               label$23 : while (1) {
                label$24 : {
                 $0_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
                 if ($0_1) {
                  break label$24
                 }
                 $0_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
                 if (!$0_1) {
                  break label$22
                 }
                }
                $5_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
                $271 = $5_1;
                $5_1 = $5_1 >>> 0 < $4_1 >>> 0;
                $4_1 = $5_1 ? $271 : $4_1;
                $7_1 = $5_1 ? $0_1 : $7_1;
                $5_1 = $0_1;
                continue label$23;
               };
              }
              $10_1 = HEAP32[($7_1 + 24 | 0) >> 2] | 0;
              label$25 : {
               $8_1 = HEAP32[($7_1 + 12 | 0) >> 2] | 0;
               if (($8_1 | 0) == ($7_1 | 0)) {
                break label$25
               }
               $0_1 = HEAP32[($7_1 + 8 | 0) >> 2] | 0;
               HEAP32[(0 + 1180 | 0) >> 2] | 0;
               HEAP32[($0_1 + 12 | 0) >> 2] = $8_1;
               HEAP32[($8_1 + 8 | 0) >> 2] = $0_1;
               break label$2;
              }
              label$26 : {
               $5_1 = $7_1 + 20 | 0;
               $0_1 = HEAP32[$5_1 >> 2] | 0;
               if ($0_1) {
                break label$26
               }
               $0_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
               if (!$0_1) {
                break label$10
               }
               $5_1 = $7_1 + 16 | 0;
              }
              label$27 : while (1) {
               $11_1 = $5_1;
               $8_1 = $0_1;
               $5_1 = $0_1 + 20 | 0;
               $0_1 = HEAP32[$5_1 >> 2] | 0;
               if ($0_1) {
                continue label$27
               }
               $5_1 = $8_1 + 16 | 0;
               $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
               if ($0_1) {
                continue label$27
               }
               break label$27;
              };
              HEAP32[$11_1 >> 2] = 0;
              break label$2;
             }
             $3_1 = -1;
             if ($0_1 >>> 0 > -65 >>> 0) {
              break label$11
             }
             $0_1 = $0_1 + 11 | 0;
             $3_1 = $0_1 & -8 | 0;
             $6_1 = HEAP32[(0 + 1168 | 0) >> 2] | 0;
             if (!$6_1) {
              break label$11
             }
             $11_1 = 0;
             label$28 : {
              if ($3_1 >>> 0 < 256 >>> 0) {
               break label$28
              }
              $11_1 = 31;
              if ($3_1 >>> 0 > 16777215 >>> 0) {
               break label$28
              }
              $0_1 = $0_1 >>> 8 | 0;
              $338 = $0_1;
              $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
              $4_1 = $338 << $0_1 | 0;
              $345 = $4_1;
              $4_1 = (($4_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
              $5_1 = $345 << $4_1 | 0;
              $352 = $5_1;
              $5_1 = (($5_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
              $0_1 = (($352 << $5_1 | 0) >>> 15 | 0) - ($0_1 | $4_1 | 0 | $5_1 | 0) | 0;
              $11_1 = ($0_1 << 1 | 0 | (($3_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
             }
             $4_1 = 0 - $3_1 | 0;
             label$29 : {
              label$30 : {
               label$31 : {
                label$32 : {
                 $5_1 = HEAP32[(($11_1 << 2 | 0) + 1468 | 0) >> 2] | 0;
                 if ($5_1) {
                  break label$32
                 }
                 $0_1 = 0;
                 $8_1 = 0;
                 break label$31;
                }
                $0_1 = 0;
                $7_1 = $3_1 << (($11_1 | 0) == (31 | 0) ? 0 : 25 - ($11_1 >>> 1 | 0) | 0) | 0;
                $8_1 = 0;
                label$33 : while (1) {
                 label$34 : {
                  $2_1 = ((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
                  if ($2_1 >>> 0 >= $4_1 >>> 0) {
                   break label$34
                  }
                  $4_1 = $2_1;
                  $8_1 = $5_1;
                  if ($4_1) {
                   break label$34
                  }
                  $4_1 = 0;
                  $8_1 = $5_1;
                  $0_1 = $5_1;
                  break label$30;
                 }
                 $2_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
                 $5_1 = HEAP32[(($5_1 + (($7_1 >>> 29 | 0) & 4 | 0) | 0) + 16 | 0) >> 2] | 0;
                 $0_1 = $2_1 ? (($2_1 | 0) == ($5_1 | 0) ? $0_1 : $2_1) : $0_1;
                 $7_1 = $7_1 << 1 | 0;
                 if ($5_1) {
                  continue label$33
                 }
                 break label$33;
                };
               }
               label$35 : {
                if ($0_1 | $8_1 | 0) {
                 break label$35
                }
                $8_1 = 0;
                $0_1 = 2 << $11_1 | 0;
                $0_1 = ($0_1 | (0 - $0_1 | 0) | 0) & $6_1 | 0;
                if (!$0_1) {
                 break label$11
                }
                $0_1 = ($0_1 + -1 | 0) & ($0_1 ^ -1 | 0) | 0;
                $443 = $0_1;
                $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
                $5_1 = $443 >>> $0_1 | 0;
                $7_1 = ($5_1 >>> 5 | 0) & 8 | 0;
                $454 = $7_1 | $0_1 | 0;
                $0_1 = $5_1 >>> $7_1 | 0;
                $5_1 = ($0_1 >>> 2 | 0) & 4 | 0;
                $462 = $454 | $5_1 | 0;
                $0_1 = $0_1 >>> $5_1 | 0;
                $5_1 = ($0_1 >>> 1 | 0) & 2 | 0;
                $470 = $462 | $5_1 | 0;
                $0_1 = $0_1 >>> $5_1 | 0;
                $5_1 = ($0_1 >>> 1 | 0) & 1 | 0;
                $0_1 = HEAP32[(((($470 | $5_1 | 0) + ($0_1 >>> $5_1 | 0) | 0) << 2 | 0) + 1468 | 0) >> 2] | 0;
               }
               if (!$0_1) {
                break label$29
               }
              }
              label$36 : while (1) {
               $2_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
               $7_1 = $2_1 >>> 0 < $4_1 >>> 0;
               label$37 : {
                $5_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
                if ($5_1) {
                 break label$37
                }
                $5_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
               }
               $4_1 = $7_1 ? $2_1 : $4_1;
               $8_1 = $7_1 ? $0_1 : $8_1;
               $0_1 = $5_1;
               if ($0_1) {
                continue label$36
               }
               break label$36;
              };
             }
             if (!$8_1) {
              break label$11
             }
             if ($4_1 >>> 0 >= ((HEAP32[(0 + 1172 | 0) >> 2] | 0) - $3_1 | 0) >>> 0) {
              break label$11
             }
             $11_1 = HEAP32[($8_1 + 24 | 0) >> 2] | 0;
             label$38 : {
              $7_1 = HEAP32[($8_1 + 12 | 0) >> 2] | 0;
              if (($7_1 | 0) == ($8_1 | 0)) {
               break label$38
              }
              $0_1 = HEAP32[($8_1 + 8 | 0) >> 2] | 0;
              HEAP32[(0 + 1180 | 0) >> 2] | 0;
              HEAP32[($0_1 + 12 | 0) >> 2] = $7_1;
              HEAP32[($7_1 + 8 | 0) >> 2] = $0_1;
              break label$3;
             }
             label$39 : {
              $5_1 = $8_1 + 20 | 0;
              $0_1 = HEAP32[$5_1 >> 2] | 0;
              if ($0_1) {
               break label$39
              }
              $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
              if (!$0_1) {
               break label$9
              }
              $5_1 = $8_1 + 16 | 0;
             }
             label$40 : while (1) {
              $2_1 = $5_1;
              $7_1 = $0_1;
              $5_1 = $0_1 + 20 | 0;
              $0_1 = HEAP32[$5_1 >> 2] | 0;
              if ($0_1) {
               continue label$40
              }
              $5_1 = $7_1 + 16 | 0;
              $0_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
              if ($0_1) {
               continue label$40
              }
              break label$40;
             };
             HEAP32[$2_1 >> 2] = 0;
             break label$3;
            }
            label$41 : {
             $0_1 = HEAP32[(0 + 1172 | 0) >> 2] | 0;
             if ($0_1 >>> 0 < $3_1 >>> 0) {
              break label$41
             }
             $4_1 = HEAP32[(0 + 1184 | 0) >> 2] | 0;
             label$42 : {
              label$43 : {
               $5_1 = $0_1 - $3_1 | 0;
               if ($5_1 >>> 0 < 16 >>> 0) {
                break label$43
               }
               HEAP32[(0 + 1172 | 0) >> 2] = $5_1;
               $7_1 = $4_1 + $3_1 | 0;
               HEAP32[(0 + 1184 | 0) >> 2] = $7_1;
               HEAP32[($7_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
               HEAP32[($4_1 + $0_1 | 0) >> 2] = $5_1;
               HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
               break label$42;
              }
              HEAP32[(0 + 1184 | 0) >> 2] = 0;
              HEAP32[(0 + 1172 | 0) >> 2] = 0;
              HEAP32[($4_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
              $0_1 = $4_1 + $0_1 | 0;
              HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
             }
             $0_1 = $4_1 + 8 | 0;
             break label$1;
            }
            label$44 : {
             $7_1 = HEAP32[(0 + 1176 | 0) >> 2] | 0;
             if ($7_1 >>> 0 <= $3_1 >>> 0) {
              break label$44
             }
             $4_1 = $7_1 - $3_1 | 0;
             HEAP32[(0 + 1176 | 0) >> 2] = $4_1;
             $0_1 = HEAP32[(0 + 1188 | 0) >> 2] | 0;
             $5_1 = $0_1 + $3_1 | 0;
             HEAP32[(0 + 1188 | 0) >> 2] = $5_1;
             HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
             HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
             $0_1 = $0_1 + 8 | 0;
             break label$1;
            }
            label$45 : {
             label$46 : {
              if (!(HEAP32[(0 + 1636 | 0) >> 2] | 0)) {
               break label$46
              }
              $4_1 = HEAP32[(0 + 1644 | 0) >> 2] | 0;
              break label$45;
             }
             i64toi32_i32$1 = 0;
             i64toi32_i32$0 = -1;
             HEAP32[(i64toi32_i32$1 + 1648 | 0) >> 2] = -1;
             HEAP32[(i64toi32_i32$1 + 1652 | 0) >> 2] = i64toi32_i32$0;
             i64toi32_i32$1 = 0;
             i64toi32_i32$0 = 4096;
             HEAP32[(i64toi32_i32$1 + 1640 | 0) >> 2] = 4096;
             HEAP32[(i64toi32_i32$1 + 1644 | 0) >> 2] = i64toi32_i32$0;
             HEAP32[(0 + 1636 | 0) >> 2] = (($1_1 + 12 | 0) & -16 | 0) ^ 1431655768 | 0;
             HEAP32[(0 + 1656 | 0) >> 2] = 0;
             HEAP32[(0 + 1608 | 0) >> 2] = 0;
             $4_1 = 4096;
            }
            $0_1 = 0;
            $6_1 = $3_1 + 47 | 0;
            $2_1 = $4_1 + $6_1 | 0;
            $11_1 = 0 - $4_1 | 0;
            $8_1 = $2_1 & $11_1 | 0;
            if ($8_1 >>> 0 <= $3_1 >>> 0) {
             break label$1
            }
            $0_1 = 0;
            label$47 : {
             $4_1 = HEAP32[(0 + 1604 | 0) >> 2] | 0;
             if (!$4_1) {
              break label$47
             }
             $5_1 = HEAP32[(0 + 1596 | 0) >> 2] | 0;
             $9_1 = $5_1 + $8_1 | 0;
             if ($9_1 >>> 0 <= $5_1 >>> 0) {
              break label$1
             }
             if ($9_1 >>> 0 > $4_1 >>> 0) {
              break label$1
             }
            }
            if ((HEAPU8[(0 + 1608 | 0) >> 0] | 0) & 4 | 0) {
             break label$6
            }
            label$48 : {
             label$49 : {
              label$50 : {
               $4_1 = HEAP32[(0 + 1188 | 0) >> 2] | 0;
               if (!$4_1) {
                break label$50
               }
               $0_1 = 1612;
               label$51 : while (1) {
                label$52 : {
                 $5_1 = HEAP32[$0_1 >> 2] | 0;
                 if ($5_1 >>> 0 > $4_1 >>> 0) {
                  break label$52
                 }
                 if (($5_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0) >>> 0 > $4_1 >>> 0) {
                  break label$49
                 }
                }
                $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
                if ($0_1) {
                 continue label$51
                }
                break label$51;
               };
              }
              $7_1 = $141(0 | 0) | 0;
              if (($7_1 | 0) == (-1 | 0)) {
               break label$7
              }
              $2_1 = $8_1;
              label$53 : {
               $0_1 = HEAP32[(0 + 1640 | 0) >> 2] | 0;
               $4_1 = $0_1 + -1 | 0;
               if (!($4_1 & $7_1 | 0)) {
                break label$53
               }
               $2_1 = ($8_1 - $7_1 | 0) + (($4_1 + $7_1 | 0) & (0 - $0_1 | 0) | 0) | 0;
              }
              if ($2_1 >>> 0 <= $3_1 >>> 0) {
               break label$7
              }
              if ($2_1 >>> 0 > 2147483646 >>> 0) {
               break label$7
              }
              label$54 : {
               $0_1 = HEAP32[(0 + 1604 | 0) >> 2] | 0;
               if (!$0_1) {
                break label$54
               }
               $4_1 = HEAP32[(0 + 1596 | 0) >> 2] | 0;
               $5_1 = $4_1 + $2_1 | 0;
               if ($5_1 >>> 0 <= $4_1 >>> 0) {
                break label$7
               }
               if ($5_1 >>> 0 > $0_1 >>> 0) {
                break label$7
               }
              }
              $0_1 = $141($2_1 | 0) | 0;
              if (($0_1 | 0) != ($7_1 | 0)) {
               break label$48
              }
              break label$5;
             }
             $2_1 = ($2_1 - $7_1 | 0) & $11_1 | 0;
             if ($2_1 >>> 0 > 2147483646 >>> 0) {
              break label$7
             }
             $7_1 = $141($2_1 | 0) | 0;
             if (($7_1 | 0) == ((HEAP32[$0_1 >> 2] | 0) + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0 | 0)) {
              break label$8
             }
             $0_1 = $7_1;
            }
            label$55 : {
             if (($0_1 | 0) == (-1 | 0)) {
              break label$55
             }
             if (($3_1 + 48 | 0) >>> 0 <= $2_1 >>> 0) {
              break label$55
             }
             label$56 : {
              $4_1 = HEAP32[(0 + 1644 | 0) >> 2] | 0;
              $4_1 = (($6_1 - $2_1 | 0) + $4_1 | 0) & (0 - $4_1 | 0) | 0;
              if ($4_1 >>> 0 <= 2147483646 >>> 0) {
               break label$56
              }
              $7_1 = $0_1;
              break label$5;
             }
             label$57 : {
              if (($141($4_1 | 0) | 0 | 0) == (-1 | 0)) {
               break label$57
              }
              $2_1 = $4_1 + $2_1 | 0;
              $7_1 = $0_1;
              break label$5;
             }
             $141(0 - $2_1 | 0 | 0) | 0;
             break label$7;
            }
            $7_1 = $0_1;
            if (($0_1 | 0) != (-1 | 0)) {
             break label$5
            }
            break label$7;
           }
           $8_1 = 0;
           break label$2;
          }
          $7_1 = 0;
          break label$3;
         }
         if (($7_1 | 0) != (-1 | 0)) {
          break label$5
         }
        }
        HEAP32[(0 + 1608 | 0) >> 2] = HEAP32[(0 + 1608 | 0) >> 2] | 0 | 4 | 0;
       }
       if ($8_1 >>> 0 > 2147483646 >>> 0) {
        break label$4
       }
       $7_1 = $141($8_1 | 0) | 0;
       $0_1 = $141(0 | 0) | 0;
       if (($7_1 | 0) == (-1 | 0)) {
        break label$4
       }
       if (($0_1 | 0) == (-1 | 0)) {
        break label$4
       }
       if ($7_1 >>> 0 >= $0_1 >>> 0) {
        break label$4
       }
       $2_1 = $0_1 - $7_1 | 0;
       if ($2_1 >>> 0 <= ($3_1 + 40 | 0) >>> 0) {
        break label$4
       }
      }
      $0_1 = (HEAP32[(0 + 1596 | 0) >> 2] | 0) + $2_1 | 0;
      HEAP32[(0 + 1596 | 0) >> 2] = $0_1;
      label$58 : {
       if ($0_1 >>> 0 <= (HEAP32[(0 + 1600 | 0) >> 2] | 0) >>> 0) {
        break label$58
       }
       HEAP32[(0 + 1600 | 0) >> 2] = $0_1;
      }
      label$59 : {
       label$60 : {
        label$61 : {
         label$62 : {
          $4_1 = HEAP32[(0 + 1188 | 0) >> 2] | 0;
          if (!$4_1) {
           break label$62
          }
          $0_1 = 1612;
          label$63 : while (1) {
           $5_1 = HEAP32[$0_1 >> 2] | 0;
           $8_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
           if (($7_1 | 0) == ($5_1 + $8_1 | 0 | 0)) {
            break label$61
           }
           $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
           if ($0_1) {
            continue label$63
           }
           break label$60;
          };
         }
         label$64 : {
          label$65 : {
           $0_1 = HEAP32[(0 + 1180 | 0) >> 2] | 0;
           if (!$0_1) {
            break label$65
           }
           if ($7_1 >>> 0 >= $0_1 >>> 0) {
            break label$64
           }
          }
          HEAP32[(0 + 1180 | 0) >> 2] = $7_1;
         }
         $0_1 = 0;
         HEAP32[(0 + 1616 | 0) >> 2] = $2_1;
         HEAP32[(0 + 1612 | 0) >> 2] = $7_1;
         HEAP32[(0 + 1196 | 0) >> 2] = -1;
         HEAP32[(0 + 1200 | 0) >> 2] = HEAP32[(0 + 1636 | 0) >> 2] | 0;
         HEAP32[(0 + 1624 | 0) >> 2] = 0;
         label$66 : while (1) {
          $4_1 = $0_1 << 3 | 0;
          $5_1 = $4_1 + 1204 | 0;
          HEAP32[($4_1 + 1212 | 0) >> 2] = $5_1;
          HEAP32[($4_1 + 1216 | 0) >> 2] = $5_1;
          $0_1 = $0_1 + 1 | 0;
          if (($0_1 | 0) != (32 | 0)) {
           continue label$66
          }
          break label$66;
         };
         $0_1 = $2_1 + -40 | 0;
         $4_1 = ($7_1 + 8 | 0) & 7 | 0 ? (-8 - $7_1 | 0) & 7 | 0 : 0;
         $5_1 = $0_1 - $4_1 | 0;
         HEAP32[(0 + 1176 | 0) >> 2] = $5_1;
         $4_1 = $7_1 + $4_1 | 0;
         HEAP32[(0 + 1188 | 0) >> 2] = $4_1;
         HEAP32[($4_1 + 4 | 0) >> 2] = $5_1 | 1 | 0;
         HEAP32[(($7_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
         HEAP32[(0 + 1192 | 0) >> 2] = HEAP32[(0 + 1652 | 0) >> 2] | 0;
         break label$59;
        }
        if ((HEAPU8[($0_1 + 12 | 0) >> 0] | 0) & 8 | 0) {
         break label$60
        }
        if ($4_1 >>> 0 < $5_1 >>> 0) {
         break label$60
        }
        if ($4_1 >>> 0 >= $7_1 >>> 0) {
         break label$60
        }
        HEAP32[($0_1 + 4 | 0) >> 2] = $8_1 + $2_1 | 0;
        $0_1 = ($4_1 + 8 | 0) & 7 | 0 ? (-8 - $4_1 | 0) & 7 | 0 : 0;
        $5_1 = $4_1 + $0_1 | 0;
        HEAP32[(0 + 1188 | 0) >> 2] = $5_1;
        $7_1 = (HEAP32[(0 + 1176 | 0) >> 2] | 0) + $2_1 | 0;
        $0_1 = $7_1 - $0_1 | 0;
        HEAP32[(0 + 1176 | 0) >> 2] = $0_1;
        HEAP32[($5_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
        HEAP32[(($4_1 + $7_1 | 0) + 4 | 0) >> 2] = 40;
        HEAP32[(0 + 1192 | 0) >> 2] = HEAP32[(0 + 1652 | 0) >> 2] | 0;
        break label$59;
       }
       label$67 : {
        $8_1 = HEAP32[(0 + 1180 | 0) >> 2] | 0;
        if ($7_1 >>> 0 >= $8_1 >>> 0) {
         break label$67
        }
        HEAP32[(0 + 1180 | 0) >> 2] = $7_1;
        $8_1 = $7_1;
       }
       $5_1 = $7_1 + $2_1 | 0;
       $0_1 = 1612;
       label$68 : {
        label$69 : {
         label$70 : {
          label$71 : {
           label$72 : {
            label$73 : {
             label$74 : {
              label$75 : while (1) {
               if ((HEAP32[$0_1 >> 2] | 0 | 0) == ($5_1 | 0)) {
                break label$74
               }
               $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
               if ($0_1) {
                continue label$75
               }
               break label$73;
              };
             }
             if (!((HEAPU8[($0_1 + 12 | 0) >> 0] | 0) & 8 | 0)) {
              break label$72
             }
            }
            $0_1 = 1612;
            label$76 : while (1) {
             label$77 : {
              $5_1 = HEAP32[$0_1 >> 2] | 0;
              if ($5_1 >>> 0 > $4_1 >>> 0) {
               break label$77
              }
              $5_1 = $5_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0;
              if ($5_1 >>> 0 > $4_1 >>> 0) {
               break label$71
              }
             }
             $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
             continue label$76;
            };
           }
           HEAP32[$0_1 >> 2] = $7_1;
           HEAP32[($0_1 + 4 | 0) >> 2] = (HEAP32[($0_1 + 4 | 0) >> 2] | 0) + $2_1 | 0;
           $11_1 = $7_1 + (($7_1 + 8 | 0) & 7 | 0 ? (-8 - $7_1 | 0) & 7 | 0 : 0) | 0;
           HEAP32[($11_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
           $2_1 = $5_1 + (($5_1 + 8 | 0) & 7 | 0 ? (-8 - $5_1 | 0) & 7 | 0 : 0) | 0;
           $3_1 = $11_1 + $3_1 | 0;
           $0_1 = $2_1 - $3_1 | 0;
           label$78 : {
            if (($2_1 | 0) != ($4_1 | 0)) {
             break label$78
            }
            HEAP32[(0 + 1188 | 0) >> 2] = $3_1;
            $0_1 = (HEAP32[(0 + 1176 | 0) >> 2] | 0) + $0_1 | 0;
            HEAP32[(0 + 1176 | 0) >> 2] = $0_1;
            HEAP32[($3_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
            break label$69;
           }
           label$79 : {
            if (($2_1 | 0) != (HEAP32[(0 + 1184 | 0) >> 2] | 0 | 0)) {
             break label$79
            }
            HEAP32[(0 + 1184 | 0) >> 2] = $3_1;
            $0_1 = (HEAP32[(0 + 1172 | 0) >> 2] | 0) + $0_1 | 0;
            HEAP32[(0 + 1172 | 0) >> 2] = $0_1;
            HEAP32[($3_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
            HEAP32[($3_1 + $0_1 | 0) >> 2] = $0_1;
            break label$69;
           }
           label$80 : {
            $4_1 = HEAP32[($2_1 + 4 | 0) >> 2] | 0;
            if (($4_1 & 3 | 0 | 0) != (1 | 0)) {
             break label$80
            }
            $6_1 = $4_1 & -8 | 0;
            label$81 : {
             label$82 : {
              if ($4_1 >>> 0 > 255 >>> 0) {
               break label$82
              }
              $5_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
              $8_1 = $4_1 >>> 3 | 0;
              $7_1 = ($8_1 << 3 | 0) + 1204 | 0;
              label$83 : {
               $4_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
               if (($4_1 | 0) != ($5_1 | 0)) {
                break label$83
               }
               HEAP32[(0 + 1164 | 0) >> 2] = (HEAP32[(0 + 1164 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $8_1 | 0) | 0) | 0;
               break label$81;
              }
              HEAP32[($5_1 + 12 | 0) >> 2] = $4_1;
              HEAP32[($4_1 + 8 | 0) >> 2] = $5_1;
              break label$81;
             }
             $9_1 = HEAP32[($2_1 + 24 | 0) >> 2] | 0;
             label$84 : {
              label$85 : {
               $7_1 = HEAP32[($2_1 + 12 | 0) >> 2] | 0;
               if (($7_1 | 0) == ($2_1 | 0)) {
                break label$85
               }
               $4_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
               HEAP32[($4_1 + 12 | 0) >> 2] = $7_1;
               HEAP32[($7_1 + 8 | 0) >> 2] = $4_1;
               break label$84;
              }
              label$86 : {
               $4_1 = $2_1 + 20 | 0;
               $5_1 = HEAP32[$4_1 >> 2] | 0;
               if ($5_1) {
                break label$86
               }
               $4_1 = $2_1 + 16 | 0;
               $5_1 = HEAP32[$4_1 >> 2] | 0;
               if ($5_1) {
                break label$86
               }
               $7_1 = 0;
               break label$84;
              }
              label$87 : while (1) {
               $8_1 = $4_1;
               $7_1 = $5_1;
               $4_1 = $5_1 + 20 | 0;
               $5_1 = HEAP32[$4_1 >> 2] | 0;
               if ($5_1) {
                continue label$87
               }
               $4_1 = $7_1 + 16 | 0;
               $5_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
               if ($5_1) {
                continue label$87
               }
               break label$87;
              };
              HEAP32[$8_1 >> 2] = 0;
             }
             if (!$9_1) {
              break label$81
             }
             label$88 : {
              label$89 : {
               $5_1 = HEAP32[($2_1 + 28 | 0) >> 2] | 0;
               $4_1 = ($5_1 << 2 | 0) + 1468 | 0;
               if (($2_1 | 0) != (HEAP32[$4_1 >> 2] | 0 | 0)) {
                break label$89
               }
               HEAP32[$4_1 >> 2] = $7_1;
               if ($7_1) {
                break label$88
               }
               HEAP32[(0 + 1168 | 0) >> 2] = (HEAP32[(0 + 1168 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
               break label$81;
              }
              HEAP32[($9_1 + ((HEAP32[($9_1 + 16 | 0) >> 2] | 0 | 0) == ($2_1 | 0) ? 16 : 20) | 0) >> 2] = $7_1;
              if (!$7_1) {
               break label$81
              }
             }
             HEAP32[($7_1 + 24 | 0) >> 2] = $9_1;
             label$90 : {
              $4_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
              if (!$4_1) {
               break label$90
              }
              HEAP32[($7_1 + 16 | 0) >> 2] = $4_1;
              HEAP32[($4_1 + 24 | 0) >> 2] = $7_1;
             }
             $4_1 = HEAP32[($2_1 + 20 | 0) >> 2] | 0;
             if (!$4_1) {
              break label$81
             }
             HEAP32[($7_1 + 20 | 0) >> 2] = $4_1;
             HEAP32[($4_1 + 24 | 0) >> 2] = $7_1;
            }
            $0_1 = $6_1 + $0_1 | 0;
            $2_1 = $2_1 + $6_1 | 0;
            $4_1 = HEAP32[($2_1 + 4 | 0) >> 2] | 0;
           }
           HEAP32[($2_1 + 4 | 0) >> 2] = $4_1 & -2 | 0;
           HEAP32[($3_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
           HEAP32[($3_1 + $0_1 | 0) >> 2] = $0_1;
           label$91 : {
            if ($0_1 >>> 0 > 255 >>> 0) {
             break label$91
            }
            $4_1 = ($0_1 & -8 | 0) + 1204 | 0;
            label$92 : {
             label$93 : {
              $5_1 = HEAP32[(0 + 1164 | 0) >> 2] | 0;
              $0_1 = 1 << ($0_1 >>> 3 | 0) | 0;
              if ($5_1 & $0_1 | 0) {
               break label$93
              }
              HEAP32[(0 + 1164 | 0) >> 2] = $5_1 | $0_1 | 0;
              $0_1 = $4_1;
              break label$92;
             }
             $0_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
            }
            HEAP32[($4_1 + 8 | 0) >> 2] = $3_1;
            HEAP32[($0_1 + 12 | 0) >> 2] = $3_1;
            HEAP32[($3_1 + 12 | 0) >> 2] = $4_1;
            HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
            break label$69;
           }
           $4_1 = 31;
           label$94 : {
            if ($0_1 >>> 0 > 16777215 >>> 0) {
             break label$94
            }
            $4_1 = $0_1 >>> 8 | 0;
            $1156 = $4_1;
            $4_1 = (($4_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
            $5_1 = $1156 << $4_1 | 0;
            $1163 = $5_1;
            $5_1 = (($5_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
            $7_1 = $1163 << $5_1 | 0;
            $1170 = $7_1;
            $7_1 = (($7_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
            $4_1 = (($1170 << $7_1 | 0) >>> 15 | 0) - ($4_1 | $5_1 | 0 | $7_1 | 0) | 0;
            $4_1 = ($4_1 << 1 | 0 | (($0_1 >>> ($4_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
           }
           HEAP32[($3_1 + 28 | 0) >> 2] = $4_1;
           i64toi32_i32$1 = $3_1;
           i64toi32_i32$0 = 0;
           HEAP32[($3_1 + 16 | 0) >> 2] = 0;
           HEAP32[($3_1 + 20 | 0) >> 2] = i64toi32_i32$0;
           $5_1 = ($4_1 << 2 | 0) + 1468 | 0;
           label$95 : {
            label$96 : {
             $7_1 = HEAP32[(0 + 1168 | 0) >> 2] | 0;
             $8_1 = 1 << $4_1 | 0;
             if ($7_1 & $8_1 | 0) {
              break label$96
             }
             HEAP32[(0 + 1168 | 0) >> 2] = $7_1 | $8_1 | 0;
             HEAP32[$5_1 >> 2] = $3_1;
             HEAP32[($3_1 + 24 | 0) >> 2] = $5_1;
             break label$95;
            }
            $4_1 = $0_1 << (($4_1 | 0) == (31 | 0) ? 0 : 25 - ($4_1 >>> 1 | 0) | 0) | 0;
            $7_1 = HEAP32[$5_1 >> 2] | 0;
            label$97 : while (1) {
             $5_1 = $7_1;
             if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
              break label$70
             }
             $7_1 = $4_1 >>> 29 | 0;
             $4_1 = $4_1 << 1 | 0;
             $8_1 = ($5_1 + ($7_1 & 4 | 0) | 0) + 16 | 0;
             $7_1 = HEAP32[$8_1 >> 2] | 0;
             if ($7_1) {
              continue label$97
             }
             break label$97;
            };
            HEAP32[$8_1 >> 2] = $3_1;
            HEAP32[($3_1 + 24 | 0) >> 2] = $5_1;
           }
           HEAP32[($3_1 + 12 | 0) >> 2] = $3_1;
           HEAP32[($3_1 + 8 | 0) >> 2] = $3_1;
           break label$69;
          }
          $0_1 = $2_1 + -40 | 0;
          $8_1 = ($7_1 + 8 | 0) & 7 | 0 ? (-8 - $7_1 | 0) & 7 | 0 : 0;
          $11_1 = $0_1 - $8_1 | 0;
          HEAP32[(0 + 1176 | 0) >> 2] = $11_1;
          $8_1 = $7_1 + $8_1 | 0;
          HEAP32[(0 + 1188 | 0) >> 2] = $8_1;
          HEAP32[($8_1 + 4 | 0) >> 2] = $11_1 | 1 | 0;
          HEAP32[(($7_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
          HEAP32[(0 + 1192 | 0) >> 2] = HEAP32[(0 + 1652 | 0) >> 2] | 0;
          $0_1 = ($5_1 + (($5_1 + -39 | 0) & 7 | 0 ? (39 - $5_1 | 0) & 7 | 0 : 0) | 0) + -47 | 0;
          $8_1 = $0_1 >>> 0 < ($4_1 + 16 | 0) >>> 0 ? $4_1 : $0_1;
          HEAP32[($8_1 + 4 | 0) >> 2] = 27;
          i64toi32_i32$2 = 0;
          i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1620 | 0) >> 2] | 0;
          i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1624 | 0) >> 2] | 0;
          $1292 = i64toi32_i32$0;
          i64toi32_i32$0 = $8_1 + 16 | 0;
          HEAP32[i64toi32_i32$0 >> 2] = $1292;
          HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
          i64toi32_i32$2 = 0;
          i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1612 | 0) >> 2] | 0;
          i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1616 | 0) >> 2] | 0;
          $1294 = i64toi32_i32$1;
          i64toi32_i32$1 = $8_1;
          HEAP32[($8_1 + 8 | 0) >> 2] = $1294;
          HEAP32[($8_1 + 12 | 0) >> 2] = i64toi32_i32$0;
          HEAP32[(0 + 1620 | 0) >> 2] = $8_1 + 8 | 0;
          HEAP32[(0 + 1616 | 0) >> 2] = $2_1;
          HEAP32[(0 + 1612 | 0) >> 2] = $7_1;
          HEAP32[(0 + 1624 | 0) >> 2] = 0;
          $0_1 = $8_1 + 24 | 0;
          label$98 : while (1) {
           HEAP32[($0_1 + 4 | 0) >> 2] = 7;
           $7_1 = $0_1 + 8 | 0;
           $0_1 = $0_1 + 4 | 0;
           if ($7_1 >>> 0 < $5_1 >>> 0) {
            continue label$98
           }
           break label$98;
          };
          if (($8_1 | 0) == ($4_1 | 0)) {
           break label$59
          }
          HEAP32[($8_1 + 4 | 0) >> 2] = (HEAP32[($8_1 + 4 | 0) >> 2] | 0) & -2 | 0;
          $7_1 = $8_1 - $4_1 | 0;
          HEAP32[($4_1 + 4 | 0) >> 2] = $7_1 | 1 | 0;
          HEAP32[$8_1 >> 2] = $7_1;
          label$99 : {
           if ($7_1 >>> 0 > 255 >>> 0) {
            break label$99
           }
           $0_1 = ($7_1 & -8 | 0) + 1204 | 0;
           label$100 : {
            label$101 : {
             $5_1 = HEAP32[(0 + 1164 | 0) >> 2] | 0;
             $7_1 = 1 << ($7_1 >>> 3 | 0) | 0;
             if ($5_1 & $7_1 | 0) {
              break label$101
             }
             HEAP32[(0 + 1164 | 0) >> 2] = $5_1 | $7_1 | 0;
             $5_1 = $0_1;
             break label$100;
            }
            $5_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
           }
           HEAP32[($0_1 + 8 | 0) >> 2] = $4_1;
           HEAP32[($5_1 + 12 | 0) >> 2] = $4_1;
           HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
           HEAP32[($4_1 + 8 | 0) >> 2] = $5_1;
           break label$59;
          }
          $0_1 = 31;
          label$102 : {
           if ($7_1 >>> 0 > 16777215 >>> 0) {
            break label$102
           }
           $0_1 = $7_1 >>> 8 | 0;
           $1354 = $0_1;
           $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
           $5_1 = $1354 << $0_1 | 0;
           $1361 = $5_1;
           $5_1 = (($5_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
           $8_1 = $1361 << $5_1 | 0;
           $1368 = $8_1;
           $8_1 = (($8_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
           $0_1 = (($1368 << $8_1 | 0) >>> 15 | 0) - ($0_1 | $5_1 | 0 | $8_1 | 0) | 0;
           $0_1 = ($0_1 << 1 | 0 | (($7_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
          }
          HEAP32[($4_1 + 28 | 0) >> 2] = $0_1;
          i64toi32_i32$1 = $4_1;
          i64toi32_i32$0 = 0;
          HEAP32[($4_1 + 16 | 0) >> 2] = 0;
          HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$0;
          $5_1 = ($0_1 << 2 | 0) + 1468 | 0;
          label$103 : {
           label$104 : {
            $8_1 = HEAP32[(0 + 1168 | 0) >> 2] | 0;
            $2_1 = 1 << $0_1 | 0;
            if ($8_1 & $2_1 | 0) {
             break label$104
            }
            HEAP32[(0 + 1168 | 0) >> 2] = $8_1 | $2_1 | 0;
            HEAP32[$5_1 >> 2] = $4_1;
            HEAP32[($4_1 + 24 | 0) >> 2] = $5_1;
            break label$103;
           }
           $0_1 = $7_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
           $8_1 = HEAP32[$5_1 >> 2] | 0;
           label$105 : while (1) {
            $5_1 = $8_1;
            if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($7_1 | 0)) {
             break label$68
            }
            $8_1 = $0_1 >>> 29 | 0;
            $0_1 = $0_1 << 1 | 0;
            $2_1 = ($5_1 + ($8_1 & 4 | 0) | 0) + 16 | 0;
            $8_1 = HEAP32[$2_1 >> 2] | 0;
            if ($8_1) {
             continue label$105
            }
            break label$105;
           };
           HEAP32[$2_1 >> 2] = $4_1;
           HEAP32[($4_1 + 24 | 0) >> 2] = $5_1;
          }
          HEAP32[($4_1 + 12 | 0) >> 2] = $4_1;
          HEAP32[($4_1 + 8 | 0) >> 2] = $4_1;
          break label$59;
         }
         $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
         HEAP32[($0_1 + 12 | 0) >> 2] = $3_1;
         HEAP32[($5_1 + 8 | 0) >> 2] = $3_1;
         HEAP32[($3_1 + 24 | 0) >> 2] = 0;
         HEAP32[($3_1 + 12 | 0) >> 2] = $5_1;
         HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
        }
        $0_1 = $11_1 + 8 | 0;
        break label$1;
       }
       $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
       HEAP32[($0_1 + 12 | 0) >> 2] = $4_1;
       HEAP32[($5_1 + 8 | 0) >> 2] = $4_1;
       HEAP32[($4_1 + 24 | 0) >> 2] = 0;
       HEAP32[($4_1 + 12 | 0) >> 2] = $5_1;
       HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
      }
      $0_1 = HEAP32[(0 + 1176 | 0) >> 2] | 0;
      if ($0_1 >>> 0 <= $3_1 >>> 0) {
       break label$4
      }
      $4_1 = $0_1 - $3_1 | 0;
      HEAP32[(0 + 1176 | 0) >> 2] = $4_1;
      $0_1 = HEAP32[(0 + 1188 | 0) >> 2] | 0;
      $5_1 = $0_1 + $3_1 | 0;
      HEAP32[(0 + 1188 | 0) >> 2] = $5_1;
      HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
      $0_1 = $0_1 + 8 | 0;
      break label$1;
     }
     HEAP32[($135() | 0) >> 2] = 48;
     $0_1 = 0;
     break label$1;
    }
    label$106 : {
     if (!$11_1) {
      break label$106
     }
     label$107 : {
      label$108 : {
       $5_1 = HEAP32[($8_1 + 28 | 0) >> 2] | 0;
       $0_1 = ($5_1 << 2 | 0) + 1468 | 0;
       if (($8_1 | 0) != (HEAP32[$0_1 >> 2] | 0 | 0)) {
        break label$108
       }
       HEAP32[$0_1 >> 2] = $7_1;
       if ($7_1) {
        break label$107
       }
       $6_1 = $6_1 & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
       HEAP32[(0 + 1168 | 0) >> 2] = $6_1;
       break label$106;
      }
      HEAP32[($11_1 + ((HEAP32[($11_1 + 16 | 0) >> 2] | 0 | 0) == ($8_1 | 0) ? 16 : 20) | 0) >> 2] = $7_1;
      if (!$7_1) {
       break label$106
      }
     }
     HEAP32[($7_1 + 24 | 0) >> 2] = $11_1;
     label$109 : {
      $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
      if (!$0_1) {
       break label$109
      }
      HEAP32[($7_1 + 16 | 0) >> 2] = $0_1;
      HEAP32[($0_1 + 24 | 0) >> 2] = $7_1;
     }
     $0_1 = HEAP32[($8_1 + 20 | 0) >> 2] | 0;
     if (!$0_1) {
      break label$106
     }
     HEAP32[($7_1 + 20 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 24 | 0) >> 2] = $7_1;
    }
    label$110 : {
     label$111 : {
      if ($4_1 >>> 0 > 15 >>> 0) {
       break label$111
      }
      $0_1 = $4_1 + $3_1 | 0;
      HEAP32[($8_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
      $0_1 = $8_1 + $0_1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
      break label$110;
     }
     HEAP32[($8_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
     $7_1 = $8_1 + $3_1 | 0;
     HEAP32[($7_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
     HEAP32[($7_1 + $4_1 | 0) >> 2] = $4_1;
     label$112 : {
      if ($4_1 >>> 0 > 255 >>> 0) {
       break label$112
      }
      $0_1 = ($4_1 & -8 | 0) + 1204 | 0;
      label$113 : {
       label$114 : {
        $5_1 = HEAP32[(0 + 1164 | 0) >> 2] | 0;
        $4_1 = 1 << ($4_1 >>> 3 | 0) | 0;
        if ($5_1 & $4_1 | 0) {
         break label$114
        }
        HEAP32[(0 + 1164 | 0) >> 2] = $5_1 | $4_1 | 0;
        $4_1 = $0_1;
        break label$113;
       }
       $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
      }
      HEAP32[($0_1 + 8 | 0) >> 2] = $7_1;
      HEAP32[($4_1 + 12 | 0) >> 2] = $7_1;
      HEAP32[($7_1 + 12 | 0) >> 2] = $0_1;
      HEAP32[($7_1 + 8 | 0) >> 2] = $4_1;
      break label$110;
     }
     $0_1 = 31;
     label$115 : {
      if ($4_1 >>> 0 > 16777215 >>> 0) {
       break label$115
      }
      $0_1 = $4_1 >>> 8 | 0;
      $1599 = $0_1;
      $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
      $5_1 = $1599 << $0_1 | 0;
      $1606 = $5_1;
      $5_1 = (($5_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
      $3_1 = $1606 << $5_1 | 0;
      $1613 = $3_1;
      $3_1 = (($3_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
      $0_1 = (($1613 << $3_1 | 0) >>> 15 | 0) - ($0_1 | $5_1 | 0 | $3_1 | 0) | 0;
      $0_1 = ($0_1 << 1 | 0 | (($4_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
     }
     HEAP32[($7_1 + 28 | 0) >> 2] = $0_1;
     i64toi32_i32$1 = $7_1;
     i64toi32_i32$0 = 0;
     HEAP32[($7_1 + 16 | 0) >> 2] = 0;
     HEAP32[($7_1 + 20 | 0) >> 2] = i64toi32_i32$0;
     $5_1 = ($0_1 << 2 | 0) + 1468 | 0;
     label$116 : {
      label$117 : {
       label$118 : {
        $3_1 = 1 << $0_1 | 0;
        if ($6_1 & $3_1 | 0) {
         break label$118
        }
        HEAP32[(0 + 1168 | 0) >> 2] = $6_1 | $3_1 | 0;
        HEAP32[$5_1 >> 2] = $7_1;
        HEAP32[($7_1 + 24 | 0) >> 2] = $5_1;
        break label$117;
       }
       $0_1 = $4_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
       $3_1 = HEAP32[$5_1 >> 2] | 0;
       label$119 : while (1) {
        $5_1 = $3_1;
        if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($4_1 | 0)) {
         break label$116
        }
        $3_1 = $0_1 >>> 29 | 0;
        $0_1 = $0_1 << 1 | 0;
        $2_1 = ($5_1 + ($3_1 & 4 | 0) | 0) + 16 | 0;
        $3_1 = HEAP32[$2_1 >> 2] | 0;
        if ($3_1) {
         continue label$119
        }
        break label$119;
       };
       HEAP32[$2_1 >> 2] = $7_1;
       HEAP32[($7_1 + 24 | 0) >> 2] = $5_1;
      }
      HEAP32[($7_1 + 12 | 0) >> 2] = $7_1;
      HEAP32[($7_1 + 8 | 0) >> 2] = $7_1;
      break label$110;
     }
     $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
     HEAP32[($0_1 + 12 | 0) >> 2] = $7_1;
     HEAP32[($5_1 + 8 | 0) >> 2] = $7_1;
     HEAP32[($7_1 + 24 | 0) >> 2] = 0;
     HEAP32[($7_1 + 12 | 0) >> 2] = $5_1;
     HEAP32[($7_1 + 8 | 0) >> 2] = $0_1;
    }
    $0_1 = $8_1 + 8 | 0;
    break label$1;
   }
   label$120 : {
    if (!$10_1) {
     break label$120
    }
    label$121 : {
     label$122 : {
      $5_1 = HEAP32[($7_1 + 28 | 0) >> 2] | 0;
      $0_1 = ($5_1 << 2 | 0) + 1468 | 0;
      if (($7_1 | 0) != (HEAP32[$0_1 >> 2] | 0 | 0)) {
       break label$122
      }
      HEAP32[$0_1 >> 2] = $8_1;
      if ($8_1) {
       break label$121
      }
      HEAP32[(0 + 1168 | 0) >> 2] = $9_1 & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
      break label$120;
     }
     HEAP32[($10_1 + ((HEAP32[($10_1 + 16 | 0) >> 2] | 0 | 0) == ($7_1 | 0) ? 16 : 20) | 0) >> 2] = $8_1;
     if (!$8_1) {
      break label$120
     }
    }
    HEAP32[($8_1 + 24 | 0) >> 2] = $10_1;
    label$123 : {
     $0_1 = HEAP32[($7_1 + 16 | 0) >> 2] | 0;
     if (!$0_1) {
      break label$123
     }
     HEAP32[($8_1 + 16 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 24 | 0) >> 2] = $8_1;
    }
    $0_1 = HEAP32[($7_1 + 20 | 0) >> 2] | 0;
    if (!$0_1) {
     break label$120
    }
    HEAP32[($8_1 + 20 | 0) >> 2] = $0_1;
    HEAP32[($0_1 + 24 | 0) >> 2] = $8_1;
   }
   label$124 : {
    label$125 : {
     if ($4_1 >>> 0 > 15 >>> 0) {
      break label$125
     }
     $0_1 = $4_1 + $3_1 | 0;
     HEAP32[($7_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
     $0_1 = $7_1 + $0_1 | 0;
     HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
     break label$124;
    }
    HEAP32[($7_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
    $5_1 = $7_1 + $3_1 | 0;
    HEAP32[($5_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
    HEAP32[($5_1 + $4_1 | 0) >> 2] = $4_1;
    label$126 : {
     if (!$6_1) {
      break label$126
     }
     $3_1 = ($6_1 & -8 | 0) + 1204 | 0;
     $0_1 = HEAP32[(0 + 1184 | 0) >> 2] | 0;
     label$127 : {
      label$128 : {
       $8_1 = 1 << ($6_1 >>> 3 | 0) | 0;
       if ($8_1 & $2_1 | 0) {
        break label$128
       }
       HEAP32[(0 + 1164 | 0) >> 2] = $8_1 | $2_1 | 0;
       $8_1 = $3_1;
       break label$127;
      }
      $8_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
     }
     HEAP32[($3_1 + 8 | 0) >> 2] = $0_1;
     HEAP32[($8_1 + 12 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 12 | 0) >> 2] = $3_1;
     HEAP32[($0_1 + 8 | 0) >> 2] = $8_1;
    }
    HEAP32[(0 + 1184 | 0) >> 2] = $5_1;
    HEAP32[(0 + 1172 | 0) >> 2] = $4_1;
   }
   $0_1 = $7_1 + 8 | 0;
  }
  global$0 = $1_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $139($0_1) {
  $0_1 = $0_1 | 0;
  var $2_1 = 0, $6_1 = 0, $1_1 = 0, $4_1 = 0, $3_1 = 0, $5_1 = 0, $7_1 = 0, $378 = 0, $385 = 0, $392 = 0;
  label$1 : {
   if (!$0_1) {
    break label$1
   }
   $1_1 = $0_1 + -8 | 0;
   $2_1 = HEAP32[($0_1 + -4 | 0) >> 2] | 0;
   $0_1 = $2_1 & -8 | 0;
   $3_1 = $1_1 + $0_1 | 0;
   label$2 : {
    if ($2_1 & 1 | 0) {
     break label$2
    }
    if (!($2_1 & 3 | 0)) {
     break label$1
    }
    $2_1 = HEAP32[$1_1 >> 2] | 0;
    $1_1 = $1_1 - $2_1 | 0;
    $4_1 = HEAP32[(0 + 1180 | 0) >> 2] | 0;
    if ($1_1 >>> 0 < $4_1 >>> 0) {
     break label$1
    }
    $0_1 = $2_1 + $0_1 | 0;
    label$3 : {
     if (($1_1 | 0) == (HEAP32[(0 + 1184 | 0) >> 2] | 0 | 0)) {
      break label$3
     }
     label$4 : {
      if ($2_1 >>> 0 > 255 >>> 0) {
       break label$4
      }
      $4_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
      $5_1 = $2_1 >>> 3 | 0;
      $6_1 = ($5_1 << 3 | 0) + 1204 | 0;
      label$5 : {
       $2_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
       if (($2_1 | 0) != ($4_1 | 0)) {
        break label$5
       }
       HEAP32[(0 + 1164 | 0) >> 2] = (HEAP32[(0 + 1164 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
       break label$2;
      }
      HEAP32[($4_1 + 12 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 8 | 0) >> 2] = $4_1;
      break label$2;
     }
     $7_1 = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
     label$6 : {
      label$7 : {
       $6_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
       if (($6_1 | 0) == ($1_1 | 0)) {
        break label$7
       }
       $2_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
       HEAP32[($2_1 + 12 | 0) >> 2] = $6_1;
       HEAP32[($6_1 + 8 | 0) >> 2] = $2_1;
       break label$6;
      }
      label$8 : {
       $2_1 = $1_1 + 20 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        break label$8
       }
       $2_1 = $1_1 + 16 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        break label$8
       }
       $6_1 = 0;
       break label$6;
      }
      label$9 : while (1) {
       $5_1 = $2_1;
       $6_1 = $4_1;
       $2_1 = $6_1 + 20 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        continue label$9
       }
       $2_1 = $6_1 + 16 | 0;
       $4_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
       if ($4_1) {
        continue label$9
       }
       break label$9;
      };
      HEAP32[$5_1 >> 2] = 0;
     }
     if (!$7_1) {
      break label$2
     }
     label$10 : {
      label$11 : {
       $4_1 = HEAP32[($1_1 + 28 | 0) >> 2] | 0;
       $2_1 = ($4_1 << 2 | 0) + 1468 | 0;
       if (($1_1 | 0) != (HEAP32[$2_1 >> 2] | 0 | 0)) {
        break label$11
       }
       HEAP32[$2_1 >> 2] = $6_1;
       if ($6_1) {
        break label$10
       }
       HEAP32[(0 + 1168 | 0) >> 2] = (HEAP32[(0 + 1168 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
       break label$2;
      }
      HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($1_1 | 0) ? 16 : 20) | 0) >> 2] = $6_1;
      if (!$6_1) {
       break label$2
      }
     }
     HEAP32[($6_1 + 24 | 0) >> 2] = $7_1;
     label$12 : {
      $2_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
      if (!$2_1) {
       break label$12
      }
      HEAP32[($6_1 + 16 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 24 | 0) >> 2] = $6_1;
     }
     $2_1 = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
     if (!$2_1) {
      break label$2
     }
     HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
     HEAP32[($2_1 + 24 | 0) >> 2] = $6_1;
     break label$2;
    }
    $2_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
    if (($2_1 & 3 | 0 | 0) != (3 | 0)) {
     break label$2
    }
    HEAP32[(0 + 1172 | 0) >> 2] = $0_1;
    HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 & -2 | 0;
    HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
    HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
    return;
   }
   if ($1_1 >>> 0 >= $3_1 >>> 0) {
    break label$1
   }
   $2_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
   if (!($2_1 & 1 | 0)) {
    break label$1
   }
   label$13 : {
    label$14 : {
     if ($2_1 & 2 | 0) {
      break label$14
     }
     label$15 : {
      if (($3_1 | 0) != (HEAP32[(0 + 1188 | 0) >> 2] | 0 | 0)) {
       break label$15
      }
      HEAP32[(0 + 1188 | 0) >> 2] = $1_1;
      $0_1 = (HEAP32[(0 + 1176 | 0) >> 2] | 0) + $0_1 | 0;
      HEAP32[(0 + 1176 | 0) >> 2] = $0_1;
      HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
      if (($1_1 | 0) != (HEAP32[(0 + 1184 | 0) >> 2] | 0 | 0)) {
       break label$1
      }
      HEAP32[(0 + 1172 | 0) >> 2] = 0;
      HEAP32[(0 + 1184 | 0) >> 2] = 0;
      return;
     }
     label$16 : {
      if (($3_1 | 0) != (HEAP32[(0 + 1184 | 0) >> 2] | 0 | 0)) {
       break label$16
      }
      HEAP32[(0 + 1184 | 0) >> 2] = $1_1;
      $0_1 = (HEAP32[(0 + 1172 | 0) >> 2] | 0) + $0_1 | 0;
      HEAP32[(0 + 1172 | 0) >> 2] = $0_1;
      HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
      HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
      return;
     }
     $0_1 = ($2_1 & -8 | 0) + $0_1 | 0;
     label$17 : {
      label$18 : {
       if ($2_1 >>> 0 > 255 >>> 0) {
        break label$18
       }
       $4_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
       $5_1 = $2_1 >>> 3 | 0;
       $6_1 = ($5_1 << 3 | 0) + 1204 | 0;
       label$19 : {
        $2_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
        if (($2_1 | 0) != ($4_1 | 0)) {
         break label$19
        }
        HEAP32[(0 + 1164 | 0) >> 2] = (HEAP32[(0 + 1164 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $5_1 | 0) | 0) | 0;
        break label$17;
       }
       HEAP32[($4_1 + 12 | 0) >> 2] = $2_1;
       HEAP32[($2_1 + 8 | 0) >> 2] = $4_1;
       break label$17;
      }
      $7_1 = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
      label$20 : {
       label$21 : {
        $6_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
        if (($6_1 | 0) == ($3_1 | 0)) {
         break label$21
        }
        $2_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
        HEAP32[(0 + 1180 | 0) >> 2] | 0;
        HEAP32[($2_1 + 12 | 0) >> 2] = $6_1;
        HEAP32[($6_1 + 8 | 0) >> 2] = $2_1;
        break label$20;
       }
       label$22 : {
        $2_1 = $3_1 + 20 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         break label$22
        }
        $2_1 = $3_1 + 16 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         break label$22
        }
        $6_1 = 0;
        break label$20;
       }
       label$23 : while (1) {
        $5_1 = $2_1;
        $6_1 = $4_1;
        $2_1 = $6_1 + 20 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         continue label$23
        }
        $2_1 = $6_1 + 16 | 0;
        $4_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
        if ($4_1) {
         continue label$23
        }
        break label$23;
       };
       HEAP32[$5_1 >> 2] = 0;
      }
      if (!$7_1) {
       break label$17
      }
      label$24 : {
       label$25 : {
        $4_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
        $2_1 = ($4_1 << 2 | 0) + 1468 | 0;
        if (($3_1 | 0) != (HEAP32[$2_1 >> 2] | 0 | 0)) {
         break label$25
        }
        HEAP32[$2_1 >> 2] = $6_1;
        if ($6_1) {
         break label$24
        }
        HEAP32[(0 + 1168 | 0) >> 2] = (HEAP32[(0 + 1168 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
        break label$17;
       }
       HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($3_1 | 0) ? 16 : 20) | 0) >> 2] = $6_1;
       if (!$6_1) {
        break label$17
       }
      }
      HEAP32[($6_1 + 24 | 0) >> 2] = $7_1;
      label$26 : {
       $2_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
       if (!$2_1) {
        break label$26
       }
       HEAP32[($6_1 + 16 | 0) >> 2] = $2_1;
       HEAP32[($2_1 + 24 | 0) >> 2] = $6_1;
      }
      $2_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
      if (!$2_1) {
       break label$17
      }
      HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 24 | 0) >> 2] = $6_1;
     }
     HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
     HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
     if (($1_1 | 0) != (HEAP32[(0 + 1184 | 0) >> 2] | 0 | 0)) {
      break label$13
     }
     HEAP32[(0 + 1172 | 0) >> 2] = $0_1;
     return;
    }
    HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 & -2 | 0;
    HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
    HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
   }
   label$27 : {
    if ($0_1 >>> 0 > 255 >>> 0) {
     break label$27
    }
    $2_1 = ($0_1 & -8 | 0) + 1204 | 0;
    label$28 : {
     label$29 : {
      $4_1 = HEAP32[(0 + 1164 | 0) >> 2] | 0;
      $0_1 = 1 << ($0_1 >>> 3 | 0) | 0;
      if ($4_1 & $0_1 | 0) {
       break label$29
      }
      HEAP32[(0 + 1164 | 0) >> 2] = $4_1 | $0_1 | 0;
      $0_1 = $2_1;
      break label$28;
     }
     $0_1 = HEAP32[($2_1 + 8 | 0) >> 2] | 0;
    }
    HEAP32[($2_1 + 8 | 0) >> 2] = $1_1;
    HEAP32[($0_1 + 12 | 0) >> 2] = $1_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = $2_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $0_1;
    return;
   }
   $2_1 = 31;
   label$30 : {
    if ($0_1 >>> 0 > 16777215 >>> 0) {
     break label$30
    }
    $2_1 = $0_1 >>> 8 | 0;
    $378 = $2_1;
    $2_1 = (($2_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
    $4_1 = $378 << $2_1 | 0;
    $385 = $4_1;
    $4_1 = (($4_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
    $6_1 = $385 << $4_1 | 0;
    $392 = $6_1;
    $6_1 = (($6_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
    $2_1 = (($392 << $6_1 | 0) >>> 15 | 0) - ($2_1 | $4_1 | 0 | $6_1 | 0) | 0;
    $2_1 = ($2_1 << 1 | 0 | (($0_1 >>> ($2_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
   }
   HEAP32[($1_1 + 28 | 0) >> 2] = $2_1;
   HEAP32[($1_1 + 16 | 0) >> 2] = 0;
   HEAP32[($1_1 + 20 | 0) >> 2] = 0;
   $4_1 = ($2_1 << 2 | 0) + 1468 | 0;
   label$31 : {
    label$32 : {
     label$33 : {
      label$34 : {
       $6_1 = HEAP32[(0 + 1168 | 0) >> 2] | 0;
       $3_1 = 1 << $2_1 | 0;
       if ($6_1 & $3_1 | 0) {
        break label$34
       }
       HEAP32[(0 + 1168 | 0) >> 2] = $6_1 | $3_1 | 0;
       HEAP32[$4_1 >> 2] = $1_1;
       HEAP32[($1_1 + 24 | 0) >> 2] = $4_1;
       break label$33;
      }
      $2_1 = $0_1 << (($2_1 | 0) == (31 | 0) ? 0 : 25 - ($2_1 >>> 1 | 0) | 0) | 0;
      $6_1 = HEAP32[$4_1 >> 2] | 0;
      label$35 : while (1) {
       $4_1 = $6_1;
       if (((HEAP32[($6_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
        break label$32
       }
       $6_1 = $2_1 >>> 29 | 0;
       $2_1 = $2_1 << 1 | 0;
       $3_1 = ($4_1 + ($6_1 & 4 | 0) | 0) + 16 | 0;
       $6_1 = HEAP32[$3_1 >> 2] | 0;
       if ($6_1) {
        continue label$35
       }
       break label$35;
      };
      HEAP32[$3_1 >> 2] = $1_1;
      HEAP32[($1_1 + 24 | 0) >> 2] = $4_1;
     }
     HEAP32[($1_1 + 12 | 0) >> 2] = $1_1;
     HEAP32[($1_1 + 8 | 0) >> 2] = $1_1;
     break label$31;
    }
    $0_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    HEAP32[($0_1 + 12 | 0) >> 2] = $1_1;
    HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
    HEAP32[($1_1 + 24 | 0) >> 2] = 0;
    HEAP32[($1_1 + 12 | 0) >> 2] = $4_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $0_1;
   }
   $1_1 = (HEAP32[(0 + 1196 | 0) >> 2] | 0) + -1 | 0;
   HEAP32[(0 + 1196 | 0) >> 2] = $1_1 ? $1_1 : -1;
  }
 }
 
 function $140() {
  return __wasm_memory_size() << 16 | 0 | 0;
 }
 
 function $141($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $1_1 = HEAP32[(0 + 1156 | 0) >> 2] | 0;
  $2_1 = ($0_1 + 7 | 0) & -8 | 0;
  $0_1 = $1_1 + $2_1 | 0;
  label$1 : {
   label$2 : {
    if (!$2_1) {
     break label$2
    }
    if ($0_1 >>> 0 <= $1_1 >>> 0) {
     break label$1
    }
   }
   label$3 : {
    if ($0_1 >>> 0 <= ($140() | 0) >>> 0) {
     break label$3
    }
    if (!(fimport$1($0_1 | 0) | 0)) {
     break label$1
    }
   }
   HEAP32[(0 + 1156 | 0) >> 2] = $0_1;
   return $1_1 | 0;
  }
  HEAP32[($135() | 0) >> 2] = 48;
  return -1 | 0;
 }
 
 function $142($0_1) {
  $0_1 = $0_1 | 0;
  global$1 = $0_1;
 }
 
 function $143() {
  return global$1 | 0;
 }
 
 function $144() {
  return global$0 | 0;
 }
 
 function $145($0_1) {
  $0_1 = $0_1 | 0;
  global$0 = $0_1;
 }
 
 function $146($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = (global$0 - $0_1 | 0) & -16 | 0;
  global$0 = $1_1;
  return $1_1 | 0;
 }
 
 function $147() {
  global$3 = 5244560;
  global$2 = (1672 + 15 | 0) & -16 | 0;
 }
 
 function $148() {
  return global$0 - global$2 | 0 | 0;
 }
 
 function $149() {
  return global$3 | 0;
 }
 
 function $150() {
  return global$2 | 0;
 }
 
 function $151($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $152($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $153() {
  $151(1660 | 0);
  return 1664 | 0;
 }
 
 function $154() {
  $152(1660 | 0);
 }
 
 function $155($0_1) {
  $0_1 = $0_1 | 0;
  return 1 | 0;
 }
 
 function $156($0_1) {
  $0_1 = $0_1 | 0;
 }
 
 function $157($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, i64toi32_i32$1 = 0, $2_1 = 0, i64toi32_i32$0 = 0, $3_1 = 0;
  label$1 : {
   if ($0_1) {
    break label$1
   }
   $1_1 = 0;
   label$2 : {
    if (!(HEAP32[(0 + 1668 | 0) >> 2] | 0)) {
     break label$2
    }
    $1_1 = $157(HEAP32[(0 + 1668 | 0) >> 2] | 0 | 0) | 0;
   }
   label$3 : {
    if (!(HEAP32[(0 + 1668 | 0) >> 2] | 0)) {
     break label$3
    }
    $1_1 = $157(HEAP32[(0 + 1668 | 0) >> 2] | 0 | 0) | 0 | $1_1 | 0;
   }
   label$4 : {
    $0_1 = HEAP32[($153() | 0) >> 2] | 0;
    if (!$0_1) {
     break label$4
    }
    label$5 : while (1) {
     $2_1 = 0;
     label$6 : {
      if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) < (0 | 0)) {
       break label$6
      }
      $2_1 = $155($0_1 | 0) | 0;
     }
     label$7 : {
      if ((HEAP32[($0_1 + 20 | 0) >> 2] | 0 | 0) == (HEAP32[($0_1 + 28 | 0) >> 2] | 0 | 0)) {
       break label$7
      }
      $1_1 = $157($0_1 | 0) | 0 | $1_1 | 0;
     }
     label$8 : {
      if (!$2_1) {
       break label$8
      }
      $156($0_1 | 0);
     }
     $0_1 = HEAP32[($0_1 + 56 | 0) >> 2] | 0;
     if ($0_1) {
      continue label$5
     }
     break label$5;
    };
   }
   $154();
   return $1_1 | 0;
  }
  $2_1 = 0;
  label$9 : {
   if ((HEAP32[($0_1 + 76 | 0) >> 2] | 0 | 0) < (0 | 0)) {
    break label$9
   }
   $2_1 = $155($0_1 | 0) | 0;
  }
  label$10 : {
   label$11 : {
    label$12 : {
     if ((HEAP32[($0_1 + 20 | 0) >> 2] | 0 | 0) == (HEAP32[($0_1 + 28 | 0) >> 2] | 0 | 0)) {
      break label$12
     }
     FUNCTION_TABLE[HEAP32[($0_1 + 36 | 0) >> 2] | 0 | 0]($0_1, 0, 0) | 0;
     if (HEAP32[($0_1 + 20 | 0) >> 2] | 0) {
      break label$12
     }
     $1_1 = -1;
     if ($2_1) {
      break label$11
     }
     break label$10;
    }
    label$13 : {
     $1_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
     $3_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
     if (($1_1 | 0) == ($3_1 | 0)) {
      break label$13
     }
     i64toi32_i32$1 = $1_1 - $3_1 | 0;
     i64toi32_i32$0 = i64toi32_i32$1 >> 31 | 0;
     i64toi32_i32$0 = FUNCTION_TABLE[HEAP32[($0_1 + 40 | 0) >> 2] | 0 | 0]($0_1, i64toi32_i32$1, i64toi32_i32$0, 1) | 0;
     i64toi32_i32$1 = i64toi32_i32$HIGH_BITS;
    }
    $1_1 = 0;
    HEAP32[($0_1 + 28 | 0) >> 2] = 0;
    i64toi32_i32$0 = $0_1;
    i64toi32_i32$1 = 0;
    HEAP32[($0_1 + 16 | 0) >> 2] = 0;
    HEAP32[($0_1 + 20 | 0) >> 2] = i64toi32_i32$1;
    i64toi32_i32$0 = $0_1;
    i64toi32_i32$1 = 0;
    HEAP32[($0_1 + 4 | 0) >> 2] = 0;
    HEAP32[($0_1 + 8 | 0) >> 2] = i64toi32_i32$1;
    if (!$2_1) {
     break label$10
    }
   }
   $156($0_1 | 0);
  }
  return $1_1 | 0;
 }
 
 function __wasm_rotl_i32(var$0, var$1) {
  var$0 = var$0 | 0;
  var$1 = var$1 | 0;
  var var$2 = 0;
  var$2 = var$1 & 31 | 0;
  var$1 = (0 - var$1 | 0) & 31 | 0;
  return ((-1 >>> var$2 | 0) & var$0 | 0) << var$2 | 0 | (((-1 << var$1 | 0) & var$0 | 0) >>> var$1 | 0) | 0 | 0;
 }
 
 // EMSCRIPTEN_END_FUNCS
;
 bufferView = HEAPU8;
 initActiveSegments(env);
 var FUNCTION_TABLE = Table([null, $20, $139]);
 function __wasm_memory_size() {
  return buffer.byteLength / 65536 | 0;
 }
 
 return {
  "__wasm_call_ctors": $0, 
  "free": $139, 
  "malloc": $138, 
  "__indirect_function_table": FUNCTION_TABLE, 
  "__main_argc_argv": $70, 
  "__errno_location": $135, 
  "fflush": $157, 
  "setTempRet0": $142, 
  "getTempRet0": $143, 
  "emscripten_stack_init": $147, 
  "emscripten_stack_get_free": $148, 
  "emscripten_stack_get_base": $149, 
  "emscripten_stack_get_end": $150, 
  "stackSave": $144, 
  "stackRestore": $145, 
  "stackAlloc": $146
 };
}

  return asmFunc(asmLibraryArg);
}

)(asmLibraryArg);
  },

  instantiate: /** @suppress{checkTypes} */ function(binary, info) {
    return {
      then: function(ok) {
        var module = new WebAssembly.Module(binary);
        ok({
          'instance': new WebAssembly.Instance(module)
        });
        // Emulate a simple WebAssembly.instantiate(..).then(()=>{}).catch(()=>{}) syntax.
        return { catch: function() {} };
      }
    };
  },

  RuntimeError: Error
};

// We don't need to actually download a wasm binary, mark it as present but empty.
wasmBinary = [];

// end include: wasm2js.js
if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.
/**
 * heapOrArray is either a regular array, or a JavaScript typed array view.
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = '';
  // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte 0x' + u0.toString(16) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }

    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u > 0x10FFFF) warnOnce('Invalid Unicode code point 0x' + u.toString(16) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var c = str.charCodeAt(i); // possibly a lead surrogate
    if (c <= 0x7F) {
      len++;
    } else if (c <= 0x7FF) {
      len += 2;
    } else if (c >= 0xD800 && c <= 0xDFFF) {
      len += 4; ++i;
    } else {
      len += 3;
    }
  }
  return len;
}

// end include: runtime_strings.js
// Memory management

var HEAP,
/** @type {!ArrayBuffer} */
  buffer,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;
if (Module['TOTAL_STACK']) assert(TOTAL_STACK === Module['TOTAL_STACK'], 'the stack size can no longer be determined at runtime')

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;legacyModuleProp('INITIAL_MEMORY', 'INITIAL_MEMORY');

assert(INITIAL_MEMORY >= TOTAL_STACK, 'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' + INITIAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js


// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536,
      'maximum': INITIAL_MEMORY / 65536
    });
  }

if (wasmMemory) {
  buffer = wasmMemory.buffer;
}

// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['INITIAL_MEMORY'].
INITIAL_MEMORY = buffer.byteLength;
assert(INITIAL_MEMORY % 65536 === 0);
updateGlobalBufferAndViews(buffer);

// end include: runtime_init_memory.js

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x2135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[0] = 0x63736d65; /* 'emsc' */
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x2135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten at 0x' + max.toString(16) + ', expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' + cookie2.toString(16) + ' 0x' + cookie1.toString(16));
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[0] !== 0x63736d65 /* 'emsc' */) abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
}

// end include: runtime_stack_check.js
// include: runtime_assertions.js


// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function keepRuntimeAlive() {
  return noExitRuntime;
}

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// show errors on likely calls to FS when it was not included
var FS = {
  error: function() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
  },
  init: function() { FS.error() },
  createDataFile: function() { FS.error() },
  createPreloadedFile: function() { FS.error() },
  createLazyFile: function() { FS.error() },
  open: function() { FS.error() },
  mkdev: function() { FS.error() },
  registerDevice: function() { FS.error() },
  analyzePath: function() { FS.error() },
  loadFilesFromDB: function() { FS.error() },

  ErrnoError: function ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

// include: URIUtils.js


// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
/** @param {boolean=} fixedasm */
function createExportWrapper(name, fixedasm) {
  return function() {
    var displayName = name;
    var asm = fixedasm;
    if (!fixedasm) {
      asm = Module['asm'];
    }
    assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
    if (!asm[name]) {
      assert(asm[name], 'exported native function `' + displayName + '` not found');
    }
    return asm[name].apply(null, arguments);
  };
}

var wasmBinaryFile;
  wasmBinaryFile = 'push_swap.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw "both async and sync fetching of the wasm failed";
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmTable = Module['asm']['__indirect_function_table'];
    assert(wasmTable, "table not found in wasm exports");

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');

  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(function (instance) {
      return instance;
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      // Warn on some common problems.
      if (isFileURI(wasmBinaryFile)) {
        err('warning: Loading from a file URI (' + wasmBinaryFile + ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing');
      }
      abort(reason);
    });
  }

  function instantiateAsync() {
    if (!wasmBinary &&
        typeof WebAssembly.instantiateStreaming == 'function' &&
        !isDataURI(wasmBinaryFile) &&
        typeof fetch == 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        // Suppress closure warning here since the upstream definition for
        // instantiateStreaming only allows Promise<Repsponse> rather than
        // an actual Response.
        // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
        /** @suppress {checkTypes} */
        var result = WebAssembly.instantiateStreaming(response, info);

        return result.then(
          receiveInstantiationResult,
          function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  // Also pthreads and wasm workers initialize the wasm instance through this path.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync().catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  
};






  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }

  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    }

  function withStackSave(f) {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    }
  function demangle(func) {
      warnOnce('warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling');
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1': return HEAP8[((ptr)>>0)];
        case 'i8': return HEAP8[((ptr)>>0)];
        case 'i16': return HEAP16[((ptr)>>1)];
        case 'i32': return HEAP32[((ptr)>>2)];
        case 'i64': return HEAP32[((ptr)>>2)];
        case 'float': return HEAPF32[((ptr)>>2)];
        case 'double': return HEAPF64[((ptr)>>3)];
        case '*': return HEAPU32[((ptr)>>2)];
        default: abort('invalid type for getValue: ' + type);
      }
      return null;
    }

  function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    }

  function intArrayToString(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      var chr = array[i];
      if (chr > 0xFF) {
        if (ASSERTIONS) {
          assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
        }
        chr &= 0xFF;
      }
      ret.push(String.fromCharCode(chr));
    }
    return ret.join('');
  }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only
        // populated if an Error object is thrown, so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1': HEAP8[((ptr)>>0)] = value; break;
        case 'i8': HEAP8[((ptr)>>0)] = value; break;
        case 'i16': HEAP16[((ptr)>>1)] = value; break;
        case 'i32': HEAP32[((ptr)>>2)] = value; break;
        case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
        case 'float': HEAPF32[((ptr)>>2)] = value; break;
        case 'double': HEAPF64[((ptr)>>3)] = value; break;
        case '*': HEAPU32[((ptr)>>2)] = value; break;
        default: abort('invalid type for setValue: ' + type);
      }
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }

  function writeArrayToMemory(array, buffer) {
      assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
      HEAP8.set(array, buffer);
    }

  function getHeapMax() {
      return HEAPU8.length;
    }
  
  function abortOnCannotGrowMemory(requestedSize) {
      abort('Cannot enlarge memory arrays to size ' + requestedSize + ' bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ' + HEAP8.length + ', (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0');
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      abortOnCannotGrowMemory(requestedSize);
    }

  var printCharBuffers = [null,[],[]];
  function printChar(stream, curr) {
      var buffer = printCharBuffers[stream];
      assert(buffer);
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    }
  function flush_NO_FILESYSTEM() {
      // flush anything remaining in the buffers during shutdown
      _fflush(0);
      if (printCharBuffers[1].length) printChar(1, 10);
      if (printCharBuffers[2].length) printChar(2, 10);
    }
  
  var SYSCALLS = {varargs:undefined,get:function() {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      }};
  function _fd_write(fd, iov, iovcnt, pnum) {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr+j]);
        }
        num += len;
      }
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    }

  function _proc_exit(code) {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module['onExit']) Module['onExit'](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }
  /** @param {boolean|number=} implicit */
  function exitJS(status, implicit) {
      EXITSTATUS = status;
  
      checkUnflushedContent();
  
      // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
      if (keepRuntimeAlive() && !implicit) {
        var msg = 'program exited (with status: ' + status + '), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)';
        readyPromiseReject(msg);
        err(msg);
      }
  
      _proc_exit(status);
    }

  function allocateUTF8OnStack(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }

  function getCFunc(ident) {
      var func = Module['_' + ident]; // closure exported function
      assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
      return func;
    }
  
  
    /**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
  function ccall(ident, returnType, argTypes, args, opts) {
      // For fast lookup of conversion functions
      var toC = {
        'string': (str) => {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) { // null string
            // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
            var len = (str.length << 2) + 1;
            ret = stackAlloc(len);
            stringToUTF8(str, ret, len);
          }
          return ret;
        },
        'array': (arr) => {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        }
      };
  
      function convertReturnValue(ret) {
        if (returnType === 'string') {
          
          return UTF8ToString(ret);
        }
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }
  
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      assert(returnType !== 'array', 'Return type should not be "array".');
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      function onDone(ret) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
  
      ret = onDone(ret);
      return ret;
    }
  
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
  function cwrap(ident, returnType, argTypes, opts) {
      return function() {
        return ccall(ident, returnType, argTypes, arguments, opts);
      }
    }


var ASSERTIONS = true;

// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob == 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var asmLibraryArg = {
  "emscripten_resize_heap": _emscripten_resize_heap,
  "fd_write": _fd_write,
  "memory": wasmMemory
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");

/** @type {function(...*):?} */
var _free = Module["_free"] = createExportWrapper("free");

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = createExportWrapper("malloc");

/** @type {function(...*):?} */
var _main = Module["_main"] = createExportWrapper("__main_argc_argv");

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");

/** @type {function(...*):?} */
var _fflush = Module["_fflush"] = createExportWrapper("fflush");

/** @type {function(...*):?} */
var setTempRet0 = Module["setTempRet0"] = createExportWrapper("setTempRet0");

/** @type {function(...*):?} */
var getTempRet0 = Module["getTempRet0"] = createExportWrapper("getTempRet0");

/** @type {function(...*):?} */
var _emscripten_stack_init = Module["_emscripten_stack_init"] = function() {
  return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = function() {
  return (_emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = function() {
  return (_emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = Module["asm"]["emscripten_stack_get_base"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
  return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = createExportWrapper("stackSave");

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");





// === Auto-generated postamble setup entry stuff ===

Module["stringToUTF8"] = stringToUTF8;
Module["lengthBytesUTF8"] = lengthBytesUTF8;
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
Module["setValue"] = setValue;
var unexportedRuntimeSymbols = [
  'run',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addOnPostRun',
  'addRunDependency',
  'removeRunDependency',
  'FS_createFolder',
  'FS_createPath',
  'FS_createDataFile',
  'FS_createPreloadedFile',
  'FS_createLazyFile',
  'FS_createLink',
  'FS_createDevice',
  'FS_unlink',
  'getLEB',
  'getFunctionTables',
  'alignFunctionTables',
  'registerFunctions',
  'prettyPrint',
  'getCompilerSetting',
  'print',
  'printErr',
  'callMain',
  'abort',
  'keepRuntimeAlive',
  'wasmMemory',
  'stackAlloc',
  'stackSave',
  'stackRestore',
  'getTempRet0',
  'setTempRet0',
  'writeStackCookie',
  'checkStackCookie',
  'intArrayFromBase64',
  'tryParseAsDataURI',
  'ptrToString',
  'zeroMemory',
  'stringToNewUTF8',
  'exitJS',
  'getHeapMax',
  'abortOnCannotGrowMemory',
  'emscripten_realloc_buffer',
  'ENV',
  'ERRNO_CODES',
  'ERRNO_MESSAGES',
  'setErrNo',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'DNS',
  'getHostByName',
  'Protocols',
  'Sockets',
  'getRandomDevice',
  'warnOnce',
  'traverseStack',
  'UNWIND_CACHE',
  'convertPCtoSourceLocation',
  'readAsmConstArgsArray',
  'readAsmConstArgs',
  'mainThreadEM_ASM',
  'jstoi_q',
  'jstoi_s',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'handleException',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'safeSetTimeout',
  'asmjsMangle',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertI32PairToI53Checked',
  'convertU32PairToI53',
  'getCFunc',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'freeTableIndexes',
  'functionsInTableMap',
  'getEmptyTableSlot',
  'updateTableMap',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'getValue',
  'PATH',
  'PATH_FS',
  'intArrayFromString',
  'intArrayToString',
  'AsciiToString',
  'stringToAscii',
  'UTF16Decoder',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'writeStringToMemory',
  'writeArrayToMemory',
  'writeAsciiToMemory',
  'SYSCALLS',
  'getSocketFromFD',
  'getSocketAddress',
  'JSEvents',
  'registerKeyEventCallback',
  'specialHTMLTargets',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'demangle',
  'demangleAll',
  'jsStackTrace',
  'stackTrace',
  'ExitStatus',
  'getEnvStrings',
  'checkWasiClock',
  'flush_NO_FILESYSTEM',
  'dlopenMissingError',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'ExceptionInfo',
  'exception_addRef',
  'exception_decRef',
  'Browser',
  'setMainLoop',
  'wget',
  'FS',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  '_setNetworkCallback',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'GL',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  'writeGLArray',
  'AL',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'SDL',
  'SDL_gfx',
  'GLUT',
  'EGL',
  'GLFW_Window',
  'GLFW',
  'GLEW',
  'IDBStore',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
];
unexportedRuntimeSymbols.forEach(unexportedRuntimeSymbol);
var missingLibrarySymbols = [
  'ptrToString',
  'zeroMemory',
  'stringToNewUTF8',
  'emscripten_realloc_buffer',
  'setErrNo',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'getHostByName',
  'getRandomDevice',
  'traverseStack',
  'convertPCtoSourceLocation',
  'readAsmConstArgs',
  'mainThreadEM_ASM',
  'jstoi_q',
  'jstoi_s',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'safeSetTimeout',
  'asmjsMangle',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertI32PairToI53Checked',
  'convertU32PairToI53',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'intArrayFromString',
  'AsciiToString',
  'stringToAscii',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'allocateUTF8',
  'writeStringToMemory',
  'writeAsciiToMemory',
  'getSocketFromFD',
  'getSocketAddress',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'getEnvStrings',
  'checkWasiClock',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'ExceptionInfo',
  'exception_addRef',
  'exception_decRef',
  'setMainLoop',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  'writeGLArray',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'GLFW_Window',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)


var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  var entryFunction = Module['_main'];

  args = args || [];
  args.unshift(thisProgram);

  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv >> 2;
  args.forEach((arg) => {
    HEAP32[argv_ptr++] = allocateUTF8OnStack(arg);
  });
  HEAP32[argv_ptr] = 0;

  try {

    var ret = entryFunction(argc, argv);

    // In PROXY_TO_PTHREAD builds, we should never exit the runtime below, as
    // execution is asynchronously handed off to a pthread.
    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  }
  catch (e) {
    return handleException(e);
  }
}

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

    stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (shouldRunNow) callMain(args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    flush_NO_FILESYSTEM();
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
    warnOnce('(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module['noInitialRun']) shouldRunNow = false;

run();







  return Module.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return Module; });
else if (typeof exports === 'object')
  exports["Module"] = Module;
