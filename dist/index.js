(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$base = _ref.base,
      base = _ref$base === undefined ? false : _ref$base,
      _ref$reset = _ref.reset,
      reset = _ref$reset === undefined ? false : _ref$reset,
      _ref$enable = _ref.enable,
      enable = _ref$enable === undefined ? true : _ref$enable;

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

var imgIX = 'https://maxrolon.tiny.pictures/main/';

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
  var win = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;
  var docElem = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document.documentElement;
  var box = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return box = el.getBoundingClientRect(), box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0);
};

var getWHeight = function getWHeight() {
  return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
};

var cacheOffsets = function cacheOffsets(el) {
  return el.offsetY = getOffset(el);
};

var start = function start() {
  var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcmFmLXNjcm9sbC5qcy9zcmMvaW5kZXguanMiLCJzcmMvanMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUEsSUFBSSxlQUFlLE9BQU8scUJBQTFCO0FBQ0EsSUFBSSxjQUFlLE9BQU8sb0JBQTFCOztBQUVBLElBQUksa0JBQUo7QUFBQSxJQUFlLGlCQUFmO0FBQUEsSUFBeUIsbUJBQXpCO0FBQUEsSUFBcUMscUJBQXJDOztJQUVNLE07QUFDSixvQkFBYTtBQUFBOztBQUFBOztBQUNYLFNBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLEtBQXJCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsQ0FBQyxDQUFkO0FBQ0EsU0FBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLFNBQUssUUFBTCxHQUFnQixDQUFoQjtBQUNBLFNBQUssU0FBTCxHQUFpQixLQUFqQjs7QUFFQSxlQUFXO0FBQUEsYUFBTSxNQUFLLFFBQUwsRUFBTjtBQUFBLEtBQVg7QUFDQSxpQkFBYTtBQUFBLGFBQU0sTUFBSyxVQUFMLEVBQU47QUFBQSxLQUFiO0FBQ0EsbUJBQWU7QUFBQSxhQUFNLE1BQUssWUFBTCxFQUFOO0FBQUEsS0FBZjtBQUNEOztBQUVEOzs7Ozs7Ozs7Ozt3QkFPSSxFLEVBQUcsRyxFQUFJO0FBQ1QsV0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixFQUFoQjtBQUNEOztBQUVEOzs7Ozs7NkJBR1E7QUFDTixhQUFPLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLFFBQWxDO0FBQ0EsZUFBUyxJQUFULENBQWMsZ0JBQWQsQ0FBK0IsV0FBL0IsRUFBNEMsUUFBNUM7QUFDQSxXQUFLLFFBQUw7QUFDRDs7OzhCQUNRO0FBQ1AsYUFBTyxtQkFBUCxDQUEyQixRQUEzQixFQUFxQyxRQUFyQztB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NUIsRUFFMkM7QUFDekM7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImxldCByZXF1ZXN0RnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5sZXQgY2FuY2VsRnJhbWUgID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lXG5cbmxldCBzaW5nbGV0b24sIGRlYm91bmNlLCBkZXRlY3RJZGxlLCBoYW5kbGVTY3JvbGxcblxuY2xhc3MgU2Nyb2xse1xuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMucXVldWUgPSBbXVxuICAgIHRoaXMudGlja0lkID0gZmFsc2VcbiAgICB0aGlzLnNjcm9sbENoYW5nZWQgPSBmYWxzZVxuICAgIHRoaXMucHJldlkgPSAtMVxuICAgIHRoaXMudGltZW91dCA9IG51bGxcbiAgICB0aGlzLmhhbmRsZXJzID0gMFxuICAgIHRoaXMubGFzdEVycm9yID0gZmFsc2VcblxuICAgIGRlYm91bmNlID0gKCkgPT4gdGhpcy5kZWJvdW5jZSgpXG4gICAgZGV0ZWN0SWRsZSA9ICgpID0+IHRoaXMuZGV0ZWN0SWRsZSgpXG4gICAgaGFuZGxlU2Nyb2xsID0gKCkgPT4gdGhpcy5oYW5kbGVTY3JvbGwoKVxuICB9XG5cbiAgLypcbiAgICogQWRkIGZ1bmN0aW9ucyBpbnRvIGFuIGFycmF5LlxuICAgKiBUaGVzZSB3aWxsIGJlIGNhbGxlZCBpbiB0aGUgUkFGXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiIGZ1bmN0aW9uIHRvIGNhbGxcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBrZXkgdG8gcmVmZXJlbmNlIHRoZSBmdW5jdGlvbiAodG9kbylcbiAgICovXG4gIGFkZChjYixrZXkpe1xuICAgIHRoaXMucXVldWUucHVzaChjYilcbiAgfVxuXG4gIC8qIFRyYWNrcyB0aGUgZXZlbnQgaGFuZGxlcnMgYXR0YWNoZWQgdmlhXG4gICAqIHRoaXMgbW9kdWxlXG4gICAqL1xuICBlbmFibGUoKXtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZGVib3VuY2UpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkZWJvdW5jZSlcbiAgICB0aGlzLmhhbmRsZXJzKytcbiAgfVxuICBkaXNhYmxlKCl7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGRlYm91bmNlKVxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZGVib3VuY2UpXG4gICAgdGhpcy5oYW5kbGVycy0tXG4gIH1cbiAgZGVib3VuY2UoKXtcbiAgICBpZiAodGhpcy50aWNrSWQpe1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmhhbmRsZXJzID4gMCkgdGhpcy5kaXNhYmxlKClcbiAgICAgIHRoaXMudGljaygpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICB0aWNrKCl7XG4gICAgaWYgKHRoaXMudGlja0lkKXtcbiAgICAgIHRoaXMuZXJyb3IoJ3JlcXVlc3RGcmFtZSBjYWxsZWQgd2hlbiBvbmUgZXhpc3RzIGFscmVhZHknKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRpY2tJZCA9IHJlcXVlc3RGcmFtZShoYW5kbGVTY3JvbGwpIHx8IHRydWVcbiAgICB9XG4gIH1cblxuICAvKiBUaGUgbnV0cyBuJyBib2x0cy4gVGhpcyBpcyB0aGUgUkFGIHRoYXRcbiAgICogY2FsbHMgZWFjaCBmdW5jdGlvbiBpbiB0aGUgcXVldWUuIEVhY2ggZnVuY3Rpb25cbiAgICogaXMgcGFzc2VkIHRoZSBjdXJyZW50IG9mZnNldCB2YWx1ZSBhbmQgdGhlIGxhc3RcbiAgICogcmVjb3JkZWQgb2Zmc2V0IHZhbHVlIChvZnRlbiB0aGUgc2FtZSBkZXBlbmRpbmcpXG4gICAqIG9uIHRoZSBzcGVlZCBvZiB0aGUgc2Nyb2xsKVxuICAgKi9cbiAgaGFuZGxlU2Nyb2xsKCl7XG4gICAgbGV0IHkgPSB3aW5kb3cucGFnZVlPZmZzZXRcbiAgICB0aGlzLnF1ZXVlLmZvckVhY2goIGZuID0+IGZuKHksIHRoaXMucHJldlkpIClcblxuICAgIHRoaXMuc2Nyb2xsQ2hhbmdlZCA9IGZhbHNlXG4gICAgaWYgKHRoaXMucHJldlkgIT0geSl7XG4gICAgICB0aGlzLnNjcm9sbENoYW5nZWQgPSB0cnVlXG4gICAgICB0aGlzLnByZXZZID0geVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNjcm9sbENoYW5nZWQpe1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgIHRoaXMudGltZW91dCA9IG51bGxcbiAgICB9IGVsc2UgaWYgKCF0aGlzLnRpbWVvdXQpe1xuICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChkZXRlY3RJZGxlLCAyMDApXG4gICAgfVxuXG4gICAgdGhpcy50aWNrSWQgPSBmYWxzZVxuICAgIHRoaXMudGljaygpXG4gIH1cblxuICAvKiBJZiB0aGUgdXNlciBoYXNuJ3Qgc2Nyb2xsZWQgaW4gYSB3aGlsZVxuICAgKiB3ZSB3YW50IHRvIGV4aXQgb3V0IG9mIHRoZSBSQUYgcmVxdWVuY2VcbiAgICogYW5kIHJlLWF0dGFjaCBldmVudCBiaW5kaW5nc1xuICAgKi9cbiAgZGV0ZWN0SWRsZSgpe1xuICAgIGNhbmNlbEZyYW1lKHRoaXMudGlja0lkKVxuICAgIHRoaXMudGlja0lkID0gbnVsbFxuICAgIHRoaXMuZW5hYmxlKClcbiAgfVxuICBlcnJvcihtc2cpe1xuICAgIHRoaXMubGFzdEVycm9yID0gbXNnXG4gICAgY29uc29sZS53YXJuKG1zZylcbiAgfVxuXG4gIC8qXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHN0YXRpYyBpc1N1cHBvcnRlZCgpe1xuICAgIGlmICghcmVxdWVzdEZyYW1lKSB7XG4gICAgICBbJ21zJywgJ21veicsICd3ZWJraXQnLCAnbyddLmV2ZXJ5KHByZWZpeCA9PiB7XG4gICAgICAgIHJlcXVlc3RGcmFtZSA9IHdpbmRvd1twcmVmaXggKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgIGNhbmNlbEZyYW1lICA9IHdpbmRvd1twcmVmaXggKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dbcHJlZml4ICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICByZXR1cm4gIXJlcXVlc3RGcmFtZTtcbiAgICAgIH0pXG5cbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3RGcmFtZVxuICB9XG59XG5cbi8qXG4gKiBUaGlzIHNpbmdsZXRvbiBwYXR0ZXJuXG4gKiBhbGxvd3MgdXMgdG8gdW5pdCB0ZXN0IHRoZSBtb2R1bGVcbiAqIGJ5IGV4cG9zaW5nIGFsbCBtZXRob2RzLiBUaGUgcmVzZXQgcHJvcGVydHlcbiAqIGFsbG93cyB1cyB0byByZXNldCB0aGUgc3RhdGUgb2YgdGhlIHNpbmdsZXRvblxuICogYmV0d2VlbiB0ZXN0cy4uIE1heSBiZSB1c2VmdWwgb3V0c2lkZSBvZiB0aGUgXG4gKiB0ZXN0aW5nIGNvbnRleHQ/XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2IgZnVuY3Rpb24gdG8gYWRkIHRvIHF1ZXVlXG4gKiBAcGFyYW0ge2tleX0ga2V5IGtleSB0byByZWZlcmVuY2UgdGhlIGZ1bmN0aW9uIGluIHRoZSBxdWV1ZVxuICogQHBhcmFtIHtib29sfSBvYmo6YmFzZSBSZXR1cm4gdGhlIGJhc2UgY2xhc3Mgb3IgdGhlIHNpbmdsZXRvbj9cbiAqIEBwYXJhbSB7Ym9vbH0gb2JqOnJlc2V0IFJlc2V0IHRoZSBzaW5nbGV0b24gc28gdGhhdCBhIG5ldyBpbnN0YW5jZSBpbiBjcmVhdGVkXG4gKiBAcGFyYW0ge2Jvb2x9IG9iajplbmFibGUgRW5hYmxlIHRoZSBldmVudCBoYW5kbGVyIGFuZCBzdGFydCB0aGUgYW5pbWF0aW9uIGZyYW1lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChjYj1mYWxzZSxrZXk9ZmFsc2Use2Jhc2U9ZmFsc2UscmVzZXQ9ZmFsc2UsZW5hYmxlPXRydWV9PXt9KSA9PiB7IFxuICBpZiAocmVzZXQpIHNpbmdsZXRvbiA9IG51bGxcblxuICBpZiAoICFTY3JvbGwuaXNTdXBwb3J0ZWQoKSApe1xuICAgIGNvbnNvbGUud2FybignUmVxdWVzdCBBbmltYXRpb24gRnJhbWUgbm90IHN1cHBvcnRlZCcpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoIXNpbmdsZXRvbikgc2luZ2xldG9uID0gbmV3IFNjcm9sbCgpXG5cbiAgaWYgKGNiKSBzaW5nbGV0b24uYWRkKGNiLGtleSlcblxuICBpZiAoc2luZ2xldG9uLmhhbmRsZXJzIDwgMSAmJiBlbmFibGUpe1xuICAgIHNpbmdsZXRvbi5kZWJvdW5jZSgpXG4gICAgc2luZ2xldG9uLmVuYWJsZSgpXG4gIH1cblxuICByZXR1cm4gYmFzZSA/IFNjcm9sbCA6IHNpbmdsZXRvblxufVxuIiwiaW1wb3J0IHNjcm9sbCBmcm9tICdyYWYtc2Nyb2xsLmpzJ1xuXG5jb25zdCBpbWdJWCA9ICdodHRwczovL21heHJvbG9uLnRpbnkucGljdHVyZXMvbWFpbi8nXG5cbmNvbnN0IGxvYWRJbiA9IChlbCkgPT4ge1xuICBjb25zdCBzcmMgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJylcbiAgaWYgKCFzcmMpIHJldHVybjtcbiAgbGV0IHdpZHRoID0gTWF0aC5jZWlsKCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCAqICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxKSApXG4gIC8vcm91bmQgdG8gbmV4dCAxMDBweCBpbnRlcnZhbFxuICB3aWR0aCA9IE1hdGguY2VpbCh3aWR0aC8xMDApKjEwMFxuICBjb25zdCBleHRVcmwgPSBgJHtpbWdJWH0ke3NyY30/dz0ke3dpZHRofSZxPTYwYDtcbiAgY29uc3QgbG9hZGVyID0gbmV3IEltYWdlKClcbiAgbG9hZGVyLm9ubG9hZCA9ICgpID0+IHtcbiAgICBlbC5zcmMgPSBleHRVcmxcbiAgfVxuICBsb2FkZXIuc3JjID0gZXh0VXJsXG59XG5cbmNvbnN0IGdldE9mZnNldCA9IChlbCwgd2luPXdpbmRvdywgZG9jRWxlbT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGJveD1mYWxzZSkgPT4gKFxuICBib3ggPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgYm94LnRvcCArICh3aW4ucGFnZVlPZmZzZXQgfHwgZG9jRWxlbS5zY3JvbGxUb3ApIC0gKGRvY0VsZW0uY2xpZW50VG9wIHx8IDApXG4pXG5cbmNvbnN0IGdldFdIZWlnaHQgPSAoKSA9PiBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgMClcblxuY29uc3QgY2FjaGVPZmZzZXRzID0gZWwgPT4gZWwub2Zmc2V0WSA9IGdldE9mZnNldChlbClcblxuY29uc3Qgc3RhcnQgPSAoZSA9IHt9KSA9PiB7XG4gIGNvbnN0IGltYWdlcyA9IFtdLnNsaWNlLmNhbGwoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNyY10nKSApXG4gICAgLnJlZHVjZSggKG9iaiwgZWwsIGkpID0+IChvYmpbaV0gPSBlbCwgb2JqKSwge30pXG4gIGxldCB3SGVpZ2h0O1xuICBsZXQgZ2V0QWxsT2Zmc2V0cztcbiAgKGdldEFsbE9mZnNldHMgPSBmdW5jdGlvbigpe1xuICAgIGZvciAoIGxldCBpIGluIGltYWdlcyl7XG4gICAgICBjYWNoZU9mZnNldHMoIGltYWdlc1tpXSApXG4gICAgfVxuICAgIHdIZWlnaHQgPSBnZXRXSGVpZ2h0KClcbiAgfSkoKTtcbiAgbGV0IGNoZWNrO1xuICBzY3JvbGwoY2hlY2sgPSBmdW5jdGlvbih5KXtcbiAgICBmb3IgKCBsZXQgaSBpbiBpbWFnZXMpe1xuICAgICAgaWYgKCBpbWFnZXNbaV0ub2Zmc2V0WSA8ICggeSArIHdIZWlnaHQpICl7XG4gICAgICAgIGxvYWRJbiggaW1hZ2VzW2ldIClcbiAgICAgICAgZGVsZXRlIGltYWdlc1tpXVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZ2V0QWxsT2Zmc2V0cylcbn1cblxuY29uc3QgZGVsYXkgPSAoKSA9PiBzZXRUaW1lb3V0KHN0YXJ0LCA1MDApXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBkZWxheSlcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIiBcbiAgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSBcImxvYWRlZFwiIFxuICB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09IFwiaW50ZXJhY3RpdmVcIikge1xuICBkZWxheSgpXG59XG4iXX0=
