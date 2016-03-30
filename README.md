# amWiki 文库

amWiki是一套非常简单基于atom编辑器的轻量级wiki文库系统。  
仅需要您使用atom编辑markdown文档和拥有http纯静态访问空间！  

**amWiki优势**：

- 无需服务端开发
- 不用数据库
- 一键创建新文库
- 一键更新文库目录
- 支持截图直接粘帖为本地png并插入当前markdown
- 文档自适应显示满足所有平台
- ... (更多内容期待您的发现)

## 目录结构

	index.html               //http访问首页
	amWiki/                   //amWiki静态文件目录
	library/                 //markdown文件目录
	  ├ _navigation_.md      //amWiki文库目录导航文件，可自动更新
	  ├ 首页.md              //内容区默认显示内容
	  ├ (assetes/)           //如果您粘帖图片，自动创建在此处
	  ├ 01-关于amWiki文库/     //markdown文件夹01
      │   ├ 001-关于amWiki    //一些markdown文档，不支持更深的目录
      │   └ 002-...
      ├ 02-学习markdown/     //markdown文件夹02
      │   ├ 001-md入门       //一些markdown文档，不支持更深的目录
      │   └ 002-...
      └ 03-...               //更多markdown文件夹


## 如何使用

1. 创建一个文件夹，作为项目加入atom
2. 在此文件夹下创建config.json文件，打开并配置config.json如下

		{
		    "name": "您的文库名称，为空时显示默认名",
		    "version": "文本版本号，为空不显示"
		}

3. atom菜单 Packages -> amWiki文库 -> 通过“config.json”文件创建新amWiki文库
4. 开始编辑您的文档系统  
5. 如果需要插入图片，请先截图，然后在.md文档对应位置使用 `Ctrl+Shift+V`

