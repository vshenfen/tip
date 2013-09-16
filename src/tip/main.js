/**
 * @file 单例的tip控制器
 * @author denghongqi(denghongqi@baidu.com)
 */

define(function(require) {
    var Tip = require('./Tip');
    var instance;

    var exports = {
        /**
         * 创建Tip实例，若当前已存在Tip实例，则直接返回已存在的实例 
         *
         * @public
         * @param {Object} options
         * @param {boolean} options.disabled 控件的不可用状态
         * @param {(string | HTMLElement)} options.main 控件渲染容器
         * @param {string} options.prefix 控件class前缀，同时将作为main的class之一
         * @param {string} options.flag 标识作为trigger的class
         * @param {string} options.triggers 自动绑定本控件功能的触发器
         * @param {string} options.tpl 浮层内部HTML模板
         * @return {Object} tip实例
         */
        create: function (options) {
            var options = options || {};
            if (!instance) {
                instance = new Tip(options).render();
            }

            return instance;
        },

        /**
         * 获取tip实例，若当前不存在tip实例，则以默认配置创建一个实例并返回
         *
         * @return {Object}
         */
        get: function () {
            return this.create();
        }
    };
    
    return exports;
});
