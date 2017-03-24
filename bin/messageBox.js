/**
 * messageBox
 * @desc 命令行模拟浏览器 alert、confirm、prompt 交互信息框
 * @notice 此三个方法只是模拟，其执行时不会像浏览器端一样冻结后续js执行
 * @author Tevin
 */

//模拟消息框
const alert = (msg) => {
    msg = typeof msg !== 'string' ? String(msg) : msg;
    process.stdout.write(msg + '\n')
};

//模拟确认框，回调传参为用户选择的布尔值
const confirm = (msg, callback) => {
    msg = typeof msg !== 'string' ? String(msg) : msg;
    process.stdout.write(msg + '(y/n) ');
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        let chunk = process.stdin.read();
        if (chunk !== null) {
            process.stdin.end();
            chunk = chunk.replace(/[\n\r\u0004]*$/, '');
            if (/^(y|yes|ok)$/i.test(chunk)) {
                callback && callback(true);
            } else {
                callback && callback(false);
            }
        }
    });
};

//模拟输入框，回调传参为用户输入的字符串
const prompt = (msg, callback) => {
    msg = typeof msg !== 'string' ? String(msg) : msg;
    process.stdout.write(msg + ' ');
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        let chunk = process.stdin.read();
        if (chunk !== null) {
            process.stdin.end();
            chunk = chunk.replace(/[\n\r\u0004]*$/, '');
            callback && callback(chunk);
        }
    });
};

module.exports = {
    alert: alert,
    confirm: confirm,
    prompt: prompt
};