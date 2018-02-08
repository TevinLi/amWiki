/**
 * amWiki Web端 - 浏览器数据缓存模块
 * @author Tevin
 */

;
(function (win) {

    'use strict';

    var tools = win.tools;
    var wikiPath = tools.simString(win.location.pathname.replace('/', '').replace(/\//g, '_')).toUpperCase();
    var LOCAL_STORAGE_NAME = 'AMWikiDataBase@' + wikiPath;  //本地数据localStorage键名
    var LOCAL_STATES = 'AMWikiStates@' + wikiPath;  //本地状态集键名

    /**
     * 本地存储管理
     * @constructor
     */
    var Storage = function () {
        this._db = null;  //内存中的文库缓存
        this._states = null;  //内存中的状态集
        this.$e = {
            win: $(win),
            //更新全部缓存按钮
            searchUpdate: $('#searchUpdate'),
            //缓存状态
            cacheState: $('#cacheState'),
            //文档总数
            cacheDocTotal: $('#cacheDocTotal'),
            //上次全部缓存更新时间
            cacheLasttime: $('#cacheLasttime')
        };
        this._bridgeLocalStorage('read');
        this._bindCtrl();
    };

    /**
     * 存取本地存储
     * @param {String} type - read / save
     * @private
     */
    Storage.prototype._bridgeLocalStorage = function (type) {
        if (type == 'read') {
            var defaultStr = '{"documents":{},"lastBuild":0}';
            this._db = JSON.parse(win.localStorage[LOCAL_STORAGE_NAME] || defaultStr);
            //转换旧名称
            if (typeof this._db.libraries != 'undefined') {
                this._db.documents = this._db.libraries;
                delete this._db.libraries;
            }
        } else if (type == 'save') {
            win.localStorage[LOCAL_STORAGE_NAME] = JSON.stringify(this._db);
        }
    };

    /**
     * 绑定操作
     * @private
     */
    Storage.prototype._bindCtrl = function () {
        var that = this;
        this.$e.win.on('beforeunload', function () {
            that._bridgeLocalStorage('save');
        });
    };

    /**
     * 更新一篇文档，如果相同则不操作(对应内容不用重新渲染)
     * @param {String} uri
     * @param {String} content
     * @returns {Boolean}
     * @public
     */
    Storage.prototype.update = function (uri, content) {
        var id = tools.simString(uri, 'short');
        if (this._db.documents[id]) {
            if (this._db.documents[id].content == content) {
                return false;
            } else {
                this.saveDoc(uri, content, id);
                return true;
            }
        } else {
            this.saveDoc(uri, content, id);
            return true;
        }
    };

    /**
     * 保存一篇文档
     * @param {String} uri - 文档资源地址
     * @param {String} content - 文档内容
     * @param {String} [id] - 已经编码的文档地址，可选
     * @public
     */
    Storage.prototype.saveDoc = function (uri, content, id) {
        this.saveDocToDB(uri, content, id);
        this._bridgeLocalStorage('save');
        this._changeSummary('sateOnly');
    };

    /**
     * 将文档存储到内存
     * @param {String} uri
     * @param {String} content
     * @param {String} id
     * @public
     */
    Storage.prototype.saveDocToDB = function (uri, content, id) {
        if (typeof uri != 'string' && uri == '') {
            throw new Error('Error, uri must be a string!');
        }
        if (typeof id == 'undefined') {
            id = tools.simString(uri, 'short');
        }
        this._db.documents[id] = {
            id: id,
            uri: uri,
            content: content || '',
            timestamp: Date.now()
        };
        this._changeSummary('sateOnly', 'prepare');
    };

    /**
     * 读取一篇文档
     * @param {String} uri - 文档资源地址
     * @returns {String} 文档内容
     * @public
     */
    Storage.prototype.read = function (uri) {
        var id = tools.simString(uri, 'short');
        var article = '';
        if (this._db.documents[id]) {
            article = this._db.documents[id].content;
        }
        return article;
    };

    /**
     * 读取一篇文档的时间
     * @param {String} uri - 文档资源地址
     * @returns {String} 文档内容
     * @public
     */
    Storage.prototype.readTime = function (uri) {
        var id = tools.simString(uri, 'short');
        if (this._db.documents[id]) {
            return this._db.documents[id].timestamp;
        } else {
            return 0;
        }
    };

    /**
     * 删除一篇文档
     * @param {String} uri - 文档资源地址
     * @public
     */
    Storage.prototype.remove = function (uri) {
        var id = tools.simString(uri, 'short');
        delete this._db.documents[id];
        this._bridgeLocalStorage('save');
        this._changeSummary('sateOnly');
    };

    /**
     * 增涨文档打开数记录
     * @param {String} uri
     * @public
     */
    Storage.prototype.increaseOpenedCount = function (uri) {
        var id = tools.simString(uri, 'short');
        //TODO: 待续...打开次数将一定程度影响排行
    };

    /**
     * 校对列表，清除失效文档
     * @param {Array} list - 由导航树偏平化生成的文档列表
     * @public
     */
    Storage.prototype.checkLibChange = function (list) {
        this._indexing = list;
        var documents = {};
        var id = '';
        for (var i = 0; i < list.length; i++) {
            id = tools.simString(list[i], 'short');
            if (typeof this._db.documents[id] != 'undefined') {
                documents[id] = this._db.documents[id];
            }
        }
        this._db.documents = documents;
        this._bridgeLocalStorage('save');
        this._changeSummary();
    };

    /**
     * 更新缓存摘要（位于搜素面板）
     * @param {String} stateOnly - 是否为只读 stateOnly / ...
     * @param {String} prepare - 是否为预先 prepare / ...
     * @private
     */
    Storage.prototype._changeSummary = function (stateOnly, prepare) {
        var libraryiesLong = 0;
        for (var p in this._db.documents) {
            if (this._db.documents.hasOwnProperty(p)) {
                libraryiesLong++;
            }
        }
        //如果是预先，百分数减1
        if (prepare == 'prepare') {
            this.$e.cacheState.text(parseInt(libraryiesLong / this._indexing.length * 100 - 1) + '%');
        }
        //非预先则正常
        else {
            this.$e.cacheState.text(parseInt(libraryiesLong / this._indexing.length * 100) + '%');
        }
        //如果不只是状态
        if (stateOnly != 'stateOnly') {
            this.$e.cacheDocTotal.text(this._indexing.length);
            if (this._db.lastBuild) {
                this.$e.cacheLasttime.text(win.tools.formatTime(this._db.lastBuild));
            } else {
                this.$e.cacheLasttime.text('0000-00-00 00:00:00');
            }
        }
    };

    /**
     * 清除内存中的库列表
     * @public
     */
    Storage.prototype.clearLibraries = function () {
        this._db.documents = {};
        this._changeSummary('sateOnly');
    };

    /**
     * 完成本次缓存重建
     * @public
     */
    Storage.prototype.saveRebuild = function () {
        this._db.lastBuild = Date.now();
        this._bridgeLocalStorage('save');
        this._changeSummary();
    };

    /**
     * 返回导航列表
     * @returns {Array}
     * @public
     */
    Storage.prototype.getIndexList = function () {
        return this._indexing;
    };

    /**
     * 获取当前缓存的所有文档
     * @returns {{Object}}
     * @public
     */
    Storage.prototype.getAllDocs = function () {
        return this._db.documents;
    };

    /**
     * 获取缓存最后重建时间
     * @returns {Number}
     * @public
     */
    Storage.prototype.getLastBuildTs = function () {
        return this._db.lastBuild;
    };

    /**
     * 获取本地存储中指定名称的值
     * @param {String} name
     * @returns {*}
     * @public
     */
    Storage.prototype.getStates = function (name) {
        if (!this._states) {
            this._states = JSON.parse(win.localStorage[LOCAL_STATES] || '{}');
        }
        return this._states[name];
    };

    /**
     * 保持键值对到本地存储
     * @param {String} name
     * @param {*} value
     * @public
     */
    Storage.prototype.setStates = function (name, value) {
        if (!this._states) {
            this._states = JSON.parse(win.localStorage[LOCAL_STATES] || '{}');
        }
        if (typeof value == 'undefined') {
            delete this._states[name];
        } else {
            this._states[name] = value;
        }
        win.localStorage[LOCAL_STATES] = JSON.stringify(this._states);
    };

    return win.AWStorage = Storage;

})(window);