/*! snapshot - v0.1.0 - 2012-11-21
* https://github.com/twolfson/snapshot
* Copyright (c) 2012 Todd Wolfson; Licensed MIT */

/*! iframe2image - v0.1.0 - 2012-11-18
* https://github.com/twolfson/iframe2image
* Copyright (c) 2012 Todd Wolfson; Licensed MIT */

(function() {
  "use strict";

  var supportsCSSText = getComputedStyle(document.body).cssText !== "";

  function copyCSS(elem, origElem, log) {

    var computedStyle = getComputedStyle(origElem);

    if(supportsCSSText) {
      elem.style.cssText = computedStyle.cssText;

    } else {

      // Really, Firefox?
      for(var prop in computedStyle) {
        if(isNaN(parseInt(prop, 10)) && typeof computedStyle[prop] !== 'function' && !(/^(cssText|length|parentRule)$/).test(prop)) {
          elem.style[prop] = computedStyle[prop];
        }
      }

    }

  }

  function inlineStyles(elem, origElem) {

    var children = elem.querySelectorAll('*');
    var origChildren = origElem.querySelectorAll('*');

    // copy the current style to the clone
    copyCSS(elem, origElem, 1);

    // collect all nodes within the element, copy the current style to the clone
    Array.prototype.forEach.call(children, function(child, i) {
      copyCSS(child, origChildren[i]);
    });

    // strip margins from the outer element
    elem.style.margin = elem.style.marginLeft = elem.style.marginTop = elem.style.marginBottom = elem.style.marginRight = '';

  }

  window.domvas = {

    toImage: function(origElem, callback, width, height, left, top) {

      left = (left || 0);
      top = (top || 0);

      var elem = origElem.cloneNode(true);

      // inline all CSS (ugh..)
      inlineStyles(elem, origElem);

      // unfortunately, SVG can only eat well formed XHTML
      elem.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

      // serialize the DOM node to a String
      var serialized = new XMLSerializer().serializeToString(elem);

      // Create well formed data URL with our DOM string wrapped in SVG
      var dataUri = "data:image/svg+xml," +
        "<svg xmlns='http://www.w3.org/2000/svg' width='" + ((width || origElem.offsetWidth) + left) + "' height='" + ((height || origElem.offsetHeight) + top) + "'>" +
          "<foreignObject width='100%' height='100%' x='" + left + "' y='" + top + "'>" +
          serialized +
          "</foreignObject>" +
        "</svg>";

      // create new, actual image
      var img = new Image();
      img.src = dataUri;

      // when loaded, fire onload callback with actual image node
      img.onload = function() {
        if(callback) {
          callback.call(this, this);
        }
      };

    }

  };

})();


(function(exports) {

  /**
   * Convert an iframe to an image
   * @param {Object|HtmlElement} params If it is an object, properties will be looked up. If it is an iframe, it will be converted into an image.
   * @param {HTMLElement} params.iframe Iframe to convert over
   * @param {Function} cb Callback to execute once iframe is converted
   * @callback arguments[0] Error if any occurred
   * @callback arguments[1] Image element of rendered content
   */
  function iframe2image(params, cb) {
    var iframe = params.iframe || params;

    // TODO: Detect if iframe has already loaded
    iframe.onload = function () {
      // Grab the body of the element
      var iframeBody = iframe.contentWindow.document.body;

      // Obtain the dimensions of the iframe
      // TODO: Cross-browser this (even though domvas uses exactly this)
      // TODO: Allow for specification of iframe dimension, body dimensions, or custom
      var iframeStyle = getComputedStyle(iframe),
          iframeHeight = parseInt(iframeStyle.height, '10'),
          iframeWidth = parseInt(iframeStyle.width, '10');

      // Convert the DOM body via domvas
      domvas.toImage(iframeBody, function (img) {
        // Callback with the image
        cb(null, img);
      }, iframeWidth, iframeHeight);
    };
  }
  exports.iframe2image = iframe2image;

}(typeof exports === 'object' && exports || this));

(function(exports) {

  /**
   * @param {String|Object} options If string, this will be the URL to take a snapshot of
   * @param {String} options.url Url to take a snapshot of
   * TODO: Options with respect to snapshot height and width
   * @param {Function} cb Function to callback snapshot with
   * @callback {Error|null} Error if there is any
   * @callback {Image} Image element containing snapshot of the URL
   */
  function snapshot(options, cb) {
    // Fallback options to a flat URL
    var url = options.url || options;

    // Create an iframe for drawing
    var iframe = document.createElement('iframe'),
        body = document.body;

    // Expand it out to 100%
    // TODO: Expand even bigger?
    iframe.height = window.innerHeight;
    iframe.width = window.innerWidth;

    // Hide the image for flicker
    iframe.style.cssText = 'display: none;';

    // Append the iframe to the DOM
    body.appendChild(iframe);

    // Load the url within the iframe
    iframe.setAttribute('src', url);

    // Convert the item to an image
    iframe2image(iframe, function (err, img) {
      // Remove the iframe
      body.removeChild(iframe);

      // Callback with result
      return cb.apply(this, arguments);
    });
  }

  // Expose snapshot
  exports.snapshot = snapshot;

}(typeof exports === 'object' && exports || this));
