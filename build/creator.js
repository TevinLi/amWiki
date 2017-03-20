/**
 * @desc 工作端·输出web静态资源模块
 * @author Tevin
 */

const fs = require("fs");
const makeNav = require('./makeNavigation');


module.exports = {
    //复制文件
    _copyWikiFile: function (from, to) {
        const encoding = from.indexOf('png') >= 0 ? 'binary' : 'utf-8';
        const file = fs.readFileSync(from, encoding);
        fs.writeFileSync(to, file, encoding);
    },
    //创建amWiki需要的文件夹
    _createWikiFolder: function (outputPath) {
        if (!fs.existsSync(outputPath + 'amWiki/')) {
            fs.mkdirSync(outputPath + 'amWiki/', 0o777);
        }
        if (!fs.existsSync(outputPath + 'amWiki/js/')) {
            fs.mkdirSync(outputPath + 'amWiki/js/', 0o777);
        }
        if (!fs.existsSync(outputPath + 'amWiki/css')) {
            fs.mkdirSync(outputPath + 'amWiki/css', 0o777);
        }
        if (!fs.existsSync(outputPath + 'amWiki/images')) {
            fs.mkdirSync(outputPath + 'amWiki/images', 0o777);
        }
        if (!fs.existsSync(outputPath + 'library/')) {
            fs.mkdirSync(outputPath + 'library/', 0o777);
            if (!fs.existsSync(outputPath + 'library/001-学习amWiki')) {
                fs.mkdirSync(outputPath + 'library/001-学习amWiki', 0o777);
            }
            if (!fs.existsSync(outputPath + 'library/001-学习amWiki/05-学习markdown')) {
                fs.mkdirSync(outputPath + 'library/001-学习amWiki/05-学习markdown', 0o777);
            }
            if (!fs.existsSync(outputPath + 'library/002-文档示范')) {
                fs.mkdirSync(outputPath + 'library/002-文档示范', 0o777);
            }
            return false;
        }
        return true;
    },
    //创建着色色系（颜色变亮变暗不是rgb分别同时增加或减少一个值）
    _clacWikiColour: function (color) {
        const colours = {};
        //修复16进制下的1位数
        const lessThan = (str) => {
            if (str <= 9) {
                str = '0' + str;
            } else {
                const num = parseInt('0x' + str);
                if (num >= 10 && num <= 15) {
                    str = '0' + str;
                }
            }
            return str;
        };
        //颜色合法检查
        const atBinary16 = /^#([0-9a-fA-F]{3}){1,2}$/.test(color);
        const atRGB = /^[rR][gG][bB]([aA])?\(\d{1,3},\d{1,3},\d{1,3}(,.*?)?\)$/.test(color);
        const atList = /(blue|default)/.test(color);
        if (!atBinary16 && !atRGB && !atList) {
            alert('请使用标准16进制颜色、标准RGB颜色、2种特定颜色名指定颜色！本次创建使用默认颜色');
            return this._clacWikiColour('default');
        }
        //颜色名称转色值
        const colorList = {
            default: '#4296eb',
            blue: '#4296eb'
        };
        if (atList) {
            color = colorList[color];
        }
        //解析颜色为rgb
        const rgb = [];
        if (color.indexOf('#') === 0) {
            rgb[0] = parseInt('0x' + color.substr(1, 2));
            rgb[1] = parseInt('0x' + color.substr(3, 2));
            rgb[2] = parseInt('0x' + color.substr(5, 2));
        } else {
            const rgbStr = color.split('(')[1].split(')')[0].split(',');
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
        const increment = [
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
        let larger = 0,
            largeIndex = -1;
        const largerFd = (i) => {
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
            const reduce = (rgb[largeIndex] - larger) / larger;
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
    },
    //配置检查
    _checkConfig: function () {
        const options = {};
        const editor = atom.workspace.getActiveTextEditor();
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
        let configStr = fs.readFileSync(options.editorPath, 'utf-8') || '';
        if (configStr.length === 0) {
            if (!confirm('没有读取到任何配置，继续创建么？')) {
                return;
            } else {
                configStr = "{}";
            }
        }
        //解析默认配置
        let parseOk = true,
            config = null;
        try {
            config = JSON.parse(configStr);
        } catch (e) {
            alert('配置解析失败，请检查您的 config.json 是否有严格按 Json 格式书写！\n错误消息：' + e.message);
            parseOk = false;
        }
        if (!parseOk) {
            return;
        }
        //库名称
        config.name = config.name || 'amWiki轻文库系统';
        //库版本号
        config.version = typeof config.ver === 'string' ? config.ver : 'by Tevin';
        //logo地址
        config.logo = config.logo || 'amWiki/images/logo.png';
        //是否开启接口测试
        config.testing = config.testing || false;
        //设置自定义颜色
        config.colour = config.colour ? this._clacWikiColour(config.colour) : this._clacWikiColour('#4296eb');
        return {
            options: options,
            config: config
        };
    },
    //创建amWiki本地文件
    create: function (callback) {
        const {options, config} = this._checkConfig();
        //创建
        fs.readdir(options.outputPath, (err, files) => {
            if (files.length > 1) {
                if (!confirm('此处已有一些文件或文件夹，是否仍然在此创建amWiki？')) {
                    return;
                }
            }
            //创建index.html
            let indexPage = fs.readFileSync(options.filesPath + 'amWiki.tpl', 'utf-8');
            indexPage = indexPage.replace(/\{\{name\}\}/g, config.name)
                .replace('{{version}}', config.version)
                .replace('{{logo}}', config.logo);
            if (config.testing) {
                const testingTpl = fs.readFileSync(options.filesPath + 'amWiki.testing.tpl', 'utf-8');
                const testingScript = '<script src="amWiki/js/amWiki.testing.js"></script>';
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
            const hasLibrary = this._createWikiFolder(options.outputPath);
            //创建amWiki.css
            let wikiCss = fs.readFileSync(options.filesPath + 'amWiki.css', 'utf-8');
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
            const fileList = [
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
            for (let file of fileList) {
                this._copyWikiFile(options.filesPath + file[0], options.outputPath + file[1]);
            }
            //如果没有library则复制一套默认文档
            if (!hasLibrary) {
                //首页文档
                const home = fs.readFileSync(options.filesPath + 'doc.home.md', 'utf-8').replace('{{name}}', config.name);
                fs.writeFileSync(options.outputPath + 'library/首页.md', home, 'utf-8');
                //其他页面文档
                let fileList2 = [
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
                for (let file of fileList2) {
                    this._copyWikiFile(options.filesPath + file[0], options.outputPath + file[1]);
                }
            }
            callback();
        });
    }
};