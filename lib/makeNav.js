/**
 * @desc amWiki 工作端·创建$navigation导航文件模块
 * @author 耀轩之
 * @copyright 在Tevin的原基础上修改所得
 */

var fs = require("fs");
var directories = require('./directories');
var vscode = require('vscode');

module.exports = {
    /**
     * @desc 手动更新导航 
     * @param[in] state 当前传输进来的VSCode的全局数据
     * @param[in] callback 此回调函数传入了一个Markdown文件信息
     * @return 无
     */
    update: function (state, callback) {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return false;
        }
        var grammar = editor.document.languageId;
        if (!grammar) {
            vscode.window.showInformationMessage('只有当你打开library文件夹下的文档时，才能手动更新导航文件！');
            return false;
        }
        if (grammar !== 'markdown') {
            vscode.window.showInformationMessage('只有当你打开library文件夹下的文档时，才能手动更新导航文件！');
            return false;
        }
        var editorPath = editor.document.fileName;
        if (editorPath.indexOf('library') < 0 && editorPath.substr(-3) !== '.md') {
            vscode.window.showInformationMessage('只有当你打开library文件夹下的文档时，才能手动更新导航文件！');
            return false;
        }
        return this.refresh(editorPath, function (libPath) {
            //如果当前文库没有记录，添加记录
            var hs, i;
            i = 0;
            hs = false;
            while (i < state.libraryList.length) {
                if (state.libraryList[i] === libPath) {
                    hs = true;
                    break;
                }
                i++;
            }
            if (!hs) {
                state.libraryList.push(libPath);
                callback && callback(libPath);
            }
        });
    },

    /**
     * @desc 刷新导航（创建wiki时） 
     * @param[in] editorPath 正在VSCode上编辑的Markdown文档
     * @param[in] callback 在此回调函数中更新文库导航文件
     * @return 无
     */
    refresh: function (editorPath, callback) {
        var that = this;
        var path = editorPath.replace(/\\/g, '/').split('library')[0] + 'library/';
        callback && callback(path);
        var bSuccess = true;
        directories.readLibraryDir(path, function (err, tree) {
            if (err) {
                console.log(err);
                bSuccess = false;
            } else {
                bSuccess = that.make(path, tree);
            }
        });
        return bSuccess;
    },
    
    /**
     * @desc 创建md导航文件
     * @param[in] path 传入Library路径 
     * @param[in] data 此Library的目录结构
     */
    make: function (path, data) {
        if (this.hasDuplicateId(data)) {
            return false;
        }
        var hsErrId = false;

        /**
         * @desc 检测当前文件夹的ID是否符合规范
         * @param[in] name 文件夹的名称
         * @param[in] path 此文件的所在目录路径信息
         * @return 如果返回true，则说明符合规范
         */
        var checkId = function (name, path) {
            if (/^\d+(\.\d+)?[-_](.*?)$/.test(name)) {
                return true
            } else {
                var text = 'Error File ID!\n排序id仅允许由整数或浮点数构成，并使用连接符或下划线与具体名称相连\n' +
                    '    at path "library/' + path + '"\n' +
                    '    at file "' + name + '"';
                hsErrId = true;
                console.log(text);
                return false;
            }
        };

        /**
         * @desc 检测当前文件的ID是否符合规范
         * @param[in] name 文件的名称
         * @param[in] path 此文件的所在目录路径信息
         * @return 返回为true时，则说明
         */
        var checkFileName = function (name, path) {
            if (/^\d+(\.\d+)?[-_](.*?)\.md$/.test(name)) {
                return true
            } else {
                var errText = 'Error File Name\n文件名须由 “排序id-名称.md” 格式构成\n' +
                    '    at path "library/' + path + '/"\n' +
                    '    at file "' + name + '"';
                console.log(errText);
                return false;
            }
        };

        var markdown = '';
        markdown += '\n#### [首页](?file=首页 "返回首页")\n';

        var nDepth = 0;
        var curDir = '';

        //以递归的方式来分析文库目录结构，生成对应的目录信息
        mutilMergeForNav(function (navStr, nDepth) {
            for (var n = 0; n < nDepth; n++) {
                navStr = '   ' + navStr;
            }
            markdown += navStr;
        }, nDepth, curDir, data, checkId, checkFileName);

        if (!hsErrId) {
            fs.writeFileSync(path + '$navigation.md', markdown, 'utf-8');
        }
        return !hsErrId;
    },

    /**
     * @desc 检测目录结构是否存在重复ID
     * @param[in] data 一个多重数组构成的文件目录结构信息
     * @return 如果返回为true，则说明存在重复ID
     */
    hasDuplicateId: function (data) {
        //单层检查
        var check = function (obj, path) {
            var hash = {};
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    if (!hash[name.split('-')[0]]) {
                        hash[name.split('-')[0]] = name;
                    } else {
                        var errText = 'Duplicate File ID!\n同级目录下存在重复ID：' + name.split('-')[0] + '。\n' +
                            '    at path "library/' + path + '"\n' +
                            '    at file "' + hash[name.split('-')[0]] + '"\n' +
                            '    at file "' + name + '"';
                        console.log(errText);
                        return false;
                    }
                }
            }
            return true;
        };

        /**
         * @desc 递归检测某个目录的同级文件（夹）的ID是否存在重复
         * @param[in] nDepth 当前所在层级深度
         * @param[in] curDir 当前目录所在路径
         * @param[in] curTree 当前层级的目录结构
         * @return 如果返回为true，则说明存在重复ID
         */
        var recuCheckID = function (nDepth, curDir, curTree) {
            var bDuplicate = false;
            for (var dir in curTree) {
                if (curTree.hasOwnProperty(dir) && curTree[dir]) {
                    if (check(curTree[dir], curDir)) {
                        var tempDepth = nDepth + 1;
                        var tempDir = curDir + dir + '/';
                        bDuplicate = recuCheckID(tempDepth, tempDir, curTree[dir]);
                    } else {
                        bDuplicate = true;
                        return bDuplicate;
                    }
                }
            }
            return bDuplicate;
        };

        var nDepth = 0;
        var curDir = '';
        return recuCheckID(nDepth, curDir, data);
    }
};

/**
 * @desc 分析目录结构树
 * @param[out] callback 专门处理回调的字符串数据
 * @param[in] nDepth 当前层级所在深度
 * @param[in] curDir 当前层级的相对Library的路径信息
 * @param[in] curTree 当前目录文件结构的树状结构
 * @param[in] checkId 此函数检测Id是否重复
 * @param[in] checkFileName 此函数检测当前文件名是否是在某个路径之下
 * @return 无
 */
function mutilMergeForNav(callback, nDepth, curDir, curTree, checkId, checkFileName) {
    for (var dir in curTree) {
        if (curTree[dir]) {
            if (nDepth == 0) {
                if (curTree.hasOwnProperty(dir) && checkId(dir, '')) {
                    var temp = '\n##### ' + dir.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '\n';
                    callback(temp, nDepth);
                }
            } else {
                if (curTree.hasOwnProperty(dir) && checkId(dir, curDir)) {
                    var temp = '- **' + dir.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '**\n';
                    callback(temp, nDepth);
                }
            }
            var tempDepth = nDepth + 1;
            var tempDir = curDir + dir + '/';
            mutilMergeForNav(callback, tempDepth, tempDir, curTree[dir], checkId, checkFileName);
        } else {
            if (checkFileName(dir, curDir + '/')) {
                var name = dir.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
                var temp = '- [' + name + '](?file=' +
                    curDir + dir.split('.md')[0] + ' "' + name + '")\n';
                callback(temp, nDepth);
            }
        }
    }
}