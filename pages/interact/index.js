// pages/interact/index.js
const app = getApp()
var openid;
var api_url = app.globalData.api_url;
var netty_url = app.globalData.netty_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    openid:'',
    hotel_name:'',   //酒楼名称
    room_name:'',    //包间名称
    box_mac: '',     //机顶盒mac
    is_link:0,       //是否连接酒楼电视
    happy_vedio_url: '',          //生日视频url
    happy_vedio_name: '',          //生日视频名称
    happy_vedio_title: ''          //生日视频标题
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.hideShareMenu();
    var that = this;
    if (app.globalData.openid && app.globalData.openid != '') { 
      that.setData({
        openid: app.globalData.openid
      })
      wx.request({
        url: api_url+'/Smallapp/index/isHaveCallBox?openid=' + app.globalData.openid,
        headers: {
          'Content-Type': 'application/json'
        },

        success: function (rest) {
          var is_have = rest.data.result.is_have;
          if (is_have == 1) {
            
            that.setData({
              is_link:1,
              hotel_name:rest.data.result.hotel_name,
              room_name:rest.data.result.room_name,
              box_mac :rest.data.result.box_mac,
            })
            getHotelInfo(rest.data.result.box_mac);
            /*var box_mac = rest.data.result.box_mac;
            wx.navigateTo({
              url: '/pages/forscreen/forscreen?scene=' + box_mac,
            })*/
          }else {
            
          }

        }
      })
    }else {
      app.openidCallback = openid => { 
        if (openid != '') { 
          that.setData({
            openid: openid
          })
          wx.request({
            url: api_url+'/Smallapp/index/isHaveCallBox?openid=' + openid,
            headers: {
              'Content-Type': 'application/json'
            },

            success: function (rest) {
              var is_have = rest.data.result.is_have;
              if (is_have == 1) {
                that.setData({
                  is_link: 1,
                  hotel_name: rest.data.result.hotel_name,
                  room_name: rest.data.result.room_name,
                  box_mac: rest.data.result.box_mac,
                })
                getHotelInfo(rest.data.result.box_mac);
                /*var box_mac = rest.data.result.box_mac;
                wx.navigateTo({
                  url: '/pages/forscreen/forscreen?scene=' + box_mac,
                })*/
              }

            }
          })
        }
      }
    }
    function getHotelInfo(box_mac) {
      wx.request({
        url: api_url+'/Smallapp/Index/getHotelInfo',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          box_mac: box_mac,
        },
        method: "POST",
        success: function (res) {
          that.setData({
            hotel_room: res.data.result.hotel_name + res.data.result.room_name,
            happy_vedio_url: res.data.result.vedio_url,
            happy_vedio_name: res.data.result.file_name,
            happy_vedio_title: res.data.result.name,
          })
        }
      })
    }
  },
  //选择照片上电视
  chooseImage(e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    if(box_mac==''){
      app.scanQrcode();   
    }else {
      wx.navigateTo({
        url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid,
      })
    } 
  },
  //选择视频投屏
  chooseVedio(e) {
    var that = this
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '') {
      app.scanQrcode();
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid,
      })
    } 
  },
  boxShow(e) {//视频点播让盒子播放
    var box_mac = e.currentTarget.dataset.boxmac;
    if (box_mac == '') {
      app.scanQrcode();
    }else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;

      var index1 = vediourl.lastIndexOf("/");
      var index2 = vediourl.length;
      var filename = vediourl.substring(index1 + 1, index2);//后缀名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      wx.request({
        url: netty_url+"/push/box",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          cmd: 'call-mini-program',
          msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '"}',
          req_id: timestamp
        },
        success: function (res) {
          wx.showToast({
            title: '点播成功,电视即将开始播放',
            icon: 'none',
            duration: 2000
          });
          wx.request({
            url: api_url+'/Smallapp/index/recordForScreenPics',
            header: {
              'content-type': 'application/json'
            },
            data: {
              openid: openid,
              box_mac: box_mac,
              action: 5,
              mobile_brand: mobile_brand,
              mobile_model: mobile_model,
              forscreen_char: forscreen_char,
              imgs: '["media/resource/' + filename + '"]'
            },
          });
        },
        fail: function (res) {
          wx.showToast({
            title: '网络异常,点播失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
    
  },
  //互动游戏
  hdgames(e) {
    var openid = e.currentTarget.dataset.openid;
    var box_mac = e.currentTarget.dataset.boxmac;
    if (box_mac == '') {
      app.scanQrcode();
    }else {
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      wx.navigateTo({
        url: '/pages/activity/turntable/index?box_mac=' + box_mac + '&openid=' + openid,
      })
    }
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
    this.onLoad()
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