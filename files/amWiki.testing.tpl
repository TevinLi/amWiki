<!-- 接口测试面板 -->
<div class="testing-box" id="testingBox">
    <h2>请求内容</h2>
    <div class="testing-send">
        <input class="testing-send-url" id="testingSendUrl" type="text" title="请求地址" />
        <select class="testing-send-type" id="testingSendType" title="请求类型">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
        </select>
        <h3>参数列表：</h3>
        <ul class="testing-params" id="testingParam"></ul>
        <script id="template:formList" type="text/html">
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
                    <script id="template:globalParam" type="text/html">
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
    <h2>响应内容<small id="testingDuration"></small>
        <svg id="testingLoading">
            <use xlink:href="#icon:loading"></use>
        </svg>
    </h2>
    <div class="testing-response">
        <iframe id="testingResponse" width="100%" frameborder="0" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="yes" framespacing="0"></iframe>
    </div>
</div>