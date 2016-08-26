/**
 * @desc amWiki Web端·本地缓存模块
 * @author Tevin
 */

;
(function (win) {

    'use strict';

    var tools = win.tools;
    var wikiPath = tools.simString(win.location.pathname.replace('/', '').replace(/\//g, '_')).toUpperCase();
    var LOCAL_STORAGE_NAME = 'AMWikiDataBase@' + wikiPath;  //本地数据localStorage键名

    /**
     * @class 创建一个本地存储管理对象
     */
    var Storage = function () {
        this.db = null;  //内存中的文库缓存
        this.bridgeLocalStorage('read');
    };

    //存取本地存储
    Storage.prototype.bridgeLocalStorage = function (type) {
        if (type == 'read') {
            this.db = JSON.parse(win.localStorage[LOCAL_STORAGE_NAME] || '{"libraries":{}}');
        } else if (type == 'save') {
            win.localStorage[LOCAL_STORAGE_NAME] = JSON.stringify(this.db);
        }
    };

    //更新一篇文档，如果相同则不操作(对应内容不用重新渲染)
    Storage.prototype.update = function (uri, content) {
        var id = tools.simString(uri, 'short');
        if (this.db.libraries[id]) {
            if (this.db.libraries[id].content == content) {
                return false;
            } else {
                this.save(uri, content, id);
                return true;
            }
        } else {
            this.save(uri, content, id);
            return true;
        }
    };

    /**
     * @desc 保存一篇文档
     * @param uri {string} - 文档资源地址
     * @param content {string} - 文档内容
     * @param [id] {string} - 已经编码的文档地址，可选
     */
    Storage.prototype.save = function (uri, content, id) {
        if (typeof uri != 'string' && uri == '') {
            throw new Error('Error, uri must be a string!');
        }
        if (typeof id == 'undefined') {
            id = tools.simString(uri, 'short');
        }
        this.db.libraries[id] = {
            id: id,
            uri: uri,
            content: content || ''
        };
        this.bridgeLocalStorage('save');
    };

    /**
     * @desc 读取一篇文档
     * @param uri {string} - 文档资源地址
     * @returns {string} - 文档内容
     */
    Storage.prototype.read = function (uri) {
        var id = tools.simString(uri, 'short');
        var article = '';
        if (this.db.libraries[id]) {
            article = this.db.libraries[id].content;
        }
        return article;
    };

    /**
     * @desc 删除一篇文档
     * @param uri {string} - 文档资源地址
     */
    Storage.prototype.remove = function (uri) {
        var id = tools.simString(uri, 'short');
        delete this.db.libraries[id];
        this.bridgeLocalStorage('save');
    };

    /**
     * @desc 校对列表，清除失效文档
     * @param list {Array} - 由导航树偏平化生成的文档列表
     */
    Storage.prototype.checkLibChange = function (list) {
        var libraries = {};
        var id = '';
        for (var i = 0; i < list.length; i++) {
            id = tools.simString(list[i], 'short');
            if (typeof this.db.libraries[id] != 'undefined') {
                libraries[id] = this.db.libraries[id];
            }
        }
        this.db.libraries = libraries;
        this.bridgeLocalStorage('save');
    };

    return win.AWStorage = Storage;

})(window);