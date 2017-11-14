/**
 * 插件管理架
 * @author Tevin
 */

;(function (win, ns) {

    'use strict';

    //命名空间引用
    var Base = ns('class.Base');

    /**
     * 命名空间注册 Base 声明
     * @memberof ns.class.core
     */
    var Shelf = ns('class.Shelf', function () {
        this._cache = {};
    });

    /**
     * 继承
     */
    Shelf.prototype = new Base();
    Shelf.prototype.constructor = Shelf;

    /**
     * 加载插件
     * @public
     */
    Shelf.prototype.loadPlugins = function () {
    };

    Shelf.prototype.initPlugin = function (plugin) {
    };

    /**
     * 初始化主题
     */
    Shelf.prototype.initThemes = function () {
    };

})(window, window.ns);