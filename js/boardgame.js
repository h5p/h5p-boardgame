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

  var texttemplate = '' +
'<div class="boardgame">' +
'  <% if (introduction) { %>' +
'  <div class="boardgame-intro open">' +
'    <div class="bgi-content">' +
'      <h1><%= title %></h1>' +
'      <p><%= introduction.text %></p>' +
'      <a class="button bgi-start"><%= introduction.startButtonText %></a>' +
'    </div>' +
'  </div>' +
'  <% } %>' +
'</div>' +
  '';
  //
  // An internal Object only available to Board games.
  //
  function HotSpot(dom, hs_params) {
    var defaults = {
      "title": "Hotspot",
      "image": undefined,
      "passedImage": undefined,
      "failedImage": undefined,
      "position": new H5P.Coords(),
      "action": ""
    };
    var that = this;
    var params = $.extend({}, defaults, hs_params);
    this.passed = false;

    // Render HotSpot DOM elements
    var $hsd = $('<a class="hotspot" title="' + params.title + '" href="#" data-title="' + params.title + '"></a>');
    // Insert DOM in BoardGame
    $(".boardgame", dom).append($hsd);
    $hsd.css({
      left: hs_params.coords.x + 'px',
      top: hs_params.coords.y + 'px',
      width: hs_params.coords.w + 'px',
      height: hs_params.coords.h + 'px',
      backgroundImage: 'url(' + cp + hs_params.image.path + ')'
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
        $hsd.attr('title', $hsd.attr('data-title') + ': ' + result.score);
        // Switch background image to passed image.
        that.passed = result.passed;
        if (result.passed) {
          $hsd.css({backgroundImage: 'url(' + cp + hs_params.passedImage.path + ')'});
        } else {
          $hsd.css({backgroundImage: 'url(' + cp + hs_params.failedImage.path + ')'});
        }
        // Trigger further event to boardgame to calculate total score?
        $(that).trigger('hotspotFinished', result);
      });
    });
  }

  var defaults = {
    title: "",
    background: {
      path: '',
      width: 635,
      height: 500
    },
    introduction: false,
    hotspots: [],
    extras: [],
    progress: {
      enabled: false,
      incremental: true,
      includeFailed: false,
      coords: {"x": 0, "y": 0, "w": 200, "h": 100},
      images: []
    }
  };
  var params = $.extend({}, defaults, options);
  var $myDom, $progress;
  var hotspots = new Array();

  var template = new EJS({text: texttemplate});

  // Update progress meter.
  var _updateProgress = function () {
    if (!$progress) {
      return;
    }

    // TODO: This only computes for incremental: true, includeFailed: false.
    var c = 0;
    for (var i = 0; i < hotspots.length; i++) {
      if (hotspots[i].passed) {
        c += 1;
      }
    }
    if (params.progress.images.length > c) {
      $progress.css({backgroundImage: 'url(' + cp + params.progress.images[c].path + ')'});
    }
  };

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
    $myDom.html(template.render(params));
    var $boardgame = $('.boardgame', $myDom);
    $boardgame.css({
      backgroundImage: 'url(' + cp + params.background.path + ')',
      width: params.background.width,
      height: params.background.height
    });

    // Add click handler to start button.
    if (params.introduction) {
      $('.bgi-start', $boardgame).click(function (ev) {
        $('.boardgame-intro', $boardgame).removeClass('open');
      });
    }

    // Add hotspots.
    for (var i = params.hotspots.length - 1; i >= 0; i--) {
      var spot = new HotSpot($myDom, params.hotspots[i]);
      hotspots.push(spot);
      // Set event listeners.
      $(spot).on('hotspotFinished', function (ev, result) {
        console.log("Hotspot is done. Time to calculate total score so far.");
        _updateProgress();
      });
    }

    // Start extras
    for (var j = params.extras.length - 1; j >= 0; j--) {
      var a = (H5P.classFromName(params.extras[j].name))($myDom, params.extras[j].options);
    }

    // Add progress field
    if (params.progress.enabled) {
      $progress = $('<div class="progress"></div>');
      $boardgame.append($progress);
      $progress.css({
        left: params.progress.coords.x + 'px',
        top: params.progress.coords.y + 'px',
        width: params.progress.coords.w + 'px',
        height: params.progress.coords.h + 'px'
      });
      _updateProgress();
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
