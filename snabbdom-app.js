var snabbdom = require('./snabbdom/snabbdom');
var patch = snabbdom.init([
  require('./snabbdom/modules/attributes'),
  require('./snabbdom/modules/eventlisteners')
]);
var h = require('snabbdom/h');
var set = require('./set');
import {
  validMoves,
  ringSelected,
  candidateRings,
  validRingDest,
  initial
} from './logic';


var width = 44;
var half = 22;
// var translate = function translate(xy) {
//   // isOdd(v) = (v & 1)  but it actually returns 1 'odd' or 0 'even'
//   return [(160 + width*xy[0] + (v & 1)*half),
//           (160 + width*xy[1])]
// }
var cx = function(xy) {return 80 + width*xy[0] + (xy[1] & 1)*half}
var cy = function(xy) {return 80 + 0.9*width*xy[1]}

var state = initial();

var vnode, view;
function render() {
  vnode = patch(vnode, view(state));
}

function handler(e, color, coord) {
  color = color || state.event[1];
  console.log(e, color, coord);
  if (e === "marble-moved") {
    state[color].rm(state.event[2]);
    state[color].add(coord);
  }
  if (e === "ring-moved") {
    state.rings.rm(state.event[2]);
    state.rings.add(coord);
    state.last_ring_move = [color, state.event[2], coord];

    state.event = ["turn-began", color === "red" ? "blue" : "red"]
  }
  else {
    state.event = [e, color, coord];
  }
  render();
}


function ring(props) {
  return h(
    'circle',
    {
      attrs: {
        cx: cx(props.coord),
        cy: cy(props.coord),
        r: 18,
        fill: "transparent",
        stroke: props.highlight ? "#bbb" :
          (props.color ? lighterColor[props.color] : "#333"),
        'stroke-width': props.feint ? "1px" : "5px",
        'stroke-dasharray': (props.highlight || props.feint) ? "5,5" : "0"
      },
      on: props.event ? {click: [handler, props.event, undefined, props.coord]} : null
    }
  );
}


function drawRings(state) {
  var r = [];
  state.rings.forEach(function (coord) {
    if(!ringSelected(state, coord)) {
      r.push(ring({coord:coord}));
    }
  });
  return r;
}

function drawCandidateRings(state) {
  var r = [];
  if (state.event[0] === "marble-moved"
    || state.event[0] === "ring-selected") {
    candidateRings(state).forEach(function (coord) {
      r.push(ring({
        coord:coord,
        highlight:true,
        event:"ring-selected"}));
    });
  }
  return r;
}

function drawPotentialRings(state) {
  var r = [];
  if (state.event[0] === "ring-selected") {
    validRingDest(state, state.event[2]).forEach(function (coord) {
      r.push(ring({
        coord:coord,
        highlight:true,
        event:"ring-moved"
      }));
    })
  }
  return r;
}

function drawLastRingMove(state) {
  if (state.last_ring_move) {
    return [
      ring({
        coord:state.last_ring_move[1],
        color:state.last_ring_move[0],
        feint:true,
      }),
      ring({
        coord:state.last_ring_move[2],
        color:state.last_ring_move[0],
        feint:true,
      })
    ];
  }
  return [];
}


var lighterColor = {
  "red": "pink",
  "blue": "lightblue"
}
function marble(props) {
  return h(
    'circle',
    {
      attrs: {
        cx: cx(props.coord),
        cy: cy(props.coord),
        r: 14,
        fill: props.lighten ? lighterColor[props.color] : props.color
      },
      on: props.event ? {click: [handler, props.event, props.color, props.coord]} : null
    }
  )
}

function drawMarbles(state, color) {
  var r = [];
  var selectable =
    (state.event[0] === "turn-began"
        || state.event[0] === "marble-selected")
      && state.event[1] === color
  ;
  state[color].forEach(function (coord) {
    r.push(marble({
      color:color,
      coord:coord,
      event:selectable ? "marble-selected":null
    }));
  });
  return r;
}

function drawPotentialMarbles(state) {
  var r = [];
  if (state.event[0] === "marble-selected") {
    var color = state.event[1];
    validMoves(state).forEach(function (coord) {
      r.push(marble({
        color:color,
        lighten:true,
        coord:coord,
        event: "marble-moved"
      }));
    });
  }
  return r;
}

function flatten() {
  var r = [];
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    for (var j = 0; j < arg.length; j++) {
      r.push(arg[j]);
    }
  }
  return r;
}

view = function view(state) {
  return h('div', [
    h('p', {attrs: {style: "color:"+state.event[1]}}, [
      "Turn: " + state.event[1]
    ]),
    h('svg', {attrs: {width: 400, height: 400}}, flatten(
      drawRings(state),
      drawCandidateRings(state),
      drawPotentialRings(state),
      drawLastRingMove(state),
      drawMarbles(state, "red"),
      drawMarbles(state, "blue"),
      drawPotentialMarbles(state),
    ))
  ]);
}

window.addEventListener('DOMContentLoaded', () => {
  var container = document.getElementById('app');
  vnode = patch(container, view(state));
  // render();
});
