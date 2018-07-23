﻿/**
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
            fuckFlag: true,
            props: {
                label: 'label',
                children: 'nodes',
                depth: 'depth',
                isLeaf: 'leaf',
                type: 'type',
                disabled: 'disabled'
            },

        }
    },
    props: ['options', 'prevnodes'],
    template: `
        <div id="orgTreeSelect">
            <el-select v-model="selectNodes" :multiple="options.multiple" filterable remote placeholder="输入关键字"
                    :collapse-tags="options.collapseTags" value-key="id" :remote-method="getSearchResult" 
                    :loading="loading" @remove-tag="removeTag" @change="selectChosen">
                <el-option-group v-if="selectNodes!=undefined && selectNodes.length>0" label="已选中">
                    <el-option v-for="item in selectNodes" :label="item.label" :key="item.id" :value="item"></el-option>
                </el-option-group>
                <el-option-group  label="搜索结果">
                    <el-option v-for="item in search" :label="item.label" :key="item.id" :value="item"></el-option>
                </el-option-group>
            </el-select>
            <el-tree :props="props" lazy :load="onload" node-key="id"  @node-click="onclick" 
                     ref="tree" show-checkbox check-strictly @check-change="checkChange">
                <span class="custom-tree-node" slot-scope="ele">
                    <i v-if="ele.data.type=='department'" class="fa fa-university"></i>
                    <i v-else-if="ele.data.type=='group'" class="fa fa-users"></i>
                    <i v-else-if="ele.data.type=='manager'" class="fa fa-user-secret"></i>
                    <i v-else="ele.data.type=='employee'" class="fa fa-user"></i>
                    <span>{{ ele.node.label }}</span>
                </span>
            </el-tree>
            <div class="footer" style=""><span class="buttons">
                <el-button @click="cancelbtn">取 消</el-button>
                <el-button type="primary" @click="confirmbtn">确 定</el-button>
            </span></div>
        </div>
    `,
    methods: {
        selectChosen(data) {
            var dataid = [];
            for (var i in data) {
                dataid.push(data[i].id);
            }
            var checkKeys = this.$refs.tree.getCheckedKeys();
            if (checkKeys.length > data.length) {
                var delNodes = checkKeys.filter(function (e) { return dataid.indexOf(e) < 0; });
                for (var i in delNodes) {
                    this.$refs.tree.setChecked(delNodes[i], false);
                }
            } else if (checkKeys.length < data.length) {
                var addNodes = data.filter(function (e) { return checkKeys.indexOf(e.id) < 0; });
                for (var i in addNodes) {
                    this.$refs.tree.setChecked(addNodes[i], true);
                }
            } else {
                console.log("wtf");
            }
        },
        removeTag(data) {
            this.$refs.tree.setChecked(data.id,false);
        },
        checkChange(data, check) {
            var node = this.$refs.tree.getNode(data);
            if (this.options.multiple) {
                //var index = this.findIndex(this.selectNodes, ele => { return ele.id == data.id });
                //var index = this.selectNodes.findIndex(ele => { return ele.id == data.id });
                //IE 不支持find和findIndex,使用自定义的简易findIndex
                //if (index == -1) {
                if (node.checked) {
                    //深拷贝 用作watch
                    var index = this.findIndex(this.selectNodes, ele => { return ele.id == data.id });
                    if (index < 0) {//避免重复添加
                        var cpy = this.selectNodes.slice(0);
                        cpy.push(this.options.setArrayFromData(data.data))
                        this.selectNodes = cpy;
                    }
                } else {
                    //this.selectNodes.splice(index, 1);
                    var index = this.findIndex(this.selectNodes, ele => { return ele.id == data.id });
                    if (index >= 0) {//避免删除错误
                        this.selectNodes.splice(index, 1);
                    }
                }
            } else {
                if (node.checked) {
                    if (this.selectNodes != "") {
                        this.fuckFlag = false;
                    }
                    this.$refs.tree.setCheckedNodes([data.data]);
                    this.selectNodes = this.options.setArrayFromData(data.data);
                }
                else {
                    if (this.fuckFlag) {
                        this.selectNodes = "";
                    } else {
                        this.fuckFlag = true;
                    }
                }
            }
        },
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


                var nodes = this.selectNodes.slice ? this.selectNodes.slice(0) : new Array(this.selectNodes);
                for (var i in nodes) {
                    //console.log(this.findIndex(data, function (e) { e.id == nodes[i].id }));
                    if (this.findIndex(data, function (e) { return e.id==nodes[i].id}) >= 0) {
                        //默认未加载的节点不会被选中
                        //所以认为nodes[i]未被选中
                        this.$refs.tree.setChecked(nodes[i],true);
                    }
                }
            })
        },
        findIndex(array, callback) {
            if (!Array.isArray(array)) {
                return -2;
            }
            for (var i in array) {
                if (callback(array[i])) {
                    return i;
                }
            }
            return -1;
        },
        onclick(node, data, f) {
            if (node.leaf == false) {
            //if (data.isLeaf == false) { // data.isLeaf根据树节点的resolve进行自动更新
                                        // data.isLeafByUser与node.leaf绑定 
                return;
            }
            this.$refs.tree.setChecked(node.id, !data.checked);
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
        loadLastNodes() {
            if (!(this.prevnodes&&this.prevnodes.length)) {
                return;
            }
            var data = this.prevnodes;
            this.appendToOptions(data);

            if (this.options.multiple) {
                //if (this.selectNodes.findIndex(ele => { return ele.id == data.id }) == -1) {
                if (this.selectNodes.filter(ele => { return ele.id == data.id }).length <=0) {
                    //深拷贝 用作watch
                    var cpy = [];
                    for(var i in data){
                        cpy.push(this.options.setArrayFromData(data[i]))
                    }
                    this.selectNodes = cpy;
                }
            } else {
                //this.$refs.tree.setChecked(data[0], true);
                if (this.selectNodes == "" || this.selectNodes.id != data[0].id) {
                    this.selectNodes = this.options.setArrayFromData(data[0]);
                }
            }
        },
        cancelbtn() {
            this.$emit('cancelbutton');
        },
        confirmbtn() {
            this.$emit('confirmbutton');
        }
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
                    return para + "&type=0";//" + this.options.type;
                return para;
            };
        this.options.setArrayFromData = this.options.setArrayFromData ? this.options.setArrayFromData :
            (data) => {
                return {
                    label: data.displayName,
                    leaf: data.unitType == (this.options.type == 0 ? 1 : this.options.type),//根据type选项设置leaf属性
                                                                                            //混合选择模式下，在onload方法里也会对部门叶节点进行leaf属性的更新
                    depth: (data.unitType == 1) ? 1 : 0,
                    id: data.id,
                    parentId: data.parentId,
                    type: (data.unitType == 1) ? "employee" : "department",
                    disabled: this.options.type==1?data.unitType!=1:false,
                    //appendWhileSearch: (data.unitType == 1),
                    data: data
                }
            }
        this.options.searchUrl = this.options.searchUrl ? this.options.searchUrl : "http://userservice/api/Org/Search";
        this.options.searchPara = this.options.searchPara ? this.options.searchPara :
            (query) => {
                return "keyword=" + query
            };
        //this.selectNodes = this.options.setArrayFromData(this.prevnodes);
        //this.loadLastNodes();
        this.selectNodes = this.options.multiple ? [] : "";
    },
    mounted: function () {
        this.loadLastNodes();
    }
});

Vue.component("zsfund-origination-input-select", {
    data: () => {
        return {
            dialogVisible: false,
            tags: [],
            selectData: [],
            prevNodes: null,
            firstload: true,
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
    props: ['options','value'],//collapseTags//disabled//multiple
    template: `
        <div>
            <div v-if="options.disabled">
                <el-input :disabled="true" placeholder="请输入内容"></el-input></div>
            <div v-else>
                <div class="select" @click="dialogVisible = true" style="position:relative;">
                    <span class="tags" style="position:absolute;top: 20%;">
                        <el-tag v-for="tag in tags" :key="tag" size="small" style="margin-left: 6px;"
                                closable @close="closeTag(tag)" :disable-transitions="true">
                            <i v-if="tag.type=='department'" class="fa fa-university"></i>
                            <i v-else-if="tag.type=='group'" class="fa fa-users"></i>
                            <i v-else-if="tag.type=='manager'" class="fa fa-user-secret"></i>
                            <i v-else="tag.type=='employee'" class="fa fa-user"></i>
                            {{tag.label}}
                        </el-tag>
                    </span>
                    <el-input v-show="tags.length!=0"></el-input>
                    <el-input v-show="tags.length==0" placeholder="请输入内容"></el-input>
                </div>
                <el-dialog :visible.sync="dialogVisible" :width="300" custom-class="componydialog"
                        :modal-append-to-body="false" append-to-body :close-on-click-modal="false">
                    <zsfund-origination-tree :prevnodes="prevNodes" :options="option" ref="orgTree"
                        v-on:getvalue="setValue" v-on:cancelbutton="dialogVisible=false;"
                        v-on:confirmbutton="handleConfirm"></zsfund-origination-tree>
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

            if (this.prevNodes && this.prevNodes.length) {
                if (!this.options.multiple && this.firstload) {
                    this.firstload = false;
                    return;
                }
            } else {
                this.firstload = false;
            }

            this.dialogVisible = false;
        },
        closeTag(tag) {
            this.$refs.orgTree.removeTag(tag);
            if (this.options.multiple) {
                this.tags.splice(this.tags.indexOf(tag), 1);
            } else {
                this.tags = [];
            }
        },
        setArrayFromData: function (data){
            return {
                label: data.displayName,
                leaf: data.unitType == (this.options.type == 0 ? 1 : this.option.type),//根据type选项设置leaf属性
                                                                                        //混合选择模式下，在onload方法里也会对部门叶节点进行leaf属性的更新
                depth: (data.unitType == 1) ? 1 : 0,
                id: data.id,
                parentId: data.parentId,
                type: (data.unitType == 1) ? "employee" : "department",
                //appendWhileSearch: (data.unitType == 1),
                data: data
            }
        },
        loadLastNodes() {
            var idList = this.value;
            if (idList==""||!idList) {
                return;
            }

            var url = "http://userservice/api/User/List";
            var para = "idList=" + idList;
            //部门选择模式和混合选择模式逻辑未做
            ajaxHelper.RequestData(url, para, (data) => {
                //if (this.options.multiple) {
                var cpy = [];
                for (var i in data) {
                    cpy.push(this.setArrayFromData(data[i]))
                }
                this.tags = cpy;
            })
        }
    },
    watch: {
        tags(newVal, oldVal) {
            if (newVal === "") {
                this.tags = [];
            } else if (!Array.isArray(newVal)) {
                this.tags = new Array(newVal);
            } else {
                var res = newVal;
                //此处对prevNodes进行更新是为了
                //若在加载内部组件zsfund-origination-tree前就对最外层tags进行close操作的话
                //内部组件得到的prevNodes可以得到更新后的数据
                this.prevNodes = [];
                for (var i in res) {
                    this.prevNodes.push(res[i].data);
                }

                this.$emit('change', res);
            }
        },
        value(newVal, oldVal) {
            this.prevNodes = newVal ? newVal : null;
            this.loadLastNodes();
        }
    },
    mounted: function(){
        this.option.collapseTags= this.options.collapseTags;
        this.option.multiple= this.options.multiple;
        this.option.type = this.options.type ? this.options.type:0;
        this.option.width= "260";
        this.option.height = "300";

        this.prevNodes = this.value ? this.value : null;
        this.loadLastNodes();
    }
});