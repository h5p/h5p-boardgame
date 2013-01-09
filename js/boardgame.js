// Will render a Board game.

// Options format:
// {
//   title: "Title for board game",
// ...
// }

var example_options = {
  hotspots: [{
    title: 'Tromsø IL',
    position: {x: 20, y: 20, w: 30, h: 35},
    image: "http://dl.dropbox.com/u/324340/tabell/tromso.png",
    action: {
      machineName: 'H5P.QuestionSet',
      options: {
        title: "Tromsø IL",
        progressType: "dots",
        questions: [{
          machineName: 'H5P.MultiChoice',
          options: {
            title: "Forsvar",
            question: "Hvem av disse spiller i forsvar for TIL",
            answers: [{
              text: "Miika Koppinen",
              correct: true
            }, {
              text: "Fredrik Björck",
              correct: false
            }, {
              text: "Saliou Ciss",
              correct: true
            }, {
              text: "Ruben Yttergård Jenssen",
              correct: false
            }]
          }
        }, {
          machineName: 'H5P.MultiChoice',
          options: {
            title: "Medaljer",
            question: "Når tok TIL sist medalje i Tippeligaen?",
            singleAnswer: true,
            answers: [{
              text: "2009",
              correct: false
            }, {
              text: "2010",
              correct: false
            }, {
              text: "2011",
              correct: true
            }, {
              text: "2012",
              correct: false
            }]
          }
        }]
      }
    }
  }, {
    title: "Aalesunds FK",
    position: {x: 100, y: 56, w: 30, h:35},
    image: "http://dl.dropbox.com/u/324340/tabell/aafk.png",
    action: {
      machineName: 'H5P.QuestionSet',
      options: {
        title: "Aalesunds FK",
        progressType: "textual",
        questions: [{
          machineName: 'H5P.MultiChoice',
          options: {
            title: "Forsvar",
            question: "Hvem av disse spiller i forsvar for Aafk",
            answers: [{
              text: "Spiller 1",
              correct: true
            }, {
              text: "Spiller 2",
              correct: false
            }, {
              text: "Spiller 3",
              correct: true
            }, {
              text: "Spiller 4",
              correct: false
            }]
          }
        }, {
          machineName: 'H5P.MultiChoice',
          options: {
            title: "Medaljer",
            question: "Når tok Aafk sist medalje i Tippeligaen?",
            singleAnswer: true,
            answers: [{
              text: "2009",
              correct: false
            }, {
              text: "2010",
              correct: false
            }, {
              text: "2011",
              correct: false
            }, {
              text: "Aafk har aldri tatt medalje",
              correct: true
            }]
          }
        }]
      }
    }
  }]
};

window.H5P = window.H5P || {};

H5P.Boardgame = function (options) {
  if ( !(this instanceof H5P.Boardgame) )
    return new H5P.Boardgame(options);

  function HotSpot(dom, hs_params) {
    var defaults = {
      "title": "Hotspot",
      "image": "",
      "position": new H5P.Coords(),
      "action": ""
    };
    var that = this;
    var params = jQuery.extend({}, defaults, hs_params);

    // Render HotSpot DOM elements
    var hsd = $('<div class="hotspot"></div>').css({
      left: params.position.x + 'px',
      top: params.position.y + 'px',
      width: params.position.w + 'px',
      height: params.position.h + 'px',
      backgroundImage: 'url(' + params.image + ')'
    });
    hsd.append($('<div class="info"><div class="title">' + params.title + '</div><div class="status"></div></div>'));
    // Insert DOM in BoardGame
    $(".boardgame", dom).append(hsd);

    this.action = new (H5P.classFromName(params.action.machineName))(params.action.options);

    // Attach event handlers
    hsd.hover(function (ev) {
      $(this).addClass('hover');
    }, function (ev) {
      $(this).removeClass('hover');
    }).click(function (ev) {
      // Start action
      // - Create container
      $('.boardgame', dom).append('<div class="action-container" id="action-container"></div>');
      // - Attach action
      that.action.attach('action-container');
    });
  }

  var texttemplate = '' +
'<style type="text/css">' +
'.boardgame {' +
'  position: relative;' +
'  background: #85e;' +
'  width: 100%;' +
'  height: 100%;' +
'}' +
'.hotspot {' +
'  position: absolute;' +
'  outline: 2px solid purple;' +
'  z-index: 2;' +
'}' +
'.hotspot .info {' +
'  display: none;' +
'  z-index: 100;' +
'}' +
'.hotspot.hover .info {' +
'  display: block;' +
'}' +
'.action-container {' +
'  position: relative;' +
'  z-index: 100;' +
'  width: 100%;' +
'  height: 100%;' +
'  background: rgba(255, 255, 255, 0.8);' +
'}' +
'.action-container .questionset {' +
'  float: right;' +
'  width: 50%;' +
'  background: white;' +
'  border: 1px solid #eaea00;' +
'}' +
'</style>' +
'<div class="boardgame" id="boardgame">' +
'</div>' +
  '';

  var defaults = {
    title: "",
    background: "",
    splashScreen: "",
    hotspots: [],
    extras: []
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
    // Add hotspots.
    for (var i = params.hotspots.length - 1; i >= 0; i--) {
      var spot = new HotSpot(myDom, params.hotspots[i]);
    }

    // Start extras
    for (var j = params.extras.length - 1; j >= 0; j--) {
      var a = (H5P.classFromName(params.extras[j].name))(myDom, params.extras[j].options);
    }

    return this;
  };

  return {
    attach: attach, // Attach to DOM object
    defaults: defaults // Provide defaults for inspection
  };
};
