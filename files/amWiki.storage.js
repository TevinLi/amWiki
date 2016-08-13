/**
 * @author Tevin
 * @desc 本地缓存
 */

;
(function (win) {

    'use strict';

    var tools = win.tools;
    var LOCAL_STORAGE_NAME = 'AMWikiDataBase';  //本地数据localStorage键名

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
        var id = tools.simString(str, 'short');
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

    //保存一篇文档
    Storage.prototype.save = function (uri, content, id) {
        if (typeof uri != 'string' && uri == '') {
            throw new Error('Error, uri must be a string!');
        }
        if (typeof id == 'undefined') {
            id = tools.simString(str, 'short');
        }
        this.db.libraries[id] = {
            id: id,
            uri: uri,
            content: content || ''
        };
        this.bridgeLocalStorage('save');
    };

    //读取一篇文档
    Storage.prototype.read = function (uri) {
        var id = tools.simString(str, 'short');
        var article = '';
        if (this.db.libraries[id]) {
            article = this.db.libraries[id].content;
        }
        return article;
    };

    //删除一篇文档
    Storage.prototype.remove = function (uri) {
        var id = tools.simString(str, 'short');
        delete this.db.libraries[id];
        this.bridgeLocalStorage('save');
    };

    //校对列表，清楚失效文档
    Storage.prototype.proofRead = function (list) {
    };

    return win.AWStorage = Storage;

})(window);