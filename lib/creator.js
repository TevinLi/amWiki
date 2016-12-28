/**
 * @desc amWiki 工作端·输出web静态资源模块
 * @author Tevin
 */

var fs = require("fs");
var makeNav = require('./makeNav');

//复制文件
var copyFile = function (from, to) {
    var encoding = from.indexOf('png') >= 0 ? 'binary' : 'utf-8';
    var file = fs.readFileSync(from, encoding);
    fs.writeFileSync(to, file, encoding);
};

//创建amWiki需要的文件夹
var createDir = function (outputPath) {
    if (!fs.existsSync(outputPath + 'amWiki/')) {
        fs.mkdirSync(outputPath + 'amWiki/', 0777);
    }
    if (!fs.existsSync(outputPath + 'amWiki/js/')) {
        fs.mkdirSync(outputPath + 'amWiki/js/', 0777);
    }
    if (!fs.existsSync(outputPath + 'amWiki/css')) {
        fs.mkdirSync(outputPath + 'amWiki/css', 0777);
    }
    if (!fs.existsSync(outputPath + 'amWiki/images')) {
        fs.mkdirSync(outputPath + 'amWiki/images', 0777);
    }
    if (!fs.existsSync(outputPath + 'library/')) {
        fs.mkdirSync(outputPath + 'library/', 0777);
        if (!fs.existsSync(outputPath + 'library/001-学习amWiki')) {
            fs.mkdirSync(outputPath + 'library/001-学习amWiki', 0777);
        }
        if (!fs.existsSync(outputPath + 'library/001-学习amWiki/05-学习markdown')) {
            fs.mkdirSync(outputPath + 'library/001-学习amWiki/05-学习markdown', 0777);
        }
        if (!fs.existsSync(outputPath + 'library/002-文档示范')) {
            fs.mkdirSync(outputPath + 'library/002-文档示范', 0777);
        }
        return false;
    }
    return true;
};

//创建着色色系（颜色变亮变暗不是rgb分别同时增加或减少一个值）
var makeColours = function (color) {
    var colours = {};
    //修复16进制下的1位数
    var lessThan = function (str) {
        if (str <= 9) {
            str = '0' + str;
        } else {
            var num = parseInt('0x' + str);
            if (num >= 10 && num <= 15) {
                str = '0' + str;
            }
        }
        return str;
    };
    //颜色合法检查
    var atBinary16 = /^#([0-9a-fA-F]{3}){1,2}$/.test(color);
    var atRGB = /^(r|R)(g|G)(b|B)(a|A)?\(\d{1,3},\d{1,3},\d{1,3}(,.*?)?\)$/.test(color);
    var atList = /(blue|default)/.test(color);
    if (!atBinary16 && !atRGB && !atList) {
        alert('请使用标准16进制颜色、标准RGB颜色、2种特定颜色名指定颜色！本次创建使用默认颜色');
        return makeColours('default');
    }
    //颜色名称转色值
    var colorList = {
        default: '#4296eb',
        blue: '#4296eb'
    };
    if (atList) {
        color = colorList[color];
    }
    //解析颜色为rgb
    var rgb = [];
    if (color.indexOf('#') == 0) {
        rgb[0] = parseInt('0x' + color.substr(1, 2));
        rgb[1] = parseInt('0x' + color.substr(3, 2));
        rgb[2] = parseInt('0x' + color.substr(5, 2));
    } else {
        var rgbStr = color.split('(')[1].split(')')[0].split(',');
        rgb[0] = parseInt(rgbStr[0]);
        rgb[1] = parseInt(rgbStr[1]);
        rgb[2] = parseInt(rgbStr[2]);
    }
    //生成主色base
    colours.base = '#' + [
            lessThan(rgb[0].toString(16)),
            lessThan(rgb[1].toString(16)),
            lessThan(rgb[2].toString(16))
        ].join('');
    //颜色变化量，越小的值变化越大
    var increment = [
        Math.round((255 - rgb[0]) / 3),
        Math.round((255 - rgb[1]) / 3),
        Math.round((255 - rgb[2]) / 3)
    ];
    //生成亮色light
    colours.light = '#' + [
            (rgb[0] + increment[0]).toString(16),
            (rgb[1] + increment[1]).toString(16),
            (rgb[2] + increment[2]).toString(16)
        ].join('');
    //生成暗色dark
    var larger = 0,
        largeIndex = -1;
    var largerFd = function (i) {
        if (increment[i] > larger) {
            larger = increment[i];
            largeIndex = i;
        }
    };
    largerFd(0);
    largerFd(1);
    largerFd(2);
    if (rgb[largeIndex] - larger < 0) {
        //修复加深颜色值为负的情况，最多减到0，其他三色等比例减小
        var reduce = (rgb[largeIndex] - larger) / larger;
        increment[0] += Math.round(increment[0] * reduce);
        increment[1] += Math.round(increment[1] * reduce);
        increment[2] += Math.round(increment[2] * reduce);
    }
    colours.dark = '#' + [
            lessThan((rgb[0] - increment[0]).toString(16)),
            lessThan((rgb[1] - increment[1]).toString(16)),
            lessThan((rgb[2] - increment[2]).toString(16))
        ].join('');
    return colours;
};


