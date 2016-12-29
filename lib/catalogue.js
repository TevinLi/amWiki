/**
 * @desc amWiki 工作端·提取H2-H3为页内目录模块
 * @author Tevin
 */

module.exports = {
    //创建
    make: function () {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            return;
        }
        if (editor.getPath().substr(-3) !== '.md') {
            return;
        }
        editor.insertText(this.extract(editor.getText()) || '');
    },
    //抽取标题
    extract: function (arc) {
        var lines = arc.split('\n');
        if (lines.length == 1) {
            lines = lines[0].split('\r');
        }
        var contents = '';
        var lineStr = '';
        var hashStr = '';
        var h1 = '';
        var text;
        //修剪标题文本
        var trimStr = function (str) {
            return str.replace(/^\s+|\s+$/g, '')  //去除首尾空格
                .replace(/\[(.*?)]\(.*?\)/g, '$1')  //去除链接
                .replace(/<.*?>/g, '')  //去除html标签
                .replace(/'/g, '&#39;')  //转义单引号
                .replace(/"/g, '&#34;')  //转义双引号，由于双引号无法正确传递给html属性，当作为hash时将删除处理
                .replace(/\(/g, '&#40;')  //转义左圆括号
                .replace(/\)/g, '&#41;')  //转义右圆括号
                .replace(/\[/g, '&#91;')  //转义左中括号
                .replace(/\]/g, '&#93;');  //转义右中括号
        };
        //生成列表
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].replace(/^\s*/, '');  //去除行首空格
            switch (lines[i].split(/\s/)[0]) {
                case '#':
                    text = lines[i].split('# ')[1];
                    if (text != undefined) {
                        h1 = trimStr(text);
                    }
                    break;
                case '##':
                    text = lines[i].split('## ')[1];
                    if (text != undefined) {
                        lineStr = trimStr(text);
                        contents += '1. [' + lineStr + '](#' + lineStr.replace(/&#34;/g, '') + ' "' + lineStr + '")\n';
                    } else {
                        contents += '1. &#12288;\n';
                    }
                    break;
                case '###':
                    text = lines[i].split('### ')[1];
                    if (text != undefined) {
                        lineStr = trimStr(text);
                        contents += '\t1. [' + lineStr + '](#' + lineStr.replace(/&#34;/g, '') + ' "' + lineStr + '")\n';
                    } else {
                        contents += '\t1. &#12288;\n';
                    }
                    break;
            }
        }
        if (contents.substr(0, 2) != '1.') {
            contents = '1. ' + h1 + '\n' + contents;
        }
        contents = '>' + contents;
        return contents;
    }

};
