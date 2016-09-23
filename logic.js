var set = require('./set');

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

function isVacantRing(state, coord) {
  return state.rings.has(coord) &&
        !state.red.has(coord) &&
        !state.blue.has(coord);
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

function candidateRings(state) {
  var r = set();
  state.rings.forEach(function (coord) {
    if (ringCanBeMoved(state, coord)
        && !ringSelected(state, coord)
        && !ringMovedLastTurn(state, coord)) {
      r.add(coord);
    }
  });
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

function initial() {
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


module.exports = {
  validRingDest: validRingDest,
  validMoves: validMoves,
  ringSelected: ringSelected,
  candidateRings: candidateRings,
  initial: initial
}
