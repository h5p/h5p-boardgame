// Will render a Board game.

// Options format:
// {
//   title: "Title for board game",
// ...
// }

window.H5P = window.H5P || {};

H5P.Boardgame = function (options) {
  if ( !(this instanceof H5P.Boardgame) )
    return new H5P.Boardgame(options);

  var texttemplate = '' +

  '';

  var defaults = {
    title: "",
    background: "",
    splashScreen: "",
    hotspots: []
  };
  var template = new EJS({text: texttemplate});
  var params = jQuery.extend({}, defaults, options);
  var myDom;

  // Function for attaching the multichoice to a DOM element.
  var attach = function (targetId) {
    // Render own DOM into target.
    template.update(targetId, params);
    myDom = jQuery('#' + targetId);

    // Set event listeners.
    // TODO: For each hotspot, add hover and click events.

    // TODO: Start animations

    return this;
  }

  return {
    attach: attach // Attach to DOM object
  , defaults: defaults // Provide defaults for inspection
  };
}
