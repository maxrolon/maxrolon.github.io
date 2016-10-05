(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var requestFrame = window.requestAnimationFrame;
var cancelFrame = window.cancelAnimationFrame;

var singleton = void 0,
    debounce = void 0,
    detectIdle = void 0,
    handleScroll = void 0;

var Scroll = function () {
  function Scroll() {
    var _this = this;

    _classCallCheck(this, Scroll);

    this.queue = [];
    this.tickId = false;
    this.scrollChanged = false;
    this.prevY = -1;
    this.timeout = null;
    this.handlers = 0;
    this.lastError = false;

    debounce = function debounce() {
      return _this.debounce();
    };
    detectIdle = function detectIdle() {
      return _this.detectIdle();
    };
    handleScroll = function handleScroll() {
      return _this.handleScroll();
    };
  }

  /*
   * Add functions into an array.
   * These will be called in the RAF
   *
   * @param {function} cb function to call
   * @param {string} key key to reference the function (todo)
   */


  _createClass(Scroll, [{
    key: 'add',
    value: function add(cb, key) {
      this.queue.push(cb);
    }

    /* Tracks the event handlers attached via
     * this module
     */

  }, {
    key: 'enable',
    value: function enable() {
      window.addEventListener('scroll', debounce);
      document.body.addEventListener('touchmove', debounce);
      this.handlers++;
    }
  }, {
    key: 'disable',
    value: function disable() {
      window.removeEventListener('scroll', debounce);
      document.body.removeEventListener('touchmove', debounce);
      this.handlers--;
    }
  }, {
    key: 'debounce',
    value: function debounce() {
      if (this.tickId) {
        return false;
      } else {
        if (this.handlers > 0) this.disable();
        this.tick();
        return true;
      }
    }
  }, {
    key: 'tick',
    value: function tick() {
      if (this.tickId) {
        this.error('requestFrame called when one exists already');
      } else {
        this.tickId = requestFrame(handleScroll) || true;
      }
    }

    /* The nuts n' bolts. This is the RAF that
     * calls each function in the queue. Each function
     * is passed the current offset value and the last
     * recorded offset value (often the same depending)
     * on the speed of the scroll)
     */

  }, {
    key: 'handleScroll',
    value: function handleScroll() {
      var _this2 = this;

      var y = window.pageYOffset;
      this.queue.forEach(function (fn) {
        return fn(y, _this2.prevY);
      });

      this.scrollChanged = false;
      if (this.prevY != y) {
        this.scrollChanged = true;
        this.prevY = y;
      }

      if (this.scrollChanged) {
        clearTimeout(this.timeout);
        this.timeout = null;
      } else if (!this.timeout) {
        this.timeout = setTimeout(detectIdle, 200);
      }

      this.tickId = false;
      this.tick();
    }

    /* If the user hasn't scrolled in a while
     * we want to exit out of the RAF requence
     * and re-attach event bindings
     */

  }, {
    key: 'detectIdle',
    value: function detectIdle() {
      cancelFrame(this.tickId);
      this.tickId = null;
      this.enable();
    }
  }, {
    key: 'error',
    value: function error(msg) {
      this.lastError = msg;
      console.warn(msg);
    }

    /*
     * @static
     */

  }], [{
    key: 'isSupported',
    value: function isSupported() {
      if (!requestFrame) {
        ['ms', 'moz', 'webkit', 'o'].every(function (prefix) {
          requestFrame = window[prefix + 'RequestAnimationFrame'];
          cancelFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
          return !requestFrame;
        });
      }
      return requestFrame;
    }
  }]);

  return Scroll;
}();

/*
 * This singleton pattern
 * allows us to unit test the module
 * by exposing all methods. The reset property
 * allows us to reset the state of the singleton
 * between tests.. May be useful outside of the 
 * testing context?
 *
 * @param {function} cb function to add to queue
 * @param {key} key key to reference the function in the queue
 * @param {bool} obj:base Return the base class or the singleton?
 * @param {bool} obj:reset Reset the singleton so that a new instance in created
 * @param {bool} obj:enable Enable the event handler and start the animation frame
 */


exports.default = function () {
  var cb = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
  var key = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var _ref$base = _ref.base;
  var base = _ref$base === undefined ? false : _ref$base;
  var _ref$reset = _ref.reset;
  var reset = _ref$reset === undefined ? false : _ref$reset;
  var _ref$enable = _ref.enable;
  var enable = _ref$enable === undefined ? true : _ref$enable;

  if (reset) singleton = null;

  if (!Scroll.isSupported()) {
    console.warn('Request Animation Frame not supported');
    return false;
  }

  if (!singleton) singleton = new Scroll();

  if (cb) singleton.add(cb, key);

  if (singleton.handlers < 1 && enable) {
    singleton.debounce();
    singleton.enable();
  }

  return base ? Scroll : singleton;
};

},{}],2:[function(require,module,exports){
'use strict';

var _rafScroll = require('raf-scroll.js');

var _rafScroll2 = _interopRequireDefault(_rafScroll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var imgIX = 'https://maxrolon.imgix.net/';

var loadIn = function loadIn(el) {
  var src = el.getAttribute('data-src');
  if (!src) return;
  var width = Math.ceil(el.getBoundingClientRect().width * ((window.devicePixelRatio || 1) * 0.75));
  var extUrl = '' + imgIX + src + '?w=' + width + '&q=60';
  var loader = new Image();
  loader.onload = function () {
    el.src = extUrl;
  };
  loader.src = extUrl;
};

var getOffset = function getOffset(el) {
  var win = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];
  var docElem = arguments.length <= 2 || arguments[2] === undefined ? document.documentElement : arguments[2];
  var box = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
  return box = el.getBoundingClientRect(), box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0);
};

var getWHeight = function getWHeight() {
  return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
};

var cacheOffsets = function cacheOffsets(el) {
  return el.offsetY = getOffset(el);
};

var start = function start() {
  var e = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var images = [].slice.call(document.querySelectorAll('[data-src]'));
  var wHeight = void 0;
  var getAllOffsets = void 0;
  (getAllOffsets = function getAllOffsets() {
    images.forEach(cacheOffsets);
    wHeight = getWHeight();
  })();
  var check = void 0;
  (0, _rafScroll2.default)(check = function check(y) {
    images.forEach(function (el) {
      if (el.offsetY < y + wHeight) {
        loadIn(el);
      }
    });
  });

  window.addEventListener('resize', getAllOffsets);
};

var delay = function delay() {
  return setTimeout(start, 500);
};

document.addEventListener('DOMContentLoaded', delay);
if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
  delay();
}

},{"raf-scroll.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL3JhZi1zY3JvbGwuanMvc3JjL2luZGV4LmpzIiwic3JjL2pzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLElBQUksZUFBZSxPQUFPLHFCQUExQjtBQUNBLElBQUksY0FBZSxPQUFPLG9CQUExQjs7QUFFQSxJQUFJLGtCQUFKO0FBQUEsSUFBZSxpQkFBZjtBQUFBLElBQXlCLG1CQUF6QjtBQUFBLElBQXFDLHFCQUFyQzs7SUFFTSxNO0FBQ0osb0JBQWE7QUFBQTs7QUFBQTs7QUFDWCxTQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsU0FBSyxNQUFMLEdBQWMsS0FBZDtBQUNBLFNBQUssYUFBTCxHQUFxQixLQUFyQjtBQUNBLFNBQUssS0FBTCxHQUFhLENBQUMsQ0FBZDtBQUNBLFNBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7O0FBRUEsZUFBVztBQUFBLGFBQU0sTUFBSyxRQUFMLEVBQU47QUFBQSxLQUFYO0FBQ0EsaUJBQWE7QUFBQSxhQUFNLE1BQUssVUFBTCxFQUFOO0FBQUEsS0FBYjtBQUNBLG1CQUFlO0FBQUEsYUFBTSxNQUFLLFlBQUwsRUFBTjtBQUFBLEtBQWY7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7d0JBT0ksRSxFQUFHLEcsRUFBSTtBQUNULFdBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsRUFBaEI7QUFDRDs7QUFFRDs7Ozs7OzZCQUdRO0FBQ04sYUFBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxRQUFsQztBQUNBLGVBQVMsSUFBVCxDQUFjLGdCQUFkLENBQStCLFdBQS9CLEVBQTRDLFFBQTVDO0FBQ0EsV0FBSyxRQUFMO0FBQ0Q7Ozs4QkFDUTtBQUNQLGFBQU8sbUJBQVAsQ0FBMkIsUUFBM0IsRUFBcUMsUUFBckM7QUFDQSxlQUFTLElBQVQsQ0FBYyxtQkFBZCxDQUFrQyxXQUFsQyxFQUErQyxRQUEvQztBQUNBLFdBQUssUUFBTDtBQUNEOzs7K0JBQ1M7QUFDUixVQUFJLEtBQUssTUFBVCxFQUFnQjtBQUNkLGVBQU8sS0FBUDtBQUNELE9BRkQsTUFFTztBQUNMLFlBQUksS0FBSyxRQUFMLEdBQWdCLENBQXBCLEVBQXVCLEtBQUssT0FBTDtBQUN2QixhQUFLLElBQUw7QUFDQSxlQUFPLElBQVA7QUFDRDtBQUNGOzs7MkJBQ0s7QUFDSixVQUFJLEtBQUssTUFBVCxFQUFnQjtBQUNkLGFBQUssS0FBTCxDQUFXLDZDQUFYO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsYUFBSyxNQUFMLEdBQWMsYUFBYSxZQUFiLEtBQThCLElBQTVDO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7Ozs7O21DQU1jO0FBQUE7O0FBQ1osVUFBSSxJQUFJLE9BQU8sV0FBZjtBQUNBLFdBQUssS0FBTCxDQUFXLE9BQVgsQ0FBb0I7QUFBQSxlQUFNLEdBQUcsQ0FBSCxFQUFNLE9BQUssS0FBWCxDQUFOO0FBQUEsT0FBcEI7O0FBRUEsV0FBSyxhQUFMLEdBQXFCLEtBQXJCO0FBQ0EsVUFBSSxLQUFLLEtBQUwsSUFBYyxDQUFsQixFQUFvQjtBQUNsQixhQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxhQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLLGFBQVQsRUFBdUI7QUFDckIscUJBQWEsS0FBSyxPQUFsQjtBQUNBLGFBQUssT0FBTCxHQUFlLElBQWY7QUFDRCxPQUhELE1BR08sSUFBSSxDQUFDLEtBQUssT0FBVixFQUFrQjtBQUN2QixhQUFLLE9BQUwsR0FBZSxXQUFXLFVBQVgsRUFBdUIsR0FBdkIsQ0FBZjtBQUNEOztBQUVELFdBQUssTUFBTCxHQUFjLEtBQWQ7QUFDQSxXQUFLLElBQUw7QUFDRDs7QUFFRDs7Ozs7OztpQ0FJWTtBQUNWLGtCQUFZLEtBQUssTUFBakI7QUFDQSxXQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsV0FBSyxNQUFMO0FBQ0Q7OzswQkFDSyxHLEVBQUk7QUFDUixXQUFLLFNBQUwsR0FBaUIsR0FBakI7QUFDQSxjQUFRLElBQVIsQ0FBYSxHQUFiO0FBQ0Q7O0FBRUQ7Ozs7OztrQ0FHb0I7QUFDbEIsVUFBSSxDQUFDLFlBQUwsRUFBbUI7QUFDakIsU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLFFBQWQsRUFBd0IsR0FBeEIsRUFBNkIsS0FBN0IsQ0FBbUMsa0JBQVU7QUFDM0MseUJBQWUsT0FBTyxTQUFTLHVCQUFoQixDQUFmO0FBQ0Esd0JBQWUsT0FBTyxTQUFTLHNCQUFoQixLQUNBLE9BQU8sU0FBUyw2QkFBaEIsQ0FEZjtBQUVBLGlCQUFPLENBQUMsWUFBUjtBQUNELFNBTEQ7QUFPRDtBQUNELGFBQU8sWUFBUDtBQUNEOzs7Ozs7QUFHSDs7Ozs7Ozs7Ozs7Ozs7OztrQkFjZSxZQUFnRTtBQUFBLE1BQS9ELEVBQStELHlEQUE1RCxLQUE0RDtBQUFBLE1BQXRELEdBQXNELHlEQUFsRCxLQUFrRDs7QUFBQSxtRUFBUCxFQUFPOztBQUFBLHVCQUEzQyxJQUEyQztBQUFBLE1BQTNDLElBQTJDLDZCQUF0QyxLQUFzQztBQUFBLHdCQUFoQyxLQUFnQztBQUFBLE1BQWhDLEtBQWdDLDhCQUExQixLQUEwQjtBQUFBLHlCQUFwQixNQUFvQjtBQUFBLE1BQXBCLE1BQW9CLCtCQUFiLElBQWE7O0FBQzdFLE1BQUksS0FBSixFQUFXLFlBQVksSUFBWjs7QUFFWCxNQUFLLENBQUMsT0FBTyxXQUFQLEVBQU4sRUFBNEI7QUFDMUIsWUFBUSxJQUFSLENBQWEsdUNBQWI7QUFDQSxXQUFPLEtBQVA7QUFDRDs7QUFFRCxNQUFJLENBQUMsU0FBTCxFQUFnQixZQUFZLElBQUksTUFBSixFQUFaOztBQUVoQixNQUFJLEVBQUosRUFBUSxVQUFVLEdBQVYsQ0FBYyxFQUFkLEVBQWlCLEdBQWpCOztBQUVSLE1BQUksVUFBVSxRQUFWLEdBQXFCLENBQXJCLElBQTBCLE1BQTlCLEVBQXFDO0FBQ25DLGNBQVUsUUFBVjtBQUNBLGNBQVUsTUFBVjtBQUNEOztBQUVELFNBQU8sT0FBTyxNQUFQLEdBQWdCLFNBQXZCO0FBQ0QsQzs7Ozs7QUN2SkQ7Ozs7OztBQUVBLElBQU0sUUFBUSw2QkFBZDs7QUFFQSxJQUFNLFNBQVMsU0FBVCxNQUFTLENBQUMsRUFBRCxFQUFRO0FBQ3JCLE1BQU0sTUFBTSxHQUFHLFlBQUgsQ0FBZ0IsVUFBaEIsQ0FBWjtBQUNBLE1BQUksQ0FBQyxHQUFMLEVBQVU7QUFDVixNQUFNLFFBQVEsS0FBSyxJQUFMLENBQVcsR0FBRyxxQkFBSCxHQUEyQixLQUEzQixJQUFxQyxDQUFDLE9BQU8sZ0JBQVAsSUFBMkIsQ0FBNUIsSUFBaUMsSUFBdEUsQ0FBWCxDQUFkO0FBQ0EsTUFBTSxjQUFZLEtBQVosR0FBb0IsR0FBcEIsV0FBNkIsS0FBN0IsVUFBTjtBQUNBLE1BQU0sU0FBUyxJQUFJLEtBQUosRUFBZjtBQUNBLFNBQU8sTUFBUCxHQUFnQixZQUFNO0FBQ3BCLE9BQUcsR0FBSCxHQUFTLE1BQVQ7QUFDRCxHQUZEO0FBR0EsU0FBTyxHQUFQLEdBQWEsTUFBYjtBQUNELENBVkQ7O0FBWUEsSUFBTSxZQUFZLFNBQVosU0FBWSxDQUFDLEVBQUQ7QUFBQSxNQUFLLEdBQUwseURBQVMsTUFBVDtBQUFBLE1BQWlCLE9BQWpCLHlEQUF5QixTQUFTLGVBQWxDO0FBQUEsTUFBbUQsR0FBbkQseURBQXVELEtBQXZEO0FBQUEsU0FDaEIsTUFBTSxHQUFHLHFCQUFILEVBQU4sRUFDQSxJQUFJLEdBQUosSUFBVyxJQUFJLFdBQUosSUFBbUIsUUFBUSxTQUF0QyxLQUFvRCxRQUFRLFNBQVIsSUFBcUIsQ0FBekUsQ0FGZ0I7QUFBQSxDQUFsQjs7QUFLQSxJQUFNLGFBQWEsU0FBYixVQUFhO0FBQUEsU0FBTSxLQUFLLEdBQUwsQ0FBUyxTQUFTLGVBQVQsQ0FBeUIsWUFBbEMsRUFBZ0QsT0FBTyxXQUFQLElBQXNCLENBQXRFLENBQU47QUFBQSxDQUFuQjs7QUFFQSxJQUFNLGVBQWUsU0FBZixZQUFlO0FBQUEsU0FBTSxHQUFHLE9BQUgsR0FBYSxVQUFVLEVBQVYsQ0FBbkI7QUFBQSxDQUFyQjs7QUFFQSxJQUFNLFFBQVEsU0FBUixLQUFRLEdBQVk7QUFBQSxNQUFYLENBQVcseURBQVAsRUFBTzs7QUFDeEIsTUFBTSxTQUFTLEdBQUcsS0FBSCxDQUFTLElBQVQsQ0FBZSxTQUFTLGdCQUFULENBQTBCLFlBQTFCLENBQWYsQ0FBZjtBQUNBLE1BQUksZ0JBQUo7QUFDQSxNQUFJLHNCQUFKO0FBQ0EsR0FBQyxnQkFBZ0IseUJBQVU7QUFDekIsV0FBTyxPQUFQLENBQWUsWUFBZjtBQUNBLGNBQVUsWUFBVjtBQUNELEdBSEQ7QUFJQSxNQUFJLGNBQUo7QUFDQSwyQkFBTyxRQUFRLGVBQVMsQ0FBVCxFQUFXO0FBQ3hCLFdBQU8sT0FBUCxDQUFnQixjQUFNO0FBQ3BCLFVBQUssR0FBRyxPQUFILEdBQWUsSUFBSSxPQUF4QixFQUFrQztBQUNoQyxlQUFPLEVBQVA7QUFDRDtBQUNGLEtBSkQ7QUFLRCxHQU5EOztBQVFBLFNBQU8sZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0MsYUFBbEM7QUFDRCxDQWxCRDs7QUFvQkEsSUFBTSxRQUFRLFNBQVIsS0FBUTtBQUFBLFNBQU0sV0FBVyxLQUFYLEVBQWtCLEdBQWxCLENBQU47QUFBQSxDQUFkOztBQUVBLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEtBQTlDO0FBQ0EsSUFBSSxTQUFTLFVBQVQsSUFBdUIsVUFBdkIsSUFDQyxTQUFTLFVBQVQsSUFBdUIsUUFEeEIsSUFFQyxTQUFTLFVBQVQsSUFBdUIsYUFGNUIsRUFFMkM7QUFDekM7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgcmVxdWVzdEZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxubGV0IGNhbmNlbEZyYW1lICA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZVxuXG5sZXQgc2luZ2xldG9uLCBkZWJvdW5jZSwgZGV0ZWN0SWRsZSwgaGFuZGxlU2Nyb2xsXG5cbmNsYXNzIFNjcm9sbHtcbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLnF1ZXVlID0gW11cbiAgICB0aGlzLnRpY2tJZCA9IGZhbHNlXG4gICAgdGhpcy5zY3JvbGxDaGFuZ2VkID0gZmFsc2VcbiAgICB0aGlzLnByZXZZID0gLTFcbiAgICB0aGlzLnRpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5oYW5kbGVycyA9IDBcbiAgICB0aGlzLmxhc3RFcnJvciA9IGZhbHNlXG5cbiAgICBkZWJvdW5jZSA9ICgpID0+IHRoaXMuZGVib3VuY2UoKVxuICAgIGRldGVjdElkbGUgPSAoKSA9PiB0aGlzLmRldGVjdElkbGUoKVxuICAgIGhhbmRsZVNjcm9sbCA9ICgpID0+IHRoaXMuaGFuZGxlU2Nyb2xsKClcbiAgfVxuXG4gIC8qXG4gICAqIEFkZCBmdW5jdGlvbnMgaW50byBhbiBhcnJheS5cbiAgICogVGhlc2Ugd2lsbCBiZSBjYWxsZWQgaW4gdGhlIFJBRlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYiBmdW5jdGlvbiB0byBjYWxsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkga2V5IHRvIHJlZmVyZW5jZSB0aGUgZnVuY3Rpb24gKHRvZG8pXG4gICAqL1xuICBhZGQoY2Isa2V5KXtcbiAgICB0aGlzLnF1ZXVlLnB1c2goY2IpXG4gIH1cblxuICAvKiBUcmFja3MgdGhlIGV2ZW50IGhhbmRsZXJzIGF0dGFjaGVkIHZpYVxuICAgKiB0aGlzIG1vZHVsZVxuICAgKi9cbiAgZW5hYmxlKCl7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGRlYm91bmNlKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZGVib3VuY2UpXG4gICAgdGhpcy5oYW5kbGVycysrXG4gIH1cbiAgZGlzYWJsZSgpe1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBkZWJvdW5jZSlcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRlYm91bmNlKVxuICAgIHRoaXMuaGFuZGxlcnMtLVxuICB9XG4gIGRlYm91bmNlKCl7XG4gICAgaWYgKHRoaXMudGlja0lkKXtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5oYW5kbGVycyA+IDApIHRoaXMuZGlzYWJsZSgpXG4gICAgICB0aGlzLnRpY2soKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgdGljaygpe1xuICAgIGlmICh0aGlzLnRpY2tJZCl7XG4gICAgICB0aGlzLmVycm9yKCdyZXF1ZXN0RnJhbWUgY2FsbGVkIHdoZW4gb25lIGV4aXN0cyBhbHJlYWR5JylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50aWNrSWQgPSByZXF1ZXN0RnJhbWUoaGFuZGxlU2Nyb2xsKSB8fCB0cnVlXG4gICAgfVxuICB9XG5cbiAgLyogVGhlIG51dHMgbicgYm9sdHMuIFRoaXMgaXMgdGhlIFJBRiB0aGF0XG4gICAqIGNhbGxzIGVhY2ggZnVuY3Rpb24gaW4gdGhlIHF1ZXVlLiBFYWNoIGZ1bmN0aW9uXG4gICAqIGlzIHBhc3NlZCB0aGUgY3VycmVudCBvZmZzZXQgdmFsdWUgYW5kIHRoZSBsYXN0XG4gICAqIHJlY29yZGVkIG9mZnNldCB2YWx1ZSAob2Z0ZW4gdGhlIHNhbWUgZGVwZW5kaW5nKVxuICAgKiBvbiB0aGUgc3BlZWQgb2YgdGhlIHNjcm9sbClcbiAgICovXG4gIGhhbmRsZVNjcm9sbCgpe1xuICAgIGxldCB5ID0gd2luZG93LnBhZ2VZT2Zmc2V0XG4gICAgdGhpcy5xdWV1ZS5mb3JFYWNoKCBmbiA9PiBmbih5LCB0aGlzLnByZXZZKSApXG5cbiAgICB0aGlzLnNjcm9sbENoYW5nZWQgPSBmYWxzZVxuICAgIGlmICh0aGlzLnByZXZZICE9IHkpe1xuICAgICAgdGhpcy5zY3JvbGxDaGFuZ2VkID0gdHJ1ZVxuICAgICAgdGhpcy5wcmV2WSA9IHlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY3JvbGxDaGFuZ2VkKXtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICB0aGlzLnRpbWVvdXQgPSBudWxsXG4gICAgfSBlbHNlIGlmICghdGhpcy50aW1lb3V0KXtcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZGV0ZWN0SWRsZSwgMjAwKVxuICAgIH1cblxuICAgIHRoaXMudGlja0lkID0gZmFsc2VcbiAgICB0aGlzLnRpY2soKVxuICB9XG5cbiAgLyogSWYgdGhlIHVzZXIgaGFzbid0IHNjcm9sbGVkIGluIGEgd2hpbGVcbiAgICogd2Ugd2FudCB0byBleGl0IG91dCBvZiB0aGUgUkFGIHJlcXVlbmNlXG4gICAqIGFuZCByZS1hdHRhY2ggZXZlbnQgYmluZGluZ3NcbiAgICovXG4gIGRldGVjdElkbGUoKXtcbiAgICBjYW5jZWxGcmFtZSh0aGlzLnRpY2tJZClcbiAgICB0aGlzLnRpY2tJZCA9IG51bGxcbiAgICB0aGlzLmVuYWJsZSgpXG4gIH1cbiAgZXJyb3IobXNnKXtcbiAgICB0aGlzLmxhc3RFcnJvciA9IG1zZ1xuICAgIGNvbnNvbGUud2Fybihtc2cpXG4gIH1cblxuICAvKlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzdGF0aWMgaXNTdXBwb3J0ZWQoKXtcbiAgICBpZiAoIXJlcXVlc3RGcmFtZSkge1xuICAgICAgWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXS5ldmVyeShwcmVmaXggPT4ge1xuICAgICAgICByZXF1ZXN0RnJhbWUgPSB3aW5kb3dbcHJlZml4ICsgJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICBjYW5jZWxGcmFtZSAgPSB3aW5kb3dbcHJlZml4ICsgJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgd2luZG93W3ByZWZpeCArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgcmV0dXJuICFyZXF1ZXN0RnJhbWU7XG4gICAgICB9KVxuXG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0RnJhbWVcbiAgfVxufVxuXG4vKlxuICogVGhpcyBzaW5nbGV0b24gcGF0dGVyblxuICogYWxsb3dzIHVzIHRvIHVuaXQgdGVzdCB0aGUgbW9kdWxlXG4gKiBieSBleHBvc2luZyBhbGwgbWV0aG9kcy4gVGhlIHJlc2V0IHByb3BlcnR5XG4gKiBhbGxvd3MgdXMgdG8gcmVzZXQgdGhlIHN0YXRlIG9mIHRoZSBzaW5nbGV0b25cbiAqIGJldHdlZW4gdGVzdHMuLiBNYXkgYmUgdXNlZnVsIG91dHNpZGUgb2YgdGhlIFxuICogdGVzdGluZyBjb250ZXh0P1xuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiIGZ1bmN0aW9uIHRvIGFkZCB0byBxdWV1ZVxuICogQHBhcmFtIHtrZXl9IGtleSBrZXkgdG8gcmVmZXJlbmNlIHRoZSBmdW5jdGlvbiBpbiB0aGUgcXVldWVcbiAqIEBwYXJhbSB7Ym9vbH0gb2JqOmJhc2UgUmV0dXJuIHRoZSBiYXNlIGNsYXNzIG9yIHRoZSBzaW5nbGV0b24/XG4gKiBAcGFyYW0ge2Jvb2x9IG9iajpyZXNldCBSZXNldCB0aGUgc2luZ2xldG9uIHNvIHRoYXQgYSBuZXcgaW5zdGFuY2UgaW4gY3JlYXRlZFxuICogQHBhcmFtIHtib29sfSBvYmo6ZW5hYmxlIEVuYWJsZSB0aGUgZXZlbnQgaGFuZGxlciBhbmQgc3RhcnQgdGhlIGFuaW1hdGlvbiBmcmFtZVxuICovXG5leHBvcnQgZGVmYXVsdCAoY2I9ZmFsc2Usa2V5PWZhbHNlLHtiYXNlPWZhbHNlLHJlc2V0PWZhbHNlLGVuYWJsZT10cnVlfT17fSkgPT4geyBcbiAgaWYgKHJlc2V0KSBzaW5nbGV0b24gPSBudWxsXG5cbiAgaWYgKCAhU2Nyb2xsLmlzU3VwcG9ydGVkKCkgKXtcbiAgICBjb25zb2xlLndhcm4oJ1JlcXVlc3QgQW5pbWF0aW9uIEZyYW1lIG5vdCBzdXBwb3J0ZWQnKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKCFzaW5nbGV0b24pIHNpbmdsZXRvbiA9IG5ldyBTY3JvbGwoKVxuXG4gIGlmIChjYikgc2luZ2xldG9uLmFkZChjYixrZXkpXG5cbiAgaWYgKHNpbmdsZXRvbi5oYW5kbGVycyA8IDEgJiYgZW5hYmxlKXtcbiAgICBzaW5nbGV0b24uZGVib3VuY2UoKVxuICAgIHNpbmdsZXRvbi5lbmFibGUoKVxuICB9XG5cbiAgcmV0dXJuIGJhc2UgPyBTY3JvbGwgOiBzaW5nbGV0b25cbn1cbiIsImltcG9ydCBzY3JvbGwgZnJvbSAncmFmLXNjcm9sbC5qcydcblxuY29uc3QgaW1nSVggPSAnaHR0cHM6Ly9tYXhyb2xvbi5pbWdpeC5uZXQvJ1xuXG5jb25zdCBsb2FkSW4gPSAoZWwpID0+IHtcbiAgY29uc3Qgc3JjID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXNyYycpXG4gIGlmICghc3JjKSByZXR1cm47XG4gIGNvbnN0IHdpZHRoID0gTWF0aC5jZWlsKCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCAqICggKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEpICogMC43NSApIClcbiAgY29uc3QgZXh0VXJsID0gYCR7aW1nSVh9JHtzcmN9P3c9JHt3aWR0aH0mcT02MGA7XG4gIGNvbnN0IGxvYWRlciA9IG5ldyBJbWFnZSgpXG4gIGxvYWRlci5vbmxvYWQgPSAoKSA9PiB7XG4gICAgZWwuc3JjID0gZXh0VXJsXG4gIH1cbiAgbG9hZGVyLnNyYyA9IGV4dFVybFxufVxuXG5jb25zdCBnZXRPZmZzZXQgPSAoZWwsIHdpbj13aW5kb3csIGRvY0VsZW09ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBib3g9ZmFsc2UpID0+IChcbiAgYm94ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gIGJveC50b3AgKyAod2luLnBhZ2VZT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsVG9wKSAtIChkb2NFbGVtLmNsaWVudFRvcCB8fCAwKVxuKVxuXG5jb25zdCBnZXRXSGVpZ2h0ID0gKCkgPT4gTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApXG5cbmNvbnN0IGNhY2hlT2Zmc2V0cyA9IGVsID0+IGVsLm9mZnNldFkgPSBnZXRPZmZzZXQoZWwpXG5cbmNvbnN0IHN0YXJ0ID0gKGUgPSB7fSkgPT4ge1xuICBjb25zdCBpbWFnZXMgPSBbXS5zbGljZS5jYWxsKCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zcmNdJykgKVxuICBsZXQgd0hlaWdodDtcbiAgbGV0IGdldEFsbE9mZnNldHM7XG4gIChnZXRBbGxPZmZzZXRzID0gZnVuY3Rpb24oKXtcbiAgICBpbWFnZXMuZm9yRWFjaChjYWNoZU9mZnNldHMpXG4gICAgd0hlaWdodCA9IGdldFdIZWlnaHQoKVxuICB9KSgpO1xuICBsZXQgY2hlY2s7XG4gIHNjcm9sbChjaGVjayA9IGZ1bmN0aW9uKHkpe1xuICAgIGltYWdlcy5mb3JFYWNoKCBlbCA9PiB7XG4gICAgICBpZiAoIGVsLm9mZnNldFkgPCAoIHkgKyB3SGVpZ2h0KSApe1xuICAgICAgICBsb2FkSW4oZWwpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZ2V0QWxsT2Zmc2V0cylcbn1cblxuY29uc3QgZGVsYXkgPSAoKSA9PiBzZXRUaW1lb3V0KHN0YXJ0LCA1MDApXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBkZWxheSlcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIiBcbiAgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSBcImxvYWRlZFwiIFxuICB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiaW50ZXJhY3RpdmVcIikge1xuICBkZWxheSgpXG59XG4iXX0=
