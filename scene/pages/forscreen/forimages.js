// scene/pages/forscreen/forimages.js
/**
 * 【场景】商务宴请 - 图片投屏
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var openid;
var box_mac;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
var scene_type ;  //来源类型1：商务宴请 2：生日聚会
var all_images_num = 6;
var policy;
var signature;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    oss_url:app.globalData.oss_url,
    images_list:[], //已选择投屏照片列表
    addDisabled:false,  //保存按钮是否可用
    upDisabled:false,   //上传按钮是否可用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openid  = options.openid;  
    box_mac = options.box_mac;
    scene_type    = options.scene_type; 
    wx.request({
      url: api_v_url + '/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rest) {
        policy = rest.data.policy;
        signature = rest.data.signature;
      },fail:function(){
        app.showToast('网络异常,请重试')
        wx.navigateBack({
          delta: 1,
        })
      }
    })
    this.getImageList(openid,box_mac,scene_type);
  },
  getImageList:function(openid,box_mac,scene_type){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid:openid,
      box_mac:box_mac,
      scene_type,scene_type
    }, (data, headers, cookies, errMsg, statusCode) =>{
    })
  },
  //选择上传图片
  uploadImage: function (e) {
    console.log(e)
    var that = this;
    var type = e.currentTarget.dataset.type; //多张还是单张
    var keys  = '';
    if(type=='one'){
      var choose_num = 1;
      var keys = e.currentTarget.dataset.keys;
    }else {
      var total_pic = that.data.images_list;
      var choose_num = all_images_num - total_pic;
      if (total_pic >= all_images_num) {
        app.showToast('最多上传'+all_images_num+'张照片');
        return false;
      }
    }
    
    wx.showLoading({
      title: '图片上传中...',
      mask: true
    })
    that.setData({
      addDisabled: true,
      upDisabled: true
    })

    wx.chooseImage({
      count: choose_num, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths; //多张图片临时地址
        var flag = tempFilePaths.length + total_pic;
        var total_choose_img = tempFilePaths.length;
        total_choose_img += total_pic;
        console.log('一共选择了'+total_choose_img);

        for (var i = 0; i < tempFilePaths.length; i++) {
          var filename = tempFilePaths[i];

          var index1 = filename.lastIndexOf(".");
          var index2 = filename.length;
          var timestamp = (new Date()).valueOf();

          var postf = filename.substring(index1, index2); //后缀名
          var postf_t = filename.substring(index1, index2); //后缀名
          var postf_w = filename.substring(index1 + 1, index2); //后缀名

          var img_url = timestamp + postf;
          //console.log(img_url)
          that.upOss(filename, postf_w, img_url, policy, signature, i, flag, type,total_choose_img,keys)
          app.sleep(1)
        }
      },
      fail: function (e) {
        wx.hideLoading();
        that.setData({
          addDisabled: false,
          upDisabled: false
        })
      }
    })
  },
  upOss: function (filename, postf_w, img_url, policy, signature, i, flag, type,total_choose_img,keys) {
    var that = this;
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
        var dish_img_url = "forscreen/resource/" + img_url
        if(type=='all'){
          var images_list = that.data.images_list;
          images_list.push(dish_img_url);
          var end_flag = images_list.length
          if (end_flag == total_choose_img) {
            that.setData({
              images_list: images_list
            })
          }
        }else if(type=='one'){
          var images_list = that.data.images_list;
          for (var i = 0; i < images_list.length; i++) {
            if (i == keys) {
              images_list[i] = dish_img_url;
              break;
            }
          }
          that.setData({
            images_list: images_list
          })
        }
        console.log(images_list);
        wx.hideLoading();
        that.setData({
          addDisabled: false,
          upDisabled: false
        })

        
        
      },fail:function(e){
        wx.hideLoading();
        app.showToast('文件上传失败,请重试')
        var dish_img_list = [];
        var welcome_info = that.data.welcome_info
            welcome_info.images = dish_img_list;
        that.setData({
          addDisabled: false,
          upDisabled: false
        })
      }
    })
  },
  delPic: function (e) {
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var image_list = that.data.image_list;
    for (var i = 0; i < image_list.length; i++) {
      if (i == keys) {
        image_list.splice(keys, 1);
        break;
      }
    }
    that.setData({
      image_list: image_list
    })
    
  },
  submitForImages:function(e){
    var image_list = that.data.image_list;
    
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) =>{
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