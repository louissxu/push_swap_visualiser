import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import "./Visualiser.css";
import { VariableSizeList as List} from "react-window";
import { Move, stringToMove } from "./Utilities"
import { getMovesSolutionLouis } from "./WasmWrapper";


import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Box, Button, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, TextField, Grid, Input, TextareaAutosize, FormControl, IconButton, ToggleButtonGroup, ToggleButton} from '@mui/material';
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import NextFrameIcon from "@mui/icons-material/NotStarted";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";


interface IBarProps {
  value: number,
  key: number,
  min_value: number,
  max_value: number,
  num_values: number,
  available_width: number,
  available_height: number,
}

class Bar extends React.PureComponent<IBarProps> {
  constructor(props: IBarProps) {
    super(props)
    this.state = {
    }
  }
  render() {
    const barValue: number = this.props.value - this.props.min_value + 1;
    const width: number = (barValue) * this.props.available_width / (this.props.max_value - this.props.min_value);
    const height: number = Math.max(0, Math.min(50, this.props.available_height / this.props.num_values));
    const hue: number = 240 - (240 / Math.max(1, ((this.props.max_value - this.props.min_value) - 1))* barValue);
    let text: string | null = this.props.value.toString();
    if (height < 10) {
      text = null;
    }
    return (
      <li 
        className="bar"
        style={{
          "width": width,
          "height": height,
          "backgroundColor": "hsl("+ hue.toString() +", 50%, 50%)",
        }}
      >
        {text == null ? "" : text}
      </li>
    )
  }
}

interface IStackProps {
  values: Array<number>,
  min_value: number,
  max_value: number,
  num_values: number,
  title: string,
}

const Stack = (props: IStackProps) => {
  const [stackSize, setStackSize] = useState({width: 0, height: 0});
  const targetRef = useRef<HTMLDivElement>(null);
  
  const handleResize = () => {
    if (targetRef.current) {
      setStackSize({width: targetRef.current.clientWidth, height: targetRef.current.clientHeight});
    }
  }
  
  useEffect(() => {
    if (targetRef.current) {
      setStackSize({width: targetRef.current.clientWidth, height: targetRef.current.clientHeight});
    }
  }, []);

  useEffect (() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    }
  })
    
  const renderBar = (val: number, key: number, min_value: number, max_value: number, num_values: number, stack_width: number, stack_height: number) => {
    return (
      <Bar
        value={val}
        key={key}
        min_value={min_value}
        max_value={max_value}
        num_values={num_values}
        available_width={stack_width - 10}
        available_height={stack_height - 10}
      />
    );
  }

  const values: Array<number> = props.values;

  return (
    <div className="stack-container">
      <h3 className="stack-title">{props.title}</h3>
      <div className="stack-subcontainer" ref={targetRef}>
        <ul className="stack-content">
          {values.map((elem) => renderBar(elem, elem, props.min_value, props.max_value, props.num_values, stackSize.width, stackSize.height))}
        </ul>
      </div>
    </div>
  );
}

interface IMovesRowProps {
  move: Move
  is_current: boolean
  move_number: number
}

interface IMovesRowState {

}

class MovesRow extends React.PureComponent<IMovesRowProps, IMovesRowState> {
  constructor(props: IMovesRowProps) {
    super(props)
    this.state = {

    }
  }
  render() {
    if (this.props.move === Move.Start){
      if (this.props.is_current) {
        return (
          <li className="moves-current-move">
            {this.props.move}
          </li>
        )
      } else {
        return (
          <li>
            {this.props.move}
          </li>
        )
      }
    } else {
      if (this.props.is_current) {
        return (
          <li className="moves-current-move">
            {this.props.move_number - 1} - {this.props.move}
          </li>
        )
      } else {
        return (
          <li>
            {this.props.move_number - 1} - {this.props.move}
          </li>
        )
      }
    }
  }
}

interface IMovesProps {
  moves: Array<Move>,
  current_move_num: number,
  jumpToMoveNumber: (moveNumber: number) => void,
}

const Moves = (props: IMovesProps) => {
  const listRef = useRef<List>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [listContainerHeight, setListContainerHeight] = useState(0);
  
  // const scrollElementIndex = Math.max(0, props.current_move_num - 5);
  const scrollElementIndex = props.current_move_num;
  const executeScroll = () => {
    if (listRef.current) {
      listRef.current.scrollToItem(scrollElementIndex, "smart");
    }
  }
  
  useEffect(() => {
    executeScroll();
  })
  
  const handleResize = () => {
    if (listContainerRef.current) {
      setListContainerHeight(listContainerRef.current.offsetHeight);
    }
  }
  
  useEffect(() => {
    handleResize()
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    }
  })

  const NewMovesRow = ({index, style}: {index: number, style: CSSProperties}) => {
    if (index < props.moves.length && index >= 0){
      return (
        <div
          style={style}
          onClick={props.jumpToMoveNumber.bind(this, index)}
        >
          <MovesRow
            move={props.moves[index]}
            move_number={index}
            is_current={index === props.current_move_num ? true : false}
          />
        </div>
      )
    } else {
      return (
        <div
          style={style}
        />
      )
    }
  }

  const getItemSize = (index: number) => {
    // if (index === props.moves.length - 1) {
    //   return 100;
    // }
    return 20;
  }

  return (
    <div className="moves-container">
      <h3>Moves</h3>
      <h5>Number of Moves: {Math.max(0, props.moves.length - 1)}</h5> 
      <h5>Current Move Number: {props.current_move_num}</h5>
      <div
        className="moves-subcontainer"
        ref={listContainerRef}
      >
        <List
          className="moves-content"
          height={listContainerHeight}
          width={100}
          itemCount={props.moves.length}
          itemSize={getItemSize}
          ref={listRef}
        >
          {NewMovesRow}
          {/* <div style={{height: "150px"}}></div> */}
        </List>
      </div>
    </div>
  )
}

interface IMenuInputArgsReversedProps {
  numberOfElementsStartingValue: number,
  updateInputArgs: (parseError: string, newArr: Array<number>) => void,
}

interface IMenuInputArgsReversedState {
  numberOfElementsString: string,
}

class MenuInputArgsReversed extends React.Component<IMenuInputArgsReversedProps, IMenuInputArgsReversedState> {
  constructor(props: IMenuInputArgsReversedProps) {
    super(props);
    this.state = {
      numberOfElementsString: props.numberOfElementsStartingValue.toString(),
      // numberOfElementsString: "50"
    }
  }

  handleNumberOfElementsStringChange(event: React.ChangeEvent<HTMLInputElement>) {
    // console.log(event.currentTarget.value);
    this.setState({
      numberOfElementsString: event.target.value,
    })
  }

  handleNumberOfElementsSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    const parsedValue = parseInt(this.state.numberOfElementsString)
    if (Number.isNaN(parsedValue)) {
      this.props.updateInputArgs("<Error: n is not a number>", [] as Array<number>)
    } else if (parsedValue < 0) {
      this.props.updateInputArgs("<Error: n is negative>", [] as Array<number>)
    } else {
      // const newArr = this.generateShuffledArgs(parsedValue)
      const newArr = Array.from(Array(parsedValue).keys()).reverse();
      this.props.updateInputArgs("", newArr)
    }
  }

  render() {
    return (
      <div>
        <Box
          sx={{
            backgroundColor: "grey.300",
            mb: 2,
            p: 1,
          }}
        >
          <b>Reversed</b><br/>
          Generates a list of n numbers in reversed order.
        </Box>
        <TextField
          sx={{mb: 2}}
          id="number-of-elements-input-field"
          label="Number of elements (n)"
          value={this.state.numberOfElementsString}
          onChange={this.handleNumberOfElementsStringChange.bind(this)}
          fullWidth
        />
        <Button
          sx={{mb: 2}}
          variant="contained"
          onClick={this.handleNumberOfElementsSubmit.bind(this)}
          fullWidth
        >
          Generate new stack
        </Button>
      </div>
    )

  }
}

interface IMenuInputArgsMostlySortedProps {
  numberOfElementsStartingValue: number,
  updateInputArgs: (parseError: string, newArr: Array<number>) => void,
}

interface IMenuInputArgsMostlySortedState {
  numberOfElementsString: string,
  proportionShuffled: number,
  shuffleDistance: number,
}

