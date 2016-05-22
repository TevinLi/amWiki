<!DOCTYPE html>
<html>

	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="renderer" content="webkit">
		<title>{{name}}</title>
		<link rel="stylesheet" type="text/css" href="amWiki/css/markdownbody.github.css" />
		<link rel="stylesheet" type="text/css" href="amWiki/css/lhjs.github-gist.css" />
		<link rel="stylesheet" type="text/css" href="amWiki/css/amWiki.css" />
	</head>

	<body>
		<!-- 头部 -->
		<div class="header">
			<div class="header-inner">
				<a class="logo" href="?file=首页">
					<img src="{{logo}}" />
					<b>{{name}}</b>
					<span>{{version}}</span>
				</a>

				<div class="menu_icon"><span class="menu_icon_start" style="display:none"></span><span class="close_icon" style="display:none"></span>
				</div>
			</div>
		</div>
		<!-- 页面 -->
		<div class="container">
			<div class="nav">
				<div class="menu-filter">
					<input type="text" id="menuFilter" value="" placeholder="请输入筛选条件" title="请输入筛选条件" />
					<i class="off" title="清空筛选">&times;</i>
				</div>
				<div class="menubar" id="menuBar"></div>
			</div>
			<div class="main" id="main">
				<div class="markdown-body" id="view"></div>
				<!-- 接口测试面板 -->
				<div class="testing-box" id="testingBox">
					<h2 class="testing-title">请求内容</h2>
					<div class="testing-send">
						<input class="testing-send-url" id="testingSendUrl" type="text" title="请求地址" />
						<select class="testing-send-type" id="testingSendType" title="请求类型">
		                    <option value="GET">GET</option>
		                    <option value="POST">POST</option>
		                </select>
						<h3>参数列表：</h3>
						<ul class="testing-params" id="testingParam"></ul>
						<script id="templateFormList" type="text/html">
							<li>
								<span>{{describe}}</span>
								<input class="testing-param-key" type="text" value="{{keyName}}" placeholder="参数名" title="参数名" />&nbsp;&nbsp;
								<input class="testing-param-val" type="text" value="{{default}}" placeholder="请输入参数值 ({{valueType}})" {{required}}/>
								<big>*</big>
							</li>
						</script>
						<div class="testing-btn">
							<button class="testing-btn-send" id="testingBtnSend">发送Ajax</button> &nbsp;|&nbsp;
							<button id="testingBtnAdd">增加参数</button>
							<button id="testingBtnReset">重置参数值</button>
						</div>
						<div class="testing-btn2">
							<hr>
							<div class="testing-btn-param" id="testingBtnGParam" title="全局参数将影响所有接口">[<span>全局参数设置</span>]</div>
							<!-- 全局参数弹窗 -->
							<div class="testing-global" id="testingGlobal">
								<div class="testing-global-param"><i class="close">&times;</i>
									<h4>全局参数列表<small>(全局参数影响所有接口)</small></h4>
									<ul id="testingGlobalParam"></ul>
									<script id="templateGlobalParam" type="text/html">
										<li><i>&times;</i> 描述：
											<input type="text" placeholder="describe" value="{{describe}}"><br> 参数名：
											<input type="text" placeholder="key-name" value="{{keyName}}"><br> 参数值：
											<input type="text" placeholder="value" value="{{value}}">
										</li>
									</script>
									<div class="btn">
										<div class="testing-global-working" id="testingGlobalWorking" title="禁用/启用全局变量"><i></i><span>启用中</span><span>已禁用</span></div>
										<button class="add">增加</button> &#12288;|&#12288;
										<button class="save">保 存</button>
									</div>
								</div>
							</div>
						</div>
					</div>
					<h2 class="testing-title">响应内容
		                <small id="testingDuration"></small>
		            </h2>
					<div class="testing-response">
						<iframe id="testingResponse" width="100%" frameborder="0" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="yes" framespacing="0"></iframe>
					</div>
				</div>
			</div>
		</div>
		<!-- 返回顶部 -->
		<div class="back-top">
			<a href="#" class="back-icon"></a>
			<a href="#" class="back-text">返回顶部</a>
		</div>
		<!-- js -->
		<script type="text/javascript" src="amWiki/js/forEach.js"></script>
		<script type="text/javascript" src="amWiki/js/gbk.js"></script>
		<script type="text/javascript" src="amWiki/js/jquery-1.11.3.min.js"></script>
		<script type="text/javascript" src="amWiki/js/marked.min.js"></script>
		<script type="text/javascript" src="amWiki/js/highlight.min.js"></script>
		<script type="text/javascript" src="amWiki/js/raphael-min.js"></script>
		<script type="text/javascript" src="amWiki/js/flowchart.min.js"></script>
		{{amWiki-testing.js}}
		<script type="text/javascript" src="amWiki/js/amWiki.js"></script>
	</body>

</html>