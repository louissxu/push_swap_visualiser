import React from 'react';

interface IBarProps {
  value: number,
  key: number,
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
    return (
      <li>{this.props.value}</li>
    )
  }
}

interface IStackProps {
  values: Array<number>,
}

interface IStackState {
  
}

class Stack extends React.Component<IStackProps, IStackState> {
  constructor(props: IStackProps) {
    super(props)
    this.state = {

    }
  }

  renderBar(val: number, key: number) {
    return (
      <Bar
        value={val}
        key={key}
      />
    );
  }

  render() {
    const values: Array<number> = this.props.values;
    return (
      <ul>
        {values.map((elem) => this.renderBar(elem, elem))}
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
          <input type="text" value={this.state.value} onChange={this.handleChange}/>
        </label>
        <input type="submit" value="Generate stack to be sorted"/>
      </form>

    )
  }
}

interface IMenuProps {
  stepForward: () => void,
  stepBackward: () => void,
  generateStartingState: (n: number) => void,
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

  render() {
    return (
      <div>
        <button
          onClick={this.handleStepForward.bind(this)}
        >
          Step Forward
        </button>
        <button
          onClick={this.handleStepBackward.bind(this)}
        >
          Step Backward
        </button>
        <NumberForm
          generateStartingState={this.props.generateStartingState}
        />
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
      next_move_num: 0
    })
  }

  render() {
    return (
      <div className="visualiser">
        <div className="menu">
          <Menu
            stepForward={this.stepForward.bind(this)}
            stepBackward={this.stepBackward.bind(this)}
            generateStartingState={this.generateStartingState.bind(this)}
          />
        </div>
        <div className="stack_a">
          <Stack values={this.state.stack_a}/>
        </div>
        <div className="stack_b">
          <Stack values={this.state.stack_b}/>
        </div>
        <div className="moves">
          <Moves moves={this.state.moves}/>
        </div>
      </div>
    )
  }
}

export default Visualiser