#!/usr/bin/env node

const fs = require('fs');

//获取命令内容
const [nodePath, mainPath, command, ...argument] = process.argv;
//co模块，异步函数编程
const co = require('../modules/co');

//在全局变量上绑定 alert、confirm2、prompt2 方法，作为命令行输出与交互
({alert: global.alert, confirm2: global.confirm2, prompt2: global.prompt2} = require('./messageBox'));
//命令行彩色输出简化，command line color
const clc = (colorId, text) => `\x1b[${colorId}m${text}\x1b[0m`;

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

//创建wiki
const createWiki = () => {
};

//显示帮助
const showHelp = require('./showHelp');

//显示版本号
const showVersion = () => {
    const packageConf = JSON.parse(fs.readFileSync(mainPath.replace(/bin[\\\/]main$/, '') + 'package.json', 'utf-8'));
    const text = ` ${clc(92, 'am')}${clc(96, 'Wiki')} ${clc(1, 'v' + packageConf.version)}`;
    alert(text);
};

//执行命令
switch (command) {
    case 'create':
    case '-c':
        createWiki();
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