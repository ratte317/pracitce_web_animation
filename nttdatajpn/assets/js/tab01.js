

$(function(){
  //初期動作
  
  $(".tab01 > div > div").hide();
  $(".tab01 > div > div:first").show();
  var thisSrc =$(".tab_list01 li a img:first").attr("src");
  var thisSrc = thisSrc.replace("_on","_act");
  var thisSrc = thisSrc.replace("_off","_act");
  $(".tab_list01 li a img:first").attr("src",thisSrc);


  //クリック時
$(".tab_list01 li a").click(function(){
    $(".tab01 > div > div").hide();
    var myID=$(this).attr("href");
    $(myID).fadeIn();
    $(".tab_list01 li a img").each(function(){
    var mySrc=$(this).attr("src").replace("_act","_off");
    $(this).attr("src",mySrc)
    });
    var thisSrc =$(this).children("img").attr("src");
    var thisSrc = thisSrc.replace("_on","_act");
    var thisSrc = thisSrc.replace("_off","_act");
    $(this).children("img").attr("src",thisSrc);
    return false;
  });

$(".tab_list01 li a img").hover(
    function(){
      var mysrc=$(this).attr("src").replace("_off","_on");
      $(this).attr("src",mysrc);
    },
    function(){
      var mysrc=$(this).attr("src").replace("_on","_off");
      $(this).attr("src",mysrc);
    }
  );
});
