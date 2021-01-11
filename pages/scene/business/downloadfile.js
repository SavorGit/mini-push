// pages/scene/business/downloadfile.js
/**
 * 【场景】商务宴请 - 文件下载
 */
const app = getApp();
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
var api_v_url = app.globalData.api_v_url;
var oss_url = app.globalData.oss_url;
var openid;
var box_id;
var box_mac;
var file_id;
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_v_url + '/User/isRegister', {
      openid: pageContext.data.openid,
      page_id: 2
    }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
      key: 'savor_user_info',
      data: data.result.userinfo,
    }), function () {
      if (app.globalData.link_type != 2) {
        wx.setStorage({
          key: 'savor_user_info',
          data: {
            openid: app.globalData.openid
          }
        })
      }

    }, { isShowLoading: false }),
  },
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    is_have_download:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    box_id = 0;
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      self.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(self); //判断用户是否注册
      if (typeof (options.q) != 'undefined') {
        var q = decodeURIComponent(options.q);
        var selemite = q.indexOf("?");
        var pams = q.substring(selemite + 3, q.length);
  
        var pams_arr = pams.split('_');
        file_id = pams_arr[1];
        var file_type = pams_arr[2];
        box_id = pams_arr[3];
        //获取文件详情
        self.getFileInfo(file_id,app.globalData.openid);
        self.recordScanCodeLog(app.globalData.openid,file_type,file_id,box_id);
      } 

    }else {
      app.openidCallback = openid => {
        if (openid != '') {
          self.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(self); //判断用户是否注册

          if (typeof (options.q) != 'undefined') {
            var q = decodeURIComponent(options.q);
            var selemite = q.indexOf("?");
            var pams = q.substring(selemite + 3, q.length);
      
            var pams_arr = pams.split('_');
            file_id = pams_arr[1];
            var file_type = pams_arr[2];
            box_id = pams_arr[3];
            
            //获取文件详情
            self.getFileInfo(file_id,openid);
            
            self.recordScanCodeLog(openid,goods_type,file_type,box_id);
          } 
          
          
        }
      }
    }
  },
  getFileInfo:function(file_id,openid){
    var that = this;
    utils.PostRequest(api_v_url + '/file/info', {
      file_id:file_id,
      openid:openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      var is_open = data.result.is_open;
      that.setData({file_info:data.result,is_open:is_open})
    },res=>{
      wx.switchTab({
        url: '/pages/index/index',
      })
    })
  },
  recordScanCodeLog:function(openid,goods_type,file_id,box_id){
    var that = this;
    utils.PostRequest(api_v_url + '/Index/gencode', {
      openid:openid,
      type:goods_type,
      data_id:file_id,
      box_id:box_id,
      mobile_brand:app.globalData.mobile_brand,
      mobile_model:app.globalData.mobile_model
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({box_mac:data.result.box_mac})
    })
  },
  downLoadFile:function(e){
    var that = this;
    var rootPath = wx.env.USER_DATA_PATH + '/doc';
    console.log(rootPath)
    wx.showLoading({
      title: '文件下载中...',
    })
    var file_info = this.data.file_info;
    var file_url = oss_url+'/'+file_info.file_path;
    const downloadTask = wx.downloadFile({
      url: file_url,
      filePath: rootPath,
      header: {},
      success: function (res) {
        that.setData({is_have_download:true})
        wx.hideLoading({})
        app.showToast('文件下载成功');
        console.log(res);
        var openFilepath = res.filePath;
        that.setData({openFilepath:openFilepath})
      },
      fail: function (res) {
        console.log(e)
        wx.hideLoading({})
        app.showToast('文件下载失败');
        
      },
      complete: function (res) {},
    });
    downloadTask.onProgressUpdate((res) => {

      console.log('下载进度', res)

      console.log('下载进度', res.progress)

      console.log('已经下载的数据长度', res.totalBytesWritten)

      console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)

      /*this.setData({

        downloadPercent: ((res.totalBytesWritten / totalbytes) * 100).toFixed(2)  //toFixed(2)取小数点后两位，更新wxml中progress组件的进度值  

      })*/
    })
  },
  openDoc:function(e){
    var openFilepath = this.data.openFilepath;
    wx.openDocument({
      filePath: openFilepath,
      success: function (res) {
        console.log('打开文档成功')
      },
      fail: function (res) {
        
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
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