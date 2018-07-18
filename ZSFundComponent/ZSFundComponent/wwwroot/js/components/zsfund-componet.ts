/**
 * Api请求帮助类
 */
class AjaxHelper {
    /**
     * 基础请求
     * @param url 地址
     * @param param 参数
     * @param callbackfunc 成功回调函数
     * @param showProgressBar 是否显示ProgressBar
     */
    public RequestData(url, param, callbackfunc: Function = null) {
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
            success: (data) => {
                result = data;
                if (callbackfunc != null) {
                    callbackfunc.call(this, data);
                    return;
                }
                return result;
            },
            error: (jqXHR, textStatus, errorThrown) => {
                result = "error: " + errorThrown;
            }
        });
    }

    public PostData(url, data, callbackfunc = null) {
        $.post(
            url,
            data,
            (data, status) => {
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
            }).fail((data) => {
                alert("网络错误，请联系系统管理员");
            })
    }

    private AddRandom(url: string): string {
        return url + (url.indexOf("?") >= 0 ? "&" : "?") + this.GetRandom(1000);
    }

    private GetRandom(n: number) {
        return Math.floor(Math.random() * n + 1);
    }
}

var baseUrl = 'http://component/';
//var baseUrl = '';
var ajaxHelper = new AjaxHelper();
Vue.component('zsfund-stock-select', {
    data: () => {
        return {
            stocks: [],
            selectStock: this.stockCode,
            size: this.size,
        }
    },
    props: ['stockCode', 'size'],
    template:
        `<el-select filterable remote clearable v-model="selectStock" default-first-option="true" :remote-method="findSecInSelect" @change="change" placeholder="股票查询" v-bind:size="size">
        <el-option v-for="item in stocks" :key="item.stockCode" :label="item.stockName" :value="item" >
            <span style="float: left">{{ item.stockName }}</span>
            <span style="float: right; color: #CC0033; font-size: 13px">{{ item.stockCode+'.'+item.market }}</span>
        </el-option>
    </el-select>`,
    methods: {
        findSecInSelect: function (query) {
            if (query !== '') {
                ajaxHelper.RequestData(baseUrl + "api/StockInfo/GetStockInfo", "queryStr=" + query, (data) => {
                    this.stocks = data;
                })
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
    data: () => {
        return {
            id: this.id,
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
        }
    },
    props: ['options', 'prevNodes'],
    template: `
        <div>
            <el-select v-model="selectNodes" :multiple="options.multiple" filterable remote placeholder="输入关键字" :style="{width:options.width+'px'}"
                :collapse-tags="options.collapseTags" value-key="id" :remote-method="getSearchResult" :loading="loading">
                <el-option-group v-if="selectNodes!=undefined && selectNodes.length>0" label="已选中">
                    <el-option v-for="item in selectNodes" :label="item.label" :key="item.id" :value="item"></el-option>
                </el-option-group>
                <el-option-group label="搜索结果">
                    <el-option v-for="item in search" :label="item.label" :key="item.id" :value="item"></el-option>
                </el-option-group>
            </el-select>
            <el-tree :props="props" lazy :load="onload" node-key="id"  @node-click="onclick"
                    style="height:50vh;overflow-y:auto;margin-top:15px;">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <i v-if="data.type=='department'" class="fa fa-university"></i>
                    <i v-else-if="data.type=='group'" class="fa fa-users"></i>
                    <i v-else-if="data.type=='manager'" class="fa fa-user-secret"></i>
                    <i v-else="data.type=='employee'" class="fa fa-user"></i>
                    <span>{{ node.label }}</span>
                </span>
            </el-tree>
        </div>
    `,
    methods: {
        onload(node, resolve) {
            //if (node.level > 1) {
            //    return resolve([]);
            //}
            var url = this.options.loadUrl;
            var para = this.options.loadDefaultPara;

            if (node.id != 0) {
                para = this.options.loadPara(node);
            }
            ajaxHelper.RequestData(url, para, (data) => {
                var arr = [];
                for (let i in data) {
                    arr.push(this.options.setArrayFromData(data[i]));
                }
                resolve(arr);
                this.appendToOptions(data);
            })
        },
        onclick(node, data, f) {
            if (node.leaf == false) {
                return;
            }
            if (this.options.multiple) {
                if (this.selectNodes.findIndex(ele => { return ele.id == node.id }) == -1) {
                    //深拷贝 用作watch
                    var cpy = this.selectNodes.slice(0);
                    cpy.push(this.options.setArrayFromData(node.data))
                    this.selectNodes = cpy;
                }
            } else {
                if (this.selectNodes=="" || this.selectNodes.id != node.id) {
                    this.selectNodes = this.options.setArrayFromData(node.data);
                }
            }
        },
        appendToOptions(data) {
            this.search = [];
            for (let i in data) {
                var obj = this.options.setArrayFromData(data[i]);
                //if (obj.appendWhileSearch) {
                    this.search.push(obj);
                //}
            }
        },
        getSearchResult(query) {
            if (query === '') {
                return;
            }
            this.loading = true;
            var url = this.options.searchUrl;
            var para = this.options.searchPara(query);
            ajaxHelper.RequestData(url, para, (data) => {
                this.appendToOptions(data);
                this.loading = false;
            })
        },
    },
    watch: {
        selectNodes(newVal, oldVal) {
            this.$emit('getvalue', newVal);
        }
    },
    created: function(){
        this.options.loadUrl = this.options.loadUrl ? this.options.loadUrl : "http://userservice/api/Org/Children";
        this.options.loadDefaultPara = this.options.loadDefaultPara ? this.options.loadDefaultPara : "";
        this.options.loadPara = this.options.loadPara ? this.options.loadPara :
            (node) => {
                var para = "id=" + node.data.id;
                if (this.options.type)
                    return para + "&type=" + this.options.type;
                return para;
            };
        this.options.setArrayFromData = this.options.setArrayFromData ? this.options.setArrayFromData :
            (data) => {
                return {
                    label: data.displayName,
                    leaf: (data.unitType == 1),
                    depth: (data.unitType == 1) ? 1 : 0,
                    id: data.id,
                    parentId: data.parentId,
                    type: (data.unitType == 1) ? "employee" : "department",
                    //appendWhileSearch: (data.unitType == 1),
                    data: data
                }
            }
        this.options.searchUrl = this.options.searchUrl ? this.options.searchUrl : "http://userservice/api/Org/Search";
        this.options.searchPara = this.options.searchPara ? this.options.searchPara :
            (query) => {
                return "keyword=" + query
            };
    }
});

Vue.component("zsfund-origination-input-select", {
    data: () => {
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

                //loadUrl: "/api/Org/Children"  //type test url
            },
            
        }
    },
    props: ['options'],//collapseTags//disabled//multiple
    template: `
        <div>
            <div v-if="options.disabled">
                <el-input :disabled="true" placeholder="请输入内容"></el-input></div>
            <div v-else>
                <div class="select" @click="dialogVisible = true" style="position:relative;">
                    <el-input v-show="tags.length!=0"></el-input>
                    <el-input v-show="tags.length==0" placeholder="请输入内容"></el-input>
                    <span v-if="options.multiple" class="tags" style="position:absolute;top: 20%;">
                        <el-tag  v-for="tag in tags" :key="tag" size="small" style="margin-left: 6px;"
                                closable @close="closeTag(tag)" :disable-transitions="true">
                            {{tag.label}}
                        </el-tag>
                    </span>
                    <span v-else style="position:absolute;top: 20%;">
                        <el-tag v-show="tags.id!=undefined" size="small" style="margin-left: 6px;"
                            closable @close="closeTag(tags)" :disable-transitions="true">
                            {{tags.label}}
                        </el-tag>
                    </span>
                </div>
                <el-dialog :visible.sync="dialogVisible" :width="300" custom-class="componydialog" center
                        :modal-append-to-body="false" append-to-body :close-on-click-modal="false">
                    <zsfund-origination-tree :prevNodes="prevNodes" :options="option" v-on:getvalue="setValue"></zsfund-origination-tree>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="dialogVisible = false">取 消</el-button>
                        <el-button type="primary" @click="handleConfirm">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
        </div>
    `,
    methods: {
        setValue(data) {
            this.selectData = data;
            if (!this.options.multiple) {
                this.handleConfirm();
            }
        },
        handleConfirm() {
            //浅拷贝，tags改变会带动selectdata改变
            //进而selectData带动data改变
            //三者使用同一块内存？
            this.tags = this.selectData;
            this.dialogVisible = false;
        },
        closeTag(tag) {
            if (this.options.multiple) {
                this.tags.splice(this.tags.indexOf(tag), 1);
            } else {
                this.tags = [];
            }
        },
        setArrayFromData:(data) => {
            return {
                label: data.displayName,
                leaf: (data.unitType == 1),
                depth: (data.unitType == 1) ? 1 : 0,
                id: data.id,
                parentId: data.parentId,
                type: (data.unitType == 1) ? "employee" : "department",
                //appendWhileSearch: (data.unitType == 1),
                data: data
            }
        },
        loadLastNodes() {
            var url = "/api/User/LastNodes",para="";
            ajaxHelper.RequestData(url, para, (idList) => {
                var url = "http://userservice/api/User/List";
                var para = "idList=" + idList;

                //通过id得到部门节点信息的api未做
                //部门选择模式和混合选择模式逻辑未做
                ajaxHelper.RequestData(url, para, (data) => {
                    //if (this.options.multiple) {
                    var cpy = [];
                    for (var i in data) {
                        cpy.push(this.setArrayFromData(data[i]))
                    }
                    this.tags = cpy;
                    //} else {
                    //    
                    //}
                    this.prevNodes = cpy;
                })
            })
        }
    },
    watch: {
        tags(newVal, oldVal) {
            var res = newVal;
            if (Array.isArray(newVal)) {
                //newVal = new Array(newVal);
                res = newVal.slice(0);
            }
            this.$emit('change', res);
        }
    },
    mounted: function(){
        this.option.collapseTags= this.options.collapseTags;
        this.option.multiple= this.options.multiple;
        this.option.type= this.options.type;
        this.option.width= "260";
        this.option.height = "300";
        
        this.loadLastNodes();
    }
});