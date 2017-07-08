/**
 * amWiki Web端 - 滚动条模块
 * @author Tevin
 */

;
(function (win, $) {

    'use strict';

    //定时检测内容高度作为补充
    var list = [];
    setInterval(function () {
        for (var i = 0, item; item = list[i]; i++) {
            item.checkHeightWidth();
        }
    }, 500);

    /**
     * 页面滚动
     * @param {Element} _this
     * @constructor
     */
    var Scroller = function (_this) {
        this.$e = {
            container: $(_this),    //主容器
            inner: null,            //正文内容
            barY: null,             //垂直滚动条外层
            boxY: null,             //垂直滚动条
            sliderY: null,          //垂直滑块
            barX: null,             //水平滚动条外层
            boxX: null,             //水平滚动条
            sliderX: null           //水平滑块
        };
        this._data = {
            xRolling: this.$e.container.attr('data-x-rolling') == 'true',
            maxTop: 0,              //最大top值
            barH: 0,                //滚动条高度
            sliderH: 0,             //滑块高度
            contentH: 0,            //内容高度
            containerH: 0,          //容器高度
            contentHLast: 0,        //上次内容高度
            barW: 0,                //滚动条宽度
            sliderW: 0,             //滑块宽度
            contentW: 0,            //内容宽度
            containerW: 0,          //容器宽度
            contentWLast: 0         //上次内容宽度
        };
        this._init();
    };

    /**
     * 初始化
     * @private
     */
    Scroller.prototype._init = function () {
        var that = this;
        var barHtml = '<div class="scrollbar scrollbar-y" onselectstart="return false"><div><i></i></div></div>';
        barHtml += this._data.xRolling ?
            '<div class="scrollbar scrollbar-x" onselectstart="return false"><div><i></i></div></div>' : '';
        this.$e.container.append(barHtml);
        //获取元素
        this.$e.barY = this.$e.container.find('.scrollbar-y');
        this.$e.boxY = this.$e.barY.children('div');
        this.$e.sliderY = this.$e.barY.find('i');
        if (this._data.xRolling) {
            this.$e.barX = this.$e.container.find('.scrollbar-x');
            this.$e.boxX = this.$e.barX.children('div');
            this.$e.sliderX = this.$e.barX.find('i');
        }
        this.$e.inner = this.$e.container.children('.scroller-inner');
        //绑定事件
        this._onWinResize();
        $(win).on('resize', function () {
            that._onWinResize();
            that.checkHeightWidth();
        });
        this.$e.container.on('scrollbar', function () {
            that.checkHeightWidth();
        });
        this.$e.inner.on({
            'click': function () {
                that.checkHeightWidth();
            },
            'scroll': function () {
                that._reScroll();
            }
        });
        this.checkHeightWidth();
        this._bindAction();
    };

    /**
     * 滑块操作
     * @private
     */
    Scroller.prototype._bindAction = function () {
        var that = this;
        var onDrag = false;
        var _y = 0,
            top = 0,
            _x = 0,
            left = 0;
        this.$e.body = $('body');
        this.$e.boxY.on({
            'mousedown': function (e) {
                onDrag = 'y';
                that.$e.body.attr('onselectstart', 'return false');
                that.$e.barY.addClass('active');
                _y = e.pageY;
                top = parseFloat(that.$e.sliderY.css('top'));
                if (that.$e.barY.parents('#main').length > 0) {
                    that.$e.body.children('aside').hide();
                }
            }
        });
        if (this._data.xRolling) {
            this.$e.boxX.on({
                'mousedown': function (e) {
                    onDrag = 'x';
                    that.$e.body.attr('onselectstart', 'return false');
                    that.$e.barX.addClass('active');
                    _x = e.pageX;
                    left = parseFloat(that.$e.sliderX.css('left'));
                }
            });
        }
        $(win.document).on({
            'mousemove': function (e) {
                if (onDrag == 'y') {
                    that.scrollYTo(top + e.pageY - _y);
                } else if (onDrag == 'x') {
                    that.scrollXTo(left + e.pageX - _x);
                }
            },
            'mouseup': function () {
                that.$e.body.removeAttr('onselectstart', 'return false')
                    .children('aside').show();
                if (onDrag == 'y') {
                    that.$e.barY.removeClass('active');
                } else if (onDrag == 'x') {
                    that.$e.barX.removeClass('active');
                }
                onDrag = false;
            }
        });
    };

    /**
     * 尺寸缩放
     * @private
     */
    Scroller.prototype._onWinResize = function () {
        if (isMobi()) {
            this.$e.inner.removeAttr('style').removeClass('on');
        } else {
            this.$e.inner.css({
                width: this.$e.container.width() + 30,
                paddingRight: 13,
                paddingBottom: 16
            }).addClass('on');
        }
    };

    /**
     * 重设滑块大小
     * @private
     */
    Scroller.prototype._resize = function () {
        var that = this;
        this._data.containerH = this.$e.inner.height();
        //当内容高度小于等于容器时，不显示滚动条
        if (this._data.contentH <= this._data.containerH) {
            this._data.contentH = this._data.containerH;
            this.$e.barY.addClass('off');
        } else {
            this.$e.barY.removeClass('off');
        }
        //设置滑块大小
        this._data.barH = this.$e.boxY.height();
        this._data.sliderH = this._data.containerH / that._data.contentH * this._data.barH;
        this.$e.sliderY.height(this._data.sliderH);
        //计算最大高度
        this._data.maxTop = (this._data.barH - this._data.sliderH) / this._data.barH * this._data.contentH + 1;
        //水平方向
        if (this._data.xRolling) {
            this._data.containerW = this.$e.inner.width();
            //当内容宽度不超过容器时，不显示滚动条
            if (this._data.contentW <= this._data.containerW) {
                this._data.contentW = this._data.containerW;
                this.$e.barX.addClass('off');
            } else {
                this.$e.barX.removeClass('off');
            }
            //设置滑块大小
            this._data.barW = this.$e.boxX.width();
            this._data.sliderW = this._data.containerW / that._data.contentW * this._data.barW;
            this.$e.sliderX.width(this._data.sliderW);
        }
    };

    /**
     * 重设滑块顶部距离
     * @private
     */
    Scroller.prototype._reScroll = function () {
        var that = this;
        var top1 = this.$e.inner.scrollTop();
        var barTop = top1 / this._data.contentH * this._data.barH;
        //限制滑动边界 (由事件触发的滚动不会向上过界)
        if (barTop + this._data.sliderH >= this._data.barH) {
            barTop = this._data.barH - this._data.sliderH;
            this.$e.sliderY.css('top', barTop);
            this.$e.inner.scrollTop(this._data.maxTop);
        } else {
            this.$e.sliderY.css('top', barTop);
        }
        //水平方向
        if (this._data.xRolling) {
            var barLeft = this.$e.inner.scrollLeft() / this._data.contentW * this._data.barW;
            //水平方向没有鼠标滚动事件
            this.$e.sliderX.css('left', barLeft);
        }
    };

    /**
     * 垂直滚动到某位置
     * @param {Number} num
     * @public
     */
    Scroller.prototype.scrollYTo = function (num) {
        var barTop = num;
        barTop = barTop < 0 ? 0 : barTop;
        barTop = barTop + this._data.sliderH > this._data.barH ? this._data.barH - this._data.sliderH : barTop;
        this.$e.sliderY.css('top', barTop);
        this.$e.inner.scrollTop(barTop / this._data.barH * this._data.contentH);
    };

    /**
     * 水平滚动到某位置
     * @param {Number} num
     * @public
     */
    Scroller.prototype.scrollXTo = function (num) {
        var barLeft = num;
        barLeft = barLeft < 0 ? 0 : barLeft;
        barLeft = barLeft + this._data.sliderW > this._data.barW ? this._data.barW - this._data.sliderW : barLeft;
        this.$e.sliderX.css('left', barLeft);
        this.$e.inner.scrollLeft(barLeft / this._data.barW * this._data.contentW);
    };

    /**
     * 检查高度宽度
     * @public
     */
    Scroller.prototype.checkHeightWidth = function () {
        var that = this;
        this._data.contentH = 0;
        this._data.contentW = 0;
        this.$e.inner.children('.scroller-content').each(function () {
            that._data.contentH += $(this).outerHeight();
            that._data.contentW += $(this).outerWidth();
        });
        //修正 webkit 中滚动条本身占位
        if (/webkit/.test(navigator.userAgent.toLowerCase())) {
            that._data.contentH += 15;
        }
        //如果高度未改变不进行操作
        if (this._data.contentH == this._data.contentHLast && this._data.contentW == this._data.contentWLast) {
            return;
        } else {
            this._data.contentHLast = this._data.contentH;
            this._data.contentWLast = this._data.contentW;
        }
        this._resize();
        this._reScroll();
    };

    //注册到 jQuery
    $.extend($.fn, {
        scrollbar: function () {
            return this.each(function () {
                list.push(new Scroller(this));
            });
        }
    });

})(window, jQuery);