class MenuInputArgsMostlySorted extends React.Component<IMenuInputArgsMostlySortedProps, IMenuInputArgsMostlySortedState> {
  constructor (props: IMenuInputArgsMostlySortedProps) {
    super(props);
    this.state = {
      // numberOfElementsString: "50",
      numberOfElementsString: props.numberOfElementsStartingValue.toString(),
      proportionShuffled: 0.5,
      shuffleDistance: 0.1,
    }
  }

  handleNumberOfElementsStringChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    this.setState({
      numberOfElementsString: event.currentTarget.value,
    })
  }

  handleProportionShuffledSliderChange(_event: Event, value: number | number[]) {
    if (Array.isArray(value)) {
      this.setState({
        proportionShuffled: value[0],
      })
    } else {
      this.setState({
        proportionShuffled: value,
      })
    }
  }

  handleProportionShuffledInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      proportionShuffled: Number(event.target.value)
    })
  }

  handleProportionShuffledInputBlur() {
    // Use blur to initiate range check and set to within range if out of range
    if (this.state.proportionShuffled < 0) {
      this.setState({
        proportionShuffled: 0
      })
    }
    if (this.state.proportionShuffled > 1) {
      this.setState({
        proportionShuffled: 1
      })
    }
  }

  handleShuffleDistanceSliderChange(_event: Event, value: number | number[]) {
    if (Array.isArray(value)) {
      this.setState({
        shuffleDistance: value[0],
      })
    } else {
      this.setState({
        shuffleDistance: value,
      })
    }
  }

  handleShuffleDistanceInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      shuffleDistance: Number(event.target.value)
    })
  }

  handleShuffleDistanceInputBlur() {
    // Use blur to initiate range check and set to within range if out of range
    if (this.state.shuffleDistance < 0) {
      this.setState({
        shuffleDistance: 0
      })
    }
    if (this.state.shuffleDistance > 1) {
      this.setState({
        shuffleDistance: 1
      })
    }
  }

  handleShuffleDistanceChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({
      shuffleDistance: (parseInt(event.currentTarget.value) / 100),
    })
  }


  moveElementInArray<T>(arr: Array<T>, from: number, to: number): Array<T> {
    if (from < 0 ||
      to < 0 ||
      from > arr.length ||
      to > arr.length ||
      Number.isInteger(from) === false ||
      Number.isInteger(to) === false) {
        throw new RangeError("Index invalid"); 
    }
    if (from < to) {
      return (([] as Array<T>).concat(
        arr.slice(0, from),
        arr.slice(from + 1, to),
        arr.slice(from, from + 1),
        arr.slice(to),
      ))
    }
    if (to < from) {
      return (([] as Array<T>).concat(
        arr.slice(0, to),
        arr.slice(from, from + 1),
        arr.slice(to, from),
        arr.slice(from + 1),
        ))
      }
    // from === to
    return arr;
  }

  generatePartiallyShuffledArgs(numberOfElements: number, proportionShuffled: number, shuffleDistance: number): Array<number> {
    // const newArr = Array.from(Array(numberOfElements).keys());
    const numberOfShuffles = Math.ceil(numberOfElements * proportionShuffled);
    const indexOfShuffles = [...new Array(numberOfShuffles)].map(() => {
      const from = Math.floor(Math.random() * numberOfElements);
      const toMin = Math.max(0, from - Math.ceil(shuffleDistance * numberOfElements / 2));
      const toMax = Math.min(numberOfElements - 1, from + Math.ceil(shuffleDistance * numberOfElements / 2));
      const to = toMin + Math.floor(Math.random() * (toMax - toMin))
      return {from: from, to: to};
    });
    const newArr = indexOfShuffles.reduce((arr, swap) => {
      return this.moveElementInArray(arr, swap.from, swap.to)
    }, Array.from(Array(numberOfElements).keys()));

    return newArr;
  }

  handleGenerateListSubmit() {
    const parsedValue = parseInt(this.state.numberOfElementsString);
    if (Number.isNaN(parsedValue)) {
      this.props.updateInputArgs("<Error: n is not a number>", [] as Array<number>);
    } else if (parsedValue < 0) {
      this.props.updateInputArgs("<Error: n is negative>", [] as Array<number>);
    } else {
      const newArr = this.generatePartiallyShuffledArgs(parsedValue, this.state.proportionShuffled, this.state.shuffleDistance);
      console.log(newArr);
      this.props.updateInputArgs("", newArr);
    }
  }

  render() {
    return (
      <div>
        <Box
          sx={{
            backgroundColor: "grey.300",
            mb: 2,
            p: 1,
          }}
        >
          <b>Mostly Sorted</b><br/>
          Generates a mostly sorted list of n numbers.
          <br/><br/>
          An initially sorted list has a proportion of entries (p) chosen and inserted in a position a limited distance (d) away.
          <br/><br/>
          Edge behaviour is truncation. Does lead to poorly sorted lists if a high value for p is chosen (p does not corelate well with number of inversions).
        </Box>
        <TextField
          sx={{mb: 2}}
          id="number-of-elements-input-field"
          label="Number of elements (n)"
          value={this.state.numberOfElementsString}
          onChange={this.handleNumberOfElementsStringChange.bind(this)}
          fullWidth
        />
        <Typography id="proportion-of-elements-shuffled-label" gutterBottom>
          Proportion shuffled (p)
        </Typography>
        <Box sx={{width: "100%", mb: 2}}>
          <Grid container spacing={2} alignItems="center" sx={{p: 1}}>
            <Grid item xs>
              <Slider
                id="proportion-of-elements-shuffled"
                value={this.state.proportionShuffled}
                min={0}
                max={1}
                step={0.01}
                onChange={this.handleProportionShuffledSliderChange.bind(this)}
              />
            </Grid>
            <Grid item xs={3}>
              <Input
                value={this.state.proportionShuffled}
                size="small"
                onChange={this.handleProportionShuffledInputChange.bind(this)}
                onBlur={this.handleProportionShuffledInputBlur.bind(this)}
                inputProps={{
                  step: 0.1,
                  min: 0,
                  max: 1,
                  type: "number",
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Typography id="distance-to-move-label" gutterBottom>
          Maximum relative shuffle distance (d)
        </Typography>
        <Box sx={{width: "100%", mb: 2}}>
          <Grid container spacing={2} alignItems="center" sx={{p: 1}}>
            <Grid item xs>
              <Slider
                  id="distance-to-move"
                  value={this.state.shuffleDistance}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={this.handleShuffleDistanceSliderChange.bind(this)}
                />
            </Grid>
            <Grid item xs={3}>
              <Input
                  value={this.state.shuffleDistance}
                  size="small"
                  onChange={this.handleShuffleDistanceInputChange.bind(this)}
                  onBlur={this.handleShuffleDistanceInputBlur.bind(this)}
                  inputProps={{
                    step: 0.1,
                    min: 0,
                    max: 1,
                    type: "number",
                  }}
                />
            </Grid>
          </Grid>
        </Box>
        <Button
          sx={{mb: 2}}
          variant="contained"
          onClick={this.handleGenerateListSubmit.bind(this)}
          fullWidth
        >
          Generate new stack
        </Button>
      </div> 
    )
  }
}

interface IMenuInputArgsManualProps {
  currentArgs: Array<number>,
  updateInputArgs: (parseError: string, newArr: Array<number>) => void,
}

interface IMenuInputArgsManualState {
  inputArgsString: string,
}

class MenuInputArgsManual extends React.Component<IMenuInputArgsManualProps, IMenuInputArgsManualState> {
  constructor(props: IMenuInputArgsManualProps) {
    super(props)
    this.state = {
      inputArgsString: props.currentArgs.join(" "),
      // inputArgsString: ""
    }
  }

  handleInputArgsManualEntryChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    this.setState({
      inputArgsString: event.target.value,
    })

    const setToErrorString = (set: Set<string>): string => {
      if (set.size === 0) {
        return "";
      }
      const errorsString = Array.from(set).reduce((prev, curr, index, array) => {
        if (index === 0) {
          return curr;
        }
        if (index === array.length - 1) {
          return (`${prev} and ${curr}`);
        }
        return (`${prev}, ${curr}`);
      }, "")

      return (`<Error: ${errorsString} found>`);
    }

    const splitString = event.currentTarget.value.trim().split(" ");
    const seenNumbers = new Set();
    const newArgs = [] as Array<number>;
    const errorsSeen = new Set() as Set<string>;
    splitString.forEach((item) => {
      const newVal = parseInt(item)
      if (Number.isNaN(newVal)) {
        errorsSeen.add("NaN");
      }
      if (seenNumbers.has(newVal)) {
        errorsSeen.add("duplicate");
      }
      // if (newVal < 0) {
      //   errorsSeen.add("negative");
      // }
      seenNumbers.add(newVal);
      newArgs.push(newVal);
    })
    let parseError = "";
    if (errorsSeen.size > 0) {
      parseError = setToErrorString(errorsSeen);
    }
    if (parseError) {
      this.props.updateInputArgs(parseError, [] as Array<number>);
    } else {
      this.props.updateInputArgs(parseError, newArgs);
    }
  }

  render() {
    return (
      <div>
        <Box
          sx={{
            backgroundColor: "grey.300",
            mb: 2,
            p: 1,
          }}
        >
          <b>Manual Entry</b><br/>
          Enter input args manually into box below. Moves separated by a space or tab char.<br/><br/>
          Updates live as entry field is changed.
        </Box>
        <TextField
          sx={{mb: 2}}
          id="input-args-string-input-field"
          label="Input args entry"
          value={this.state.inputArgsString}
          onChange={this.handleInputArgsManualEntryChange.bind(this)}
          fullWidth
        />
        <Button
          sx={{mb: 2}}
          variant="contained"
          // onClick={}
          disabled
          fullWidth
        >
          Stack updates automatically
        </Button>
      </div>

    )
  }
}

