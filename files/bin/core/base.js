/**
 * 基础类
 * @author Tevin
 */

;(function (win, ns) {

    'use strict';

    //命名空间引用
    var eventor = ns('class.core.Eventor');

    /**
     * 命名空间注册 Base 声明
     * @memberof ns.class.core
     */
    var Base = ns('class.core.Base', function () {
    });

    /**
     * 事件管理
     * @public
     */
    Base.prototype.$eventor = new eventor();

})(window, window.ns);