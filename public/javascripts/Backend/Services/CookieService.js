var express = require('express');

const request = require('request-promise').defaults({jar:true});

const cheerio = require('cheerio');

var HomePageUrl = "https://student.amizone.net/";

module.exports = {
    getOptions : function(__UserName=" ",__Password=" ",_RequestVerificationToken=" ",__QString=" "){
        var _method = "GET";
        if(_RequestVerificationToken!=" "){
            _method = "POST";
        }
        var Options = {
            method: _method,
            uri: HomePageUrl,
            gzip:true,
            credentials: "same-origin",
            form: {
                __RequestVerificationToken:_RequestVerificationToken,
                _UserName: __UserName,
                _Password: __Password,
                _QString: __QString
            },
            headers: {
            'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
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
            }
        }
        return Options;
    }

    ,
    getRequestVerificationToken : function($){
        return $('div[class="limiter"] > div[class="container-login100"] > div[class="wrap-login100"] >div[class="widget-box login-box visible login100-form"] > form[class=" validate-form"] > input[name="__RequestVerificationToken"]').attr("value");
    }
    ,

    getQString : function($){
        return $('div[class="limiter"] > div[class="container-login100"] > div[class="wrap-login100"] >div[class="widget-box login-box visible login100-form"] > form[class=" validate-form"] > div[class="wrap-input100 validate-input"] > input[name="_QString"]').attr("value");
    }
    ,

    generateCookies : function(err){
        var response;
        var check = true;
        var cookies = "";
        try {
            cookies = cookies + err['response']['req']['_headers']['cookie'] + "; ";
            cookies = cookies + "ASP.NET_SessionId=; ";
            cookies = cookies + err['response']['headers']['set-cookie'][1];
            if(err['response']['headers']['set-cookie'][1]==undefined){
                check = false;
            }
        } catch (error) {
            check = false;
            cookies = "       ";
        }        
        cookies = cookies.slice(0,-7);
        response = {check : check,cookies : cookies}
        return response;
    }

};