interface IMenuInputArgsRandomProps {
  numberOfElementsStartingValue: number,
  updateInputArgs: (parseError: string, newArr: Array<number>) => void,
}

interface IMenuInputArgsRandomState {
  numberOfElementsString: string,
}

class MenuInputArgsRandom extends React.Component<IMenuInputArgsRandomProps, IMenuInputArgsRandomState> {
  constructor(props: IMenuInputArgsRandomProps) {
    super(props)
    this.state = {
      numberOfElementsString: props.numberOfElementsStartingValue.toString(),
      // numberOfElementsString: "50"
    }
  }

  // Fisher-yates shuffle
  // Ref: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle<Type>(arr: Array<Type>) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }  
  }

  // Generating range array
  // https://stackoverflow.com/a/29559488/9160572
  generateShuffledArgs(n: number): Array<number> {
    const newArr = Array.from(Array(n).keys());
    this.shuffle(newArr);
    return (newArr);
  }

  handleNumberOfElementsStringChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    // console.log(event.currentTarget.value);
    this.setState({
      numberOfElementsString: event.target.value,
    })
  }

  handleNumberOfElementsSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    const parsedValue = parseInt(this.state.numberOfElementsString)
    if (Number.isNaN(parsedValue)) {
      this.props.updateInputArgs("<Error: n is not a number>", [] as Array<number>)
    } else if (parsedValue < 0) {
      this.props.updateInputArgs("<Error: n is negative>", [] as Array<number>)
    } else {
      const newArr = this.generateShuffledArgs(parsedValue)
      this.props.updateInputArgs("", newArr)
    }
  }

  render() {
    return (
      <div>
        <Box
          sx={{
            backgroundColor: "grey.300",
            mb: 2,
            p: 1,
          }}
        >
          <b>Random</b><br/>
          Generates a shuffled list of n numbers.
        </Box>
        <TextField
          sx={{mb: 2}}
          id="number-of-elements-input-field"
          label="Number of elements (n)"
          value={this.state.numberOfElementsString}
          onChange={this.handleNumberOfElementsStringChange.bind(this)}
          fullWidth
        />
        <Button
          sx={{mb: 2}}
          variant="contained"
          onClick={this.handleNumberOfElementsSubmit.bind(this)}
          fullWidth
        >
          Generate new stack
        </Button>
      </div>
    )
  }
}

interface IMenuInputArgsProps {
  inputArgs: Array<number>,
  inputArgsParseError: string,
  updateInputArgs: (parseError: string, newArr: Array<number>) => void,
  // updateInputArgsParseError: (isError: Boolean) => void,
}

interface IMenuInputArgsState {
  inputArgsGeneratorNumberString: string,
  inputArgsEntryString: string,
  // inputArgsEntryStringParseError: Boolean
  manualEntryUnlocked: Boolean,

  inputArgsSource: string,
}

class MenuInputArgs extends React.Component<IMenuInputArgsProps, IMenuInputArgsState> {
  constructor(props: IMenuInputArgsProps) {
    super(props)
    this.state = {
      inputArgsGeneratorNumberString: this.props.inputArgs.length.toString(),
      inputArgsEntryString: this.inputArgsToString(this.props.inputArgs),
      // // inputArgsEntryStringParseError: false,
      manualEntryUnlocked: false,

      inputArgsSource: "random",
    }

    // this.handleInputArgsGeneratorNumberChange = this.handleInputArgsGeneratorNumberChange.bind(this);
    // this.handleInputArgsGeneratorSubmit = this.handleInputArgsGeneratorSubmit.bind(this);
    this.unlockRawInputArgsEntry = this.unlockRawInputArgsEntry.bind(this);
    this.handleInputArgManualEntryChange = this.handleInputArgManualEntryChange.bind(this);
  }

  // handleInputArgsGeneratorNumberChange(event: React.FormEvent<HTMLInputElement>) {
  //   this.setState({
  //     inputArgsGeneratorNumberString: event.currentTarget.value,
  //   })
  // }

  // handleInputArgsGeneratorSubmit(event: React.MouseEvent<HTMLButtonElement>) {
  //   const parsedValue = parseInt(this.state.inputArgsGeneratorNumberString)
  //   if (Number.isNaN(parsedValue) || parsedValue < 0) {
  //     this.props.updateInputArgs("<Error: Args not generated>", [] as Array<number>)
  //     if (Number.isNaN(parsedValue)) {
  //       this.setState({
  //         inputArgsEntryString: "<Error: Number of elements is not a number>"
  //       })
  //     } else if (parsedValue < 0) {
  //       this.setState({
  //         inputArgsEntryString: "<Error: Number of elements is negative>"
  //       })
  //     } else {
  //       this.setState({
  //         inputArgsEntryString: "<Error: Undefined error>",
  //       })
  //     }
  //   } else {
  //     const newArr = this.generateShuffledArgs(parsedValue)
  //     this.props.updateInputArgs("", newArr)
  //     this.setState({
  //       inputArgsGeneratorNumberString: parsedValue.toString(),
  //       inputArgsEntryString: this.inputArgsToString(newArr),
  //     })
  //   }
  // }

  unlockRawInputArgsEntry(event: React.MouseEvent<HTMLButtonElement>) {
    this.setState({
      manualEntryUnlocked: !this.state.manualEntryUnlocked,
    })
  }
  
  handleInputArgManualEntryChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({
      inputArgsEntryString: event.currentTarget.value,
    })
    const [parseError, newArgs] = this.stringToInputArgs(event.currentTarget.value)
    this.props.updateInputArgs(parseError, newArgs);
  }
  
  inputArgsToString(arr: Array<number>) {
    const new_str = arr.join(" ");
    return new_str;
  }

  stringToInputArgs(str: string): [string, number[]] {
    const newArgs = [] as Array<number>
    let parseError = "";
    const seenNumbers = new Set()
    str.split(" ").forEach((item, index) => {
      const newVal = parseInt(item)
      if (Number.isNaN(newVal)) {
        parseError = "<Error: One or more args is not a number>";
      }
      if (seenNumbers.has(newVal)) {
        parseError = "<Error: Duplicate numbers>";
      }
      seenNumbers.add(newVal);
      newArgs.push(newVal);
    })
    if (parseError) {
      return [parseError, [] as Array<number>];
    }
    return [parseError, newArgs];
  }

  // // Fisher-yates shuffle
  // // Ref: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  // shuffle<Type>(arr: Array<Type>) {
  //   for (let i = arr.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [arr[i], arr[j]] = [arr[j], arr[i]];
  //   }  
  // }

  // // Generating range array
  // // https://stackoverflow.com/a/29559488/9160572
  // generateShuffledArgs(n: number): Array<number> {
  //   const newArr = Array.from(Array(n).keys());
  //   this.shuffle(newArr);
  //   return (newArr);
  // }

  // handleInputArgsSourceChange(event: React.ChangeEvent<HTMLSelectElement>) {
  //   this.setState({
  //     inputArgsSource: event.currentTarget.value,
  //   })
  // }

  handleInputArgsSourceChange(event: SelectChangeEvent): void {
    this.setState({
      inputArgsSource: event.target.value,
    })
  }

  render() {
    let inputArgsSource = <div></div>
    if (this.state.inputArgsSource === "random") {
      inputArgsSource = 
        <MenuInputArgsRandom
          numberOfElementsStartingValue={this.props.inputArgs.length}
          updateInputArgs={this.props.updateInputArgs}
        />
    } else if (this.state.inputArgsSource === "manual-entry") {
      inputArgsSource =
        <MenuInputArgsManual
          currentArgs={this.props.inputArgs}
          updateInputArgs={this.props.updateInputArgs}
        />
    } else if (this.state.inputArgsSource === "mostly-sorted") {
      inputArgsSource = 
        <MenuInputArgsMostlySorted
          numberOfElementsStartingValue={this.props.inputArgs.length}
          updateInputArgs={this.props.updateInputArgs}
        />
    } else if (this.state.inputArgsSource === "reversed") {
      inputArgsSource =
        <MenuInputArgsReversed
          numberOfElementsStartingValue={this.props.inputArgs.length}
          updateInputArgs={this.props.updateInputArgs}
        />
    }

    return (
      <div className="menu-input-args">
        <FormControl fullWidth>
          <InputLabel id="input-args-source-label">Source</InputLabel>
          <Select
            sx={{mb: 2}}
            labelId="input-args-source-label"
            id="input-args-source"
            label="Source"
            value={this.state.inputArgsSource}
            onChange={this.handleInputArgsSourceChange.bind(this)}
            >
            <MenuItem value="manual-entry">Manual Entry</MenuItem>
            <MenuItem value="random">Generator - Random</MenuItem>
            <MenuItem value="mostly-sorted">Generator - Mostly Sorted</MenuItem>
            <MenuItem value="reversed">Generator - Reversed</MenuItem>
          </Select>
        </FormControl>

        {inputArgsSource}

        <br/>
        <TextField
          sx={{
            mt: 4,
            mb: 2,
          }}
          id="input-args-parsed"
          label="Generated starting stack"
          variant="outlined"
          value={this.props.inputArgsParseError ? this.props.inputArgsParseError : this.props.inputArgs.join(" ")}
          disabled={true}
          fullWidth
        />
      </div>

    )
  }
}

interface IMenuMovesSourceSolutionLouisProps {
  inputArgs: Array<number>,
  updateMoves: (parseError: string, moves: Array<Move>) => void,
}

interface IMenuMovesSourceSolutionLouisState {
  return: string | undefined,
  stdout: string | undefined,
  stderr: string | undefined,
}

class MenuMovesSourceSolutionLouis extends React.Component<IMenuMovesSourceSolutionLouisProps, IMenuMovesSourceSolutionLouisState> {
  constructor(props: IMenuMovesSourceSolutionLouisProps) {
    super(props)
    this.state = {
      return: undefined,
      stdout: undefined,
      stderr: undefined,
    }
  }

  formatArgs(inputArgs: Array<number>): Array<string> {
    const formattedArgs = ([] as Array<string>).concat(
      ["wasm-louis-solution"],
      inputArgs.map(num => num.toString()),
    );
    return formattedArgs;
  }

  async getMoves(_event: React.MouseEvent<HTMLButtonElement>) {
    const result = await getMovesSolutionLouis(this.formatArgs(this.props.inputArgs))
    const moves: Array<Move | null> = result.stdout.map((elem: string): Move | null => stringToMove(elem));
    let parseError = "";
    const moves_without_null = moves.reduce((res, item) => {
      if (item === null) {
        parseError = "<Error: Invalid output from program received>";
        return res;
      } else {
        return ([...res, item]);
      }
    }, [] as Array<Move>)
    
    if (parseError) {
      this.setState({
        return: result.return,
        stdout: result.stdout.join("\n"),
        stderr: result.stderr.join("\n"),
      })
      this.props.updateMoves(parseError, [] as Array<Move>);
    } else {
      const moves_with_start: Array<Move> = [Move.Start, ...moves_without_null];
      this.setState({
        return: result.return,
        stdout: result.stdout.join("\n"),
        stderr: result.stderr.join("\n"),
      })
      this.props.updateMoves(parseError, moves_with_start);
    }
  }

  render() {
    return(
      <div>
        <Box
          sx={{
            backgroundColor: "grey.300",
            mb: 2,
            p: 1,
          }}
        >
          <b>Solution - @louissxu</b><br/>
          Get moves from user solution by @louissxu.<br/><br/>
          More info: INSERT LINK<br/>
          Source: INSERT LINK<br/>
        </Box>

        <TextField
          sx={{mb: 2}}
          id="stdout"
          label="stdout"
          // placeholder="Populated by stdout from C program"
          value={this.state.stdout === undefined ? "Populated by stdout from C program" :
            this.state.stdout === "" ? "<empty>" :
            this.state.stdout}
          disabled={true}
          multiline
          maxRows={2.5}
          fullWidth
        />
        <TextField
          sx={{mb: 2}}
          id="stderr"
          label="stderr"
          // placeholder="Populated by stderr from C program"
          value={this.state.stderr === undefined ? "Populated by stderr from C program" : 
            this.state.stderr === "" ? "<empty>" :
            this.state.stderr}
          disabled={true}
          multiline
          maxRows={2.5}
          fullWidth
        />
        <TextField
          sx={{mb: 2}}
          id="return"
          label="return"
          // placeholder="Populated by stderr from C program"
          value={this.state.return === undefined ? "Populated by return from C program" :
            this.state.return === "" ? "<empty>" :
            this.state.return}
          disabled={true}
          multiline
          maxRows={2.5}
          fullWidth
        />
        <Button
          sx={{mb: 2}}
          variant="contained"
          onClick={this.getMoves.bind(this)}
          // onClick={}
          fullWidth
        >
          Get moves
        </Button>
      </div>
    )
  }
}


interface IMenuMovesSourcePythonLinkerProps {
  inputArgs: Array<number>,
  updateMoves: (parseError: string, moves: Array<Move>) => void,
}

interface IMenuMovesSourcePythonLinkerState {
  stdout: string | undefined,
  stderr: string | undefined,
}

class MenuMovesSourcePythonLinker extends React.Component<IMenuMovesSourcePythonLinkerProps, IMenuMovesSourcePythonLinkerState> {
  constructor(props: IMenuMovesSourcePythonLinkerProps) {
    super(props)
    this.state = {
      stdout: undefined,
      stderr: undefined,
    }
  }

  // TODO: Make python linker take raw text and check that the linker gives appropriate error responses for invalid input arguments

  generateQueryUrl(nums: Array<number>) {
    const url = "http://127.0.0.1:8080?" + nums.join(",");
    return url;
  }

  getMoves(_event: React.MouseEvent<HTMLButtonElement>) {
    const url = this.generateQueryUrl(this.props.inputArgs);
    fetch(url).then((response) => {
      return response.text();
    }).then((text) => {
      const data = JSON.parse(text);
      const stdout: string = data.stdout
      const stderr: string = data.stderr;
      const moves = stdout.trim().split("\n").map((elem: string) => stringToMove(elem));
      let parseError = "";
      const moves_without_null = moves.reduce((res, item) => {
        if (item === null) {
          parseError = "<Error: Invalid output from program received>";
          return res;
        } else {
          return ([...res, item]);
        }
      }, [] as Array<Move>);
      if (parseError) {
        this.setState({
          stdout: stdout,
          stderr: stderr,
        })
        this.props.updateMoves(parseError, [] as Array<Move>);
        // return ([parseError, [] as Array<Move>]);
      } else {
        const moves_with_start: Array<Move> = [Move.Start, ...moves_without_null];
        this.setState({
          stdout: stdout,
          stderr: stderr,
        })
        this.props.updateMoves(parseError, moves_with_start);
        // return [parseError, moves_with_start];
      }  
    }).catch(() => {
      console.log("Error running linker (timeout? other error?)");
    });
  }  

