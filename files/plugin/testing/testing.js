/**
 * amWiki Web端 - 简单 ajax 测试模块
 * @author Tevin
 *
 * @notice 仅当页面存在“请求地址”、“请求类型”、“请求参数”三个h3标题时触发，且参数列表表格顺序不能打乱
 */

(function (win, $) {

    'use strict';

    /**
     * 建接口测试
     * @constructor
     */
    var Testing = function () {
        //缓存元素
        this.$e = {
            win: $(win),
            //测试面板
            testingBox: $('#testingBox'),
            //md文档渲染处
            view: $('#view'),
            //上一篇下一篇切换
            sibling: $('#mainSibling'),
            //面板显示隐藏按钮
            testingShow: null,
            //参数列表的容器
            testingParam: $('#testingParam')
        };
        //缓存数据
        this._data = {
            //全局参数列队
            globalParams: [],
            //全局参数是否生效
            globalParamWorking: true,
            //单条参数模板
            paramTemplate: $('#template\\:formList').text()
        };
        //请求数据
        this._request = {
            //请求地址
            url: '',
            //请求类型
            method: '',
            //请求参数
            params: [],
            //全局参数
            paramGlobal: []
        };
        this._useGlobalParam();
        this._bindPanelCtrl();
        this._bindAjaxSend();
    };

    /**
     * 抓取请求内容，抓取成功才显示按钮
     * @public
     */
    Testing.prototype.crawlContent = function () {
        var that = this;
        var testingReqState = [false, false, false];
        this.$e.testingShow.removeClass('show');
        this.$e.view.find('h3').each(function () {
            var $this = $(this);
            var name = $.trim($this.text());
            //抓取请求地址
            if (name == '请求地址' && !testingReqState[0]) {
                that._request.url = $.trim($this.next().text());
                if (that._request.url.indexOf('http') < 0) {
                    if (that._request.url.indexOf('/') == 0) {
                        that._request.url = 'http://' + location.host + that._request.url;
                    } else {
                        that._request.url = 'http://' + location.host + '/' + that._request.url;
                    }
                }
                testingReqState[0] = true;
            }
            //抓取请求类型
            else if (name == '请求类型' && !testingReqState[1]) {
                that._request.method = $.trim($this.next().text()).toUpperCase();
                var methodState = false;
                ['GET', 'POST', 'PUT', 'DELETE'].forEach(function (value, index) {
                    if (that._request.method == value) {
                        methodState = true;
                    }
                });
                if (!methodState) {
                    that._request.method = 'POST';
                }
                testingReqState[1] = true;
            }
            //抓取请求参数
            else if (name == '请求参数' && !testingReqState[2]) {
                //清空参数列表
                that._request.params.length = 0;
                //不存在table直接无参数，存在table时开始解析
                if ($this.next('table').length > 0) {
                    $this.next('table').find('tbody').find('tr').each(function () {
                        var $tds = $(this).find('td');
                        //抓取内容
                        var param = {
                            keyName: $tds.eq(0).text().replace(/^\s+|\s+$/g, ''),
                            valueType: $tds.eq(1).text().replace(/^\s+|\s+$/g, ''),
                            required: $tds.eq(2).text().replace(/^\s+|\s+$/g, ''),
                            describe: $tds.eq(3).text().replace(/^\s+|\s+$/g, ''),
                            default: $tds.eq(4).text().replace(/^\s+|\s+$/g, ''),
                            reference: $tds.eq(5).text().replace(/^\s+|\s+$/g, '')
                        };
                        //修正请求参数，正确键名才添加参数
                        if (param.keyName != '无' && param.keyName != '-' && param.keyName != '') {
                            //“必填”转换
                            if (param.required == '是' || param.required == '必填' || param.required == 'yes' || param.required == 'true') {
                                param.required = 'required';
                            } else {
                                param.required = '';
                            }
                            //“默认值”转换
                            if (param.default == '-' || param.default == '无' || param.default == 'Null' || param.default == 'null') {
                                if (param.reference && param.reference != '-' && param.reference != '无' && param.reference != 'Null' && param.reference != 'null') {
                                    param.default = param.reference;
                                } else {
                                    param.default = '';
                                }
                            }
                            that._request.params.push(param);
                        }
                    });
                }
                testingReqState[2] = true;
            }
        });
        if (testingReqState[0] && testingReqState[1] && testingReqState[2]) {
            this._initPanel();
        } else {
            this._offPanel();
        }
        testingReqState = [false, false, false];
    };

    /**
     * 关闭测试面板
     * @private
     */
    Testing.prototype._offPanel = function () {
        this.$e.testingShow.removeClass('show');
        if (this.$e.testingShow.hasClass('on')) {
            this.displayBox('off');
        }
        //清除抓取参数
        this._request.url = '';
        this._request.method = '';
        this._request.params = [];
        //清空请求地址
        $('#testingSendUrl').val('');
        //还原请求类型
        $('#testingSendType').find('option[value="POST"]').prop('selected', true);
        //清空参数列表
        this.$e.testingParam.html('');
        //重置iframe
        $('#testingResponse')[0].contentWindow.location.reload();
    };

    /**
     * 测试面板填充数据
     * @private
     */
    Testing.prototype._initPanel = function () {
        this.$e.testingShow.addClass('show');
        //填充请求地址
        $('#testingSendUrl').val(this._request.url);
        //填充请求类型
        $('#testingSendType').find('option[value="' + this._request.method + '"]').prop('selected', true);
        //清空现有参数列表
        this.$e.testingParam.html('');
        //填充参数列表
        if (this._request.params.length > 0) {
            var paramsHTML = '';
            for (var i = 0; i < this._request.params.length; i++) {
                paramsHTML += this._data.paramTemplate
                    .replace('{{describe}}', this._request.params[i].describe)
                    .replace('{{keyName}}', this._request.params[i].keyName)
                    .replace('{{default}}', this._request.params[i].default)
                    .replace('{{valueType}}', this._request.params[i].valueType)
                    .replace('{{required}}', this._request.params[i].required);
            }
            this.$e.testingParam.append(paramsHTML);
        } else {
            this.$e.testingParam.append('<li>无</li>');
        }
    };

    /**
     * 切换测试面板显示隐藏状态
     * @param {String} type - on / off
     * @public
     */
    Testing.prototype.displayBox = function (type) {
        var that = this;
        if (type == 'off') {
            this.$e.testingShow.removeClass('on').find('span').text('测试接口');
            this.$e.testingBox.css({
                'position': 'absolute'
            });
            this.$e.view.show().addClass('scroller-content');
            this.$e.sibling.addClass('scroller-content').addClass('on');
            this.$e.testingBox.removeClass('scroller-content').stop().animate({
                'width': '30%',
                'opacity': 0
            }, 200, 'swing', function () {
                that.$e.testingBox.removeAttr('style');
            });
        } else if (type == 'on') {
            this.$e.testingShow.addClass('on').find('span').text('关闭测试');
            this.$e.testingBox
                .css({
                    'display': 'block',
                    'width': '0',
                    'opacity': 0
                })
                .stop()
                .animate({
                    'width': '100%',
                    'opacity': 1
                }, 300, 'swing', function () {
                    that.$e.view.hide().removeClass('scroller-content');
                    that.$e.sibling.removeClass('scroller-content').removeClass('on');
                    that.$e.testingBox.addClass('scroller-content').css({
                        'position': 'relative'
                    });
                });
        }
    };

    /**
     * 测试面板普通操作
     * @private
     */
    Testing.prototype._bindPanelCtrl = function () {
        var that = this;
        //显示隐藏控制按钮
        this.$e.testingShow = $('<div class="testing-show">[<span>测试接口</span>]</div>');
        if (location.protocol == 'file:') {
            this.$e.testingShow
                .attr('disabled', 'disabled')
                .append('<i>您当前为本地模式打开，file:// 协议下不开放接口测试模块，请使用 http(s):// 网址打开</i>');
        }
        $('#main').append(this.$e.testingShow);
        //显示隐藏测试面板
        this.$e.testingShow.on('click', function () {
            var $this = that.$e.testingShow;
            if ($this.attr('disabled') == 'disabled') {
                $this.toggleClass('on');
            } else {
                if (that.$e.testingShow.hasClass('on')) {
                    that.displayBox('off');
                } else {
                    that.displayBox('on');
                }
            }
        });
        //填充请求地址
        $('#testingSendUrl').on('change', function () {
            that._request.url = $(this).val();
        });
        //填充请求类型
        $('#testingSendType').on('change', function () {
            that._request.method = $(this).find("option:selected").val();
        });
        //清空所有普通参数的值
        $('#testingBtnReset').on('click', function () {
            that.$e.testingParam.find('.testing-param-val').val('');
        });
        //新增一个参数
        $('#testingBtnAdd').on('click', function () {
            var pHTML = that._data.paramTemplate
                .replace('{{describe}}', '新增参数')
                .replace('{{keyName}}', '')
                .replace('{{default}}', '')
                .replace('({{valueType}})', '')
                .replace('{{required}}', '');
            that.$e.testingParam.append(pHTML);
        });
    };

    /**
     * 全局参数模块
     * @private
     */
    Testing.prototype._useGlobalParam = function () {
        var that = this;
        this._data.globalParams = JSON.parse(localStorage['amWikiGlobalParam'] || '[]');  //全局参数
        var gParamTmpl = $('#template\\:globalParam').text();  //全局参数模板
        var $testingGlobalParam = $('#testingGlobalParam');  //全局参数显示容器
        var $testingGlobal = $('#testingGlobal');  //全局参数弹窗
        this._data.globalParamWorking = (localStorage['amWikiGParamWorking'] || 'on') == 'on';  //全局参数是否工作
        //显示弹窗
        $('#testingBtnGParam').on('click', function () {
            $testingGlobalParam.html('');
            that._data.globalParams = JSON.parse(localStorage['amWikiGlobalParam'] || '[]');
            if (that._data.globalParams.length == 0) {
                $testingGlobalParam.append('<li data-type="empty">无</li>');
            } else {
                for (var p = 0; p < that._data.globalParams.length; p++) {
                    $testingGlobalParam.append(gParamTmpl.replace('{{describe}}', that._data.globalParams[p].describe)
                        .replace('{{keyName}}', that._data.globalParams[p].keyName)
                        .replace('{{value}}', that._data.globalParams[p].value));
                }
            }
            $testingGlobal.show();
        });
        //基本操作
        $testingGlobal.on('click', function (e) {
            var $elm = $(e.target);
            //关闭
            if ($elm.hasClass('close') || $elm.hasClass('testing-global')) {
                $testingGlobal.hide();
            }
            //新增
            else if ($elm.hasClass('add')) {
                $testingGlobalParam.find('[data-type="empty"]').remove();
                $testingGlobalParam.append(gParamTmpl.replace('{{describe}}', '')
                    .replace('{{keyName}}', '')
                    .replace('{{value}}', ''));
            }
            //保存
            else if ($elm.hasClass('save')) {
                that._data.globalParams.length = 0;
                $testingGlobalParam.find('li').each(function (i, elment) {
                    var $inputs = $(this).find('input');
                    if ($inputs.eq(1).val()) {
                        that._data.globalParams.push({
                            describe: $inputs.eq(0).val(),
                            keyName: $inputs.eq(1).val(),
                            value: $inputs.eq(2).val()
                        });
                    }
                });
                localStorage['amWikiGlobalParam'] = JSON.stringify(that._data.globalParams);
                $testingGlobal.hide();
            }
        });
        //删除参数
        $testingGlobalParam.on('click', 'i', function () {
            $(this).parent().remove();
            if ($testingGlobalParam.find('li').length == 0) {
                $testingGlobalParam.append('<li data-type="empty">无</li>');
            }
        });
        $('#testingGlobalWorking').on('click', function () {
            if (that._data.globalParamWorking) {
                that._data.globalParamWorking = false;
                localStorage['amWikiGParamWorking'] = 'off';
                $(this).addClass('off');
            } else {
                that._data.globalParamWorking = true;
                localStorage['amWikiGParamWorking'] = 'on';
                $(this).removeClass('off');
            }
        }).addClass(this._data.globalParamWorking ? '' : 'off');
    };

    /**
     * 发送请求操作
     * @private
     */
    Testing.prototype._bindAjaxSend = function () {
        var that = this;
        var frame = $('#testingResponse')[0];
        var $duration = $('#testingDuration');  //耗时输出
        var $loading = $('#testingLoading');
        var $testingParam = $('#testingParam');  //参数列表
        $('#testingBtnSend').on('click', function () {
            $duration.text('');
            var realParam = {};  //合并参数列表
            //从面板获取最新(可能已修改)接口参数
            if ($testingParam.find('input').length > 0) {
                $testingParam.find('li').each(function () {
                    var $this = $(this);
                    realParam[$this.find('.testing-param-key').val()] = $this.find('.testing-param-val').val();
                });
            }
            //全局参数
            if (that._data.globalParams.length > 0 && that._data.globalParamWorking) {
                for (var i = 0; i < that._data.globalParams.length; i++) {
                    realParam[that._data.globalParams[i].keyName] = that._data.globalParams[i].value;
                }
            }
            frame.contentWindow.location.reload();  //刷新iframe以便重新输出内容
            $loading.show();
            var startTime = Date.now();
            $.ajax({
                type: that._request.method,
                url: that._request.url,
                data: realParam,
                dataType: 'text',
                success: function (data) {
                    $loading.hide();
                    $duration.text('耗时：' + parseFloat(Date.now() - startTime).toLocaleString() + ' ms');
                    var $frameBody = $(frame.contentWindow.document).find('body');
                    $frameBody.css('wordBreak', 'break-all');
                    if (/^\s*\{[\s\S]*\}\s*$/.test(data)) {
                        $frameBody[0].innerHTML = '<pre style="white-space:pre-wrap;word-break:break-all;"><pre>';
                        //json格式化输出
                        $frameBody.find('pre').text(win.tools.formatJson(data));
                    } else {
                        $frameBody[0].innerHTML = data.replace(/<!(doctype|DOCTYPE)\s+(html|HTML)>/, '');
                    }
                    setTimeout(function () {
                        $(frame).height($frameBody.height());
                    }, 100);
                },
                error: function (xhr, textStatus) {
                    $loading.hide();
                    $duration.text('耗时：' + parseFloat(Date.now() - startTime).toLocaleString() + ' ms');
                    var $frameBody = $(frame.contentWindow.document).find('body');
                    $frameBody.css('wordBreak', 'break-all');
                    var html = '<div style="margin-bottom:20px;padding:10px;background:#ffebe5;">HTTP Status: <b>' +
                        xhr.status + '</b> ' + xhr.statusText + '</div>';
                    //根据readyState简单判断跨域
                    if (xhr.readyState == 0) {
                        html += '<div style="font-size:14px;">请求未发送！可能是因为：' +
                            '<ul style="line-height:22px;">' +
                            '<li>请求了<b style="color:#FF201E;margin-right:1px;">跨域</b>地址</li>' +
                            '<li>接口被302重定向到跨域地址</li>' +
                            '<li>其他原因</li>' +
                            '</ul></div>';
                        $frameBody[0].innerHTML = html;
                    }
                    //不跨域且为json
                    else if (/^\s*\{[\s\S]*\}\s*$/.test(xhr.responseText)) {
                        html += '<pre style="white-space:pre-wrap;word-break:break-all;"><pre>';
                        $frameBody[0].innerHTML = html;
                        //json格式化输出
                        $frameBody.find('pre').text(win.tools.formatJson(xhr.responseText));
                    }
                    //其他不跨域
                    else {
                        html += xhr.responseText.replace(/<!(doctype|DOCTYPE)\s+(html|HTML)>/, '');
                        $frameBody[0].innerHTML = html;
                    }
                    setTimeout(function () {
                        $(frame).height($frameBody.height());
                    }, 100);
                }
            });
        });
    };

    /**
     * 判断测试面板是否处于打开状态
     * @returns {Boolean}
     * @public
     */
    Testing.prototype.isOpen = function () {
        return this.$e.testingShow.hasClass('on');
    };

    return win.AWTesting = Testing;

})(window, jQuery);