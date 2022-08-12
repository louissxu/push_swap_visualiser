import React, { useState, useRef, useEffect } from 'react';
import "./Visualiser.css";

interface IBarProps {
  value: number,
  key: number,
  max_value: number,
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
    const height: number = Math.max(0, Math.min(50, this.props.available_height / this.props.max_value));
    const hue: number = 240 - (240 / this.props.max_value * this.props.value);
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
    
  const renderBar = (val: number, key: number, max_value: number, stack_width: number, stack_height: number) => {
    return (
      <Bar
        value={val}
        key={key}
        max_value={max_value}
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
          {values.map((elem) => renderBar(elem, elem, props.max_value, stackSize.width, stackSize.height))}
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
    // console.log("rendering move number: " + this.props.move_number + this.props.is_current);
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
  }
}

// interface IMovesCountProps {
//   current_move_number: number
// }

// interface IMovesCountState {

// }

// class MovesCount extends React.PureComponent<IMovesCountProps, IMovesCountState> {
//   constructor(props: IMovesCountProps) {
//     super(props)
//     this.state = {

//     }
//   }

//   render() {
//     return (
//       <h5>Current Move Number: {this.props.current_move_number}</h5>
//     )
//   }
// }

interface IMovesProps {
  moves: Array<Move>
  current_move_num: number
}

interface IMovesState {
  currentScrollRef: React.RefObject<HTMLDivElement>
  nullScrollRef: React.RefObject<HTMLDivElement>
}

// class Moves extends React.Component<IMovesProps, IMovesState> {
//   constructor(props: IMovesProps) {
//     super(props)
//     this.state = {
//       currentScrollRef: React.createRef(),
//       nullScrollRef: React.createRef()
//     }
//   }
  
//   executeScroll = () => {
//     if (this.state.currentScrollRef.current) {
//       this.state.currentScrollRef.current.scrollIntoView()
//     }
//   }

//   // useEffect(() => {
//   //   this.executeScroll();
//   // }, []);

//   render() {
//     // const moves: Array<Move> = this.props.moves;
//     // const offset = this.state.moves_display_offset;

//     // const movesSubset = this.props.moves.slice(offset, offset + 100)
//     // console.log(this.props.current_move_num);
//     return (
//       <div className="moves-container">
//         <h3>Moves</h3>
//         <h5>Number of Moves: {Math.max(0, this.props.moves.length - 1)}</h5> 
//         {/* <MovesCount
//           current_move_number={this.props.current_move_num}
//         /> */}
//         <h5>Current Move Number: {this.props.current_move_num}</h5>
//         <ul className="moves-data">
//           {this.props.moves.map((move, index) => {
//             return (
//               <div ref={index === this.props.current_move_num ? this.state.currentScrollRef : this.state.nullScrollRef}>
//                 <MovesRow
//                 // key={index.toString() + (index === this.props.current_move_num ? "t" : "f")}
//                 key={index}
//                 move={move}
//                 move_number={index}
//                 is_current={index === this.props.current_move_num ? true : false}
//                 />
//               </div>
//             )
//           })}
//         </ul>
//       </div>
//     )
//   }
// }

const Moves = (props: IMovesProps) => {
  const currentScrollRef = useRef<HTMLDivElement>(null);
  const nullScrollRef = useRef<HTMLDivElement>(null);

  const scrollElementIndex = Math.max(0, props.current_move_num - 5)
  const executeScroll = () => {
    if (currentScrollRef.current) {
      currentScrollRef.current.scrollIntoView()
    }
  }

  useEffect(() => {
    executeScroll();
  })

  return (
    <div className="moves-container">
      <h3>Moves</h3>
      <h5>Number of Moves: {Math.max(0, props.moves.length - 1)}</h5> 
      {/* <MovesCount
        current_move_number={this.props.current_move_num}
      /> */}
      <h5>Current Move Number: {props.current_move_num}</h5>
      <ul className="moves-data">
        {props.moves.map((move, index) => {
          return (
            <div ref={index === scrollElementIndex ? currentScrollRef : nullScrollRef}>
              <MovesRow
              // key={index.toString() + (index === this.props.current_move_num ? "t" : "f")}
              key={index}
              move={move}
              move_number={index}
              is_current={index === props.current_move_num ? true : false}
              />
            </div>
          )
        })}
      </ul>
    </div>
  )
}

// const Moves = (props: IMovesProps) => {
//   const [displayOffset, setDisplayOffset] = useState(0);
//   const movesSubset = props.moves.slice(displayOffset, displayOffset + 100)

//   const handleScroll = (e) => {
//     console.log("scrolling");
//     console.log("scrolling: ", e.currentTarget.scrolling);
//     console.log("scrollTop: ", e.currentTarget.scrollTop);
//     console.log("offsetHeight: ", e.currentTarget.offsetHeight);
//   }

//   return (
//     <div className="moves-container" ref={targetRef}>
//       <h3>Moves</h3>
//       <h5>Number of Moves: {Math.max(0, props.moves.length - 1)}</h5> 
//       <h5>Current Move Number: {props.current_move_num}</h5>
//       <ul className="moves-data">
//         {movesSubset.map((move, index) => {
//           return (
//             <MovesRow
//               key={index + displayOffset}
//               move={move}
//               move_number={index + displayOffset}
//               is_current={index + displayOffset === props.current_move_num ? true : false}
//             />
//           )
//         })}
//       </ul>
//     </div>
//   )
// }

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

interface IMenuProps {
  stepForward: () => void,
  stepBackward: () => void,
  generateStartingState: (n: number) => void,
  getMoves: () => void,
  playForward: () => void,
  updatePlaybackSpeed: (newValue: number) => void,
  playbackFps: number,
}

interface IMenuState {

}

class Menu extends React.Component<IMenuProps, IMenuState> {
  constructor(props: IMenuProps) {
    super(props)
    this.state = {

    }
  }

