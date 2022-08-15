import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import "./Visualiser.css";

import { FixedSizeList as List} from "react-window";

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

interface IMovesProps {
  moves: Array<Move>
  current_move_num: number
}

const Moves = (props: IMovesProps) => {
  const listRef = useRef<List>(null);

  const scrollElementIndex = Math.max(0, props.current_move_num - 5);
  const executeScroll = () => {
    if (listRef.current) {
      listRef.current.scrollToItem(scrollElementIndex, "start");
    }
  }

  useEffect(() => {
    executeScroll();
  })

  const NewMovesRow = ({index, style}: {index: number, style: CSSProperties}) => {
    return (
      <div
        style={style}
      >
        <MovesRow
          key={index}
          move={props.moves[index]}
          move_number={index}
          is_current={index === props.current_move_num ? true : false}
        />
      </div>
    )
  }

  return (
    <div className="moves-container">
      <h3>Moves</h3>
      <h5>Number of Moves: {Math.max(0, props.moves.length - 1)}</h5> 
      <h5>Current Move Number: {props.current_move_num}</h5>
      <List
        className="moves-data"
        height={1000}
        width={100}
        itemCount={props.moves.length}
        itemSize={20}
        ref={listRef}
      >
        {NewMovesRow}
      </List>
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

interface IMenuProps {
  stepForward: () => void,
  stepBackward: () => void,
  generateStartingState: (n: number) => void,
  getMoves: () => void,
  playbackPause: () => void,
  playbackPlayForward: () => void,
  playbackPlayBackward: () => void,
  updatePlaybackSpeed: (newValue: number) => void,
  playbackFps: number,
  playbackMaxFrameCount: number,
  playbackCurrentFrameNumber: number,
  updatePlaybackFrameNumber: (newValue: number) => void,
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
    this.props.updatePlaybackFrameNumber(parseInt(event.currentTarget.value));
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
        <output>{this.props.playbackFps} </output>
        fps
        <input
          type="range"
          id="playback-speed"
          name="playback-speed"
          min="1"
          max="100"
          value={this.props.playbackFps.toString()}
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
  playback_dir: number,
  playback_current_loop: null | ReturnType<typeof setTimeout>,
  frames: Array<Frame>
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
      playback_dir: 0,
      playback_current_loop: null,
      frames: [{stack_a: this.props.values, stack_b: [] as Array<number>}],
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

  psPrimitiveSs() {
    this.psPrimitiveSa();
    this.psPrimitiveSb();
  }

  psPrimitiveSsFunctional(frame: Frame): Frame {
    return this.psPrimitiveSaFunctional(this.psPrimitiveSbFunctional(frame));
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

  psPrimitiveRr() {
    this.psPrimitiveRa();
    this.psPrimitiveRb();
  }

  psPrimitiveRrFunctional(frame: Frame): Frame {
    return this.psPrimitiveRaFunctional(this.psPrimitiveRbFunctional(frame));
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

  psPrimitiveRrr() {
    this.psPrimitiveRra();
    this.psPrimitiveRrb();
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
    } else {
      this.playbackPause();
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
    } else {
      this.playbackPause();
    }
  }

  // timeout(delay: number) {
  //   return new Promise((res) => setTimeout(res, delay));
  // }

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
      this.stepForward();
    } else if (this.state.playback_dir === -1) {
      this.stepBackward();
    }

    const new_playback_loop = setTimeout(() => {
      this.doPlayback()
    }, 1000 / this.state.playback_fps)
    this.setState({
      playback_current_loop: new_playback_loop,
    })
  }

  // playBackward() {
  //   if (this.state.current_move_num)
  // }

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
    this.playbackPause();
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
      frames: [{stack_a: new_stack_a, stack_b: [] as Array<number>}]
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
    this.playbackPause();
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

  updatePlaybackFrameNumber(newFrame: number) {
    if (this.state.frames.length > newFrame) {
      this.setState({
        stack_a: this.state.frames[newFrame].stack_a,
        stack_b: this.state.frames[newFrame].stack_b,
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
      stack_a: frame.stack_a,
      stack_b: frame.stack_b,
      current_move_num: newFrame,
    })


    // const frameDelta = newFrame - this.state.current_move_num;
    // let i = 0;
    // while (this.state.current_move_num + i < newFrame) {
    //   console.log("executing move number: " + (this.state.current_move_num + i).toString())
    //   this.executeMove(this.state.moves[this.state.current_move_num + 1 + i])
    //   i++;
    // }
    // while (this.state.current_move_num + i > newFrame) {
    //   this.executeReverseMove(
    //     this.state.moves[this.state.current_move_num + i],
    //     this.state.skipped_moves[this.state.current_move_num + i]
    //   )
    //   i--;
    // }
    // this.setState({
    //   current_move_num: newFrame,
    // })
    // if (newFrame === 0 || newFrame === this.state.moves.length)
    // {
    //   this.playbackPause();
    // }
    // console.log(i);

    // for (let i = 0; i < frameDelta; i++) {
    //   this.stepForward();
    // }
    // for (let i = 0; i > frameDelta; i--) {
    //   this.stepBackward();
    // }
    // this.setState({
    //   current_move_num: newFrame,
    // })
  }

  render() {
    return (
      <div className="visualiser">
        <Menu
          stepForward={this.stepForward.bind(this)}
          stepBackward={this.stepBackward.bind(this)}
          generateStartingState={this.generateStartingState.bind(this)}
          getMoves={this.getMoves.bind(this)}
          playbackPause={this.playbackPause.bind(this)}
          playbackPlayForward={this.playbackPlayForward.bind(this)}
          playbackPlayBackward={this.playbackPlayBackward.bind(this)}
          updatePlaybackSpeed={this.updatePlaybackSpeed.bind(this)}
          playbackFps={this.state.playback_fps}
          playbackMaxFrameCount={this.state.moves.length - 1}
          playbackCurrentFrameNumber={this.state.current_move_num}
          updatePlaybackFrameNumber={this.updatePlaybackFrameNumber.bind(this)}
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