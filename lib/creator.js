var fs = require("fs");
var navUpdate = require('./navUpdate');

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
var copyFile = function(from, to){ 
	var file = fs.readFileSync(from, 'utf-8');
	fs.writeFileSync(to, file, 'utf-8');
};

//创建aWiki需要的文件夹
var createDir = function(rootPath){ 
	if(!fs.existsSync(rootPath + 'aWiki/')){ 
		fs.mkdirSync(rootPath + 'aWiki/', 777);
	}
	if(!fs.existsSync(rootPath + 'aWiki/js/')){ 
		fs.mkdirSync(rootPath + 'aWiki/js/', 777);
	}
	if(!fs.existsSync(rootPath + 'aWiki/css')){ 
		fs.mkdirSync(rootPath + 'aWiki/css', 777);
	}
	if(!fs.existsSync(rootPath + 'aWiki/images')){ 
		fs.mkdirSync(rootPath + 'aWiki/images', 777);
	}
	if(!fs.existsSync(rootPath + 'library/')){ 
		fs.mkdirSync(rootPath + 'library/', 777);
		if(!fs.existsSync(rootPath + 'library/01-关于aWiki')){ 
			fs.mkdirSync(rootPath + 'library/01-关于aWiki', 777);
		}
		if(!fs.existsSync(rootPath + 'library/02-学习markdown')){ 
			fs.mkdirSync(rootPath + 'library/02-学习markdown', 777);
		}
	}
};

module.exports = {
	//创建aWiki本地文件
    buildAt: function (editorPath, configPath) {
        if (editorPath.indexOf('config.json') < 0) {
            alert('当前不是"config.json"文件！');
            return;
        }
        //console.log(editorPath, configPath);
        var templatePath = configPath.replace('\\', '/') + 'files/';
        var config = fs.readFileSync(editorPath, 'utf-8');
        if (config.length == 0) { 
        	if (!confirm('没有读取到任何配置，继续创建么？')){ 
        		return;
        	}
        }
        //默认配置
        config = JSON.parse(config);
        config.name = config.name || 'aWiki文档库系统';
        config.version = typeof config.version == 'string' ? config.version : 'by Tevin';

        var rootPath = editorPath.split('config.json')[0].replace('\\', '/');
        fs.readdir(rootPath, function (err, files) { 
        	if (files.length > 1) { 
	            if (!confirm('此处已有一些文件或文件夹，是否仍然在此创建aWiki？')) { 
	            	return;
	            }
        	}
        	var index = fs.readFileSync(templatePath + 'index.tmp', 'utf-8');
        	index = index.replace(/\{\{name\}\}/g, config.name).replace('{{version}}', config.version);
        	fs.writeFileSync(rootPath + 'index.html', index, 'utf-8');

        	createDir(rootPath);
        	var fileList = [
        		['primercss.github.css', 'aWiki/css/primercss.github.css'],
        		['lhjs.github-gist.css', 'aWiki/css/lhjs.github-gist.css'],
        		['aWiki.css', 'aWiki/css/aWiki.css'],
        		['forEach.js', 'aWiki/js/forEach.js'],
        		['jquery-1.11.3.min.js', 'aWiki/js/jquery-1.11.3.min.js'],
        		['marked.min.js', 'aWiki/js/marked.min.js'],
        		['aWiki.js', 'aWiki/js/aWiki.js'],
        		['close.png', 'aWiki/images/close.png'],
        		['icon_arrow_blue.png', 'aWiki/images/icon_arrow_blue.png'],
        		['icon_arrow_gray.png', 'aWiki/images/icon_arrow_gray.png'],
        		['icon_filter.png', 'aWiki/images/icon_filter.png'],
        		['icon_home.png', 'aWiki/images/icon_home.png'],
        		['icon_menu.png', 'aWiki/images/icon_menu.png'],
        		['logo.png', 'aWiki/images/logo.png'],
        		['menubar_bg.png', 'aWiki/images/menubar_bg.png'],
        		['point.png', 'aWiki/images/point.png']
        	]
        	for (var i = 0; i < fileList.length; i++) { 
        		copyFile(templatePath + fileList[i][0], rootPath + fileList[i][1]);
        	}

        	if(fs.existsSync(rootPath + 'library/01-关于aWiki')){ 
				var home = fs.readFileSync(templatePath +　'home.md', 'utf-8');
				home = home.replace('{{name}}', config.name);
				fs.writeFileSync(rootPath + 'library/首页.md', home, 'utf-8');
				var fileList2 = [
					['readme.md', rootPath + 'library/01-关于aWiki/了解aWiki文库.md']
					['markdown.md', rootPath + 'library/01-02-学习markdown/001-markdown快速开始.md']
					['highlighting.md', rootPath + 'library/01-02-学习markdown/001-markdown语法高亮.md']
				]
        	}

        	navUpdate.updateNav(rootPath + 'library/');

        });
    }
}