// scene/pages/forscreen/forvideo.js
/**
 * 【场景】商务宴请 - 视频投屏
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
var upload_task;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    oss_url:app.globalData.oss_url,
    video_list:[{'name':'1592056143067.mp4','video_url':'forscreen/resource/1592056143067.mp4','video_url_img':'forscreen/resource/1592056143067.mp4?x-oss-process=video/snapshot,t_10000,f_jpg,w_450,m_fast','percent':0}], //已选择投屏照片列表
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
    this.getVideoList(openid,box_mac,scene_type);
  },
  getVideoList:function(e){
    var that = this;
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
      var keys = e.currentTarget.dataset.keys;
    }else {

    }
    var up_flag = that.data.video_list.length;
    var hotel_info = app.globalData.hotel_info;
    var is_compress = hotel_info.is_compress;
    if(is_compress==1){
      var compressed = true;
    }else if(is_compress==0){
      var compressed = false;
    }
    

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      compressed:compressed,
      success: function (res) {
        console.log(res)
        wx.showLoading({
          title: '视频上传中...',
          mask: true
        })
        that.setData({
          addDisabled: true,
          upDisabled: true
        })

        var filename = res.tempFilePath
        var video_size = res.size;
        var index1 = filename.lastIndexOf(".");
        var index2 = filename.length;
        var timestamp = (new Date()).valueOf();

        var postf = filename.substring(index1, index2); //后缀名
        var postf_t = filename.substring(index1, index2); //后缀名
        var postf_w = filename.substring(index1 + 1, index2); //后缀名

        var video_url = timestamp + postf;
        that.upOss(filename, postf_w, video_url, policy, signature,  type,keys,up_flag)
      },
      fail: function (e) {
        
      }
    })
  },
  upOss: function (filename, postf_w, video_url, policy, signature,  type,keys,up_flag) {
    console.log(filename);
    console.log(oss_upload_url);
    console.log(video_url)
    console.log(type);
    var that = this;
    upload_task = wx.uploadFile({
      url: oss_upload_url,
      filePath: filename,
      name: 'file',
      
      formData: {
        Bucket: "redian-produce",
        name: filename,
        key: "forscreen/resource/" + video_url,
        policy: policy,
        OSSAccessKeyId: app.globalData.oss_access_key_id,
        sucess_action_status: "200",
        signature: signature
      },
      success: function (res) {
        console.log('OK');
        console.log(type)
        console.log(video_url);
        var tmp_info = {};
        tmp_info.name = video_url;
        tmp_info.video_url = "forscreen/resource/" + video_url,
        tmp_info.video_url_img = "forscreen/resource/" + video_url+'?x-oss-process=video/snapshot,t_1000,f_jpg,w_450,m_fast';
        tmp_info.percent  = 0;
        if(type=='all'){
          var video_list = that.data.video_list;
          video_list[up_flag] = tmp_info;
          
        }else if(type=='one'){
          var video_list = that.data.video_list;
          for (var i = 0; i < video_list.length; i++) {
            if (i == keys) {
              video_list[i] = tmp_info;
              break;
            }
          }
          
        }
        that.setData({
          video_list: video_list
        })
        console.log(video_list);
        wx.hideLoading();
        that.setData({
          addDisabled: false,
          upDisabled: false
        })

        
        
      },fail:function(e){
        wx.hideLoading();
        app.showToast('视频上传失败,请重试')
        that.setData({
          addDisabled: false,
          upDisabled: false
        })
      }
    })
    var video_list = that.data.video_list;
    var up_tmp_info ={};
    up_tmp_info.video_url = '';
    up_tmp_info.video_url_img = '';
    upload_task.onProgressUpdate((res) => {
      console.log(res.progress);
      up_tmp_info.percent = res.progress;
      video_list[up_flag] = up_tmp_info;
      that.setData({video_list:video_list})
      
    });
  },
  delVideo:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var video_list = that.data.video_list;
    for (var i = 0; i < video_list.length; i++) {
      if (i == keys) {
        video_list.splice(keys, 1);
        break;
      }
    }
    that.setData({video_list: video_list})
  },
  submitForVideo:function(e){
    var that = this;
    var video_list = that.data.video_list;
    
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