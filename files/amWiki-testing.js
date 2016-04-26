/**
 * amWiki-testing
 * by Tevin
 *
 * 简单发送ajax测试工具
 * 仅当页面存在“请求地址”、“请求类型”、“请求参数”三个h3标题时触发
 */
var createTesting = function () {

    var request = {};

    //抓取请求地址
    var $urlAnchor = $('[name="请求地址"]');
    if ($urlAnchor.length == 0) {
        return;
    } else {
        request.url = $urlAnchor.parent().next().text().replace(/^\s+|\s+$/g, '');
        if (request.url.indexOf('/') == 0) {
            request.url = 'http://' + location.host + request.url;
        } else {
            request.url = 'http://' + location.host + '/' + request.url;
        }
    }

    //抓取请求类型
    var $metAnchor = $('[name="请求类型"]');
    if ($metAnchor.length == 0) {
        return;
    } else {
        request.method = $metAnchor.parent().next().text().replace(/^\s+|\s+$/g, '').toUpperCase();
        if (request.method != 'POST' && request.method != 'GET') {
            request.method = 'POST';
        }
    }

    //抓取请求参数
    var $parAnchor = $('[name="请求参数"]');
    if ($parAnchor.length == 0) {
        return;
    } else {
        if ($parAnchor.parent().next('table').length == 0) {
            request.param = null;
        } else {
            request.param = [];
            $parAnchor.parent().next('table').find('tbody').find('tr').each(function (i, element) {
                var $tds = $(this).find('td');
                request.param[i] = {
                    keyName: $tds.eq(0).text().replace(/^\s+|\s+$/g, ''),
                    valueType: $tds.eq(1).text().replace(/^\s+|\s+$/g, ''),
                    required: $tds.eq(2).text().replace(/^\s+|\s+$/g, ''),
                    describe: $tds.eq(3).text().replace(/^\s+|\s+$/g, ''),
                    default: $tds.eq(4).text().replace(/^\s+|\s+$/g, '')
                };
                if (request.param[i].required == '是' || request.param[i].required == 'yes' || request.param[i].required == 'true') {
                    request.param[i].required = 'required';
                } else {
                    request.param[i].required = '';
                }
                if (request.param[i].default == '-' || request.param[i].default == '无' || request.param[i].default == 'Null') {
                    request.param[i].default = '';
                }
            });
        }
    }

    //显示隐藏面板
    var $testingShow = $('<div class="testing-show">[<span>测试接口</span>]</div>');
    $('#main').append($testingShow);
    var $testingBox = $('#testingBox');
    var $view = $('#view');
    $testingBox.css('min-height', $view.height());
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

    //面板基本
    var $testingParam = $('#testingParam');
    $('#testingBtnReset').on('click', function () {
        $testingParam.find('.testing-param-val').val('');
    });

    //填充参数列表数据
    $('#testingSendUrl').val(request.url);
    $('#testingSendType').find('option[value="' + request.method + '"]').prop('selected', true);
    var template = $('#templateFormList').text();
    if (request.param) {
        for (var i = 0; i < request.param.length; i++) {
            $testingParam.append(template.replace('{{describe}}', request.param[i].describe)
                .replace('{{keyName}}', request.param[i].keyName)
                .replace('{{default}}', request.param[i].default)
                .replace('{{valueType}}', request.param[i].valueType)
                .replace('{{required}}', request.param[i].required));
        }
    } else {
        $testingParam.append('<li>无</li>');
    }
    $('#testingBtnAdd').on('click', function () {
        $testingParam.append(template.replace('{{describe}}', '新增参数')
            .replace('{{keyName}}', '')
            .replace('{{default}}', '')
            .replace('{{valueType}}', 'any-type')
            .replace('{{required}}', ''));
    });

    //发送请求
    var $frame = $('#testingResponse');
    $('#testingBtnSend').on('click', function () {
        var param = null;
        if ($testingParam.find('input').length > 0) {
            param = {};
            $testingParam.find('li').each(function () {
                param[$(this).find('.testing-param-key').val()] = $(this).find('.testing-param-val').val();
            });
        }
        if (gParams.length > 0) {
            for (var i = 0; i < gParams.length; i++) {
                param[gParams[i].keyName] = gParams[i].value;
            }
        }
        $frame[0].contentWindow.location.reload();
        $.ajax({
            type: $('#testingSendType').val(),
            url: $('#testingSendUrl').val(),
            data: param,
            dataType: 'text',
            success: function (data) {
                var $frameBody = $($frame[0].contentWindow.document).find('body');
                $frameBody.css('wordBreak', 'break-all');
                if (/^\s*\{[\s\S]*\}\s*$/.test(data)) {
                    //json则格式化
                    $frameBody[0].innerHTML = '<pre>' + formatJson(data) + '<pre>';
                } else {
                    $frameBody[0].innerHTML = data;
                }
                setTimeout(function () {
                    $frame.height($frameBody.height());
                }, 100);
            },
            error: function (xhr, textStatus) {
                var $frameBody = $($frame[0].contentWindow.document).find('body');
                $frameBody.css('wordBreak', 'break-all');
                if (xhr.readyState == 0) {
                    $frameBody[0].innerHTML = '错误，请求未发送！<br><br><div style="font-size:13px;">可能是因为：<ul>' +
                        '<li>请求了跨域地址</li>' +
                        '<li>接口被302重定向到跨域地址</li>' +
                        '<li>其他原因</li>' +
                        '</ul></div>'
                } else {
                    $frameBody[0].innerHTML = xhr.responseText;
                }
                setTimeout(function () {
                    $frame.height($frameBody.height());
                }, 100);
            }
        });
    });

    //全局参数模块
    var gParams = JSON.parse(localStorage['amWikiGlobalParam'] || '[]');
    var gParamTmpl = $('#templateGlobalParam').text();
    var $testingGlobalParam = $('#testingGlobalParam');
    var $testingGlobal = $('#testingGlobal');
    $('#testingBtnGParam').on('click', function () {
        $testingGlobalParam.html('');
        gParams = JSON.parse(localStorage['amWikiGlobalParam'] || '[]');
        if (gParams.length == 0) {
            $testingGlobalParam.append('<li data-type="empty">无</li>');
        } else {
            for (var p = 0; p < gParams.length; p++) {
                $testingGlobalParam.append(gParamTmpl.replace('{{describe}}', gParams[p].describe)
                    .replace('{{keyName}}', gParams[p].keyName)
                    .replace('{{value}}', gParams[p].value));
            }
        }
        $testingGlobal.show();
    });
    $testingGlobal.find('.close').on('click', function () {
        $testingGlobal.hide();
    });
    $testingGlobal.find('.add').on('click', function () {
        $testingGlobalParam.find('[data-type="empty"]').remove();
        $testingGlobalParam.append(gParamTmpl.replace('{{describe}}', '')
            .replace('{{keyName}}', '')
            .replace('{{value}}', ''));
    });
    $testingGlobal.find('.save').on('click', function () {
        gParams.length = 0;
        $testingGlobalParam.find('li').each(function (i, elment) {
            var $inputs = $(this).find('input');
            if ($inputs.eq(1).val()) {
                gParams.push({
                    describe: $inputs.eq(0).val(),
                    keyName: $inputs.eq(1).val(),
                    value: $inputs.eq(2).val()
                });
            }
        });
        localStorage['amWikiGlobalParam'] = JSON.stringify(gParams);
        $testingGlobal.hide();
    });
    $testingGlobalParam.on('click', 'i', function () {
        $(this).parent().remove();
        if ($testingGlobalParam.find('li').length == 0) {
            $testingGlobalParam.append('<li data-type="empty">无</li>');
        }
    });

    //json格式化
    var formatJson = function (str) {
        var json = decodeURI(str);
        var reg = null,
            formatted = '',
            pad = 0,
            PADDING = '    ';
        // optional settings
        var options = {};
        // remove newline where '{' or '[' follows ':'
        options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
        // use a space after a colon
        options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
        // begin formatting...
        if (typeof json !== 'string') {
            // make sure we start with the JSON as a string
            json = JSON.stringify(json);
        } else {
            // is already a string, so parse and re-stringify in order to remove extra whitespace
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
            reg = /\:/g;
            json = json.replace(reg, ': ');
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
    }

};