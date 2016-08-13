<!DOCTYPE html>
<html>

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="renderer" content="webkit">
        <title>{{name}}</title>
        <link rel="stylesheet" type="text/css" href="amWiki/css/markdownbody.github.css" />
        <link rel="stylesheet" type="text/css" href="amWiki/css/lhjs.github-gist.css" />
        <link rel="stylesheet" type="text/css" href="amWiki/css/amWiki.css" />
    </head>

    <body>
        <!-- 头部 -->
        <header class="header">
            <div class="header-inner">
                <a class="logo" href="?file=首页">
                    <img src="{{logo}}" /><i></i>
                    <b>{{name}}</b>
                    <span>{{version}}</span>
                </a>
                <div class="menu_icon">
                    <svg>
                        <use xlink:href="#navStart"></use>
                    </svg>
                </div>
            </div>
        </header>
        <!-- 页面 -->
        <div class="container">
            <div class="nav">
                <div class="menu-filter">
                    <svg>
                        <use xlink:href="#navFilter"></use>
                    </svg>
                    <input type="text" id="menuFilter" value="" placeholder="请输入筛选条件" title="请输入筛选条件" />
                    <i class="off" title="清空筛选">&times;</i>
                </div>
                <div class="menu-fold" title="展开/折叠导航栏所有菜单">
                    <svg>
                        <use xlink:href="#navFolder1"></use>
                    </svg>
                </div>
                <nav class="menubar" id="menuBar"></nav>
            </div>
            <div class="main" id="main">
                <article class="markdown-body" id="view"></article>
                {{amWiki.testing.tpl}}
            </div>
        </div>
        <!-- 签名 -->
        <footer>
            <div class="signature">Powered by
                <a href="https://github.com/TevinLi/amWiki" target="_blank">amWiki</a>
            </div>
        </footer>
        <!-- 返回顶部 -->
        <aside>
            <div class="back-top">
                <a href="#" class="back-icon">
                    <svg>
                        <use xlink:href="#backTop"></use>
                    </svg>
                </a>
                <a href="#" class="back-text">返回顶部</a>
            </div>
        </aside>
        <!-- js -->
        <div class="hidden">
            <script type="text/javascript" src="amWiki/js/gbk.js"></script>
            <script type="text/javascript" src="amWiki/js/jquery-compat-3.1.0.min.js"></script>
            <script type="text/javascript" src="amWiki/js/marked.min.js"></script>
            <script type="text/javascript" src="amWiki/js/highlight.min.js"></script>
            <script type="text/javascript" src="amWiki/js/raphael-min.js"></script>
            <script type="text/javascript" src="amWiki/js/flowchart.min.js"></script>
            <script type="text/javascript" src="amWiki/js/amWiki.tools.js"></script>
            <script type="text/javascript" src="amWiki/js/amWiki.storage.js"></script>
            {{amWiki.testing.js}}
            <script type="text/javascript" src="amWiki/js/amWiki.js"></script>
        </div>
        <!-- svg -->
        <div class="hidden" id="svgSymbols"></div>
        <!-- 低版本浏览器警告 -->
        <div id="lowBrowser">
            <div></div>
            <p><span>您的浏览器版本过低，不支持浏览本Wiki，请升级或更换您的浏览器再试！</span></p>
            <script>
                (function(win) {
                    var notice = document.getElementById('lowBrowser');
                    //jQuery 3.x 需要 addEventListener 方法支持
                    if (typeof win.addEventListener == 'undefined') {
                        notice.style.display = 'block';
                    } else {
                        var comments = notice.previousSibling;
                        if (comments.nodeType == 8) {
                            comments.parentNode.removeChild(comments);
                        } else if (comments.previousSibling.nodeType == 8) {
                            comments = comments.previousSibling;
                            comments.parentNode.removeChild(comments);
                        }
                        notice.parentNode.removeChild(notice);
                    }
                    notice = comments = null;
                })(window);
            </script>
        </div>
    </body>

</html>