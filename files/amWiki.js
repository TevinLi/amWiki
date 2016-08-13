/**
 * amWiki
 * https://github.com/TevinLi/amWiki
 * by Tevin
 *
 * Released under the MIT license.
 */

$(function () {

    'use strict';

    var tools = window.tools;

    //菜单折叠
    var $menuBar = $('#menuBar');
    $menuBar.on('click', 'h5', function () {
        var $this = $(this),
            $next = $this.next('ul');
        if ($this.hasClass('on')) {
            $this.removeClass('on');
            $next.slideUp(200);
        } else {
            $this.addClass('on');
            $next.slideDown(200);
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
    $menuBar.on('click', 'strong', function () {
        var $this = $(this),
            $next = $this.next('ul');
        if ($this.hasClass('on')) {
            $this.removeClass('on');
            $next.slideUp(200);
        } else {
            $this.addClass('on');
            $next.slideDown(200);
        }
    });
    //展开折叠所有导航栏位按钮
    var setMenuFolding = function () {
        var $this = $(this);
        if ($this.hasClass('on')) {
            $this.removeClass('on').find('use').attr('xlink:href', '#navFolder1');
            $menuBar.find('h5').removeClass('on').next('ul').hide();
        } else {
            $this.addClass('on').find('use').attr('xlink:href', '#navFolder2');
            $menuBar.find('h5').addClass('on').next('ul').show();
        }
    };

    //响应式菜单
    var $nav = $('.nav'),
        $menuIcon = $('.menu_icon'),
        $win = $(window);
    $menuIcon.on('click', function () {
        var $this = $(this);
        if ($this.hasClass('close')) {
            $this.removeClass('close');
            $menuIcon.find('use').attr('xlink:href', '#navStart');
            $nav.removeClass('on');
        } else {
            $this.addClass('close');
            $menuIcon.find('use').attr('xlink:href', '#navClose');
            $nav.addClass('on');
        }
    });
    $menuBar.on('click', 'li a', function () {
        $nav.removeClass('on');
    });
    $menuBar.on('click', 'h4', function () {
        $nav.removeClass('on');
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

    //显示svg图标
    if (sessionStorage['AMWikiIconsSvg']) {
        $('#svgSymbols').append(sessionStorage['AMWikiIconsSvg']);
    } else {
        $.get('amWiki/images/icons.svg', function (svg) {
            sessionStorage['AMWikiIconsSvg'] = svg;
            $('#svgSymbols').append(svg);
        }, 'text');
    }

    //读取导航目录
    $.get('library/$navigation.md', function (data) {
        $menuBar.html(marked(data));
        $('.menu-fold').on('click', setMenuFolding);
        $menuBar
            .find('h4').prepend('<svg><use xlink:href="#navHome"></use></svg>').end()
            .find('h5').prepend('<svg><use xlink:href="#navArrow"></use></svg>');
        setView();
    }, 'text');


    //解析地址参数
    var path = tools.getURLParameter('file');
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
                    //第一层
                    var $prev = $this.addClass('on').parent().parent().show().prev().addClass('on');
                    //第二层
                    if ($prev[0].tagName.toLowerCase() == 'strong') {
                        $prev.parent().parent().show().prev().addClass('on');
                    }
                } else {
                    $this.removeClass('on');
                }
            });
            if (hsLink) {
                $menuBar.find('h4').removeClass('on');
            }
        }
    };

    //启用接口ajax测试
    if (window.AWTesting) {
        var testing = new AWTesting();
    }

    var docs = new AWDocs();
    docs.loadPage(path, function (type) {
        //读取页面失败，跳转回首页
        if (type == 'error') {
            docs.loadPage('首页');
        } else {
            testing && testing.crawlContent();
        }
    });

});

