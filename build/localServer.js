/**
 * 工作端 - 本地服务器模块
 * @author Tevin
 */

const fs = require('fs');
const child_process = require('child_process');
const co = require('../modules/co');
const Sever = require('./server.class');
const mngWiki = require('./manageWiki');

module.exports = {
    /**
     * 启动服务器
     * @param {object} wikis - 文库记录列表的引用
     * @param {number} port - 服务器端口号
     */
    run: function (wikis, port) {
        return co(function* () {
            if (!this._server) {
                this._server = new Sever(wikis, port);
                yield this._server.run();
            }
        });
    },
    /**
     * 浏览当前文档
     * @param {string} editPath - 当前文档的路径
     * @param {object} wikis - 文库记录列表的引用
     * @returns {promise}
     */
    browser: function (editPath, wikis) {
        return co(function* () {
            //判断服务器
            if (!this._server) {
                if (yield confirm2('本地服务器还未启动，您需要启动服务器么？')) {
                    this._server = new Sever(wikis);
                    yield this._server.run();
                } else {
                    return;
                }
            }
            //解析地址
            const host = 'http://' + this._server.getLocalIP() + ':' + this._server.getPort();
            const wikiId = mngWiki.createWikiId(editPath.split('library')[0]);
            let url;
            if (editPath.indexOf('$navigation.md') >= 0) {
                url = host + '/wiki' + wikiId + '/index.html';
            } else {
                let filePath = editPath.split('library/')[1];
                if (typeof filePath === 'undefined') {
                    url = host + '/wiki' + wikiId + '/index.html';
                } else {
                    filePath = filePath.replace(/\\/g, '/').replace(/ /g, '%20').replace('.md', '');
                    url = host + '/wiki' + wikiId + '/index.html?file=' + filePath;
                }
            }
            //呼起默认浏览器打开页面
            let cmd;
            //windows
            if (process.platform === 'win32') {
                cmd = 'start';
            }
            //linux
            else if (process.platform === 'linux') {
                cmd = 'xdg-open';
            }
            //mac
            else if (process.platform === 'darwin') {
                cmd = 'open';
            }
            child_process.exec(cmd + ' ' + url);
        }).catch((e) => {
            console.error(e);
        });
    },
    /**
     * 关闭服务器
     */
    destroy: function () {
        this.server && this.server.close();
    }
};