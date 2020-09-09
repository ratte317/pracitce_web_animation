/*---------------------------------------------------------

  jquery.common.js
  
  
  以下コードは全てjqueryプラグイン形式となっています。


  コードサンプル
  
  // プラグイン
  (function($) {
    $.fn.プラグイン名 = function(options) {
      var conf（オプション）
      
      処理内容
      
    }
  })(jQuery);

  // プラグイン実行処理
  $(function(){
    $(対象要素).実行プラグイン名({
      オプション値の書換え
    });
  });
  
  
---------------------------------------------------------*/
/*---------------------------------------------------------

  setupLocalNav  ローカルナビ設定
  
  動作説明：
  ローカルナビ設定
  現在地マーク、上下階層リストオープンを行う
  （ローカルナビ用includeファイルは第2階層毎に用意される前提）
  
  conf（オプション）値：
      clsStay:   現在地スタイル用クラス
      clsOpened:   リストオープン用クラス
      dirIndex:   ディレクトリインデックス 
            （デフォルトはindex.html）
      openAll:   現在地以下の子階層を全てオープン
            （デフォルトはfalse）

---------------------------------------------------------*/
(function($) {
  $.fn.setupLocalNav = function(options) {
    var lNav = this;
    // Option
    var conf = $.extend({
      clsStay: "nttdatajpn-local-nav-stay",
      clsOpened: "nttdatajpn-local-nav-pseudo-opened",
      dirIndex: "index.html",
      openAll: false
    }, options);
    
    lNav.each(function(){
               
      if (!conf.openAll) {
        //下層項目オープン状態をリセット
        $("li." + conf.clsOpened, this).removeClass(conf.clsOpened).children("ul").hide();
      }
      
      //現在地表示
      var cPathName = window.location.pathname;
      var cItem = $("li a[href='" + cPathName + "'], li a[href='" + cPathName + conf.dirIndex + "']", lNav);
      cItem
        .css({
           backgroundColor:"transparent",
           border:"none"
           })
        .wrap("<em></em>")
        .closest("li").addClass(conf.clsStay).has("ul").addClass(conf.clsOpened)
        .children("ul").show()
        .end().end().parents("li").addClass(conf.clsOpened)
        .end().parents("ul").show();
      
    });
    return this;
  }
})(jQuery);

// プラグイン実行処理
$(function(){
  $("#nttdatajpn-local-nav").setupLocalNav();
});