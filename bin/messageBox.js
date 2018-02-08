/**
 * 工作端 - 终端(命令行) - 模拟浏览器 alert、confirm、prompt 方法进行信息交互
 * @author Tevin
 *
 * @example
 *   co(function* () {
 *     const c = yield confirm2('测试confirm2');
 *     console.log(c);
 *     const p = yield prompt2('测试prompt2');
 *     console.log(p);
 *     process.stdin.end();
 *   });
 *
 */

/**
 * 模拟消息框
 * @param {String} msg
 */
const alert = (msg) => {
    msg = typeof msg !== 'string' ? String(msg) : msg;
    process.stdout.write(msg + '\n')
};

/**
 * 模拟确认框，回调传参为用户选择的布尔值
 * @param {String} msg
 * @returns {Promise}
 */
const confirm2 = (msg) => {
    return new Promise((resolve, reject) => {
        msg = typeof msg !== 'string' ? String(msg) : msg;
        let readStdin = () => {
            let chunk = process.stdin.read();
            if (chunk !== null) {
                chunk = chunk.replace(/[\n\r\u0004]*$/, '');
                if (/^(y|yes|ok)$/i.test(chunk)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                readStdin = null;
            }
        };
        process.stdout.write(msg + '(y/n) ');
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            readStdin && readStdin();
        });
    });
};

/**
 * 模拟输入框，回调传参为用户输入的字符串
 * @param {String} msg
 * @returns {Promise}
 */
const prompt2 = (msg) => {
    return new Promise((resolve, reject) => {
        msg = typeof msg !== 'string' ? String(msg) : msg;
        let readStdin = () => {
            let chunk = process.stdin.read();
            if (chunk !== null) {
                chunk = chunk.replace(/[\n\r\u0004]*$/, '');
                resolve(chunk);
                readStdin = null;
            }
        };
        process.stdout.write(msg + ' ');
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            readStdin && readStdin();
        });
    });
};

const messageBox = (function () {
    return {
        alert: alert,
        confirm2: confirm2,
        prompt2: prompt2
    };
})();

module.exports = messageBox;