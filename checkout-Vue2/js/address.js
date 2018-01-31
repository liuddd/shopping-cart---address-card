/**
 * Created by liuduoduo on 2018/1/26.
 */
new Vue({
    el: ".container",
    data:{      //这里就是整个vue的模型
        addressList:[],
        limitNum: 3,
        moreCard: true,
        currentIndex: 0,
        shippingMethod: 0,
        delFlag:false,
        delIndex:0,
        confirmAddFlag: false,
        editFlag: false,
        newAddress:{
            "addressId":"",
            "userName":"",
            "streetName":"",
            "postCode":"",
            "tel":"",
            "isDefault":false
        },
        editIndex: 0,
        editWay: 0
    },
    mounted: function () {
        this.$nextTick(function () {    //实现数据加载之前dom已经渲染完毕
            this.getAddressList();
        });
    },
    computed: { //实时计算
        filterAddress: function () {
            return this.addressList.slice(0,this.limitNum); //通过computed监听器限制显示3张卡片
                                                            // 内置slice方法截取列表前三项
        }
    },
    methods: {
        getAddressList: function () {   //this.$http.get()是vue-resource插件里的方法
            this.$http.get("data/address.json").then(response=>{
                var res = response.data; //在vue-resource插件中，将返回的json文件格式化了
                                    // 通过response.data或者response.body装载我们需要的整个json
                if (res.status == "0"){ //address.json中状态码status为0时，表示加载成功
                    this.addressList = res.result;
                }
                if (this.addressList.length > 3){
                    this.moreCard = true;
                } else {
                    this.moreCard = false;
                }
            });
        },
        setDefault: function (item,index) {
            this.addressList.forEach(function (address) {
                address.isDefault = false;
            });
            item.isDefault = true;
            this.addressList.splice(index, 1);
            this.addressList.unshift(item); //unshift方法向数组开头添加一个或多个元素，并返回新的长度
            this.currentIndex = 0;  //无效，因为添加了点击事件@click="currentIndex = index"
        },
        delConfirm: function (index) {
            this.delFlag = true;
            this.delIndex = index;
        },
        delAddress: function () {
            this.addressList.splice(this.delIndex, 1);
            this.delFlag = false;
            this.currentIndex = 0;  //删除后默认选择第一个地址
        },
        editAddress: function (item,index,way) {
            this.editFlag = true;   //唤醒编辑状态
            if (way == 0){  //如果是编辑卡片，则打开编辑框，内容与当前地址保持一致
                this.newAddress.userName = item.userName;
                this.newAddress.streetName = item.streetName;
                this.newAddress.tel = item.tel;
                this.editIndex = index; //将当前位置值赋值给被编辑位置，方便点击保存时取值
                this.editWay = 0;   //判断编辑方式传递给下一操作（是编辑而非新增）
            } else {    //如果是添加卡片，则内容置空，addressId递增
                this.newAddress.userName = "";
                this.newAddress.streetName = "";
                this.newAddress.tel = "";
                var length = this.addressList.length - 1,
                    lastAddress = this.addressList[length];
                this.newAddress.addressId = lastAddress.addressId + 1;
                this.editWay = 1;   //判断编辑方式传递给下一操作（是新增而非编辑）
            }
        },
        saveAddress: function () {
            if (this.editWay == 0){
                this.addressList.splice(this.editIndex, 1 ,this.newAddress);    //用编辑后的新地址代替新地址
            } else {
                this.addressList.push(this.newAddress);     //在数组末尾插入新地址
            }
            this.editFlag = false;
        }
    }
});