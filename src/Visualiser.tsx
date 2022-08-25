import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import "./Visualiser.css";

import { VariableSizeList as List} from "react-window";
import { isParenthesizedExpression } from 'typescript';

interface IBarProps {
  value: number,
  key: number,
  max_value: number,
  num_values: number,
  available_width: number,
  available_height: number,
}

interface IBarState {

}

class Bar extends React.PureComponent<IBarProps, IBarState> {
  constructor(props: IBarProps) {
    super(props)
    this.state = {
    }
  }
  render() {
    const width: number = (this.props.value + 1) * this.props.available_width / this.props.max_value;
    const height: number = Math.max(0, Math.min(50, this.props.available_height / this.props.num_values));
    const hue: number = 240 - (240 / Math.max(1, (this.props.max_value - 1))* this.props.value);
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
    
  const renderBar = (val: number, key: number, max_value: number, num_values: number, stack_width: number, stack_height: number) => {
    return (
      <Bar
        value={val}
        key={key}
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
          {values.map((elem) => renderBar(elem, elem, props.max_value, props.num_values, stackSize.width, stackSize.height))}
        </ul>
      </div>
    </div>
  );
}

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

interface INumberFormProps {
  generateStartingState: (n: number) => void,
}

interface INumberFormState {
  value: string,
}

class NumberForm extends React.Component<INumberFormProps, INumberFormState> {
  constructor(props: INumberFormProps) {
    super(props);
    this.state = {
      value: "10",
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({
      value: event.currentTarget.value,
    })
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let parsed_value = parseInt(this.state.value);
    if (isNaN(parsed_value)) {
      this.props.generateStartingState(10);
      this.setState({
        value: "10",
      })
    } else {
      this.props.generateStartingState(parsed_value);
    }
  }
  
  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Number of elements:
          <br/>
          <input type="text" value={this.state.value} onChange={this.handleChange}/>
        </label>
        <br/>
        <input type="submit" value="Generate stack to be sorted"/>
      </form>

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
}

class MenuInputArgs extends React.Component<IMenuInputArgsProps, IMenuInputArgsState> {
  constructor(props: IMenuInputArgsProps) {
    super(props)
    this.state = {
      inputArgsGeneratorNumberString: this.props.inputArgs.length.toString(),
      inputArgsEntryString: this.inputArgsToString(this.props.inputArgs),
      // // inputArgsEntryStringParseError: false,
      manualEntryUnlocked: false,
    }

    this.handleInputArgsGeneratorNumberChange = this.handleInputArgsGeneratorNumberChange.bind(this);
    this.handleInputArgsGeneratorSubmit = this.handleInputArgsGeneratorSubmit.bind(this);
    this.unlockRawInputArgsEntry = this.unlockRawInputArgsEntry.bind(this);
    this.handleInputArgManualEntryChange = this.handleInputArgManualEntryChange.bind(this);
  }

  handleInputArgsGeneratorNumberChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({
      inputArgsGeneratorNumberString: event.currentTarget.value,
    })
  }

  handleInputArgsGeneratorSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    const parsedValue = parseInt(this.state.inputArgsGeneratorNumberString)
    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      this.props.updateInputArgs("<Error: Args not generated>", [] as Array<number>)
      if (Number.isNaN(parsedValue)) {
        this.setState({
          inputArgsEntryString: "<Error: Number of elements is not a number>"
        })
      } else if (parsedValue < 0) {
        this.setState({
          inputArgsEntryString: "<Error: Number of elements is negative>"
        })
      } else {
        this.setState({
          inputArgsEntryString: "<Error: Undefined error>",
        })
      }
    } else {
      const newArr = this.generateShuffledArgs(parsedValue)
      this.props.updateInputArgs("", newArr)
      this.setState({
        inputArgsGeneratorNumberString: parsedValue.toString(),
        inputArgsEntryString: this.inputArgsToString(newArr),
      })
    }
  }

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

