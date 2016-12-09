/**
 * @desc amWiki 工作端·导出模块
 * @author Tevin
 */

var electronRemote = require('electron').remote,
    dialog = electronRemote.dialog;
var fs = require("fs");

module.exports = {
    export: function (type) {
        dialog.showOpenDialog({properties: ['openDirectory']}, function (data) {
            if (data && data.length) {

            }
        })
    }
};