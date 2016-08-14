/**
 * @desc amwiki主执行模块
 * @author Tevin
 * @see {@link https://github.com/TevinLi/amWiki}
 * @license MIT - Released under the MIT license.
 */

$(function () {

    'use strict';

    //工具集
    var tools = window.tools;
    //文档管理器
    var docs = new AWDocs();
    //本地存储
    var storage = new AWStorage();
    //启用接口ajax测试
    if (window.AWTesting) {
        var testing = new AWTesting();
    }
    //是否支持history.state的API (IE9不支持)
    var HISTORY_STATE = 'pushState' in history;

    //页面基本显示与操作
    var $menuBar = $('#menuBar');
    var pageBase = function () {
        //菜单折叠
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
        $('.menu-fold').on('click', function () {
            var $this = $(this);
            if ($this.hasClass('on')) {
                $this.removeClass('on').find('use').attr('xlink:href', '#navFolder1');
                $menuBar.find('h5').removeClass('on').next('ul').hide();
            } else {
                $this.addClass('on').find('use').attr('xlink:href', '#navFolder2');
                $menuBar.find('h5').addClass('on').next('ul').show();
            }
        });
        //响应式菜单
        var $nav = $('.nav'),
            $menuIcon = $('.menu_icon');
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
    };

    //改变导航显示
    var changeNav = function (path) {
        if (path == '首页') {
            $menuBar.find('h4').addClass('on');
            $menuBar.find('a').removeClass('on');
        } else {
            var hsLink = false;
            $menuBar.find('a').each(function () {
                var $this = $(this);
                var path2 = $this.attr('href').split('file=')[1];
                if (path2 == path) {
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

    //改变页面
    var changePage = function (path, withOutPushState) {
        //第一步，从本地缓存读取并渲染页面
        var localDoc = storage.read(path);
        docs.renderDoc(localDoc);
        testing && testing.crawlContent();
        //更新history记录
        if (!withOutPushState && HISTORY_STATE) {
            history.pushState({path: path}, '', '?file=' + path);
        }
        //第二步，加载服务器上的文档资源，如果有更新重新渲染
        docs.loadPage(path, function (type, content) {
            //读取服务器文档失败
            if (type == 'error') {
                //如果本地缓存为空，且服务器文档读取失败，跳回首页
                if (localDoc == '') {
                    docs.loadPage('首页', function (type, content) {
                        if (type == 'success') {
                            storage.save('首页', content);
                        }
                    });
                    if (HISTORY_STATE) {
                        history.replaceState({path: '首页'}, '', '?file=首页');
                    }
                }
                //如果本地缓存不为空，但服务器文档读取失败，不进行任何操作
            }
            //读取服务器文档成功
            else if (type == 'success') {
                //如果服务器文档有更新，更新本地缓存、重新渲染页面、重新判断接口测试
                if (content != localDoc) {
                    docs.renderDoc(content);
                    storage.save(path, content);
                    testing && testing.crawlContent();
                }
                //如果服务器文档与本地缓存一致，不进行任何操作
            }
        });
    };

    //读取目录导航
    var loadNav = function (callback) {
        $.get('library/$navigation.md', function (data) {
            $menuBar.html(marked(data));
            $menuBar
                .find('h4').prepend('<svg><use xlink:href="#navHome"></use></svg>').end()
                .find('h5').prepend('<svg><use xlink:href="#navArrow"></use></svg>');
            //支持history api时，改变默认事件，导航不再跳转页面
            $menuBar.find('a').each(function () {
                if (HISTORY_STATE) {
                    var $this = $(this);
                    $this.on('click', function () {
                        var path = $this.attr('href').split('file=')[1];
                        changeNav(path);
                        changePage(path);
                        return false;
                    });
                }
            });
            callback && callback();
        }, 'text');
    };

    //解析地址参数
    var path = tools.getURLParameter('file');
    if (!path) {
        path = '首页';
    } else {
        path = decodeURI(path);
    }

    //页面基本
    pageBase();
    //加载导航
    loadNav(function () {
        //首次打开改变导航
        changeNav(path);
        //首次打开改变页面
        changePage(path, true);
    });

    //history api 前进后退响应
    if (HISTORY_STATE) {
        $(window).on('popstate', function (e) {
            var path = e.originalEvent.state.path;
            //改变导航
            changeNav(path);
            //改变页面
            changePage(path, true);
        });
    }

});


