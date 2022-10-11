# Push Swap Visualiser

A learning aid and visualiser for push_swap - a 42 school algorithm design project.

**Hosted at - https://louissxu.github.io/push_swap_visualiser/**

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
# That's it!
```
An intentional design constraint was to use only Python and limit this to only the standard library. There is no requirement for any non default modules or other software to be installed on your computer.

Depending on the setup of your school, certain utilities like cmake may not be available. And often certain non-default modules may not be available. However, all school macs should have *some* version of python3 with it's accompanying standard library installed by default.

A further advantage of this is that it minimises the user-side setup as much as possible to simplify it's use.

## Discussion/ToDo

## Design

### Website Visualiser

The visualiser is designed as a React framework single page app. It is able to generate random data, run the selected program to get the moves to sort the data, then it is able to playback this visually. It provides playback controls to control playback speed and allow scrubbing through the timeline.

Discuss the visualiser.

### Python Linker

Discuss workings of Python linker and design choices made.

### WASM solutions

Discuss implementation of WASM embedding of C code solutions. Add method. Add how to add PR if people want to add other good solutions.


### GH pages

Add discussion about hosting on GH pages