  render() {
    return (
      <div>
        <Box
          sx={{
            backgroundColor: "grey.300",
            mb: 2,
            p: 1,
          }}
        >
          <b>Python linker</b><br/>
          Get moves from running a user provided C program.<br/><br/>
          Running the python program sets up HTTP server which runs a temporary API to allow access to a C program to generate the moves.<br/><br/>
          More info: INSERT LINK<br/>
          Source: INSERT LINK<br/>
        </Box>


        <TextField
          sx={{mb: 2}}
          id="stdout"
          label="stdout"
          // placeholder="Populated by stdout from C program"
          value={this.state.stdout === undefined ? "Populated by stdout from C program" :
            this.state.stdout === "" ? "<empty>" :
            this.state.stdout}
          disabled={true}
          multiline
          maxRows={2.5}
          fullWidth
        />
        <TextField
          sx={{mb: 2}}
          id="stderr"
          label="stderr"
          // placeholder="Populated by stderr from C program"
          value={this.state.stderr === undefined ? "Populated by stderr from C program" :
            this.state.stderr === "" ? "<empty>" :
            this.state.stderr}
          disabled={true}
          multiline
          maxRows={2.5}
          fullWidth
        />
        <Button
          sx={{mb: 2}}
          variant="contained"
          onClick={this.getMoves.bind(this)}
          // onClick={}
          fullWidth
        >
          Get moves
        </Button>
      </div>
    )
  }
}

interface IMenuMovesSourceManualProps {
  moves: Array<Move>,
  // movesParseError: string,
  updateMoves: (parseError: string, moves: Array<Move>) => void,
}

interface IMenuMovesSourceManualState {
  inputString: string,
}

class MenuMovesSourceManual extends React.Component<IMenuMovesSourceManualProps, IMenuMovesSourceManualState> {
  constructor(props: IMenuMovesSourceManualProps) {
    super(props)
    this.state = {
      inputString: this.props.moves.slice(1).join("\n"),
      // inputString: "",
    }
  }

  stringToMove(s: string): Move | null {
    if (s === "starting state") {
      return Move.Start;
    } else if (s === "sa") {
      return Move.Sa;
    } else if (s === "sb") {
      return Move.Sb;
    } else if (s === "ss") {
      return Move.Ss;
    } else if (s === "pa") {
      return Move.Pa;
    } else if (s === "pb") {
      return Move.Pb;
    } else if (s === "ra") {
      return Move.Ra;
    } else if (s === "rb") {
      return Move.Rb;
    } else if (s === "rr") {
      return Move.Rr;
    } else if (s === "rra") {
      return Move.Rra;
    } else if (s === "rrb") {
      return Move.Rrb;
    } else if (s === "rrr") {
      return Move.Rrr;
    } else {
      return null;
    }
  }

  stringToMoves(s: string): [string, Array<Move>] {
    let parseError = ""
    const newMoves = s.trim().split("\n").reduce((newMoves, item, index) => {
      if (item === "") {
        parseError = "<Error: Empty move in string>"
        return ([...newMoves])
      }
      const parsedMove = this.stringToMove(item);
      if (parsedMove === null) {
        parseError = "<Error: Invalid move in string>"
        return ([...newMoves])
      }
      return ([...newMoves, parsedMove])
    }, [Move.Start] as Array<Move>)
    return [parseError, newMoves]
  }

  handleMovesInputFieldChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({
      inputString: event.currentTarget.value,
    })
    const [parseError, newMoves] = this.stringToMoves(event.currentTarget.value);
    this.props.updateMoves(parseError, newMoves);
  }

  render() {
    return (
      <div>
        <Box
          sx={{
            backgroundColor: "grey.300",
            mb: 2,
            p: 1,
          }}
        >
          <b>Manual Entry</b><br/>
          Enter moves manually into box below. Moves separated by new line char.<br/><br/>
          Updates live as entry field is changed.<br/><br/>
          More info: INSERT LINK<br/>
          Source: INSERT LINK<br/>
        </Box>
        <TextField
          sx={{mb: 2}}
          id="moves-manual-entry-input-field"
          label="Moves entry"
          value={this.state.inputString}
          onChange={this.handleMovesInputFieldChange.bind(this)}
          fullWidth
          multiline
          rows={2.5}
          // maxRows={2.5}
        />
        <Button
          sx={{mb: 2}}
          variant="contained"
          // onClick={}
          disabled
          fullWidth
        >
          Moves updates automatically
        </Button>
      </div>
    )
  }
}

interface IMenuMovesProps {
  inputArgs: Array<number>,
  moves: Array<Move>,
  movesParseError: string,
  movesUpdate: (parseError: string, newMoves: Array<Move>) => void,
}

interface IMenuMovesState {
  movesSource: string,
  stdout: string,
  stderr: string,
}

class MenuMoves extends React.Component<IMenuMovesProps, IMenuMovesState> {
  constructor(props: IMenuMovesProps) {
    super(props)
    this.state = {
      movesSource: "python-linker",
      stdout: "",
      stderr: "",
    }

    this.handleMovesSourceSelectChange = this.handleMovesSourceSelectChange.bind(this); 
  }

  handleMovesSourceSelectChange(event: SelectChangeEvent): void {
    this.setState({
      movesSource: event.target.value,
    })
  }

  render() {
    let movesGenerator: JSX.Element = <div></div>
    if (this.state.movesSource === "manual-entry") {
      movesGenerator = 
        <MenuMovesSourceManual
          moves={this.props.moves}
          updateMoves={this.props.movesUpdate}
        />
    } else if (this.state.movesSource === "python-linker") {
      movesGenerator = 
        <MenuMovesSourcePythonLinker
          inputArgs={this.props.inputArgs}
          updateMoves={this.props.movesUpdate}
        />
    } else if (this.state.movesSource === "solution-louissxu") {
      movesGenerator =
        <MenuMovesSourceSolutionLouis
          inputArgs={this.props.inputArgs}
          updateMoves={this.props.movesUpdate}
        />
    }
    
    return (
      <div className="menu-moves">
        <FormControl fullWidth>
          <InputLabel id="moves-source-label">Source</InputLabel>
          <Select
            sx={{mb: 2}}
            labelId="moves-source-label"
            id="moves-source"
            label="Source"
            value={this.state.movesSource}
            onChange={this.handleMovesSourceSelectChange}
          >
            <MenuItem value="python-linker">Python Linker</MenuItem>
            <MenuItem value="manual-entry">Manual Entry</MenuItem>
            <MenuItem value="solution-louissxu">Solution - @louissxu</MenuItem> 
          </Select>
        </FormControl>

        {movesGenerator}

        <br/>
        <TextField
          sx={{
            mt: 4,
            mb: 2,
          }}
          id="moves-parsed"
          label="Parsed moves"
          variant="outlined"
          value={this.props.movesParseError ? this.props.movesParseError: this.props.moves.join("\n")}
          disabled={true}
          multiline={true}
          rows={2.5}
          // maxRows={2.5}
          fullWidth
        />
      </div>
    )
  }
}

interface IMenuPlaybackProps {
  stepBackward: () => void,
  stepForward: () => void,
  // playbackFpsRounded: number,
  // playbackFpsSliderValue: number,
  updatePlaybackSpeed: (newValue: number) => void,
  playbackPause: () => void,
  playbackPlayForward: () => void,
  playbackPlayBackward: () => void,
  playbackJumpToFrameNumber: (frame: number) => void,
  playbackCurrentFrameNumber: number,
  playbackMaxFrameCount: number,
}

interface IMenuPlaybackState {
  playbackSpeedSliderValue: number,
}

class MenuPlayback extends React.Component<IMenuPlaybackProps, IMenuPlaybackState> {
  constructor(props: IMenuPlaybackProps) {
    super(props)
    this.state = {
      playbackSpeedSliderValue: 23
    }
  }

  // handlePlaybackSpeedChange(event: React.FormEvent<HTMLInputElement>) {
  //   this.props.updatePlaybackSpeed(parseInt(event.currentTarget.value));
  // }

  // handlePlaybackFrameNumberChange(event: React.FormEvent<HTMLInputElement>) {
  //   this.props.playbackJumpToFrameNumber(parseInt(event.currentTarget.value));
  // }

