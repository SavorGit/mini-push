// scene/pages/welcome/add.js
/**
 * 【场景】欢迎词
 */


const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var openid;
var box_mac;
var type;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    welcome_info:{'img_list':[],'welcome_message':'','font_style_id':0,'font_size_id':0,'font_color':0,'stay_time':0},

    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({})
    var that = this;
    openid = options.openid;
    box_mac = options.box_mac;
    type   = options.type;
    utils.PostRequest(api_v_url + '/aa/bb', {//获取欢迎词配置
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      //字体样式

      //字体大小
      //停留时间
      that.getWelcomeInfo(openid,box_mac,type);
    })
    
  },
  /**
   * 获取欢迎词信息
   */
  getWelcomeInfo:function(openid,box_mac,type){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      that.setData({
        welcome_info:data.result
      })
    })
  },
  /**
   * 上传欢迎词图片
   */
  uploadImage:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    wx.showLoading({
      title: '图片上传中...',
      mask: true
    })
    that.setData({
      addDisabled: true
    })
    wx.chooseImage({
      count: 6, // 默认6
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
        wx.request({
          url: api_v_url + '/Index/getOssParams',
          headers: {
            'Content-Type': 'application/json'
          },
          success: function (rest) {
            var policy = rest.data.policy;
            var signature = rest.data.signature;

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
                var card_info  = that.data.card_info;
                if (type == 1) {//头像
                  var header_url = "forscreen/resource/" + img_url
                  card_info.header_url = header_url;
                } else if (type == 2) {//微信二维码
                  var wx_qrcode = "forscreen/resource/" + img_url
                  card_info.wx_qrcode = wx_qrcode;
                } 
                that.setData({card_info:card_info})
                wx.hideLoading();
                setTimeout(function () {
                  that.setData({
                    addDisabled: false
                  })
                }, 1000);
              },
              fail: function ({errMsg}) {
                wx.hideLoading();
                app.showToast('图片上传失败，请重试')
                that.setData({
                  addDisabled: false
                })
              },
            });
          },
          fail: function (e) {
            wx.hideLoading();
            that.setData({
              addDisabled: false
            })
          }
        })
      },fail:function(e){
        wx.hideLoading();
        that.setData({
          addDisabled: false
        })
      }
    })
  },
  /**
   * 选择字体样式
   */
  selectFontStyle:function(e){

  },
  /**
   * 选择字体大小
   */
  selectFontSize:function(e){

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