module.exports = {
    //开始创建
    create: function (state) {
        var options = {};
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        options.editorPath = editor.getPath();
        if (options.editorPath.indexOf('config.json') < 0) {
            alert('当前不是"config.json"文件！');
            return;
        }
        //创建路径
        options.filesPath = atom.configDirPath.replace(/\\/g, '/') + '/packages/amWiki/files/';
        options.outputPath = options.editorPath.split('config.json')[0].replace(/\\/g, '/');
        //读取配置
        var config = fs.readFileSync(options.editorPath, 'utf-8') || '';
        if (config.length == 0) {
            if (!confirm('没有读取到任何配置，继续创建么？')) {
                return;
            } else {
                config = "{}";
            }
        }
        //解析默认配置
        var parseOk = true;
        try {
            config = JSON.parse(config);
        } catch (e) {
            alert('配置解析失败，请检查您的 config.json 是否有严格按 Json 格式书写！\n错误消息：' + e.message);
            parseOk = false;
        }
        if (!parseOk) {
            return;
        }
        config.name = config.name || 'amWiki轻文库系统';  //库名称
        config.version = typeof config.ver == 'string' ? config.ver : 'by Tevin';  //库版本号
        config.logo = config.logo || 'amWiki/images/logo.png';  //logo地址
        config.testing = config.testing || false;  //是否开启接口测试
        config.colour = config.colour ? makeColours(config.colour) : makeColours('#4296eb');  //设置自定义颜色
        //开始创建
        this.buildAt(options, config, function (path) {
            //添加文库
            state.libraryList.push(path);
            //更新导航
            makeNav.refresh(options.outputPath + 'library/');
        });
    },
    //创建amWiki本地文件
    buildAt: function (options, config, callback) {
        //创建
        fs.readdir(options.outputPath, function (err, files) {
            if (files.length > 1) {
                if (!confirm('此处已有一些文件或文件夹，是否仍然在此创建amWiki？')) {
                    return;
                }
            }
            //创建index.html
            var indexPage = fs.readFileSync(options.filesPath + 'amWiki.tpl', 'utf-8');
            indexPage = indexPage.replace(/\{\{name\}\}/g, config.name)
                .replace('{{version}}', config.version)
                .replace('{{logo}}', config.logo);
            if (config.testing) {
                var testingTpl = fs.readFileSync(options.filesPath + 'amWiki.testing.tpl', 'utf-8');
                var testingScript = '<script src="amWiki/js/amWiki.testing.js"></script>';
                indexPage = indexPage
                    .replace('{{amWiki.testing.tpl}}', testingTpl)
                    .replace('{{amWiki.testing.js}}', testingScript);
            } else {
                indexPage = indexPage
                    .replace('{{amWiki.testing.tpl}}', '')
                    .replace('{{amWiki.testing.js}}', '');
            }
            fs.writeFileSync(options.outputPath + 'index.html', indexPage, 'utf-8');
            //创建文件夹
            var hasLibrary = createDir(options.outputPath);
            //创建amWiki.css
            var wikiCss = fs.readFileSync(options.filesPath + 'amWiki.css', 'utf-8');
            if (config.testing) {
                wikiCss += fs.readFileSync(options.filesPath + 'amWiki.testing.css', 'utf-8');
            }
            wikiCss += fs.readFileSync(options.filesPath + 'amWiki.print.css', 'utf-8');
            wikiCss += fs.readFileSync(options.filesPath + 'amWiki.search.css', 'utf-8');
            wikiCss = wikiCss
                .replace(/@colour-base/g, config.colour.base)
                .replace(/@colour-light/g, config.colour.light)
                .replace(/@colour-dark/g, config.colour.dark);
            fs.writeFileSync(options.outputPath + 'amWiki/css/amWiki.css', wikiCss, 'utf-8');
            //拷贝页面资源
            var fileList = [
                ['markdownbody.github.css', 'amWiki/css/markdownbody.github.css'],
                ['lhjs.github-gist.css', 'amWiki/css/lhjs.github-gist.css'],
                ['gbk.js', 'amWiki/js/gbk.js'],
                ['flowchart.min.js', 'amWiki/js/flowchart.min.js'],
                ['raphael-min.js', 'amWiki/js/raphael-min.js'],
                ['jquery-compat-3.1.0.min.js', 'amWiki/js/jquery-compat-3.1.0.min.js'],
                ['marked.min.js', 'amWiki/js/marked.min.js'],
                ['highlight.min.js', 'amWiki/js/highlight.min.js'],
                ['amWiki.js', 'amWiki/js/amWiki.js'],
                ['amWiki.scrollbar.js', 'amWiki/js/amWiki.scrollbar.js'],
                ['amWiki.testing.js', 'amWiki/js/amWiki.testing.js'],
                ['amWiki.tools.js', 'amWiki/js/amWiki.tools.js'],
                ['amWiki.storage.js', 'amWiki/js/amWiki.storage.js'],
                ['amWiki.docs.js', 'amWiki/js/amWiki.docs.js'],
                ['amWiki.search.js', 'amWiki/js/amWiki.search.js'],
                ['amWiki.search.worker.js', 'amWiki/js/amWiki.search.worker.js'],
                ['icons.svg', 'amWiki/images/icons.svg'],
                ['logo.png', 'amWiki/images/logo.png'],
                ['menubar_bg.png', 'amWiki/images/menubar_bg.png']
            ];
            for (var i = 0; i < fileList.length; i++) {
                copyFile(options.filesPath + fileList[i][0], options.outputPath + fileList[i][1]);
            }
            //如果没有library则复制一套默认文档
            if (!hasLibrary) {
                //首页文档
                var home = fs.readFileSync(options.filesPath + 'doc.home.md', 'utf-8');
                home = home.replace('{{name}}', config.name);
                fs.writeFileSync(options.outputPath + 'library/首页.md', home, 'utf-8');
                //其他页面文档
                var fileList2 = [
                    ['doc.amwiki-introduce.md', 'library/001-学习amWiki/01-amWiki轻文库简介.md'],
                    ['doc.amwiki-mind-map.md', 'library/001-学习amWiki/02-amWiki功能导图.md'],
                    ['doc.amwiki-new.md', 'library/001-学习amWiki/03-如何开始一个新amWiki轻文库.md'],
                    ['doc.amwiki-edit.md', 'library/001-学习amWiki/04-如何编辑amWiki轻文库.md'],
                    ['doc.amwiki-testing.md', 'library/001-学习amWiki/06-使用测试模块测试接口.md'],
                    ['doc.amwiki-test-cross.md', 'library/001-学习amWiki/07-amWiki转接到任意域名进行接口测试.md'],
                    ['doc.md-start.md', 'library/001-学习amWiki/05-学习markdown/01-Markdown快速开始.md'],
                    ['doc.md-high-lighting.md', 'library/001-学习amWiki/05-学习markdown/02-amWiki与语法高亮.md'],
                    ['doc.md-flow-chart.md', 'library/001-学习amWiki/05-学习markdown/03-amWiki与流程图.md'],
                    ['doc.md-atom.md', 'library/001-学习amWiki/05-学习markdown/05-Atom对Markdown的原生支持.md'],
                    ['doc.demo-api.md', 'library/002-文档示范/001-通用API接口文档示例.md'],
                    ['doc.demo-long-article.md', 'library/002-文档示范/002-超长文档页内目录示例.md']
                ];
                for (var j = 0; j < fileList2.length; j++) {
                    copyFile(options.filesPath + fileList2[j][0], options.outputPath + fileList2[j][1]);
                }
            }
            callback && callback(options.outputPath + 'library/');
        });
    }
};