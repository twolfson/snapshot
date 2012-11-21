/*
 * snapshot
 * https://github.com/twolfson/snapshot
 *
 * Copyright (c) 2012 Todd Wolfson
 * Licensed under the MIT license.
 */

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
