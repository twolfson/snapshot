/*
 * snapshot
 * https://github.com/twolfson/snapshot
 *
 * Copyright (c) 2012 Todd Wolfson
 * Licensed under the MIT license.
 */

(function(exports) {

  function snapshot(options, cb) {
    // Fallback options to a flat URL
    var url = options.url || options;

    // Create an iframe for drawing
    var iframe = document.createElement('iframe'),
        body = document.body;

    // Expand it out to 100%
    // TODO: Expand even bigger?
    iframe.height = 700;
    iframe.width = 700;

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

}(typeof exports === 'object' && exports || this));
