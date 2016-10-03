/**
 * @desc 文档加载渲染模块
 * @author Tevin
 */

;
(function (win, doc, $) {

    'use strict';

    var hljs = win.hljs;
    var marked = win.marked;
    var URL_ENCODE_NAME = 'AMWikiUrlEncode';  //记录url编码的键名

    /**
     * @class 创建一个文档管理对象
     */
    var Docs = function () {
        this.$e = {
            win: $(win),
            //markdown文档内容容器
            view: $('#view')
        };
        this.data = {
            pageWidth: 0
        };
        this.initUrlEncode();
        this.initHashEvent();
    };

    //初始化url编码类型标记
    Docs.prototype.initUrlEncode = function () {
        /*
         * 由于win与linux采用不同编码保存中文文件名
         * 记录浏览器打开当前域名的wiki时服务器中文文件名的编码类型
         */
        if (!localStorage[URL_ENCODE_NAME]) {
            localStorage[URL_ENCODE_NAME] = 'utf8';
        } else if (localStorage[URL_ENCODE_NAME] != 'utf8' && localStorage[URL_ENCODE_NAME] != 'gbk') {
            localStorage[URL_ENCODE_NAME] = 'utf8';
        }
        //旧版本记录移除
        delete localStorage.urlEcode
    };

    //修正移动端hash变化时滚动位置
    Docs.prototype.initHashEvent = function () {
        var that = this;
        this.data.pageWidth = this.$e.win.width();
        this.$e.win.on('resize', function () {
            that.data.pageWidth = that.$e.win.width();
        });
        this.$e.win.on('hashchange', function (e) {
            var hash = location.hash.split('#')[1];
            if (that.data.pageWidth <= 720) {
                that.$e.view.find('h1,h2,h3').each(function (index, element) {
                    var $title = $(element);
                    var text = $title.text().replace(/\s+/g, '');
                    if (hash == text) {
                        that.$e.win.scrollTop($title.offset().top - 55);
                    }
                });
            }
        });
    };

    //设置文档h1、h2、h3描记
    Docs.prototype.setTitlesAnchor = function () {
        var that = this;
        var $titles = null;
        var hash = '';
        if (location.hash && location.hash.length > 1) {
            hash = location.hash.split('#')[1];
        }
        var anchorHtml = '<a class="anchor" href="#{title}" name="{title}"><svg><use xlink:href="#linkAnchor"></use></svg></a>';
        $titles = that.$e.view.find('h1,h2,h3');
        $titles.each(function (index, element) {
            var $this = $(element);
            var text = $.trim($this.text());
            //设置描记
            $this.prepend(anchorHtml.replace(/\{title\}/g, text));
            //首次打开页面滚动位置修正
            if (hash == text) {
                if (that.data.pageWidth <= 720) {
                    that.$e.win.scrollTop($this.offset().top - 55);
                } else {
                    that.$e.win.scrollTop($this.offset().top);
                }
            }
        });
    };

    //设置js注释隐藏
    Docs.prototype.setJSCommentDisable = function ($elm) {
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
    Docs.prototype.createFlowChart = function ($elm) {
        var code = $elm.text();
        $elm.text('');
        var id = 'flowChart' + parseInt(Math.random() * 500);
        $elm.attr('id', id);
        var chart = flowchart.parse(code);
        chart.drawSVG(id, {
            'line-width': 1.3,
            'line-length': 55,
            'line-color': '#666',
            'text-margin': 10,
            'font-size': 12,
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

    //编码url
    Docs.prototype.encodeUrl = function (path, type) {
        var url = '';
        var paths = [];
        //正常编码
        if (type == 'normal') {
            if (localStorage[URL_ENCODE_NAME] == 'utf8') {
                url = 'library/' + encodeURI(path);
            } else if (localStorage[URL_ENCODE_NAME] == 'gbk') {
                paths = path.split('/');
                url = 'library/' + GBK.encode(paths[0]);
                url += paths[1] ? '/' + GBK.encode(paths[1]) : '';
                url += paths[2] ? '/' + GBK.encode(paths[2]) : '';
            }
        }
        //反转编码
        else if (type == 'reverse') {
            if (localStorage[URL_ENCODE_NAME] == 'utf8') {
                paths = path.split('/');
                url = 'library/' + GBK.encode(paths[0]);
                url += paths[1] ? '/' + GBK.encode(paths[1]) : '';
                url += paths[2] ? '/' + GBK.encode(paths[2]) : '';
            } else if (localStorage[URL_ENCODE_NAME] == 'gbk') {
                url = 'library/' + encodeURI(path);
            }
        }
        url += '.md?t=' + (new Date()).getTime();
        return url;
    };

    /**
     * @desc 渲染文档
     * @param content {string} - 需要渲染的文档内容
     */
    Docs.prototype.renderDoc = function (content) {
        var that = this;
        this.cleanView();
        this.$e.view
            .html(marked(content))
            .find('pre code').each(function (i, element) {
                var $elm = $(element);
                var className = $elm.attr('class') || '';
                //流程图
                if (className.indexOf('lang-flow') >= 0) {
                    that.createFlowChart($elm);
                }
                //语法高亮
                else if (className.indexOf('lang') >= 0) {
                    hljs.highlightBlock(element);
                }
                //js注释开关
                className = $elm.attr('class') || '';
                if (className.indexOf('javascript') >= 0) {
                    that.setJSCommentDisable($elm);
                }
            });
        //设置网页title
        $('title').text(this.$e.view.find('h1').eq(0).text());
        //设置描点
        this.setTitlesAnchor();
    };

    //读取文档
    Docs.prototype.getDoc = function (url, callback) {
        var that = this;
        var ajaxData = {
            type: 'get',
            url: url,
            dataType: 'text'
        };
        $.ajax(ajaxData)
            .done(function (data) {
                //如果请求响应包含html，视为报错
                if (/^\s*<!(DOCTYPE|doctype)/.test(data)) {
                    return callback('fail');
                }
                //成功回调
                callback('done', data);
            })
            //请求失败
            .fail(function () {
                callback('fail');
            });
    };

    /**
     * @callback loadPageCallback
     * @param type {string} - 加载页面最终状态，success、error 两种
     * @param content {string} - 加载页面成功时，传递加载的内容
     */
    /**
     * @desc 加载指定页面
     * @param path {string} - 页面资源地址
     * @param callback {loadPageCallback} - 加载完成后的回调
     */
    Docs.prototype.loadPage = function (path, callback) {
        //console.log(path);
        var that = this;
        var url = this.encodeUrl(path, 'normal');
        this.getDoc(url, function (type, data) {
            if (type == 'fail') {
                //如果第一失败，转换url编码类型后发送第二次请求
                var url = that.encodeUrl(path, 'reverse');
                that.getDoc(url, function (type) {
                    //第二次仍然失败，视为打开文档失败
                    if (type == 'fail') {
                        callback && callback('error');
                    }
                    //如果第二次才成功，转换保存的编码类型标记
                    else if (type == 'done') {
                        localStorage[URL_ENCODE_NAME] = localStorage[URL_ENCODE_NAME] == 'utf8' ? 'gbk' : 'utf8';
                        callback && callback('success', data);
                    }
                });
            } else if (type == 'done') {
                callback && callback('success', data);
            }
        });
    };

    /**
     * @desc 清理页面
     */
    Docs.prototype.cleanView = function () {
        this.$e.view.find('.lang-off-js-comment').off('click');
        this.$e.view.html('');
    };

    return win.AWDocs = Docs;

})(window, document, jQuery);