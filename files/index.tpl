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
        <div class="header">
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
        </div>
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
                <div class="menubar" id="menuBar"></div>
            </div>
            <div class="main" id="main">
                <div class="markdown-body" id="view"></div>
                {{amWiki-testing.tpl}}
            </div>
        </div>
        <!-- 返回顶部 -->
        <div class="back-top">
            <a href="#" class="back-icon">
                <svg>
					<use xlink:href="#backTop"></use>
				</svg>
            </a>
            <a href="#" class="back-text">返回顶部</a>
        </div>
        <!-- js -->
        <div class="hidden">
            <script type="text/javascript" src="amWiki/js/forEach.js"></script>
            <script type="text/javascript" src="amWiki/js/gbk.js"></script>
            <script type="text/javascript" src="amWiki/js/jquery-1.11.3.min.js"></script>
            <script type="text/javascript" src="amWiki/js/marked.min.js"></script>
            <script type="text/javascript" src="amWiki/js/highlight.min.js"></script>
            <script type="text/javascript" src="amWiki/js/raphael-min.js"></script>
            <script type="text/javascript" src="amWiki/js/flowchart.min.js"></script>
            {{amWiki-testing.js}}
            <script type="text/javascript" src="amWiki/js/amWiki.js"></script>
        </div>
        <!-- svg -->
        <div class="hidden" id="svgSymbols"></div>
    </body>

</html>