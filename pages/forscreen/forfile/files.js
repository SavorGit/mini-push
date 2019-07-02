// pages/forscreen/forfile/files.js
const app = getApp()
var api_url = app.globalData.api_url;
var policy;
var signature;
var oss_bucket = app.globalData.oss_bucket;
var oss_access_key_id = app.globalData.oss_access_key_id;
var oss_upload_url = app.globalData.oss_upload_url;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
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
  onLoad: function(options) {
    //console.log(options);
    var openid  = options.openid;
    var box_mac = options.box_mac;


    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        var  tempFilePaths = res.tempFilePaths
        
        var file_path = res.tempFiles[0].path;
        var file_size = res.tempFiles[0].size;

        var file_size_m = file_size / (1024*1024);
        if(file_size_m>=40){
          wx.navigateBack({
            delta: 1,
          })
        }else {
          wx.request({
            url: api_url + '/Smallapp/Index/getOssParams',
            headers: {
              'Content-Type': 'application/json'
            },
            success: function (rest) {
              policy = rest.data.policy;
              signature = rest.data.signature;
              uploadOssFile(policy, signature, file_path,openid,box_mac);
            }
          });
        }
        
      },fail:function(res){
        wx.navigateBack({
          delta: 1,
        })
      }
    });

    function uploadOssFile(policy, signature, file_path,openid,box_mac){
      
      var index1 = file_path.lastIndexOf(".");
      var index2 = file_path.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = file_path.substring(index1, index2);//后缀名
      var timestamp = (new Date()).valueOf();
      console.log(timestamp);
      var upload_task = wx.uploadFile({
        url: oss_upload_url,
        filePath: file_path,
        name: 'file',

        formData: {
          Bucket: oss_bucket,
          name: file_path,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: oss_access_key_id,
          sucess_action_status: "200",
          signature: signature

        },
        success: function (res) {
          
        }
      });
      var res_eup_time = (new Date()).valueOf();
      upload_task.onProgressUpdate((res) => {

        
        if (res.progress == 100) {
          //1、记录日志接口
          recordUploadFile(openid, box_mac,  timestamp, res_eup_time, postf_t, res.totalBytesSent);
          //2、处理文件接口
        }
        
      });

    }
    function recordUploadFile(openid, box_mac, resource_id, res_eup_time, postf_t, resource_size){
      
      wx.request({
        url: api_url + '/Smallapp21/index/recordForScreenPics',
        header: {
          'content-type': 'application/json'
        },
        data: {
          openid: openid,
          box_mac: box_mac,
          action: 30,
          resource_type: 3,
          mobile_brand: mobile_brand,
          mobile_model: mobile_model,
          forscreen_char: '',
          public_text: '',
          imgs: '["forscreen/resource/' + resource_id + postf_t + '"]',
          resource_id: resource_id,
          res_sup_time: resource_id,
          res_eup_time: res_eup_time,
          resource_size: resource_size,
          is_pub_hotelinfo: 0,
          is_share: 0,
          forscreen_id: res_eup_time,
          duration: 0,
        },
        success:function(res){
            console.log(res);
        }
      })  
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})