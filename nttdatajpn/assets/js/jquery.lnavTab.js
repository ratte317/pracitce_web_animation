/*---------------------------------------------------------

  ローカルtab遷移時のlnavの開閉指示
  
---------------------------------------------------------*/
$(function() {
        $('.nttdataccs-includeTab')
    .addClass("nttdatajpn-local-nav-pseudo-opened")
    .children("ul").show();
    $('.nttdataccs-includeTab li:eq(1)')
    .addClass("nttdatajpn-local-nav-stay")
    $('.nttdataccs-includeTab li:eq(1) a')
    .wrap("<em></em>")
    .css({
           backgroundColor:"transparent",
           border:"none"
           })
});
