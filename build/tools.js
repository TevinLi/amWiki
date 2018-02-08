/**
 * 工作端 - 公用工具模块
 * @author Tevin
 */


const tools = (function () {
    return {
        /**
         * 判断一个对象是否属于数组
         * @param {Object} obj - 需要判断的对象
         * @return {Boolean}
         * @public
         */
        isArray: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    };
})();

module.exports = tools;