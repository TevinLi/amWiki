/**
 * Created by Tevin on 2016/4/21.
 */


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

    //显示隐藏测试面板
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

    //测试面板基本
    var $testingParam = $('#testingParam');
    $('#testingBtnReset').on('click', function () {
        $testingParam.find('.testing-param-val').val('');
    });

    //填充数据
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

    //提交
    $('#testingBtnSend').on('click', function () {
        var param = null;
        if ($testingParam.find('input').length > 0) {
            param = {};
            $testingParam.find('li').each(function () {
                param[$(this).find('.testing-param-key').val()] = $(this).find('.testing-param-val').val();
            });
        }
        $.ajax({
            type: $('#testingSendType').val(),
            url: $('#testingSendUrl').val(),
            data: param,
            dataType: 'text',
            success: function (data) {
                console.log(data)
                $('#testingResponse').html(data);
            },
            error: function (err) {
                $('#testingResponse').html(err.responseText);
            }
        });
    });


};