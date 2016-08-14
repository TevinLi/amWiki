/**
 * @desc 简单ajax测试模块
 * @author Tevin
 * @summary 仅当页面存在“请求地址”、“请求类型”、“请求参数”三个h3标题时触发
 */

(function (win, doc, $) {

    'use strict';

    /**
     * @class 创建一个借口测试管理对象
     */
    var Testing = function () {
        //缓存元素
        this.$e = {
            win: $(win),
            doc: $(doc),
            //测试面板
            testingBox: $('#testingBox'),
            //md文档渲染处
            view: $('#view'),
            //面板显示隐藏按钮
            testingShow: null,
            //参数列表的容器
            testingParam: $('#testingParam')
        };
        //缓存数据
        this.data = {
            //全局参数列队
            globalParams: [],
            //全局参数是否生效
            globalParamWorking: true,
            //单条参数模板
            paramTemplate: $('#templateFormList').text()
        };
        //请求数据
        this.request = {
            //请求地址
            url: '',
            //请求类型
            method: '',
            //请求参数
            params: [],
            //全局参数
            paramGlobal: []
        };
        this.useGlobalParam();
        this.bindPanelCtrl();
        this.bindAjaxSend();
    };

    /**
     * @desc 抓取请求内容，抓取成功才显示按钮
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
                that.request.url = $.trim($this.next().text());
                if (that.request.url.indexOf('http') < 0) {
                    if (that.request.url.indexOf('/') == 0) {
                        that.request.url = 'http://' + location.host + that.request.url;
                    } else {
                        that.request.url = 'http://' + location.host + '/' + that.request.url;
                    }
                }
                testingReqState[0] = true;
            }
            //抓取请求类型
            else if (name == '请求类型' && !testingReqState[1]) {
                that.request.method = $.trim($this.next().text()).toUpperCase();
                if (that.request.method != 'POST' && that.request.method != 'GET') {
                    that.request.method = 'POST';
                }
                testingReqState[1] = true;
            }
            //抓取请求参数
            else if (name == '请求参数' && !testingReqState[2]) {
                //清空参数列表
                that.request.params.length = 0;
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
                            default: $tds.eq(4).text().replace(/^\s+|\s+$/g, '')
                        };
                        //修正请求参数，正确键名才添加参数
                        if (param.keyName != '无' && param.keyName != '-' && param.keyName != '') {
                            //“必填”转换
                            if (param.required == '是' || param.required == 'yes' || param.required == 'true') {
                                param.required = 'required';
                            } else {
                                param.required = '';
                            }
                            //“默认值”转换
                            if (param.default == '-' || param.default == '无' || param.default == 'Null') {
                                param.default = '';
                            }
                            that.request.params.push(param);
                        }
                    });
                }
                testingReqState[2] = true;
            }
        });
        if (testingReqState[0] && testingReqState[1] && testingReqState[2]) {
            this.initPanel();
        } else {
            this.offPanel();
        }
        testingReqState = [false, false, false];
    };

    //关闭测试面板
    Testing.prototype.offPanel = function () {
        this.$e.testingShow.removeClass('show');
        if (this.$e.testingShow.hasClass('on')) {
            this.displayBox('off');
        }
        //清除抓取参数
        this.request.url = '';
        this.request.method = '';
        this.request.params = [];
        //清空请求地址
        $('#testingSendUrl').val('');
        //还原请求类型
        $('#testingSendType').find('option[value="POST"]').prop('selected', true);
        //清空参数列表
        this.$e.testingParam.html('');
        //重置iframe
        $('#testingResponse')[0].contentWindow.location.reload();
    };

    //测试面板填充数据
    Testing.prototype.initPanel = function () {
        this.$e.testingShow.addClass('show');
        //填充请求地址
        $('#testingSendUrl').val(this.request.url);
        //填充请求类型
        $('#testingSendType').find('option[value="' + this.request.method + '"]').prop('selected', true);
        //清空现有参数列表
        this.$e.testingParam.html('');
        //填充参数列表
        if (this.request.params.length > 0) {
            var paramsHTML = '';
            for (var i = 0; i < this.request.params.length; i++) {
                paramsHTML += this.data.paramTemplate
                    .replace('{{describe}}', this.request.params[i].describe)
                    .replace('{{keyName}}', this.request.params[i].keyName)
                    .replace('{{default}}', this.request.params[i].default)
                    .replace('{{valueType}}', this.request.params[i].valueType)
                    .replace('{{required}}', this.request.params[i].required);
            }
            this.$e.testingParam.append(paramsHTML);
        } else {
            this.$e.testingParam.append('<li>无</li>');
        }
    };

    //切换测试面板显示隐藏状态
    Testing.prototype.displayBox = function (type) {
        var that = this;
        if (type == 'off') {
            this.$e.testingShow.removeClass('on').find('span').text('测试接口');
            this.$e.testingBox.css({
                'position': 'absolute',
                'padding': this.$e.win.width() > 720 ? 45 : 25
            });
            this.$e.view.show();
            this.$e.testingBox.animate({
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
                    'min-height': this.$e.view.height() + 90,
                    'opacity': 0
                })
                .animate({
                    'width': '100%',
                    'opacity': 1
                }, 300, 'swing', function () {
                    that.$e.view.hide();
                    that.$e.testingBox.css({
                        'position': 'relative',
                        'padding': 0
                    });
                });
        }
    };

    //测试面板普通操作
    Testing.prototype.bindPanelCtrl = function () {
        var that = this;
        //显示隐藏控制按钮
        this.$e.testingShow = $('<div class="testing-show">[<span>测试接口</span>]</div>');
        $('#main').append(this.$e.testingShow);
        //显示隐藏测试面板
        this.$e.testingShow.on('click', function () {
            if (that.$e.testingShow.hasClass('on')) {
                that.displayBox('off');
            } else {
                that.displayBox('on');
            }
        });
        //填充请求地址
        $('#testingSendUrl').on('change', function () {
            that.request.url = $(this).val();
        });
        //填充请求类型
        $('#testingSendType').on('change', function () {
            that.request.method = $(this).find("option:selected").val();
        });
        //清空所有普通参数的值
        $('#testingBtnReset').on('click', function () {
            that.$e.testingParam.find('.testing-param-val').val('');
        });
        //新增一个参数
        $('#testingBtnAdd').on('click', function () {
            var pHTML = that.data.paramTemplate
                .replace('{{describe}}', '新增参数')
                .replace('{{keyName}}', '')
                .replace('{{default}}', '')
                .replace('({{valueType}})', '')
                .replace('{{required}}', '');
            that.$e.testingParam.append(pHTML);
        });
    };

    //全局参数模块
    Testing.prototype.useGlobalParam = function () {
        var that = this;
        this.data.globalParams = JSON.parse(localStorage['amWikiGlobalParam'] || '[]');  //全局参数
        var gParamTmpl = $('#templateGlobalParam').text();  //全局参数模板
        var $testingGlobalParam = $('#testingGlobalParam');  //全局参数显示容器
        var $testingGlobal = $('#testingGlobal');  //全局参数弹窗
        this.data.globalParamWorking = (localStorage['amWikiGParamWorking'] || 'on') == 'on';  //全局参数是否工作
        //显示弹窗
        $('#testingBtnGParam').on('click', function () {
            $testingGlobalParam.html('');
            that.data.globalParams = JSON.parse(localStorage['amWikiGlobalParam'] || '[]');
            if (that.data.globalParams.length == 0) {
                $testingGlobalParam.append('<li data-type="empty">无</li>');
            } else {
                for (var p = 0; p < that.data.globalParams.length; p++) {
                    $testingGlobalParam.append(gParamTmpl.replace('{{describe}}', that.data.globalParams[p].describe)
                        .replace('{{keyName}}', that.data.globalParams[p].keyName)
                        .replace('{{value}}', that.data.globalParams[p].value));
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
                that.data.globalParams.length = 0;
                $testingGlobalParam.find('li').each(function (i, elment) {
                    var $inputs = $(this).find('input');
                    if ($inputs.eq(1).val()) {
                        that.data.globalParams.push({
                            describe: $inputs.eq(0).val(),
                            keyName: $inputs.eq(1).val(),
                            value: $inputs.eq(2).val()
                        });
                    }
                });
                localStorage['amWikiGlobalParam'] = JSON.stringify(that.data.globalParams);
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
            if (that.data.globalParamWorking) {
                that.data.globalParamWorking = false;
                localStorage['amWikiGParamWorking'] = 'off';
                $(this).addClass('off');
            } else {
                that.data.globalParamWorking = true;
                localStorage['amWikiGParamWorking'] = 'on';
                $(this).removeClass('off');
            }
        }).addClass(this.data.globalParamWorking ? '' : 'off');
    };

    //发送请求
    Testing.prototype.bindAjaxSend = function () {
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
            if (that.data.globalParams.length > 0 && that.data.globalParamWorking) {
                for (var i = 0; i < that.data.globalParams.length; i++) {
                    realParam[that.data.globalParams[i].keyName] = that.data.globalParams[i].value;
                }
            }
            frame.contentWindow.location.reload();  //刷新iframe以便重新输出内容
            $loading.show();
            var startTime = Date.now();
            $.ajax({
                type: that.request.method,
                url: that.request.url,
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

    return win.AWTesting = Testing;

})(window, document, jQuery);