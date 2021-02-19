var express = require('express');

const request = require('request-promise').defaults({jar:true});

const cheerio = require('cheerio');

var TimetableUrl = "https://student.amizone.net/Calendar/home/GetDiaryEvents";

async function getCurrentDate(){
    var today = new Date();
    var dd = today.getDate();

    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 
    today = yyyy + '-' + mm +'-'+ dd;
    
    return today;
}

module.exports = {
    getOptions : async function(cookie, date=getCurrentDate()){
        var Options = {
            method: "GET",
            uri: TimetableUrl,
            gzip:true,
            form : {
                start : date,
                end : date
            },
            credentials: "same-origin",
            headers: {
            'Accept': "application/json; q=0.01",
            'Accept-Encoding': "gzip, deflate, br",
            'Accept-Language': "en-US,en;q=0.9",
            "Origin": "https://student.amizone.net",
            "Referer": "https://student.amizone.net/",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "Cookie" : cookie
            }
        }

        return Options;
    },
    
    getTimetable : async function(response){
        var times = response.slice(2,-2).split("},{");
        var timetable = [];
        times.forEach(element => {
            element = '{' + element + '}';
            timetable.push(JSON.parse(element));
        });

        return {timetable:timetable};
    }
}
