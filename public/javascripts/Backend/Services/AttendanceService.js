var express = require('express');

const request = require('request-promise').defaults({jar:true});

const cheerio = require('cheerio');

var AttendanceUrl = "https://student.amizone.net/Academics/FlaxiCourses/";

var AttendanceSemesterWiseUrl = "https://student.amizone.net/Academics/FlaxiCourses/CourseListSemWise";

var AttendanceDetailsUrl = "https://student.amizone.net/Academics/FlaxiCourses/_Attendance?id="

module.exports = {

getOptions : function(cookie, semChoice=0){
    let URL;

    if(semChoice==0||semChoice==undefined){
        URL = AttendanceUrl;
    }else{
        URL = AttendanceSemesterWiseUrl;
    }

    var Options = {
        method:'GET',
        uri:URL,
        gzip:true,
        form : {
            sem : semChoice
        },
        headers: {
          'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          'Accept-Encoding': "gzip, deflate, br",
          'Accept-Language': "en-US,en;q=0.9",
          "Referer": "https://student.amizone.net/",
          "Connection": "keep-alive",
          "Cookie": cookie
        }
      };

      return Options;
},

getDetailsOptions : function(cookie, id){

    let URL = AttendanceDetailsUrl+id;

    var Options = {
        method:'GET',
        uri:URL,
        gzip:true,
        form : {
            id :id
        },
        headers: {
          'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          'Accept-Encoding': "gzip, deflate, br",
          'Accept-Language': "en-US,en;q=0.9",
          "Referer": "https://student.amizone.net/",
          "Connection": "keep-alive",
          "Cookie": cookie
        }
      };

      return Options;
},

getAttendance : function(response){
    var attendanceOfStudent = [];
    var $ = cheerio.load(response);
    console.log("Succesfully Scrapped Attendance...");
    console.log("ATTENDANCE OF THE STUDENT FETCHING STARTING...")
    console.log("Parsing Attendance...")

    var calculate = 1;
    const tempAttendance = {
        course_code : "",
        course_name : "",
        course_type : "",
        course_attendance : "",
        classes_attended : 0,
        classes_total : 0,
        course_id : ""
    }
    var _green = 0;
    var _yellow = 0;
    var _red = 0;
    var _grey = 0;
    $('table[class="table table-bordered table-striped table-condensed"] > tbody > tr').children().each(function(i,ele){
        

        let content = $(this).text();

        let flag = true;
        
        for(var i=content.length-1;i>=0;i--){
            if(content[i]==' '||content[i]=='\n'){
                content = content.slice(0,-1);
            }else{
                break;
            }
        }

        if(!(content[content.length-1]==')')){
        for(var i = 0;i<content.length;i++){
            if(content[i]=='.'){
                flag = false;
                break;
            }
        }  
        }
        if(!(content=='View'||content==""||flag==false)){
            switch(calculate){
                case 1 : tempAttendance.course_code = content;
                        break;
                case 2 : tempAttendance.course_name = content;
                        break;
                case 3 : tempAttendance.course_type = content;
                        break;
                case 4 : {tempAttendance.course_attendance = content;
                            tempAttendance.course_id = "";
                            let prt = $(this).html();
                            prt = prt.slice(30,46);
                            let tempFlag = false;
                            for(var i = 0; i<prt.length;i++){
                                if(tempFlag==true){
                                    if(prt[i]<'0'||prt[i]>'9'){
                                        break;
                                    }else{
                                        tempAttendance.course_id +=prt[i];
                                    }
                                }else{
                                    if(prt[i]<'0'||prt[i]>'9'){
                                        continue;
                                    }else{
                                        tempFlag = true;
                                        tempAttendance.course_id +=prt[i];
                                    }
                                }
                            }
                            break;
                        }
                default : console.log("bad switch");
            }
            if(calculate==4){
                let temp_course_attendance = tempAttendance.course_attendance;

                for(var i = 0;i<temp_course_attendance.length;i++){
                if(temp_course_attendance[i]=='/'){
                    break;
                }
                }
                tempAttendance.classes_attended = parseInt(temp_course_attendance.slice(0,i));

                i = i + 1;

                for(var j = i+1;j<temp_course_attendance.length;j++){
                if(temp_course_attendance[j]==' '){
                    break;
                }
                }

                tempAttendance.classes_total = parseInt(temp_course_attendance.slice(i,j+1));

                var _percentage = Math.round((((tempAttendance.classes_attended)/(tempAttendance.classes_total))*100)*100)/100;
                var _safe = "0";
                if(_percentage>=75&&_percentage<85){
                    _safe="1";
                }
                if(_percentage>=85){
                    _safe="2";
                }
                if(tempAttendance.classes_total==0){
                    _safe="3";
                }

                var _message = "";
                var diff = tempAttendance.classes_total - tempAttendance.classes_attended;
                if(diff*3<tempAttendance.classes_attended){
                    var want = 0;
                    while(diff*3<=tempAttendance.classes_attended){
                        diff++;
                        want++;
                    }
                    want--;

                    _message = "can miss " + want + " classes";
                }else{
                    var want = diff*3;
                    want = want - tempAttendance.classes_attended;
                    _message = "attend " + want + " classes";
                }

                if(_safe==3){
                    _message = "yet to start";
                }

                var tempData = {
                    course_code : tempAttendance.course_code,
                    course_name : tempAttendance.course_name,
                    course_type : tempAttendance.course_type,
                    course_attendance : tempAttendance.course_attendance,
                    classes_attended : tempAttendance.classes_attended,
                    classes_total : tempAttendance.classes_total,
                    course_id : tempAttendance.course_id,
                    percentage : _percentage,
                    safe : _safe,
                    message : _message
                };
                if(_safe=='3'){
                    _grey++;
                }
                if(_safe=='2'){
                    _green++;
                }
                if(_safe=='1'){
                    _yellow++;
                }
                if(_safe=='0'){
                    _red++;
                }
                attendanceOfStudent.push(tempData);
                calculate = 0;
            }
            calculate++;
        }

    });
    console.log("Attendance parsed...");

    console.log("ATTENDANCE OF STUDENT FETCHING ENDING...");

    var _status = [
        _green,
        _yellow,
        _red,
        _grey
    ]

    var data = {
        attendance : attendanceOfStudent,
        status : _status
    }

    return data;
    
}
,
getAttendanceDetails : function(response){
    var attendanceDetails = [];
    var $ = cheerio.load(response);
    var scrapText = 'div[class="main-content"] > div[class="main-content-inner"] > div[class="row"] > div[class="col-xs-12"] > div[class="panel-group"] > div[class="panel panel-default"] > div[class="panel-heading"] > div[class="row"] > div[class="page-content"] > table[class="table table-bordered table-striped table-condensed"] > tbody';
    
    var flag = 1;

    var attendanceTempData = {
        s_no : "",
        date : "",
        time : "",
        present : "",
        absent : "",
    }

    $(scrapText).children().children().each(function(i,ele){

        var content = $(this).text().trim();
        
        switch(flag){
            case 1 : attendanceTempData.s_no = content;
                     break;
            case 2 : attendanceTempData.date = content;
                     break;
            case 3 : attendanceTempData.time = content;
                     break;
            case 4 : attendanceTempData.present = content;
                     break;
            case 5 : attendanceTempData.absent = content;
                     break;
            case 6 : break;
        }

        if(flag==6){
            var temp = {
                s_no : attendanceTempData.s_no,
                date : attendanceTempData.date,
                time : attendanceTempData.time,
                present : attendanceTempData.present,
                absent : attendanceTempData.absent
            };
            attendanceDetails.push(temp);
        }

        flag = (flag<6?flag+1:1);

    });

    return attendanceDetails;
}

};

