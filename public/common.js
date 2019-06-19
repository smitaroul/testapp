/** global jQuery:true */
window.espn = window.espn || {};
var espni = {};

espni.util = {};

espni.util.find = function(obj, keys) {
    if (!!keys) {
        if (keys instanceof Array) {
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (!!obj) {
                    if (obj instanceof Array && typeof key === "number") {
                        var k = key;
                        if (key < 0) {
                            k = obj.length + key;
                        }
                        if (k >= 0 && k < obj.length) {
                            obj = obj[k];
                        } else {
                            obj = null;
                        }
                    } else {
                        obj = obj[key];
                    }
                } else {
                    break;
                }
            }
        } else {
            obj = obj[keys];
        }
    } else {
        obj = null;
    }
    return obj;
};


espni.ESPNiVodPlayer = (function($) {

  //Plublic api of this module
  var api = {};
  /**
   * initialize event binding to video thumbnail
   * and auto play video if available
   * @return {[type]} [description]
   */
  api.init = function() {
    $("body").on("click", ".video-play-button", onPlayClick);
  };

  function onPlayClick(event) {
		var $this = $(this);
    playFromElement($this, false, event);

  }

  function playFromElement(elem, trueAutoPlayed, event) {
		var $elem = $(elem);
		
		var $container = $elem.parents("figure.video"),
			id = null,
			playerType = null,
			url = null,
			poster = null,
			videoData,
			cerebroId;

		if(!$container.length) {
			$container = $elem.find("figure.video");
			if(!$container.length) {
				return;
			}
		}

		//Attempt to grab based on desktop html
		videoData = getVideoData($container) || {};
		id = videoData.id;
		playerType = videoData.playerType;
		poster = videoData.poster;
		url = videoData.url;
		cerebroId = videoData.cerebroId;

		//Attempt based on Mobile html
		if (!id) {
			id = $elem.data('id');
			playerType = "native";
		}



		var showEndCard = true;	//support for iframe endcard modification
		var adTechOrder = [];

		var cmsSource = 'espn';
		var playerOptions = {
			cms: cmsSource,
			autoplay:true,
			playType:"manual",
			siteSection:'espn',
			url:url,
			imageUrl:poster,
			endCard:showEndCard,
			playRelatedExternally:false,
			shareButtons: "true",
			saveButton: "false",
			advertising: {'adTechOrder': adTechOrder},
			cerebroId: cerebroId
		};


		play({
			video_id: id,
			type: playerType,
			container: $elem,
			allow_docking: false,
			clickEvent: event,
			native_options: playerOptions
    });
    
    window.espn.video.subscribe('espn.video.play', addEventHandlers);
  }

  
  function addEventHandlers() {
    var flag = false, currentTime;
    if (window.espn.video.player) {
            if(window.espn.video.player.embeddedPlayerId) {
              var vidplayerId = window.espn.video.player.embeddedPlayerId + "_html5_api";
              var vidplayer = document.getElementById(vidplayerId);
              vidplayer.addEventListener('timeupdate', function(i){
                console.info('i===',i.target.currentTime, ' parse: ',parseInt(i.target.currentTime));
                currentTime = i.target.currentTime && parseInt(i.target.currentTime);
                if(currentTime === 10 && !flag) {
                  flag = true;
                  $('#quizform').show();
      	          window.espn.video.pause();
                }
              });
            }
          
        }
  }


  function getVideoData($container) {
		var id,
			playerType,
			url,
			poster;

		//Attempt to grab based on desktop html
		if ($container.attr('data-video')) {
			var videoData = $container.data("video");

			if (videoData) {
				videoData = videoData.split(',');
				id = videoData[3];
				playerType = videoData[0];
				for (var i = 0; i < videoData.length; i++) {
					if (videoData[i].match(/url-/)) {
						url = videoData[i].replace("url-", "");
					} else if (videoData[i].match(/poster-/)) {
						poster = videoData[i].replace("poster-", "");
					}
				}
			}
		}

		return {
			id: id,
			playerType: playerType,
			poster: poster,
			url: url,
			hero: $container.attr('data-hero') || false,
			gameblock: $container.attr('data-gameblock') || false,
			isPCCFormat: $container.attr('data-is-pcc-format') || false,
			eventId: $container.attr('data-event-id'),
			cerebroId: $container.attr('data-cerebro-id') || false
		};
	}

  function play(options) {
	

		var defaults = {
			video_id: false,
			type: "native",
			container: false,
			allow_docking: false,
			native_options: {
				"endCard":true,
				"autoplay":true
			}
		};

		var opts = $.extend({}, defaults, options);

		if ( opts.video_id !== false ) {

			window.espn.video.remove();

      var playerHtml = '<div id="videoPlayer"></div>';
      
      var $playerContainer = null;
      if (playerHtml){
        $playerContainer = $(playerHtml).insertAfter(opts.container);
      }
      opts.native_options.targetReplaceId = $playerContainer.attr('id');
      window.espn.video.play(opts.video_id, opts.native_options, true);
			
		}
	}

  return api;

}(jQuery));

