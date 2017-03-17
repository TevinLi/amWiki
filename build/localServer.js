/**
 * @desc 工作端·本地服务器模块
 * @author Tevin
 */

let fs = require('fs');
let util = require('util');
let child_process = require('child_process');
let Sever = require('./server.class');
let mngWiki = require('./manageWiki');

module.exports = {
    //web服务器
    _server: null,
    //启动服务器
    run: function (wikis) {
        if (!this._server) {
            this._server = new Sever(wikis);
        }
    },
    //浏览当前文档
    browser: function (editPath, wikis) {
        //判断服务器
        if (!this._server) {
            if (confirm('本地服务器还未启动，您需要启动服务器么？')) {
                this._server = new Sever(wikis);
            }
        }
        //解析地址
        let host = 'http://' + this._server.localIP + ':5171';
        let wikiId = mngWiki.createWikiId(editPath.split('library')[0]);
        let url;
        if (editPath.indexOf('$navigation.md') >= 0) {
            url = host + '/wiki' + wikiId + '/index.html';
        } else {
            let filePath = editPath.split('library\\')[1];
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
    },
    //关闭服务器
    destroy: function () {
        this.server && this.server.close();
    }
};