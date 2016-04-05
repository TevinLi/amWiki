var fs = require("fs");

var readDir = function (path, callback) {
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
};

var createMD = function (data) {
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
};

module.exports = {
    updateNav: function (editorPath) {
        if (editorPath.indexOf('library') < 0) {
            alert('只有当你打开一个位于library文件夹下的文件时，才能更新“_navigation_.md”！');
            return;
        }
        var path = editorPath.split('library')[0] + 'library/';
        readDir(path, function (err, data) {
            if (!err) {
                var markdown = createMD(data);
                fs.writeFileSync(path + '_navigation_.md', markdown, 'utf-8');
            }
        });
    },
    watchDir: function (editorPath) {
        if (editorPath.indexOf('library') < 0) {
            return;
        }
        var path = editorPath.split('library')[0] + 'library/';
        fs.watch(path, function (event, fileName) {
            if (fileName && fileName != '_navigation_.md') {
                readDir(path, function (err, data) {
                    if (!err) {
                        var markdown = createMD(data);
                        fs.writeFileSync(path + '_navigation_.md', markdown, 'utf-8');
                    }
                });
            }
        });
    }
}