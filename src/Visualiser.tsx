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