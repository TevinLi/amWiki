var fs = require("fs");

module.exports = {
    update: function(state){
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
        this.refresh(editor.getPath(), function (libPath) {
            var hs, i;
            i = 0;
            hs = false;
            while (i < state.libraryList.length) {
                if (state.libraryList[i] === libPath) {
                    hs = true;
                }
                i++;
            }
            if (!hs) {
                state.libraryList.push(libPath);
            }
        });
    },
    refresh: function (editorPath, callback) {
        if (editorPath.indexOf('library') < 0) {
            alert('只有当你打开一个位于library文件夹下的文件时，才能更新“$navigation.md”！');
            return;
        }
        var that = this;
        var path = editorPath.replace(/\\/g, '/').split('library')[0] + 'library/';
        callback && callback(path);
        this.readDir(path, function (err, data) {
            if (!err) {
                var markdown = that.createMD(data);
                fs.writeFileSync(path + '$navigation.md', markdown, 'utf-8');
            }
        });
    },
    readDir: function (path, callback) {
        var dirObj = {};
        fs.readdir(path, function (err, files) {
            if (err) {
                callback(err);
            } else {
                for (var i = 0; i < files.length; i++) {
                    if (fs.statSync(path + files[i]).isDirectory(path + files[i])) {
                        dirObj[files[i]] = fs.readdirSync(path + files[i]);
                    }
                }
                callback(null, dirObj);
            }
        });
    },
    //创建md导航文件
    createMD: function (data) {
        var markdown = '';
        markdown += '\n#### [首页](?file=首页 "返回首页")\n';
        for (var dir in data) {
            if (data.hasOwnProperty(dir)) {
                if (dir == 'assets') {
                    continue;
                }
                markdown += '\n##### ' + dir.substring(3) + '\n';
                for (var i = 0; i < data[dir].length; i++) {
                    var name = data[dir][i].split('.md')[0];
                    markdown += '- [' + name.substring(4) + '](?file=' +
                        dir + '/' + name + ' "' + name.substring(4) + '")\n'
                }
            }
        }
        return markdown;
    }
};