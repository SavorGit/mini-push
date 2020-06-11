// pages/hotel/gift/share.js
/**
 * 【商城】赠品领取页面
 */


const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var order_id;
var openid; //用户openid
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_v_url + '/User/isRegister', {
      openid: pageContext.data.openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      pageContext.setData({
        user_info: data.result.userinfo
      })
      wx.setStorage({
        key: 'savor_user_info',
        data: data.result.userinfo,
      })

    }, function () {
      wx.setStorage({
        key: 'savor_user_info',
        data: {
          openid: app.globalData.openid
        }
      })

    }),
  },

};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    receive_num: 1, //领取礼品数量
    openid: '',
    showModal: false, //显示授权登陆弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.hideShareMenu()
    
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      });
      
      order_id = options.order_id;
      console.log('order_id_'+order_id)
      SavorUtils.User.isRegister(that); //判断用户是否注册
      that.getGiftInfo(app.globalData.openid, order_id); //获取礼品信息
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(that); //判断用户是否注册
          order_id = options.order_id;
          console.log('order_id'+order_id)
          console.log('openid'+openid)
          that.getGiftInfo(openid, order_id); //获取礼品信息
        }
      }
      
      
    }
  },
  /**
   * @desc   获取礼品信息
   * @param {*} openid    当前用户openid
   * @param {*} order_id  礼品订单id
   */
  getGiftInfo: function (openid, order_id) {
    var that = this;
    console.log(order_id)
    utils.PostRequest(api_v_url + '/gift/info', {
      openid: openid,
      order_id: order_id,
    }, (data, headers, cookies, errMsg, statusCode) => {

      var records = data.result.records //领取列表
      var amount = data.result.amount
      var person_upnum = data.result.person_upnum; //最大领取分数
      var goods_info = data.result.goods;
      var merchant_info = data.result.merchant;
      var receive_type = data.result.receive_type;
      var expire_date = data.result.expire_date;
      var message = data.result.message;
      var nickName = data.result.nickName;
      var have_receive_num = data.result.receive_num;
      that.setData({
        order_info: data.result,
        records: records,
        amount: amount,
        expire_date:expire_date,
        goods_info: goods_info,
        person_upnum: person_upnum,
        merchant_info: merchant_info,
        receive_type: receive_type,
        message:message,
        nickName:nickName,
        have_receive_num:have_receive_num
      })
      
      var receive_num      = data.result.receive_num;
      //判断是否领取过但是未填写地址
      
      var receive_order_id = data.result.order_id
      
      

      if(receive_type == 3 ){//已领取1个待添加收货地址
        
        wx.navigateTo({
          url: '/mall/pages/gift/accept/index?order_id=' + receive_order_id + '&openid=' + openid+'&nickName='+nickName+'&goods_id='+goods_info.id+'&receive_num='+receive_num,
        })

      }else if(receive_type==7){
        
        
        wx.navigateTo({
          url: '/mall/pages/gift/accept/index?order_id=' + receive_order_id + '&openid=' + openid+'&nickName='+nickName+'&goods_id='+goods_info.id+'&receive_num='+receive_num,
        })
      }
      else if( receive_type==8){
        console.log(11111)
        wx.navigateTo({
          url: '/mall/pages/gift/accept/multy_gift?order_id=' + receive_order_id + '&openid=' + openid+'&nickName='+nickName+'&goods_id='+goods_info.id+'&receive_num='+receive_num,
        })
      }
    }, function () {
      wx.reLaunch({
        url: '/pages/shopping/index',
      })

    });
  },

  cutReceiveAmount: function (e) {
    var that = this;
    //判断领取数量是否超过最大值 或者剩余数量
    //var remian_num = that.data.remian_num;
    var person_upnum = that.data.person_upnum;
    var receive_num = that.data.receive_num;
    if (receive_num == 1) {
      app.showToast('最少领取一份');
      return false;
    }
    receive_num -= 1;
    that.setData({
      receive_num: receive_num
    })
  },
  addReceiveAmount: function (e) {
    var that = this;
    //var remian_num = that.data.remian_num;
    var person_upnum = that.data.person_upnum;
    var receive_num = that.data.receive_num;

    if (receive_num >= person_upnum) {
      app.showToast('最多可领取' + person_upnum + '份');
      return false;
    }
    receive_num += 1;
    that.setData({
      receive_num: receive_num
    })
  },
  onGetUserInfo: function (res) {
    var that = this;

    var user_info = wx.getStorageSync(cache_key + "user_info");
    var openid = user_info.openid;
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
              key: cache_key + 'user_info',
              data: data.result,
            });
            that.setData({
              showModal: false,
            })
            //领取礼品
            that.receiveGift();
          }, res => wx.showToast({
            title: '微信登陆失败，请重试',
            icon: 'none',
            duration: 2000
          }));

        }
      })
      mta.Event.stat("allowauth", {})
    } else {
      utils.PostRequest(api_v_url + '/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info.is_wx_auth = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
      });
      mta.Event.stat("refuseauth", {})
    }


  },
  closeWxAuth: function (e) {
    var that = this;
    that.setData({
      showModal: false,
    })
    mta.Event.stat("closewxauth", {})
  },

  
  receiveGift: function () {
    var that = this;
    var user_info = wx.getStorageSync(cache_key+'user_info');
    var openid = user_info.openid;
    if(user_info.is_wx_auth!=3){
      that.setData({
        showModal:true
      })
    }else {
      var receive_num = that.data.receive_num
    utils.PostRequest(api_v_url + '/gift/receive/', {
      openid: openid,
      order_id: order_id,
      receive_num: receive_num,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var receive_type = data.result.receive_type;
      var nickName = that.data.nickName;
      
      var goods_info = that.data.goods_info;
      that.setData({receive_type:receive_type})
      if (receive_type == 3 ) {
        wx.navigateTo({
          url: '/mall/pages/gift/accept/index?order_id=' + order_id + '&openid=' + openid+'&nickName='+nickName+'&goods_id='+goods_info.id+'&receive_num='+receive_num,
        })
        
      } else if (receive_type == 1) {
        var user_info = wx.getStorageSync(cache_key+'user_info');
        var openid = user_info.openid;
        utils.PostRequest(api_v_url + '/gift/receiveResult', {
          openid: openid,
          order_id: order_id,
          receive_num: receive_num,
        }, (data, headers, cookies, errMsg, statusCode) => {
          var receive_order_id = data.result.order_id
          var receive_type     = data.result.receive_type;
          if (receive_type == 3 ) {
            
            wx.navigateTo({
              url: '/mall/pages/gift/accept/index?order_id=' +receive_order_id + '&openid=' + openid+'&nickName='+nickName+'&goods_id='+goods_info.id+'&receive_num='+receive_num,
            })
          }
        })

      }else if(receive_type==4){
        that.setData({receive_type:receive_type})

        app.showToast('亲,该商品已领完~');
        var openid = that.data.openid;
        that.getGiftInfo(openid, order_id); //获取礼品信息
      }else if(receive_type==5){
        that.setData({receive_type:receive_type})
        app.showToast('亲,该商品订单已过期')
      }


    });
    }
    
  },
  gotoGoodsDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/pages/hotel/goods/detail?goods_id='+goods_id,
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
    var that = this;
    var openid = that.data.openid;
    if (openid != '') {
      that.getGiftInfo(openid, order_id);
    }
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

  }
})