/**
 * Created by Tevin on 2016/3/22.
 */

$(function () {

    'use strict';

    function getURLParameter(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return encodeURIComponent(r[2]);
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

    //读取导航目录
    $.get('library/$navigation.md', function (data) {
        $menuBar.html(marked(data));
        $filter.parent().after('<div class="menu-fold" title="展开/折叠导航栏所有菜单"></div>');
        $('.menu-fold').on('click', setMenuFolding);
        setView();
    }, 'text');

    //urlEcode默认模式
    if (!localStorage.urlEcode) {
        localStorage.urlEcode = 'encode';
    }

    //解析地址参数
    var path = getURLParameter('file');
    if (!path) {
        path = encodeURI('首页');
    } else {
        path = decodeURIComponent(path);
    }
    var setView = function () {
        //console.log(path);
        if (path == encodeURI('首页')) {
            $menuBar.find('h4').addClass('on');
        } else {
            $menuBar.find('a').each(function () {
                var $this = $(this);
                var hsLink = false;
                if (encodeURI($(this).attr('href').split('file=')[1]) == path) {
                    hsLink = true;
                    $this.addClass('on').parent().parent().show().prev('h5').addClass('on');
                } else {
                    $this.removeClass('on');
                }
                if (hsLink) {
                    $menuBar.find('h4').removeClass('on');
                }
            });
        }
    };

    //设置标题hash
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
    var setJSCommentDisable = function($elm) {
        var $disBtn = $('<div class="lang-off-js-comment">注<i>/</i></div>');
        $disBtn.on('click',function(){
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

    //加载页面
    var url;
    if (localStorage.urlEcode == 'encode') {
        url = 'library/' + encodeURIComponent(path) + '.md?t=' + (new Date()).getTime();
    } else if (localStorage.urlEcode == 'decode') {
        url = 'library/' + path + '.md?t=' + (new Date()).getTime();
    }
    $.get(url, function (data) {
        $view.html(marked(data)).find('pre code').each(function (i, block) {
            var $elm = $(block);
            var className = $elm.attr('class') || '';
            if (className.indexOf('lang') >= 0) {
                hljs.highlightBlock(block);
            }
            if (className.indexOf('javascript') >= 0) {
                setJSCommentDisable($elm);
            }
        });
        setTitleAnchor();
    }, 'text').fail(function () {
        if (localStorage.urlEcode == 'encode') {
            url = 'library/' + path + '.md?t=' + (new Date()).getTime();
        } else if (localStorage.urlEcode == 'decode') {
            url = 'library/' + encodeURIComponent(path) + '.md?t=' + (new Date()).getTime();
        }
        $.get(url, function (data) {
            localStorage.urlEcode = 'decode';
            $view.html(marked(data)).find('pre code').each(function (i, block) {
                var $elm = $(block);
                var className = $elm.attr('class') || '';
                if (className.indexOf('lang') >= 0) {
                    hljs.highlightBlock(block);
                }
                if (className.indexOf('javascript') >= 0) {
                    setJSCommentDisable($elm);
                }
            });
            setTitleAnchor();
        }, 'text').fail(function () {
            location.search = '?file=首页';
        });
    });

});