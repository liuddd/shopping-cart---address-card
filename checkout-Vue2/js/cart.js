/**
 * Created by liuduoduo on 2018/1/23.
 */
var vm = new Vue({
    el:"#app",
    data:{
        totalMoney:0,
        productList:[],
        checkedAll: false,   //单选是v-for遍历的，所以不能直接在data里加字段
                                // 全选按钮不用遍历，因此直接在data中加字段
        totalPrice: 0,
        delFlag: false,
        delIndex: 0
    },
    filters:{   //用于格式化，vue方法内的是局部过滤器，在dom中用“ | formatMoney”挂载
        formatMoney: function (value) {
            return "￥" + value.toFixed(2);
        }
    },
    mounted:function () {   //代替1.0版本中的ready函数
        this.loadList();
        // this.$nextTick(function () {     //与上面一行等价
        //     vm.loadList();   //通过$nextTich()函数，vm可以等价于this
        // });
    },
    methods:{
        loadList: function () {
            // var _this = this;   //在vue方法中this指向的是本方法，
            //                     // 但在下面的方法中"this"的作用域局限在方法内部，因此先声明一下
            // this.$http.get("data/cartData.json",{id:"123"}).then(function (res) {
            //     _this.productList = res.data.result.list;
            //     _this.totalMoney = res.data.result.totalMoney;
            // });

            // let _this = this;   //ES6特性，声明变量用let（可以在开发工具中设置preferance → language → ES6）
            this.$http.get("data/cartData.json",{id:"123"}).then(res=>{ //ES6特有的箭头函数，res相当于回调的参数
                                                                        //=>相当于function，{}里是函数体
                this.productList = res.data.result.list;    //this变量的作用域已经指向外层，不需要重新声明
                this.totalMoney = res.data.result.totalMoney;
            });
        },
        changeMoney: function (product,way) {   //product就是dom操作传入的item参数
                                                // way就是设定的状态（1代表+，-1代表-）
            // if (way > 0){
            //     product.productQuantity++;      //当点击+时，item（也就是json文件里的productQuantity+1）
            // } else {
            //     product.productQuantity--;      //当点击-时，当前产品的productQuantity-1
            //     if (product.productQuantity <1){
            //         product.productQuantity = 1;     //这里做一个判断，最小只能减到1
            //     }
            // }
            //更简单计算
            product.productQuantity+=way;
            if (product.productQuantity <1){
                product.productQuantity = 1;
            }

        },
        selectProduct: function (item) {
            if (typeof item.checked == 'undefined'){    //如果checked字段不存在
                // Vue.set(item,"checked",true);   //全局注册变量
                this.$set(item,"checked",true);   //局部注册变量，在item对象中注册一个checked字段
            } else {
                item.checked = !item.checked;   //否则取反
            }
            // 单选按钮全选中触发全选按钮
            var flagAll = true;
            this.productList.forEach(item=> {
                //利用“逻辑与”运算符，只要遍历过程中出现一个checked为false，则最终输出结果flagAll必为false
                //当最后一个单选按钮选中时，遍历全部单选按钮可以发现，checked全为true，那么下列方程全真即为真，flagAll为true
                flagAll = flagAll && item.checked;
            });
            this.checkedAll = flagAll;  //将输出结果赋值给全选按钮的状态属性，实现点击单选按钮实时控制全选
        },
        selectAll: function (flag) {
            //1.改变全选按钮状态
            if (flag == 1){
                this.checkedAll = !this.checkedAll;     //checkedAll默认是false，点击“全选”传入1时，取反为true
                                                        // 第二次点击“全选”时，需要取消全选，取反为false
            } else {
                this.checkedAll = false;        //如果通过点击“取消全选”按钮来实现，那么传入0，checkedAll设为false
            }

            //2.改变单选按钮状态
            this.productList.forEach((item,index)=>{
                //首先判断单选按钮有没有字段checked
                // 因为如果打开页面先点全选，就没有触发selectProduct方法
                // 就无法监听到单选按钮的checked属性
                if (typeof item.checked == 'undefined'){    //如果单选按钮checked字段不存在
                    this.$set(item,"checked",this.checkedAll);   //局部注册变量，在item对象中注册一个checked字段
                                                                // 属性值与全选按钮相等，也就是说，点全选，则所有单选checked全true
                                                                //再点全选置空，则所有单选checked全false
                } else {
                    item.checked = this.checkedAll;   //如果单选按钮checked字段存在，其属性值与checkedAll的值保持同步
                }
            });

        },
        delConfirm: function (curIndex) {
            this.delFlag = true;
            this.delIndex = curIndex;
        },
        delProduct: function () {
            this.delFlag = false;
            this.productList.splice(this.delIndex,1);
        }
    },
    computed: {
        calTotalPrice: function () {
            //计算最终总金额
            this.totalPrice = 0;    //这里首先要清零，否则每次都会在前面求和的基础上计算
            this.productList.forEach((item,index)=>{
                if (item.checked == true){
                    this.totalPrice += (item.productPrice)*(item.productQuantity);
                }
            });
            return this.totalPrice;
        }
    }
});
Vue.filter("money",function (value,type) { //写在vue方法外，是全局过滤器
                                                    // 在dom中用" | money(param)"函数挂载
    return value.toFixed(2) + type;
});