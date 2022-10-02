# Push Swap Visualiser

A visualiser for push_swap. A 42 school algorithm design project.

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

Leave the terminal running with the local webserver running. This is what allows the visualiser website to call your solution.

You should now be able to call your push_swap implementation from INSERT LINK and visualise the solution that your program generates.
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

## Design

### Website Visualiser

### Python Linker

### WASM solutions


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