  handlePlaybackFrameNumberSliderChange(_event: Event, value: number | number[]) {
    if (Array.isArray(value)) {
      this.props.playbackJumpToFrameNumber(value[0]);
    } else {
      this.props.playbackJumpToFrameNumber(value);
    }
  }

  handlePlaybackSpeedSliderChange(_event: Event, value: number | number[]) {
    if (typeof value ==="number") {
      this.props.updatePlaybackSpeed(this.calculateSliderValueToFpsValue(value));
      this.setState({
        playbackSpeedSliderValue: value
      })
    }
  }
  
  calculateSliderValueToFpsValue(sliderValue: number) {
    return 0.25 * (1.15 ** sliderValue);
  }

  formatSliderLabel(value: number) {
    if (value < 1) {
      // return (`${parseFloat(value.toPrecision(2))}fps (${(1/value).toFixed(1)} sec/frame)`)
      return(`${(1/value).toFixed(1)} sec/frame`)
    }
    return (`${parseFloat(value.toPrecision(2))}fps`)
  }

  render() {
    const frameSliderMarks = [
      {
        value: 0,
        label: "0",
      },
      {
        value: this.props.playbackMaxFrameCount,
        label: this.props.playbackMaxFrameCount.toString(),
      }
    ]

    return (
      <div className="menu-playback">
        <Typography id="playback-frame-number-label" gutterBottom>
          Playback frame number
        </Typography>
        <Slider
          id="playback-frame-number"
          value={this.props.playbackCurrentFrameNumber}
          min={0}
          max={this.props.playbackMaxFrameCount}
          onChange={this.handlePlaybackFrameNumberSliderChange.bind(this)}
          valueLabelDisplay="auto"
          marks={frameSliderMarks}
        />
        <Grid
          container
          sx={{
            justifyContent:"center"
          }}
        >
          <IconButton
            aria-label="play-backward"
            onClick={this.props.playbackPlayBackward}
          >
            <PlayCircleIcon
              sx={{
                transform: "scaleX(-1)",
              }}
            />
          </IconButton>
          <IconButton
            aria-label="step-backward"
            onClick={this.props.stepBackward}
          >
            <NextFrameIcon
              sx={{
                transform: "scaleX(-1)",
              }}
            />
          </IconButton>
          <IconButton
            aria-label="pause"
            onClick={this.props.playbackPause}
          >
            <PauseCircleIcon/>
          </IconButton>
          <IconButton
            aria-label="step-forward"
            onClick={this.props.stepForward}
          >
            <NextFrameIcon/>
          </IconButton>
          <IconButton
            aria-label="play"
            onClick={this.props.playbackPlayForward}
          >
            <PlayCircleIcon/>
          </IconButton>
        </Grid>
        <Typography id="playback-speed-label" gutterBottom>
          Playback speed: {this.formatSliderLabel(this.calculateSliderValueToFpsValue(this.state.playbackSpeedSliderValue))}
        </Typography>
        <Slider
          id="playback-speed"
          value={this.state.playbackSpeedSliderValue}
          min={0}
          max={60}
          scale={this.calculateSliderValueToFpsValue.bind(this)}
          getAriaValueText={this.formatSliderLabel.bind(this)}
          valueLabelFormat={this.formatSliderLabel.bind(this)}
          onChange={this.handlePlaybackSpeedSliderChange.bind(this)}
          valueLabelDisplay="auto"
        />

{/* 
        <label htmlFor="playback-speed">Playback Speed: </label>
        <output>{this.props.playbackFpsRounded.toString() + "fps"}</output>
        <input
          type="range"
          id="playback-speed"
          name="playback-speed"
          min="0"
          max="60"
          value={this.props.playbackFpsSliderValue.toString()}
          onChange={this.handlePlaybackSpeedChange.bind(this)}
        />
        <br/>
        <label htmlFor="playback-frame-number">Playback Frame Number: </label>
        <output>{this.props.playbackCurrentFrameNumber}</output>
        <input
          type="range"
          id="playback-frame-number"
          name="playback-frame-number"
          min="0"
          max={this.props.playbackMaxFrameCount.toString()}
          value={this.props.playbackCurrentFrameNumber.toString()}
          onChange={this.handlePlaybackFrameNumberChange.bind(this)}
        /> */}
      </div>
    )
  }
}

interface IMenuProps {
  stepForward: () => void,
  stepBackward: () => void,
  // generateStartingState: (n: number) => void,
  generateStartingStateWithInputString: (s: string) => void,
  inputArgs: Array<number>,
  inputArgsParseError: string,
  inputArgsUpdate: (parseError: string, newArgs: Array<number>) => void,

  moves: Array<Move>,
  movesParseError: string,
  movesUpdate: (parseError: string, newMoves: Array<Move>) => void,

  // getMoves: () => void,
  programStdout: string,
  programStderr: string,
  programParsedMoves: Array<Move>,
  playbackPause: () => void,
  playbackPlayForward: () => void,
  playbackPlayBackward: () => void,
  updatePlaybackSpeed: (newValue: number) => void,
  // playbackFpsRounded: number,
  // playbackFpsSliderValue: number,
  playbackMaxFrameCount: number,
  playbackCurrentFrameNumber: number,
  playbackJumpToFrameNumber: (newValue: number) => void,
}

interface IMenuState {
  // inputArgsFieldLocked: boolean,
}

class Menu extends React.Component<IMenuProps, IMenuState> {
  constructor(props: IMenuProps) {
    super(props)
    this.state = {
      // inputArgsFieldLocked: true,
    }
  }

  handleUpdateInputArgs(parseError: string, args: Array<number>) {
    // if (parseError) {
    //   this.setState({
    //     inputArgsEntryParseError: true,
    //   })
    // } else {
    //   this.props.inputArgsUpdate(args);
    // }
    this.props.inputArgsUpdate(parseError, args);
    return;
  }



  // formatArgsForDisplay(args: Array<number>) {
  //   return (args.join(" "));
  // }

  // toggleInputArgsFieldLock() {
  //   this.setState({
  //     inputArgsFieldLocked: !this.state.inputArgsFieldLocked
  //   })
  // }

  // handleInputArgsFieldChange(event: React.FormEvent<HTMLInputElement>) {
  //   const argString = event.currentTarget.value;
  //   this.props.generateStartingStateWithInputString(argString);
  // }

  // formatMovesForDisplay(moves: Array<Move>) {
  //   return (moves.slice(1).join("\n"))
  // }

  render() {
    return (
      <div className="menu-container">
        <div className="menu-subcontainer">
          <div>
            <h1>Push Swap<br/>Visualiser</h1>
            <h5><a href="https://github.com/louissxu">@louissxu</a></h5> 
            <h5><a href="https://github.com/louissxu/push_swap_visualiser">Github Source</a></h5>
            <h3>Menu</h3>
          </div>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon/>}
            >
              <Typography
                sx={{width: "33%", flexShrink: 0}}
              >
                Data
              </Typography>
              <Typography
                sx={{color: "text.secondary"}}
              >
                Set/generate starting stack values to be sorted
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <MenuInputArgs
                inputArgs={this.props.inputArgs}
                inputArgsParseError={this.props.inputArgsParseError}
                updateInputArgs={this.handleUpdateInputArgs.bind(this)}
                />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon/>}
            >
              <Typography
                sx={{width: "33%", flexShrink: 0}}
              >
                Moves
              </Typography>
              <Typography
                sx={{color: "text.secondary"}}
              >
                Get/generate moves to be run on the stack
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <MenuMoves
                // moves={this.props.programParsedMoves}
                inputArgs={this.props.inputArgs}
                moves={this.props.moves}
                movesParseError={this.props.movesParseError}
                movesUpdate={this.props.movesUpdate}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon/>}
            >
              <Typography
                sx={{width: "33%", flexShrink: 0}}
              >
                Playback
              </Typography>
              <Typography
                sx={{color: "text.secondary"}}
              >
                View/control playback of moves executed on the stack
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <MenuPlayback
                stepBackward={this.props.stepBackward}
                stepForward={this.props.stepForward}
                // playbackFpsRounded={this.props.playbackFpsRounded}
                // playbackFpsSliderValue={this.props.playbackFpsSliderValue}
                updatePlaybackSpeed={this.props.updatePlaybackSpeed}
                playbackPause={this.props.playbackPause}
                playbackPlayForward={this.props.playbackPlayForward}
                playbackPlayBackward={this.props.playbackPlayBackward}
                playbackJumpToFrameNumber={this.props.playbackJumpToFrameNumber}
                playbackCurrentFrameNumber={this.props.playbackCurrentFrameNumber}
                playbackMaxFrameCount={this.props.playbackMaxFrameCount}
              />
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    )
  }
}

