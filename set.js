var set = function(_set) {
  var hash = JSON.stringify;
  var values = {};

  var has = function(v) {
    return typeof values[hash(v)] !== "undefined";
  }

  var add = function(v) {
    var h = has(v);
    if(!h) {
      values[hash(v)] = v;
    }
    return h;
  };

  var rm = function(v) {
    if(has(v)) {
      delete values[hash(v)];
    }
  }

  var forEach = function (f) {
    for (var k in values) {
      f(values[k]);
    }
  }

  var any = function (f) {
    for (var k in values) {
      if(f(values[k])) {
        return true;
      }
    }
  }

  if (arguments.length === 1 && _set.forEach) {
    _set.forEach(function (v) {
      add(v);
    })
  }
  else {
    for(var i = 0; i < arguments.length; ++ i) {
      add(arguments[i]);
    }
  }

  return { has:has, add:add, rm:rm, forEach:forEach, any:any };
}
module.exports = set;