  render() {
    return (
      <div className="menu-input-args">
        <h4>Data Controls</h4>
        <label htmlFor="input-args-generator-number">
          Number of elements:
        </label>
        <input
          type="text"
          name="input-args-generator-number"
          value={this.state.inputArgsGeneratorNumberString}
          onChange={this.handleInputArgsGeneratorNumberChange}
        />
        <button onClick={this.handleInputArgsGeneratorSubmit}>
          Generate new stack
        </button>
        <br/>
        <br/>
        <label htmlFor="input-args-raw">
          Raw input arguments:
        </label>
        <input
          type="text"
          name="input-args-raw"
          value={this.state.inputArgsEntryString}
          disabled={this.state.manualEntryUnlocked ? false : true}
          onChange={this.handleInputArgManualEntryChange}
        />
        <button onClick={this.unlockRawInputArgsEntry}>
          Lock/unlock manual entry
        </button>
        <br/>
        <br/>
        <label htmlFor="input-args-parsed">
          Parsed input arguments:
        </label>
        <input
          type="text"
          name="input-args-parsed"
          value={this.props.inputArgsParseError ? this.props.inputArgsParseError : this.props.inputArgs.join(" ")}
          disabled={true}
        />
      </div>

    )
  }
}

interface IMenuMovesSourcePythonLinkerProps {
  inputArgs: Array<number>,
  updateMoves: (parseError: string, moves: Array<Move>) => void,
}

interface IMenuMovesSourcePythonLinkerState {
  stdout: string,
  stderr: string,
}

class MenuMovesSourcePythonLinker extends React.Component<IMenuMovesSourcePythonLinkerProps, IMenuMovesSourcePythonLinkerState> {
  constructor(props: IMenuMovesSourcePythonLinkerProps) {
    super(props)
    this.state = {
      stdout: "",
      stderr: "",
    }
  }

  // TODO: Make python linker take raw text and check that the linker gives appropriate error responses for invalid input arguments

  generateQueryUrl(nums: Array<number>) {
    const url = "http://127.0.0.1:8080?" + nums.join(",");
    return url;
  }

  stringToMove(str: string): Move | null {
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

  getMoves() {
    const url = this.generateQueryUrl(this.props.inputArgs);
    fetch(url).then((response) => {
      return response.text();
    }).then((text) => {
      const data = JSON.parse(text);
      const stdout: string = data.stdout
      const stderr: string = data.stderr;
      const moves = stdout.trim().split("\n").map((elem: string) => this.stringToMove(elem));
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
        return ([parseError, [] as Array<Move>]);
      } else {
        const moves_with_start: Array<Move> = [Move.Start, ...moves_without_null];
        this.setState({
          // moves: moves_with_start,
          stdout: stdout,
          stderr: stderr,
        })
        return [parseError, moves_with_start];
      }  
    }).catch(() => {
      console.log("Error running linker (timeout? other error?)");
    });
  }  

  render() {
    return (
      <div>
        <div className="menu-moves-sources-description-text">
          <b>Python linker</b><br/>
          Get moves from running a user provided C program.<br/><br/>
          Python program sets up HTTP server which runs temporary API to allow access to C program from this SPA.<br/><br/>
          More info: INSERT LINK<br/>
          Source: INSERT LINK<br/>
        </div>

        <button
          onClick={this.getMoves.bind(this)}
        >
          Get Moves
        </button><br/>

        <label htmlFor="stdout">stdout</label><br/>
        <textarea
          id="stdout"
          value={this.state.stdout}
          disabled={true}
        /><br/>
        <label htmlFor="stderr">stderr</label><br/>
        <textarea
          id="stderr"
          value={this.state.stderr}
          disabled={true}
        /><br/>
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
      inputString: this.props.moves.join("\n"),
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
    }, [] as Array<Move>)
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
        <div className="menu-moves-sources-description-text">
          <b>Manual Entry</b><br/>
          Enter moves manually into box below. Moves separated by new line char.<br/><br/>
          Updates live as entry field is changed.<br/><br/>
          More info: INSERT LINK<br/>
          Source: INSERT LINK<br/>
        </div>
        

        <label htmlFor="movesManualEntryInputField">Moves entry:</label><br/>
        <textarea
          id="movesInput"
          value={this.state.inputString}
          onChange={this.handleMovesInputFieldChange.bind(this)}
        />
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

  handleMovesSourceSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({
      movesSource: event.currentTarget.value,
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
    }
    
    return (
      <div className="menu-moves">
        <h4>Moves Controls</h4>
        <label htmlFor="moves-source">Select Moves Source</label>
        <select
          id="moves-source"
          name="moves-source"
          value={this.state.movesSource}
          onChange={this.handleMovesSourceSelectChange}
        >

          <option value="python-linker">Python Linker</option>
          <option value="manual-entry">Manual Entry</option>
          <option value="solution-louissxu">Solution - @louissxu</option>
        </select>

        <br/>
        {movesGenerator}
        <br/>

        <label htmlFor="parsed-moves">Parsed moves</label><br/>
        <textarea
          id="parsed-moves"
          // type="text"
          value={this.props.movesParseError ? this.props.movesParseError : this.props.moves.join("\n")}
          disabled={true}
        /><br/>

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
  playbackFpsRounded: number,
  playbackFpsSliderValue: number,
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

  formatMovesForDisplay(moves: Array<Move>) {
    return (moves.slice(1).join("\n"))
  }

  handleStepForward() {
    this.props.stepForward();
  }

  handleStepBackward() {
    this.props.stepBackward();
  }

  // handleGetMoves() {
  //   this.props.getMoves();
  // }

  handlePlaybackPause() {
    this.props.playbackPause();
  }
  
  handlePlaybackPlayForward() {
    this.props.playbackPlayForward();
  }
  
  handlePlaybackPlayBackward() {
    this.props.playbackPlayBackward();
  }

  handlePlaybackSpeedChange(event: React.FormEvent<HTMLInputElement>) {
    this.props.updatePlaybackSpeed(parseInt(event.currentTarget.value));
  }

  handlePlaybackFrameNumberChange(event: React.FormEvent<HTMLInputElement>) {
    this.props.playbackJumpToFrameNumber(parseInt(event.currentTarget.value));
  }

  render() {
    return (
      <div className="menu-container">
        <h1>Push Swap<br/>Visualiser</h1>
        <h5><a href="https://github.com/louissxu">@louissxu</a></h5> 
        <h5><a href="https://github.com/louissxu/push_swap_visualiser">Github Source</a></h5>
        <h3>Menu</h3>
        <MenuInputArgs
          inputArgs={this.props.inputArgs}
          inputArgsParseError={this.props.inputArgsParseError}
          updateInputArgs={this.handleUpdateInputArgs.bind(this)}
        />
        <MenuMoves
          // moves={this.props.programParsedMoves}
          inputArgs={this.props.inputArgs}
          moves={this.props.moves}
          movesParseError={this.props.movesParseError}
          movesUpdate={this.props.movesUpdate}
        />

        <h4>Playback Controls</h4>
        <button
          onClick={this.handleStepBackward.bind(this)}
        >
          Step Backward
        </button>
        <button
          onClick={this.handleStepForward.bind(this)}
        >
          Step Forward
        </button>
        <br/>
        <label htmlFor="playback-speed">Playback Speed: </label>
        <output>{this.props.playbackFpsRounded} </output>
        fps
        <input
          type="range"
          id="playback-speed"
          name="playback-speed"
          min="0"
          max="60"
          value={this.props.playbackFpsSliderValue.toString()}
          onChange={this.handlePlaybackSpeedChange.bind(this)}
        />
        <br></br>
        <button
          onClick={this.handlePlaybackPlayBackward.bind(this)}
        >
          Play Backwards
        </button>
        <button
          onClick={this.handlePlaybackPause.bind(this)}
        >
          Pause
        </button>
        <button
          onClick={this.handlePlaybackPlayForward.bind(this)}
        >
          Play Forwards
        </button>
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
        />
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
  max_value: number,
  num_values: number,
  playback_fps_slider_value: number,
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
      max_value: Math.max(...this.props.values) + 1,
      num_values: this.props.values.length,
      playback_fps_slider_value: 23,
      playback_fps: this.calculateNewFps(23),
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
    const multiplier: number = Math.ceil(this.state.playback_fps / 60);
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

  calculateNewFps(exp: number) {
    return 0.25 * (1.15 ** exp);
  }

  updatePlaybackSpeed(sliderValue: number) {
    this.setState({
      playback_fps_slider_value: sliderValue,
      playback_fps: this.calculateNewFps(sliderValue),
    })  
  }  

  movesUpdate(parseError: string, newMoves: Array<Move>) {
    if (parseError) {
      this.setState({
        moves_parsing_error: parseError,
        moves: [] as Array<Move>,
      })
    } else {
      this.setState({
        moves_parsing_error: "",
        moves: newMoves,
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
          playbackFpsRounded={parseFloat(this.state.playback_fps.toPrecision(2))}
          playbackFpsSliderValue={this.state.playback_fps_slider_value}
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
          max_value={this.state.max_value}
          num_values={this.state.num_values}
          title="Stack A"/>
        <div className="stack-spacer"></div>
        <Stack
          values={this.state.frames[this.state.current_move_num].stack_b}
          max_value={this.state.max_value}
          num_values={this.state.num_values}
          title="Stack B"/>
        <div className="stack-spacer"></div>
      </div>
    )
  }
}

export default Visualiser