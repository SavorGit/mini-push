// mall/pages/goods/detail.js
/**
 * 【商城】商品详情页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var goods_id;
var pur_uid;
var openid;
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_v_url + '/User/isRegister', {
      openid: pageContext.data.openid,
      page_id: 2
    }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
      key: 'savor_user_info',
      data: data.result.userinfo,
    }), function () {
      if (app.globalData.link_type != 2) {
        wx.setStorage({
          key: 'savor_user_info',
          data: {
            openid: app.globalData.openid
          }
        })
      }

    }, { isShowLoading: false }),
  },
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    rec_list: [],
    showBuyGoodsPopWindow: false,
    video_url:'',
    goods_id:0,
    selectAttrIndex:'',
    specification_goods:[],
    notice:'',
    showModal: false, //显示授权登陆弹窗
    is_have_gift:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    pur_uid = '';
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      self.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(self); //判断用户是否注册
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          self.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(self); //判断用户是否注册
        }
      }
    }
    if (typeof (options.q) != 'undefined') {
      var q = decodeURIComponent(options.q);
      var selemite = q.indexOf("?");
      var pams = q.substring(selemite + 3, q.length);

      var pams_arr = pams.split('_');
      goods_id = pams_arr[1];
      if(typeof(pams_arr[3])!='undefined'){
        pur_uid = pams_arr[3];
      }
      
      self.setData({
        is_share: true
      })

    } else {
      goods_id = options.goods_id;
      if (typeof (options.is_share) != 'undefined' && options.is_share == 1) {
        self.setData({
          is_share: true
        })
      } else {
        self.setData({
          is_share: false
        })
      }
    }


    //获取商品详情
    self.getGoodsInfo(goods_id);
    //优选推荐
    self.getRecommend(goods_id, 1, 3);

  },
  getGoodsInfo: function (goods_id) {
    var that = this;
    utils.PostRequest(api_v_url + '/dish/detail', {
      goods_id: goods_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      var gift = data.result.gift
      if (JSON.stringify(gift) == '{}') {
        var is_have_gift = false;
      } else {
        var is_have_gift = true;
      }
      that.setData({
        notice:data.result.notice,
        specification_goods:data.result.specification_goods,
        video_url:data.result.video_url,
        goods_info: data.result,
        merchant: data.result.merchant,
        goods_id: data.result.goods_id,
        gift:data.result.gift,
        is_have_gift:is_have_gift
      })
    },function(){
        var is_share = that.data.is_share
        if (is_share == true) {
          wx.reLaunch({
            url: '/pages/shopping/index',
          })
  
        } else {
          wx.navigateBack({
            delta: 1
          })
        }
    });
  },
  getRecommend: function (goods_id, page, pagesize) {
    var that = this;
    utils.PostRequest(api_v_url + '/shop/recommend', {
      page: page,
      pagesize: pagesize,
      goods_id: goods_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        rec_list: data.result,
      })
    });
  },
  gotoMerchant: function (e) {
    var merchant_id = e.currentTarget.dataset.merchant_id;
    wx.navigateTo({
      url: '/pages/hotel/shop?merchant_id=' + merchant_id,
    })
  },
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    app.phonecallevent(tel)
  },
  addMallCart: function (e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    var is_self = that.data.is_self;
    var goods_info = {};
    if (is_self == 1) {
      var temp = that.data.goods_cart_info;
      goods_info.id = temp.goods_id;
      goods_info.name = temp.name;
      goods_info.price = temp.price;
      goods_info.line_price = temp.line_price;
      goods_info.stock_num = temp.stock_num;
      goods_info.type = temp.type;
      if(temp.gtype==1){
        goods_info.img_url = temp.cover_imgs[0];
      }else {
        goods_info.img_url = temp.model_img;
      }
      
      goods_info.amount = temp.amount;
      goods_info.ischecked = true;
    } else if (is_self == 2) {
      var temp = that.data.goods_cart_info;
      goods_info.id = temp.id;
      goods_info.name = temp.name;
      goods_info.price = temp.price;
      goods_info.stock_num = temp.stock_num;
      goods_info.type = temp.type;
      if(goods_info.gtype==1){
        goods_info.img_url = temp.img_url;
      }else {
        goods_info.img_url = temp.model_img;
      }
      
      goods_info.amount = temp.amount;
      goods_info.ischecked = true;
    }
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    if (mall_cart_list == '') {
      mall_cart_list = [];
      mall_cart_list.unshift(goods_info);
      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
      that.setData({
        mall_cart_nums: goods_info.amount
      })
    } else {
      mall_cart_list = JSON.parse(mall_cart_list)

      var is_have = 0;
      for (var i = 0; i < mall_cart_list.length; i++) {
        if (mall_cart_list[i].id == goods_info.id) {
          mall_cart_list[i].amount += goods_info.amount;
          is_have = 1;
          break;
        }
      }
      if (is_have == 0) {
        mall_cart_list.unshift(goods_info);
      }
      var mall_cart_nums = 0;
      for (let index in mall_cart_list) {
        mall_cart_nums += mall_cart_list[index].amount;
      }
      that.setData({
        mall_cart_nums: mall_cart_nums
      })

      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
    }
    that.setData({ showBuyGoodsPopWindow: false })
    app.showToast('添加购物车成功');
  },
  gotoGoodsDetail: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/pages/hotel/goods/detail?goods_id=' + goods_id,
    })
  },
  gotoRecList: function (e) {
    wx.navigateTo({
      url: '/mall/pages/goods/recommendation',
    })
  },
  // 打开购买弹窗
  openBuyGoodsPopWindow: function (e) {
    console.log(e)
    let that = this;
    var is_self = e.currentTarget.dataset.is_self;
    if (is_self == 1) {
      var goods_cart_info = that.data.goods_info;
      var goods_id = e.currentTarget.dataset.goods_id
    } else {
      var goods_cart_info = e.currentTarget.dataset.goods_info;
      var goods_id = goods_cart_info.id; 
    }
    goods_cart_info.amount = 1;
    var action = e.currentTarget.dataset.action
    if(action==3){
      var user_info = wx.getStorageSync(cache_key+'user_info');
      if(user_info.is_wx_auth !=3){
        that.setData({
          showModal:true,
          goods_cart_info: goods_cart_info,
          action: action,
          is_self: is_self,
          goods_id:goods_id
        })
        return false
      }
    }
    
    that.setData({
      showBuyGoodsPopWindow: true,
      showBuyGoodsPopWindowAnimation: true,
      goods_cart_info: goods_cart_info,
      action: action,
      is_self: is_self,
      goods_id:goods_id
    });
  },

  // 关闭购买弹窗
  closeBuyGoodsPopWindow: function (e) {
    let self = this;
    self.setData({
      showBuyGoodsPopWindowAnimation: false,
    }, function () {
      setTimeout(function () {
        self.setData({
          showBuyGoodsPopWindow: false
        });
      }, 500);
    });
  },
  //购物车减数量
  cutNum: function (e) {
    var that = this;
    var goods_cart_info = that.data.goods_cart_info;
    var stock_num = goods_cart_info.stock_num; //库存
    if (goods_cart_info.amount == 1) {
      app.showToast('至少选择一件商品');
      return false;
    }
    goods_cart_info.amount -= 1;
    that.setData({
      goods_cart_info: goods_cart_info,
    })
  },
  //购物车增数量
  addNum: function (e) {
    var that = this;
    //var goods_info = that.data.goods_info;
    var goods_cart_info = that.data.goods_cart_info;
    var stock_num = goods_cart_info.stock_num; //库存
    if (goods_cart_info.amount == stock_num) {
      app.showToast('该商品库存不足');
      return false;
    }
    goods_cart_info.amount += 1;
    that.setData({
      goods_cart_info: goods_cart_info,
    })
  },
  buyOne: function (e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    var goods_info = this.data.goods_info;
    var goods_id = goods_info.goods_id;
    var amount = goods_info.amount;
    var order_type = 1;

    var action = that.data.action;
    if(action ==2){//立即购买
      wx.navigateTo({
        url: '/mall/pages/order/confirmation?goods_id=' + goods_id + '&openid=' + openid + '&amount=' + amount + '&order_type=' + order_type + '&pur_uid=' + pur_uid,
        success: function (res) {
          that.setData({
            showBuyGoodsPopWindow: false,
          })
        }
      })
    }else if (action==3){//赠送好友
      wx.navigateTo({
        url: '/mall/pages/gift/order/present?goods_id=' + goods_id + '&openid=' + openid + '&amount=' + amount ,
        success: function (res) {
          that.setData({
            showBuyGoodsPopWindow: false,
          })
        }
      })
    }
    
  },
  gotoMallCart: function (e) {
    wx.navigateTo({
      url: '/mall/pages/goods/shopping_cart',
    })
  },
  selectModel:function(e){
    var that = this;
    var goods_info = that.data.goods_info;
    var index = e.currentTarget.dataset.index;  //规格分类
    var idx   = e.currentTarget.dataset.idx;    //规格类型
    for(let j in goods_info.attrs[index].attrs){
      if(goods_info.attrs[index].attrs[j].is_select==1){
        goods_info.attrs[index].attrs[j].is_select = 0;
        break;
      }
    }
    goods_info.attrs[index].attrs[idx].is_select = 1;
    
    //通过接口获取对应规格的商品信息
    var attr = '';
    var space = '';
    var attrs = goods_info.attrs;
    for(let i in attrs){
      for (let j in attrs[i].attrs){
        if(attrs[i].attrs[j].is_select==1){
          attr += space + attrs[i].attrs[j].id;
          space = '_';
        }
      }
    }
    that.getGoodsDetailByAttrs(attr);

  },
  getGoodsDetailByAttrs:function(attr){
    var that = this;
    
    
    if(attr !=''){
      var goods_id = that.data.goods_id;
      utils.PostRequest(api_v_url + '/goods/getDetailByAttr', {
        attr: attr,
        goods_id:goods_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        var goods_info = data.result;
        goods_info.amount = 1;
        that.setData({
          goods_info:goods_info,
          goods_cart_info:goods_info
        })
      }, re => { }, { isShowLoading: false });
    }
  },
  selectAttrs:function(e){
    var that = this;
    console.log(e)
    var index = e.currentTarget.dataset.index;
    var attr_ids = e.currentTarget.dataset.attr_ids;

    var goods_id = that.data.goods_id;
      utils.PostRequest(api_v_url + '/goods/getDetailByAttr', {
        attr: attr_ids,
        goods_id:goods_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        var goods_info = data.result;
        goods_info.amount = 1;
        that.setData({
          goods_info:goods_info,
          goods_cart_info:goods_info,
          selectAttrIndex:index,
          showBuyGoodsPopWindow: true,
          showBuyGoodsPopWindowAnimation: true,
        })
      }, re => { }, { isShowLoading: false });



   
    /*that.setData({
      showBuyGoodsPopWindow: true,
      showBuyGoodsPopWindowAnimation: true,
      goods_cart_info: goods_cart_info,
      action: action,
      is_self: is_self,
      goods_id:goods_id
    });*/
  },
  //赠送好友
  present:function(e){
    var that = this;
    var user_info = wx.getStorageSync(cache_key+"user_info");
    var openid = user_info.openid;
    wx.navigateTo({
      url: '/mall/pages/gift/order/present?goods_id=' + goods_id + '&openid=' + openid + '&amount=1',
    })
  },
  closeWxAuth: function (e) {
    var that = this;
    that.setData({
      showModal: false,
    })
    mta.Event.stat("closewxauth", {})
  },
  onGetUserInfo: function (res) {
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    mta.Event.stat("clickonwxauth", {})
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          utils.PostRequest(api_v_url + '/User/registerCom', {
            'openid': openid,
            'avatarUrl': rets.userInfo.avatarUrl,
            'nickName': rets.userInfo.nickName,
            'gender': rets.userInfo.gender,
            'session_key': app.globalData.session_key,
            'iv': rets.iv,
            'encryptedData': rets.encryptedData
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.setStorage({
              key: 'savor_user_info',
              data: data.result,
            });
            that.setData({
              showModal: false,
              showBuyGoodsPopWindow: true,
              showBuyGoodsPopWindowAnimation: true,
            })
          }, res => wx.showToast({
            title: '微信登陆失败，请重试',
            icon: 'none',
            duration: 2000
          }));

        }
      })
      mta.Event.stat("allowauth", {})
    } else {
      utils.PostRequest(api_url + '/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info['is_wx_auth'] = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
      });
      mta.Event.stat("refuseauth", {})
    }


  },
  gotoGiftDetail:function(e){
    var gift_id = e.currentTarget.dataset.gift_id;
    wx.navigateTo({
      url: '/pages/hotel/goods/detail?goods_id='+gift_id,
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
  onShareAppMessage: function (e) {
    var that = this;

    var img_url = that.data.goods_info.cover_imgs[0];
    var goods_name = that.data.goods_info.name;
    var hotel_name = that.data.merchant.name;
    var goods_id = that.data.goods_info.goods_id;
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: hotel_name + '推出了特惠商品-' + goods_name,
        path: '/pages/hotel/goods/detail?goods_id=' + goods_id + "&is_share=1",
        imageUrl: img_url,
        success: function (res) {
        },
      }
    } else {
      return {
        title: hotel_name + '推出了特惠商品-' + goods_name,
        path: '/pages/hotel/goods/detail?goods_id=' + goods_id + "&is_share=1",
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }
  }
})