  handleStepForward() {
    this.props.stepForward();
  }

  handleStepBackward() {
    this.props.stepBackward();
  }

  handleGetMoves() {
    this.props.getMoves();
  }

  handlePlayForward() {
    this.props.playForward();
  }

  handlePlaybackSpeedChange(event: React.FormEvent<HTMLInputElement>) {
    this.props.updatePlaybackSpeed(parseInt(event.currentTarget.value));
  }

  render() {
    return (
      <div className="menu-container">
        <h1>Push Swap<br/>Visualiser</h1>
        <h5><a href="https://github.com/louissxu">@louissxu</a></h5> 
        <h5><a href="https://github.com/louissxu/push_swap_visualiser">Github Source</a></h5>
        <h3>Menu</h3>
        <h4>Data Controls</h4>
        <NumberForm
          generateStartingState={this.props.generateStartingState}
        />
        <button
          onClick={this.handleGetMoves.bind(this)}
        >
          Get Moves
        </button>
        <h4>Playback Controls</h4>
        <button
          onClick={this.handleStepForward.bind(this)}
        >
          Step Forward
        </button>
        <br/>
        <button
          onClick={this.handleStepBackward.bind(this)}
        >
          Step Backward
        </button>
        <br/>
        <label htmlFor="playback-speed">Playback FPS:</label>
        <input type="range" id="playback-speed" name="playback-speed" min="1" max="100" value={this.props.playbackFps.toString()} onChange={this.handlePlaybackSpeedChange.bind(this)}></input>
        <output>{this.props.playbackFps}</output>
        <br></br>
        <button
          onClick={this.handlePlayForward.bind(this)}
        >
          Play
        </button>
      </div>
    )
  }
}

interface IVisualiserProps {
  values: Array<number>,
  moves: Array<Move>,
}

interface IVisualiserState {
  starting_stack_a: Array<number>,
  stack_a: Array<number>,
  stack_b: Array<number>,
  moves: Array<Move>,
  skipped_moves: Array<Boolean>,
  current_move_num: number,
  error_parsing_moves: Boolean,
  stdout: string,
  stderr: string,
  max_value: number,
  playback_fps: number,
}

class Visualiser extends React.Component<IVisualiserProps, IVisualiserState> {
  constructor(props: IVisualiserProps) {
    super(props);
    const skipped_moves: Array<boolean> = this.calculateSkippedMoves(this.props.moves, this.props.values.length)
    this.state = {
      starting_stack_a: this.props.values,
      stack_a: this.props.values,
      stack_b: [],
      moves: this.props.moves,
      skipped_moves: skipped_moves,
      current_move_num: 0,
      error_parsing_moves: false,
      stdout: "",
      stderr: "",
      max_value: this.props.values.length,
      playback_fps: 10,
    }
  }
  
