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
// service with utility functions for the app and for now, contains many configurable aspects, see also app.js.

'use strict';

angular.module('daApp')
  .factory('utilityService', utilityService);

utilityService.$inject = ['logger'];

function utilityService(logger) {
  var utilityHandler = {};

  utilityHandler.getConstant = getConstant;
  utilityHandler.getIdxFromPath = getIdxFromPath;
  utilityHandler.generateUUID = generateUUID;
  utilityHandler.percentage = percentage;
  utilityHandler.stdErrCallback = stdErrCallback;

  var CONSTANTS = { 
    //To change to English you must modify these files:

    //-must change "label" in "speaker-info-format.json" to the correct translation

    //-must change evalueation-comments.json:
      //1. change EVALUATIONCOMMENTSURL in evaluation.controller.js from 'json/evaluation-comments.json' to 'json/evaluation-comments-isl.json'
      //2. in Gruntfil.js change:
        //"match: /json\/evaluation-comments-isl\.json/g, 
         //replacement: 'json/evaluation-comments-isl.'+cache_breaker+'.json'"
         //to
         // "match: /json\/evaluation-comments\.json/g,
         // replacement: 'json/evaluation-comments.'+cache_breaker+'.json'"

    //-must change index page: nav bar and loading msg
    'invalidTitle' : 'no_data.wav', // sentinel value for invalid recordings
    'tokenThreshold' : 600, 
    'tokenGetCount' : 1500,
    'QCAccThreshold' : 0.2, // if accuracy falls below this, meter will display red
    'QCFrequency' : 5, // per sessions sent
    'QCInitRecThreshold' : 5, // recording count before QC can report, adjustment period for speaker
    'QCHighThreshold' : 0.7, // if accuracy falls below this, meter will display yellow instead of green
    'tokenAnnouncementFreq' : 500,
    'tokenCountGoal' : 500, // how many prompts should a user read?
    'syncRecCountPerSend' : 5, // recs to send each transmission to server during a Sync operation,
    'evalBufferSize' : 5, // number of prompts and/or recs to fetch and keep in memory during evaluation
    'evalSubmitFreq' : 5, // per utterance graded, after X send to server
    'RECAGREEMENT' : true, // include the recording participant agreement
    //language specific constants
    //evaluation login
    'ENTERINFO' : 'أدخل بياناتك',
    'SETTEXT' : 'حدد',
    'NAMEPLACEHOLDERTEXT' : 'Jane4',
    //evaluation 
    'PLAYTEXT' : 'تشغيل',
    'PAUSETEXT' : 'ايقاف',
    'NOTOKENTEXT' : 'لا يجود جمل حاليا',
    'GRADECOMPLETETEXT' : 'تم تصنيف المجموعة. شكرا لكم',
    'GRADETEXT' : 'الدرجة',
    'COMMENTTEXT' : 'تعليق',
    'UNDOTEXT' :'الغاء',
    'AUTOPLAYTEXT' : 'تشغيل تلقاءي',
    'UTTGRADEDTEXT' : 'التسجيلات المصنفة',
    'USERTEXT' :'المستخدم',
    'SETTEXTMIN' : 'المجموعة',
    //info
    'VERSIONTEXT' :'Version',
    //login
    'LOGINTEXT' : 'اسم المستخدم',
    'PASSWORDTEXT' : 'كلمة السر',
    //main
    'STARTTEXT' : 'ابدأ',
    //more and sync
    'ADDSPEAKERTEXT' : 'Add speaker',
    'SETINSTRUCTORTEXT' : 'Set instructor',
    'REGISTERDEVICETEXT' : 'Register device',
    'LOGOUTTEXT' :'Logout',
    'GETTOKENTEXT' : 'Get tokens (dev)',
    'CLEARDBTEXT' : 'Clear local db (dev)',
    'CLEARTOKENSDBTEXT' : 'Clear all tokens (dev)',
    'PRINTLOGSTEXT' : 'Print logs (dev)',
    'CONFIRMMSG' : 'Are you sure?\nThis will delete the entire local db, including tokens and recordings.',
    'CLEARINGDBMSG' : 'Clearing entire local db...',
    'DBCLEAREDALERT' : 'Database cleared!',
    'DBCLEAREDMSG' : 'Database cleared.',
    'CLEARINGTOKENSMSG' : 'Clearing tokens...',
    'TOKENSCLEARSALERT' : 'All tokens gone!',
    'TOKENSCLEARSMSG' : 'Tokens deleted.',
    'GETTINGTOKENSMSG' : 'Getting tokens...',
    'TOKENSACQUIREDALERT' : 'Tokens acquired!',
    'TOKENSACQUIREDMSG' : 'Tokens acquired.',
    'SYNCINGMSG' : 'جارى رفع التسجيلات -- يرجى الانتظار',
    'SYNCCOMPLETEMSG' : 'تم رفع التسجيلات بنجاح',
    'SYNCFAILEDMSG' : 'فشل فى رفع التسجيلات',
    'CHECKNETMSG' : '.يرجى توصيل الجهاز بالإنترنت',
    //recording agreement
    'FULLNAMETEXT' : 'الاسم',
    'EMAILTEXT' : 'Email',
    'ACCEPTTEXT' : 'موفقة', 
    'DECLINETEXT' : 'رفض',
    //speaker info
    'INFOHEADINGTEXT' : 'أدخل بياناتك',
    //start
    'STARTHEADINGTEXT' : 'أدخل بياناتك',
    'USERNAMETEXT' : 'اسم المستخدم',
    'DONEBEFORETEXT' : 'سجلت قبل كده؟', 
    //recording
     'RECTEXT' : 'تسجيل', //text under rec button
     'STOPTEXT' : 'ايقاف',
     'NEXTTEXT' : 'التالى',
     'SKIPTEXT' : 'تخطى',
     'PROMPTSREADTEXT' : 'الجمل المسجلة',
     'UTTQUALITYTEXT' : 'الجودة',
     'UTTUPLOADEDTEXT' : 'الجمل المرفوعه',
     'INITTOKENTEXT' : 'اضغط على التالى لتحميل جملة جديدة',
     'RECORDINGNOWTEXT' : 'جارى التسجيل الان',
     'WAITINGFORTOKENTEXT' : 'جارى تحميل جملة جديدة',
     'TOKENSKIPPEDTEXT' : 'تم تخطى الجملة',
     'STOPPEDTEXT' : 'ايقاف',
     'NOMORETOKENSTEXT' : 'لايوجد المزيد من الجمل. يرجى اعادة تحميل الصفحة',
     //register device
     'IMEIDEVICETEXT' : 'IMEI/Device ID',
     'DEVICEINFOALERT' : 'Device info submitted!',
     'DEVICESUBMITERRORMSG' : 'Error submitting device.',
     //report
     'REPORTTEXT' : 'Report',
     'CLICKTOCONTINUETEXT' : 'click below to continue',
     //set instructor
     'NEWINSTRUCTORTEXT' : 'New instructor',
     'PHONETEXT' : 'Phone',
     'ADRESSTEXT' : 'Address',
     'IDLABELTEXT' : 'ID',
     'EXISTINGINSTRUCTORTEXT' :'Existing instructor',
     'FULLNAMEPLACEHOLDERTEXT' : 'Jane Doe',
     'EMAILPLACEHOLDERTEXT' : 'email@example.com',
     'PHONEPLACEHOLDER' : '7777777',
     'ADRESSPLACEHOLDER' : '21 Example Lane',
     'INSTRUCTORSUBMITALERT' : 'Instructor submitted to database!',
    //sync
    'SYNCTEXT' : 'رفع',
    'BACKTORECTEXT' : 'العودة الى صفحة التسجيل',
    'UTTRECTEXT' : 'عدد التسجيلات',
    'UTTUPLTEXT' : 'عدد التسجيلات المرفوعه',
    'UTTRECNOTUPLTEXT' : 'عدد التسجيلات الغير المرفوعه',
    'PROMPTSDOWNLTEXT' : 'عدد الجمل المتاحة',
     //error messages\
     //Speaker already in database. Choose a different name, unless you have done this before on this device, then tick the box.
    'SPEAKEREXISTSERRORMSG' : 'اسم المستخدم غير متاح. يرجى اختيار اسم اخر',
    'ACCEPTPARTICIPATIONMSG' : 'يرجى الموفقة على المعاهدة اولا',
    'RENDERPAGEERRORMSG' : 'خطأ فى تحميل الصفحة',
    'SUBMITINSTRUCTORERRORMSG' : 'Error submitting instructor data.',
    'SPEAKERINFOERRORMSG' : 'Could not update speakerInfo into ldb',
    'TOKENSREADERRORMSG' : 'Could not read tokensRead counter from ldb',
    'COMMENTMISSINGMSG' : 'Please comment on your grade.',
    'LISTENMSG' :'Please listen to the recording.',
    'FETCHERRORMSG' : 'Couldn\'t grab available sets. Are you online?',
    'USERNAMEERRORMSG' : 'يجب اختيار اسم مستخدم',
    'SETERRORMSG' : 'Please select a set.',
    'USERSETERRORMSG' : 'Type a username and select a set',
    'APPINITIALIZATIONFAILMSG' : 'App failed to initialize. Try refreshing the page and check your connection.',
    'GETPROMPTSMSGTEXT' : 'جاري تحميل بعض الجمل يرجى الإنتظار. هذا قد يأخذ دقيقة أو أكثر حسب سرعة الإنترنت لديك ',
    'WAITINGTEXT' : 'يرجى الانتظار',
    'FAILEDTOGETTOKENS' : 'فشل تحميل الجمل',
    'PLAYBACKERRORMSG' : 'حدث خطأ فى اعادة التشغيل',
    'SOMETINGWRONGERRORMSG' : 'حدث خطأ',
    'FETCHCOMMENTERRORMSG' : 'Something went wrong grabbing comments from server.',
    'LOGINERRORMSG' : 'Failed to login',
    'NAMEANDEMAILMISSINGMSG' : 'Please type your name and email.',
    'MUSTACCEPTMSG' : 'يجب الموافقة على المعاهدة لبدء التسجيل',
  };
  

  return utilityHandler;

  //////////

  function getConstant(constant) {
    return CONSTANTS[constant];
  }

  // e.g if path === 'localDb/sessions/blob/5'
  // this will return 5
  // returns -1 on error
  function getIdxFromPath(path) {
    var idx = -1;
    try {
      var tokens = path.split('/');
      idx = parseInt(tokens[tokens.length - 1]);
      if (!idx && idx !== 0) idx = -1; // allow 0 as index
    } catch (e) {
      logger.error(e);
    }
    return idx;
  }

  function generateUUID() {
    // Thanks, broofa, http://stackoverflow.com/a/2117523/5272567
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  // part=3, whole=9, accuracy=2 would result in 33.33
  function percentage(part, whole, accuracy) {
    return Math.round(part/whole*100 * Math.pow(10, accuracy)) / Math.pow(10, accuracy);
  }

  // standard error function to put as callback for rejected promises
  function stdErrCallback(arg) {
    logger.error(arg);
  }
}
}());
