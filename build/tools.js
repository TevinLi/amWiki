/**
 * 工作端 - 公用工具模块
 * @author Tevin
 */


module.exports = {
    /**
     * 判断一个对象是否属于数组
     * @param {object} obj - 需要判断的对象
     * @return {boolean}
     */
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};