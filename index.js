var express = require('express');
var h = require('hyperscript');
var app = module.exports.app = exports.app = express();
var dots = require("dot").process({ path: "."});

app.use(require('connect-livereload')());
app.use(express.static(__dirname + '/public'));

var red = h('span.r', ' ');
var blu = h('span.b', ' ');
var blnk = h('span.b', ' ');
var empt = h('span.e', ' ');
var offs = h('span.offset', ' ');

function Set() {
  this._hash = JSON.stringify;
  this._values = {};
  for(var i = 0; i < arguments.length; ++ i) {
    this.add(arguments[i]);
  }
}
Set.prototype = {
  add: function add(v) {
    if(!this.has(v)) {
      this._values[this._hash(v)] = v;
    }
  },
  rm: function rm(v) {
    if(this.has(v)) {
      delete this._values[this._hash(v)];
    }
  },
  has: function has(v) {
    return typeof this._values[this._hash(v)] !== "undefined";
  }
};

var rings = new Set(
        [1,0], [2,0], [3,0],
    [0,1], [1,1], [2,1], [3,1],
[0,2], [1,2], [2,2]
);
//console.log(rings._values);

function CoordSet() {
  this._v = {};
  this._min = Infinity;
  this._max = -Infinity;
  for(var i = 0; i < arguments.length; ++ i) {
    this.add(arguments[i]);
  }
}
CoordSet.prototype = {
  add: function add(v) {
    if(!this.has(v)){
      this._min = Math.min(this._min, v[0]);
      this._max = Math.max(this._max, v[0]);
      this._v[v[0]] = (v.length > 1) ? new CoordSet(v.slice(1)) : true;
    }
    else if (v.length > 1){
      this._v[v[0]].add(v.slice(1));
    }
  },
  has: function has(v) {
    return typeof this._v[v[0]] === "undefined" ? false
    : (this._v[v[0]] === true || this._v[v[0]].has(v.slice(1)));
  },
  arr: function arr() {
    var nested, coord;
    var r = [];
    for (var i = this._min; i <= this._max; i++) {
      if (this._v[i] === true) {
        r.push([i]);
      }
      else if(typeof this._v[i] !== "undefined") {
        console.log(this._v[i]);
        nested = this._v[i].arr();
        for (var j = 0; j < nested.length; j++) {
          coord = nested[j].splice(0);
          coord.unshift(i);
          r.push(coord);
        }
      }
    }
    return r;
  }
};
var s = new CoordSet([3,0], [3,1]);
console.log(s);
console.log(s._v[3]);
console.log(s.has([3,0]));
console.log(s.arr());


app.get('/', function (req, res) {
  res.send(
    dots.layout({
        contents: "..."
        // h('p.row', offs, red, red, blu).outerHTML
    })
  );
});

var port = 3000;
app.listen(port, function () {
  console.log('App listening at http://localhost:'+port);
});
