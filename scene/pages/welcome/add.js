// scene/pages/welcome/add.js
/**
 * 【场景】欢迎词
 */


const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var openid;
var box_mac;
var type;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    welcome_info:{'img_list':[],'welcome_message':'','font_style_id':0,'font_size_id':0,'font_color_id':0,'stay_time':0},
    oss_url:app.globalData.oss_url,
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
    wx.request({
      url: api_v_url + '/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rest) {
        that.setData({policy:rest.data.policy,signature:rest.data.signature}) 
      }
    })
    
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
  uploadOnePic: function (e) {
    app.sleep(200);
    console.log(e)
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var type = e.currentTarget.dataset.type;

    
    var total_pic = that.data.welcome_info.img_list.length;
      //var choose_num = 6 - total_pic;
    
    if (total_pic > 6) {
      app.showToast('最多上传6张照片');
      return false;
    }


    wx.showLoading({
      title: '图片上传中...',
      mask: true
    })
    that.setData({
      addDisabled: true
    })
    wx.chooseImage({
      count: 1, // 默认9
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
                var dish_img_url = "forscreen/resource/" + img_url
                if (type == 'one') {
                  var dish_img_list = that.data.welcome_info.img_list;
                  for (var i = 0; i < dish_img_list.length; i++) {
                    if (i == keys) {
                      dish_img_list[i] = dish_img_url;
                      break;
                    }
                  }
                  var welcome_info = that.data.welcome_info;
                  welcome_info.img_list = dish_img_list;
                  that.setData({
                    welcome_info: welcome_info
                  })
                } 

                wx.hideLoading();

                setTimeout(function () {
                  that.setData({
                    addDisabled: false
                  })
                }, 1000);
              },
              fail: function ({
                errMsg
              }) {
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
      },
      fail: function (e) {
        wx.hideLoading();
        that.setData({
          addDisabled: false
        })
      }
    })
  },
  uploadImage: function (e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    var total_pic = that.data.welcome_info.img_list.length;
    console.log('type'+type)
    
    var choose_num = 6 - total_pic;
    if (total_pic >= 6) {
      app.showToast('最多上传6张照片');
      return false;
    }


    wx.showLoading({
      title: '图片上传中...',
      mask: true
    })
    that.setData({
      addDisabled: true,
      //upDisabled: true
    })

    wx.chooseImage({
      count: choose_num, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths; //多张图片临时地址
        var flag = tempFilePaths.length + total_pic;
  
        wx.request({
          url: api_v_url + '/Index/getOssParams',
          headers: {
            'Content-Type': 'application/json'
          },
          success: function (rest) {
            var policy = rest.data.policy;
            var signature = rest.data.signature;

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
              that.upOss(filename, postf_w, img_url, policy, signature, i, flag, type)
              app.sleep(1)
            }
          },
          fail: function (rt) {
            wx.hideLoading();
            that.setData({
              addDisabled: false,
              //upDisabled: false
            })

          }
        })
      },
      fail: function (e) {
        wx.hideLoading();
        that.setData({
          addDisabled: false,
          //upDisabled: false
        })
      }
    })
  },
  upOss: function (filename, postf_w, img_url, policy, signature, i, flag, type) {

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
        if (type == 'all') {
          var dish_img_list = that.data.welcome_info.img_list;
          dish_img_list.push("forscreen/resource/" + img_url);

          var end_flag = dish_img_list.length
        }
        if (end_flag == flag) {
          if (type == 'all') {
            var welcome_info = that.data.welcome_info
            welcome_info.img_list = dish_img_list;
            that.setData({
              welcome_info: welcome_info
            }, () => {
              wx.hideLoading();
              that.setData({
                addDisabled: false,
                upDisabled: false
              })
            })
          } 
        }
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
   * 选择字体颜色
   */
  selectFontColor:function(e){

  },
  selectStayTime:function(e){

  },
  submitWelcome:function(e){
    var that = this;
    var welcome_info = that.data.welcome_info;
    if(welcome_info.img_list.length==0){
      app.showToast('请上传北京图片',2000,'none',false);
      return false;
    }
    var welcome_message = e.detail.value.welcome_message.replace(/\s+/g, '');
    if(welcome_message==''){
      app.showToast('请输入欢迎语',2000,'none',false);
      return false;
    }
    if(welcome_info.font_style_id==0){
      app.showToast('请选择字体样式',2000,'none',false);
      return false;
    }
    if(welcome_info.font_size_id==0){
      app.showToast('请选择字体大小',2000,'none',false);
      return false;
    }
    if(welcome_info.font_color_id==0){
      app.showToast('请选择字体颜色',2000,'none',false);
      return false;
    }
    if(welcome_info.stay_time==0){
      app.showToast('请选择停留时间',2000,'none',false);
      return false;
    }
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid:openid,
      box_mac:box_mac,
      img_list:JSON.stringify(welcome_info.img_list),
      welcome_message:welcome_message,
      font_style_id:font_style_id,
      font_size_id:ont_size_id,
      font_color_id:font_color_id,
      stay_time:stay_time,
      type:type
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('保存成功')
      wx.navigateBack({
        delta: 1
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