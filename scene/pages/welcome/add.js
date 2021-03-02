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
var welcome_id ;
var pageid;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    welcome_info:{'images':[],'content':'','font_id':0,'wordsize_id':0,'color_id':0,'stay_time':0,'music_id':0},
    oss_url:app.globalData.oss_url,
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    wordtype_index: 0, //字体样式索引值
    addDisabled:false,
    is_edit:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({})
    var that = this;
    var pageTitle = options.pageTitle;
    if(typeof(pageTitle)!='string'){
      pageTitle = '欢迎词';
    }
    
    openid = options.openid;
    box_mac = options.box_mac;
    type   = options.type;
    welcome_id = options.welcome_id;
    pageid = options.pageid;
    if(welcome_id>0){
      var is_edit = 1;
    }else {
      var is_edit = 0;
    }
    that.setData({pageTitle:pageTitle,is_edit:is_edit});
    wx.request({
      url: api_v_url + '/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rest) {
        that.setData({policy:rest.data.policy,signature:rest.data.signature}) 
      }
    })
    
    utils.PostRequest(api_v_url + '/Welcome/config', {//获取欢迎词配置
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      var welcome_info = that.data.welcome_info;
      //字体样式
      var wordtype = data.result.font_namelist
      var font_list     = data.result.font;
      //字体大小
      var wordsize = data.result.wordsize;
      //字体颜色
      var color_list = data.result.color;
      //停留时间
      var stay_times = data.result.stay_times
      var wordtype_list = data.result.font

      //背景音乐
      var music =  data.result.music;
      var music_str_list = [];
      for(var i in music){
        music_str_list.push(music[i].name)
      }


      welcome_info.wordsize_id = wordsize[0].id;
      welcome_info.color_id   = color_list[0].id
      //welcome_info.stay_time = stay_times[0].id
      that.setData({'wordtype':wordtype,'wordsize':wordsize,'stay_times':stay_times,
                    'wordtype_list':wordtype_list,'font_list':font_list,'welcome_info':welcome_info,
                    'color_list':color_list,
                    "music_str_list":music_str_list,
                    "music":music
                  });
      if(welcome_id>0){
        that.getWelcomeInfo(openid,box_mac,type,welcome_id);
      }
      
    })
    
  },
  /**
   * 获取欢迎词信息
   */
  getWelcomeInfo:function(openid,box_mac,type,welcome_id){
    var that = this;
    utils.PostRequest(api_v_url + '/Welcome/detail', {
      openid:openid,
      box_mac:box_mac,
      welcome_id:welcome_id,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      var welcome_info =data.result;
      var font_list = that.data.font_list;
      var font_id = welcome_info.font_id;
      var wordtype_index = that.data.wordtype_index;
      var stay_time = welcome_info.stay_time;
      var stay_times = that.data.stay_times;
      for(let i in font_list){
        if(font_id== font_list[i].id){
          wordtype_index = i;
          break;
        }
      }
      for(let i in stay_times){
        stay_times[i].is_select = 0;
        if(stay_times[i].id==stay_time){
          stay_times[i].is_select = 1;
        }
      }
      var music = that.data.music;
      var m_id = welcome_info.music_id;
      var keys = 0;
      for(var i in music){
        if(m_id == music[i].id){
          keys = i;
        }
      }
      welcome_info.music_id = keys;
      that.setData({
        welcome_info:welcome_info,
        wordtype_index:wordtype_index,
        stay_times:stay_times
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

    
    var total_pic = that.data.welcome_info.images.length;
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
                  var dish_img_list = that.data.welcome_info.images;
                  for (var i = 0; i < dish_img_list.length; i++) {
                    if (i == keys) {
                      dish_img_list[i] = dish_img_url;
                      break;
                    }
                  }
                  var welcome_info = that.data.welcome_info;
                  welcome_info.images = dish_img_list;
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
    var total_pic = that.data.welcome_info.images.length;
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
        var total_choose_img = tempFilePaths.length;
        total_choose_img += total_pic;
        console.log('一共选择了'+total_choose_img);
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
              that.upOss(filename, postf_w, img_url, policy, signature, i, flag, type,total_choose_img)
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
  upOss: function (filename, postf_w, img_url, policy, signature, i, flag, type,total_choose_img) {

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
          var dish_img_list = that.data.welcome_info.images;
          dish_img_list.push("forscreen/resource/" + img_url);
          console.log(dish_img_list);
          var end_flag = dish_img_list.length
        }
        console.log('end_flag'+end_flag)
        console.log('total_choose_img'+total_choose_img)
        if (end_flag == total_choose_img) {
          if (type == 'all') {
            var welcome_info = that.data.welcome_info
            welcome_info.images = dish_img_list;
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

    var welcome_info = that.data.welcome_info;

    var img_list = welcome_info.images;
    for (var i = 0; i < img_list.length; i++) {
      if (i == keys) {
        img_list.splice(keys, 1);
        break;
      }
    }
    welcome_info.images = img_list;
    that.setData({
      welcome_info: welcome_info
    })
    
  },
  /**
   * 选择字体样式
   */
  selectWordType:function(e){
    var that = this;
    var wordtype_list = that.data.wordtype_list;
    var index = e.detail.value;
    var welcome_info = that.data.welcome_info;
    welcome_info.font_id = wordtype_list[index].id  
    that.setData({
      welcome_info: welcome_info,
      wordtype_index: index
    })
  },
  addContent:function(e){
    var content = e.detail.value;
    var welcome_info = this.data.welcome_info;
    welcome_info.content = content;
    this.setData({welcome_info:welcome_info})
  },
  /**
   * 选择字体大小
   */
  selectWordSize:function(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    var welcome_info = that.data.welcome_info;
    welcome_info.wordsize_id = id;
    that.setData({
      welcome_info: welcome_info
    })
  },
  /**
   * 选择字体颜色
   */
  selectWordColor:function(e){
    var that = this;
    var welcome_info = that.data.welcome_info;
    var id = e.currentTarget.dataset.id;
    welcome_info.color_id = id;
    that.setData({
      welcome_info: welcome_info
    })
  },
  bindChangeMusic:function(e){
    console.log(e)
    var music_id = e.detail.value;
    var welcome_info = this.data.welcome_info;
    welcome_info.music_id = music_id;
    this.setData({welcome_info:welcome_info})
  },
  playTimesChange:function(e){

    var stay_time = e.detail.value;
    var welcome_info = this.data.welcome_info;
    //welcome_info.stay_time = stay_time;
    var stay_times = this.data.stay_times;

    for(let i in stay_times){
      if(stay_times[i].id==stay_time){
        stay_times[i].is_select = 1;
      }else {
        stay_times[i].is_select = 0;
      }
    }
    console.log(stay_times);
    this.setData({welcome_info:welcome_info,stay_times:stay_times});
  },
  submitWelcome:function(e){
    var that = this;
    var welcome_info = that.data.welcome_info;
    var stay_times =  that.data.stay_times;
    if(welcome_info.images.length==0){
      app.showToast('请上传背景图片',2000,'none',false);
      return false;
    }
    var content = e.detail.value.content.replace(/\s+/g, '');
    if(content==''){
      app.showToast('请输入欢迎语',2000,'none',false);
      return false;
    }
    /*if(welcome_info.font_id==''){
      app.showToast('请选择字体样式',2000,'none',false);
      return false;
    }*/
    if(welcome_info.wordsize_id==0){
      app.showToast('请选择字体大小',2000,'none',false);
      return false;
    }
    if(welcome_info.color_id==0){
      app.showToast('请选择字体颜色',2000,'none',false);
      return false;
    }
    var music_id = welcome_info.music_id;
    var music    = that.data.music;
    music_id = music[music_id].id;

    for(let i in stay_times){
      if(stay_times[i].is_select==1){
        var stay_time = stay_times[i].id
        break;
      }
    }
    /*if(welcome_info.stay_time==0){
      app.showToast('请选择停留时间',2000,'none',false);
      return false;
    }*/

    var images = '';
    var space  = '';
    for(let i in welcome_info.images){
      images +=space + welcome_info.images[i];
      space = ','
    }
    utils.PostRequest(api_v_url + '/Welcome/addwelcome', {
      
      box_mac:box_mac,
      color_id:welcome_info.color_id,
      content:content,
      font_id:welcome_info.font_id,
      images:images,
      openid:openid,
      stay_time:stay_time,
      type:type,
      wordsize_id:welcome_info.wordsize_id,
      music_id:music_id
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('保存成功')
      var welcome_id = data.result.welcome_id;
      that.forscreenWelcome(welcome_id,welcome_info)
      if(pageid=='index'){
        that.setData({is_edit:1})
      }else {
        wx.navigateBack({
          delta: 1
        })
      }
      
    })
  },
  butForscreenWelcome:function(e){
    var welcome_info = this.data.welcome_info;
    this.forscreenWelcome(welcome_id,welcome_info);
  },
  forscreenWelcome:function(welcome_id,welcome_info){
    var that = this;
    
    utils.PostRequest(api_v_url + '/Welcome/demandplay', {
      openid:openid,
      box_mac:box_mac,
      welcome_id:welcome_id
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('投屏成功',2000,'success')
    })
    var forscreen_id =(new Date()).valueOf();
    var image_list = welcome_info.images;
    var image_str ='';
    var space  = '';
    for(let i in image_list){
      image_str +=space +'"'+image_list[i]+'"';
      space = ',';
    }
    utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: 42,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: welcome_info.content,
      imgs: '['+image_str+']',
      res_sup_time: 0,
      res_eup_time: 0,
      resource_type: 1,
      res_nums: image_list.length,
      serial_number:app.globalData.serial_number
    }, (data, headers, cookies, errMsg, statusCode) => {
    },res=>{},{ isShowLoading: false })
    
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