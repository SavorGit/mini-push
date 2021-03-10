// pages/find/picture.js
const app = getApp();
let utils = require("../../utils/util.js");
let mta = require('../../utils/mta_analysis.js');
var pubdetail;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var pageid = 21;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    pageFrom: null, // 来源页面地址
    link_type: app.globalData.link_type, //1:外网投屏  2：直连投屏
    picinfo: [],
    is_replay_disabel: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    var is_hot = 0;
    var res_id = 0;
    if(typeof(options.res_id)!='undefined'){
      res_id = options.res_id;
    }
    if(typeof(options.is_hot)!='undefined'){
      var is_hot = options.is_hot;
    }
    let pages = getCurrentPages(); //当前页面栈
    if (pages.length > 1) {
      self.setData({
        pageFrom: pages[1].route
      });
    } else {
      self.setData({
        pageFrom: ''
      });
    }

    // console.log('onLoad', 'self.data.link_type', self.data.link_type);
    if (self.data.link_type == 2) {
      return;
    }

    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    var box_mac = options.box_mac;

    //wx.hideShareMenu();
    var forscreen_id = options.forscreen_id;

    utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
      openid:openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (data.result.is_have == 1) {//如果已连接盒子
        self.setData({
          
          hotel_info: data.result,
          
        })
      }
    })
    utils.PostRequest(api_v_url + '/Find/showPic', {
      forscreen_id: forscreen_id,
      openid: openid,
      res_id:res_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      self.setData({
        picinfo: data.result,
        play_num: data.result.play_num,
        collect_num: data.result.collect_num,
        share_num: data.result.share_num,
        is_collect: data.result.is_collect,
        openid: openid,
        box_mac: box_mac,
        is_replay_disabel:false,
        is_hot:is_hot
      })
    })

  },
  //预览图片
  previewImage: function(e) {
    let self = this;
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']
    }
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls, // 需要预览的图片http链接列表
      success: function(res) {
        utils.tryCatch(mta.Event.stat('FindPic_PicDetail_PreviewImage', {
          'openid': self.data.openid,
          'from': self.data.pageFrom,
          'status': 'success'
        }));
      },
      fail: function(e) {
        utils.tryCatch(mta.Event.stat('FindPic_PicDetail_PreviewImage', {
          'openid': self.data.openid,
          'from': self.data.pageFrom,
          'status': 'fail'
        }));
      }
    })
  },
  //收藏资源
  onCollect: function(e) {
    var self = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;

    var res_type = e.target.dataset.type;
    utils.tryCatch(mta.Event.stat('FindPic_PicDetail_Favorite', {
      'openid': self.data.openid,
      'from': self.data.pageFrom,
      'boxmac': self.data.box_mac,
      'status': true
    }));

    utils.PostRequest(api_v_url + '/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      self.setData({
        is_collect: 1,
        collect_num: data.result.nums,
      })
    },res=>{
      app.showToast('网络异常，请稍后重试');
    })

    
  }, //收藏资源结束
  //取消收藏
  cancCollect: function(e) {
    var self = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;

    var res_type = e.target.dataset.type;
    utils.tryCatch(mta.Event.stat('FindPic_PicDetail_Favorite', {
      'openid': self.data.openid,
      'from': self.data.pageFrom,
      'boxmac': self.data.box_mac,
      'status': false
    }));

    utils.PostRequest(api_v_url + '/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      self.setData({
        is_collect: 0,
        collect_num: data.result.nums,
      })
    },res=>{
      app.showToast('网络异常，请稍后重试')
    })

    
  }, //取消收藏结束
  //点击分享按钮
  onShareAppMessage: function(res) {
    var self = this;
    var openid = self.data.openid;
    var picinfo = self.data.picinfo;

    var res_id = picinfo.forscreen_id;

    var res_type = 2;
    var pubdetail = picinfo.pubdetail;
    var img_url = pubdetail[0]['res_url'];
    // console.log(img_url);
    utils.tryCatch(mta.Event.stat('FindPic_PicDetail_Share', {
      'openid': self.data.openid,
      'from': self.data.pageFrom,
      'boxmac': self.data.box_mac
    }));
    var share_num = self.data.share_num;

    if (res.from === 'button' || res.from=='menu') {

      // 转发成功
      share_num = share_num++;

      utils.PostRequest(api_v_url + '/share/recLogs', {
        'openid': openid,
        'res_id': res_id,
        'type': res_type,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        self.setData({
          share_num: data.result.share_nums,
        })
      },res=>{
        app.showToast('网络异常，请稍后重试');
      })

      
      //var share_url = '/pages/share/pic?forscreen_id=' + res_id;
      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: '/pages/share/pic?forscreen_id=' + res_id,
        imageUrl: img_url,
        success: function(res) {

        }
      }
    }
  }, // 分享结束
  //电视播放
  boxShow(e) {
    var self = this;
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id

    pubdetail = e.currentTarget.dataset.pubdetail;
    var forscreen_char = '';

    var res_type = e.currentTarget.dataset.res_type;
    var res_nums = e.currentTarget.dataset.res_nums;
    if (res_type == 1) {
      var action = 11; //发现图片点播
    } else if (res_type == 2) {
      var action = 12; //发现视频点播
    }
    var hotel_info = self.data.hotel_info;
    var is_hot = self.data.is_hot;
    app.boxShow(box_mac, find_id, pubdetail, res_type, res_nums, action, hotel_info, self,is_hot);

    utils.tryCatch(mta.Event.stat('FindPic_PicDetail_LaunchTV', {
      'openid': self.data.openid,
      'from': self.data.pageFrom,
      'boxmac': self.data.box_mac
    }));
    
      
  }, //电视播放结束
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
  goToBack: function(e) {
    app.goToBack();
  }

})