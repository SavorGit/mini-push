// games/pages/activity/luckyturn/index.js
/**
 * 【游戏】 幸运转转转
 */
const app = getApp()
const utils = require('../../../../utils/util.js')
var mta = require('../../../../utils/mta_analysis.js')
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var openid;
var box_mac;
var policy;
var signature;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oss_url:app.globalData.oss_url,
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    prize_info:{'img_url':'','prizeName':''},
    status:0,
    addDisabled:false,  //保存按钮是否可用
    upDisabled:false,   //上传按钮是否可用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openid = options.openid;
    box_mac = options.box_mac;
    wx.request({
      url: api_v_url + '/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rest) {
        policy = rest.data.policy;
        signature = rest.data.signature;
      },fail:function(e){
        app.showToast('网络异常,请重新进入');
        wx.navigateBack({
          delta: 1,
        })
      }

    })
    this.getActivityInfo(openid,box_mac);
  },
  getActivityInfo:function(openid,box_mac){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) => {
      
    })
  },
  addPrize:function(e){
    this.setData({
      status:1,
    })
  },
  addPrizeName:function(e){
    var prizeName = e.detail.value.replace(/\s+/g, '');
    var prize_info = this.data.prize_info;
    prize_info.prizeName = prizeName;
    
    this.setData({prize_info:prize_info});
  },
  /**
   * 上传奖品图片
   */
  uploadImage:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    wx.showLoading({
      title: '图片上传中...',
      mask: true
    })
    that.setData({
      addDisabled: true,
      upDisabled:true,
    })
    wx.chooseImage({
      count: 1, // 默认6
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var filename = res.tempFilePaths[0];

        var index1 = filename.lastIndexOf(".");
        var index2 = filename.length;
        var timestamp = (new Date()).valueOf();
        var postf = filename.substring(index1, index2); //后缀名\
        var postf_t = filename.substring(index1, index2); //后缀名
        var postf_w = filename.substring(index1 + 1, index2); //后缀名
        var img_url = timestamp + postf;
        


        wx.uploadFile({
          url: oss_upload_url,
          filePath: filename,
          name: 'file',
          header: {
            'Content-Type': 'image/' + postf_w
          },
          formData: {
            Bucket: "redian-produce",
            name: img_url,
            key: "forscreen/resource/" + img_url,
            policy: policy,
            OSSAccessKeyId: app.globalData.oss_access_key_id,
            sucess_action_status: "200",
            signature: signature
          },
          success: function (res) {
            var prize_info  = that.data.prize_info;
           
            var prize_img = "forscreen/resource/" + img_url
            prize_info.img_url = prize_img;
            
            that.setData({prize_info:prize_info})
            wx.hideLoading();
            setTimeout(function () {
              that.setData({
                addDisabled: false,
                upDisabled:false,
              })
            }, 500);
          },
          fail: function ({errMsg}) {
            wx.hideLoading();
            app.showToast('图片上传失败，请重试')
            that.setData({
              addDisabled: false,
              upDisabled:false,
            })
          },
        });
      },fail:function(e){
        wx.hideLoading();
        that.setData({
          addDisabled: false,
          upDisabled:false,
        })
      }
    })
  },
  startPrize:function(e){
    console.log(e)
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

  }
})