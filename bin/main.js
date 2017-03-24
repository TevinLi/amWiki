#!/usr/bin/env node

console.log('amWiki command line is now testing!');

//在全局变量上绑定 alert、confirm、prompt 方法
({alert: global.alert, confirm: global.confirm, prompt: global.prompt} = require('./messageBox'));
