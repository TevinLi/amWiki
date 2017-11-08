/**
 * 事件管理器
 * @author Tevin
 */

;(function (win, ns) {

    'use strict';

    /**
     * 命名空间注册 Eventor 声明
     * @memberof ns.class.core
     */
    var Eventor = ns('class.core.Eventor', function () {
        this._eventList = {};
    });

    /**
     * 操作事件绑定
     * @param {String} type
     * @param {Function} callback
     * @param {Boolean} [priority] - 是否为优先执行，当优先执行回调返回 false 时，不执行普通回调
     * @public
     */
    Eventor.prototype.on = function (type, callback, priority) {
        if (!type || typeof type !== 'string') {
            return;
        }
        if (!callback) {
            return;
        }
        if (priority) {
            if (!Object.prototype.toString.call(this._eventList[type + '$']) === '[object Array]') {
                this._eventList[type + '$'] = [];
            }
            this._eventList[type + '$'].push(callback);
        } else {
            if (!Object.prototype.toString.call(this._eventList[type]) === '[object Array]') {
                this._eventList[type] = [];
            }
            this._eventList[type].push(callback);
        }
    };

    /**
     * 事件解除绑定
     * @param {String} type
     * @param [callback] - 不存在 callback 时解除所有 type 的绑定
     * @public
     */
    Eventor.prototype.off = function (type, callback) {
        if (!type || typeof type !== 'string') {
            return;
        }
        if (!Object.prototype.toString.call(callback) === '[object Function]') {
            if (this._eventList[type + '$']) {
                this._eventList[type + '$'].length = 0;
            }
            if (this._eventList[type]) {
                this._eventList[type].length = 0;
            }
            return;
        }
        for (var j = 0; this._eventList[type + '$'] && j < this._eventList[type + '$'].length; j++) {
            if (this._eventList[type + '$'][j] === callback) {
                this._eventList[type + '$'].splice(j, 1);
                return;
            }
        }
        for (var i = 0; this._eventList[type] && i < this._eventList[type].length; i++) {
            if (this._eventList[type][i] === callback) {
                this._eventList[type].splice(i, 1);
                return;
            }
        }
    };

    /**
     * 触发
     * @param {String} type - 事件名称
     * @param {*} [event] - 事件携带的数据
     * @public
     */
    Eventor.prototype.trigger = function (type, event) {
        var stopNormalLevel = false;
        if (Object.prototype.toString.call(this._eventList[type + '$']) === '[object Array]') {
            for (var j = 0, state; j < this._eventList[type + '$'].length; j++) {
                state = this._eventList[type + '$'][j] && this._eventList[type + '$'][j](event);
                stopNormalLevel = state === false;
            }
        }
        //如果优先层回调返回false，
        if (stopNormalLevel) {
            return
        }
        if (Object.prototype.toString.call(this._eventList[type]) === '[object Array]') {
            for (var i = 0; i < this._eventList[type].length; i++) {
                this._eventList[type][i] && this._eventList[type][i](event);
            }
        }
    };

})(window, window.ns);
