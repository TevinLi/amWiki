/**
 * amWiki
 * https://github.com/TevinLi/amWiki
 * by Tevin
 *
 * Released under the MIT license.
 */

$(function () {

    'use strict';

    function getURLParameter(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return r[2];
        } else {
            return null;
        }
    }

    //菜单折叠
    var $menuBar = $('#menuBar');
    $menuBar.on('click', 'h5', function () {
        var $this = $(this),
            $next = $this.next('ul');
        if ($this.hasClass('on')) {
            $this.removeClass('on');
            $next.hide();
        } else {
            $this.addClass('on');
            $next.show();
        }
    });
    $menuBar.on('click', 'h4', function () {
        var $this = $(this);
        if (!$this.hasClass('on')) {
            $this.addClass('on');
            $menuBar.find('a').removeClass('on');
        }
        $menuBar.find('h5').removeClass('on').next('ul').hide();
    });
    var setMenuFolding = function () {
        var $this = $(this);
        if ($this.hasClass('on')) {
            $this.removeClass('on');
            $menuBar.find('h5').removeClass('on').next('ul').hide();
        } else {
            $this.addClass('on');
            $menuBar.find('h5').addClass('on').next('ul').show();
        }
    };

    //响应式菜单
    var $nav = $('.nav'),
        $menuStart = $('.menu_icon_start'),
        $menuClose = $('.close_icon'),
        $win = $(window);
    $menuClose.hide();
    var pageWidth = $win.width();
    var hideMenu = function () {
        if (pageWidth <= 720) {
            $menuClose.hide();
            $menuStart.show();
            $nav.hide();
        }
    };
    $menuStart.on('click', function () {
        $menuStart.hide();
        $menuClose.show();
        $nav.show();
    }).show();
    $menuClose.on('click', function () {
        hideMenu();
    });
    $menuBar.on('click', 'li a', function () {
        hideMenu();
    });
    $menuBar.on('click', 'h4', function () {
        hideMenu();
    });
    $win.on('resize', function () {
        pageWidth = $win.width();
        if (pageWidth > 720 && $nav.is(':hidden')) {
            $nav.show();
        }
    });

    //页面筛选
    var $filter = $('#menuFilter');
    var $filterClean = $filter.next('i');
    $filter.on('blur change input propertychange', function () {
        var value = $filter.val();
        if (value != '') {
            $filterClean.removeClass('off');
            $menuBar.find('h5').removeClass('on').next('ul').hide();
            $menuBar.find('a').each(function () {
                var $this = $(this);
                if ($this.text().indexOf(value) >= 0) {
                    $this.parent().removeClass('off').parent().show().prev('h5').addClass('on');
                } else {
                    $this.parent().addClass('off');
                }
            });
        } else {
            $filterClean.addClass('off');
            $menuBar.find('a').parent().removeClass('off');
        }
    });
    $filterClean.on('click', function () {
        $filter.val('').trigger('change');
    });

    //设置文章标题hash
    var $view = $('#view');
    var $titles = null;
    var hash = '';
    var setTitleAnchor = function (element) {
        if (location.hash && location.hash.length > 1) {
            hash = location.hash.split('#')[1];
        }
        var anchorHtml = '<a class="anchor" href="#{title}" name="{title}"><img src="amWiki/images/icon_link.png"/></a>';
        $titles = $view.find('h1,h2,h3');
        $titles.each(function (index, element) {
            var $title = $(element);
            var text = $title.text().replace(/\s+/g, '');
            if (hash == text) {
                if (pageWidth <= 720) {
                    $win.scrollTop($title.offset().top - 55);
                } else {
                    $win.scrollTop($title.offset().top);
                }
            }
            $title.prepend(anchorHtml.replace(/\{title\}/g, text));
        });
    };
    $(window).on('hashchange', function (e) {
        hash = location.hash.split('#')[1];
        if ($titles) {
            $titles.each(function (index, element) {
                var $title = $(element);
                var text = $title.text().replace(/\s+/g, '');
                if (hash == text) {
                    if (pageWidth <= 720) {
                        $win.scrollTop($title.offset().top - 55);
                    }
                }
            });
        }
    });

    //设置js注释隐藏
    var setJSCommentDisable = function ($elm) {
        var $disBtn = $('<div class="lang-off-js-comment">注<i>/</i></div>');
        $disBtn.on('click', function () {
            var $this = $(this);
            if ($this.hasClass('on')) {
                $this.removeClass('on');
                $elm.find('.hljs-comment').show();
            } else {
                $this.addClass('on');
                $elm.find('.hljs-comment').hide();
            }
        });
        $elm.prepend($disBtn);
    };

    //解析流程图
    var createFlowChart = function ($elm) {
        var code = $elm.text();
        $elm.text('');
        var id = 'flowChart' + parseInt(Math.random() * 500);
        $elm.attr('id', id);
        var chart = flowchart.parse(code);
        chart.drawSVG(id, {
            'line-width': 1.3,
            'line-length': 30,
            'line-color': '#666',
            'text-margin': 10,
            'font-size': 14,
            'font': 'normal',
            'font-family': 'Helvetica',
            'font-weight': 'normal',
            'font-color': 'black',
            'element-color': '#888',
            'fill': '#fff',
            'yes-text': '是',
            'no-text': '否',
            'arrow-end': 'block-wide-long',
            'symbols': {},
            'flowstate': {}
        });
    };

    //读取导航目录
    $.get('library/$navigation.md', function (data) {
        $menuBar.html(marked(data));
        $filter.parent().after('<div class="menu-fold" title="展开/折叠导航栏所有菜单"></div>');
        $('.menu-fold').on('click', setMenuFolding);
        setView();
    }, 'text');

    //urlEcode模式
    if (!localStorage.urlEcode) {
        localStorage.urlEcode = 'utf8';
    } else if (localStorage.urlEcode != 'utf8' && localStorage.urlEcode != 'gbk') {
        localStorage.urlEcode = 'utf8';
    }

    //解析地址参数
    var path = getURLParameter('file');
    if (!path) {
        path = '首页';
    } else {
        path = decodeURI(path);
    }
    var setView = function () {
        if (path == '首页') {
            $menuBar.find('h4').addClass('on');
        } else {
            var hsLink = false;
            $menuBar.find('a').each(function () {
                var $this = $(this);
                if ($(this).attr('href').split('file=')[1] == path) {
                    hsLink = true;
                    $this.addClass('on').parent().parent().show().prev('h5').addClass('on');
                } else {
                    $this.removeClass('on');
                }
            });
            if (hsLink) {
                $menuBar.find('h4').removeClass('on');
            }
        }
    };

    //加载页面
    var url;
    if (localStorage.urlEcode == 'utf8') {
        url = 'library/' + encodeURI(path) + '.md?t=' + (new Date()).getTime();
    } else if (localStorage.urlEcode == 'gbk') {
        url = 'library/' + GBK.encode(path.split('/')[0]);
        if (path.split('/').length > 1) {
            url += '/' + GBK.encode(path.split('/')[1]);
        }
        url += '.md?t=' + (new Date()).getTime();
    }
    var loadPage = function (count) {
        if (count == 2) {
            if (localStorage.urlEcode == 'utf8') {
                url = 'library/' + GBK.encode(path.split('/')[0]);
                if (path.split('/').length > 1) {
                    url += '/' + GBK.encode(path.split('/')[1]);
                }
                url += '.md?t=' + (new Date()).getTime();
            } else if (localStorage.urlEcode == 'gbk') {
                url = 'library/' + encodeURI(path) + '.md?t=' + (new Date()).getTime();
            }
        } else if (count == 3) {
            //防止意外跳转循环
            if (getURLParameter('jump') == 2) {
                return
            } else {
                location.search = '?file=首页&jump=2';
                return;
            }
        }
        $.get(url, function (data) {
            if (/^\s*<!(DOCTYPE|doctype)/.test(data)) {
                return loadPage(++count);
            }
            if (count == 2) {
                localStorage.urlEcode = localStorage.urlEcode == 'utf8' ? 'gbk' : 'utf8';
            }
            $view.html(marked(data)).find('pre code').each(function (i, element) {
                var $elm = $(element);
                var className = $elm.attr('class') || '';
                //流程图
                if (className.indexOf('lang-flow') >= 0) {
                    createFlowChart($elm)
                }
                //语法高亮
                else if (className.indexOf('lang') >= 0) {
                    hljs.highlightBlock(element);
                }
                //js注释开关
                if (className.indexOf('javascript') >= 0) {
                    setJSCommentDisable($elm);
                }
            });
            setTitleAnchor();
            //接口ajax测试
            window.createTesting && createTesting();
        }, 'text').fail(function () {
            return loadPage(++count);
        });
    };
    loadPage(1);

});