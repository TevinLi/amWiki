/**
 * 工作端 - 本地服务器类
 * @author Tevin
 */

const fs = require('fs');
const util = require('util');
const http = require('http');
const url = require('url');
const os = require('os');
const mngWiki = require('./manageWiki');
const gbk = require('../files/gbk.js').GBK;

//文件类型
const MimeType = {
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
    'swf': 'application/x-shockwave-flash',
    'tiff': 'image/tiff',
    'wav': 'audio/x-wav',
    'wma': 'audio/x-ms-wma',
    'wmv': 'video/x-ms-wmv'
};

/**
 * @class Server
 */
class Server {

    /**
     * @constructor
     * @param {[Object]} wikis
     * @param {Number} port=5171
     */
    constructor(wikis, port = 5171) {
        this._wikis = wikis;
        this._port = port;
        this._localIP = this.getLocalIP();
        this._indexShow = true;
        this._nodeServer = http.createServer((req, res) => {
            this._parse(req, res);
        });
    }

    /**
     * 服务器启动
     * @return {Promise}
     * @public
     */
    run() {
        return new Promise((resolve, reject) => {
            let portCount = 0;
            this._nodeServer
                .on('listening', () => {
                    mngWiki.updateWikiConfig();
                    console.info('Server running at http://' + this._localIP + ':' + this._port + '/');
                    resolve();
                })
                .on('error', (e) => {
                    if (e.syscall === 'listen' && e.code === 'EADDRINUSE') {
                        if (portCount < 12) {
                            console.warn('端口 ' + this._port + ' 已被其他程序占用，尝试端口号+1，监听端口 ' + (this._port + 1));
                            portCount++;
                            this._nodeServer.listen(++this._port);
                        } else {
                            console.error('端口从 ' + (this._port - portCount) + ' 到 ' + this._port +
                                ' 尽皆被占用，请使用其他段位的端口！');
                            reject();
                        }
                    } else {
                        throw e;
                    }
                });
            this._nodeServer.listen(this._port);
        });
    }

    /**
     * 获取本地ip
     * @returns {String} 本地ip地址
     * @public
     */
    getLocalIP() {
        if (this._localIP) {
            return this._localIP;
        }
        const iFaces = os.networkInterfaces();
        let ip = '';
        for (let dev in iFaces) {
            if (iFaces.hasOwnProperty(dev)) {
                iFaces[dev].forEach((details) => {
                    if (details.family === 'IPv4' && details.address.indexOf(192) >= 0) {
                        ip = details.address;
                    }
                });
            }
        }
        return ip === '' ? '127.0.0.1' : ip;
    }

    /**
     * 获取当前 server 监听的端口
     * @return {Number} 端口号
     * @public
     */
    getPort() {
        return this._port;
    }

    /**
     * 关闭 amWiki 索引页显示
     * @public
     */
    offIndex() {
        this._indexShow = false;
    }

