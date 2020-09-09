jQuery(function($){
  $('.hoverGroup a img, .hover').hover(
    function(){ $(this).stop().fadeTo(200, 0.5); },
    function(){ $(this).stop().fadeTo('fast', 1.0); }
  );

  $("#nttdatajpn-global-nav .advantage").on({
   'mouseenter':function(){
     $(this).find('ul').stop().slideDown(300);
   },
   'mouseleave':function(){
    $(this).find('ul').stop().slideUp(300);
   }
 })

})