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
  console.dir(images);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL3JhZi1zY3JvbGwuanMvc3JjL2luZGV4LmpzIiwic3JjL2pzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLElBQUksZUFBZSxPQUFPLHFCQUExQjtBQUNBLElBQUksY0FBZSxPQUFPLG9CQUExQjs7QUFFQSxJQUFJLGtCQUFKO0FBQUEsSUFBZSxpQkFBZjtBQUFBLElBQXlCLG1CQUF6QjtBQUFBLElBQXFDLHFCQUFyQzs7SUFFTSxNO0FBQ0osb0JBQWE7QUFBQTs7QUFBQTs7QUFDWCxTQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsU0FBSyxNQUFMLEdBQWMsS0FBZDtBQUNBLFNBQUssYUFBTCxHQUFxQixLQUFyQjtBQUNBLFNBQUssS0FBTCxHQUFhLENBQUMsQ0FBZDtBQUNBLFNBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7O0FBRUEsZUFBVztBQUFBLGFBQU0sTUFBSyxRQUFMLEVBQU47QUFBQSxLQUFYO0FBQ0EsaUJBQWE7QUFBQSxhQUFNLE1BQUssVUFBTCxFQUFOO0FBQUEsS0FBYjtBQUNBLG1CQUFlO0FBQUEsYUFBTSxNQUFLLFlBQUwsRUFBTjtBQUFBLEtBQWY7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7d0JBT0ksRSxFQUFHLEcsRUFBSTtBQUNULFdBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsRUFBaEI7QUFDRDs7QUFFRDs7Ozs7OzZCQUdRO0FBQ04sYUFBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxRQUFsQztBQUNBLGVBQVMsSUFBVCxDQUFjLGdCQUFkLENBQStCLFdBQS9CLEVBQTRDLFFBQTVDO0FBQ0EsV0FBSyxRQUFMO0FBQ0Q7Ozs4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U0FBUyxVQUFULElBQXVCLGFBRjVCLEVBRTJDO0FBQ3pDO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IHJlcXVlc3RGcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbmxldCBjYW5jZWxGcmFtZSAgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWVcblxubGV0IHNpbmdsZXRvbiwgZGVib3VuY2UsIGRldGVjdElkbGUsIGhhbmRsZVNjcm9sbFxuXG5jbGFzcyBTY3JvbGx7XG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5xdWV1ZSA9IFtdXG4gICAgdGhpcy50aWNrSWQgPSBmYWxzZVxuICAgIHRoaXMuc2Nyb2xsQ2hhbmdlZCA9IGZhbHNlXG4gICAgdGhpcy5wcmV2WSA9IC0xXG4gICAgdGhpcy50aW1lb3V0ID0gbnVsbFxuICAgIHRoaXMuaGFuZGxlcnMgPSAwXG4gICAgdGhpcy5sYXN0RXJyb3IgPSBmYWxzZVxuXG4gICAgZGVib3VuY2UgPSAoKSA9PiB0aGlzLmRlYm91bmNlKClcbiAgICBkZXRlY3RJZGxlID0gKCkgPT4gdGhpcy5kZXRlY3RJZGxlKClcbiAgICBoYW5kbGVTY3JvbGwgPSAoKSA9PiB0aGlzLmhhbmRsZVNjcm9sbCgpXG4gIH1cblxuICAvKlxuICAgKiBBZGQgZnVuY3Rpb25zIGludG8gYW4gYXJyYXkuXG4gICAqIFRoZXNlIHdpbGwgYmUgY2FsbGVkIGluIHRoZSBSQUZcbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2IgZnVuY3Rpb24gdG8gY2FsbFxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IGtleSB0byByZWZlcmVuY2UgdGhlIGZ1bmN0aW9uICh0b2RvKVxuICAgKi9cbiAgYWRkKGNiLGtleSl7XG4gICAgdGhpcy5xdWV1ZS5wdXNoKGNiKVxuICB9XG5cbiAgLyogVHJhY2tzIHRoZSBldmVudCBoYW5kbGVycyBhdHRhY2hlZCB2aWFcbiAgICogdGhpcyBtb2R1bGVcbiAgICovXG4gIGVuYWJsZSgpe1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBkZWJvdW5jZSlcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRlYm91bmNlKVxuICAgIHRoaXMuaGFuZGxlcnMrK1xuICB9XG4gIGRpc2FibGUoKXtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZGVib3VuY2UpXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkZWJvdW5jZSlcbiAgICB0aGlzLmhhbmRsZXJzLS1cbiAgfVxuICBkZWJvdW5jZSgpe1xuICAgIGlmICh0aGlzLnRpY2tJZCl7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaGFuZGxlcnMgPiAwKSB0aGlzLmRpc2FibGUoKVxuICAgICAgdGhpcy50aWNrKClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHRpY2soKXtcbiAgICBpZiAodGhpcy50aWNrSWQpe1xuICAgICAgdGhpcy5lcnJvcigncmVxdWVzdEZyYW1lIGNhbGxlZCB3aGVuIG9uZSBleGlzdHMgYWxyZWFkeScpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGlja0lkID0gcmVxdWVzdEZyYW1lKGhhbmRsZVNjcm9sbCkgfHwgdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIC8qIFRoZSBudXRzIG4nIGJvbHRzLiBUaGlzIGlzIHRoZSBSQUYgdGhhdFxuICAgKiBjYWxscyBlYWNoIGZ1bmN0aW9uIGluIHRoZSBxdWV1ZS4gRWFjaCBmdW5jdGlvblxuICAgKiBpcyBwYXNzZWQgdGhlIGN1cnJlbnQgb2Zmc2V0IHZhbHVlIGFuZCB0aGUgbGFzdFxuICAgKiByZWNvcmRlZCBvZmZzZXQgdmFsdWUgKG9mdGVuIHRoZSBzYW1lIGRlcGVuZGluZylcbiAgICogb24gdGhlIHNwZWVkIG9mIHRoZSBzY3JvbGwpXG4gICAqL1xuICBoYW5kbGVTY3JvbGwoKXtcbiAgICBsZXQgeSA9IHdpbmRvdy5wYWdlWU9mZnNldFxuICAgIHRoaXMucXVldWUuZm9yRWFjaCggZm4gPT4gZm4oeSwgdGhpcy5wcmV2WSkgKVxuXG4gICAgdGhpcy5zY3JvbGxDaGFuZ2VkID0gZmFsc2VcbiAgICBpZiAodGhpcy5wcmV2WSAhPSB5KXtcbiAgICAgIHRoaXMuc2Nyb2xsQ2hhbmdlZCA9IHRydWVcbiAgICAgIHRoaXMucHJldlkgPSB5XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsQ2hhbmdlZCl7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgICAgdGhpcy50aW1lb3V0ID0gbnVsbFxuICAgIH0gZWxzZSBpZiAoIXRoaXMudGltZW91dCl7XG4gICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGRldGVjdElkbGUsIDIwMClcbiAgICB9XG5cbiAgICB0aGlzLnRpY2tJZCA9IGZhbHNlXG4gICAgdGhpcy50aWNrKClcbiAgfVxuXG4gIC8qIElmIHRoZSB1c2VyIGhhc24ndCBzY3JvbGxlZCBpbiBhIHdoaWxlXG4gICAqIHdlIHdhbnQgdG8gZXhpdCBvdXQgb2YgdGhlIFJBRiByZXF1ZW5jZVxuICAgKiBhbmQgcmUtYXR0YWNoIGV2ZW50IGJpbmRpbmdzXG4gICAqL1xuICBkZXRlY3RJZGxlKCl7XG4gICAgY2FuY2VsRnJhbWUodGhpcy50aWNrSWQpXG4gICAgdGhpcy50aWNrSWQgPSBudWxsXG4gICAgdGhpcy5lbmFibGUoKVxuICB9XG4gIGVycm9yKG1zZyl7XG4gICAgdGhpcy5sYXN0RXJyb3IgPSBtc2dcbiAgICBjb25zb2xlLndhcm4obXNnKVxuICB9XG5cbiAgLypcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgc3RhdGljIGlzU3VwcG9ydGVkKCl7XG4gICAgaWYgKCFyZXF1ZXN0RnJhbWUpIHtcbiAgICAgIFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ10uZXZlcnkocHJlZml4ID0+IHtcbiAgICAgICAgcmVxdWVzdEZyYW1lID0gd2luZG93W3ByZWZpeCArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgY2FuY2VsRnJhbWUgID0gd2luZG93W3ByZWZpeCArICdDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8XG4gICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd1twcmVmaXggKyAnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgIHJldHVybiAhcmVxdWVzdEZyYW1lO1xuICAgICAgfSlcblxuICAgIH1cbiAgICByZXR1cm4gcmVxdWVzdEZyYW1lXG4gIH1cbn1cblxuLypcbiAqIFRoaXMgc2luZ2xldG9uIHBhdHRlcm5cbiAqIGFsbG93cyB1cyB0byB1bml0IHRlc3QgdGhlIG1vZHVsZVxuICogYnkgZXhwb3NpbmcgYWxsIG1ldGhvZHMuIFRoZSByZXNldCBwcm9wZXJ0eVxuICogYWxsb3dzIHVzIHRvIHJlc2V0IHRoZSBzdGF0ZSBvZiB0aGUgc2luZ2xldG9uXG4gKiBiZXR3ZWVuIHRlc3RzLi4gTWF5IGJlIHVzZWZ1bCBvdXRzaWRlIG9mIHRoZSBcbiAqIHRlc3RpbmcgY29udGV4dD9cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYiBmdW5jdGlvbiB0byBhZGQgdG8gcXVldWVcbiAqIEBwYXJhbSB7a2V5fSBrZXkga2V5IHRvIHJlZmVyZW5jZSB0aGUgZnVuY3Rpb24gaW4gdGhlIHF1ZXVlXG4gKiBAcGFyYW0ge2Jvb2x9IG9iajpiYXNlIFJldHVybiB0aGUgYmFzZSBjbGFzcyBvciB0aGUgc2luZ2xldG9uP1xuICogQHBhcmFtIHtib29sfSBvYmo6cmVzZXQgUmVzZXQgdGhlIHNpbmdsZXRvbiBzbyB0aGF0IGEgbmV3IGluc3RhbmNlIGluIGNyZWF0ZWRcbiAqIEBwYXJhbSB7Ym9vbH0gb2JqOmVuYWJsZSBFbmFibGUgdGhlIGV2ZW50IGhhbmRsZXIgYW5kIHN0YXJ0IHRoZSBhbmltYXRpb24gZnJhbWVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGNiPWZhbHNlLGtleT1mYWxzZSx7YmFzZT1mYWxzZSxyZXNldD1mYWxzZSxlbmFibGU9dHJ1ZX09e30pID0+IHsgXG4gIGlmIChyZXNldCkgc2luZ2xldG9uID0gbnVsbFxuXG4gIGlmICggIVNjcm9sbC5pc1N1cHBvcnRlZCgpICl7XG4gICAgY29uc29sZS53YXJuKCdSZXF1ZXN0IEFuaW1hdGlvbiBGcmFtZSBub3Qgc3VwcG9ydGVkJylcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmICghc2luZ2xldG9uKSBzaW5nbGV0b24gPSBuZXcgU2Nyb2xsKClcblxuICBpZiAoY2IpIHNpbmdsZXRvbi5hZGQoY2Isa2V5KVxuXG4gIGlmIChzaW5nbGV0b24uaGFuZGxlcnMgPCAxICYmIGVuYWJsZSl7XG4gICAgc2luZ2xldG9uLmRlYm91bmNlKClcbiAgICBzaW5nbGV0b24uZW5hYmxlKClcbiAgfVxuXG4gIHJldHVybiBiYXNlID8gU2Nyb2xsIDogc2luZ2xldG9uXG59XG4iLCJpbXBvcnQgc2Nyb2xsIGZyb20gJ3JhZi1zY3JvbGwuanMnXG5cbmNvbnN0IGltZ0lYID0gJ2h0dHBzOi8vbWF4cm9sb24uaW1naXgubmV0LydcblxuY29uc3QgbG9hZEluID0gKGVsKSA9PiB7XG4gIGNvbnN0IHNyYyA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1zcmMnKVxuICBpZiAoIXNyYykgcmV0dXJuO1xuICBjb25zdCB3aWR0aCA9IE1hdGguY2VpbCggZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggKiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSkgKVxuICBjb25zdCBleHRVcmwgPSBgJHtpbWdJWH0ke3NyY30/dz0ke3dpZHRofSZxPTYwYDtcbiAgY29uc3QgbG9hZGVyID0gbmV3IEltYWdlKClcbiAgbG9hZGVyLm9ubG9hZCA9ICgpID0+IHtcbiAgICBlbC5zcmMgPSBleHRVcmxcbiAgfVxuICBsb2FkZXIuc3JjID0gZXh0VXJsXG59XG5cbmNvbnN0IGdldE9mZnNldCA9IChlbCwgd2luPXdpbmRvdywgZG9jRWxlbT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGJveD1mYWxzZSkgPT4gKFxuICBib3ggPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgYm94LnRvcCArICh3aW4ucGFnZVlPZmZzZXQgfHwgZG9jRWxlbS5zY3JvbGxUb3ApIC0gKGRvY0VsZW0uY2xpZW50VG9wIHx8IDApXG4pXG5cbmNvbnN0IGdldFdIZWlnaHQgPSAoKSA9PiBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgMClcblxuY29uc3QgY2FjaGVPZmZzZXRzID0gZWwgPT4gZWwub2Zmc2V0WSA9IGdldE9mZnNldChlbClcblxuY29uc3Qgc3RhcnQgPSAoZSA9IHt9KSA9PiB7XG4gIGNvbnN0IGltYWdlcyA9IFtdLnNsaWNlLmNhbGwoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNyY10nKSApXG4gICAgLnJlZHVjZSggKG9iaiwgZWwsIGkpID0+IChvYmpbaV0gPSBlbCwgb2JqKSwge30pXG4gIGNvbnNvbGUuZGlyKGltYWdlcylcbiAgbGV0IHdIZWlnaHQ7XG4gIGxldCBnZXRBbGxPZmZzZXRzO1xuICAoZ2V0QWxsT2Zmc2V0cyA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yICggbGV0IGkgaW4gaW1hZ2VzKXtcbiAgICAgIGNhY2hlT2Zmc2V0cyggaW1hZ2VzW2ldIClcbiAgICB9XG4gICAgd0hlaWdodCA9IGdldFdIZWlnaHQoKVxuICB9KSgpO1xuICBsZXQgY2hlY2s7XG4gIHNjcm9sbChjaGVjayA9IGZ1bmN0aW9uKHkpe1xuICAgIGZvciAoIGxldCBpIGluIGltYWdlcyl7XG4gICAgICBpZiAoIGltYWdlc1tpXS5vZmZzZXRZIDwgKCB5ICsgd0hlaWdodCkgKXtcbiAgICAgICAgbG9hZEluKCBpbWFnZXNbaV0gKVxuICAgICAgICBkZWxldGUgaW1hZ2VzW2ldXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBnZXRBbGxPZmZzZXRzKVxufVxuXG5jb25zdCBkZWxheSA9ICgpID0+IHNldFRpbWVvdXQoc3RhcnQsIDUwMClcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGRlbGF5KVxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJjb21wbGV0ZVwiIFxuICB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09IFwibG9hZGVkXCIgXG4gIHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJpbnRlcmFjdGl2ZVwiKSB7XG4gIGRlbGF5KClcbn1cbiJdfQ==
