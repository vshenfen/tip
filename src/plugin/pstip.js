/**
 * @file v身份浮层
 * @author duanlixin(duanlixin@baidu.com)
 */

define( function(require){

    /**
     * 由于不同环境中编码不同，因此浮层中的中文统一使用unicode
     * 浮层用到的中文转换后的unicode如下：
     */
    var yijingtonguo = '\u5df2\u7ecf\u901a\u8fc7';
    var baiduxinyuxingji = '\u767e\u5ea6\u4fe1\u8a89\u661f\u7ea7';
    var juyou = '\u5177\u6709';
    var baidushenfenrenzheng = '\u767e\u5ea6\u8eab\u4efd\u8ba4\u8bc1';
    var shoucang = '\u6536\u85cf';
    var pinglun = '\u8bc4\u8bba';
    var jubao = '\u4e3e\u62a5';
    var youhuiquanlianjie = '\u4f18\u60e0\u5238\u94fe\u63a5';



    // 模板TPL
    var TPL = {
        // a标签 链接模板
        a: ''
            + '<span#{billing}>'
            + '<a target="_blank"  href="#{url}" onmousedown="return c({'
            +     '\'title\':this.innerHTML,'
            +     '\'url\':this.href'
            +     ',#{options}'
            +     '});">'
            +     '#{text}'
            + '</a>'
            + '</span>',

        // 标题模板
        title : '<strong class="ecl-ui-tip-ps-title">#{title}</strong>',

        // 右侧链接
        rightTop: ''
            +'<div class="ecl-ui-tip-ps-right ecl-ui-tip-ps-right-top">'
            +     '#{favorite}'
            +     '#{and}'
            +     '#{appraise}'
            + '</div>',

        // 浮层列表模板
        list : '<ul>#{medical}#{airline}#{dfa}#{identity}#{personal}</ul>',

        // 医疗模板
        medical : '<li class="icon-medical"><span>#{text}</span></li>',

        // 加V模板
        identity : ''
            + '<li class="icon-identity">'
            + yijingtonguo
            +     '#{text}#{a}'
            +'</li>'
            + '#{creditblock}',

        // 个人商家模板
        personal : ''
            + '<li class="icon-empty">'
            +    '<img '// alt="个人商家"
            +    'height=16 width=16 '//title="个人商家"
            +    'src="#{img}">'
            +    yijingtonguo
            +    '#{text}#{a}'
            +'</li>#{creditblock}',

        // 百度信誉星级模板
        creditblock : ''
            + '<li class="icon-empty">'
            +    '<div class="ecl-ui-tip-ps-level '
            +    'ecl-ui-tip-ps-level#{credit}">'
            +    baiduxinyuxingji
            +    '</div>'
            + '</li>',

        // 航协模板
        airline : ''
            + '<li class="icon-empty">'
            + '<img height=16 ' //alt="行业认证" title="行业认证"
            + 'width=16 src="#{img}">'
            + juyou
            + '#{a}的#{text}</li>',

        // 药监局模板
        dfa : ''
            + '<li class="icon-empty">'
            +    '<img '//  alt="商家权益保障"
            +    'height=16 width=16 '// title="商家权益保障"
            +    'src="#{img}">'
            +    '#{text}'
            + '</li>',

        // 举报模板
        rightBottom : ''
            + '<div class="ecl-ui-tip-ps-right ecl-ui-tip-ps-right-bottom">'
            +    '#{report}'
            + '</div>'
    };

    // 浮层默认配置数据
    var conf = {
        // 自动绑定本控件功能的class
        triggers: 'ec-ui-tip',
        // 当浮层是居中显示时，左侧若要限制位置(im情况下)，则传入domId
        leftLimiteDomId: 'ec_im_container',
        // bl 浮层水平偏移
        layerOffsetLeft: 5,
        // bl和bc,浮层垂直偏移
        layerOffsetTop: 5,
        // 浮层消失延迟
        hideDelay: 500
    };

    // 汉字转unicode
    function unicode(value) {

        var preStr = '\\u';
        var value = baidu.string.trim(value);
        var cnReg = /[\u0391-\uFFE5]/gm;

        if(cnReg.test(value)) {

            var ret = value.replace(cnReg, function(str) {

                return preStr + str.charCodeAt(0).toString(16);

            });
        }
    }

    var sendLogUrl = '';

    // 发日志方法，摘自zxui
    var send = (function () {
        var list = [];
        var encode = function (value) {
            return encodeURIComponent(value);
        };

        return function (data) {
            var index = list.push(new Image()) - 1;

            list[index].onload = list[index].onerror = function () {
                list[index] = list[index].onload = list[index].onerror = null;
                delete list[index];
            };

            var url = sendLogUrl + '?' + baidu.url.jsonToQuery(data, encode);
            list[index].src = url;
        };
    })();

    /**
     * 当显示浮层是bc时，修正浮层以及箭头的位置，使浮层左侧边缘与外层容器一致
     *
     * @param {[type]} arrow 小箭头dom元素
     * @param {[type]} layer 浮层dom元素
     */
    function resetPositionBc(arrow, layer) {
        // 浮层left
        var mainLeft = parseInt(layer.main.style.left, 10);
        // 箭头left
        var arrowLeft = parseInt(layer.elements.arrow.style.left, 10);
        // 当浮层是居中显示时，左侧若要限制位置(im情况下)，则传入domId
        var leftLimiteDom = baidu.g(conf.leftLimiteDomId);
        // 计算dom节点的left，若left不存在，则等于浮层的left
        var limiteLeft = leftLimiteDom ?
            parseInt(baidu.dom.getPosition(leftLimiteDom).left, 10) : mainLeft;

        // 修正浮层left
        layer.main.style.left = limiteLeft + 'px';
        // 修正小箭头left
        layer.elements.arrow.style.left = mainLeft +
            arrowLeft - limiteLeft + 'px';
    }

    /**
     * 当显示浮层是bl时，修正浮层以及箭头的位置，调整水平偏移
     *
     * @param {[type]} arrow 小箭头dom元素
     * @param {[type]} layer 浮层dom元素
     */
    function resetPositionBl(arrow, layer) {
        // 浮层left
        var mainLeft = parseInt(layer.main.style.left, 10);
        // 浮层整体水平偏移
        var layerOffsetLeft = conf.layerOffsetLeft || 0;

        // 修正浮层left
        layer.main.style.left = mainLeft - layerOffsetLeft + 'px';
        // 修正小箭头left
        layer.elements.arrow.style.left = layerOffsetLeft + 'px';
    }

    /**
     * 当显示浮层是br时，修正浮层以及箭头的位置，调整水平偏移
     *
     * @param {[type]} arrow 小箭头dom元素
     * @param {[type]} layer 浮层dom元素
     */
    function resetPositionBr(arrow, layer) {
        // 浮层left
        var mainLeft = parseInt(layer.main.style.left, 10);
        // 浮层整体水平偏移
        var layerOffsetLeft = conf.layerOffsetLeft || 0;
        // 箭头left
        var arrowLeft = parseInt(layer.elements.arrow.style.left, 10);

        // 修正浮层left
        layer.main.style.left = mainLeft + layerOffsetLeft + 'px';
        // 修正小箭头left
        layer.elements.arrow.style.left = arrowLeft - layerOffsetLeft + 'px';

    }

    /**
     * 显示浮层时，发送日志
     *
     * @param {[type]} logType 日志类型：
     * v身份： identity
     */
    function sendLog(logType) {

        // 从浮层配置中读取发送日志地址以及发送参数
        var statistics = conf.statistics;

        if(statistics && statistics[logType] && statistics[logType]['url']) {

            // 若是大搜索页面，需添加 searchId ，如下qid即为 searchId
            var bds = window.bds || {};
            var qid = '';
            if (bds && bds.comm && bds.comm.qid) {
                qid = bds.comm.qid;
            }
            /**
             * 日志约定必选参数有，searchId，当前页面的url，时间戳
             * @type {Object}
             */
            var query = {
                qid: qid,
                url: window.document.location.href,
                timestamp: +new Date()
            };

            // 获取发送日志地址
            sendLogUrl = statistics[logType]['url'];

            // 合并对应日志类型的下可选参数
            baidu.object.extend(query, statistics[logType]['query'] || {});

            // 发送日志
            send(query);
        }
    }

    /**
     * 显示浮层，修正小箭头和浮层位置以及发送日志
     *
     * @param {[type]} arrow 小箭头dom元素
     * @param {[type]} layer 浮层dom元素
     */
    function onShow(arrow, layer) {

        // 浮层出现位置，默认左对齐
        var dir = 'bl';

        // 获取dom中 data-tooltips 属性
        var dataTools = arrow.target.getAttribute('data-tooltips');

        // 判断 data-tooltips 属性 是否正确
        if(dataTools) {
            dir = /[trblc]{2}/.test(dataTools) ? dataTools : '1';
        }

        // 当显示浮层是bc时，修正浮层以及箭头的位置
        if('bc' === dir) {
            resetPositionBc(arrow, layer);
        }

        // 当显示浮层是bl时，修正浮层以及箭头的位置
        if('bl' === dir) {
            resetPositionBl(arrow, layer);
        }

        // 当显示浮层是br时，修正浮层以及箭头的位置
        if('br' === dir) {
            resetPositionBr(arrow, layer);
        }

        // v身份浮层，发送日志
        if( baidu.dom.hasClass(arrow.target, 'icon-certify') ||
            baidu.dom.hasClass(arrow.target, 'icon-personal')) {
            sendLog('identity');
        }

    }

    //
    /**
     * 显示浮层前，拼装html
     *
     * @param {[type]} arrow 小箭头dom元素
     * @param {[type]} layer 浮层dom元素
     */
    function onBeforeShow(arrow, layer) {

        // 标题html
        var title = '';
        // 内容html
        var content = '';

        var arrowDom = arrow.target;
        // 给浮层添加class ecl-ui-tip-ps 重定义样式
        baidu.dom.addClass(layer.main, 'ecl-ui-tip-ps');

        // 左侧浮层不限制宽度，去掉ecl-ui-tip-ps-limite-width类
        // 右侧浮层限制宽度，添加ecl-ui-tip-ps-limite-width类
        baidu.dom[
            'true' === arrow.target.getAttribute('data-tip-limite')
                ? 'addClass' : 'removeClass'
        ](layer.main, 'ecl-ui-tip-ps-limite-width');

        // 从dom属性中获取v身份浮层数据
        var authJson = getDataFromAttr(arrowDom, 'data-renzheng');

        // 构造v身份浮层html
        if(authJson) {
            title = authTitleHtml(authJson);
            content = authBodyHtml(authJson);
        }

        layer.title = title;
        layer.content = content;
    }

    /**
     * 格式化链接数据
     *
     * @param {[type]} obj 链接数据
     * @param {[type]} text 链接文本
     * @return {[type]} 返回拼装好的html
     */
    function dataFormatForA(obj, text) {

        // 格式后数据
        var formatObj = {};
        // 返回的html
        var html = '';

        if(obj) {

            // 链接中自定义的属性数据
            var optionArray = [];
            for(var key in obj) {
                // 过滤billing、url、text为key的数据
                if('billing' === key || 'url' === key || 'text' === key) {
                    continue;
                }
                optionArray.push(
                    ''
                    + '\''
                    + key
                    + '\''
                    + ':'
                    + '\''
                    + obj[key]
                    + '\''
                );

            }
            formatObj = {
                // 若需要计费，则给外层span增加class为EC_PP
                billing: obj.billing && ' class="EC_PP"',
                // 链接的url
                url: obj.url,
                // 链接的文本
                text: obj.text || text,
                // 链接中自定义的属性数据
                options: optionArray.join(',')
            };
            html = format('a', formatObj);
        }
        return html;
    }

    // 根据数据，渲染模板
    function format(type, obj) {
        obj = obj || {};
        return baidu.format(TPL[type], obj);
    }

    /**
     * 格式化新样式数据
     *
     * @param {[type]} type 新样式类型
     * @param {[type]} obj 新样式数据
     * @return {[type]} 返回拼装好的html
     */
    function dataForamtForRow(type, obj) {
        var html = '';
        if(obj) {
            // 格式化链接数据
            var aHtml = dataFormatForA(obj.a, baidushenfenrenzheng);
            // 格式化信誉等级数据
            var creditblock = format('creditblock', {credit: obj.credit});
            html = format(type, {
                text: obj.text,
                a: aHtml,
                creditblock: creditblock,
                img: obj.img
            });
        }
        // 返回拼装好的html
        return html;
    }

    /**
     * v身份标题html
     *
     * @param {[type]} json v身份数据
     * @return {[type]} 返回拼装好的标题html
     */
    function authTitleHtml(json) {
        var title = format('title', {title: json.title});

        // 收藏html
        var favorite = dataFormatForA(json.favorite, shoucang);
        // 评价html
        var appraise = dataFormatForA(json.appraise, pinglun);

        // 收藏和评价的外围容器
        var topRight = format(
            'rightTop',
            {
                favorite: favorite,
                appraise: appraise,
                and: (favorite && appraise) && '&nbsp|&nbsp'
            }
        );

        var titleHTML = '' + title + topRight;
        return titleHTML;

    }

    /**
     * v身份新样式html
     *
     * @param {[type]} json v身份数据
     * @return {[type]} 返回拼装好的标题html
     */
    function authBodyHtml(json) {

        // 医疗 html
        var medical = dataForamtForRow('medical' ,json.medical);
        // 企业加v html
        var identity = dataForamtForRow('identity',json.identity);
        // 个人加v html
        var personal = dataForamtForRow('personal',json.personal);
        // 航协 html
        var airline = dataForamtForRow('airline', json.airline);
        // 药监局 html
        var dfa = dataForamtForRow('dfa',json.dfa);

        // 所有新样式，有则显示，没有不显示
        var list = format(
            'list',
            {
                medical: medical,
                identity:identity,
                airline: airline,
                dfa: dfa,
                personal: personal
            });

        // 举报 html
        var report = dataFormatForA(json.report, jubao);

        // 举报的外围容器
        var topBottom = format('rightBottom', {report: report});

        var contentHTML = '' + list + topBottom;

        return contentHTML;
    }

    /**
     * 获取元素指定属性的值，并返回json格式
     *
     * @param {[type]} ele dom元素
     * @param {[type]} type dom元素的指定属性
     * @return {[type]} 指定属性值的json对象
     */
    function getDataFromAttr(ele, type) {
        // 获取元素指定属性的值
        var attr = ele.getAttribute(type);
        // 返回json对象
        return attr && baidu.json.parse(attr);
    }

    /**
     * 载入指定url的css文件
     *
     * @param {[type]} url css文件地址
     */
    function loadCss(url) {
        var link = document.createElement( 'link' );
        link.setAttribute( 'rel', 'stylesheet' );
        link.setAttribute( 'type', 'text/css' );
        link.setAttribute( 'href', url );

        var parent = document.getElementsByTagName( 'head' )[ 0 ] ||
            document.body;
        parent.appendChild( link );

        parent = null;
        link = null;
    }

    // 仅执行一次
    //var tipControl;


    function init(opts) {


            baidu.dom.ready(function() {

                // 增加判断，避免同一页面引入多个浮层
                //if(!tipControl) {
                if (true) {

                // 引入tip所需的css
                var url = 'http://s1.bdstatic.com/r/www/cache/biz/ecom/common/api/tip0725/tipapi.css';

                loadCss(url);

                // 合并用户配置与默认配置
                baidu.object.extend(conf, opts || {});

                // 引入tip组件
                // var Tip = require('./tip');

                // 线上，抽出公共部分，引入pstiplib组件
                /**
                var Tip = require('ecom/common/api/pstiplib0902/pstiplib');
                    tipControl = new Tip({
                        // 浮层的显示模式，鼠标滑过显示
                        mode: 'over',
                        // 自动绑定本控件功能的class
                        triggers: conf.triggers,
                        // 默认显示箭头左对齐
                        arrow: 'bl',
                        // 浮层消失的延迟时间
                        hideDelay: conf.hideDelay,
                        // x 轴和 y 轴方向偏移量
                        offset: {
                            x: conf.layerOffsetLeft,
                            y: conf.layerOffsetTop
                        },

                        onShow: function(obj) {
                            onShow(obj, this);
                        },

                        onBeforeShow: function (obj) {

                            onBeforeShow(obj, this);
                        }
                    }).render();
                */
                }
                var Tip = require('../tip/main').create();
                Tip.addTriggers({
                    mode: 'over',
                    arrow: '1',
                    clazz: 'efc-cert',
                    onShow: function(obj) {
                        onShow(obj, this);
                    },
                    onBeforeShow: function (obj) {
                        onBeforeShow(obj, this);
                    }
                });
            });

    }
    init();
    // return模块
    return {init: init};
});
