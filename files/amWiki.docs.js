/**
 * amWiki Web端 - 文档加载与渲染模块
 * @author Tevin
 */

;
(function (win, doc, $) {

    'use strict';

    var hljs = win.hljs;
    var marked = win.marked;
    var URL_ENCODE_NAME = 'AMWikiUrlEncode';  //记录url编码的键名

    /**
     * 文档管理
     * @constructor
     */
    var Docs = function () {
        this.$e = {
            win: $(win),
            //markdown 文档内容容器
            view: $('#view'),
            //网页 title 标签
            title: $('title'),
            //目录悬浮窗标题
            contentsTitle: $('#contentsTitle')
        };
        this.data = {
            //记录页面宽度
            pageWidth: 0
        };
        this._initUrlEncode();
        this._initHashEvent();
    };

    /**
     * 初始化url编码类型标记
     * @private
     */
    Docs.prototype._initUrlEncode = function () {
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

    /**
     * 修正移动端hash变化时滚动位置
     * @private
     */
    Docs.prototype._initHashEvent = function () {
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

    /**
     * 转换链接文本
     * @param {String} str
     * @returns {String}
     * @private
     */
    Docs.prototype._tramsformLinkText = function (str) {
        return str
            .replace(/^\s+|\s+$/g, '')  //去除首尾空格
            .replace(/'/g, '&#39;')  //转义单引号
            .replace(/"/g, '&#34;')  //转义双引号，由于双引号无法正确传递给html属性，当作为hash时将删除处理
            .replace(/\(/g, '&#40;')  //转义左圆括号
            .replace(/\)/g, '&#41;')  //转义右圆括号
            .replace(/\[/g, '&#91;')  //转义左中括号
            .replace(/\]/g, '&#93;');  //转义右中括号
    };

    /**
     * 设置文档h1、h2、h3描记
     * @returns {string}
     * @private
     */
    Docs.prototype._setTitlesAnchor = function () {
        var that = this;
        var $titles = null;
        var hash = '';
        var contentsMd = '';  //提取目录为markdown字符串
        if (location.hash && location.hash.length > 1) {
            hash = location.hash.split('#')[1];
        }
        var anchorHtml = '<a class="anchor" href="#{title}" name="{title}">' +
            '<svg><use xlink:href="#icon:linkAnchor"></use></svg></a>';
        $titles = that.$e.view.find('h1,h2,h3');
        $titles.each(function (index, element) {
            var $this = $(element);
            var text1 = that._tramsformLinkText($this.text());
            var text2 = text1.replace(/&#34;/g, '');  //删除双引号
            //提取目录
            if ($this.is('h2')) {
                contentsMd += '1. [' + text1 + '](#' + text2 + ' "' + text2 + '")\n';
            } else if ($this.is('h3')) {
                contentsMd += '\t1. [' + text1 + '](#' + text2 + ' "' + text2 + '")\n';
            }
            //设置描记
            $this.prepend(anchorHtml.replace(/{title}/g, text2));
            //首次打开页面滚动位置修正
            if (hash == $this.text().replace(/"/g, '')) {
                if (that.data.pageWidth <= 720) {
                    that.$e.win.scrollTop($this.offset().top - 55);
                } else {
                    that.$e.win.scrollTop($this.offset().top);
                }
            }
        });
        if (contentsMd.indexOf('\t') == 0) {
            contentsMd = '1. &#12288;\n' + contentsMd;
        }
        return contentsMd;
    };

    /**
     * 创建脚注
     * @param {String} text
     * @returns {String}
     * @private
     */
    Docs.prototype._createFootnote = function (text) {
        var footnotes = [];
        var noteReg = /\[\^([ a-zA-Z\d]+)]/g;
        var footReg = /\[\^([ a-zA-Z\d]+)]: ?([\S\s]+?)(?=\[\^(?:[ a-zA-Z\d]+)]|\n\n|$)/g;
        var templates = $.trim($('#template\\:footnote').text()).split(/[\r\n]+\s*/g);
        templates[4] += templates[5] + templates[6] +templates[7] +templates[8];
        var html = '';
        //提取脚注内容
        text = text.replace(footReg, function (match, s1, s2, index) {
            var title = '';
            s2 = s2.replace(/"(.*?)"\s*$/, function (m, ss1) {
                title = ss1;
                return '';
            });
            footnotes.push({
                index: index,
                note: s1,
                content: s2,
                title: title,
                used: false
            });
            //从页面上删除底部脚注内容
            return '';
        });
        //将脚注的标记转为序号
        text = text.replace(noteReg, function (match, s1) {
            for (var i = 0, foot; foot = footnotes[i]; i++) {
                if (foot.note == s1) {
                    foot.used = true;
                    return templates[0].replace(/{{index}}/g, i + 1 + '').replace('{{title}}', foot.title);
                }
            }
            //当脚注的正文不存在，视标记文本为正文
            var length = footnotes.push({
                index: 0,
                note: s1,
                content: s1,
                used: true
            });
            return templates[0].replace(/{{index}}/g, length + '');
        });
        //生成底部脚注html
        if (footnotes.length >= 1) {
            for (var i = 0, foot; foot = footnotes[i]; i++) {
                if (foot.used) {
                    html += templates[2]
                        .replace('{{index}}', i + 1)
                        .replace('{{content}}', foot.content)
                        .replace('{{back}}', templates[4].replace('{{index}}', i + 1));
                } else {
                    html += templates[3].replace('{{content}}', foot.content);
                }
            }
            html = templates[1].replace('{{list}}', html);
        }
        return text + '\n<br>' + html;
    };

    /**
     * 设置js代码块注释显示隐藏
     * @param {Object} $elm
     * @private
     */
    Docs.prototype._setJSCommentDisable = function ($elm) {
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

    /**
     * 解析流程图
     * @param {Object} $elm
     * @private
     */
    Docs.prototype._createFlowChart = function ($elm) {
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

    /**
     * 自定义图片大小与对齐方式
     * @param {String} html
     * @returns {String}
     * @private
     */
    Docs.prototype._resizeImg = function (html) {
        return html.replace(/<img(.*?)src="(.*?)=(\d*[-x×]\d*)(-[lrc])?"/g, function (m, s1, s2, s3, s4) {
            var imgHtml = '<img' + s1 + 'src="' + s2 + '"';
            var imgSize = s3.split(/[-x×]/);
            var align = ({'-l': 'left', '-r': 'right', '-c': 'center'})[s4];
            if (imgSize[0]) {
                imgHtml += ' width="' + imgSize[0] + '"';
            }
            if (imgSize[1]) {
                imgHtml += ' height="' + imgSize[1] + '"';
            }
            if (align) {
                imgHtml += ' align="' + align + '"';
            }
            return imgHtml;
        });
    };

    /**
     * 解析 markdown 复选框
     * @param {String} html
     * @returns {String}
     * @private
     */
    Docs.prototype._setCheckbox = function (html) {
        return html.replace(/\[([√×Xx\s\-_])\]\s(.*?)([<\n\r])/g, function (m, s1, s2, s3, index) {
            var checkboxHtml = '<input type="checkbox" id="checkbox' + index + '"';
            checkboxHtml += /\s/.test(s1) ? '>' : 'checked="true">';
            checkboxHtml += '<label for="checkbox' + index + '">' + s2 + '</label>';
            return checkboxHtml + s3;
        });
    };

    /**
     * 编码 url
     *   由于服务器可能存在 GBK 或 UTF-8 两种编码，中文路径编码不对需要切换才能访问
     * @param {String} path
     * @param {String} type - 是否需要编码类型反转， GBK、UTF-8切换
     * @returns {String}
     * @private
     */
    Docs.prototype._encodeUrl = function (path, type) {
        var url = '';
        var paths = [];
        //正常编码
        if (type == 'normal') {
            if (localStorage[URL_ENCODE_NAME] == 'utf8') {
                url = 'library/' + encodeURI(path);
            } else if (localStorage[URL_ENCODE_NAME] == 'gbk') {
                paths = path.split('/').map(function(path) {
                    return GBK.encode(path);
                });
                url = 'library/' + paths.join('/');
            }
        }
        //反转编码
        else if (type == 'reverse') {
            if (localStorage[URL_ENCODE_NAME] == 'utf8') {
                paths = path.split('/').map(function(path) {
                    return GBK.encode(path);
                });
                url = 'library/' + paths.join('/');
            } else if (localStorage[URL_ENCODE_NAME] == 'gbk') {
                url = 'library/' + encodeURI(path);
            }
        }
        url += '.md?t=' + (new Date()).getTime();
        return url;
    };

    /**
     * 渲染文档
     * @param {String} content - 需要渲染的文档内容
     * @public
     */
    Docs.prototype.renderDoc = function (content) {
        var that = this;
        var html = '';
        this.cleanView();
        //创建脚注
        content = this._createFootnote(content);
        //编译 markdown
        html = marked(content);
        //创建目录标记，和悬浮窗格式统一
        html = html.replace(/\[(TOC|MENU)]/g, '<blockquote class="markdown-contents"></blockquote>');
        //自定义图片大小与对齐方式
        html = this._resizeImg(html);
        //复选框
        html = this._setCheckbox(html);
        //填充到页面
        this.$e.view.html(html);
        //功能化代码块
        this.$e.view.find('pre code').each(function (i, element) {
            var $elm = $(element);
            var className = $elm.attr('class') || '';
            //创建流程图
            if (className.indexOf('lang-flow') >= 0) {
                that._createFlowChart($elm);
            }
            //创建语法高亮
            else if (className.indexOf('lang') >= 0) {
                hljs.highlightBlock(element);
            }
            //创建js注释开关
            className = $elm.attr('class') || '';
            if (className.indexOf('javascript') >= 0) {
                that._setJSCommentDisable($elm);
            }
        });
        //设置网页title
        var title = this.$e.view.find('h1').eq(0).text();
        this.$e.title.text(title);
        this.$e.contentsTitle.text(title).attr('href', '#' + title.replace(/"/g, ''));
        //创建描点
        var contents = this._setTitlesAnchor();
        //创建目录
        $('.markdown-contents').html(marked(contents));
    };

    /**
     * 读取文档
     * @param {String} url
     * @param {Function} callback
     * @public
     */
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
     * 加载指定页面
     * @param {String} path - 页面资源地址
     * @param {Function} callback - 加载完成后的回调，包含参数：
     *    type - 加载页面最终状态，success、error 两种
     *    content - 加载页面成功时，传递加载的内容
     * @public
     */
    Docs.prototype.loadPage = function (path, callback) {
        //console.log(path);
        var that = this;
        var url = this._encodeUrl(path, 'normal');
        this.getDoc(url, function (type, data) {
            if (type == 'fail') {
                //如果第一失败，转换url编码类型后发送第二次请求
                var url = that._encodeUrl(path, 'reverse');
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
     * 清理页面
     * @public
     */
    Docs.prototype.cleanView = function () {
        this.$e.view.find('.lang-off-js-comment').off('click');
        this.$e.view.html('');
    };

    return win.AWDocs = Docs;

})(window, document, jQuery);