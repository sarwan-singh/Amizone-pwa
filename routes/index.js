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

const job = schedule.scheduleJob('0/20 * * * *',async function(){
  request.get('https://amityamizone.herokuapp.com/').then(function(body){
    console.log("API TRIGGERED");
  })
});


router.get('/', async function(req, res, next) {
  res.status(200);
  res.send("API RUNNING");
});

router.post('/login', async function(req, res, next){
  var firstOptions = await cookieService.getOptions();
  request(firstOptions).then(async function(body){
    var $ = cheerio.load(body);
    var secondOptions = await cookieService.getOptions(req.body.userName ,req.body.password ,cookieService.getRequestVerificationToken($) ,cookieService.getQString($));
    request(secondOptions).then(async function (res){
      res.send({retry :true});
    }).catch(async function(err){
      var checkAndCookies = await cookieService.generateCookies(err);
        res.send({cookies:checkAndCookies.cookies,retry:false, check:checkAndCookies.check});
     });
  }).catch(async function (err){
    console.log("Error at first scrap refresh...");
    res.send({retry: true});
  });
});

router.post('/timetable', async function(req,res,next){
  var Options = await timeTableService.getOptions(req.body.cookies, req.body.date);
  request(Options).then(async function(response){
    console.log("Timetable request triggered");
    var timetableData = await timeTableService.getTimetable(response)
    res.send({timetable:timetableData.timetable,retry:false});
  }).catch(async function(err){
    console.log("Error in Timetable scrape...");
    res.send({retry: true});
  })
});

router.post('/attendance', async function(req,res,next){
  var Options = await attendanceService.getOptions(req.body.cookies, req.body.sem);
  request(Options).then(async function(response){
    var $ = cheerio.load(response);
    var attendanceData = await attendanceService.getAttendance(response);
    res.send({attendance:attendanceData.attendance,status:attendanceData.status,retry:false});
  }).catch(async function(err){
    console.log("Error in Attendance scrape...");
    return {retry: true};
  });
});

router.post('/attendanceDetails', async function(req, res, next){
  var Options = await attendanceService.getDetailsOptions(req.body.cookies, req.body.id);
  request(Options).then(async function(response){
    var $ = cheerio.load(response);
    var attendanceDetails = await attendanceService.getAttendanceDetails(response);
    res.send({attendanceDetails: attendanceDetails, retry:false});
  }).catch(async function(err){
    console.log("Error in Attendance Details Scrape...");
    return {retry: true};
  })
})

router.post('/idCard', async function(req, res, next){
  var Options = await idCardService.getOptions(req.body.cookies);
  request(Options).then(async function(response){
    response = await idCardService.getScrapedCard(response);
    res.send({idCard: response, retry: false});
  }).catch(async function(err){
    console.log("Error in Id Card fetch...");
    return {retry: true};
  })
})

router.post('/marks', async function(req, res, next){
  var Options = await marksService.getOptions(req.body.cookies, req.body.sem);
  request(Options).then(async function(response){
    marks = await marksService.getScrapedMarks(response);
    res.send({lastSemMarks: marks.lastSemMarks, totalMarks: marks.totalMarks, instructions: marks.instructions, retry: false});
  }).catch(async function(err){
    console.log("Error in Marks fetch...");
    return {retry: true};
  })
})

 router.post('/currentSem', async function(req, res, next){
  var Options = await marksService.getOptions(req.body.cookies);
  request(Options).then(async function(response){
    sem = await marksService.getCurrentSem(response);
    res.send({sem: sem})
  }).catch(async function(err){
    console.log("Error in sem fetch");
  return {retry: true};
  })
})

module.exports = router;
