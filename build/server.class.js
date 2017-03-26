/**
 * @desc 工作端·本地服务器类
 * @author Tevin
 */

const fs = require('fs');
const http = require('http');
const url = require('url');
const os = require('os');
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

class Server {

    constructor(wikis) {
        this._wikis = wikis;
        this._localIP = this.getLocalIP();
        this.server = http.createServer((req, res) => {
            this.parse(req, res);
        }).listen(5171);
        console.info('Server running at http://' + this._localIP + ':5171/');
    }

    //404未找到页面
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

    //500错误页面
    static page500(req, res, error) {
        res.writeHead(500, {
            'Content-Type': 'text/html'
        });
        res.write('<!doctype html>\n');
        res.write('<title>Internal Server Error</title>\n');
        res.write('<h1>Internal Server Error</h1>');
        res.write('<pre>' + util.inspect(error) + '</pre>');
    }

    /**
     * 获取本地ip
     * @returns {string} 本地ip地址
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
     * 解析请求
     * @param req {object} 请求体的引用
     * @param res {object} 响应体的引用
     */
    parse(req, res) {
        const pathname = url.parse(req.url).pathname;
        let wId = '';
        let filePath = pathname.replace(/^\/wiki(\d{3,}?)\//g, function (match, $1) {
            wId = $1;
            return '';
        });
        //如果文库不存在或已弃用，返回404
        if (typeof this._wikis[wId] === 'undefined' || this._wikis[wId].deprecated) {
            Server.page404(req, res, pathname);
            return;
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
    }



}

module.exports = Server;