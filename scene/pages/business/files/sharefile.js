// scene/pages/business/files/sharefile.js
/**
 * 【场景】商务宴请 - 分享文件
 */

const utils = require('../../../../utils/util.js')
var mta = require('../../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var openid;
var box_mac;
var policy;
var signature;
var oss_bucket = app.globalData.oss_bucket;
var oss_access_key_id = app.globalData.oss_access_key_id;
var oss_upload_url = app.globalData.oss_upload_url;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
var wx_download_max_size = app.globalData.wx_download_max_size;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    share_files:[],
    del_files:[],
    addDisabled:false
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
        //uploadOssFile(policy, signature, file_path,openid,box_mac,file_name,file_size,polling_time,that);
      }
    });
    /*utils.PostRequest(api_v_url + '/index/getConfig', {
      page: 1,
      pagesize: 6
    }, (data, headers, cookies, errMsg, statusCode) => {
      file_exts = data.result.file_exts;
    })*/

    this.getFileDetail(openid,box_mac)
  },
  getFileDetail:function(e){
    var that = this;
    utils.PostRequest(api_v_url + '/file/detail', {
      openid:openid,
      box_mac:box_mac,
      type:1
    }, (data, headers, cookies, errMsg, statusCode) =>{
      var share_files = data.result.share_file;
      var share_file_num = data.result.share_file_num;
      
      that.setData({'share_files':share_files,'share_file_num':share_file_num})
    })
  },
  uploadFile:function(e){
    var that = this;
    var share_file_exts = app.globalData.config_info.share_file_exts
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: share_file_exts,
      success(res) {
    
        var tempFilePaths = res.tempFilePaths
        var file_path = res.tempFiles[0].path;
        var file_size = res.tempFiles[0].size;
        var file_name = res.tempFiles[0].name;
        if(wx_download_max_size<file_size){
          app.showToast('请您选择200M以内的文件');
        }else {
          that.uploadOssFile(policy, signature, file_path,file_name,file_size);
        }
        
      }, fail: function (res) {
        
      }
    })
  },
  uploadOssFile:function(policy, signature, file_path,  file_name, file_size, ){
    var that = this;
    var index1 = file_path.lastIndexOf(".");
    var index2 = file_path.length;
    var postf_t = file_path.substring(index1, index2);//后缀名

    var index1 = file_name.lastIndexOf('.');
    var file_name = file_name.substring(0,index1);
    var date_time = that.getDataTime();
    var view_file_name = file_name+date_time;
    if(view_file_name.length>11){
      view_file_name  = view_file_name.substring(0,11);
      view_file_name +='***'+postf_t;
    }else {
      view_file_name +=postf_t;
    }
    console.log(view_file_name)


    file_name +=date_time+postf_t;
 
    var oss_file_path = "forscreen/resource/" + file_name ;
    //console.log(timestamp);
    wx.reportAnalytics('file_forscreen_report', {
      forscreen_num: 1,
    });
    wx.showLoading({
      title: '文件上传中...',
      mask:true,
    })
    that.setData({
      addDisabled:true,
    })
    var upload_task = wx.uploadFile({
      url: oss_upload_url,
      filePath: file_path,
      name: 'file',

      formData: {
        Bucket: oss_bucket,
        name: file_path,
        key: oss_file_path,
        policy: policy,
        OSSAccessKeyId: oss_access_key_id,
        sucess_action_status: "200",
        signature: signature

      },
      success: function (res) {
        //console.log(res);
        var share_files = that.data.share_files
        var file_info ={};
        file_info.oss_file_path = oss_file_path;
        file_info.name = file_name ;
        file_info.view_file_name = view_file_name;
        file_info.file_id = 0;
        console.log(share_files)
        console.log(file_info)
        share_files.push(file_info);

        that.setData({'share_files':share_files,'addDisabled':false})
        wx.hideLoading({
        })
        
      },fail:function(){
        wx.hideLoading({
          
        })
        that.setData({addDisabled:false})
      }
    });
    
  },
  delFile:function(e){
    var that = this;
    var share_files = that.data.share_files;
    var keys = e.currentTarget.dataset.keys;
    var file_id = e.currentTarget.dataset.file_id;

    share_files.splice(keys,1);
    var del_files = that.data.del_files;
    if(file_id>0){
      del_files.push(file_id);
    }
    that.setData({'share_files':share_files,'del_files':del_files})
  },
  getDataTime:function(){
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //获取年份  
    var Y =date.getFullYear();
    //获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); 

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return Y+M+D+hour+minute+second;  
  },
  submitShareFiles:function(e){
    console.log(e)
    var that = this;
    var share_files = that.data.share_files;
    console.log(share_files)
    /*if(share_files.length==0){
      app.showToast('请上传您要分享的文件');
      return false;
    }*/
    var file_path = '';
    var space  = '';
    for(let i in share_files){
      file_path+=space + share_files[i].oss_file_path;
      space  = ',';
    }
    var del_files = that.data.del_files;
    var file_ids = '';
    var space  = '';
    for(let i in del_files){
      file_ids +=space+del_files[i];
      space  = ',';
    }
    utils.PostRequest(api_v_url + '/file/addFile', {
      box_mac: box_mac,
      file_path:file_path,
      openid: openid,
      type:1,
      file_ids:file_ids
    }, (data, headers, cookies, errMsg, statusCode) => {
      app.showToast('保存成功',2000,'success');
      wx.navigateBack({
        delta: 1,
      })
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