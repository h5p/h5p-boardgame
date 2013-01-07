// Will render a Board game.

// Options format:
// {
//   title: "Title for board game",
// ...
// }

H5P = H5P || {};

H5P.Boardgame = function (options) {
  if ( !(this instanceof H5P.Boardgame) )
    return new H5P.Boardgame(options);

  var defaults = {
    title: ""
  };
  var template = new EJS({url: '../views/Boardgame.ejs'});
  var params = jQuery.extend({}, defaults, options);

  // Function for attaching the multichoice to a DOM element.
  var _attach = function (targetId) {
    // TODO: Randomize answers

    // Render own DOM into target.
    template.update(targetId, params);
    // Set event listeners.
  }

  return {
    attach: _attach // Attach to DOM object
  , options: options // Might be useful to inspect options from construction
  , defaults: defaults // Provide defaults for inspection
  };
}
