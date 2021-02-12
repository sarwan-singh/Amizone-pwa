var attendanceService = require('../public/javascripts/Backend/Services/AttendanceService');
var cookieService = require('../public/javascripts/Backend/Services/CookieService');
var timeTableService = require('../public/javascripts/Backend/Services/TimetableService');
var idCardService = require('../public/javascripts/Backend/Services/IdCardService');
var marksService = require('../public/javascripts/Backend/Services/MarksService');

var express = require('express');
var router = express.Router();
const request = require('request-promise').defaults({jar:true});
const cheerio = require('cheerio');
const schedule = require('node-schedule');

const job = schedule.scheduleJob('0/20 * * * *', function(){
  request.get('https://amityamizone.herokuapp.com/').then(function(body){
    console.log("API TRIGGERED");
  })
  request.get('http://amizoneapp.herokuapp.com/').then(function(body){
    console.log("APP TRIGGERRED");
  })
});


router.get('/', function(req, res, next) {
  res.status(200);
  res.send("API RUNNING");
});

router.post('/login', function(req, res, next){
  var firstOptions = cookieService.getOptions();
  request(firstOptions).then(function(body){
    var $ = cheerio.load(body);
    var secondOptions = cookieService.getOptions(req.body.userName ,req.body.password ,cookieService.getRequestVerificationToken($) ,cookieService.getQString($));
    request(secondOptions).then(function (res){
      res.send({retry :true});
    }).catch(function(err){
      var checkAndCookies = cookieService.generateCookies(err);
        res.send({cookies:checkAndCookies.cookies,retry:false, check:checkAndCookies.check});
     });
  }).catch(function (err){
    console.log("Error at first scrap refresh...");
    res.send({retry: true});
  });
});

router.post('/timetable', function(req,res,next){
  var Options = timeTableService.getOptions(req.body.cookies, req.body.date);
  request(Options).then(function(response){
    var timetableData = timeTableService.getTimetable(response)
    res.send({timetable:timetableData.timetable,retry:false});
  }).catch(function(err){
    console.log("Error in Timetable scrape...");
    res.send({retry: true});
  })
});

router.post('/attendance', function(req,res,next){
  var Options = attendanceService.getOptions(req.body.cookies, req.body.sem);
  request(Options).then(function(response){
    var $ = cheerio.load(response);
    var attendanceData = attendanceService.getAttendance(response);
    res.send({attendance:attendanceData.attendance,status:attendanceData.status,retry:false});
  }).catch(function(err){
    console.log("Error in Attendance scrape...");
    return {retry: true};
  });
});

router.post('/attendanceDetails', function(req, res, next){
  var Options = attendanceService.getDetailsOptions(req.body.cookies, req.body.id);
  request(Options).then(function(response){
    var $ = cheerio.load(response);
    var attendanceDetails = attendanceService.getAttendanceDetails(response);
    res.send({attendanceDetails: attendanceDetails, retry:false});
  }).catch(function(err){
    console.log("Error in Attendance Details Scrape...");
    return {retry: true};
  })
})

router.post('/idCard', function(req, res, next){
  var Options = idCardService.getOptions(req.body.cookies);
  request(Options).then(function(response){
    response = idCardService.getScrapedCard(response);
    res.send({idCard: response, retry: false});
  }).catch(function(err){
    console.log("Error in Id Card fetch...");
    return {retry: true};
  })
})

router.post('/marks', function(req, res, next){
  var Options = marksService.getOptions(req.body.cookies, req.body.sem);
  request(Options).then(function(response){
    marks = marksService.getScrapedMarks(response);
    res.send({lastSemMarks: marks.lastSemMarks, totalMarks: marks.totalMarks, instructions: marks.instructions, retry: false});
  }).catch(function(err){
    console.log("Error in Marks fetch...");
    return {retry: true};
  })
})

router.post('/currentSem', function(req, res, next){
  var Options = marksService.getOptions(req.body.cookies);
  request(Options).then(function(response){
    sem = marksService.getCurrentSem(response);
    res.send({sem: sem})
  }).catch(function(err){
    console.log("Error in sem fetch");
  return {retry: true};
  })
})

module.exports = router;
