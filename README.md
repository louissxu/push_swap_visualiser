# Push Swap Visualiser

A learning aid and visualiser for push_swap - a 42 school algorithm design project.

**Hosted at - https://louissxu.github.io/push_swap_visualiser/**

## Demo

Select "Solution - @louissxu" for a embedded solution to view the functioning of the visualiser for a demo of this react project. However, if you are a current 42 student I would strongly suggest not viewing this solution before trying to design and optimise your own solution. A large part of the value of this project is the reasoning and solving the puzzle yourself.

## Quick Start

Download the python linker (./linker/linker.py). The easiest is to put it in the same directory as your push_swap executable. However it will run from any directory.

In terminal, change directory to the folder containing the linker.py file.

```bash
cd path/to/directory
```

Run the linker with python with argument containing path to push_swap executable. This path can be relative or absolute.

```bash
python3 linker.py <path_to_executable>
```

Eg.
```bash
cd /home/username/Desktop/push_swap_folder/
python3 linker.py push_swap
# Or for an absolute path, the path should be prefixed with /
# python3 linker.py /home/username/Desktop/push_swap_folder/push_swap
```

Leave this terminal open with the local webserver running. This is what allows the visualiser website to call your solution.

You should now be able to call your push_swap implementation from the hosted [github pages site](https://louissxu.github.io/push_swap_visualiser/) and visualise the solution that your program generates.
___

## Introduction

Push_swap is a 42 School algorithm design project. This is a custom visualiser to facilitate students in completing that project.

Push_swap itself challenges students to solve a basic sorting problem (sorting an unsorted list). However, to make it less of a exercise in rote learning of known efficient algorithms, students are given a set of constraints and an unusal instruction set. Using this limited instruction set, students are challenged to figure out an algorithm that allows for sufficiently efficient sorting of an unsorted list - with as few instructions used as possible.

The instruction set design and grading cut-offs are set such that a naive implementation of a standard $O(n log(n))$ sorting algorithms such as Quick Sort or Heap Sort are not possible or too slow.

Crucially, the constraints limit available "memory" to two stacks and the instructions do not allow for operations at arbitrary locations/indexes. Instead the index of interest must be "rotated" to the top of effectively a circularly linked list to be accessed.

This challenge can therefore be broken down into two main components.
1. Creating a program in C that runs sufficiently fast generate a list of instructions in a reasonable amount of time. Eg a brute force BFS search of the instruction set would produce a technically optimal answer with the lowest number of instructions required to sort a given unsorted list. But this fast becomes impractical for lists larger than a few members. A more efficient solution must be found.

2. The algorithm used must be designed to generate a list of instructions sufficiently short to meet fairly harsh "move" limits. For example for a list of 500 elements. This must be sorted with a target of <5500 moves:
$$\approx 1.2 \times n log_2(n))$$

For some students, the second part of this problem can be somewhat tricky. Figuring out how to optimise their algorithm in a vacuum can be difficult. Especially, when working in pure C, it can be hard to "see" how their algorithm is working and what inefficiencies are occuring that can be optimised out. This visualiser facilitates this as inefficiencies can be "seen" and the effects of your optimisations can be viewed.

## Requirements

```bash
python3
```
An intentional design constraint was to limit the user side requirements. In practice this means that the program requires only Python 3 and is limited to only the standard library. There is no requirement for any non default modules or other software to be installed on your computer. Additionally, there is no setup or user side modification of their C program have it interface with this visualiser.

Depending on the setup of your school, certain utilities like cmake may not be available. And often certain non-default modules may not be available. Aditionally, at the learning stage of this project, it may be beyond the capabilities of the students to say, compile their package to a different target (eg to ask them to compile it to Wasm). However, all school macs should have *some* recent version of Python 3 with it's accompanying standard library installed by default. Then the user side involvement is limited to downloading and running a python3 script; then using a website with a provided visual interface.

A further advantage of this is that it minimises the user-side setup as much as possible to simplify it's use.

## Discussion/ToDo

## Design

### Website Visualiser

The visualiser is designed as a React framework single page app. It is able to generate random data, run the selected program to get the moves to sort the data, then it is able to playback this visually. It provides playback controls to control playback speed and allow scrubbing through the timeline.

### Python Linker

The visualiser is designed to allow users to run their own C code solutions (or solutions in progress) so they can view the output. However, running native C code from a web browser is non trivial. For good reason, a web browser is not able to arbitrarily access and run a local C executable via shell or similar. Nor can the executable be natively run from within the web browser session unless it is specifically compiled to this target (ie using Web Assembly). Web assembly is a good solution for demo code (and is how I have added my own solution - see below), however it is likely an unreasonable barrier for users to compile to a different target to allow it to be run by the visualiser.

The solution was to use a small python middleware script. Python has the ability to execute local C code. The solution was to write a python program that when run would open a local host http server. A request sent to this server would trigger the program to be run (with arguments encoded as part of the get string) and the results would be returned as the http response with the header containing the relavent data.

This allows the visualiser to call the user's C program via this linker and allow user solutions to be utilised and presented.

### WebAssembly solutions

The solutions to this problem are typically coded in C. A design goal was to be able to add my solution (and potentially demo solutions from others) for people to be able to view. These were added through the addition of WebAssembly. The solution was compiled using emscripten to a module that could be called by the JavaScript program. This would allow a full working solution to be encapsulated within the website as a demo in case people wanted to view a solution without compiling their own C code and running the linker.

Emscripten is designed as a drop-in replacement for gcc. For this use case, some modification of the user Makefiles is required to make it compile the C project to a useable module with encapsulated Wasm.

**Compile libft into a library that is compatible with emscripten**

```bash
# Create objects
emcc $(CFLAGS) -I $(INCLUDES) -c $< -o $@
# Package objects into library
emar rcs libft $(OBJS)
```

**Compile push_swap into Wasm module**
```bash
emcc
  # Standard args as used with GCC
  $(CFLAGS)
  -I $(INCLUDES)
  -I $(LIBFT_INCLUDES)
  -L libft
  $(OBJS)
  $(OBJS_PUSH_SWAP)
  -lft
  # Emscripten setting to add prepended js to module. Pipes stdout/stderr to object property
  -pre-js preJs.js 
  # Emscripten args added to compile correctly
  -s WASM=0
  -s ENVIRONMENT=web
  -s MODULARIZE=1
  -s EXPORTED_FUNCTIONS=_main,_malloc,_free
  -s EXPORTED_RUNTIME_METHODS=cwrap,ccall,stringToUTF8,lengthBytesUTF8,setValue
  # Output file name
  -o $@.js
```

### GH pages

Deployed to github with github pages. Ref: https://github.com/gitname/react-gh-pages
