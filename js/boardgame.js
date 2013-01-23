// Will render a Board game.

// Options format:
// {
//   title: "Title for board game",
// ...
// }

window.H5P = window.H5P || {};

H5P.Boardgame = function (options, contentId) {
  if ( !(this instanceof H5P.Boardgame) )
    return new H5P.Boardgame(options, contentId);

  var $ = H5P.jQuery;
  var cp = H5P.getContentPath(contentId);

  //
  // An internal Object only available to Board games.
  //
  function HotSpot(dom, hs_params) {
    var defaults = {
      "title": "Hotspot",
      "image": "",
      "position": new H5P.Coords(),
      "action": ""
    };
    var that = this;
    var params = $.extend({}, defaults, hs_params);

    // Render HotSpot DOM elements
    var $hsd = $('<div class="hotspot"></div>');
    $hsd.append($('<div class="info"><div class="title">' + params.title + '</div><div class="status"></div><div class="score"></div></div>'));
    // Insert DOM in BoardGame
    $(".boardgame", dom).append($hsd);
    $hsd.css({
      left: hs_params.coords.x + 'px',
      top: hs_params.coords.y + 'px',
      width: hs_params.coords.w + 'px',
      height: hs_params.coords.h + 'px',
      backgroundImage: 'url(' + cp + hs_params.image + ')'
    });

    this.action = new (H5P.classFromName(params.action.machineName))(params.action.options, contentId);

    // Attach event handlers
    $hsd.hover(function (ev) {
      $(this).addClass('hover');
    }, function (ev) {
      $(this).removeClass('hover');
    }).click(function (ev) {
      // Start action
      // - Create container
      var $container = $('.boardgame', dom).append('<div class="action-container" id="action-container"></div>');
      // - Attach action
      that.action.attach('action-container');
      $(that.action).on('h5pQuestionSetFinished', function (ev, result) {
        $('#action-container', dom).remove();
        // Update score in hotspot info
        $hsd.find('.score').text(result.score);
        // Switch background image to passed image.
        if (result.passed) {
          $hsd.css({backgroundImage: 'url(' + cp + hs_params.passedImage + ')'});
        }
        // Trigger further event to boardgame to calculate total score?
        $(that).trigger('hotspotFinished', result);
      });
    });
  }

  var defaults = {
    title: "",
    background: "",
    width: 635,
    height: 500,
    splashScreen: "",
    hotspots: [],
    extras: []
  };
  var params = $.extend({}, defaults, options);
  var $myDom;

  // Function for attaching the multichoice to a DOM element.
  var attach = function (target) {
    var $target;
    if (typeof(target) == "string") {
      $target = $("#" + target);
    } else {
      $target = $(target);
    }
    // Render own DOM into target.
    $myDom = $target;
    $myDom.html('<div class="boardgame"></div>');
    $('.boardgame', $myDom).css({
      backgroundImage: 'url(' + cp + params.background + ')',
      width: params.width,
      height: params.height
    });

    // Set event listeners.
    // Add hotspots.
    for (var i = params.hotspots.length - 1; i >= 0; i--) {
      var spot = new HotSpot($myDom, params.hotspots[i]);
    }

    // Start extras
    for (var j = params.extras.length - 1; j >= 0; j--) {
      var a = (H5P.classFromName(params.extras[j].name))($myDom, params.extras[j].options);
    }

    return this;
  };

  // Masquerade the main object to hide inner properties and functions.
  var returnObject = {
    attach: attach, // Attach to DOM object
    defaults: defaults // Provide defaults for inspection
  };
  return returnObject;
};