    /**
     * 解析请求
     * @param {Object} req - 请求体
     * @param {Object} res - 响应体
     * @private
     */
    _parse(req, res) {
        const pathname = url.parse(req.url).pathname;
        //文库列表页
        if (/^(\/|(\/index(\.html)?))$/.test(pathname)) {
            if (this._indexShow) {
                return this._renderIndexPage(req, res);
            } else {
                return Server.page404(req, res, pathname);
            }
        }
        //文库
        let wId = '';
        let filePath = pathname.replace(/^\/wiki(\d{3,}?)\//g, function (match, $1) {
            wId = $1;
            return '';
        });
        //如果文库不存在或已弃用，返回404
        if (typeof this._wikis[wId] === 'undefined' || this._wikis[wId].deprecated) {
            return Server.page404(req, res, pathname);
        }
        //编码切换
        try {
            filePath = decodeURI(filePath);
        } catch (e) {
            filePath = gbk.decode(filePath);
        }
        //真实地址
        const realPath = this._wikis[wId].root + filePath;
        //解析文件
        try {
            fs.exists(realPath, (exists) => {
                if (!exists) {
                    return Server.page404(req, res, pathname);
                } else {
                    const file = fs.createReadStream(realPath);
                    res.writeHead(200, {
                        'Content-Type': MimeType[realPath.split('.').pop()] || 'text/plain'
                    });
                    file.on('data', res.write.bind(res));
                    file.on('close', res.end.bind(res));
                    file.on('error', function (err) {
                        return Server.page500(req, res, err);
                    });
                }
            });
        } catch (err) {
            return Server.page500(req, res, err);
        }
    }

    /**
     * 渲染索引页
     * @param {Object} req - 请求体
     * @param {Object} res - 响应体
     * @private
     */
    _renderIndexPage(req, res) {
        //样式
        let styleTp = 'body{background:#f5f5f5}h1,ul{display:block;margin:0 auto;padding:0;width:960px;max-width:95%}' +
            'h1{line-height:100px;text-align:center;font-weight:normal}' +
            'ul{display:block;margin-bottom:30px;}' +
            'li{display:block;position:relative;min-height:100px;padding:20px;margin-bottom:10px;color:gray;' +
            'background:#fff;border-radius:5px}' +
            'li>a{display:block;text-decoration:none;}' +
            'li strong{display:block;margin-right:150px;padding-bottom:8px;font-size:20px;font-weight:normal;' +
            'line-height:38px;color:#333;border-right:#e5e5e5 1px solid;border-bottom:#e5e5e5 1px solid;}' +
            'li>a:hover strong{border-bottom:#4296eb 1px solid;}' +
            'li strong small{margin-left:4px;padding:0 4px;font-style:normal;font-size:12px;line-height:20px;' +
            'color:#fff;vertical-align:text-top;background:#bbbbbb;}' +
            'li img{position:absolute;top:50%;right:90px;max-width:120px;max-height:120px;' +
            '-webkit-transform:translateY(-50%) translateX(50%);-moz-transform:translateY(-50%) translateX(50%);' +
            '-ms-transform:translateY(-50%) translateX(50%);transform:translateY(-50%) translateX(50%)}' +
            'li p{margin:0 150px 0 0;padding-top:10px;line-height:30px;word-wrap:break-word;word-break:break-all;' +
            'border-right:#e5e5e5 1px solid}' +
            'li p span{display:block}li p a,li p b{color:gray}';
        //布局
        let layoutTp = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
            '<title>amWiki Index Page</title>' +
            '<style>{{style}}</style></head><body>' +
            '<h1>amWiki Index Page <small>(文库列表索引)</small></h1>' +
            '<ul>{{list}}</ul></body></html>';
        //列表单项
        let itemTp = '<li><a href="{{link}}" target="_blank">' +
            '<strong>{{title}}<small>{{version}}</small></strong></a>' +
            '<img src="{{logo}}" /><p>{{content}}</p></li>';
        //列表
        let list = '';
        for (let wId in this._wikis) {
            if (this._wikis.hasOwnProperty(wId) && !this._wikis[wId].deprecated) {
                let wiki = this._wikis[wId];
                //文库链接
                let link = 'http://' + this.getLocalIP() + ':' + this.getPort() + '/wiki' + wiki.id + '/index.html';
                //文库 logo 地址
                let logo = wiki.config.logo;
                if (logo.indexOf('http') < 0) {
                    logo = '/wiki' + wiki.id + '/' + logo;
                }
                //文库详情
                let content = '<span>ID: <b>' + wiki.id + '</b></span>' +
                    '<span>本地位置: <b>' + wiki.root + '</b></span>' +
                    '<span>本地网址: <b>' + link + '</b></span>';
                if (wiki.config.testing) {
                    content += '<span>测试模块已开启</span>';
                }
                if (wiki.config['github-url']) {
                    content += '<span>Github-url: <a href="' + wiki.config['github-url'] + '">' +
                        wiki.config['github-url'] + '</a></span>';
                }
                //添加到列表
                list += itemTp.replace('{{link}}', link)
                    .replace('{{title}}', wiki.config.name)
                    .replace('{{version}}', wiki.config.version)
                    .replace('{{logo}}', logo)
                    .replace('{{content}}', content);
            }
        }
        //输出
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write(layoutTp.replace('{{style}}', styleTp).replace('{{list}}', list));
        res.end();
    }

    /**
     * 404未找到页面
     * @param {Object} req
     * @param {Object} res
     * @param {String} path
     * @static
     */
    static page404(req, res, path) {
        res.writeHead(404, {
            'Content-Type': 'text/html'
        });
        res.write('<!doctype html>\n');
        res.write('<title>404 Not Found</title>\n');
        res.write('<h1>Not Found</h1>');
        res.write('<p>The requested URL ' + path + ' was not found on this server.</p>');
        res.end();
    }

    /**
     * 500错误页面
     * @param {Object} req
     * @param {Object} res
     * @param {Error} error
     * @static
     */
    static page500(req, res, error) {
        res.writeHead(500, {
            'Content-Type': 'text/html'
        });
        res.write('<!doctype html>\n');
        res.write('<title>Internal Server Error</title>\n');
        res.write('<h1>Internal Server Error</h1>');
        res.write('<pre>' + util.inspect(error) + '</pre>');
        res.end();
    }

}

module.exports = Server;