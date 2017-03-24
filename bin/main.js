#!/usr/bin/env node

const fs = require('fs');

//获取命令内容
const [nodePath, mainPath, command, ...argument] = process.argv;

//在全局变量上绑定 alert、confirm、prompt 方法，作为命令行输出
({alert: global.alert, confirm: global.confirm, prompt: global.prompt} = require('./messageBox'));

//命令行彩色输出简化
const tc = (num) => `\x1b[${num}m`;
const t = '\x1b[0m';

//wiki创建器
const creator = require('../build/creator');
//文库管理
const mngWiki = require('../build/manageWiki');
//文件夹管理
const mngFolder = require('../build/manageFolder');
//手动刷新导航文件
const makeNav = require('../build/makeNavigation');
//本地服务器模块
const localServer = require('../build/localServer');
//项目导出模块
const exportGithub = require('../build/exportGithub');

//显示帮助
const showHelp = require('./showHelp');

//显示版本号
const showVersion = () => {
    const packageConf = JSON.parse(fs.readFileSync(mainPath.replace(/bin[\\\/]main$/, '') + 'package.json', 'utf-8'));
    const text = ` ${tc(92)}am${t}${tc(96)}Wiki${t} ${tc(1)}v${packageConf.version}${t}`;
    alert(text);
};

//执行命令
switch (command) {
    case 'create':
    case '-c':
        break;
    case 'update':
    case '-u':
        break;
    case 'server':
    case '-s':
        break;
    case 'bowser':
    case '-b':
        break;
    case 'export-github':
    case '-eg':
        break;
    case 'help':
    case '-h':
        showHelp();
        break;
    case 'version':
    case '-v':
        showVersion();
        break;
}