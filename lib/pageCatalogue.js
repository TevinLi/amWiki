/**
 * 工作端 - Atom - 提取 H2-H3 为文章目录模块
 * @author Tevin
 */

const pageCatalogue = (function () {
    return {
        /**
         * 生成文章目录
         * @param {Object} editor - 当前文档编辑器的引用
         * @public
         */
        make: function (editor) {
            editor.insertText(this._extract(editor.getText()) || '');
        },
        /**
         * 抽取标题
         * @param {String} arc
         * @private
         */
        _extract: function (arc) {
            let lines = arc.split('\n');
            if (lines.length === 1) {
                lines = lines[0].split('\r');
            }
            let contents = '',
                lineStr = '',
                hashStr = '',
                h1 = '',
                text;
            //生成列表
            for (let line of lines) {
                line = line.replace(/^\s*/, '');  //去除行首空格
                switch (line.split(/\s/)[0]) {
                    case '#':
                        text = line.split('# ')[1];
                        if (text !== undefined) {
                            h1 = this._trimTitle(text);
                        }
                        break;
                    case '##':
                        text = line.split('## ')[1];
                        if (text !== undefined) {
                            lineStr = this._trimTitle(text);
                            contents += '1. [' + lineStr + '](#' + lineStr.replace(/&#34;/g, '') + ' "' + lineStr + '")\n';
                        } else {
                            contents += '1. &#12288;\n';
                        }
                        break;
                    case '###':
                        text = line.split('### ')[1];
                        if (text !== undefined) {
                            lineStr = this._trimTitle(text);
                            contents += '\t1. [' + lineStr + '](#' + lineStr.replace(/&#34;/g, '') + ' "' + lineStr + '")\n';
                        } else {
                            contents += '\t1. &#12288;\n';
                        }
                        break;
                }
            }
            if (contents.substr(0, 2) !== '1.') {
                contents = '1. ' + h1 + '\n' + contents;
            }
            contents = '>' + contents;
            return contents;
        },
        /**
         * 修剪标题文本
         * @param {String} titleStr
         * @returns {String}
         * @private
         */
        _trimTitle: function (titleStr) {
            return titleStr.replace(/^\s+|\s+$/g, '')  //去除首尾空格
                .replace(/\[(.*?)]\(.*?\)/g, '$1')  //去除链接
                .replace(/<.*?>/g, '')  //去除html标签
                .replace(/'/g, '&#39;')  //转义单引号
                .replace(/"/g, '&#34;')  //转义双引号，由于双引号无法正确传递给html属性，当作为hash时将删除处理
                .replace(/\(/g, '&#40;')  //转义左圆括号
                .replace(/\)/g, '&#41;')  //转义右圆括号
                .replace(/\[/g, '&#91;')  //转义左中括号
                .replace(/\]/g, '&#93;');  //转义右中括号
        }
    }
})();

module.exports = pageCatalogue;