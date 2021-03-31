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

router.get('/', async function(req, res, next) {
  res.status(200);
  res.send("API RUNNING");
});

router.post('/login', async function(req, res, next){
  var firstOptions = cookieService.getOptions();
  request(firstOptions).then(async function(body){
    var $ = cheerio.load(body);
    var secondOptions = cookieService.getOptions(req.body.userName ,req.body.password ,cookieService.getRequestVerificationToken($) ,cookieService.getQString($));
    request(secondOptions).then(async function (res){
      res.send({retry :true});
    }).catch(async function(err){
      var checkAndCookies = cookieService.generateCookies(err);
      console.log(checkAndCookies.cookies);
        res.send({cookies:checkAndCookies.cookies,retry:false, check:checkAndCookies.check});
     });
  }).catch(async function (err){
    console.log("Error at first scrap refresh...");
    res.send({retry: true});
  });
});

router.post('/timetable', async function(req,res,next){
  var Options = timeTableService.getOptions(req.body.cookies, req.body.date);
  request(Options).then(async function(response){
    console.log("Timetable request triggered");
    var timetableData = timeTableService.getTimetable(response)
    res.send({timetable:timetableData.timetable,retry:false});
  }).catch(async function(err){
    console.log("Error in Timetable scrape...");
    res.send({retry: true});
  })
});

router.post('/attendance', async function(req,res,next){
  var Options = attendanceService.getOptions(req.body.cookies, req.body.sem);
  request(Options).then(async function(response){
    var $ = cheerio.load(response);
    var attendanceData = attendanceService.getAttendance(response);
    res.send({attendance:attendanceData.attendance,status:attendanceData.status,retry:false});
  }).catch(async function(err){
    console.log("Error in Attendance scrape...");
    return {retry: true};
  });
});

router.post('/attendanceDetails', async function(req, res, next){
  var Options =  attendanceService.getDetailsOptions(req.body.cookies, req.body.id);
  request(Options).then(async function(response){
    var $ = cheerio.load(response);
    var attendanceDetails = attendanceService.getAttendanceDetails(response);
    res.send({attendanceDetails: attendanceDetails, retry:false});
  }).catch(async function(err){
    console.log("Error in Attendance Details Scrape...");
    return {retry: true};
  })
})

router.post('/idCard', async function(req, res, next){
  var Options = idCardService.getOptions(req.body.cookies);
  request(Options).then(async function(response){
    response = idCardService.getScrapedCard(response);
    res.send({idCard: response, retry: false});
  }).catch(async function(err){
    console.log("Error in Id Card fetch...");
    return {retry: true};
  })
})

router.post('/marks', async function(req, res, next){
  var Options = marksService.getOptions(req.body.cookies, req.body.sem);
  request(Options).then(async function(response){
    marks = marksService.getScrapedMarks(response);
    res.send({lastSemMarks: marks.lastSemMarks, totalMarks: marks.totalMarks, instructions: marks.instructions, retry: false});
  }).catch(async function(err){
    console.log("Error in Marks fetch...");
    return {retry: true};
  })
})

 router.post('/currentSem', async function(req, res, next){
  var Options = marksService.getOptions(req.body.cookies);
  request(Options).then(async function(response){
    sem = marksService.getCurrentSem(response);
    res.send({sem: sem})
  }).catch(async function(err){
    console.log("Error in sem fetch");
  return {retry: true};
  })
})

router.post('/getImage', async function(req, res, next){
  var Options = idCardService.getImageOptions(req.body.cookies);
  request(Options).then(async function(response){
    res.writeHead(200, {'Content-Type': 'image/jpeg'})
    res.end(new Buffer.alloc(response));
  }).catch(async function(err){
    console.log(err);

  })
})

module.exports = router;
