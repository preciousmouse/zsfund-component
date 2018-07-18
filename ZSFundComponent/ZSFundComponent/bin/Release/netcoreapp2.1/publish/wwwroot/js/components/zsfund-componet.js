var _this = this;
/**
 * Api请求帮助类
 */
var AjaxHelper = /** @class */ (function () {
    function AjaxHelper() {
    }
    /**
     * 基础请求
     * @param url 地址
     * @param param 参数
     * @param callbackfunc 成功回调函数
     * @param showProgressBar 是否显示ProgressBar
     */
    AjaxHelper.prototype.RequestData = function (url, param, callbackfunc) {
        var _this = this;
        if (callbackfunc === void 0) { callbackfunc = null; }
        $.get(this.AddRandom(url + "?" + encodeURI(param)), function (data, status) {
            if (status != "success") {
                alert(status);
                return;
            }
            if (data.errorString != null) {
                alert(data.errorString);
                return;
            }
            if (callbackfunc != null) {
                callbackfunc.call(_this, data);
                return;
            }
        }).fail(function (data) {
            alert("网络错误，请联系系统管理员");
        });
    };
    AjaxHelper.prototype.PostData = function (url, data, callbackfunc) {
        if (callbackfunc === void 0) { callbackfunc = null; }
        $.post(url, data, function (data, status) {
            if (status != "success") {
                alert(status);
                return;
            }
            if (data.errorString != null) {
                alert(data.errorString);
                return;
            }
            if (callbackfunc != null) {
                callbackfunc(data);
                return;
            }
        }).fail(function (data) {
            alert("网络错误，请联系系统管理员");
        });
    };
    AjaxHelper.prototype.AddRandom = function (url) {
        return url + (url.indexOf("?") >= 0 ? "&" : "?") + this.GetRandom(1000);
    };
    AjaxHelper.prototype.GetRandom = function (n) {
        return Math.floor(Math.random() * n + 1);
    };
    return AjaxHelper;
}());
var baseUrl = 'http://component/';
//var baseUrl = '';
var ajaxHelper = new AjaxHelper();
Vue.component('zsfund-stock-select', {
    data: function () {
        return {
            stocks: [],
            selectStock: _this.stockCode,
            size: _this.size,
        };
    },
    props: ['stockCode', 'size'],
    template: "<el-select filterable remote clearable v-model=\"selectStock\" default-first-option=\"true\" :remote-method=\"findSecInSelect\" @change=\"change\" placeholder=\"\u80A1\u7968\u67E5\u8BE2\" v-bind:size=\"size\">\n        <el-option v-for=\"item in stocks\" :key=\"item.stockCode\" :label=\"item.stockName\" :value=\"item\" >\n            <span style=\"float: left\">{{ item.stockName }}</span>\n            <span style=\"float: right; color: #CC0033; font-size: 13px\">{{ item.stockCode+'.'+item.market }}</span>\n        </el-option>\n    </el-select>",
    methods: {
        findSecInSelect: function (query) {
            var _this = this;
            if (query !== '') {
                ajaxHelper.RequestData(baseUrl + "api/StockInfo/GetStockInfo", "queryStr=" + query, function (data) {
                    _this.stocks = data;
                });
            }
        },
        change: function (event) {
            this.selectStock = event.stockName;
            this.$emit('change', event);
            this.$emit('input', event.stockCode);
        }
    }
});
//# sourceMappingURL=zsfund-componet.js.map