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
        var result = "";
        $.get({
            url: this.AddRandom(url + "?" + encodeURI(param)),
            //method: method,
            //async: async,
            cache: false,
            //contentType: method == "POST" ? "application/json-patch+json" : undefined,
            //data: JSON.stringify(data),
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                result = data;
                if (callbackfunc != null) {
                    callbackfunc.call(_this, data);
                    return;
                }
                return result;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                result = "error: " + errorThrown;
            }
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
Vue.component('zsfund-origination-tree', {
    data: function () {
        return {
            id: _this.id,
            nodes: [],
            selectNodes: "",
            //单选与多选两种情况下，selectNodes分别对应""和[]
            //会触发selectNodes的watch
            search: [],
            loading: false,
            props: {
                label: 'label',
                children: 'nodes',
                depth: 'depth',
                isLeaf: 'leaf',
                type: 'type',
                disabled: 'disable'
            }
        };
    },
    props: ['options', 'prevNodes'],
    template: "\n        <div>\n            <el-select v-model=\"selectNodes\" :multiple=\"options.multiple\" filterable remote placeholder=\"\u8F93\u5165\u5173\u952E\u5B57\" :style=\"{width:options.width+'px'}\"\n                :collapse-tags=\"options.collapseTags\" value-key=\"id\" :remote-method=\"getSearchResult\" :loading=\"loading\">\n                <el-option-group v-if=\"selectNodes!=undefined && selectNodes.length>0\" label=\"\u5DF2\u9009\u4E2D\">\n                    <el-option v-for=\"item in selectNodes\" :label=\"item.label\" :key=\"item.id\" :value=\"item\"></el-option>\n                </el-option-group>\n                <el-option-group label=\"\u641C\u7D22\u7ED3\u679C\">\n                    <el-option v-for=\"item in search\" :label=\"item.label\" :key=\"item.id\" :value=\"item\"></el-option>\n                </el-option-group>\n            </el-select>\n            <el-tree :props=\"props\" lazy :load=\"onload\" node-key=\"id\"  @node-click=\"onclick\"\n                    style=\"height:50vh;overflow-y:auto;margin-top:15px;\">\n                <span class=\"custom-tree-node\" slot-scope=\"{ node, data }\">\n                    <i v-if=\"data.type=='department'\" class=\"fa fa-university\"></i>\n                    <i v-else-if=\"data.type=='group'\" class=\"fa fa-users\"></i>\n                    <i v-else-if=\"data.type=='manager'\" class=\"fa fa-user-secret\"></i>\n                    <i v-else=\"data.type=='employee'\" class=\"fa fa-user\"></i>\n                    <span>{{ node.label }}</span>\n                </span>\n            </el-tree>\n        </div>\n    ",
    methods: {
        onload: function (node, resolve) {
            var _this = this;
            //if (node.level > 1) {
            //    return resolve([]);
            //}
            var url = this.options.loadUrl;
            var para = this.options.loadDefaultPara;
            if (node.id != 0) {
                para = this.options.loadPara(node);
            }
            ajaxHelper.RequestData(url, para, function (data) {
                var arr = [];
                for (var i in data) {
                    arr.push(_this.options.setArrayFromData(data[i]));
                }
                resolve(arr);
                _this.appendToOptions(data);
            });
        },
        onclick: function (node, data, f) {
            if (node.leaf == false) {
                return;
            }
            if (this.options.multiple) {
                if (this.selectNodes.findIndex(function (ele) { return ele.id == node.id; }) == -1) {
                    //深拷贝 用作watch
                    var cpy = this.selectNodes.slice(0);
                    cpy.push(this.options.setArrayFromData(node.data));
                    this.selectNodes = cpy;
                }
            }
            else {
                if (this.selectNodes == "" || this.selectNodes.id != node.id) {
                    this.selectNodes = this.options.setArrayFromData(node.data);
                }
            }
        },
        appendToOptions: function (data) {
            this.search = [];
            for (var i in data) {
                var obj = this.options.setArrayFromData(data[i]);
                //if (obj.appendWhileSearch) {
                this.search.push(obj);
                //}
            }
        },
        getSearchResult: function (query) {
            var _this = this;
            if (query === '') {
                return;
            }
            this.loading = true;
            var url = this.options.searchUrl;
            var para = this.options.searchPara(query);
            ajaxHelper.RequestData(url, para, function (data) {
                _this.appendToOptions(data);
                _this.loading = false;
            });
        },
    },
    watch: {
        selectNodes: function (newVal, oldVal) {
            this.$emit('getvalue', newVal);
        }
    },
    created: function () {
        var _this = this;
        this.options.loadUrl = this.options.loadUrl ? this.options.loadUrl : "http://userservice/api/Org/Children";
        this.options.loadDefaultPara = this.options.loadDefaultPara ? this.options.loadDefaultPara : "";
        this.options.loadPara = this.options.loadPara ? this.options.loadPara :
            function (node) {
                var para = "id=" + node.data.id;
                if (_this.options.type)
                    return para + "&type=" + _this.options.type;
                return para;
            };
        this.options.setArrayFromData = this.options.setArrayFromData ? this.options.setArrayFromData :
            function (data) {
                return {
                    label: data.displayName,
                    leaf: (data.unitType == 1),
                    depth: (data.unitType == 1) ? 1 : 0,
                    id: data.id,
                    parentId: data.parentId,
                    type: (data.unitType == 1) ? "employee" : "department",
                    //appendWhileSearch: (data.unitType == 1),
                    data: data
                };
            };
        this.options.searchUrl = this.options.searchUrl ? this.options.searchUrl : "http://userservice/api/Org/Search";
        this.options.searchPara = this.options.searchPara ? this.options.searchPara :
            function (query) {
                return "keyword=" + query;
            };
    }
});
Vue.component("zsfund-origination-input-select", {
    data: function () {
        return {
            dialogVisible: false,
            tags: [],
            selectData: [],
            prevNodes: [],
            option: {
                collapseTags: false,
                multiple: false,
                type: 0,
                width: "",
                height: "",
            },
        };
    },
    props: ['options'],
    template: "\n        <div>\n            <div v-if=\"options.disabled\">\n                <el-input :disabled=\"true\" placeholder=\"\u8BF7\u8F93\u5165\u5185\u5BB9\"></el-input></div>\n            <div v-else>\n                <div class=\"select\" @click=\"dialogVisible = true\" style=\"position:relative;\">\n                    <el-input v-show=\"tags.length!=0\"></el-input>\n                    <el-input v-show=\"tags.length==0\" placeholder=\"\u8BF7\u8F93\u5165\u5185\u5BB9\"></el-input>\n                    <span v-if=\"options.multiple\" class=\"tags\" style=\"position:absolute;top: 20%;\">\n                        <el-tag  v-for=\"tag in tags\" :key=\"tag\" size=\"small\" style=\"margin-left: 6px;\"\n                                closable @close=\"closeTag(tag)\" :disable-transitions=\"true\">\n                            {{tag.label}}\n                        </el-tag>\n                    </span>\n                    <span v-else style=\"position:absolute;top: 20%;\">\n                        <el-tag v-show=\"tags.id!=undefined\" size=\"small\" style=\"margin-left: 6px;\"\n                            closable @close=\"closeTag(tags)\" :disable-transitions=\"true\">\n                            {{tags.label}}\n                        </el-tag>\n                    </span>\n                </div>\n                <el-dialog :visible.sync=\"dialogVisible\" :width=\"300\" custom-class=\"componydialog\" center\n                        :modal-append-to-body=\"false\" append-to-body :close-on-click-modal=\"false\">\n                    <zsfund-origination-tree :prevNodes=\"prevNodes\" :options=\"option\" v-on:getvalue=\"setValue\"></zsfund-origination-tree>\n                    <span slot=\"footer\" class=\"dialog-footer\">\n                        <el-button @click=\"dialogVisible = false\">\u53D6 \u6D88</el-button>\n                        <el-button type=\"primary\" @click=\"handleConfirm\">\u786E \u5B9A</el-button>\n                    </span>\n                </el-dialog>\n            </div>\n        </div>\n    ",
    methods: {
        setValue: function (data) {
            this.selectData = data;
            if (!this.options.multiple) {
                this.handleConfirm();
            }
        },
        handleConfirm: function () {
            //浅拷贝，tags改变会带动selectdata改变
            //进而selectData带动data改变
            //三者使用同一块内存？
            this.tags = this.selectData;
            this.dialogVisible = false;
        },
        closeTag: function (tag) {
            if (this.options.multiple) {
                this.tags.splice(this.tags.indexOf(tag), 1);
            }
            else {
                this.tags = [];
            }
        },
        setArrayFromData: function (data) {
            return {
                label: data.displayName,
                leaf: (data.unitType == 1),
                depth: (data.unitType == 1) ? 1 : 0,
                id: data.id,
                parentId: data.parentId,
                type: (data.unitType == 1) ? "employee" : "department",
                //appendWhileSearch: (data.unitType == 1),
                data: data
            };
        },
        loadLastNodes: function () {
            var _this = this;
            var url = "/api/User/LastNodes", para = "";
            ajaxHelper.RequestData(url, para, function (idList) {
                var url = "http://userservice/api/User/List";
                var para = "idList=" + idList;
                //通过id得到部门节点信息的api未做
                //部门选择模式和混合选择模式逻辑未做
                ajaxHelper.RequestData(url, para, function (data) {
                    //if (this.options.multiple) {
                    var cpy = [];
                    for (var i in data) {
                        cpy.push(_this.setArrayFromData(data[i]));
                    }
                    _this.tags = cpy;
                    //} else {
                    //    
                    //}
                    _this.prevNodes = cpy;
                });
            });
        }
    },
    watch: {
        tags: function (newVal, oldVal) {
            var res = newVal;
            if (Array.isArray(newVal)) {
                //newVal = new Array(newVal);
                res = newVal.slice(0);
            }
            this.$emit('change', res);
        }
    },
    mounted: function () {
        this.option.collapseTags = this.options.collapseTags;
        this.option.multiple = this.options.multiple;
        this.option.type = this.options.type;
        this.option.width = "260";
        this.option.height = "300";
        this.loadLastNodes();
    }
});
//# sourceMappingURL=zsfund-componet.js.map