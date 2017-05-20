/**
 * 工作端 - 创建 $navigation 导航文件模块
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
        let errorHas = false;
        //编码导航数据为 Markdown 文本
        let markdown = '\n#### [首页](?file=首页 "返回首页")\n';
        for (let item of list) {
            //检查 id 合法性
            if (!this._checkFileId(item.name, item.path)) {
                errorHas = true;
                continue;
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
                        errorHas = true;
                        continue;
                    }
                    const name = item.name.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
                    const path = item.path.split('library/')[1] + '/' + item.name.split('.md')[0];
                    markdown += '- [' + name + '](?file=' + path + ' "' + name + '")\n';
                }
            }
        }
        if (!errorHas) {
            fs.writeFileSync(path + '$navigation.md', markdown, 'utf-8');
        }
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
    /**
     * 递归检查(某一目录下的同级文件和文件夹的)ID是否存在重复
     * @param {object} tree - 当前层级的目录结构
     * @param {string} path - 当前目录所在路径
     * @return {boolean} 如果返回为true，则说明存在重复ID
     */
    _checkDuplicateId: function (tree, path = '') {
        let duplicate = false;
        let idList = {};
        for (let name in tree) {
            if (tree.hasOwnProperty(name)) {
                if (!idList[name.split(/[-_]/)[0]]) {
                    idList[name.split(/[-_]/)[0]] = name;
                } else {
                    alert('重复的排序ID！\n同级目录下存在相同的排序ID(' + name.split('-')[0] + ')，请更改为不同的ID\n' +
                        '    at path "library/' + path + '"\n' +
                        '    at file1 "' + idList[name.split('-')[0]] + '"\n' +
                        '    at file2 "' + name + '"');
                    duplicate = true;
                }
                //文件夹
                if (tree[name]) {
                    // duplicate 为真后，不再改变其值
                    if (duplicate) {
                        this._checkDuplicateId(tree[name], path + name + '/')
                    }
                    // duplicate 为否时，接收子级真假值
                    else {
                        duplicate = this._checkDuplicateId(tree[name], path + name + '/');
                    }
                }
            }
        }
        return duplicate;
    }
};