  calculateSkippedMoves (moves: Array<Move>, number_of_values: number): Array<boolean> {
    let left_length = number_of_values;
    let right_length = 0;
    const skipped_moves = []
    for (let i = 0; i < moves.length; i++) {
      if (moves[i] === Move.Pa) {
        if (right_length > 0) {
          right_length--;
          left_length++;
          skipped_moves.push(false);
        } else {
          skipped_moves.push(true);
        }
      } else if (moves[i] === Move.Pb) {
        if (left_length > 0) {
          left_length--;
          right_length++;
          skipped_moves.push(false);
        } else {
          skipped_moves.push(true);
        }
      } else {
        skipped_moves.push(false);
      }
    }
    return skipped_moves;
  }
  
  psPrimitiveSa() {
    if (this.state.stack_a.length <= 1) {
      return;
    }
    const new_stack_a: Array<number>= this.state.stack_a.slice(1, 2).concat(
      this.state.stack_a.slice(0, 1),
      this.state.stack_a.slice(2),
    );
    this.setState({
      stack_a: new_stack_a,
    })
  }

  psPrimitiveSb() {
    if (this.state.stack_b.length <= 1) {
      return;
    }
    const new_stack_b: Array<number> = this.state.stack_b.slice(1, 2).concat(
      this.state.stack_b.slice(0, 1),
      this.state.stack_b.slice(2),
    );
    this.setState({
      stack_b: new_stack_b,
    })
  }

  psPrimitiveSs() {
    this.psPrimitiveSa();
    this.psPrimitiveSb();
  }

  psPrimitivePa() {
    if (this.state.stack_b.length <= 0) {
      return;
    }
    const new_stack_a: Array<number> = this.state.stack_b.slice(0, 1).concat(
      this.state.stack_a.slice(),
    )
    const new_stack_b: Array<number> = this.state.stack_b.slice(1);
    this.setState({
      stack_a: new_stack_a,
      stack_b: new_stack_b,
    })
  }

  psPrimitivePb() {
    if (this.state.stack_a.length <= 0) {
      return;
    }
    const new_stack_a: Array<number> = this.state.stack_a.slice(1);
    const new_stack_b: Array<number> = this.state.stack_a.slice(0, 1).concat(
      this.state.stack_b.slice(),
    );
    this.setState({
      stack_a: new_stack_a,
      stack_b: new_stack_b,
    })
  }

  psPrimitiveRa() {
    if (this.state.stack_a.length <= 0) {
      return;
    }
    const new_stack_a: Array<number> = this.state.stack_a.slice(1).concat(
      this.state.stack_a.slice(0, 1),
    );
    this.setState({
      stack_a: new_stack_a,
    })
  }

  psPrimitiveRb() {
    if (this.state.stack_b.length <= 0) {
      return;
    }
    const new_stack_b: Array<number> = this.state.stack_b.slice(1).concat(
      this.state.stack_b.slice(0, 1),
    );
    this.setState({
      stack_b: new_stack_b,
    })
  }  

  psPrimitiveRr() {
    this.psPrimitiveRa();
    this.psPrimitiveRb();
  }

  psPrimitiveRra() {
    if (this.state.stack_a.length <= 0) {
      return;
    }
    const new_stack_a: Array<number> = this.state.stack_a.slice(-1).concat(
      this.state.stack_a.slice(0, -1),
    );
    this.setState({
      stack_a: new_stack_a,
    })
  }

  psPrimitiveRrb() {
    if (this.state.stack_b.length <= 0) {
      return;
    }
    const new_stack_b: Array<number> = this.state.stack_b.slice(-1).concat(
      this.state.stack_b.slice(0, -1),
    );
    this.setState({
      stack_b: new_stack_b,
    })
  }

  psPrimitiveRrr() {
    this.psPrimitiveRra();
    this.psPrimitiveRrb();
  }

  executeMove(move: Move) {
    switch(move){
      case Move.Sa:
        this.psPrimitiveSa();
        break;
      case Move.Sb:
        this.psPrimitiveSb();
        break;
      case Move.Ss:
        this.psPrimitiveSs();
        break;
      case Move.Pa:
        this.psPrimitivePa();
        break;
      case Move.Pb:
        this.psPrimitivePb();
        break;
      case Move.Ra:
        this.psPrimitiveRa();
        break;
      case Move.Rb:
        this.psPrimitiveRb();
        break;
      case Move.Rr:
        this.psPrimitiveRr();
        break;
      case Move.Rra:
        this.psPrimitiveRra();
        break;
      case Move.Rrb:
        this.psPrimitiveRrb();
        break;
      case Move.Rrr:
        this.psPrimitiveRrr();
        break;
    }
  }

