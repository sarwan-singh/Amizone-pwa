var express = require('express');

const request = require('request-promise').defaults({jar:true});

const cheerio = require('cheerio');

var MarksUrlSemWise = "https://s.amizone.net/Examination/Examination/ExaminationListSemWise";

var MarksUrl = "https://s.amizone.net/Examination/Examination?X-Requested-With=XMLHttpRequest";

module.exports = {
    getOptions : function(cookie, semester = 0){
        let URL;        
        let Method;
        if(semester==0){
          URL = MarksUrl;
          Method = "GET";
        }else{
          URL = MarksUrlSemWise;
          Method = "POST";
        }
        var Options = {
            method:Method,
            uri:URL,
            gzip:true,
            form : { 
              sem: semester
            },
            headers: {  
              'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              'Accept-Encoding': "gzip, deflate, br",
              'Accept-Language': "en-US,en;q=0.9",
              "Referer": "https://student.amizone.net/",
              "Connection": "keep-alive",
              "Host": "student.amizone.net",
              "Cookie": cookie
            }
          };
          return Options;
    },

    getCurrentSem : function(response){
      var $ = cheerio.load(response);
      return $('option[selected="selected"]').html()
    }, 

    getScrapedMarks : function(response){
      var response;
      var lastSemMarks;
      var totalMarks;
      var instructions; 
      var $ = cheerio.load(response);
      $('html > body').children().each(function(ind, ele){
        if(ind===0){
          lastSemMarks =  $(this).html();
        }else if(ind===1){
          totalMarks = $(this).html();
        }else if(ind===2){
          instructions = $(this).html();
        }
      });
      response = {
        lastSemMarks: lastSemMarks,
        totalMarks: totalMarks, 
        instructions: instructions
      }
      return response;
    }
};

