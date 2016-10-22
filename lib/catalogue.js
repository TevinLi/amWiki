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
        if (grammar.scopeName !== 'source.gfm' && grammar.scopeName !== 'text.md') {
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
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].replace(/^\s*/, '');
            switch (lines[i].split(/\s/)[0]) {
                case '#':
                    lineStr = lines[i].split('# ')[1].replace(/^\s+|\s+$/g, '');
                    h1 = h1 == '' ? lineStr.replace(/\[(.*?)\]\(.*?\)/g, '$1') : h1;
                    break;
                case '##':
                    //去除首位空格
                    lineStr = lines[i].split('## ')[1].replace(/^\s+|\s+$/g, '');
                    //去除链接
                    lineStr = lineStr.replace(/\[(.*?)\]\(.*?\)/g, '$1');
                    //去除所有空格
                    hashStr = lineStr.replace(/\s+/g, '');
                    //添加内容
                    contents += '1. [' + lineStr + '](#' + hashStr + ' "' + lineStr + '")\n';
                    break;
                case '###':
                    lineStr = lines[i].split('### ')[1].replace(/^\s+|\s+$/g, '');
                    lineStr = lineStr.replace(/\[(.*?)\]\(.*?\)/g, '$1');
                    hashStr = lineStr.replace(/\s+/g, '');
                    contents += '\t1. [' + lineStr + '](#' + hashStr + ' "' + lineStr + '")\n';
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
