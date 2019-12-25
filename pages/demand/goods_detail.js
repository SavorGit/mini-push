// pages/demand/goods_detail.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var box_mac;
var openid;
var goods_info;
var goods_nums = 1;
var hotel_info;
var pageid = 11;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    documentHeight: app.SystemInfo.documentHeight,
    link_type: app.globalData.link_type, //1:外网投屏  2：直连投屏
    goods_info: [],
    showInputGoodsCount: false,
    goods_nums: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (that.data.link_type == 2) {
      return;
    }

    var user_info = wx.getStorageSync('savor_user_info');
    openid = user_info.openid;
    box_mac = options.box_mac;
    var goods_id = options.goods_id;
    var goods_box_mac = '';
    var uid = '';
    var is_header = 0;
    if (typeof(options.goods_box_mac) != 'undefined') {
      goods_box_mac = options.goods_box_mac;
    } else {
      goods_box_mac = box_mac
    }

    if (typeof(options.uid) != 'undefined') {
      uid = options.uid;
    }
    if (typeof(options.is_header) != 'undefined') {
      is_header = 1;
    }
    that.setData({
      goods_box_mac: goods_box_mac,
      uid: uid,
      is_header: is_header
    })
    utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox', {
      openid: openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      hotel_info: data.result;
      that.setData({
        hotel_info: data.result
      })
    });
    utils.PostRequest(api_url + '/Smallapp4/optimize/detail', {
        uid: uid,
        goods_id: goods_id,
        openid: openid,
        box_mac: goods_box_mac
      }, (data, headers, cookies, errMsg, statusCode) => {
        goods_info = data.result
        that.setData({
          goods_info: data.result
        })
        mta.Event.stat('enterContent', { 'goodsid': goods_id })
      }

    );
    

  },
  //电视播放
  /*boxShow: function(e) {
    var forscreen_id = e.currentTarget.dataset.goods_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.media_type;
    var res_nums = 1;
    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums,5);
  },*/
  clickBuyGoods: function(e) {
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var goods_id = e.currentTarget.dataset.goods_id;
    utils.PostRequest(api_url + '/Smallapp3/datalog/recordlog', {
      openid: openid,
      data_id: goods_id,
      action_type: 3,
      type: 2
    });
    mta.Event.stat('clickAddJdorder', { 'openid': openid, 'goodsid': goods_id })
  },
  playGoodsVideo: function (e) {
    let self = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    mta.Event.stat('detailPageClickPlay', {
      'openid': openid,
      'videourl': self.data.video_url
    });
  },
  pauseGoodsVideo: function (e) {
    let self = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    mta.Event.stat('detailPageClickPause', {
      'openid': openid,
      'videourl': self.data.video_url
    });
  },
  fullscreenGoodsVideo: function (e) {
    let self = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    mta.Event.stat('detailPageClickFullScreen', {
      'openid': self.data.openid,
      'video': self.data.oss_video_url,
      'fullscreen': e.detail.fullScreen
    });
  },
  
  goToBack: function (e) {
    app.goToBack();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  //电视播放
  boxShow: function(e) {
    var self = this;
    var forscreen_id = e.currentTarget.dataset.goods_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    var res_type = 2;
    var res_nums = 1;


    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, 5, hotel_info);
    if (box_mac) {
      // 调用记录播放次数接口
      utils.PostRequest(api_url + '/Smallapp4/demand/recordPlaynum', {
        openid: openid,
        res_id: forscreen_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        let goods_info = self.data.goods_info;
        goods_info.play_num = data.result.play_num;
        self.setData({
          goods_info: goods_info
        });
      });
    }
    mta.Event.stat('detailPageclickTvPlay', { 'openid': openid, 'goodsid': forscreen_id })
  },
  //收藏资源
  onCollect: function(e) {
    var that = this;
    //var openid = e.target.dataset.openid;
    //var res_id = e.target.dataset.res_id;
    var res_id = e.currentTarget.dataset.res_id;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var res_type = 4;
    utils.PostRequest(api_url + '/Smallapp/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      goods_info.is_collect = 1;
      goods_info.collect_num = data.result.nums;
      that.setData({
        goods_info: goods_info
      });
    }, res => wx.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none',
      duration: 2000
    }));
    mta.Event.stat('detailPageClickCollect', { 'openid': openid, 'goodsid': res_id,'liketype':1 })
  }, //收藏资源结束
  //取消收藏
  cancCollect: function(e) {
    var that = this;
    //var res_id = e.target.dataset.res_id;
    var res_id = e.currentTarget.dataset.res_id;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var res_type = 4;
    utils.PostRequest(api_url + '/Smallapp/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      goods_info.is_collect = 0;
      goods_info.collect_num = data.result.nums;
      that.setData({
        goods_info: goods_info
      });
    }, res => wx.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none',
      duration: 2000
    }));
    mta.Event.stat('detailPageClickCollect', { 'openid': openid, 'goodsid': res_id, 'liketype': 2 })
  }, //取消收藏结束
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var res_id = res.target.dataset.res_id;
    var img_url = res.target.dataset.img_url;

    var goods_id = res.target.dataset.goods_id;

    if (res.from === 'button') {
      // 转发成功
      utils.PostRequest(api_url + '/Smallapp/share/recLogs', {
        'openid': openid,
        'res_id': goods_id,
        'type': 4,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        goods_info.share_num++;
        that.setData({
          goods_info: goods_info
        });
      }, res => wx.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none',
        duration: 2000
      }));
      mta.Event.stat('detailPageClickShare', { 'openid': openid, 'goodsid': goods_id })
      // 来自页面内转发按钮
      return {
        title: '热点聚焦，投你所好',
        path: '/pages/demand/goods_detail?goods_id=' + goods_id + '&box_mac=&is_header=1',
        imageUrl: img_url,
        success: function(res) {


        },
      }
    }
  },
  showTc: function(e) {
    var that = this;
    var goods_box_mac = e.currentTarget.dataset.goods_box_mac;
    var uid = e.currentTarget.dataset.uid;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var goods_id = e.currentTarget.dataset.goods_id;
    if (goods_box_mac == '') {
      app.scanQrcode(pageid);
    } else if (uid == '') {

      wx.showToast({
        title: '店内商品购买有误',
        icon: 'none',
        duration: 2000,
      })
    } else {
      goods_nums = 1;
      that.setData({
        showInputGoodsCount: true,
        goods_nums: goods_nums
      })
    }
    mta.Event.stat('clickAddorder', { 'openid': openid,'goods_id':goods_id })
  },
  closeAct: function(res) {
    var that = this;
    that.setData({
      showInputGoodsCount: false,
    })
  },
  changeActNums: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    if (type == 1) { //数量增加
      if (goods_nums == 10) {
        wx.showToast({
          title: '数量不能大于10',
          icon: 'none',
          duration: 2000,
        })
      } else {
        goods_nums += 1;
      }
    } else if (type == 2) { //数量减少
      if (goods_nums == 1) {
        wx.showToast({
          title: '数量不能小于1',
          icon: 'none',
          duration: 2000,
        })
      } else {
        goods_nums -= 1;
      }
    }
    that.setData({
      goods_nums: goods_nums,
    })
  },
  //店内购买
  shopBuyGoods: function(e) {
    var that = this;
    var goods_id = e.currentTarget.dataset.goods_id;
    var goods_nums = e.currentTarget.dataset.goods_nums;
    var goods_box_mac = e.currentTarget.dataset.goods_box_mac;
    var buy_type = e.currentTarget.dataset.buy_type;
    var uid = e.currentTarget.dataset.uid;
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    utils.PostRequest(api_url + '/Smallsale/order/addOrder', {
      goods_id: goods_id,
      box_mac: goods_box_mac,
      amount: 1,
      openid: openid,
      buy_type: buy_type,
      uid: uid
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (data.code == 10000) {
        if (buy_type == 1) {
          wx.showToast({
            title: '购买成功',
            icon: 'none',
            duration: 2000,
          });
        }
        that.setData({
          showInputGoodsCount: false,
        });
      } else {
        if (buy_type == 1) {
          wx.showToast({
            title: data.msg,
            icon: 'none',
            duration: 3000,
          });
        }
        that.setData({
          showInputGoodsCount: false,
        });
      }
    }, res = {}, {
      isShowToastForSuccess: false
    });
    
  },
})