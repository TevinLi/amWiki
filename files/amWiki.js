/**
 * Created by Tevin on 2016/3/22.
 */

$(function () {

    'use strict';

	function getURLParameter(name) {
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    if(r != null){
	          return encodeURIComponent(r[2]);
	     } else {
	         return null;
	     }
	}

    //菜单折叠
    var $menuBar = $('#menuBar');
    /*
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
	*/

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
    });
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
    });

    //读取导航目录
    $.get('library/_navigation_.md', function (data) {
        $menuBar.html(marked(data));
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
    var setView = function() { 
	    //console.log(path);
	    if (path == encodeURI('首页')) { 
	    	//console.log('at home', $menuBar.find('h4'));
	    	$menuBar.find('h4').addClass('on');
	    } else {  
	    	//console.log('not home', $menuBar.find('a'));
	        $menuBar.find('a').each(function () {
	            var $this = $(this);
	            var hsLink = false;
	            console.log(encodeURI($(this).attr('href').split('file=')[1]), path)
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
    }

    //设置标题hash
    var $view = $('#view');
    var setTitleAnchor = function(element){ 
    	var hash = '';
    	if (location.hash && location.hash.length > 1) { 
    		hash = location.hash.split('#')[1];
    	}
    	var anchorHtml = '<a class="anchor" href="#{title}" name="{title}"><img src="amWiki/images/icon_link.png"/></a>';
    	$view.find('h1,h2,h3').each(function (index, element) {
	    	var $title = $(element);
	    	var text = $title.text().replace(/\s+/g,'');
	    	if (hash == text) { 
	    		$(window).scrollTop($title.offset().top);
	    	}
	    	$title.prepend(anchorHtml.replace(/\{title\}/g, text));
    	});
    }

    //加载页面
    var url;
    if (localStorage.urlEcode == 'encode') {
        url = 'library/' + encodeURIComponent(path) + '.md?t=' + (new Date()).getTime();
    } else if (localStorage.urlEcode == 'decode') {
        url = 'library/' + path + '.md?t=' + (new Date()).getTime();
    }
    $.get(url, function (data) {
        $view.html(marked(data)).find('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
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
                hljs.highlightBlock(block);
            });
	        setTitleAnchor();
        }, 'text').fail(function () {
            location.search = '?file=首页';
        });
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

});

/*
$(function () {
    //修补IE下缺失的onhashchange事件
    if (('onhashchange' in window) && ((typeof document.documentMode === 'undefined') || document.documentMode == 8)) {
    } else {
        var oldHash = '';
        setInterval(function () {
            if (location.hash != oldHash) {
                var newHash = location.hash;
                $(document).trigger('hashchange', {
                    oldHash: oldHash,
                    newHash: newHash
                });
                oldHash = newHash;
            }
        }, 150);
    }
});
*/