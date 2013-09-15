/**
 * @file 单例的tip控制器
 * @author denghongqi(denghongqi@baidu.com)
 */

define(function(require) {
    var Tip = require('./Tip');
    var instance;

    /**
     * 创建一个tip实例
     *
     * @return {Object}
     */
    function getInstance() {
        if (!instance) {
            instance = new Tip().render();
        }
        return instance;
    }

    /**
     * [Please input module description]
     */
    var exports = {
        add: function(trigger) {
            var tip = getInstance();
            tip.addTriggers(trigger);
        }
    };
    
    // return模块
    return exports;
});
