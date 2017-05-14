/**
 * @desc amWiki Web端 - 入口模块
 * @author Tevin
 * @see {@link https://github.com/TevinLi/amWiki}
 * @license MIT - Released under the MIT license.
 */

$(function () {

    'use strict';

    /*
     引入
     */

    //工具集
    var tools = window.tools;
    //文档管理器
    var docs = new AWDocs();
    //本地存储
    var storage = new AWStorage();
    //全文库搜索
    var search = new AWSearch(storage);
    //启用接口ajax测试
    if (window.AWTesting) {
        var testing = new AWTesting();
    }
    //是否支持history.state的API (IE9不支持)
    var HISTORY_STATE = 'pushState' in history;

    /*
     页面基本
     */

    //页面元素
    var $win = $(window),
        $body = $('body'),
        $menuIcon = $('#menuIcon'),            //顶部折叠显示导航按钮
        $container = $('#container'),            //页面主容器
        $nav = $('#nav'),                      //左侧导航
        $menuBar = $('#menuBar'),              //左侧导航内容
        $filter = $('#menuFilter'),
        $filterClean = $filter.next('i'),
        $main = $('#main'),
        $mainInner = $main.children('.main-inner'),
        $mainSibling = $('#mainSibling'),      //其他文章
        $contents = $('#contents');            //目录

    //是否为移动端
    var isMobi = window.isMobi = (function () {
        var winW = $win.width();
        var threshold = 720;
        var onResize = function () {
            winW = $win.width();
            if (winW <= threshold) {
                $container.removeAttr('style');
            } else {
                $container.height($win.height() - 70 - 15 - 20 * 2);
            }
        };
        onResize();
        $win.on('resize', onResize);
        return function () {
            return winW <= threshold;
        };
    })();

    //页面基本显示与操作
    (function () {
        //菜单折叠
        $menuBar.on('click', 'h4', function () {
            var $this = $(this);
            if (!$this.hasClass('on')) {
                $this.addClass('on');
                $menuBar.find('a').removeClass('on');
            }
            $menuBar.find('h5').removeClass('on').next('ul').hide();
        });
        $menuBar.on('click', 'h5', function () {
            var $this = $(this),
                $next = $this.next('ul');
            if ($this.hasClass('on')) {
                $this.removeClass('on');
                $next.slideUp(200, function () {
                    $menuBar.trigger('scrollbar');
                });
            } else {
                $this.addClass('on');
                $next.slideDown(200, function () {
                    $menuBar.trigger('scrollbar');
                });
            }
        });
        $menuBar.on('click', 'strong', function () {
            var $this = $(this),
                $next = $this.next('ul');
            if ($this.hasClass('on')) {
                $this.removeClass('on');
                $next.slideUp(200, function () {
                    $menuBar.trigger('scrollbar');
                });
            } else {
                $this.addClass('on');
                $next.slideDown(200, function () {
                    $menuBar.trigger('scrollbar');
                });
            }
        });
        //响应式菜单
        $menuIcon.on('click', function () {
            var $this = $(this);
            if ($this.hasClass('close')) {
                $this.removeClass('close')
                    .find('use').attr('xlink:href', '#icon:navStart');
                $nav.removeClass('on');
            } else {
                $this.addClass('close')
                    .find('use').attr('xlink:href', '#icon:navClose');
                $nav.addClass('on');
            }
        });
        $nav.on('navchange searchon searchoff', function (e) {
            $menuIcon.removeClass('close')
                .find('use').attr('xlink:href', '#icon:navStart');
            $nav.removeClass('on');
        });
        //筛选操作
        $filter.on('input propertychange input2', function () {
            var value = $filter.val().replace(/([\(\)\[\]\^\$\+])/g, '\\$1');
            var valReg = new RegExp('(' + $.trim($filter.val()).split(/[ ,]/).join('|') + ')', 'ig');
            if (value != '' && !/^\s$/g.test(value)) {
                $filterClean.removeClass('off');
                $menuBar.find('h5').each(function () {
                    filterNav('filter', valReg, $(this));
                });
                storage.setStates('navFilterKey', value);
            } else {
                $filterClean.addClass('off');
                $menuBar.find('h5').each(function () {
                    filterNav('open', null, $(this));
                });
                storage.setStates('navFilterKey');
            }
            $menuBar.trigger('scrollbar');
        });
        //清空筛选
        $filterClean.on('click', function () {
            $filter.val('').trigger('input2');
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
        //目录悬浮窗展开折叠
        $contents.children('.btn').on('click', function (e) {
            $contents.toggleClass('on').removeClass('hover');
        });
        $contents.hover(function () {
            $contents.addClass('hover');
        }, function () {
            $contents.removeClass('hover');
        });
        //开启滚动条
        $('.scroller').scrollbar();
        $('#backTop').on('click', function () {
            $mainInner.scrollTop(0);
        });
        //全局点击
        $(document).on('click', function (e) {
            var $tag = $(e.target);
            //移动端
            if (isMobi()) {
                //折叠目录悬浮窗
                if ($tag.closest('#contents').length == 0) {
                    $contents.removeClass('on').removeClass('on');
                }
            }
        });
    })();

    /*
     业务操作函数
     */

    /**
     * @desc 向下递归进行导航筛选
     * 当类型为筛选时，必定有正则
     *     当文件夹匹配时，其所属链接和所有子级全部显示且显示匹配
     *     当文件夹不匹配时，其所属链接和当前子级仅显示匹配，隐藏不匹配的项，下一级继续筛选
     * 当类型为打开时，所属链接和子级一律全部显示不隐藏
     *     如果有正则，显示当前匹配
     *     如果无正则，清除匹配
     * @param {string} type - 筛选类型，有 filter / open 两个值
     * @param {regexp} valReg - 过滤筛选的正则
     * @param {object} $title - jquery 对象，“标题-列表”DOM结构中的标题
     */
    var filterNav = function (type, valReg, $title) {
        var $ul = $title.next('ul');
        //因为一级文件夹和子级文件夹DOM结构不同，所以区分对待
        //  显示上，strong 带 on 加粗显示，h5 加 off 隐藏
        //  文本操作使用变量 $span，其他操作使用变量 $title
        var $span = $title.find('span');
        //当类型为筛选时
        if (type == 'filter' && valReg) {
            //当文件夹标题匹配时
            if (valReg.test($span.text())) {
                $span.html($span.text().replace(valReg, '<mark>$1</mark>'));
                $title.addClass('on').removeClass('off');
                //所属链接全部显示，且显示匹配
                $ul.show().find('> li > a').each(function () {
                    var $this = $(this);
                    var $span2 = $this.find('span');
                    $span2.html($span2.text().replace(valReg, '<mark>$1</mark>'));
                    $this.parent().removeClass('off');
                });
                //父级显示
                showNavParents($title);
                //下一级筛选类型更改，文件和文件夹全部显示，且显示匹配
                $ul.find('> li > strong').each(function () {
                    filterNav('open', valReg, $(this));
                });
            }
            //当文件夹标题不匹配时
            else {
                $span.text($span.text());
                $title.removeClass('on');
                //隐藏父级或隐藏h5
                if ($title.is('h5')) {
                    $title.parent().addClass('off');
                } else {
                    $title.addClass('off');
                }
                //所属链接仅显示匹配的
                $ul.hide().find('> li > a').each(function () {
                    var $this = $(this);
                    var $span2 = $this.find('span');
                    if (valReg.test($this.text())) {
                        $span2.html($span2.text().replace(valReg, '<mark>$1</mark>'));
                        $this.parent().removeClass('off');
                        //存在匹配时父级才显示
                        showNavParents($ul.show().prev());
                    } else {
                        $span2.text($span2.text());
                        $this.parent().addClass('off');
                    }
                });
                //下一级继续完全筛选
                $ul.find('> li > strong').each(function () {
                    filterNav('filter', valReg, $(this));
                });
            }
        }
        //当类型为打开，显示全部链接和文件夹
        else if (type == 'open') {
            $title.removeClass('off');
            if ($title.hasClass('on')) {
                $ul.show();
            } else {
                $ul.hide();
            }
            //当存在正则时，显示匹配
            if (!!valReg) {
                $span.html($span.text().replace(valReg, '<mark>$1</mark>'));
                if (valReg.test($span.text())) {
                    $ul.show();  //当文件夹名称命中，展开文件夹
                }
                $ul.find('> li > a').each(function () {
                    var $this = $(this);
                    var $span2 = $this.find('span');
                    $span2.html($span2.text().replace(valReg, '<mark>$1</mark>'));
                    if (valReg.test($this.text())) {
                        $ul.show();  //当链接名称命中，展开文件夹
                    }
                    $this.parent().removeClass('off');
                });
                //父级显示
                showNavParents($title);
                //下一级继续以相同类型显示
                $ul.find('> li > strong').each(function () {
                    filterNav('open', valReg, $(this));
                });
            }
            //当正则不存在，显示所有本级和子级、清除匹配
            else {
                $span.text($span.text());
                $ul.find('> li > a').each(function () {
                    var $span2 = $(this).find('span');
                    $span2.text($span2.text());
                });
                $ul.children('li').removeClass('off').children('strong').each(function () {
                    filterNav('open', null, $(this));
                });
            }
        }
    };
    //向上递归显示父级
    var showNavParents = function ($title) {
        $title.addClass('on').removeClass('off');
        //向上显示直到一级目录
        if (!$title.is('h5')) {
            var $prev2 = $title.parent().removeClass('off').parent().show().prev();
            showNavParents($prev2);
        }
    };

    //改变底部上下篇目
    var changeSibling = function ($item) {
        //如果未传导航项进来，隐藏上下篇目栏位
        if (!$item) {
            $mainSibling.removeClass('on');
            return;
        }
        //获取平级文档链接
        var getDocLink = function (type, $elm) {
            var $other = $elm[type]();
            if ($other.length == 0) {
                return null;
            }
            if ($other.children('ul').length > 0) {
                return getDocLink(type, $other);
            } else {
                return $other.children('a');
            }
        };
        //设置上下篇目导航
        var setSiblingNav = function (num, $other) {
            if ($other) {
                $mainSibling.find('a').eq(num)
                    .attr('href', $other.attr('href'))
                    .text($other.text());
            } else {
                $mainSibling.find('a').eq(num)
                    .removeAttr('href')
                    .text('没有了');
            }
        };
        setSiblingNav(0, getDocLink('prev', $item));
        setSiblingNav(1, getDocLink('next', $item));
        if (testing && testing.isOpen()) {
            $mainSibling.addClass('on');
        }
    };

    //改变导航显示
    var changeNav = function (path) {
        if (path == '首页') {
            $menuBar.find('h4').addClass('on');
            $menuBar.find('a').removeClass('on');
            changeSibling(null);
        } else {
            var hsLink = false;
            $menuBar.find('a').each(function () {
                var $this = $(this);
                var path2 = $this.attr('href').split('file=')[1];
                if (path2 == path) {
                    hsLink = true;
                    //本层加高亮
                    var $prev = $this.addClass('on').parent().parent().show().prev().addClass('on');
                    //父级高亮
                    showNavParents($prev);
                    //改变上下篇切换
                    changeSibling($this.parent());
                } else {
                    $this.removeClass('on');
                }
            });
            if (hsLink) {
                $menuBar.find('h4').removeClass('on');
            }
        }
        curPath = path;
        $menuBar.trigger('scrollbar');
    };

    //改变页面
    var changePage = function (path, withOutPushState, callback) {
        //第一步，从本地缓存读取并渲染页面
        var localDoc = storage.read(path);
        docs.renderDoc(localDoc);
        testing && testing.crawlContent();
        $main.trigger('scrollbar');
        $mainInner.scrollTop(0);  //返回顶部
        //更新history记录
        if (!withOutPushState && HISTORY_STATE) {
            history.pushState({path: path}, '', '?file=' + path);
        }
        //第二步，加载服务器上的文档资源，如果有更新重新渲染
        docs.loadPage(path, function (state, content) {
            //读取服务器文档失败时
            if (state == 'error') {
                //如果本地缓存为空，且服务器文档读取失败时，跳回首页
                if (localDoc == '') {
                    docs.loadPage('首页', function (state, content) {
                        if (state == 'success') {
                            docs.renderDoc(content);
                            storage.saveDoc('首页', content);
                            $main.trigger('scrollbar');
                        }
                    });
                    if (HISTORY_STATE) {
                        history.replaceState({path: '首页'}, '', '?file=首页');
                    }
                }
                //如果本地缓存不为空，但服务器文档读取失败时
                else {
                    //记录文档打开数
                    storage.increaseOpenedCount(path);
                    callback && callback();
                }
            }
            //读取服务器文档成功时
            else if (state == 'success') {
                //如果服务器文档有更新，更新本地缓存、重新渲染页面、重新判断接口测试
                if (content != localDoc) {
                    docs.renderDoc(content);
                    storage.saveDoc(path, content);
                    testing && testing.crawlContent();
                    $main.trigger('scrollbar');
                }
                //如果服务器文档与本地缓存一致，不进行任何操作
                else {
                }
                //记录文档打开数
                storage.increaseOpenedCount(path);
                callback && callback();
            }
        });
    };

    //读取目录导航
    var loadNav = function (callback) {
        $.get('library/$navigation.md?t=' + Date.now(), function (data) {
            $menuBar.find('.scroller-content').html(marked(data));
            $menuBar
                .find('h4').prepend('<svg><use xlink:href="#icon:navHome"></use></svg>').end()
                .find('h5').each(function () {
                var $this = $(this);
                $this.html('<svg><use xlink:href="#icon:navArrow"></use></svg><span>' + $this.text() + '</span>')
            });
            $menuBar.trigger('scrollbar');
            var pathList = [];
            //支持history api时，改变默认事件，导航不再跳转页面
            $menuBar.find('a').each(function () {
                var $this = $(this);
                $this.html('<span>' + $this.text() + '</span>');
                if (HISTORY_STATE) {
                    var path = $this.attr('href').split('file=')[1];
                    pathList.push(path);
                    $this.on('click', function () {
                        search.displayBox('off'); //关闭搜索面板
                        changeNav(path);
                        changePage(path);
                        $this.trigger('navchange');
                        return false;
                    });
                }
            });
            $mainSibling.find('a').on('click', function () {
                if (HISTORY_STATE) {
                    var $this = $(this);
                    var href = $this.attr('href');
                    if (typeof href != 'undefined' && href != '') {
                        var path = href.split('file=')[1];
                        changeNav(path);
                        changePage(path);
                        $this.trigger('navchange');
                    }
                    return false;
                }
            });
            $menuBar.find('strong').each(function () {
                var $this = $(this);
                $this.html('<span>' + $this.text() + '</span>');
            });
            //设置导航筛选初始值
            var filterVal = storage.getStates('navFilterKey');
            if (typeof filterVal != 'undefined' && filterVal != '') {
                $filter.val(filterVal).trigger('input2');
            }
            //回调
            callback && callback(pathList);
        }, 'text');
    };

    //根据hash改变滚动位置
    var changeScrollByHash = function () {
        var hash = location.hash.split('#')[1];
        //当不存在hash
        if (!hash || hash.length == '') {
            //检测是否在顶部，不在顶部滚动至顶部
            if ($mainInner.scrollTop() != 0) {
                $mainInner.scrollTop(0);
            }
            return;
        }
        //获取hash指向的元素
        var $hash = $('.anchor[name="' + hash + '"]');
        if ($hash.length == 0) {
            return
        }
        //滚动至元素
        $mainInner.scrollTop($hash.position().top + $mainInner.scrollTop() - 10);
    };

    /*
     启动应用
     */

    //解析地址参数
    var curPath = tools.getURLParameter('file');
    curPath = !curPath ? '首页' : decodeURI(curPath);

    //加载导航
    loadNav(function (list) {
        //核对本地存储
        storage.checkLibChange(list);
        //首次打开改变导航
        changeNav(curPath);
        //首次打开改变页面
        changePage(curPath, true, changeScrollByHash);
    });

    //history api 浏览器前进后退操作响应
    if (HISTORY_STATE) {
        $win.on('popstate', function (e) {
            var path;
            //当有状态记录时，直接跳转
            if (e.originalEvent.state) {
                path = e.originalEvent.state.path;
                //改变导航
                changeNav(path);
                //改变页面
                changePage(path, true, changeScrollByHash);
            }
            //当没有状态记录时
            else {
                path = tools.getURLParameter('file');
                path = !path ? '首页' : decodeURI(path);
                //判断 url 路径是否和当前一样，不一样才跳转
                if (path != curPath) {
                    //改变导航
                    changeNav(path);
                    //改变页面
                    changePage(path, true, changeScrollByHash);
                }
                //相同时不跳转，根据 hash 变化改变位置
                else {
                    changeScrollByHash();
                }
            }
        });
    }

    /*
     回调中转
     */

    //重建缓存
    search.onNeedRebuildStorage = function (callback) {
        storage.clearLibraries();
        var list = storage.getIndexList();
        var count = 0;
        var load = function (path, i) {
            //为避免重建缓存频率过高，人为增设每个请求时间间隔
            setTimeout(function () {
                docs.loadPage(path, function (state, content) {
                    //文档读取成功时保存到内存
                    if (state == 'success') {
                        storage.saveDocToDB(path, content);
                    }
                    //循环结束后完成重建
                    if (++count >= list.length) {
                        storage.saveRebuild();
                        callback && callback();
                    }
                });
            }, i * 100);
        };
        for (var i = 0, item; item = list[i]; i++) {
            load(item, i);
        }
    };

});