espni.quizModule = (function($) {
  var quiz = {};
  quiz.myQuestions = [
    {
        question: "Who is the only man to have scored a century for the losing side in a World Cup final?",
        answers: {
            a: 'Ricky Ponting',
            b: 'Graham Gooch',
            c: 'Mahela Jayawardene'
        },
        correctAnswer: 'c'
    },
    {
        question: "Dwayne Leverock's diving, one-handed catch for Bermuda in 2007 is arguably the most famous catch in World Cup history. Which Indian batsman did Leverock's catch dismiss??",
        answers: {
            a: 'Sachin Tendulkar',
            b: 'Robin Uthappa',
            c: 'Virender Sehwag'
        },
        correctAnswer: 'b'
    }
  ]; 

  quiz.quizContainer = $('#quiz');
  quiz.resultsContainer = $('#results');
  quiz.submitButton = $('#submit');
  quiz.skipQuiz = $('#skipQuiz');
  quiz.closeBtn = $('#closeBtn');
  

  quiz.init = function() {
    quiz.showQuestions( quiz.myQuestions );
    quiz.submitButton.on('click', function() {
      quiz.showResults( quiz.myQuestions );
    });
    quiz.skipQuiz.on('click', function() {
      $('#quizform').hide();
      window.espn.video.play();
    });
    quiz.closeBtn.on('click', function() {
      $('#quizform').hide();
      window.espn.video.play();
    });
  };
  
  quiz.showQuestions = function(questions){
    var output = [];
    var answers;

    for(var i=0; i< questions.length; i++){
        
        answers = [];

        for(ln in questions[i].answers){
            answers.push(
              '<label>'
                + '<input type="radio" name="question'+i+'" value="'+ln+'">'
                + questions[i].answers[ln]
                + '</label>'
            );
        }

        output.push(
            '<div class="quiz">'
            + '<div class="question">' + questions[i].question + '</div>'
            + '<div class="answers">' + answers.join('') + '</div>'
            + '</div>'
        );
    }

    //console.info('output===>',output);
    quiz.quizContainer.html(output.join(''));
  };

  quiz.showResults = function(questions){
    var answerContainers = quiz.quizContainer.find('.answers');

    var userAnswer = '';
    var numCorrect = 0;

    for(var i=0; i< questions.length; i++){

        userAnswer = $($(answerContainers[i]).find('input[name=question'+i+']:checked')).val();
        //console.info('userAnswer====>',userAnswer, ' ', $(answerContainers[i]).find('input[name=question'+i+']:checked'));
        if(userAnswer=== questions[i].correctAnswer){
            numCorrect++;         
        }
        
    }

    if(numCorrect === questions.length) {
      quiz.resultsContainer.html("Congratulations you have won below coupon code <br/> <b>20% OFF UberEats</b>");
    } else {
      quiz.resultsContainer.html( "Better luck next time");
    }
  };


  return quiz;

}(jQuery));


(function () {

  espni.ESPNiVodPlayer.init();
  espni.quizModule.init();
  
})();