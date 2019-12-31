// pages//thematic/money_blessing/receive_result.js
const app = getApp();
var openid;
var discovery_list; //发现列表
var pubdetail;
var i;
var is_open_simple;
var api_url = app.globalData.api_url;
var netty_url = app.globalData.netty_url;
var pageid = 62;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var order_id = options.order_id;
    var sign     = options.sign;
    var user_id = options.user_id;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    is_open_simple = user_info.is_open_simple;
    wx.request({
      url: api_url+'/Smallapp3/redpacket/grabBonusResult',
      header: {
        'content-type': 'application/json'
      },
      data:{
        order_id: order_id,
        sign: sign,
        user_id: user_id,
      },
      success:function(res){
        if(res.data.code==10000){
          that.setData({
            order_status: res.data.result.status,
            order_id: res.data.result.order_id,
            user_id: res.data.result.user_id,
            bless: res.data.result.bless,
            money: res.data.result.money,
            nickName: res.data.result.nickName,
            avatarUrl: res.data.result.avatarUrl,
            box_mac: res.data.result.box_mac,
            openid : openid,
            is_open_simple: is_open_simple,
          })
          getRedpacketJx(openid);
        }else {
          wx.reLaunch({
            url: '/pages/index/index',
          })
          wx.showToast({
            title: '红包领取失败',
            icon: 'none',
            duration: 2000,
          })
        }
      }
    })
    function getRedpacketJx(openid) {
      wx.request({
        url: api_url+'/Smallapp3/Find/redPacketJx',
        header: {
          'content-type': 'application/json'
        },
        data: {
          openid: openid,
        },
        success: function (res) {
          if (res.data.code == 10000) {
            discovery_list = res.data.result
            that.setData({
              discovery_list: res.data.result,
            })
          }
        }
      })
    }
  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']

    }
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  //选择照片上电视
  chooseImage(e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
      })
    }
  },
  //选择视频投屏
  chooseVedio(e) {
    var that = this
    var user_info = wx.getStorageSync("savor_user_info");
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    if (box_mac == '' || box_mac == 'undefined') {
      app.scanQrcode(pageid);
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
      })
    }


  },
  showHappy: function (e) {
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '' || box_mac == 'undefined') {
      app.scanQrcode(pageid);
    } else {
      wx.navigateTo({
        url: '/pages/thematic/birthday/list?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
  },
  demand: function (res) {//点播节目
    wx.switchTab({
      url: '/pages/demand/index',
    })
  },
  
  //电视播放
  boxShow(e) {
    var that =  this;
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id
    pubdetail = e.target.dataset.pubdetail;
    var forscreen_char = '';
    var res_type = e.target.dataset.res_type;
    var res_nums = e.target.dataset.res_nums;
    if (res_type == 1) {
      var action = 11; //发现图片点播
    } else if (res_type == 2) {
      var action = 12; //发现视频点播
    }
    app.boxShow(box_mac, find_id, pubdetail, res_type, res_nums, action, '', that);
    
  }, //电视播放结束
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;
    wx.request({
      url: api_url+'/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 1,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        for (var i = 0; i < discovery_list.length; i++) {
          if (i == res_key) {
            discovery_list[i].is_collect = 1;
            discovery_list[i].collect_num = collect_nums;
          }
        }
        that.setData({
          discovery_list: discovery_list
        })

      },
      fial: function ({
        errMsg
      }) {
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }, //收藏资源结束
  //取消收藏
  cancCollect: function (e) {
    var that = this;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;
    var openid = e.target.dataset.openid;
    wx.request({
      url: api_url+'/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 0,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        for (var i = 0; i < discovery_list.length; i++) {
          if (i == res_key) {
            discovery_list[i].is_collect = 0;
            discovery_list[i].collect_num = collect_nums;
          }
        }
        that.setData({
          discovery_list: discovery_list
        })

      },
      fial: function ({
        errMsg
      }) {
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }, //取消收藏结束
  //点击分享按钮
  onShareAppMessage: function (res) {
    var that = this;
    var res_id = res.target.dataset.res_id;
    var res_key = res.target.dataset.res_key;
    var res_type = res.target.dataset.res_type;
    var openid = res.target.dataset.openid;
    var pubdetail = res.target.dataset.pubdetail;

    if (res_type == 1) {
      var img_url = pubdetail[0]['res_url'];
      var share_url = '/pages/share/pic?forscreen_id=' + res_id;
    } else {
      var img_url = pubdetail[0]['vide_img'];
      var share_url = '/pages/share/video?res_id=' + res_id + '&type=2';
    }

    if (res.from === 'button') {
      // 转发成功
      wx.request({
        url: api_url+'/Smallapp/share/recLogs',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'openid': openid,
          'res_id': res_id,
          'type': 2,
          'status': 1,
        },
        success: function (e) {
          for (var i = 0; i < discovery_list.length; i++) {
            if (i == res_key) {
              discovery_list[i].share_num++;
            }
          }
          that.setData({
            discovery_list: discovery_list
          })

        },
        fail: function ({
          errMsg
        }) {
          wx.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: share_url,
        imageUrl: img_url,
        success: function (res) {

        },
      }
    }
  }, // 分享结束
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

  
})