interface Frame {
  stack_a: Array<number>,
  stack_b: Array<number>,
}

interface IVisualiserProps {
  values: Array<number>,
  moves: Array<Move>,
}

interface IVisualiserState {
  moves: Array<Move>,
  moves_parsing_error: string,
  current_move_num: number,
  // error_parsing_moves: Boolean,
  input_string: string,
  input_string_parsing_error: string,
  stdout: string,
  stderr: string,
  min_value: number,
  max_value: number,
  num_values: number,
  // playback_fps_slider_value: number,
  playback_fps: number,
  playback_dir: number,
  playback_current_loop: null | ReturnType<typeof setTimeout>,
  frames: Array<Frame>
}

class Visualiser extends React.Component<IVisualiserProps, IVisualiserState> {
  constructor(props: IVisualiserProps) {
    super(props);
    this.state = {
      moves: this.props.moves,
      moves_parsing_error: "",
      current_move_num: 0,
      // error_parsing_moves: false,
      input_string: "",
      input_string_parsing_error: "",
      stdout: "",
      stderr: "",
      min_value: Math.min(...this.props.values),
      max_value: Math.max(...this.props.values) + 1,
      num_values: this.props.values.length,
      // playback_fps_slider_value: 23,
      playback_fps: 10,
      playback_dir: 0,
      playback_current_loop: null,
      frames: [{stack_a: this.props.values, stack_b: [] as Array<number>}],
    }
  }

  psPrimitiveSaFunctional(frame: Frame): Frame {
    if (frame.stack_a.length <= 1) {
      return frame;
    }
    const newFrame: Frame = {
      stack_a: ([] as Array<number>).concat(
        frame.stack_a.slice(1, 2),
        frame.stack_a.slice(0, 1),
        frame.stack_a.slice(2),
      ),
      stack_b: frame.stack_b
    }
    return newFrame;
  }

  psPrimitiveSbFunctional(frame: Frame): Frame {
    if (frame.stack_b.length <= 1) {
      return frame;
    }
    const newFrame: Frame = {
      stack_a: frame.stack_a,
      stack_b: ([] as Array<number>).concat(
        frame.stack_b.slice(1, 2),
        frame.stack_b.slice(0, 1),
        frame.stack_b.slice(2),
      )
    }
    return newFrame;
  }

  psPrimitiveSsFunctional(frame: Frame): Frame {
    return this.psPrimitiveSaFunctional(this.psPrimitiveSbFunctional(frame));
  }

  psPrimitivePaFunctional(frame: Frame): Frame {
    if (frame.stack_b.length <= 0) {
      return frame;
    }
    const newFrame: Frame = {
      stack_a: ([] as Array<number>).concat(
        frame.stack_b.slice(0, 1),
        frame.stack_a.slice(),
      ),
      stack_b: frame.stack_b.slice(1),
    }
    return newFrame;
  }

  psPrimitivePbFunctional(frame: Frame): Frame {
    if (frame.stack_a.length <= 0) {
      return frame;
    }
    const newFrame: Frame = {
      stack_a: frame.stack_a.slice(1),
      stack_b: ([] as Array<number>).concat(
        frame.stack_a.slice(0, 1),
        frame.stack_b.slice(),
      )
    }
    return newFrame;
  }

  psPrimitiveRaFunctional(frame: Frame): Frame {
    if (frame.stack_a.length <= 0) {
      return frame;
    }
    const newFrame: Frame = {
      stack_a: ([] as Array<number>).concat(
        frame.stack_a.slice(1),
        frame.stack_a.slice(0, 1),
      ),
      stack_b: frame.stack_b
    }
    return newFrame;
  }

  psPrimitiveRbFunctional(frame: Frame): Frame {
    if (frame.stack_b.length <= 0) {
      return frame;
    }
    const newFrame: Frame = {
      stack_a: frame.stack_a,
      stack_b: ([] as Array<number>).concat(
        frame.stack_b.slice(1),
        frame.stack_b.slice(0, 1),
      )
    }
    return newFrame;
  }

  psPrimitiveRrFunctional(frame: Frame): Frame {
    return this.psPrimitiveRaFunctional(this.psPrimitiveRbFunctional(frame));
  }

  psPrimitiveRraFunctional(frame: Frame): Frame {
    if (frame.stack_a.length <= 0) {
      return frame;
    }
    const newFrame: Frame = {
      stack_a: ([] as Array<number>).concat(
        frame.stack_a.slice(-1),
        frame.stack_a.slice(0, -1),
      ),
      stack_b: frame.stack_b,
    }
    return newFrame;
  }

  psPrimitiveRrbFunctional(frame: Frame): Frame {
    if (frame.stack_b.length <= 0) {
      return frame;
    }
    const newFrame: Frame = {
      stack_a: frame.stack_a,
      stack_b: ([] as Array<number>).concat(
        frame.stack_b.slice(-1),
        frame.stack_b.slice(0, -1),
      )
    }
    return newFrame;
  }

  psPrimitiveRrrFunctional(frame: Frame): Frame {
    return this.psPrimitiveRraFunctional(this.psPrimitiveRrbFunctional(frame));
  }

  frameApplyMove(frame: Frame, move: Move) {
    switch (move) {
      case Move.Sa:
        return this.psPrimitiveSaFunctional(frame);
      case Move.Sb:
        return this.psPrimitiveSbFunctional(frame);
      case Move.Ss:
        return this.psPrimitiveSsFunctional(frame);
      case Move.Pa:
        return this.psPrimitivePaFunctional(frame);
      case Move.Pb:
        return this.psPrimitivePbFunctional(frame);
      case Move.Ra:
        return this.psPrimitiveRaFunctional(frame);
      case Move.Rb:
        return this.psPrimitiveRbFunctional(frame);
      case Move.Rr:
        return this.psPrimitiveRrFunctional(frame);
      case Move.Rra:
        return this.psPrimitiveRraFunctional(frame);
      case Move.Rrb:
        return this.psPrimitiveRrbFunctional(frame);
      case Move.Rrr:
        return this.psPrimitiveRrrFunctional(frame);
      default:
        return {stack_a: ([] as Array<number>), stack_b:([] as Array<number>)};
    }
  }

  playbackJumpToFrameNumber(newFrame: number) {
    if (newFrame === 0 || newFrame === this.state.moves.length - 1) {
      this.playbackPause();
    }
    if (this.state.frames.length > newFrame) {
      this.setState({
        current_move_num: newFrame,
      })
      return;
    }
    let frame: Frame = this.state.frames[this.state.frames.length - 1];
    for (let i = this.state.frames.length - 1; i < newFrame; i++) {
      frame = this.frameApplyMove(frame, this.state.moves[i + 1]);
      this.state.frames.push(frame);
    }
    this.setState({
      current_move_num: newFrame,
    })
  }

  stepForward() {
    if (this.state.current_move_num < this.state.moves.length - 1) {
      this.playbackJumpToFrameNumber(this.state.current_move_num + 1);
    } else {
      this.playbackPause();
    }  
  }  

  stepBackward() {
    if (this.state.current_move_num > 0) {
      this.playbackJumpToFrameNumber(this.state.current_move_num - 1);
    } else {
      this.playbackPause();
    }  
  }  

  playbackPause() {
    this.setState({
      playback_dir: 0,
    }, this.doPlayback)  
  }  

  playbackPlayForward() {
    if (this.state.playback_current_loop === null) {
      this.setState({
        playback_dir: 1,
      }, this.doPlayback)  
    } else {
      this.setState({
        playback_dir: 1,
      })  
    }  
  }  

  playbackPlayBackward() {
    if (this.state.playback_current_loop === null) {
      this.setState({
        playback_dir: -1,
      }, this.doPlayback)  
    } else {
      this.setState({
        playback_dir: -1,
      })  
    }  
  }  
  
