var express = require('express');

const request = require('request-promise').defaults({jar:true});

const cheerio = require('cheerio');

var IdCardUrl = "https://s.amizone.net/IDCard";

var ImageUrl = "https://s.amizone.net/ImageViewer/Index?Type=2&SUID=AA050FD8-46C6-46E5-9BAC-77FC3D070700";

module.exports = {
  
    getOptions : function(cookie){
        let URL = IdCardUrl;        
    
        var Options = {
            method:'GET',
            uri:URL,
            gzip:true,
            headers: {
              'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              'Accept-Encoding': "gzip, deflate, br",
              'Accept-Language': "en-US,en;q=0.9",
              "Referer": "https://student.amizone.net/",
              "Connection": "keep-alive",
              "Host": "student.amizone.net",
              "Cookie": cookie,
              "authority": "s.amizone.net"
            }
          };
    
          return Options;
    },

    getImageOptions : function(cookie){
      let URL = ImageUrl;        
  
      var Options = {
          method:'GET',
          uri:URL,
          gzip:true,
          headers: {
            'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            'Accept-Encoding': "gzip, deflate, br",
            'Accept-Language': "en-US,en;q=0.9",
            "Referer": "https://student.amizone.net/",
            "Connection": "keep-alive",
            "Host": "student.amizone.net",
            "Cookie": cookie,
            "authority": "s.amizone.net"
          }
        };
  
        return Options;
  },

    getScrapedCard : function(response){
        var $ = cheerio.load(response);

        return $('div[class="main-content"] > div[class="main-content-inner"] > div[class="page-content"] > div[class="row "] > div[class="widget-box widget-color-blue"] > div[id="printableArea"]').html();
    }

}
