import React from 'react';

interface IBarProps {
  value: number,
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
      <li key={this.props.value}>{this.props.value}</li>
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

  renderBar(val: number) {
    return (
      <Bar
        value={val}
      />
    );
  }

  render() {
    const values: Array<number> = this.props.values;
    return (
      <ul>
        {values.map((elem) => this.renderBar(elem))}
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
        {moves.map((move) => {
          return (
            <li>
              {move}
            </li>
          )
        })}
      </ul>
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
  next_move_num: number,
}

class Visualiser extends React.Component<IVisualiserProps, IVisualiserState> {
  constructor(props: IVisualiserProps) {
    super(props)
    this.state = {
      stack_a: this.props.values,
      stack_b: [],
      moves: this.props.moves,
      next_move_num: 0,
    }
  }
  
  psPrimitiveSa () {
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

  psPrimitiveSb () {
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

  psPrimitiveSs () {
    this.psPrimitiveSa();
    this.psPrimitiveSb();
  }

  psPrimitivePa () {
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

  psPrimitivePb () {
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

  psPrimitiveRa () {
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

  psPrimitiveRb () {
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

  psPrimitiveRr () {
    this.psPrimitiveRa();
    this.psPrimitiveRb();
  }

  psPrimitiveRra () {
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

  psPrimitiveRrb () {
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

  psPrimitiveRrr () {
    this.psPrimitiveRra();
    this.psPrimitiveRrb();
  }

  render() {
    return (
      <div className="visualiser">
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