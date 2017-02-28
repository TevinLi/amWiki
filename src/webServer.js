/**
 * @desc amWiki 工作端·本地服务器模块
 * @author Tevin
 */

var http = require('http');
var url = require('url');
var fs = require('fs');
var util = require('util');
var os = require('os');
var child_process = require("child_process");
var GBK = require('../files/gbk.js').GBK;

//文件类型
var mimeType = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'xml': 'application/xml',
    'json': 'application/json',
    'js': 'application/javascript',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv"
};

//404未找到页面
var page_404 = function (req, res, path) {
    res.writeHead(404, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>404 Not Found</title>\n');
    res.write('<h1>Not Found</h1>');
    res.write(
        '<p>The requested URL ' +
        path +
        ' was not found on this server.</p>'
    );
    res.end();
};

//500错误页面
var page_500 = function (req, res, error) {
    res.writeHead(500, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>Internal Server Error</title>\n');
    res.write('<h1>Internal Server Error</h1>');
    res.write('<pre>' + util.inspect(error) + '</pre>');
};

//获取本地ip
function getLocalIP() {
    var ifaces = os.networkInterfaces();
    var ip = '';
    for (var dev in ifaces) {
        if (ifaces.hasOwnProperty(dev)) {
            ifaces[dev].forEach(function (details) {
                if (details.family == 'IPv4' && details.address.indexOf(192) >= 0) {
                    ip = details.address;
                }
            });
        }
    }
    if (ip == '') {
        ip = '127.0.0.1';
    }
    return ip;
}

module.exports = {
    //web服务器
    server: null,
    //地址映射列表
    mappingList: {},
    //创建web服务器
    createServer: function () {
        var that = this;
        this.server = http.createServer(function (req, res) {
            var pathname = url.parse(req.url).pathname;
            var mappingId = '';
            var filePath = pathname.replace(/^\/wiki(\d{3,}?)\//g, function (match, $1) {
                mappingId = 'wiki' + $1;
                return ''
            });
            if (!that.mappingList[mappingId]) {
                return page_404(req, res, pathname);
            }
            //编码切换
            try {
                filePath = decodeURI(filePath);
            } catch (e) {
                filePath = GBK.decode(filePath);
            }
            //真实地址
            var realPath = that.mappingList[mappingId] + filePath;
            //解析文件
            fs.exists(realPath, function (exists) {
                if (!exists) {
                    return page_404(req, res, pathname);
                } else {
                    var file = fs.createReadStream(realPath);
                    res.writeHead(200, {
                        'Content-Type': mimeType[realPath.split('.').pop()] || 'text/plain'
                    });
                    file.on('data', res.write.bind(res));
                    file.on('close', res.end.bind(res));
                    file.on('error', function (err) {
                        return page_500(req, res, err);
                    });
                }
            });
        }).listen(5171);
        console.info('Server running at http://' + getLocalIP() + ':5171/');
    },
    //更新映射列表
    updateMap: function(list) {
        this.mappingList = {};
        for (var i = 0; i < list.length; i++) {
            var path = list[i].replace('library/', '');
            //缩短数字并设置为地址映射名
            this.mappingList['wiki' + this.createMappingId(path)] = path;
        }
    },
    //启动服务器
    run: function (list) {
        this.updateMap(list);
        if (!this.server) {
            this.createServer();
        }
    },
    //创建映射列表
    createMappingId: function (path) {
        path = path.replace(/\\/g, '/');
        //累加地址字符串每个字符Unicode值与其序号的乘积
        var code = 0;
        for (var j = 0; j < path.length; j++) {
            code += path.charCodeAt(j) * j;
        }
        //再与地址字符串长度拼合
        code = parseInt(path.length + '' + code);
        return code;
    },
    //浏览当前文档
    browser: function (list) {
        //编辑器
        var editor = atom.workspace.getActiveTextEditor();
        //状态验证，当编辑md文档时才允许操作
        var grammar, img;
        if (!editor) {
            return;
        }
        grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }
        if (editor.getPath().substr(-3) !== '.md') {
            alert('请先打开一篇文档！');
            return;
        }
        //更新地址映射
        for (var i = 0; i < list.length; i++) {
            var path = list[i].replace('library/', '');
            //缩短数字并设置为地址映射名
            this.mappingList['wiki' + this.createMappingId(path)] = path;
        }
        //判断服务器
        if (!this.server) {
            if (confirm('本地服务器还未启动，您需要启动服务器么？')) {
                this.createServer();
            }
        }
        //解析地址
        var host = 'http://' + getLocalIP() + ':5171';
        var editorPath = editor.getPath();
        var mappingId = this.createMappingId(editorPath.split('library')[0]);
        var url;
        if (editorPath.indexOf('$navigation.md') >= 0) {
            url = host + '/wiki' + mappingId + '/index.html';
        } else {
            var filePath = editorPath.split('library\\')[1];
            if (typeof filePath == 'undefined') {
                url = host + '/wiki' + mappingId + '/index.html';
            } else {
                filePath = filePath.replace(/\\/g, '/').replace(/ /g, '%20').replace('.md', '');
                url = host + '/wiki' + mappingId + '/index.html?file=' + filePath;
            }
        }
        //呼起默认浏览器打开页面
        var cmd;
        //windows
        if (process.platform == 'win32') {
            cmd = 'start';
        }
        //linux
        else if (process.platform == 'linux') {
            cmd = 'xdg-open';
        }
        //mac
        else if (process.platform == 'darwin') {
            cmd = 'open';
        }
        child_process.exec(cmd + ' ' + url);
    },
    //关闭服务器
    destroy: function () {
        this.server && this.server.close();
    }
};