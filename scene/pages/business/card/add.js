// scene/pages/business/card/add.js
/**
 * 【场景】商务宴请 - 名片
 */


const utils = require('../../../../utils/util.js')
var mta = require('../../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var openid;
var box_mac;
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
    is_edit:0,
    card_info:{'head_img':'','name':'','mobile':'','job':'','company':'','qrcode_img':''},
    addDisabled:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({})
    console.log(options)
    openid = options.openid;
    box_mac = options.box_mac;
    this.getMyCardInfo(openid);
  },
  getMyCardInfo:function(openid){
    var that = this;
    utils.PostRequest(api_v_url + '/Businessdinners/cardDetail', {
      openid:openid,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      var is_card = data.result.is_card;
      if(is_card==1){
        var card_info = data.result;
      }else {
        var card_info = that.data.card_info;
      }

      that.setData({card_info:card_info,is_edit:is_card})
    })
  },
  editCard:function(e){
    this.setData({is_edit:1})
  },
  /**
   * 上传头像/微信二维码
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
                  var head_img = "forscreen/resource/" + img_url
                  card_info.head_img = head_img;
                } else if (type == 2) {//微信二维码
                  var qrcode_img = "forscreen/resource/" + img_url
                  card_info.qrcode_img = qrcode_img;
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
  submitInfo:function(e){
    var that = this;
    var card_info = this.data.card_info;
    var name = e.detail.value.name.replace(/\s+/g, '');
    var mobile = e.detail.value.mobile.replace(/\s+/g, '');
    var job = e.detail.value.job.replace(/\s+/g, '');
    var company  = e.detail.value.company.replace(/\s+/g, '');
    if(name==''){
      app.showToast('请输入您的姓名',2000,'none',false);
      return false;
    }
    if(!app.checkMobile(mobile)){
      return false;
    }
    /*if(job==''){
      app.showToast('请输入您的职称',2000,'none',false);
      return false;
    }
    if(company==''){
      app.showToast('请输入您的公司名称',2000,'none',false);
      return false;
    }
    if(card_info.head_img==''){
      app.showToast('请上传您的头像',2000,'none',false);
      return false;
    }*/
    if(card_info.qrcode_img==''){
      app.showToast('请上传您的微信二维码',2000,'none',false);
      return false;
    }
    card_info.name = name;
    card_info.mobile = mobile;
    card_info.job = job;
    card_info.company = company;
    utils.PostRequest(api_v_url + '/user/editCard', {
      openid:openid,
      box_mac:box_mac,
      name:name,                    //姓名
      mobile:mobile,                 //手机号
      job:job,                 //职称
      company:company,               //公司名称
      head_img:card_info.head_img, //用户头像
      qrcode_img:card_info.qrcode_img //微信二维码
    }, (data, headers, cookies, errMsg, statusCode) =>{
      that.forscreenCard();
      wx.navigateBack({
        delta: 1,
      })
    })

  },
  //分享名片到电视
  forscreenCard:function(){
    var that = this;
    utils.PostRequest(api_v_url + '/Businessdinners/shareCardOnTv', {
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('投屏成功',2000,'success')
    })
    var card_info = that.data.card_info;
    var forscreen_id =(new Date()).valueOf();
    utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: 45,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: '',
      imgs: '["'+card_info.qrcode_img+'"]',
      res_sup_time: 0,
      res_eup_time: 0,
      resource_type: 1,
      res_nums: 1,
      serial_number:app.globalData.serial_number
    }, (data, headers, cookies, errMsg, statusCode) => {
    },res=>{},{ isShowLoading: false })
    mta.Event.stat('forscreenCard',{'openid':openid,'boxmac':box_mac})
  },
  inputConteng:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var value = e.detail.value;
    var card_info = that.data.card_info;
    if(type=='name'){
      card_info.name = value;
    }else if(type=='mobile'){
      card_info.mobile = value;
    }else if(type=='job'){
      card_info.job = value;
    }else if(type=='company'){
      card_info.company = value;
    }
    that.setData({card_info:card_info})
  },
  getPhoneNumber:function(e){
    console.log(e)
    var that = this;
    var card_info = that.data.card_info;
    if ("getPhoneNumber:ok" != e.detail.errMsg) {
      app.showToast('获取用户手机号失败')
      return false;
    }
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    utils.PostRequest(api_v_url + '/user/bindMobile', {
      openid:openid,
      iv: iv,
      encryptedData: encryptedData,
      session_key: app.globalData.session_key,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var mobile = data.result.phoneNumber;
      card_info.mobile = mobile;
      that.setData({card_info:card_info})
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

  }
})