  doPlayback() {
    const multiplier: number = Math.ceil(this.state.playback_fps / 5);
    const newFps: number = this.state.playback_fps / multiplier;
    if (this.state.playback_dir === 0) {
      if (this.state.playback_current_loop === null) {
        return;
      }  
      clearTimeout(this.state.playback_current_loop);
      this.setState({
        playback_current_loop: null,
      });  
      return;
    } else if (this.state.playback_dir === 1) {
      this.playbackJumpToFrameNumber(Math.min(this.state.moves.length - 1, this.state.current_move_num + multiplier));
      // this.stepForward();
    } else if (this.state.playback_dir === -1) {
      this.playbackJumpToFrameNumber(Math.max(0, this.state.current_move_num - multiplier));        
      // this.stepBackward();
    }  

    const new_playback_loop = setTimeout(() => {
      this.doPlayback()
    }, 1000 / newFps)  
    this.setState({
      playback_current_loop: new_playback_loop,
    })  
  }  

  // Fisher-yates shuffle
  // Ref: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle<Type>(arr: Array<Type>) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }  
  }  

  // Generating range array
  // https://stackoverflow.com/a/29559488/9160572
  // generateStartingState(n: number) {
  //   // console.log(n);
  //   this.playbackPause();
  //   const new_stack_a = Array.from(Array(n).keys());
  //   this.shuffle(new_stack_a);
  //   const new_stack_b: Array<number> = [];
  //   const new_moves: Array<Move> = [Move.Start];
  //   this.setState({
  //     moves: new_moves,
  //     current_move_num: 0,
  //     max_value: new_stack_a.length,
  //     frames: [{stack_a: new_stack_a, stack_b: new_stack_b}],
  //     stdout: "",
  //     stderr: "",
  //   })  
  // }  

  generateShuffledArray(n: number): Array<number> {
    const new_arr = Array.from(Array(n).keys());
    this.shuffle(new_arr);
    return new_arr;
  }

  // shuffledArrayToString(arr: Array<number>) {
  //   const new_str = arr.join(" ")
  // }

  generateStartingStateWithInputString(s: string) {
    this.playbackPause();
    const nums: Array<number> = s.split(" ").map(elem => parseInt(elem)).filter(elem => !Number.isNaN(elem))
    this.setState({
      moves: [Move.Start],
      current_move_num: 0,
      max_value: nums.length,
      frames: [{stack_a: nums, stack_b: ([] as Array<number>)}],
      stdout: "",
      stderr: "",
    })
  }

  inputArgsUpdate(parseError: string, newArr: Array<number>) {
    this.playbackPause();
    if (parseError) {
      this.setState({
        input_string_parsing_error: parseError,
        moves: [Move.Start],
        current_move_num: 0,
        max_value: 0,
        num_values: 0,
        frames: [{stack_a: ([] as Array<number>), stack_b: ([] as Array<number>)}],
        stdout: "",
        stderr: "",

      })
    } else {
      this.setState({
        input_string_parsing_error: "",
        moves: [Move.Start],
        current_move_num: 0,
        min_value: Math.min(...newArr),
        max_value: Math.max(...newArr) + 1,
        num_values: newArr.length,
        frames: [{stack_a: newArr, stack_b: ([] as Array<number>)}],
        stdout: "",
        stderr: "",
      })
    }
  }

  // generateQueryUrl(nums: Array<number>) {
  //   const url = "http://127.0.0.1:8080?" + nums.join(",");
  //   return url;
  // }  

  // stringToMove(str: string): Move | null {
  //   switch(str){
  //     case "sa":
  //       return Move.Sa;
  //     case "sb":
  //       return Move.Sb;
  //     case "ss":
  //       return Move.Ss;
  //     case "pa":
  //       return Move.Pa;
  //     case "pb":
  //       return Move.Pb;
  //     case "ra":
  //       return Move.Ra;
  //     case "rb":
  //       return Move.Rb;
  //     case "rr":
  //       return Move.Rr;
  //     case "rra":
  //       return Move.Rra;
  //     case "rrb":
  //       return Move.Rrb;
  //     case "rrr":
  //       return Move.Rrr;
  //   }    
  //   return null;
  // }  

  // getMoves() {
  //   this.playbackPause();
  //   const url = this.generateQueryUrl(this.state.frames[0].stack_a);
  //   this.setState({
  //     current_move_num: 0,
  //     frames: this.state.frames.slice(0, 1),
  //   })  
  //   fetch(url).then((response) => {
  //     return response.text();
  //   }).then((text) => {
  //     const data = JSON.parse(text);
  //     const stdout = data.stdout
  //     const stderr = data.stderr;
  //     const moves = stdout.trim().split("\n").map((elem: string) => this.stringToMove(elem));
  //     // const formattedMoves = moves.map((str:string) => str[0].toUpperCase() + str.slice(1)).map((str:string) => "Move." + str).join(", ");
  //     // console.log(formattedMoves); 
  //     if (moves.includes(null)) {
  //       this.setState({
  //         moves: [],
  //         // error_parsing_moves: true,
  //         stdout: stdout,
  //         stderr: stderr,
  //       })  
  //     } else {
  //       const moves_with_start = [Move.Start, ...moves];
  //       this.setState({
  //         moves: moves_with_start,
  //         // error_parsing_moves: false,
  //         stdout: stdout,
  //         stderr: stderr,
  //       })  
  //     }  
  //   }).catch(() => {
  //     console.log("boo");
  //   });
  // }  

  // calculateNewFps(exp: number) {
  //   return 0.25 * (1.15 ** exp);
  // }

  updatePlaybackSpeed(newValue: number) {
    this.setState({
      // playback_fps_slider_value: sliderValue,
      playback_fps: newValue,
    })  
  }  

  movesUpdate(parseError: string, newMoves: Array<Move>) {
    this.playbackPause();
    if (parseError) {
      this.setState({
        moves_parsing_error: parseError,
        moves: [Move.Start] as Array<Move>,
        current_move_num: 0,
        frames: this.state.frames.slice(0, 1),
      })
    } else {
      this.setState({
        moves_parsing_error: "",
        moves: newMoves,
        current_move_num: 0,
        frames: this.state.frames.slice(0, 1),
      })
    }

  }

  render() {


    return (
      <div className="visualiser">
        <Menu
          stepForward={this.stepForward.bind(this)}
          stepBackward={this.stepBackward.bind(this)}
          // generateStartingState={this.generateStartingState.bind(this)}
          generateStartingStateWithInputString={this.generateStartingStateWithInputString.bind(this)}
          inputArgs={this.state.frames[0].stack_a}
          inputArgsParseError={this.state.input_string_parsing_error}
          inputArgsUpdate={this.inputArgsUpdate.bind(this)}

          moves={this.state.moves}
          movesParseError={this.state.moves_parsing_error}
          movesUpdate={this.movesUpdate.bind(this)}

          // getMoves={this.getMoves.bind(this)}
          programStdout={this.state.stdout}
          programStderr={this.state.stderr}
          programParsedMoves={this.state.moves}
          playbackPause={this.playbackPause.bind(this)}
          playbackPlayForward={this.playbackPlayForward.bind(this)}
          playbackPlayBackward={this.playbackPlayBackward.bind(this)}
          updatePlaybackSpeed={this.updatePlaybackSpeed.bind(this)}
          // playbackFpsRounded={parseFloat(this.state.playback_fps.toPrecision(2))}
          // playbackFpsSliderValue={this.state.playback_fps_slider_value}
          playbackMaxFrameCount={this.state.moves.length - 1}
          playbackCurrentFrameNumber={this.state.current_move_num}
          playbackJumpToFrameNumber={this.playbackJumpToFrameNumber.bind(this)}
        />
        <Moves
          moves={this.state.moves}
          current_move_num={this.state.current_move_num}
          jumpToMoveNumber={this.playbackJumpToFrameNumber.bind(this)}
        />
        <div className="stack-spacer"></div>
        <Stack
          values={this.state.frames[this.state.current_move_num].stack_a}
          min_value={this.state.min_value}
          max_value={this.state.max_value}
          num_values={this.state.num_values}
          title="Stack A"/>
        <div className="stack-spacer"></div>
        <Stack
          values={this.state.frames[this.state.current_move_num].stack_b}
          min_value={this.state.min_value}
          max_value={this.state.max_value}
          num_values={this.state.num_values}
          title="Stack B"/>
        <div className="stack-spacer"></div>
      </div>
    )
  }
}

export default Visualiser