  executeReverseMove(move: Move, skipped: Boolean) {
    if (skipped === true) {
      return;
    }
    switch(move){
      case Move.Sa:
        this.psPrimitiveSa();
        break;
      case Move.Sb:
        this.psPrimitiveSb();
        break;
      case Move.Ss:
        this.psPrimitiveSs();
        break;
      case Move.Pa:
        this.psPrimitivePb();
        break;
      case Move.Pb:
        this.psPrimitivePa();
        break;
      case Move.Ra:
        this.psPrimitiveRra();
        break;
      case Move.Rb:
        this.psPrimitiveRrb();
        break;
      case Move.Rr:
        this.psPrimitiveRrr();
        break;
      case Move.Rra:
        this.psPrimitiveRa();
        break;
      case Move.Rrb:
        this.psPrimitiveRb();
        break;
      case Move.Rrr:
        this.psPrimitiveRr();
        break;
    }
  }

  stepForward() {
    if (this.state.current_move_num < this.state.moves.length - 1) {
      this.executeMove(this.state.moves[this.state.current_move_num + 1]);
      this.setState({
        current_move_num: this.state.current_move_num + 1,
      });
    }
  }

  stepBackward() {
    if (this.state.current_move_num > 0) {
      this.executeReverseMove(
        this.state.moves[this.state.current_move_num], 
        this.state.skipped_moves[this.state.current_move_num]
      )
      this.setState({
        current_move_num: this.state.current_move_num - 1,
      });
    }
  }

  timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }

  playForward() {
    if (this.state.current_move_num < this.state.moves.length - 1) {
      setTimeout(() => {
        this.stepForward();
        this.playForward();
      }, 1000 / this.state.playback_fps);
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
  generateStartingState(n: number) {
    // console.log(n);
    const new_stack_a = Array.from(Array(n).keys());
    this.shuffle(new_stack_a);
    const new_stack_b: Array<number> = [];
    const new_moves: Array<Move> = [];
    this.setState({
      starting_stack_a: new_stack_a,
      stack_a: new_stack_a,
      stack_b: new_stack_b,
      moves: new_moves,
      skipped_moves: [],
      current_move_num: 0,
      max_value: new_stack_a.length,
    })
  }

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
    const url = this.generateQueryUrl(this.state.starting_stack_a);
    this.setState({
      stack_a: this.state.starting_stack_a,
      stack_b: [],
      current_move_num: 0,
    })
    fetch(url).then((response) => {
      return response.text();
    }).then((text) => {
      const data = JSON.parse(text);
      const stdout = data.stdout
      const stderr = data.stderr;
      const moves = stdout.trim().split("\n").map((elem: string) => this.stringToMove(elem));
      if (moves.includes(null)) {
        this.setState({
          moves: [],
          error_parsing_moves: true,
          stdout: stdout,
          stderr: stderr,
          skipped_moves: [],
        })
      } else {
        const moves_with_start = [Move.Start, ...moves];
        this.setState({
          moves: moves_with_start,
          error_parsing_moves: false,
          stdout: stdout,
          stderr: stderr,
          skipped_moves: this.calculateSkippedMoves(moves_with_start, this.state.stack_a.length)
        })
      }
    }).catch(() => {
      console.log("boo");
    });
  }

  updatePlaybackSpeed(newValue: number) {
    this.setState({
      playback_fps: newValue,
    })
  }

  render() {
    return (
      <div className="visualiser">
        <Menu
          stepForward={this.stepForward.bind(this)}
          stepBackward={this.stepBackward.bind(this)}
          generateStartingState={this.generateStartingState.bind(this)}
          getMoves={this.getMoves.bind(this)}
          playForward={this.playForward.bind(this)}
          updatePlaybackSpeed={this.updatePlaybackSpeed.bind(this)}
          playbackFps={this.state.playback_fps}
        />
        <Moves moves={this.state.moves} current_move_num={this.state.current_move_num}/>
        <div className="stack-spacer"></div>
        <Stack values={this.state.stack_a} max_value={this.state.max_value} title="Stack A"/>
        <div className="stack-spacer"></div>
        <Stack values={this.state.stack_b} max_value={this.state.max_value} title="Stack B"/>
        <div className="stack-spacer"></div>
      </div>
    )
  }
}

export default Visualiser