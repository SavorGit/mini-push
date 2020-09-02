// pages/hotel/comment/index.js
/**
 * 用户满意度调查页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var openid;
var box_mac;
var api_v_url = app.globalData.api_v_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    star_list:[{'lev':1,'is_select':true},{'lev':2,'is_select':true},{'lev':3,'is_select':true},{'lev':4,'is_select':true},{'lev':5,'is_select':true}],
    comment_str:'',
    is_reward:'1',
    comment_disable:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    box_mac = options.box_mac
    that.setData({openid:openid,box_mac:box_mac})
    that.isHaveCallBox(openid)
  },
  isHaveCallBox:function(){
    var that = this;
    utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
      openid: openid,
      pop_eval:1
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (data.result.is_have == 1) {//如果已连接盒子
        
        that.setData({
          
          staff_user_info:data.result.staff_user_info,
          tags:data.result.tags,
          comment_str:'',
          reward_list:data.result.reward_list

        })
        
      }
    })
  },
  subStar:function(e){
    var star_list = this.data.star_list;
    var keys = e.target.dataset.keys;
    var flag = keys +1;
    
    if(flag<star_list.length){
      for(let i in star_list){
        if(i>keys){
          star_list[i].is_select = false
        }
      }
      this.setData({star_list:star_list})
    }
  },
  addStar:function(e){
    var star_list = this.data.star_list;
    var keys = e.target.dataset.keys;
    for(let i in star_list){
      if(i<=keys){
        star_list[i].is_select = true;
      }
    }
    this.setData({star_list:star_list})
  },
  editCommnet:function(e){
    var comment_str = e.detail.value;
    this.setData({comment_str:comment_str})
    
  },
  clickTag:function(e){
    var comment_str = this.data.comment_str;
    var value = e.target.dataset.value;
    var keys  = e.target.dataset.keys;
    var tags  = this.data.tags;
    for(let i in tags){
      if(i== keys){
        tags[i].selected = true
      }else {
        tags[i].selected = false
      }
    }
    this.setData({tags:tags})
    if(comment_str==''){
      comment_str += value
    }else {
      comment_str += ','+value
    }
    
    this.setData({comment_str:comment_str})
  },


  subComment:function(openid,score,comment_str,staff_id,box_mac){
    var that = this;
    utils.PostRequest(api_v_url + '/Comment/subComment', {
      openid: openid,
      score:score,
      content:comment_str,
      staff_id :staff_id,
      box_mac:box_mac
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({comment_disable:false})
      
      wx.navigateBack({
        delta: 1,
        success:function(){
          app.showToast('感谢您的支持！',2000,'success')
        }
      })
      var forscreen_id = (new Date()).valueOf();
      that.recordForscreenLog(forscreen_id,openid,box_mac,52);
      
    })
  },
  payReward:function(openid,score,comment_str,staff_id,box_mac,reward_money){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid: openid,
      reward_money:reward_money,
    }, (data, headers, cookies, errMsg, statusCode) => {
      wx.requestPayment({
        'timeStamp': data.result.payinfo.timeStamp,
        'nonceStr': data.result.payinfo.nonceStr,
        'package': data.result.payinfo.package,
        'signType': 'MD5',
        'paySign': data.result.payinfo.paySign,
        success(res) {
          that.subComment(openid,score,comment_str,staff_id,box_mac) 
        },
        fail(res) {
          if (res.errMsg == "requestPayment:fail cancel") {
            app.showToast('支付取消')
            
          } else {
            app.showToast('支付失败')
          }
          that.setData({comment_disable:false})
        }
      })
    })
  },
  submitComment:function(e){
    console.log(e);
    //return false;
    var that = this;
    var star_list = this.data.star_list;
    var comment_str = this.data.comment_str.replace(/\s+/g, '');
    var staff_user_info = this.data.staff_user_info;
    var openid = this.data.openid;
    var box_mac = e.detail.value.box_mac;

    var score = 0;
    var flag_score = 0;
    if(comment_str==''){
      app.showToast('请填写评价内容');
      return false;
    }
    for(let i in star_list){
      if(star_list[i].is_select==true){
        score  +=1;
      }
    }
    var is_reward = that.data.is_reward;
    
    if(is_reward==1){//打赏
      var reward_money = 0;
      var reward_list = that.data.reward_list;
      for(let i in reward_list){
        if(reward_list[i].is_select==1){
          reward_money = reward_list[i].reward_money;
          break;
        }
      }
      if(reward_money==0){
        app.showToast('请选择打赏金额');
        return false;
      }
      that.setData({comment_disable:ture})
      that.payReward(openid,score,comment_str,staff_user_info.staff_id,box_mac,reward_money);
    }else {//不打赏
      that.subComment(openid,score,comment_str,staff_user_info.staff_id,box_mac)
    }
    
  },
  recordForscreenLog:function(forscreen_id,openid,box_mac,action=0){

    utils.PostRequest(api_v_url+'/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: action,
      mobile_brand: app.globalData.mobile_brand,
      mobile_model: app.globalData.mobile_model,
      imgs: '[]',
      serial_number:app.globalData.serial_number

    }, (data, headers, cookies, errMsg, statusCode) => {
      
    },re => { }, { isShowLoading: false })
    
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

  },

  // 选项卡选择
  showTab: function (e) {
    let self = this;
    let is_reward = e.currentTarget.dataset.is_reward;
    self.setData({
      is_reward: is_reward
    });
  },
})