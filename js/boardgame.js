var H5P = H5P || {};

/**
 * Will render a Board game.
 *
 * @param {Array} options
 * @param {int} contentId
 * @returns {H5P.Boardgame} Instance
 */
H5P.Boardgame = function (options, contentId) {
  if (!(this instanceof H5P.Boardgame)) {
    return new H5P.Boardgame(options, contentId);
  }

  var $ = H5P.jQuery;
  var cp = H5P.getContentPath(contentId);
  var finished = false;

  var texttemplate =
          '<div class="boardgame">' +
          '  <div class="boardgame-intro open">' +
          '    <div class="bgi-content">' +
          '      <h1><%= title %></h1>' +
          '      <p><%= introduction.text %></p>' +
          '      <div class="buttons">' +
          '        <a class="button bgi-start"><%= introduction.startButtonText %></a>' +
          '      </div>' +
          '    </div>' +
          '  </div>' +
          '</div>';

  // An internal Object only available to Board games.
  function HotSpot(dom, hs_params) {
    var defaults = {
      title: 'Hotspot',
      image: undefined,
      passedImage: undefined,
      failedImage: undefined,
      position: new H5P.Coords(),
      action: ''
    };
    var that = this;
    var params = $.extend({}, defaults, hs_params);
    this.passed = false;

    if (params.action.library === undefined) {
      return;
    }

    // Render HotSpot DOM elements
    var $hsd = $('<a class="hotspot" title="' + params.title + '" href="#" data-title="' + params.title + '"></a>');
    var HSDstyles = {
      left: hs_params.coords.x + 'px',
      top: hs_params.coords.y + 'px'
    };

    if (hs_params.image !== undefined) {
      HSDstyles.width = hs_params.image.width + 'px';
      HSDstyles.height = hs_params.image.height + 'px';
      HSDstyles.background = 'url(' + cp + hs_params.image.path + ') no-repeat';
    }
    else {
      $hsd.addClass('h5p-default');
    }

    // Insert DOM in BoardGame
    $('.boardgame', dom).append($hsd.css(HSDstyles));

    var libraryObject = H5P.libraryFromString(params.action.library);
    this.action = new (H5P.classFromName(libraryObject.machineName))(params.action.params, contentId);

    // Attach event handlers
    $hsd.click(function () {
      // Start action
      // - Create container
      $('.boardgame', dom).append('<div class="action-container" id="action-container"></div>');

      // - Attach action
      that.action.attach('action-container');
      $(that.action).on('h5pQuestionSetFinished', function (ev, result) {
        $('#action-container', dom).remove();
        that.action.reRender();
        // Update score in hotspot info
        $hsd.attr('title', $hsd.attr('data-title') + ': ' + result.score);
        // Switch background image to passed image.
        that.passed = result.passed;
        if (result.passed) {
          if (hs_params.passedImage !== undefined) {
            $hsd.css({backgroundImage: 'url(' + cp + hs_params.passedImage.path + ')'});
          }
          else {
            $hsd.addClass('h5p-passed');
          }
        } else {
          if (hs_params.failedImage !== undefined) {
            $hsd.css({backgroundImage: 'url(' + cp + hs_params.failedImage.path + ')'});
          }
          else {
            $hsd.addClass('h5p-failed');
          }
        }

        // Trigger further event to boardgame to calculate total score?
        $(that).trigger('hotspotFinished', result);
      });
      var $qs = $('.questionset', dom);
      $qs.children('.question-container').css('maxHeight', ($qs.height() - $qs.children('.qs-footer').height() - 20) + 'px');
      return false;
    });
  }

  var defaults = {
    title: 'New game',
    introduction: {
      text: '',
      startButtonText: 'Start'
    },
    size: {
      x: 640,
      y: 320
    },
    hotspots: [],
    extras: [],
    progress: {
      enabled: false,
      coords: {
        x: 0,
        y: 0,
        w: 200,
        h: 100
      },
      images: []
    },
    endVideo: undefined,
    endResults: {
      text: "You scored @score of @total.<br/>That's @percentage%",
      solutionButtonText: 'Show solution',
      retryButtonText: 'Try more'
    }
  };

  var params = $.extend(true, {}, defaults, options);
  var $myDom, $progress;
  var hotspots = [];
  var template = new EJS({text: texttemplate});

  if (H5P.trim(params.introduction.text) === '') {
    params.introduction.text = '&nbsp;';
  }

  // Update progress meter.
  var _updateProgress = function () {
    if (!$progress) {
      return;
    }

    var c = 0;
    for (var i = 0; i < hotspots.length; i++) {
      if (hotspots[i].passed) {
        c += 1;
      }
    }
    if (params.progress.images.length > c) {
      $progress.css({
        backgroundImage: 'url(' + cp + params.progress.images[c].path + ')',
        width: params.progress.images[c].width + 'px',
        height: params.progress.images[c].height + 'px'
      });
    }
  };

  var _checkIfFinished = function () {
    if (finished) {
      return false;
    }
    var c = 0;
    for (var i = 0; i < hotspots.length; i++) {
      if (hotspots[i].passed) {
        c += 1;
      }
    }
    if (c === hotspots.length) {
      // We're done. Start endgame
      _displayEndGame();
      finished = true;
    }
    return finished;
  };

  var _displayEndGame = function () {
    var displayResults = function () {
      // Calculate final scores
      var total = 0, score = 0, percentage;
      for (var i = 0; i < hotspots.length; i++) {
        var spot = hotspots[i];
        total += spot.action.totalScore();
        score += spot.action.getScore();
      }
      percentage = Math.floor(100*score/total);

      var str = params.endResults.text.replace('@score', score).replace('@total', total).replace('@percentage', percentage);
      $('.bgi-content p', $myDom).html(str);

      // Knapp til fasit
      if ($('.bgi-solution', $myDom).length === 0) {
        $('<a class="button bgi-solution">' + params.endResults.solutionButtonText + '</a>').click(function () {
          for (var i = 0; i < params.hotspots.length; i++) {
            hotspots[i].action.showSolutions();
          }
          slideDown();
        }).appendTo('.bgi-content .buttons', $myDom);
      }

      // Knapp til å begynne på nytt
      $('.bgi-content .bgi-start', $myDom).text(params.endResults.retryButtonText);

      // Slutt-text
      $('.boardgame-intro', $myDom).addClass('open').css('bottom', '');
    };

    // Show animation if present
    if (params.gameFinished !== undefined) {
      var $videoContainer = $('<div class="video-container"></div>').appendTo($myDom.children('.boardgame'));

      var video = new H5P.Video({
        files: params.gameFinished.video,
        fitToWrapper: true,
        controls: false,
        autoplay: true
      }, cp);
      video.endedCallback = function () {
        displayResults();
        $videoContainer.hide();
      };
      video.attach($videoContainer);

      if (params.gameFinished.allowSkipVideo) {
        $('<a class="button skip">' + params.gameFinished.skipButtonText + '</a>').click(function () {
          video.stop();
          $videoContainer.hide();
          displayResults();
        }).appendTo($videoContainer);
      }
    }
    else {
      // Show result page.
      displayResults();
    }
  };

  var slideDown = function () {
    var $bgiContent = $('.bgi-content', $myDom);
    var movePercent = ($bgiContent.height() - $bgiContent.children('h1').height()) / (params.size.height / 100);
    $('.boardgame-intro', $myDom).css('bottom', '-' + movePercent + '%').removeClass('open');
  };

  // Function for attaching to a DOM element.
  var attach = function (target) {
    var $target;
    if (typeof(target) === 'string') {
      $target = $('#' + target);
    }
    else {
      $target = $(target);
    }
    // Render own DOM into target.
    $myDom = $target;
    $myDom.html(template.render(params));

    var boardgameStyles = {
      width: params.size.width,
      height: params.size.height
    };
    if (params.background !== undefined) {
      boardgameStyles.background = 'url(' + cp + params.background.path + ') no-repeat';
      boardgameStyles.backgroundSize = params.size.width + 'px ' + params.size.height + 'px';
    }
    var $boardgame = $('.boardgame', $myDom).css(boardgameStyles);

    // Add click handler to start button.
    if (params.introduction) {
      $('.bgi-start', $boardgame).click(function () {
        slideDown();
      });
    }

    // Add hotspots.
    for (var i = params.hotspots.length - 1; i >= 0; i--) {
      var spot = new HotSpot($myDom, params.hotspots[i]);
      hotspots.push(spot);
      // Set event listeners.
      $(spot).on('hotspotFinished', function (ev, result) {
        _updateProgress();
        _checkIfFinished();
      });
    }

    // Start extras
    // for (var j = params.extras.length - 1; j >= 0; j--) {
    //   var a = (H5P.classFromName(params.extras[j].name))($myDom, params.extras[j].options);
    // }

    // Add progress field
    if (params.progress.enabled) {
      $progress = $('<div class="progress"></div>');
      $boardgame.append($progress);
      $progress.css({
        left: params.progress.coords.x + 'px',
        top: params.progress.coords.y + 'px'
      });
      _updateProgress();
    }

    return this;
  };

  // Masquerade the main object to hide inner properties and functions.
  var returnObject = {
    attach: attach, // Attach to DOM object
    endGame: _displayEndGame,
    defaults: defaults // Provide defaults for inspection
  };
  return returnObject;
};