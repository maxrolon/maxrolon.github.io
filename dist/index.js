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
  var width = Math.ceil(el.getBoundingClientRect().width * (window.devicePixelRatio || 1));
  //round to next 100px interval
  width = Math.ceil(width / 100) * 100;
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

  var images = [].slice.call(document.querySelectorAll('[data-src]')).reduce(function (obj, el, i) {
    return obj[i] = el, obj;
  }, {});
  var wHeight = void 0;
  var getAllOffsets = void 0;
  (getAllOffsets = function getAllOffsets() {
    for (var i in images) {
      cacheOffsets(images[i]);
    }
    wHeight = getWHeight();
  })();
  var check = void 0;
  (0, _rafScroll2.default)(check = function check(y) {
    for (var i in images) {
      if (images[i].offsetY < y + wHeight) {
        loadIn(images[i]);
        delete images[i];
      }
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL3JhZi1zY3JvbGwuanMvc3JjL2luZGV4LmpzIiwic3JjL2pzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLElBQUksZUFBZSxPQUFPLHFCQUExQjtBQUNBLElBQUksY0FBZSxPQUFPLG9CQUExQjs7QUFFQSxJQUFJLGtCQUFKO0FBQUEsSUFBZSxpQkFBZjtBQUFBLElBQXlCLG1CQUF6QjtBQUFBLElBQXFDLHFCQUFyQzs7SUFFTSxNO0FBQ0osb0JBQWE7QUFBQTs7QUFBQTs7QUFDWCxTQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsU0FBSyxNQUFMLEdBQWMsS0FBZDtBQUNBLFNBQUssYUFBTCxHQUFxQixLQUFyQjtBQUNBLFNBQUssS0FBTCxHQUFhLENBQUMsQ0FBZDtBQUNBLFNBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7O0FBRUEsZUFBVztBQUFBLGFBQU0sTUFBSyxRQUFMLEVBQU47QUFBQSxLQUFYO0FBQ0EsaUJBQWE7QUFBQSxhQUFNLE1BQUssVUFBTCxFQUFOO0FBQUEsS0FBYjtBQUNBLG1CQUFlO0FBQUEsYUFBTSxNQUFLLFlBQUwsRUFBTjtBQUFBLEtBQWY7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7d0JBT0ksRSxFQUFHLEcsRUFBSTtBQUNULFdBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsRUFBaEI7QUFDRDs7QUFFRDs7Ozs7OzZCQUdRO0FBQ04sYUFBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxRQUFsQztBQUNBLGVBQVMsSUFBVCxDQUFjLGdCQUFkLENBQStCLFdBQS9CLEVBQTRDLFFBQTVDO0FBQ0EsV0FBSyxRQUFMO0FBQ0Q7Ozs4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LFNBQVMsVUFBVCxJQUF1QixRQUR4QixJQUVDLFNBQVMsVUFBVCxJQUF1QixhQUY1QixFQUUyQztBQUN6QztBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImxldCByZXF1ZXN0RnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5sZXQgY2FuY2VsRnJhbWUgID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lXG5cbmxldCBzaW5nbGV0b24sIGRlYm91bmNlLCBkZXRlY3RJZGxlLCBoYW5kbGVTY3JvbGxcblxuY2xhc3MgU2Nyb2xse1xuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMucXVldWUgPSBbXVxuICAgIHRoaXMudGlja0lkID0gZmFsc2VcbiAgICB0aGlzLnNjcm9sbENoYW5nZWQgPSBmYWxzZVxuICAgIHRoaXMucHJldlkgPSAtMVxuICAgIHRoaXMudGltZW91dCA9IG51bGxcbiAgICB0aGlzLmhhbmRsZXJzID0gMFxuICAgIHRoaXMubGFzdEVycm9yID0gZmFsc2VcblxuICAgIGRlYm91bmNlID0gKCkgPT4gdGhpcy5kZWJvdW5jZSgpXG4gICAgZGV0ZWN0SWRsZSA9ICgpID0+IHRoaXMuZGV0ZWN0SWRsZSgpXG4gICAgaGFuZGxlU2Nyb2xsID0gKCkgPT4gdGhpcy5oYW5kbGVTY3JvbGwoKVxuICB9XG5cbiAgLypcbiAgICogQWRkIGZ1bmN0aW9ucyBpbnRvIGFuIGFycmF5LlxuICAgKiBUaGVzZSB3aWxsIGJlIGNhbGxlZCBpbiB0aGUgUkFGXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiIGZ1bmN0aW9uIHRvIGNhbGxcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBrZXkgdG8gcmVmZXJlbmNlIHRoZSBmdW5jdGlvbiAodG9kbylcbiAgICovXG4gIGFkZChjYixrZXkpe1xuICAgIHRoaXMucXVldWUucHVzaChjYilcbiAgfVxuXG4gIC8qIFRyYWNrcyB0aGUgZXZlbnQgaGFuZGxlcnMgYXR0YWNoZWQgdmlhXG4gICAqIHRoaXMgbW9kdWxlXG4gICAqL1xuICBlbmFibGUoKXtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZGVib3VuY2UpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkZWJvdW5jZSlcbiAgICB0aGlzLmhhbmRsZXJzKytcbiAgfVxuICBkaXNhYmxlKCl7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGRlYm91bmNlKVxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZGVib3VuY2UpXG4gICAgdGhpcy5oYW5kbGVycy0tXG4gIH1cbiAgZGVib3VuY2UoKXtcbiAgICBpZiAodGhpcy50aWNrSWQpe1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmhhbmRsZXJzID4gMCkgdGhpcy5kaXNhYmxlKClcbiAgICAgIHRoaXMudGljaygpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICB0aWNrKCl7XG4gICAgaWYgKHRoaXMudGlja0lkKXtcbiAgICAgIHRoaXMuZXJyb3IoJ3JlcXVlc3RGcmFtZSBjYWxsZWQgd2hlbiBvbmUgZXhpc3RzIGFscmVhZHknKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRpY2tJZCA9IHJlcXVlc3RGcmFtZShoYW5kbGVTY3JvbGwpIHx8IHRydWVcbiAgICB9XG4gIH1cblxuICAvKiBUaGUgbnV0cyBuJyBib2x0cy4gVGhpcyBpcyB0aGUgUkFGIHRoYXRcbiAgICogY2FsbHMgZWFjaCBmdW5jdGlvbiBpbiB0aGUgcXVldWUuIEVhY2ggZnVuY3Rpb25cbiAgICogaXMgcGFzc2VkIHRoZSBjdXJyZW50IG9mZnNldCB2YWx1ZSBhbmQgdGhlIGxhc3RcbiAgICogcmVjb3JkZWQgb2Zmc2V0IHZhbHVlIChvZnRlbiB0aGUgc2FtZSBkZXBlbmRpbmcpXG4gICAqIG9uIHRoZSBzcGVlZCBvZiB0aGUgc2Nyb2xsKVxuICAgKi9cbiAgaGFuZGxlU2Nyb2xsKCl7XG4gICAgbGV0IHkgPSB3aW5kb3cucGFnZVlPZmZzZXRcbiAgICB0aGlzLnF1ZXVlLmZvckVhY2goIGZuID0+IGZuKHksIHRoaXMucHJldlkpIClcblxuICAgIHRoaXMuc2Nyb2xsQ2hhbmdlZCA9IGZhbHNlXG4gICAgaWYgKHRoaXMucHJldlkgIT0geSl7XG4gICAgICB0aGlzLnNjcm9sbENoYW5nZWQgPSB0cnVlXG4gICAgICB0aGlzLnByZXZZID0geVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNjcm9sbENoYW5nZWQpe1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgIHRoaXMudGltZW91dCA9IG51bGxcbiAgICB9IGVsc2UgaWYgKCF0aGlzLnRpbWVvdXQpe1xuICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChkZXRlY3RJZGxlLCAyMDApXG4gICAgfVxuXG4gICAgdGhpcy50aWNrSWQgPSBmYWxzZVxuICAgIHRoaXMudGljaygpXG4gIH1cblxuICAvKiBJZiB0aGUgdXNlciBoYXNuJ3Qgc2Nyb2xsZWQgaW4gYSB3aGlsZVxuICAgKiB3ZSB3YW50IHRvIGV4aXQgb3V0IG9mIHRoZSBSQUYgcmVxdWVuY2VcbiAgICogYW5kIHJlLWF0dGFjaCBldmVudCBiaW5kaW5nc1xuICAgKi9cbiAgZGV0ZWN0SWRsZSgpe1xuICAgIGNhbmNlbEZyYW1lKHRoaXMudGlja0lkKVxuICAgIHRoaXMudGlja0lkID0gbnVsbFxuICAgIHRoaXMuZW5hYmxlKClcbiAgfVxuICBlcnJvcihtc2cpe1xuICAgIHRoaXMubGFzdEVycm9yID0gbXNnXG4gICAgY29uc29sZS53YXJuKG1zZylcbiAgfVxuXG4gIC8qXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHN0YXRpYyBpc1N1cHBvcnRlZCgpe1xuICAgIGlmICghcmVxdWVzdEZyYW1lKSB7XG4gICAgICBbJ21zJywgJ21veicsICd3ZWJraXQnLCAnbyddLmV2ZXJ5KHByZWZpeCA9PiB7XG4gICAgICAgIHJlcXVlc3RGcmFtZSA9IHdpbmRvd1twcmVmaXggKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgIGNhbmNlbEZyYW1lICA9IHdpbmRvd1twcmVmaXggKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dbcHJlZml4ICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICByZXR1cm4gIXJlcXVlc3RGcmFtZTtcbiAgICAgIH0pXG5cbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3RGcmFtZVxuICB9XG59XG5cbi8qXG4gKiBUaGlzIHNpbmdsZXRvbiBwYXR0ZXJuXG4gKiBhbGxvd3MgdXMgdG8gdW5pdCB0ZXN0IHRoZSBtb2R1bGVcbiAqIGJ5IGV4cG9zaW5nIGFsbCBtZXRob2RzLiBUaGUgcmVzZXQgcHJvcGVydHlcbiAqIGFsbG93cyB1cyB0byByZXNldCB0aGUgc3RhdGUgb2YgdGhlIHNpbmdsZXRvblxuICogYmV0d2VlbiB0ZXN0cy4uIE1heSBiZSB1c2VmdWwgb3V0c2lkZSBvZiB0aGUgXG4gKiB0ZXN0aW5nIGNvbnRleHQ/XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2IgZnVuY3Rpb24gdG8gYWRkIHRvIHF1ZXVlXG4gKiBAcGFyYW0ge2tleX0ga2V5IGtleSB0byByZWZlcmVuY2UgdGhlIGZ1bmN0aW9uIGluIHRoZSBxdWV1ZVxuICogQHBhcmFtIHtib29sfSBvYmo6YmFzZSBSZXR1cm4gdGhlIGJhc2UgY2xhc3Mgb3IgdGhlIHNpbmdsZXRvbj9cbiAqIEBwYXJhbSB7Ym9vbH0gb2JqOnJlc2V0IFJlc2V0IHRoZSBzaW5nbGV0b24gc28gdGhhdCBhIG5ldyBpbnN0YW5jZSBpbiBjcmVhdGVkXG4gKiBAcGFyYW0ge2Jvb2x9IG9iajplbmFibGUgRW5hYmxlIHRoZSBldmVudCBoYW5kbGVyIGFuZCBzdGFydCB0aGUgYW5pbWF0aW9uIGZyYW1lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChjYj1mYWxzZSxrZXk9ZmFsc2Use2Jhc2U9ZmFsc2UscmVzZXQ9ZmFsc2UsZW5hYmxlPXRydWV9PXt9KSA9PiB7IFxuICBpZiAocmVzZXQpIHNpbmdsZXRvbiA9IG51bGxcblxuICBpZiAoICFTY3JvbGwuaXNTdXBwb3J0ZWQoKSApe1xuICAgIGNvbnNvbGUud2FybignUmVxdWVzdCBBbmltYXRpb24gRnJhbWUgbm90IHN1cHBvcnRlZCcpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoIXNpbmdsZXRvbikgc2luZ2xldG9uID0gbmV3IFNjcm9sbCgpXG5cbiAgaWYgKGNiKSBzaW5nbGV0b24uYWRkKGNiLGtleSlcblxuICBpZiAoc2luZ2xldG9uLmhhbmRsZXJzIDwgMSAmJiBlbmFibGUpe1xuICAgIHNpbmdsZXRvbi5kZWJvdW5jZSgpXG4gICAgc2luZ2xldG9uLmVuYWJsZSgpXG4gIH1cblxuICByZXR1cm4gYmFzZSA/IFNjcm9sbCA6IHNpbmdsZXRvblxufVxuIiwiaW1wb3J0IHNjcm9sbCBmcm9tICdyYWYtc2Nyb2xsLmpzJ1xuXG5jb25zdCBpbWdJWCA9ICdodHRwczovL21heHJvbG9uLmltZ2l4Lm5ldC8nXG5cbmNvbnN0IGxvYWRJbiA9IChlbCkgPT4ge1xuICBjb25zdCBzcmMgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJylcbiAgaWYgKCFzcmMpIHJldHVybjtcbiAgbGV0IHdpZHRoID0gTWF0aC5jZWlsKCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCAqICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxKSApXG4gIC8vcm91bmQgdG8gbmV4dCAxMDBweCBpbnRlcnZhbFxuICB3aWR0aCA9IE1hdGguY2VpbCh3aWR0aC8xMDApKjEwMFxuICBjb25zdCBleHRVcmwgPSBgJHtpbWdJWH0ke3NyY30/dz0ke3dpZHRofSZxPTYwYDtcbiAgY29uc3QgbG9hZGVyID0gbmV3IEltYWdlKClcbiAgbG9hZGVyLm9ubG9hZCA9ICgpID0+IHtcbiAgICBlbC5zcmMgPSBleHRVcmxcbiAgfVxuICBsb2FkZXIuc3JjID0gZXh0VXJsXG59XG5cbmNvbnN0IGdldE9mZnNldCA9IChlbCwgd2luPXdpbmRvdywgZG9jRWxlbT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGJveD1mYWxzZSkgPT4gKFxuICBib3ggPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgYm94LnRvcCArICh3aW4ucGFnZVlPZmZzZXQgfHwgZG9jRWxlbS5zY3JvbGxUb3ApIC0gKGRvY0VsZW0uY2xpZW50VG9wIHx8IDApXG4pXG5cbmNvbnN0IGdldFdIZWlnaHQgPSAoKSA9PiBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgMClcblxuY29uc3QgY2FjaGVPZmZzZXRzID0gZWwgPT4gZWwub2Zmc2V0WSA9IGdldE9mZnNldChlbClcblxuY29uc3Qgc3RhcnQgPSAoZSA9IHt9KSA9PiB7XG4gIGNvbnN0IGltYWdlcyA9IFtdLnNsaWNlLmNhbGwoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNyY10nKSApXG4gICAgLnJlZHVjZSggKG9iaiwgZWwsIGkpID0+IChvYmpbaV0gPSBlbCwgb2JqKSwge30pXG4gIGxldCB3SGVpZ2h0O1xuICBsZXQgZ2V0QWxsT2Zmc2V0cztcbiAgKGdldEFsbE9mZnNldHMgPSBmdW5jdGlvbigpe1xuICAgIGZvciAoIGxldCBpIGluIGltYWdlcyl7XG4gICAgICBjYWNoZU9mZnNldHMoIGltYWdlc1tpXSApXG4gICAgfVxuICAgIHdIZWlnaHQgPSBnZXRXSGVpZ2h0KClcbiAgfSkoKTtcbiAgbGV0IGNoZWNrO1xuICBzY3JvbGwoY2hlY2sgPSBmdW5jdGlvbih5KXtcbiAgICBmb3IgKCBsZXQgaSBpbiBpbWFnZXMpe1xuICAgICAgaWYgKCBpbWFnZXNbaV0ub2Zmc2V0WSA8ICggeSArIHdIZWlnaHQpICl7XG4gICAgICAgIGxvYWRJbiggaW1hZ2VzW2ldIClcbiAgICAgICAgZGVsZXRlIGltYWdlc1tpXVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZ2V0QWxsT2Zmc2V0cylcbn1cblxuY29uc3QgZGVsYXkgPSAoKSA9PiBzZXRUaW1lb3V0KHN0YXJ0LCA1MDApXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBkZWxheSlcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIiBcbiAgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSBcImxvYWRlZFwiIFxuICB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiaW50ZXJhY3RpdmVcIikge1xuICBkZWxheSgpXG59XG4iXX0=
