/**
 * amWiki-testing
 * by Tevin
 *
 * 简单发送ajax测试工具
 * 仅当页面存在“请求地址”、“请求类型”、“请求参数”三个h3标题时触发
 */

(function (win) {

    var Testing = function () {
        this.data = {
            //全局参数列队
            globalParams: [],
            //全局参数是否生效
            globalParamWorking: true
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
        //抓取页面成功才显示
        if (this.crawlContent()) {
            this.initPanel();
            this.useGlobalParam();
            this.bindAjaxSend();
        }
    };

    //抓取请求内容
    Testing.prototype.crawlContent = function () {
        var that = this;
        //抓取请求地址
        var $url = $('[name="请求地址"]').eq(0);  //地址title的描记
        if ($url.length == 0) {
            return false;
        } else {
            this.request.url = $url.parent().next().text().replace(/^\s+|\s+$/g, '');
            if (this.request.url.indexOf('http') < 0) {
                if (this.request.url.indexOf('/') == 0) {
                    this.request.url = 'http://' + location.host + this.request.url;
                } else {
                    this.request.url = 'http://' + location.host + '/' + this.request.url;
                }
            }
        }
        //抓取请求类型
        var $method = $('[name="请求类型"]').eq(0);  //类型title的描记
        if ($method.length == 0) {
            return false;
        } else {
            this.request.method = $method.parent().next().text().replace(/^\s+|\s+$/g, '').toUpperCase();
            if (this.request.method != 'POST' && this.request.method != 'GET') {
                this.request.method = 'POST';
            }
        }
        //抓取请求参数
        var $param = $('[name="请求参数"]').eq(0);  //参数title的描记
        if ($param.length == 0) {
            return;
        } else {
            //不存在table直接无参数，存在table时开始解析
            if ($param.parent().next('table').length > 0) {
                $param.parent().next('table').find('tbody').find('tr').each(function () {
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
        }
        return true;
    };

    //测试面板初始化
    Testing.prototype.initPanel = function () {
        var that = this;
        var $testingBox = $('#testingBox');  //测试面板
        var $view = $('#view');  //视图，md文档渲染处
        $testingBox.css('min-height', $view.height());
        //显示隐藏测试面板
        var $testingShow = $('<div class="testing-show">[<span>测试接口</span>]</div>');  //显示隐藏控制按钮
        $('#main').append($testingShow);
        $testingShow.on('click', function () {
            if ($testingShow.hasClass('on')) {
                $testingShow.removeClass('on').find('span').text('测试接口');
                $testingBox.hide();
                $view.show();
            } else {
                $testingShow.addClass('on').find('span').text('关闭测试');
                $testingBox.show();
                $view.hide();
            }
        });
        //清空所有普通参数的值
        var $testingParam = $('#testingParam');  //参数列表
        $('#testingBtnReset').on('click', function () {
            $testingParam.find('.testing-param-val').val('');
        });
        //新增一个参数
        $('#testingBtnAdd').on('click', function () {
            $testingParam.append(template.replace('{{describe}}', '新增参数')
                .replace('{{keyName}}', '')
                .replace('{{default}}', '')
                .replace('{{valueType}}', 'any-type')
                .replace('{{required}}', ''));
        });
        //填充参数列表数据
        $('#testingSendUrl').val(this.request.url).on('change', function () {
            that.request.url = $(this).val();
        });
        $('#testingSendType').on('change', function () {
            that.request.method = $(this).find("option:selected").text();
        }).find('option[value="' + this.request.method + '"]').prop('selected', true);
        var template = $('#templateFormList').text();  //单条参数模板
        if (this.request.params.length > 0) {
            for (var i = 0; i < this.request.params.length; i++) {
                $testingParam.append(template.replace('{{describe}}', this.request.params[i].describe)
                    .replace('{{keyName}}', this.request.params[i].keyName)
                    .replace('{{default}}', this.request.params[i].default)
                    .replace('{{valueType}}', this.request.params[i].valueType)
                    .replace('{{required}}', this.request.params[i].required));
            }
        } else {
            $testingParam.append('<li>无</li>');
        }
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
            var $this = $(this);
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
                        $frameBody.find('pre').text(that.formatJson(data));
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
                        $frameBody.find('pre').text(that.formatJson(xhr.responseText));
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

    //json格式化
    Testing.prototype.formatJson = function (str) {
        var json = decodeURI(str);
        var reg = null,
            formatted = '',
            pad = 0,
            PADDING = '    ';
        var options = {};
        // remove newline where '{' or '[' follows ':'
        options.newlineAfterColonIfBeforeBraceOrBracket = options.newlineAfterColonIfBeforeBraceOrBracket === true;
        // use a space after a colon
        options.spaceAfterColon = options.spaceAfterColon !== false;
        // begin formatting...
        if (typeof json !== 'string') {
            json = JSON.stringify(json);
        } else {
            json = JSON.parse(json);
            json = JSON.stringify(json);
        }
        // add newline before and after curly braces
        reg = /([\{\}])/g;
        json = json.replace(reg, '\r\n$1\r\n');
        // add newline before and after square brackets
        reg = /([\[\]])/g;
        json = json.replace(reg, '\r\n$1\r\n');
        // add newline after comma
        reg = /(\,)/g;
        json = json.replace(reg, '$1\r\n');
        // remove multiple newlines
        reg = /(\r\n\r\n)/g;
        json = json.replace(reg, '\r\n');
        // remove newlines before commas
        reg = /\r\n\,/g;
        json = json.replace(reg, ',');
        // optional formatting...
        if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
            reg = /\:\r\n\{/g;
            json = json.replace(reg, ':{');
            reg = /\:\r\n\[/g;
            json = json.replace(reg, ':[');
        }
        if (options.spaceAfterColon) {
            reg = /"\s*\:/g;
            json = json.replace(reg, '": ');
        }
        $.each(json.split('\r\n'), function (index, node) {
            var i = 0,
                indent = 0,
                padding = '';
            if (node.match(/\{$/) || node.match(/\[$/)) {
                indent = 1;
            } else if (node.match(/\}/) || node.match(/\]/)) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else {
                indent = 0;
            }
            for (i = 0; i < pad; i++) {
                padding += PADDING;
            }
            formatted += padding + node + '\r\n';
            pad += indent;
        });
        return formatted;
    };


    return win.Testing = Testing;

})(window);