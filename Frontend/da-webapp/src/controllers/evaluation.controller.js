/*
Copyright 2016 The Eyra Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

File author/s:
    Matthias Petursson <oldschool01123@gmail.com>
*/

(function () {
'use strict';

angular.module('daApp')
.controller('EvaluationController', EvaluationController);

EvaluationController.$inject = ['$document',
                                '$rootScope',
                                '$scope',
                                'evaluationService',
                                'logger',
                                'utilityService'];

function EvaluationController($document, $rootScope, $scope, evaluationService, logger, utilityService) {
  var evalCtrl = this;
  var evalService = evaluationService;
  var util = utilityService;

  evalCtrl.action = action;
  evalCtrl.skip = skip;

  $scope.msg = ''; // single information msg

  evalCtrl.actionBtnDisabled = false;
  evalCtrl.skipBtnDisabled = true;

  var actionType = 'play'; // current state

  var PLAYTEXT = 'Play'; // text under the buttons
  var PAUSETEXT = 'Pause';
  var PLAYGLYPH = 'glyphicon-play'; // bootstrap glyph class
  var PAUSEGLYPH = 'glyphicon-pause';
  evalCtrl.actionText = PLAYTEXT;
  evalCtrl.actionGlyph = PLAYGLYPH;

  evalCtrl.commentOpts = [
    'yeye',
    'nono'
  ];

  var currentSet = 'malromur_3k';

  // save reference to the audio element on the page, for play/pause
  // thanks, Shushanth Pallegar, http://stackoverflow.com/a/30899643/5272567
  // TODO: would probably be nicer to make a directive
  var audioPlayback = $document.find("#audio-playback")[0];
  if (audioPlayback) {
    audioPlayback.addEventListener('ended', audioEnded);
  }

  activate();

  ////////// 
  
  function activate() {
    evalCtrl.displayToken = 'sup';
    evalCtrl.uttsGraded = 0;
    evalCtrl.gradesDelivered = 0;

    evalCtrl.grade = undefined; // initially unchecked
    $scope.$watch(function(){ return evalCtrl.grade; }, watchGrade);

    var promise = initSet(currentSet);
    if (promise) {
      promise.then(
        function success(data){
          next(); // grab initial prompt/utterance

          $rootScope.isLoaded = true; // is page loaded?
        }, 
        function error(response){
          $scope.msg = 'Something went wrong.';

          logger.error(response);

          $rootScope.isLoaded = true;
        }
      );
    }
  }

  function action() {
    /*
    Signifies the combined rec/pause button
    */
    evalCtrl.actionBtnDisabled = true;
    if (actionType === 'play') {
      play();
    } else if (actionType === 'pause') {
      pause();
    }
    toggleActionBtn();
    evalCtrl.actionBtnDisabled = false;
  }

  function audioEnded() {
    /*
    Automatically hit pause on our custom controls on reaching audio playback end.
    */
    if (actionType === 'pause') {
      action();
      $scope.$apply();
    }
  }

  function initSet(set) {
    /*
    Returns promise resolved when evalService has init'd set.
    */
    return evalService.initSet(set);
  }

  function next() {
    /*
    Sets next recording and prompt.
    */
    var recNPrompt = evalService.getNext();
    evalCtrl.recording = recNPrompt[0];
    evalCtrl.displayToken = recNPrompt[1];
  }

  function play() {
    /*
    Start playback on audio.
    */
    evalCtrl.skipBtnDisabled = false;

    audioPlayback.play();
  }

  function skip() {
    evalCtrl.skipBtnDisabled = true;
  }

  function pause() {
    audioPlayback.pause();
  }

  function toggleActionBtn() {
    if (actionType === 'play') {
      actionType = 'pause';
      evalCtrl.actionText = PAUSETEXT;
      evalCtrl.actionGlyph = PAUSEGLYPH;
    } else if (actionType === 'pause') {
      actionType = 'play';
      evalCtrl.actionText = PLAYTEXT;
      evalCtrl.actionGlyph = PLAYGLYPH;
    }
  }

  function watchGrade() {
    /*
    Passed as a function into $scope.$watch.

    Notifies us when a grade radio button has been ticked,
    and in doing so saves the choice and triggeres the next recording.
    */
    // if valid grade has been clicked
    // thanks, Gumbo, http://stackoverflow.com/a/4728164/5272567
    if (['1','2','3','4'].indexOf(evalCtrl.grade) > -1) {
      evalCtrl.skipBtnDisabled = true;
      evalCtrl.uttsGraded++;
      next();
    }
  }
}
}());
