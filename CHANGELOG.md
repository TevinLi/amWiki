# amWiki 版本日志

## [v1.2.1](https://github.com/TevinLi/amWiki/releases/tag/v1.2.1)
_2017-08-08_

- 改善 Mac 上点号开头的系统文件带来的诸多问题（例如导出报错等）([#32](https://github.com/TevinLi/amWiki/issues/32)、[#67](https://github.com/TevinLi/amWiki/issues/67))
- 允许在 config 上重新定义 library 路径 ([#47](https://github.com/TevinLi/amWiki/issues/47))
- 文章篇内目录显示优化 ([#33](https://github.com/TevinLi/amWiki/issues/33))
- 文章篇内目录序号识别，已有序号不再增加序号 ([#33](https://github.com/TevinLi/amWiki/issues/33))
- 基础 Markdown 语法扩充，实现文字飘红
- 统一官网和文档中心网址
- 修复几处显示细节

## [v1.2.0](https://github.com/TevinLi/amWiki/releases/tag/v1.2.0)
_2017-07-18_

- 新增本地数据挂载模式，可以直接双击 index 在浏览器中访问整个文库
    - Atom 平台和 Node-Npm 平台挂载数据操作绑定
    - 本地页面挂载数据生成与嵌入模块
    - 页面加载数据，页面打开时立即判断和读取挂载数据
    - 改进搜索，网络不可用时不再用 worker 而是直接搜索
    - disable 本地模式状态下的接口测试入口
    - 隐藏本地模式状态下的重建缓存按钮
- 基础 Markdown 语法扩充，支持 todo list 复选框 ([#56](https://github.com/TevinLi/amWiki/issues/56))
- 终端本地服务器命令新增可关闭 amWiki 索引页的可选参数
- 优化本地服务器容错性
- 搜索面板结果列表点击不再跳转页面
- 导航增加文档文件名转义，文档文件名允许使用语法符号`()[]'"`而不再冲突
- 对带`&`符号的文件名在URL地址上用特殊转义替代，不会再被作为参数截断 ([#64](https://github.com/TevinLi/amWiki/issues/64))
- 修复服务器文件系统为GBK编码时深目录无法读取的bug
- 调整大量注释、调整一些变量名，标记私有与公有

## [v1.1.3](https://github.com/TevinLi/amWiki/releases/tag/v1.1.3)
_2017-06-25_

- 增加大图预览模式第一期 ([#44](https://github.com/TevinLi/amWiki/issues/44))
- Markdown 基础语法扩充，支持定义图片大小与对齐方式 ([#45](https://github.com/TevinLi/amWiki/issues/45))
- 允许首页的文件名通过增加 `home-` 前缀来自定义
- 修复图片拖拽丢失扩展名的问题 ([#58](https://github.com/TevinLi/amWiki/issues/58))
- 更改 highlight.js 为完整版，支持 176 种语言语法高亮
- 修复测试面板切换文档时的一个显示问题

## [v1.1.2](https://github.com/TevinLi/amWiki/releases/tag/v1.1.2)
_2017-06-03_

- 允许在 config.json 上使用 imports 将额外的 css 和 js 文件嵌入页面 ([#43](https://github.com/TevinLi/amWiki/issues/43))
- 允许本地 server 多开，端口被占用时累加端口号 ([#46](https://github.com/TevinLi/amWiki/issues/46))
- 新增本地 server 索引页，本地根 url 不再 404
- 修复创建时取消创建操作的一个问题
- 调整一些文案

## [v1.1.1](https://github.com/TevinLi/amWiki/releases/tag/v1.1.1)
_2017-05-21_

- 紧急修复 win 平台 npm 创建报错的问题

## [v1.1.0](https://github.com/TevinLi/amWiki/releases/tag/v1.1.0)
_2017-05-20_

- 实现无限级导航 ([#5](https://github.com/TevinLi/amWiki/issues/5)、[#30](https://github.com/TevinLi/amWiki/pull/30))
    - 实现导航水平滚动条，调和水平垂直两滚动条冲突
    - 实现 PC、Mobi 端导航栏无限级梯度的层级显示
    - 实现目录无限级深度树形与列表数据读取
    - 实现无限级导航 Markdown 生成
    - 实现无限级重复的排序 ID 检查
    - 实现无限级图片粘贴、文件拖拽
- 优化工作端查找 library 文件夹
- 实现拖拽文件文件名汉字转拼音
- 修复导航初始化时展开的一个问题

---

### v1.0.6
_2017-05-05_

- 修复未开启测试模块的文库 web 端无内容显示的问题
- 修复导航未展开目录时显示不全只有一边的问题
- 修复上一版本 npm 失误的发布造成 Linux 平台命令无效的问题
- 移动端点击搜索按钮时关闭导航层 ([#40](https://github.com/TevinLi/amWiki/issues/40))

### v1.0.5
_2017-04-28_

- 导航筛选功能增强
    - 文件夹匹配
    - 筛选多个词
    - 忽略筛选词大小写
    - 筛选条件非主动删除不消失
    - 使用递归进行筛选，为无限级做准备 ([#5](https://github.com/TevinLi/amWiki/issues/5))
- 修复web端在移动端点击导航导航不自动收起的问题 ([#40](https://github.com/TevinLi/amWiki/issues/40))
- 修复web端测试面板在不关闭的条件下跳转文档后的一个显示问题
- 菜单栏增加 `从剪切板粘贴截图` 项，调和与其他插件快捷键冲突 ([#41](https://github.com/TevinLi/amWiki/issues/41))

### v1.0.4
_2017-04-22_

- 紧急修复命令行本地服务器不能启动的问题

### v1.0.3
_2017-04-22_

- 基础 Markdown 语法扩展，支持 footnote 脚注 ([#37](https://github.com/TevinLi/amWiki/issues/37))
- 修复 Windows 平台下 gitbash 执行命令结束报错的问题
- 修复 Linux 平台下 `/usr/bin/env` 解释器调用失败的问题
- 修复 Linux 平台下 create、version 报错的问题
- 释放快捷键绑定 Ctrl+D、Ctrl+H ([#38](https://github.com/TevinLi/amWiki/issues/38))
- 取消 readme 单篇长文介绍，仅保留安装方法，详细介绍引导至文档中心

### v1.0.2
_2017-04-04_

- 命令行启动服务器允许使用自定义端口参数
- 截图粘贴增强，QQ聊天、历史记录面板可复制单张图片直接粘入文档
- 修复命令行板块创建文库操作 $navigation.md 缺失的问题
- 修复本地 http 服务器 500 页面崩溃的问题
- 修复 web 端打开带 hash 地址链接时，hash 无效的问题
- 修复命令行显示版本号报错问题

### v1.0.1
_2017-03-30_

- 修复 npm 渠道安装失败的问题
- readme 添加 npm icon

### v1.0.0
_2017-03-30_

- [ _祝贺 amWiki 项目一周岁_ ]
- 构建基于 npm 的**命令行板块**，使用命令行可以同样创建维护文库
- 重构原工作端，分离为**构建板块**与**编辑器板块**
- 引入 ES6 异步编程，使用 Generator、yield、Thunk，将编辑器板块的 confirm 转为 confirm2，并与命令行板块的 confirm2 调用形式统一化
- 使用 ES6 异步编程，对构建板块部分回调方法进行重构，优先使用 return 与异步编程而不是 callback
- 使用 const/let 变量、解构赋值、箭头函数、Class 等 ES6 语法润色原工作端代码
- 增加命令行、终端界面信息打印着色、帮助菜单、版本显示
- 规范化部分公共方法注释

---

### v0.8.0
_2016-12-30_

- Web 端页面左右分栏滚动 ([#26](https://github.com/TevinLi/amWiki/issues/26))
- 工作端解除部分判断对 F12 造成的限制 ([#27](https://github.com/TevinLi/amWiki/issues/27))

---

### v0.7.7
_2016-12-19_  

- 全文库搜索，增加大小写忽略 ([#24](https://github.com/TevinLi/amWiki/issues/24))
- 修复导出后，在 github wiki 页内目录无法跳转的问题 ([#20](https://github.com/TevinLi/amWiki/issues/20#issuecomment-266927563))
- 修复导出时，html 格式的 img src 相对地址未转换问题 ([#23](https://github.com/TevinLi/amWiki/issues/23))
- 修复导出时，链接与 a 标签相对地址未转换问题 ([#23](https://github.com/TevinLi/amWiki/issues/23))

### v0.7.6
_2016-12-11_  

- 增加文库导出模块，可以将文库导出为 Github Wiki 项目 (**[#20](https://github.com/TevinLi/amWiki/issues/20)**)
- 允许 `.md` 文件文件名带空格 ([#19](https://github.com/TevinLi/amWiki/issues/19))
- Web 移动端点击页内目录以外的区域将折叠目录 ([#22](https://github.com/TevinLi/amWiki/issues/22))
- 修复某些情况下跳页面不返回顶部的问题 ([#21](https://github.com/TevinLi/amWiki/issues/21))

### v0.7.5
_2016-12-03_  
(none)

### v0.7.4
_2016-12-03_

- 增加 Web 端右侧目录悬浮窗 ([#15](https://github.com/TevinLi/amWiki/issues/15))
- 增加对 `[TOC]` 目录生成标签的支持 ([#15](https://github.com/TevinLi/amWiki/issues/15))
- 修复工作端抽取页内目录含单双引号、圆括号时无法正确解析的问题 ([#16](https://github.com/TevinLi/amWiki/pull/16))
- 修复工作端抽取页内目录无法跳转的问题 ([#15](https://github.com/TevinLi/amWiki/issues/15))
- 修复工作端抽取页内目录时内容为空报错的问题 ([#13](https://github.com/TevinLi/amWiki/issues/13), [#14](https://github.com/TevinLi/amWiki/pull/14))
- 修复 Web 端浏览器后退按钮报错问题
- Atom 菜单栏添加 “关于amWiki” 按钮

### v0.7.3
_2016-10-28_

- 修复部分atom下插件不能正常工作的问题

### v0.7.2
_2016-10-17_

- 新增搜索接口地址单独匹配并参与得分排序
- 新增搜索结果接口类文档专属标记
- 允许搜索框直接回车启动搜索 ([#12](https://github.com/TevinLi/amWiki/issues/12))
- Atom菜单微调整

### v0.7.1
_2016-10-10_

- 紧急修复 0.7.0 版本创建的 wiki 无法打开的问题

### v0.7.0
_2016-10-10_

- 新增全库搜索模块 ([#7](https://github.com/TevinLi/amWiki/issues/7))
    - 搜索worker子进程管理
    - 文档预处理实现
    - 关键词匹配得分排序机制设计
    - 搜索面板与基本操作
- 新增更新所有文档缓存
- 新增缓存统计
- 缓存模块其他优化
- 部分命名调整

---

### v0.6.5
_2016-10-04_  

- 新增一批基础说明文档
    - amWiki轻文库简介
    - amWiki功能导图
    - 如何开始一个新amWiki轻文库
    - 如何编辑amWiki轻文库
- 新增流程图语法说明文档
- 新增测试模块说明文档
- 新增转接到任意域名进行接口测试教程文档
- 过往内置说明文档文案优化修改
- 过往内置说明文档资源改名、改输出路径
- 新增测试文档参考值功能
- 修复图片粘帖的一个命名问题
- 修复一个打印样式的问题

### v0.6.4
_2016-10-03_ 

- 新版logo上线
- 介绍文案调整
- 代码段在移动端不换行 ([#10](https://github.com/TevinLi/amWiki/issues/10))

### v0.6.3
_2016-08-28_ 

- 工作端，添加、移除旧项目时，同步更新本地服务器的文库地址列表记录
- Web端接口测试，补齐Restful接口设计风格之Delete和Put请求 ([#9](https://github.com/TevinLi/amWiki/issues/9))
- Web端文档最底端(首页除外)，新增上一篇、下一篇的翻页导航
- 调整部分注释，atom工作部分命名为工作端，以便和web端做区分

### v0.6.2
_2016-08-25_ 

- 修复非wiki路径下atom重新得到焦点检查库变化时报错问题
- 修复二级目录不能粘帖截图的问题 ([#8](https://github.com/TevinLi/amWiki/issues/8))
- 优化web端导航栏筛选显示效果
- 重写文档"Markdown快速开始"与"markdown语法高亮"，提高此两篇文档表达效果
- 允许library目录下三层深度存在由点开头的额外文件夹
- 添加贡献指引

### v0.6.1
_2016-08-20_ 

- 增加本地存储校对，每次打开页面时，清除已失效的文档存储
- 修复在atom中二级目录文档按f12在浏览器中打开时，没有导航栏高亮的问题
- 修复在atom某些情况下按F12打开文档报错的问题
- 允许library直接目录下存在以点号开头的额外文件夹，不做语法与文档检查，例如.git
- 部分介绍文案更新

### v0.6.0
_2016-08-15_ 

- 创建本地存储模块
- 分离文档加载渲染为独立文档模块
- 分离部分独立性功能为工具模块
- 调整主执行模块结构功能，打通多个模块间相互协作，实现文档切换无刷新与立即显示
- 允许同域名下基于路径区分的多个本地存储库
- 使用jsDoc语法改写部分注释
- 部分文件改名

---

### v0.5.7
- 紧急修复0.5.6升级后创建wiki报错问题

### v0.5.6
- 调整 Testing.js 模块结构，允许不刷下页面重新抓取内容生成新接口测试
- 删除低版本 IE 下 forEach 方法缺失的修补（由于不再支持微软原生浏览器IE8）
- 调整部分标签为 HTML5 标签（由于不再支持微软原生浏览器IE8）
- 底部增加 Powered by amWiki 签名

### v0.5.5
- 紧急修复0.5.4升级后创建wiki报错问题

### v0.5.4
- 替换 jQuery-1.11 为 jQuery-compat-3.1.0 版 ([#6](https://github.com/TevinLi/amWiki/issues/6 "#6"))
- 增加低版本浏览器检查，不兼容 jQuery-compat-3.x 的浏览器将给出警告
- 增加测试面板进出动画
- 增加导航栏展开折叠动画

### v0.5.3
- web端文档区元素间距微调，加大标题识别性
- 文件名报错提示

### v0.5.2
- 修复0.5.0升级后，一键创建wiki报错问题

### v0.5.1
- 修复0.5.0升级后首次启动atom报错的问题
- web端Ajax测试，允许在测试面板上修改请求地址和请求类型
- web端ajax测试，增加发送ajax时的loading图标
- web端ajax测试，允许文档带http头定义接口地址，强化跨域提示

### v0.5.0
- 再次重构自动工作模块，放弃多层文件监听方案，改用操作监听
- 注册重命名、增加文件或文件夹、删除、粘帖、拖拽等操作监听，当文库有目录树有变化时更新导航
- 增加两项 Atom Setting 可修改参数，用于配置两种导航更新的条件

---

### 0.4.3
- 更改amWiki菜单位置，独立栏位操作更便捷
- 更加严格要求排序id命名，且当命名错误时提示

### 0.4.2
- 增加重复的排序id检查，id重复弹窗提示

### 0.4.1
- Web端导航增加二级目录支持

### 0.4.0
- 重构文件监听系统，基于监听的自动化工作，模块重新划，职能分更清晰
- 新增解析文库文件模块，输出两种数据：一维文件夹列表用于监听，树形目录结构用于生成导航
- 改用Atom文件夹监听API
- 监听三层文件夹深度
- 取消临时暂停监听功能

---

### 0.3.3
- 放宽排序id的命名条件，允许使用整数或浮点数，且位数不限
- 调整打印样式，字体在不影响阅读前提下全面变细
- 修复0.3.2文件拆分改名带来的报错

### 0.3.2
- 打印样式标题减小字号且增加自增序号
- 打印样式强制指定需要使用背景色
- css文件按功能拆分
- 更改一键创建目录快捷键为`Ctrl+D`

### 0.3.1
- 各工作模块调用从main.js分离
- 修复0.3.0创建文库报错bug
- 修复本地服务器接收url-gbk转码问题

### 0.3.0
- 添加本地服务器，默认不启动
- 添加F12直接呼起浏览器打开当前文档的快捷键
- 增加换色模式，在config.json中使用`colour`属性可自定义颜色

---

### 0.2.10
- 增加网页打印样式
- 调整显示，加大H2与H3区别，改变tbody文字断行方式
- 模板测试部分分离为独立模板
- 页面所用图标改用svg渲染
- 接口测试面板响应结构增加http错误状态提示

### 0.2.9
（此版本已取消）

### 0.2.8
- 增加config.json解析失败时弹出文字提示 ([#2](https://github.com/TevinLi/amWiki/issues/2 "#2"))
- 增加接口测试http报错时返回结果json检测，json则格式化
- 修复接口测试面板响应内容被html转码的问题

### 0.2.7
- 重构Testing.js代码
- 修复接口测试无参数时调用全局参数报错问题

### 0.2.6
- 增加启用/禁用全局参数的控制按钮，可临时停用全局参数
- 增加接口测试面板响应耗时提示
- 更新api示范文档

### 0.2.5
- 显示调整，增加一些色彩修饰 ([#1](https://github.com/TevinLi/amWiki/issues/1 "#1"))
- atom编辑器中粘帖截图时，改用非中文地址
- 修复测试面板响应内容json不换行超出屏幕问题
- 修复测试面板响应内容json格式化格式化时，遇时分秒漫号时意外换行的bug

### 0.2.4
- 支持json格式化
- 增加跨域报错提示

### 0.2.3
- 补上模板遗漏的元素id

### 0.2.2
- 增加接口测试全局参数模式，所有接口都将带上全局参数
- 修复接口测试响应内容会撑坏页面的问题，更改为iframe填充的方式
- 增加接口测试功能介绍文案

### 0.2.1
- 开启接口简单Ajax测试
- 开启流程图flow语法支持

### 0.2.0
（此版本已取消）

---

### 0.1.14
- 继续优化中文路径，开启ajax中文路径uft8/gbk自动切换  
（因为windows文件夹名使用gbk编码，而linux文件夹名使用utf8编码）

### 0.1.13
- 优化中文路径问题

### 0.1.12
- 导航文件改名为`$navigation.md`
- 增加自定logo功能，在config.json中使用`logo`属性配置logo图片路径
- 调整一些介绍文案

### 0.1.11
（此版本已取消）

### 0.1.10
- 增加amWiki的logo设计
- 增加隐藏javascript代码段注释的功能
- 去除多余github样式
- 重写markdown入门教程文档
- 增加语法高亮、atom对markdown的支持两篇文档
- 更改默认首页内容

### 0.1.9
- 增加超长文档与页内目录示范

### 0.1.8
- 修复未正确解除监听的问题

### 0.1.7
- 重新建设自动更新导航文件

### 0.1.6
- 修复版本回退造成的一些问题，恢复自动更新导航功能
- 增加区别对待：普通代码片段 与 指定类型语法高亮片段
- 完善页内目录hash跳转
- 修改展开折叠按钮位置

### 0.1.5
- 增加页内目录生成功能

### 0.1.4
（此版本已取消）

### 0.1.3
- 更改hash跳转为url跳转
- 优化一些页面显示的问题
- 更改atom菜单配置
- 增加api示范文档

### 0.1.2
- 修改文案

### 0.1.0 - 0.1.1
（此版本已取消）

---

### 0.0.4
- 增加library文件夹与文件监视，增加导航文件自动更新功能
- 修改readme介绍文案
- 版本号回跳

### 0.0.3
- 修改文案
- 补文件遗漏

### 0.0.2
- 改名为amWiki
- 修复中文路径访问问题
- 修复图片复制bug

### 0.0.1
- aWiki初版方案发布
