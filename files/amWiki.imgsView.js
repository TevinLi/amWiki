/**
 * amWiki Web端 - 图片查看模块
 * @author Tevin
 */

;(function (win, $) {

    'use strict';

    /**
     * 图片查看器
     * @param {Element} _this
     * @constructor
     */
    var ImgsView = function (_this) {
        this.$e = {
            container: $(_this),       //文档主容器
            imgList: null,             //页面图片列表
            imgsView: $('#imgsView'),  //图片弹窗层
            imgsViewInner: null,       //图片容器
            btnPrev: null,
            btnNext: null
        };
        this._data = {
            winW: 0,
            winH: 0,
            curIndex: -1
        };
        this._init();
    };

    /**
     * 初始化
     * @private
     */
    ImgsView.prototype._init = function () {
        var that = this;
        this.$e.imgsViewInner = this.$e.imgsView.find('#imgsViewInner');
        this.$e.btnPrev = this.$e.imgsView.find('.prev');
        this.$e.btnNext = this.$e.imgsView.find('.next');
        this._data.winW = $(win).width();
        this._data.winH = $(win).height();
        this.$e.container.on('click', function (e) {
            if (e.target.tagName.toLowerCase() == 'img') {
                //抓取图片列表
                that.$e.imgList = that.$e.container.find('img');
                that._data.curIndex = that.$e.imgList.index(e.target);
                that.open();
            }
        });
        this.$e.imgsView.children('.imgsv-background').on('click', function () {
            that.close();
        });
        this.$e.imgsView.find('.original').on('click', function () {
            that.resizeAs('org');
        });
        this.$e.imgsView.find('.suit').on('click', function () {
            that.resizeAs('suit');
        });
        this.$e.imgsView.find('.prev').on('click', function () {
            var $this = $(this);
            if (!$this.hasClass('off')) {
                that.playTo(that._data.curIndex - 1);
            }
        });
        this.$e.imgsView.find('.next').on('click', function () {
            var $this = $(this);
            if (!$this.hasClass('off')) {
                that.playTo(that._data.curIndex + 1);
            }
        });
    };

    /**
     * 显示图片浏览弹层
     * @public
     */
    ImgsView.prototype.open = function () {
        var that = this;
        this.playTo(this._data.curIndex);
        this.$e.imgsView.fadeIn(80);
        setTimeout(function () {
            that.$e.imgsView.addClass('on');
        }, 50);
    };

    /**
     * 关闭图片浏览弹层
     * @public
     */
    ImgsView.prototype.close = function () {
        var that = this;
        this.$e.imgsView.removeClass('on');
        setTimeout(function () {
            that.$e.imgsView.fadeOut(50);
        }, 200);
        that.$e.imgList = null;
        that._data.curIndex = -1;
    };

    /**
     * 切换图片
     * @param {Number} index
     * @public
     */
    ImgsView.prototype.playTo = function (index) {
        if (index == 0) {
            this.$e.btnPrev.addClass('off');
        } else {
            this.$e.btnPrev.removeClass('off');
        }
        if (index == this.$e.imgList.length - 1) {
            this.$e.btnNext.addClass('off');
        } else {
            this.$e.btnNext.removeClass('off');
        }
        this.$e.imgCur = this.$e.imgList.eq(index).clone().removeAttr('align');
        this.resizeAs('suit');
        this.$e.imgsViewInner.html(this.$e.imgCur);
        this._data.curIndex = index;
    };

    /**
     * 设置图片尺寸
     * @param {String} type - 尺寸模式：suit 适合 ／ org 原大小
     * @public
     */
    ImgsView.prototype.resizeAs = function (type) {
        if (type == 'suit') {
            this.$e.imgCur.removeAttr('width').removeAttr('height');
            if (this.$e.imgCur[0].naturalWidth > this._data.winW - 60) {
                this.$e.imgCur.css('max-width', this._data.winW - 60);
            }
            if (this.$e.imgCur[0].naturalHeight > this._data.winH - 60) {
                this.$e.imgCur.css('max-height', this._data.winH - 60);
            }
        } else if (type == 'org') {
            this.$e.imgCur.removeAttr('style');
            this.$e.imgCur.attr({
                'width': this.$e.imgCur[0].naturalWidth,
                'height': this.$e.imgCur[0].naturalHeight
            });
        }
    };

    //注册到 jQuery
    $.extend($.fn, {
        imgsView: function () {
            return this.each(function () {
                return new ImgsView(this);
            });
        }
    });

})(window, jQuery);