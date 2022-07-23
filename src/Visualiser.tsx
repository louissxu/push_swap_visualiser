import React from 'react';
import "./Visualiser.css";

interface IBarProps {
  value: number,
  key: number,
  max_value: number,
}

interface IBarState {

}

class Bar extends React.Component<IBarProps, IBarState> {
  constructor(props: IBarProps) {
    super(props)
    this.state = {
    }
  }
  render() {
    const width: number = (this.props.value + 1) * 500 / this.props.max_value;
    const height: number = Math.min(Math.max(1000 / this.props.max_value, 1), 50);
    const hue: number = 240 - (240 / this.props.max_value * this.props.value);
    let text: string | null = this.props.value.toString();
    if (height < 10) {
      text = null;
    }
    console.log(hue);
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
}

interface IStackState {
  
}

class Stack extends React.Component<IStackProps, IStackState> {
  constructor(props: IStackProps) {
    super(props)
    this.state = {

    }
  }

  renderBar(val: number, key: number, max_value: number) {
    return (
      <Bar
        value={val}
        key={key}
        max_value={max_value}
      />
    );
  }

  render() {
    const values: Array<number> = this.props.values;
    const max_value: number = this.props.max_value;
    return (
      <ul className="stack">
        {values.map((elem) => this.renderBar(elem, elem, max_value))}
      </ul>
    );
  }
}

export enum Move {
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

interface IMovesProps {
  moves: Array<Move>
}

interface IMovesState {

}

class Moves extends React.Component<IMovesProps, IMovesState> {
  constructor(props: IMovesProps) {
    super(props)
    this.state = {

    }
  }

  render() {
    const moves: Array<Move> = this.props.moves;

    return (
      <ul>
        {moves.map((move, index) => {
          return (
            <li key={index}>
              {move}
            </li>
          )
        })}
      </ul>
    )
  }
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
  playForward: () => void,
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

  render() {
    return (
      <div>
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
        <NumberForm
          generateStartingState={this.props.generateStartingState}
        />
        <button
          onClick={this.handleGetMoves.bind(this)}
        >
          Get Moves
        </button>
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
  stack_a: Array<number>,
  stack_b: Array<number>,
  moves: Array<Move>,
  skipped_moves: Array<Boolean>,
  next_move_num: number,
  error_parsing_moves: Boolean,
  stdout: string,
  stderr: string,
  max_value: number,
}

class Visualiser extends React.Component<IVisualiserProps, IVisualiserState> {
  constructor(props: IVisualiserProps) {
    super(props)
    const skipped_moves: Array<boolean> = []
    let left_length = this.props.values.length;
    let right_length = 0;
    for (let i = 0; i < this.props.moves.length; i++) {
      if (this.props.moves[i] === Move.Pa) {
        if (right_length > 0) {
          right_length--;
          left_length++;
          skipped_moves.push(false);
        } else {
          skipped_moves.push(true);
        }
      } else if (this.props.moves[i] === Move.Pb) {
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
    this.state = {
      stack_a: this.props.values,
      stack_b: [],
      moves: this.props.moves,
      skipped_moves: skipped_moves,
      next_move_num: 0,
      error_parsing_moves: false,
      stdout: "",
      stderr: "",
      max_value: this.props.values.length,
    }
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
    if (this.state.stack_a.length <= 0) {
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
    if (this.state.next_move_num < this.state.moves.length) {
      this.executeMove(this.state.moves[this.state.next_move_num]);
      this.setState({
        next_move_num: this.state.next_move_num + 1,
      });
    }
  }

  stepBackward() {
    if (this.state.next_move_num > 0) {
      this.executeReverseMove(
        this.state.moves[this.state.next_move_num - 1], 
        this.state.skipped_moves[this.state.next_move_num - 1]
      )
      this.setState({
        next_move_num: this.state.next_move_num - 1,
      });
    }
  }

  timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }

  playForward() {
    if (this.state.next_move_num < this.state.moves.length) {
      setTimeout(() => {
        this.stepForward();
        this.playForward();
      }, 1);
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
    console.log(n);
    const new_stack_a = Array.from(Array(n).keys());
    this.shuffle(new_stack_a);
    const new_stack_b: Array<number> = [];
    const new_moves: Array<Move> = [];
    this.setState({
      stack_a: new_stack_a,
      stack_b: new_stack_b,
      moves: new_moves,
      skipped_moves: [],
      next_move_num: 0,
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
    const url = this.generateQueryUrl(this.state.stack_a);
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
        })
      } else {
        this.setState({
          moves: moves,
          error_parsing_moves: false,
          stdout: stdout,
          stderr: stderr,
        })
      }
    }).catch(() => {
      console.log("boo");
    });
  }

  render() {
    return (
      <div className="visualiser">
        <div className="menu">
          <Menu
            stepForward={this.stepForward.bind(this)}
            stepBackward={this.stepBackward.bind(this)}
            generateStartingState={this.generateStartingState.bind(this)}
            getMoves={this.getMoves.bind(this)}
            playForward={this.playForward.bind(this)}
          />
        </div>
        <div className="stack_a">
          <Stack values={this.state.stack_a} max_value={this.state.max_value}/>
        </div>
        <div className="stack_b">
          <Stack values={this.state.stack_b} max_value={this.state.max_value}/>
        </div>
        <div className="moves">
          <Moves moves={this.state.moves}/>
        </div>
      </div>
    )
  }
}

export default Visualiser