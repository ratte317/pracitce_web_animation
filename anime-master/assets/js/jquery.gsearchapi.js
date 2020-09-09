/*

  JQuery Google Search api
  var:  1.0 sk
  Date:  2011.07.11
  
*/

/* utf.js - UTF-8 <=> UTF-16 convertion
 *
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */

/*
 * Interfaces:
 * utf8 = utf16to8(utf16);
 * utf16 = utf16to8(utf8);
 * b64 = base64encode(data);
 * data = base64decode(b64);
 */

function utf16to8(str) {var out, i, len, c;out = "";len = str.length;for(i = 0; i < len; i++) {c = str.charCodeAt(i);if ((c >= 0x0001) && (c <= 0x007F)) {out += str.charAt(i);} else if (c > 0x07FF) {out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));} else {out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));}}return out;}function utf8to16(str) {var out, i, len, c;var char2, char3;out = "";len = str.length;i = 0;while(i < len) {c = str.charCodeAt(i++);switch(c >> 4){   case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:out += str.charAt(i-1);break;  case 12: case 13:char2 = str.charCodeAt(i++);out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));break;  case 14:char2 = str.charCodeAt(i++);char3 = str.charCodeAt(i++);out += String.fromCharCode(((c & 0x0F) << 12) |   ((char2 & 0x3F) << 6) |   ((char3 & 0x3F) << 0));break;}}return out;}var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,-1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);function base64encode(str) {var out, i, len;var c1, c2, c3;len = str.length;i = 0;out = "";while(i < len) {c1 = str.charCodeAt(i++) & 0xff;if(i == len){out += base64EncodeChars.charAt(c1 >> 2);out += base64EncodeChars.charAt((c1 & 0x3) << 4);out += "==";break;}c2 = str.charCodeAt(i++);if(i == len){out += base64EncodeChars.charAt(c1 >> 2);out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));out += base64EncodeChars.charAt((c2 & 0xF) << 2);out += "=";break;}c3 = str.charCodeAt(i++);out += base64EncodeChars.charAt(c1 >> 2);out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));out += base64EncodeChars.charAt(c3 & 0x3F);}return out;}function base64decode(str) {var c1, c2, c3, c4;var i, len, out;len = str.length;i = 0;out = "";while(i < len) {/* c1 */do {c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];} while(i < len && c1 == -1);if(c1 == -1)break;do {c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];} while(i < len && c2 == -1);if(c2 == -1)break;out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));do {c3 = str.charCodeAt(i++) & 0xff;if(c3 == 61)return out;c3 = base64DecodeChars[c3];} while(i < len && c3 == -1);if(c3 == -1)break;out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));do {c4 = str.charCodeAt(i++) & 0xff;if(c4 == 61)return out;c4 = base64DecodeChars[c4];} while(i < len && c4 == -1);if(c4 == -1)break;out += String.fromCharCode(((c3 & 0x03) << 6) | c4);}return out;}

/*    JQuery Google Search api START    */

$(function(){
  var config = {
//    siteURL    : 'www.nttdata-r.co.jp',
    siteURL    : 'http://www.nttdata-ccs.co.jp/',
    searchSite  : true,
    type    : 'web',
    append    : false,
    // A maximum of 8 is allowed by Google
    perPage    : 8,
    // The start page
    page    : 0
  }
  
  $('#searchForm').submit(function(){
    googleSearch();
    return false;
  });
  
  function googleSearch(settings){
    
    settings = $.extend({},config,settings);
    settings.term = settings.term || $('#s').val();
    
    if(settings.searchSite){
      settings.term = 'site:'+settings.siteURL+' '+settings.term;
    }
    
    // URL of Google's AJAX search API
    var apiURL = 'http://ajax.googleapis.com/ajax/services/search/'+settings.type+'?v=1.0&callback=?';
    var resultsDiv = $('#resultsDiv');
    
    $.getJSON(apiURL,{q:settings.term,rsz:settings.perPage,start:settings.page*settings.perPage},function(r){
      var results = r.responseData.results;
      $('#more').remove();
      if(results.length){
        var pageContainer = $('<div>',{className:'pageContainer'});
        for(var i=0;i<results.length;i++){
          pageContainer.append(new result(results[i]) + '');
        }
        if(!settings.append){
          resultsDiv.empty();
        }
        pageContainer.append('<div class="clear"></div>')
           .hide().appendTo(resultsDiv)
           .fadeIn('slow');
        var cursor = r.responseData.cursor;
        
        if( +cursor.estimatedResultCount > (settings.page+1)*settings.perPage){
          $('<div id="more">もっと読込む</div>').appendTo(resultsDiv).click(function(){
            googleSearch({append:true,page:settings.page+1});
            $(this).fadeOut();
          }).hover(function(){
            $(this).stop(true,true).animate({opacity: 0.7},100);
          },function(){
            $(this).stop(true,true).animate({opacity: 1},200);
            
          }).css({cursor:"pointer"});
        }
      }
      else {
        resultsDiv.empty();
        $('<p>',{className:'notFound',html:'キーワードを含むページは見つかりませんでした。'}).hide().appendTo(resultsDiv).fadeIn();
      }
    });
  }
  
  function result(r){
    var arr = [];
    switch(r.GsearchResultClass){
      case 'GwebSearch':
        arr = [
          '<dl class="dlIndexList">',
          '<dt><a href="',r.unescapedUrl,'">',r.title,'</a></dt>',
          '<dd><p>',r.content,'<br />',
          '<span class="url">',r.unescapedUrl,'</span></p></dd>',
          '</dl>'
        ];
      break;
    }
    
    this.toString = function(){
      return arr.join('');
    }
  }

  // ヘッダー検索 var 2.0
  $("#siteSearch").each(function(){
    $(this).submit(function(){
      var searchUrl = $("#siteSearch").attr("action");
      var searchWord = $("input:text").val();
      var searchWord = base64encode(utf16to8(searchWord));
      
      if(!searchWord == ""){
        var searchUrl = searchUrl + "?gsh=" + searchWord;
      }

      window.location.href = searchUrl;
      return false
    });  
  });
  
  // ヘッダー検索 var 3.0
  $(".siteSearch").each(function(){
    $(this).submit(function(){
      var searchUrl = $(".siteSearch").attr("action");
      var searchWord = $("input:text",this).val();
      var searchWord = base64encode(utf16to8(searchWord));
      
      if(!searchWord == ""){
        var searchUrl = searchUrl + "?gsh=" + searchWord;
      }

      window.location.href = searchUrl;
      return false
    });  
  });  

  var loadFunction = function(){
    var prm = window.location.search.split("?gsh=")[1];
    
    if(!prm==""){
      var prm = utf8to16(base64decode(prm))
      $("#searchForm #s").val(prm);
      googleSearch();
    }
  }
  loadFunction();

});