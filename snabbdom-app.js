var snabbdom = require('snabbdom');
var patch = snabbdom.init([
  require('snabbdom/modules/attributes'),
  require('snabbdom/modules/eventlisteners')
]);
var h = require('snabbdom/h');
var flatten = require('lodash/flatten');
var set = require('./set');


var width = 50;
var half = 25;
// var translate = function translate(xy) {
//   // isOdd(v) = (v & 1)  but it actually returns 1 'odd' or 0 'even'
//   return [(160 + width*xy[0] + (v & 1)*half),
//           (160 + width*xy[1])]
// }
var cx = function(xy) {return 80 + width*xy[0] + (xy[1] & 1)*half}
var cy = function(xy) {return 80 + 0.9*width*xy[1]}

var directions = ['ne','e','se','sw','w','nw'];
var steps = {
  ne: function (coord) { return [coord[0]+(coord[1]%2 ? 1 : 0), coord[1]-1]; },
  e: function (coord) { return [coord[0]+1, coord[1]]; },
  se: function (coord) { return [coord[0]+(coord[1]%2 ? 1 : 0), coord[1]+1]; },
  sw: function (coord) { return [coord[0]-(coord[1]%2 ? 0 : 1), coord[1]+1]; },
  w: function (coord) { return [coord[0]-1, coord[1]]; },
  nw: function (coord) { return [coord[0]-(coord[1]%2 ? 0 : 1), coord[1]-1]; },
}

function adjacents(state, coord) {
  var r = set();
  for (var i = 0; i < directions.length; i++) {
    r.add(steps[directions[i]](coord));
  }
  return r;
}

function isVacantRing(state, coord) {
  return state.rings.has(coord) &&
        !state.red.has(coord) &&
        !state.blue.has(coord);
}

function validMoves(state) {
  var coord = state.event[2];
  var moves = set();
  for (var i = 0; i < directions.length; i++) {
    var step = steps[directions[i]];
    var path = [];
    var next = step(coord);
    while (isVacantRing(state, next)) {
      path.push(next);
      next = step(next);
    }
    if (path.length > 0) {
      moves.add(path.pop());
    }
  }
  return moves;
}

function ringCanBeMoved(state, coord) {
  if (!isVacantRing(state, coord)) {
    return false;
  }
  var emptyAdjacents = set();
  var count = 0;
  adjacents(state, coord).forEach(function (c) {
    if (state.rings.has(c)) {
      count++;
    }
    else {
      emptyAdjacents.add(c);
    }
  });
  if (count > 4) {
    return false;
  }

  var foundAdjacentEmpties = false;
  emptyAdjacents.forEach(function (c) {
    if (adjacents(state, c).any(
        function (a) {
          return emptyAdjacents.has(a);
        })
      ) {
      foundAdjacentEmpties = true;
    }
  })
  return foundAdjacentEmpties;
}

function sameCoord(left, right) {
  return left[0] === right[0] && left[1] === right[1];
}

function ringSelected(state, coord) {
  return state.event[0] === "ring-selected"
    && sameCoord(state.event[2], coord)
}

function ringMovedLastTurn(state, coord) {
  return state.last_ring_move
    && sameCoord(state.last_ring_move[2], coord)
}

var initial = function() {
  return {
    rings: set(
      /*  */ [1,0], [2,0], [3,0],
      /**/[0,1], [1,1], [2,1], [3,1],
      [0,2], [1,2], [2,2], [3,2], [4,2],
      /**/[0,3], [1,3], [2,3], [3,3],
      /*  */ [1,4], [2,4], [3,4],
    ),
    red: set([1,0], [4,2], [1,4]),
    blue: set([3,0], [0,2], [3,4]),
    event: ["turn-began", "red"]
  };
};
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


function rings(state) {
  var r = [];
  state.rings.forEach(function (coord) {
    if(!ringSelected(state, coord)) {
      r.push(ring({coord:coord}));
    }
  });
  return r;
}

function candidateRings(state) {
  var r = [];
  if (state.event[0] === "marble-moved"
    || state.event[0] === "ring-selected") {
    state.rings.forEach(function (coord) {
      if (ringCanBeMoved(state, coord)
          && !ringSelected(state, coord)
          && !ringMovedLastTurn(state, coord)) {
        r.push(ring({
          coord:coord,
          highlight:true,
          event:"ring-selected"}));
      }
    });
  }
  return r;
}

function validRingDest(state, ringToBeMoved) {
  var _once = set();
  var _twice = set();
  var otherRings = set(state.rings);
  otherRings.rm(ringToBeMoved);
  otherRings.forEach(function (coord) {
    adjacents(state, coord).forEach(function (currentCoord) {
      if (!otherRings.has(currentCoord)) {
        if(_once.add(currentCoord)) {
          _twice.add(currentCoord);
        }
      }
    });
  });
  _twice.rm(ringToBeMoved);
  if (state.last_ring_move) {
    _twice.rm(state.last_ring_move[1])
  }
  return _twice;
}

function potentialRings(state) {
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

function lastRingMove(state) {
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

function marbles(state, color) {
  var selectable;
  var r = [];
  state[color].forEach(function (coord) {
    selectable =
      (state.event[0] === "turn-began"
          || state.event[0] === "marble-selected")
        && state.event[1] === color
    ;
    r.push(marble({
      color:color,
      coord:coord,
      event:selectable ? "marble-selected":null
    }));
  });
  return r;
}

function potentialMarbles(state) {
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


view = function view(state) {
  return h('div', [
    h('svg', {attrs: {width: 400, height: 400}}, flatten([
      rings(state),
      candidateRings(state),
      potentialRings(state),
      lastRingMove(state),
      marbles(state, "red"),
      marbles(state, "blue"),
      potentialMarbles(state),
    ])
    )
  ]);
}

window.addEventListener('DOMContentLoaded', () => {
  var container = document.getElementById('app');
  vnode = patch(container, view(state));
  // render();
});
