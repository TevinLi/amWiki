var fs = require("fs");
var updateNav = require('./updateNav');
var autoNav = require('./autoNav');

//两层深度读取文件夹
var readDir = function (path, callback) {
    var dirObj = {};
    fs.readdir(path, function (err, files) {
        if (err) {
            callback(err);
        } else {
            for (var i = 0; i < files.length; i++) {
                if (fs.statSync(path + files[i]).isDirectory(path + files[i])) {
                    dirObj[files[i]] = fs.readdirSync(path + files[i]);
                }
            }
            callback(null, dirObj);
        }
    });
};

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
        if (!fs.existsSync(outputPath + 'library/01-关于amWiki')) {
            fs.mkdirSync(outputPath + 'library/01-关于amWiki', 0777);
        }
        if (!fs.existsSync(outputPath + 'library/02-学习markdown')) {
            fs.mkdirSync(outputPath + 'library/02-学习markdown', 0777);
        }
        if (!fs.existsSync(outputPath + 'library/03-文档示范')) {
            fs.mkdirSync(outputPath + 'library/03-文档示范', 0777);
        }
        return false;
    }
    return true;
};

module.exports = {
    //创建amWiki本地文件
    buildAt: function (editorPath, configPath, callback) {
        if (editorPath.indexOf('config.json') < 0) {
            alert('当前不是"config.json"文件！');
            return;
        }
        var filesPath = configPath.replace(/\\/g, '/') + '/packages/amWiki/files/';
        var outputPath = editorPath.split('config.json')[0].replace(/\\/g, '/');

        var config = fs.readFileSync(editorPath, 'utf-8') || '';
        if (config.length == 0) {
            if (!confirm('没有读取到任何配置，继续创建么？')) {
                return;
            }
        }

        //默认配置
        config = JSON.parse(config);
        config.name = config.name || 'amWiki文档库系统';
        config.version = typeof config.ver == 'string' ? config.ver : 'by Tevin';
        config.logo = config.logo || 'amWiki/images/logo.png';

        fs.readdir(outputPath, function (err, files) {
            if (files.length > 1) {
                if (!confirm('此处已有一些文件或文件夹，是否仍然在此创建amWiki？')) {
                    return;
                }
            }
            var index = fs.readFileSync(filesPath + 'index.tmp', 'utf-8');
            index = index.replace(/\{\{name\}\}/g, config.name)
                .replace('{{version}}', config.version)
                .replace('{{logo}}', config.logo);
            fs.writeFileSync(outputPath + 'index.html', index, 'utf-8');

            var hasLibrary = createDir(outputPath);
            var fileList = [
                ['markdownbody.github.css', 'amWiki/css/markdownbody.github.css'],
                ['lhjs.github-gist.css', 'amWiki/css/lhjs.github-gist.css'],
                ['amWiki.css', 'amWiki/css/amWiki.css'],
                ['forEach.js', 'amWiki/js/forEach.js'],
                ['jquery-1.11.3.min.js', 'amWiki/js/jquery-1.11.3.min.js'],
                ['marked.min.js', 'amWiki/js/marked.min.js'],
                ['highlight.min.js', 'amWiki/js/highlight.min.js'],
                ['amWiki.js', 'amWiki/js/amWiki.js'],
                ['icon_close.png', 'amWiki/images/icon_close.png'],
                ['icon_arrow_blue.png', 'amWiki/images/icon_arrow_blue.png'],
                ['icon_arrow_gray.png', 'amWiki/images/icon_arrow_gray.png'],
                ['icon_filter.png', 'amWiki/images/icon_filter.png'],
                ['icon_link.png', 'amWiki/images/icon_link.png'],
                ['icon_to_unfolding.png', 'amWiki/images/icon_to_unfolding.png'],
                ['icon_to_folding.png', 'amWiki/images/icon_to_folding.png'],
                ['icon_home.png', 'amWiki/images/icon_home.png'],
                ['icon_menu.png', 'amWiki/images/icon_menu.png'],
                ['logo.png', 'amWiki/images/logo.png'],
                ['menubar_bg.png', 'amWiki/images/menubar_bg.png'],
                ['point.png', 'amWiki/images/point.png']
            ];
            for (var i = 0; i < fileList.length; i++) {
                copyFile(filesPath + fileList[i][0], outputPath + fileList[i][1]);
            }

            if (!hasLibrary) {
                var home = fs.readFileSync(filesPath + 'home.md', 'utf-8');
                home = home.replace('{{name}}', config.name);
                fs.writeFileSync(outputPath + 'library/首页.md', home, 'utf-8');
                var fileList2 = [
                    ['../README.md', 'library/01-关于amWiki/001-了解amWiki文库.md'],
                    ['markdown.md', 'library/02-学习markdown/001-Markdown快速开始.md'],
                    ['highlighting.md', 'library/02-学习markdown/002-Markdown与语法高亮.md'],
                    ['atommd.md', 'library/02-学习markdown/003-Atom默认对markdown的支持.md'],
                    ['apidemo.md', 'library/03-文档示范/001-通用API接口文档示例.md'],
                    ['longarticle.md', 'library/03-文档示范/002-超长文档页内目录示例.md']
                ];
                for (var j = 0; j < fileList2.length; j++) {
                    copyFile(filesPath + fileList2[j][0], outputPath + fileList2[j][1]);
                }
            }

            updateNav.refresh(outputPath + 'library/');
            autoNav.watcher(outputPath + 'library/');

        	callback && callback(outputPath + 'library/');

        });
    }
};