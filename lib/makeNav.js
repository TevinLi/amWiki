/**
 * amWiki make navigation file
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
            return;
        }
        if (grammar.scopeName !== 'source.gfm') {
            return;
        }
        if (editor.getPath().indexOf('library') < 0) {
            alert('只有当你打开一个位于library文件夹下的文件时，才能更新“$navigation.md”！');
            return;
        }
        this.refresh(editor.getPath(), function (libPath) {
            //如果当前文库没有监听，恢复监听
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
        directories.readLibraryDir(path, function (err, tree, folders) {
            if (err) {
                console.error(err);
            } else {
                that.make(path, tree);
            }
        });
    },
    //创建md导航文件
    make: function (path, data) {
        if (this.checkDuplicateId(data)) {
            alert('存在重复id！');
            return;
        }
        var markdown = '';
        markdown += '\n#### [首页](?file=首页 "返回首页")\n';
        for (var dir1 in data) {
            if (data.hasOwnProperty(dir1)) {
                markdown += '\n##### ' + dir1.match(/^\d+\.*\d*-(.*?)$/)[1] + '\n';
                for (var dir2 in data[dir1]) {
                    if (data[dir1].hasOwnProperty(dir2)) {
                        //当为文件夹时
                        if (data[dir1][dir2]) {
                            markdown += '- **' + dir2.match(/^\d+\.*\d*-(.*?)$/)[1] + '**\n';
                            for (var dir3 in data[dir1][dir2]) {
                                if (data[dir1][dir2].hasOwnProperty(dir3)) {
                                    var name2 = dir3.match(/^\d+\.*\d*-(.*?)\.md$/)[1];
                                    markdown += '    - [' + name2 + '](?file=' +
                                        dir1 + '/' + dir2 + '/' + dir3.split('.md')[0] + ' "' + name2 + '")\n'
                                }
                            }
                        }
                        //当为文件时
                        else {
                            var name = dir2.match(/^\d+\.*\d*-(.*?)\.md$/)[1];
                            markdown += '- [' + name + '](?file=' +
                                dir1 + '/' + dir2.split('.md')[0] + ' "' + name + '")\n'
                        }
                    }
                }
            }
        }
        fs.writeFileSync(path + '$navigation.md', markdown, 'utf-8');
    },
    //检查重复id
    checkDuplicateId: function (data) {
        return false;
    }
};