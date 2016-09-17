require("!style!css!./a.css");

import { h, render, Component } from 'preact';

var width = 50;
var half = 25;
// var translate = function translate(xy) {
//   // isOdd(v) = (v & 1)  but it actually returns 1 'odd' or 0 'even'
//   return [(160 + width*xy[0] + (v & 1)*half),
//           (160 + width*xy[1])]
// }
var cx = function(xy) {return 80 + width*xy[0] + (xy[1] & 1)*half}
var cy = function(xy) {return 80 + 0.9*width*xy[1]}

var initial = function() {
  return {
    rings: new Set([
      /*  */ [1,0], [2,0], [3,0],
      /**/[0,1], [1,1], [2,1], [3,1],
      [0,2], [1,2], [2,2], [3,2], [4,2],
      /**/[0,3], [1,3], [2,3], [3,3],
      /*  */ [1,4], [2,4], [3,4],
    ]),
    red: new Set([[1,0], [4,2], [1,4]]),
    blue: new Set([[3,0], [0,2], [3,4]]),
    event: ["turn-began", "red"]
  };
};

class Ring extends Component {
  render(props) {
    return h(
      'circle',
      {
        cx: cx(props.coord),
        cy: cy(props.coord),
        r: 18,
        fill: "transparent",
        stroke: "grey",
        'stroke-width': "5px",
        key: "ring:"+props.coord
      }
    );
  }
}

class Marble extends Component {
  render(props) {
    return h(
      'circle',
      {
        cx: cx(props.coord),
        cy: cy(props.coord),
        r: 14,
        fill: props.color,
        onClick: props.onSelect,
      }
    )
  }
}

var drawRings = function (bus, state) {
  var r = [];
  state.rings.forEach(function (coord) {
    r.push(h(Ring, {coord:coord}));
  });
  return r;
}

var drawMarbles = function(bus, state, color) {
  var onSelect;
  var r = [];
  state[color].forEach(function (coord) {
    if ((state.event[0] === "turn-began"
          || state.event[0] === "marble-selected")
        && state.event[1] === color) {
      onSelect = function () {
        bus(["marble-selected", color, coord]);
      }
    }
    r.push(h(Marble, {
      color:color,
      coord:coord,
      onSelect:onSelect
    }));
  });
  return r;
}

var lighterColor = {
  "red": "pink",
  "blue": "light-blue"
}
var drawValidMarbleMoves = function(bus, state) {
  var r = [];
  if (state.event[0] === "marble-selected") {
    var color = state.event[1];
    var coord = state.event[2];
    r.push(h(Marble, {
      color:lighterColor[color],
      coord:[2,2],
      onSelect: function () {
        bus(["marble-moved", color, [2,2]]);
      }
    }));
  }
  return r;
}

class Board extends Component {
  componentWillMount() {
    this.setState(initial());
    var component = this;
    this.bus = function(event) {
      console.log.apply(null, event);
      component.state.event = event;
      component.setState(component.state);
    }
  }
  render(props, state) {
    return h('div', null,
      h('svg', {width: 300, height: 300},
        drawRings(this.bus, state),
        drawMarbles(this.bus, state, "red"),
        drawMarbles(this.bus, state, "blue"),
        drawValidMarbleMoves(this.bus, state),
      )
    );
  }
}

render(h(Board), document.body);
