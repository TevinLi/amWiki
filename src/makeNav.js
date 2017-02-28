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
                return false;
            }
        };
        var markdown = '';
        markdown += '\n#### [首页](?file=首页 "返回首页")\n';
        for (var dir1 in data) {
            if (data.hasOwnProperty(dir1) && checkId(dir1, '')) {
                markdown += '\n##### ' + dir1.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '\n';
                for (var dir2 in data[dir1]) {
                    if (data[dir1].hasOwnProperty(dir2) && checkId(dir2, dir1 + '/')) {
                        //当为文件夹时
                        if (data[dir1][dir2]) {
                            markdown += '- **' + dir2.match(/^\d+(\.\d+)?[-_](.*?)$/)[2] + '**\n';
                            for (var dir3 in data[dir1][dir2]) {
                                if (data[dir1][dir2].hasOwnProperty(dir3) && checkId(dir3, dir1 + '/' + dir2 + '/')) {
                                    if (checkFileName(dir3, dir1 + '/' + dir2 + '/')) {
                                        var name2 = dir3.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
                                        markdown += '    - [' + name2 + '](?file=' +
                                            dir1 + '/' + dir2 + '/' + dir3.split('.md')[0] + ' "' + name2 + '")\n';
                                    }
                                }
                            }
                        }
                        //当为文件时
                        else {
                            if (checkFileName(dir2, dir1 + '/')) {
                                var name = dir2.match(/^\d+(\.\d+)?[-_](.*?)\.md$/)[2];
                                markdown += '- [' + name + '](?file=' +
                                    dir1 + '/' + dir2.split('.md')[0] + ' "' + name + '")\n';
                            }
                        }
                    }
                }
            }
        }
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
        //是否存在重复id
        var duplicate = 'none';
        //第一层，library直接子级
        if (check(data, '')) {
            for (var p1 in data) {
                if (data.hasOwnProperty(p1) && data[p1]) {
                    //第二层，可能是文件夹也可能是文件
                    if (check(data[p1], p1 + '/')) {
                        for (var p2 in data[p1]) {
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
        return duplicate == 'yes';
    }
};