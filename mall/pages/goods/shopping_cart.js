// mall/pages/goods/shopping_cart.js
/**
 * 【商城】购物车页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var openid;
import touch from '../../../utils/touch.js'
Page({
  touch: new touch(),
  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    list: [{}, {}, {}, {}, {}, {}],
    total_fee:0,
    is_checked_all:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    //获取购物车
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    if(mall_cart_list!=''){
      mall_cart_list = JSON.parse(mall_cart_list);
      var goods_ids = [];
      for(let index in mall_cart_list){
        var item = {};
        item.id = mall_cart_list[index].id;
        item.amount = mall_cart_list[index].amount;
        item.ischecked = mall_cart_list[index].ischecked;
        goods_ids.push(item);
      }
      goods_ids = JSON.stringify(goods_ids);
      that.getCartList(goods_ids);
    }
  },
  getCartList:function(goods_ids){
    var that = this;
    utils.PostRequest(api_v_url + '/shop/getcartgoods', {
      goods_ids: goods_ids
    }, (data, headers, cookies, errMsg, statusCode) => {
      var goods_online_list = data.result.online
      that.setData({
        //goods_online_list: data.result.online,
        goods_offline_list: data.result.offline
      })
      that.getToalFee(goods_online_list)
    });
  },
  selectMerchant:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.index;
    var ischecked = '';
    var tmp = e.detail.value;
    if(tmp.length>0){
      ischecked = true;
    }else {
      ischecked = false;
    }
    var goods_online_list = that.data.goods_online_list;
    for (let index in goods_online_list){
      if(index==keys){
        goods_online_list[index].ischecked = ischecked;
        for (let i in goods_online_list[index].goods){
          goods_online_list[index].goods[i].ischecked = ischecked
        }
      }
    }
    that.getToalFee(goods_online_list);
    //that.setData({ goods_online_list: goods_online_list})
  },
  selectGoods:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var keys  = e.currentTarget.dataset.keys;
    var goods_id = e.currentTarget.dataset.goods_id;

    var ischecked = '';
    var tmp = e.detail.value;
    if (tmp.length > 0) {
      ischecked = true;
    } else {
      ischecked = false;
    }
    var goods_online_list = that.data.goods_online_list;
    for(let i in goods_online_list){
      if(i== index){
        for (let j in goods_online_list[i].goods) {
          if(j==keys){
            goods_online_list[i].goods[j].ischecked = ischecked
          }
        }
      }
    }
    that.getToalFee(goods_online_list);
    //that.setData({ goods_online_list: goods_online_list})

  },
  selectAll:function(e){
    var that = this;
    var ischecked = '';
    var tmp = e.detail.value;
    var goods_online_list = that.data.goods_online_list;
    if (tmp.length > 0) {
      ischecked = true;
    } else {
      ischecked = false;
    }
    for (let i in goods_online_list){
      goods_online_list[i].ischecked = ischecked;
      for(let j in goods_online_list[i].goods){
        goods_online_list[i].goods[j].ischecked = ischecked
      }
    }
    that.getToalFee(goods_online_list)
  },
  getToalFee: function (goods_online_list){
    
    var that = this;
    
    
    /*var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    mall_cart_list = JSON.parse(mall_cart_list);
    for(let i in mall_cart_list){
      if(mall_cart_list[i].id==goods_id){
        if(type==1){
          mall_cart_list[i].amount = amount
        }else if(type==2){
          mall_cart_list[i].ischecked = ischecked
        }
        
      }
    }
    mall_cart_list = JSON.stringify(mall_cart_list);
    wx.setStorage({
      key: cache_key + 'mall_cart_' + openid,
      data: mall_cart_list,
    })*/
    
    
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    if(mall_cart_list!=''){
      mall_cart_list = JSON.parse(mall_cart_list);

      console.log(mall_cart_list)






      var total_fee = 0;
      var is_checked_all = true;
      for (let i in goods_online_list) {

        var ischecked = true;

        for (let j in goods_online_list[i].goods) {

          for (let x in mall_cart_list) {
            if (goods_online_list[i].goods[j].id == mall_cart_list[x].id) {
              mall_cart_list[x].ischecked = goods_online_list[i].goods[j].ischecked
            }
          }

          if (goods_online_list[i].goods[j].ischecked == false) {
            ischecked = false
            is_checked_all = false;
          } else {
            var price = goods_online_list[i].goods[j].price;
            var amount = goods_online_list[i].goods[j].amount;
            total_fee += app.accMul(price, amount)
          }



        }
        goods_online_list[i].ischecked = ischecked
      }
      mall_cart_list = JSON.stringify(mall_cart_list)
      wx.setStorage({
        key: cache_key + 'mall_cart_' + openid,
        data: mall_cart_list,
      })
      that.setData({
        goods_online_list: goods_online_list,
        total_fee: total_fee,
        is_checked_all: is_checked_all
      })
    }else {
      that.setData({
        goods_online_list:[],
        total_fee:0,
        is_checked_all:false
      })
    }
    
  },

  //购物车减数量
  cutNum: function (e) {
    var that = this;
    var goods_online_list = that.data.goods_online_list;
    var index = e.currentTarget.dataset.index;
    var keys  = e.currentTarget.dataset.keys;
    var goods_id = e.currentTarget.dataset.goods_id;
    var stock_num = goods_online_list[index].goods[keys].stock_num; //库存
    if (goods_online_list[index].goods[keys].amount == 1) {
      app.showToast('至少选择一件商品');
      return false;
    }
    goods_online_list[index].goods[keys].amount -= 1;
    
    

    that.getToalFee(goods_online_list);
  },
  //购物车增数量
  addNum: function (e) {
    var that = this;
    var goods_online_list = that.data.goods_online_list;
    var index = e.currentTarget.dataset.index;
    var keys = e.currentTarget.dataset.keys;
    var goods_id = e.currentTarget.dataset.goods_id;
    var stock_num = goods_online_list[index].goods[keys].stock_num; //库存
    if (goods_online_list[index].goods[keys].amount == stock_num) {
      app.showToast('该商品库存不足');
      return false;
    }
    goods_online_list[index].goods[keys].amount += 1;
   
    that.getToalFee(goods_online_list);
  },
  confirmOrder:function(e){
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    if (mall_cart_list == '') {
      app.showToast('您未选中任何商品');
      return false;
    }
    mall_cart_list = JSON.parse(mall_cart_list);
    
    var goods_ids = [];
    var is_add_order = false;
    for(let i in mall_cart_list){
      if(mall_cart_list[i].ischecked==true){
        is_add_order = true;
      }
    }
    if(is_add_order== true){
      wx.navigateTo({
        url: '/mall/pages/order/confirmation?openid='+openid+'&order_type=2',
      })
    }
  },
  gotoGoodsDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/mall/pages/goods/detail?goods_id='+goods_id,
    })
  },
  delCartGoods:function(e){
    var that = this;
    var goods_id = e.currentTarget.dataset.goods_id;
    var goods_online_list = that.data.goods_online_list 
    for(let i in goods_online_list){
      for(let j in goods_online_list[i].goods){
        if(goods_online_list[i].goods[j].id==goods_id){
          goods_online_list[i].goods.splice(j,1);
        }
      }
      if(goods_online_list[i].goods.length==0){
        goods_online_list.splice(i,1)
      }
    }
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    if(mall_cart_list!=''){
      mall_cart_list = JSON.parse(mall_cart_list);
      for(let i in mall_cart_list){
        if(mall_cart_list[i].id==goods_id){
          mall_cart_list.splice(i,1);
        }
      }
    }

    if (mall_cart_list.length > 0) {
      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorage({
        key: cache_key + 'mall_cart_' + openid,
        data: mall_cart_list,
      })
    } else {
      wx.removeStorage({
        key: cache_key + 'mall_cart_' + openid,
        success: function (res) { },
      })
    }
    that.getToalFee(goods_online_list);
    
  },
  clearOffLineGoods:function(e){
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    var that = this;
    var goods_offline_list = that.data.goods_offline_list;
    if(mall_cart_list!=''){
      mall_cart_list = JSON.parse(mall_cart_list);
      for(let i in goods_offline_list){
        for(let j in mall_cart_list){
          if(goods_offline_list[i].id==mall_cart_list[j].id){
            mall_cart_list.splice(j,1);
            
          }
        }
      }
      if(mall_cart_list.length>0){
        mall_cart_list = JSON.stringify(mall_cart_list);
        wx.setStorage({
          key: cache_key + 'mall_cart_' + openid,
          data: mall_cart_list,
        })
      }else{
        wx.removeStorage({
          key: cache_key + 'mall_cart_' + openid,
          success: function(res) {},
        })
      }

    }
    that.setData({
      goods_offline_list:[]
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //
  touchstart: function (e) {
    let self = this;
    //开始触摸时 重置所有删除
    let data = self.touch._touchstart(e, this.data.list)
    this.setData({
      list: data
    })
  },

  //滑动事件处理
  touchmove: function (e) {
    let self = this;
    let data = self.touch._touchmove(e, this.data.list)
    this.setData({
      list: data
    })
  },
})