/**
 * @desc 工作端·创建$navigation导航文件模块
 * @author Tevin
 */

const fs = require('fs');
const mngFolder = require('./manageFolder');

module.exports = {
    /**
     * 刷新导航（创建wiki时）
     * @param {string} editPath - 当前文档的路径
     * @returns {string} library文件夹路径
     */
    refresh: function (editPath) {
        const path = editPath.replace(/\\/g, '/').split('library')[0] + 'library/';
        const [tree, list] = mngFolder.readLibraryTree(path);
        if (!tree) {
            return;
        }
        this.make(path, tree, list);
        return path
    },
    /**
     * 创建md导航文件
     * @param {string} path - 文库library文件夹路径
     * @param {object} tree - 目录结构树形数据
     * @param {object} list - 目录结构列表数据
     */
    make: function (path, tree, list) {
        //先检查id重复
        if (this._checkDuplicateId(tree)) {
            return;
        }
        let markdown = '';
        //编码导航数据为 Markdown 文本
        markdown += '\n#### [首页](?file=首页 "返回首页")\n';
        for (let item of list) {
            //检查 id 合法性
            if (!this._checkFileId(item.name, item.path)){
                return;
            }
            //一级目录
            if (item.depth === 0) {
                //一级目录不允许文件
                if (item.type !== 'folder') {
                    continue;
                }
                markdown += '\n##### ' + item.name.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '\n';
            }
            //深目录
            else {
                //层级缩进
                markdown += new Array(item.depth).join('    ');
                //文件夹和文件分开处理
                if (item.type === 'folder') {
                    markdown += '- **' + item.name.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '**\n';
                } else if (item.type === 'file') {
                    //检查名称合法性
                    if (!this._checkFileName(item.name, item.path)) {
                        return;
                    }
                    const name = item.name.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
                    const path = item.path.split('library/')[1] + '/' + item.name.split('.md')[0];
                    markdown += '- [' + name + '](?file=' + path + ' "' + name + '")\n';
                }
            }
        }
        fs.writeFileSync(path + '$navigation.md', markdown, 'utf-8');
    },
    //检查id合法性
    _checkFileId: function (name, path) {
        if (/^\d+(\.\d+)?[-_](.*?)$/.test(name)) {
            return true
        } else {
            const text = '不合法的排序ID！\n请修改排序ID为整数或浮点数，且使用连接符或下划线与具体名称相接\n' +
                '    at path "library/' + path.split('library/')[1] + '"\n' +
                '    at file "' + name + '"';
            alert(text);
            return false;
        }
    },
    //检查名称合法性
    _checkFileName: function (name, path) {
        if (/^\d+(\.\d+)?[-_](.*?)\.md$/.test(name)) {
            return true
        } else {
            const errText = '不合法的文件名！\n请将文件名修改为形如 “排序ID-名称.md” 格式的名称\n' +
                '    at path "library/' + path.split('library/')[1] + '/"\n' +
                '    at file "' + name + '"';
            alert(errText);
            return false;
        }
    },
    //检查重复id
    _checkDuplicateId: function (data) {
        //单层检查
        const check = (obj, path) => {
            const hash = {};
            for (let name in obj) {
                if (obj.hasOwnProperty(name)) {
                    if (!hash[name.split('-')[0]]) {
                        hash[name.split('-')[0]] = name;
                    } else {
                        alert('重复的文件ID！\n同级目录下存在相同的ID(' + name.split('-')[0] + ')，请更改为不同的ID\n' +
                            '    at path "library/' + path + '"\n' +
                            '    at file1 "' + hash[name.split('-')[0]] + '"\n' +
                            '    at file2 "' + name + '"');
                        return false;
                    }
                }
            }
            return true;
        };
        //是否存在重复id
        let duplicate = 'none';
        //第一层，library直接子级
        if (check(data, '')) {
            for (let p1 in data) {
                if (data.hasOwnProperty(p1) && data[p1]) {
                    //第二层，可能是文件夹也可能是文件
                    if (check(data[p1], p1 + '/')) {
                        for (let p2 in data[p1]) {
                            if (data[p1].hasOwnProperty(p2) && data[p1][p2]) {
                                //第三层，只有文件
                                if (!check(data[p1][p2], p1 + '/' + p2 + '/')) {
                                    duplicate = 'yes';
                                    break;
                                }
                            }
                        }
                    } else {
                        duplicate = 'yes';
                        break;
                    }
                }
            }
        } else {
            duplicate = 'yes';
        }
        return duplicate === 'yes';
    }
};