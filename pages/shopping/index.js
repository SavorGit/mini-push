// pages/shopping/index.js
/**
 * 【商城】首页
 */
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp()
var box_mac; //当前连接机顶盒mac
var page = 1; //当前节目单页数
var openid; //用户openid
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var pageid = 1;
var goods_list;
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

    }, {
      isShowLoading: false
    }),
  },
  Page: {},

  Netty: {}
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    topBanners: {
      indicatorDots: true,
      autoplay: true,
      interval: 3000,
      duration: 300,
      list: []
    },
    box_mac: '',
    page_arr: [],
    category_id: '',
    keywords: '',
    mall_cart_nums: 0,
    goods_id:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    goods_list = [];
    self.setData({
      category_id: 0,
      keywords: ''
    })
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      self.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(self); //判断用户是否注册

      //商品列表
      //self.getGoodsList(0, 1, app.globalData.openid,1);
      //获取商品分类
      self.getCategoryList(app.globalData.openid);
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          self.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(self); //判断用户是否注册
          //获取商品分类
          self.getCategoryList(openid);
          //商品列表
          //self.getGoodsList(0, 1, openid,1);
        }
      }
    }

    //轮播图
    self.getBannerList();
    

  },
  isHaveCallBox: function (openid) {
    var that = this;
    utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox?openid=' + openid, {}, (data, headers, cookies, errMsg, statusCode) => {
      var is_have = data.result.is_have;
      if (is_have == 1) {
        that.setData({
          box_mac: data.result.box_mac,
          hotel_info: data.result,
        });
      }
    })
  },
  //轮播图
  getBannerList: function () {
    var self = this;
    utils.PostRequest(api_v_url + '/Adsposition/getAdspositionList', {
      position: 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var topBanners = self.data.topBanners;
      topBanners.list = data.result
      self.setData({
        topBanners: topBanners,
      })
    });
  },
  //banner点击跳转
  bannerGo: function (e) {
    var linkcontent = e.currentTarget.dataset.linkcontent;
    /*wx.navigateTo({
      url: linkcontent 
    })*/
    wx.switchTab({
      url: linkcontent
    })
  },
  //输入关键词
  inputSearch: function (e) {
    var keywords = e.detail.value.replace(/\s+/g, '');
    this.setData({
      keywords: keywords
    })
  },
  //搜索商品
  searchGoods: function (e) {
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    var keywords = this.data.keywords;
    if (keywords == '') {
      app.showToast('请输入搜索关键词');
      return false;
    }
    wx.showLoading({
      title: '搜索中',
      mask: true,
    })
    console.log(keywords);
    wx.navigateTo({
      url: '/mall/pages/goods/search_result?openid=' + openid + '&keywords=' + keywords,
      success: function (e) {
        wx.hideLoading();
      }
    })
  },
  //商品分类
  getCategoryList: function (openid) {
    var that = this;
    utils.PostRequest(api_v_url + '/category/categorylist', {}, (data, headers, cookies, errMsg, statusCode) => {
      var category_list = data.result.category_list
      var page_arr = that.data.page_arr;
      var category_id = category_list[0].id;
      for (var i = 0; i < category_list.length; i++) {
        var id = category_list[i].id;
        page_arr[id] = 1;
      }
      that.getGoodsList(category_id, 1, openid,1);
      that.setData({
        category_id:category_id,
        page_arr: page_arr,
        category_list: category_list,
      })
    });
  },
  //商品列表
  getGoodsList: function (category_id, page, openid ,action=0) {
    var that = this;
    utils.PostRequest(api_v_url + '/shop/goods', {
      category_id: category_id,
      openid: openid,
      page: page,
      action:action
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (typeof (goods_list[category_id]) != 'undefined') {
        var rts = data.result.datalist
        if (goods_list[category_id].length == rts.length) {

        } else {
          goods_list[category_id] = data.result.datalist;
          that.setData({
            goods_list: goods_list,
          })
        }
      } else {
        goods_list[category_id] = data.result.datalist;
        that.setData({
          goods_list: goods_list,
        })
      }

    });
  },
  //选择分类
  selectCate: function (e) {
    var that = this;
    var category_id = e.currentTarget.dataset.category_id;
    var user_info = wx.getStorageSync(cache_key + 'user_info')
    that.setData({
      category_id: category_id
    }, function () {
      try {
        that.switchCategoryTabBar(e);
      } catch (error) {
        console.error(error)
      }
    });
    var page_arr = that.data.page_arr;
    var select_page = 1;
    for (let index in page_arr) {
      if (category_id == index) {
        select_page = page_arr[index];
      }
    }
    if (typeof (goods_list[category_id]) == 'undefined') {
      that.getGoodsList(category_id, select_page, user_info.openid);
    }

  },
  loadMore: function (e) {
    var that = this;
    var category_id = that.data.category_id;
    var page_arr = that.data.page_arr;
    var select_page = 1;
    var user_info = wx.getStorageSync(cache_key + 'user_info')
    for (let index in page_arr) {
      if (index == category_id) {
        select_page = page_arr[index] + 1;
        page_arr[index] += 1;
        break;
      }
    }
    that.setData({
      page_arr: page_arr,
    })
    that.getGoodsList(category_id, select_page, user_info.openid)
  },
  //电视播放
  boxShow(e) {
    let self = this;
    let listIndex = e.currentTarget.dataset.index;
    var box_mac = e.target.dataset.boxmac;


    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;
      var filename = e.currentTarget.dataset.filename; //文件名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;


      var forscreen_id = e.currentTarget.dataset.goods_id;
      var res_type = 2;
      var res_nums = 1;
      var duration = e.currentTarget.dataset.duration;
      var resource_size = e.currentTarget.dataset.resource_size;
      var forscreen_url = e.currentTarget.dataset.forscreen_url;
      var filename = e.currentTarget.dataset.filename;
      var tx_url = e.currentTarget.dataset.tx_url;
      var pubdetail = [{
        'duration': 0,
        'resource_size': 0,
        'forscreen_url': '',
        'res_id': 0
      }];
      for (var i = 0; i < 1; i++) {
        pubdetail[0].duration = duration;
        pubdetail[0].resource_size = resource_size;
        pubdetail[0].forscreen_url = forscreen_url;
        pubdetail[0].res_id = forscreen_id;
        pubdetail[0].filename = filename;
        pubdetail[0].res_url = tx_url;
      }
      var hotel_info = e.currentTarget.dataset.hotel_info;
      app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, 5, hotel_info, self);

      // 调用记录播放次数接口
      utils.PostRequest(api_url + '/Smallapp4/demand/recordPlaynum', {
        openid: openid,
        res_id: forscreen_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        let program_list = self.data.program_list;
        program_list[listIndex].play_num = data.result.play_num;
        self.setData({
          program_list: program_list
        });
      });

      mta.Event.stat('optimizationClickTvPlay', {
        'goodsid': forscreen_id
      })

    }
  }, //电视播放结束


  //查看详情
  gotoDetail: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    var box_mac = e.currentTarget.dataset.box_mac;
    var type = e.currentTarget.dataset.type;
    if (type == 10) {
      var url = '/pages/demand/goods_detail?goods_id=' + goods_id + '&box_mac=' + box_mac
    } else if (type == 22) {
      var url = '/pages/hotel/goods/detail?goods_id=' + goods_id;
    }
    wx.navigateTo({
      url: url,
    })
  },
  //购物车减数量
  cutNum: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var stock_num = goods_info.stock_num; //库存
    if (goods_info.amount == 1) {
      app.showToast('至少选择一件商品');
      return false;
    }
    goods_info.amount -= 1;
    that.setData({
      goods_info: goods_info,
    })
  },
  //购物车增数量
  addNum: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var stock_num = goods_info.stock_num; //库存
    if (goods_info.amount == stock_num) {
      app.showToast('该商品库存不足');
      return false;
    }
    goods_info.amount += 1;
    that.setData({
      goods_info: goods_info,
    })
  },
  addMallCart: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var cart_info = {};
    cart_info.id = goods_info.id;
    cart_info.name = goods_info.name;
    cart_info.price = goods_info.price;
    cart_info.line_price = goods_info.line_price;
    cart_info.stock_num = goods_info.stock_num;
    cart_info.type  = goods_info.type;
    if(cart_info.gtype==2){
      cart_info.img_url = goods_info.model_img
    }else{
      cart_info.img_url = goods_info.img_url;
    }
    cart_info.amount = goods_info.amount;


    cart_info.ischecked = true;
    
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    if (mall_cart_list == '') {
      mall_cart_list = [];
      mall_cart_list.unshift(cart_info);
      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
      that.setData({
        mall_cart_nums: cart_info.amount
      })
    } else {
      mall_cart_list = JSON.parse(mall_cart_list)

      var is_have = 0;
      for (var i = 0; i < mall_cart_list.length; i++) {
        if (mall_cart_list[i].id == cart_info.id) {
          mall_cart_list[i].amount += Number(cart_info.amount);
          mall_cart_list[i].ischecked = true;
          is_have = 1;
          break;
        }
      }
      if (is_have == 0) {
        mall_cart_list.unshift(cart_info);
      }
      var mall_cart_nums = 0;
      for (let index in mall_cart_list) {
        mall_cart_nums += Number(mall_cart_list[index].amount);
      }
      that.setData({
        mall_cart_nums: mall_cart_nums
      })

      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
    }
    that.setData({
      showBuyGoodsPopWindow: false
    });
    app.showToast('添加购物车成功');
  },
  onPullDownRefresh: function () {
    mta.Event.stat("pulltorefresh", {})
    this.onLoad();
    //wx.showNavigationBarLoading();
    // 隐藏导航栏加载框
    //wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
    self.tabBar = {
      category: {
        scrollViewWidth: 750
      }
    };
    wx.createSelectorQuery().select('.tab-bar').boundingClientRect((rect) => {
      self.tabBar.category.scrollViewWidth = Math.round(rect.width);
    }).exec();
  },
  switchCategoryTabBar(e) {
    let self = this;
    let offsetLeft = e.currentTarget.offsetLeft;
    wx.createSelectorQuery().select('.tab-bar .selected').fields({
      size: true
    }, function (res) {
      self.setData({
        scrollLeft: offsetLeft - (self.tabBar.category.scrollViewWidth - res.width) / 2
      });
    }).exec();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    //判断是否连接包间盒子
    that.isHaveCallBox(user_info.openid);
    //购物车数量
    that.getMallCartNums(user_info.openid);
    var category_id = that.data.category_id;
    
    var page_arr = that.data.page_arr;
    if(page_arr.length>0){
      var select_page = page_arr[category_id];
    //
    that.getGoodsList(category_id, select_page, user_info.openid,1);
    }
    
  },
  getMallCartNums: function (openid) {
    var that = this;
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list);
    if (mall_cart_list != '') {
      var mall_cart_nums = 0
      mall_cart_list = JSON.parse(mall_cart_list);
      console.log(mall_cart_list);
      for (let index in mall_cart_list) {
        mall_cart_nums += Number(mall_cart_list[index].amount);
      }
      console.log(mall_cart_nums)
      that.setData({
        mall_cart_nums: mall_cart_nums
      })
    } else {
      that.setData({
        mall_cart_nums: 0
      });
    }
  },
  buyOne: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    wx.navigateTo({
      url: '/mall/pages/order/confirmation?goods_id=' + goods_info.id + '&openid=' + openid + '&order_type=1&amount=' + goods_info.amount,
    })
  },
  gotoMallCart: function (e) {
    wx.navigateTo({
      url: '/mall/pages/goods/shopping_cart',
    })
  },
  selectModel:function(e){
    var that = this;
    var goods_info = that.data.goods_info;
    var index = e.currentTarget.dataset.index;  //规格分类
    var idx   = e.currentTarget.dataset.idx;    //规格类型
    for(let j in goods_info.attrs[index].attrs){
      if(goods_info.attrs[index].attrs[j].is_select==1){
        goods_info.attrs[index].attrs[j].is_select = 0;
        break;
      }
    }
    goods_info.attrs[index].attrs[idx].is_select = 1;
    
    //通过接口获取对应规格的商品信息
    that.getGoodsDetailByAttrs(goods_info.attrs);

  },
  getGoodsDetailByAttrs:function(attrs){
    var that = this;
    
    var attr = '';
    var space = '';
    for(let i in attrs){
      for (let j in attrs[i].attrs){
        if(attrs[i].attrs[j].is_select==1){
          attr += space + attrs[i].attrs[j].id;
          space = '_';
        }
      }
    }
    if(attr !=''){
      var goods_id = that.data.goods_id;
      utils.PostRequest(api_v_url + '/goods/getDetailByAttr', {
        attr: attr,
        goods_id:goods_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        var goods_info = data.result;
        goods_info.amount = 1;
        that.setData({
          goods_info:goods_info
        })
      }, re => { }, { isShowLoading: false });
    }
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 打开购买弹窗
  openBuyGoodsPopWindow: function (e) {
    let self = this;
    var goods_info = e.currentTarget.dataset.goods_info;
    var goods_id = e.currentTarget.dataset.goods_id;

    goods_info.amount = 1;
    self.setData({
      showBuyGoodsPopWindow: true,
      goods_info: goods_info,
      goods_id:goods_id
    });
  },

  // 关闭购买弹窗
  closeBuyGoodsPopWindow: function (e) {
    let self = this;
    self.setData({
      showBuyGoodsPopWindow: false
    });
  },

  noneActive: function (e) {}
})