/**
 * 命名空间 namescape.js
 * @version 1.0
 * @see {@link https://github.com/TevinLi/namescape}
 *
 * @author Tevin
 * @license MIT - Released under the MIT license.
 */
;(function () {

    'use strict';

    /**
     * 挂载位置
     * @namespace ns
     * @type {{}}
     */
    var namescape = {};

    // 保护的命名空间
    var protect = [];

    /**
     * 命名空间
     * @param {String} name 需要创建的命名空间
     * @param {*} [input] 最后一个命名空间的应用的对象，可选，存在时表示定义此命名空间，否则仅读取
     * @return {Object} 最后一个命名空间创建的对象的引用
     */
    this.ns = function (name, input) {
        var parent = namescape,
            i, j;
        if (typeof name !== 'string' || name.length === 0) {
            throw new Error('NameScape Error: You must use a namescape!');
        }
        var parts = name.split('.');
        // input 不存在为读取
        if (typeof input === 'undefined') {
            for (i = 0; i < parts.length; i++) {
                if (typeof parent[parts[i]] === 'undefined') {
                    throw new Error('NameScape Error: "' + name + '" is not exist!');
                }
                parent = parent[parts[i]];
            }
        }
        // input 存在为创建
        else {
            for (i = 0; i < parts.length; i++) {
                if (i < parts.length - 1) {
                    if (typeof parent[parts[i]] === 'undefined') {
                        parent[parts[i]] = {};
                    }
                } else {
                    //命名保护，如果已存在不可覆盖
                    if (new RegExp('^(' + protect.join('|') + ')$').test(name)) {
                        if (typeof parent[parts[i]] === 'undefined') {
                            parent[parts[i]] = input;
                        } else {
                            throw new Error('NameScape Error: "' + name + '" is in protected, you can\'t cover it!');
                        }
                    } else {
                        if (typeof parent[parts[i]] !== 'undefined') {
                            if (input === null) {
                                return delete parent[parts[i]];
                            } else {
                                // 子级受保护时不可覆盖
                                var str = parts.join('.');
                                for (j = 0; j < protect.length; j++) {
                                    if (protect[j].indexOf(str) === 0) {
                                        throw new Error('NameScape Error: "' + protect[j] +
                                            '" is in protected, you can\'t cover it!');
                                    }
                                }
                                parent[parts[i]] = input;
                            }
                        } else {
                            parent[parts[i]] = input;
                        }
                    }
                }
                parent = parent[parts[i]];
            }
        }
        return parent;
    };

    /**
     * 显示所有命名空间
     */
    this.ns.show = function () {
        console.log(namescape);
    };

    /**
     * 添加受保护的命名空间
     * @param {String} name
     * @return {Number} 受保护的命名空间个数
     */
    this.ns.addProtect = function (name) {
        for (var i = 0, p; p = protect[i]; i++) {
            if (p === name) {
                return false;
            }
        }
        return protect.push(name);
    };

    /**
     * 移除受保护的命名空间
     * @param {String} name
     * @return {Boolean} 是否移除成功
     */
    this.ns.removeProtect = function (name) {
        var protect2 = [];
        var re = false;
        for (var i = 0, p; p = protect[i]; i++) {
            if (p !== name) {
                protect2.push(p);
            } else {
                re = true;
            }
        }
        protect = protect2;
        return re;
    };

    /**
     * 显示受保护的命名空间列表
     */
    this.ns.showProtect = function () {
        console.log(protect);
    };

}).call(window);
