// pages/hotel/comment/index.js
/**
 * 用户满意度调查页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var openid;
var box_mac;
var box_id;
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
    commentLevel:0,  //评价等级
    showButton:true,     //顺便说两句
    comment_disable:true, //评价按钮置灰
    is_comment:0,   //是否评价
    showWindow:false , //打赏弹窗
    reward_money:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    box_mac = options.box_mac
    box_id  = options.box_id
    if(typeof(box_id)=='undefined' || typeof(openid)=='undefined'){
      wx.navigateBack({
        delta: 1
      })
    }else {
      that.setData({openid:openid,box_mac:box_mac})
      that.commentConfig(openid)
    }
    
  },
  commentConfig:function(){
    var that = this;
    utils.PostRequest(api_v_url + '/index/getConfig', {
      box_id: box_id,
      openid:openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var staff_user_info = data.result.staff_user_info;
      var is_open_reward = data.result.is_open_reward;
      var is_reward = that.data.is_reward;
        if(staff_user_info.staff_id==0 || is_open_reward==0){
          is_reward = 0;
        }
      that.setData({
        is_open_reward:is_open_reward,
        is_reward:is_reward,
        staff_user_info:data.result.staff_user_info,
        tags:data.result.tags,
        comment_str:'',
        reward_list:data.result.reward_money,
        cacsi:data.result.cacsi,
      })
    },res=>{
      wx.navigateBack({
        delta: 1
      })
    })
  },
  /**
   * 选择评价类型 
   */
  selectCommentLevle:function(e){
    console.log(e)
    var commentLevel = e.currentTarget.dataset.commentlevel;  //1很糟糕 2一般般 3太赞了
    var cacsi = this.data.cacsi;
    for(let i in cacsi){
      if(i!=commentLevel){

        var label = cacsi[i].label
        for(let j in label){
          label[j].selected= false;
        }

      }
    }

    this.setData({
      cacsi:cacsi,
      commentLevel:commentLevel,
      comment_disable:false
    })

  },

  /**
   * 选择评价标签
   */
  selectCommentLable:function(e){
    console.log(e)
    var cacsi = this.data.cacsi;
    var commentLevel = this.data.commentLevel;
    var lableKey = e.target.dataset.lablekey;
    if(cacsi[commentLevel].label[lableKey].selected == false){//选择标签
      cacsi[commentLevel].label[lableKey].selected = true;
    }else {                                                   //取消标签
      cacsi[commentLevel].label[lableKey].selected = false;
    }
    this.setData({
      cacsi:cacsi
    })
  },
  
  
  clickComment:function(e){
    this.setData({showButton:false})
  },
  
  /**
   * 随便说两句输入框
   */
  editCommnet:function(e){
    var comment_str = e.detail.value.replace(/\s+/g, '');
    this.setData({comment_str:comment_str})
    
  },

  /**
   * 提交评价
   */
  submitComment:function(e){
    var that = this;
    var comment_str = this.data.comment_str.replace(/\s+/g, '');
    var staff_user_info = this.data.staff_user_info;
    var staff_id = staff_user_info.staff_id;
    var is_open_reward = that.data.is_open_reward; //打赏开关 1开0关
    var commentLevel = that.data.commentLevel;
    if(commentLevel==0){
      app.showToast('请您选择满意度');
      return false;
    }
    var cacsi = that.data.cacsi;
    var tag_ids  = '';
    var tag_strs = '';
    var space    = '';
    for(var i in cacsi[commentLevel].label){
      if(cacsi[commentLevel].label[i].selected==true){
        tag_ids  += space + cacsi[commentLevel].label[i].id;
        tag_strs += space+cacsi[commentLevel].label[i].name;
        space = ',';
      }
    }


    utils.PostRequest(api_v_url + '/Comment/subComment', {
      openid: openid,
      score:0,
      content:comment_str,
      staff_id :staff_id,
      box_mac:box_mac,
      satisfaction_id:commentLevel,
      tag_ids:tag_ids,
    }, (data, headers, cookies, errMsg, statusCode) => {


      if(staff_id==0){

        wx.switchTab({
          url: '/pages/index/index',
          success:function(){
            app.showToast('感谢支持');
          }
        })

        
      }else{
        var comment_id = data.result.comment_id;
        that.setData({comment_disable:false,tag_strs:tag_strs,comment_id:comment_id,is_comment:1})
      }
      var forscreen_id = (new Date()).valueOf();
      that.recordForscreenLog(forscreen_id,openid,box_mac,52);
      
    })

  },
  /***
   * 提交打赏
   */
  payReward:function(){
    
    var that = this;
    var reward_list = that.data.reward_list;
    var reward_id = 0;
    var comment_id = that.data.comment_id;
    for(let i in reward_list){
      if(reward_list[i].selected===true){
        reward_id = reward_list[i].id;
        break;
      }
    }
    var money = that.data.reward_money;
    if(money=='' && reward_id==0){
      app.showToast('请选择打赏金额');
      return false;
    }
    if(!app.isInteger(money)){
      app.showToast('请输入1-500打赏金额');
      return false;
    }
    
    if(money!='' &&(money<1 || money>500)){
      app.showToast('请输入1-500打赏金额');
      return false;
    }

    var staff_user_info = this.data.staff_user_info;
    var staff_id = staff_user_info.staff_id;
    
    utils.PostRequest(api_v_url + '/comment/reward', {
      box_mac:box_mac,
      reward_id:reward_id,
      money:money,
      openid: openid,
      staff_id:staff_id,
      comment_id:comment_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      wx.requestPayment({
        'timeStamp': data.result.payinfo.timeStamp,
        'nonceStr': data.result.payinfo.nonceStr,
        'package': data.result.payinfo.package,
        'signType': data.result.payinfo.signType,
        'paySign': data.result.payinfo.paySign,
        success(res) {//支付成功
          wx.switchTab({
            url: '/pages/index/index',
            success:function(){
              app.showToast('感谢支持');
            }
          })
        },
        fail(res) {
          if (res.errMsg == "requestPayment:fail cancel") {
            app.showToast('支付取消')
            
          } else {
            app.showToast('支付失败')
          }
          that.setData({comment_disable:false})
        }
      },re => { 
        that.setData({comment_disable:false})
      })
    })
  },
  //选择打赏金额
  selectReward:function(e){
    console.log(e)
    var reward_list = this.data.reward_list;
    var keys = e.currentTarget.dataset.keys;
    for(let i in reward_list){
      if(reward_list[i].selected===true){
        reward_list[i].selected = false;
      }
      if(i==keys){
        reward_list[i].selected = true;
      }
    }
    this.setData({reward_list:reward_list,reward_money:''});
  },
  /**
   * 输入打赏金额
   */
  inputRewardMoney:function(e){
    console.log(e)
    var reward_money = e.detail.value.replace(/\s+/g, '');
    
    var reward_list = this.data.reward_list;
    for(let i in reward_list){
      reward_list[i].selected = false;
    }
    this.setData({reward_money:reward_money,reward_list:reward_list})
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
  openReward:function(e){
    console.log(e)
    var is_close = e.currentTarget.dataset.is_close;
    if(is_close== 1){
      var showWindow = false;
    }else {
      var showWindow = true;
    }
    this.setData({showWindow:showWindow})
  },
  /*subStar:function(e){
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
  },*/
  
  /*clickTag:function(e){
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
  },*/


  /*subComment:function(openid,score,comment_str,staff_id,box_mac){
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
  },*/
  
  /*
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
    
    for(let i in star_list){
      if(star_list[i].is_select==true){
        score  +=1;
      }
    }
    var is_reward = that.data.is_reward;
    
    if(is_reward==1){//打赏
      var reward_id = 0;
      var reward_list = that.data.reward_list;
      for(let i in reward_list){
        if(reward_list[i].selected===true){
          reward_id = reward_list[i].id;
          break;
        }
      }
      if(reward_id==0){
        app.showToast('请选择打赏金额');
        return false;
      }
      that.setData({comment_disable:true})
      that.payReward(openid,score,comment_str,staff_user_info.staff_id,box_mac,reward_id);
    }else {//不打赏
      that.subComment(openid,score,comment_str,staff_user_info.staff_id,box_mac)
    }
    
  },*/
  gotoHome:function(e){
    wx.navigateBack({
      delta: 1,
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