/**
 * @desc amWiki 工作端·创建$navigation导航文件模块
 * @author Tevin
 */

var fs = require("fs");
var directories = require('./directories');

module.exports = {
    //手动更新导航
    update: function (state, callback) {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        var grammar = editor.getGrammar();
        if (!grammar) {
            alert('只有当你打开library文件夹下的文档时，才能手动更新导航文件！');
            return;
        }
        var editorPath = editor.getPath();
        if (editorPath.indexOf('library') < 0 && editorPath.substr(-3) !== '.md') {
            alert('只有当你打开library文件夹下的文档时，才能手动更新导航文件！');
            return;
        }
        this.refresh(editorPath, function (libPath) {
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
    //刷新导航（创建wiki时）
    refresh: function (editorPath, callback) {
        var that = this;
        var path = editorPath.replace(/\\/g, '/').split('library')[0] + 'library/';
        callback && callback(path);
        directories.readLibraryDir(path, function (err, tree) {
            if (err) {
                console.warn(err);
            } else {
                that.make(path, tree);
            }
        });
    },
    //创建md导航文件
    make: function (path, data) {
        if (this.hasDuplicateId(data)) {
            return;
        }
        var hsErrId = false;
        var checkId = function (name, path) {
            if (/^\d+(\.\d+)?[-_](.*?)$/.test(name)) {
                return true
            } else {
                var text = 'Error File ID!\n排序id仅允许由整数或浮点数构成，并使用连接符或下划线与具体名称相连\n' +
                    '    at path "library/' + path + '"\n' +
                    '    at file "' + name + '"';
                hsErrId = true;
                alert(text);
                return false;
            }
        };
        var checkFileName = function (name, path) {
            if (/^\d+(\.\d+)?[-_](.*?)\.md$/.test(name)) {
                return true
            } else {
                var errText = 'Error File Name\n文件名须由 “排序id-名称.md” 格式构成\n' +
                    '    at path "library/' + path + '/"\n' +
                    '    at file "' + name + '"';
                alert(errText);
                alert('name：' + name);
                alert('path：' + path);
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
    },
    //检查重复id
    hasDuplicateId: function (data) {
        //单层检查
        var check = function (obj, path) {
            var hash = {};
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    if (!hash[name.split('-')[0]]) {
                        hash[name.split('-')[0]] = name;
                    } else {
                        alert('Duplicate File ID!\n同级目录下存在重复ID：' + name.split('-')[0] + '。\n' +
                            '    at path "library/' + path + '"\n' +
                            '    at file "' + hash[name.split('-')[0]] + '"\n' +
                            '    at file "' + name + '"');
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
                        //只要有一次统计目录下出现重复ID，则保证其返回为true;
                        if (!bDuplicate) {
                            bDuplicate = recuCheckID(tempDepth, tempDir, curTree[dir]);
                        }
                    } else {
                        bDuplicate = true;
                        return bDuplicate;
                    }
                }
            }
            return bDuplicate;
        };

        //是否存在重复id
        var nDepth = 0;
        var curDir = '';
        var isExistDuplicate = recuCheckID(nDepth, curDir, data);
        return isExistDuplicate;
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