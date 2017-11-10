/**
 * 插件管理架
 * @author Tevin
 */

;(function (win, ns) {

    'use strict';

    //命名空间引用
    var Base = ns('class.core.Base');

    /**
     * 命名空间注册 Base 声明
     * @memberof ns.class.core
     */
    var Shelf = ns('class.core.Shelf', function () {
        this._cache = {};
    });

    /**
     * 继承
     */
    Shelf.prototype = new Base();
    Shelf.prototype.constructor = Shelf;

})(window, window.ns);