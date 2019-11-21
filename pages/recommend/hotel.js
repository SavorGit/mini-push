// pages/recommend/hotel.js
const util = require('../../utils/util.js')
const app = getApp()
var openid; //用户openid
var page = 1; //当前节目单页数
var hotel_list;
var box_mac;
var rest_appid = app.globalData.rest_appid;
var jijian_appid = app.globalData.jijian_appid;
var api_url = app.globalData.api_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    cityArray: ['北京'],
    objectCityArray: [],
    cityIndex: 0,

    areaArray: [],
    objectAreaArray: [],
    areaIndex: 0,

    cuisineArray: [],
    objectCuisineArray: [],
    cuisineIndex: 0,

    perCapitaPayArray: [],
    objectPerCapitaPayArray: [],
    perCapitaPayIndex: 0,
    hotel_list: [],

    hiddens: true, //加载更多
    box_mac: '', //机顶盒mac
    close_hotel_hint: 1,
    link_type:app.globalData.link_type,
    wifiErr: app.globalData.wifiErr
    

  },
  //城市切换 
  bindCityPickerChange: function(e) {
    var that = this;
    var city_list = that.data.objectCityArray;
    var picCityIndex = e.detail.value //切换之后城市key
    var cityIndex = that.data.cityIndex; //切换之前城市key

    if (picCityIndex != cityIndex) {
      that.setData({
        cityIndex: picCityIndex,
        areaIndex: 0
      })
      //获取当前城市的区域
      var area_id = city_list[picCityIndex].id;
      wx.request({
        url: api_url+'/Smallapp21/Area/getSecArea',
        header: {
          'content-type': 'application/json'
        },
        data: {
          area_id: area_id
        },
        success: function(res) {
          that.setData({
            areaArray: res.data.result.area_name_list,
            objectAreaArray: res.data.result.area_list
          })
        }
      });
      //获取酒楼列表
      var food_style_list = that.data.objectCuisineArray;
      var cuisineIndex = that.data.cuisineIndex;

      var food_style_id = food_style_list[cuisineIndex].id;

      var avg_exp_list = that.data.objectPerCapitaPayArray;
      var perCapitaPayIndex = that.data.perCapitaPayIndex;
      var avg_exp_id = avg_exp_list[perCapitaPayIndex].id;

      getHotelList(area_id, 0, food_style_id, avg_exp_id);

      function getHotelList(area_id, county_id, food_style_id, avg_exp_id) {
        wx.request({
          url: api_url+'/smallapp21/Hotel/recList',
          header: {
            'content-type': 'application/json'
          },
          data: {
            page: page,
            area_id: area_id,
            county_id: county_id,
            food_style_id: food_style_id,
            avg_exp_id: avg_exp_id
          },
          success: function(res) {
            that.setData({
              hotel_list: res.data.result
            })
          }
        })
      }
    }
  },
  //切换区域
  bindAreaPickerChange: function(e) {
    var that = this;
    var area_list = that.data.objectAreaArray;
    var areaIndex = e.detail.value;
    that.setData({
      areaIndex: e.detail.value
    })

    var city_list = that.data.objectCityArray;
    var cityIndex = that.data.cityIndex; //城市key
    var area_id = city_list[cityIndex].id; //城市id

    var county_id = area_list[areaIndex].id; //区域id

    var food_style_list = that.data.objectCuisineArray;
    var cuisineIndex = that.data.cuisineIndex;
    var food_style_id = food_style_list[cuisineIndex].id; //菜系id

    var avg_exp_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = that.data.perCapitaPayIndex;
    var avg_exp_id = avg_exp_list[perCapitaPayIndex].id; //人均消费id
    getHotelList(area_id, county_id, food_style_id, avg_exp_id);

    function getHotelList(area_id, county_id, food_style_id, avg_exp_id) {
      wx.request({
        url: api_url+'/smallapp21/Hotel/recList',
        header: {
          'content-type': 'application/json'
        },
        data: {
          page: page,
          area_id: area_id,
          county_id: county_id,
          food_style_id: food_style_id,
          avg_exp_id: avg_exp_id
        },
        success: function(res) {
          that.setData({
            hotel_list: res.data.result
          })
        }
      })
    }
  },
  //切换菜系
  bindCuiPickerChange: function(e) {
    var that = this;
    var cui_list = that.data.objectCuisineArray;
    var cuisineIndex = e.detail.value
    that.setData({
      cuisineIndex: cuisineIndex
    })
    var city_list = that.data.objectCityArray;
    var cityIndex = that.data.cityIndex; //城市key
    var area_id = city_list[cityIndex].id; //城市id

    var county_list = that.data.objectAreaArray;
    var areaIndex = that.data.areaIndex;
    var county_id = county_list[areaIndex].id; //区域id

    var food_style_id = cui_list[cuisineIndex].id; //菜系id

    var avg_exp_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = that.data.perCapitaPayIndex;
    var avg_exp_id = avg_exp_list[perCapitaPayIndex].id; //人均消费id

    getHotelList(area_id, county_id, food_style_id, avg_exp_id);

    function getHotelList(area_id, county_id, food_style_id, avg_exp_id) {
      wx.request({
        url: api_url+'/smallapp21/Hotel/recList',
        header: {
          'content-type': 'application/json'
        },
        data: {
          page: page,
          area_id: area_id,
          county_id: county_id,
          food_style_id: food_style_id,
          avg_exp_id: avg_exp_id
        },
        success: function(res) {
          that.setData({
            hotel_list: res.data.result
          })
        }
      })
    }


  },
  //切换消费水平
  bindPayPickerChange: function(e) {
    var that = this;
    var pay_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = e.detail.value
    this.setData({
      perCapitaPayIndex: perCapitaPayIndex
    })
    var avg_exp_id = pay_list[perCapitaPayIndex].id //人均消费id

    var city_list = that.data.objectCityArray;
    var cityIndex = that.data.cityIndex; //城市key
    var area_id = city_list[cityIndex].id; //城市id

    var county_list = that.data.objectAreaArray;
    var areaIndex = that.data.areaIndex;
    var county_id = county_list[areaIndex].id; //区域id

    var food_style_list = that.data.objectCuisineArray;
    var cuisineIndex = that.data.cuisineIndex;
    var food_style_id = food_style_list[cuisineIndex].id;

    getHotelList(area_id, county_id, food_style_id, avg_exp_id);

    function getHotelList(area_id, county_id, food_style_id, avg_exp_id) {
      wx.request({
        url: api_url+'/smallapp21/Hotel/recList',
        header: {
          'content-type': 'application/json'
        },
        data: {
          page: page,
          area_id: area_id,
          county_id: county_id,
          food_style_id: food_style_id,
          avg_exp_id: avg_exp_id
        },
        success: function(res) {
          that.setData({
            hotel_list: res.data.result
          })
        }
      })
    }
  },
  phonecallevent: function(e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //wx.hideShareMenu();
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    that.setData({
      openid:openid,
      rest_appid: rest_appid,
      jijian_appid: jijian_appid,
    })
    wx.request({
      url: api_url+'/smallapp21/User/isRegister',
      data: {
        "openid": openid,
        "page_id": 4
      },
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        if(res.data.code==10000){
          that.setData({
            close_hotel_hint: res.data.result.userinfo.close_hotel_hint,
          })
        }
      }
    }); //判断用户是否注册结束

    wx.request({
      url: api_url+'/Smallapp/index/isHaveCallBox?openid=' + openid,
      headers: {
        'Content-Type': 'application/json'
      },

      success: function(rest) {
        var is_have = rest.data.result.is_have;
        if (is_have == 1) {
          app.linkHotelWifi(rest.data.result, that);
          that.setData({
            is_link: 1,
            hotel_info:rest.data.result,
            hotel_name: rest.data.result.hotel_name,
            room_name: rest.data.result.room_name,
            box_mac: rest.data.result.box_mac,
            is_open_simple: rest.data.result.is_open_simple,
          })
          box_mac = rest.data.result.box_mac;
          //getHotelInfo(rest.data.result.box_mac);
        } else {
          that.setData({
            is_link: 0,
            box_mac: '',
          })
          box_mac = '';
        }
      }
    })
    //获取城市列表
    wx.request({
      url: api_url+'/Smallapp21/Area/getAreaList',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.setData({
          cityArray: res.data.result.city_name_list,
          objectCityArray: res.data.result.city_list
        })
      }
    })


    //获取当前城市
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        wx.request({
          url: api_url+'/Smallapp21/Area/getAreaid',
          header: {
            'content-type': 'application/json'
          },
          data: {
            latitude: latitude,
            longitude: longitude
          },
          success: function(res) {
            that.setData({
              cityIndex: res.data.result.cityindex
            })
            var area_id = res.data.result.area_id;
            wx.request({
              url: api_url+'/Smallapp21/Area/getSecArea',
              header: {
                'content-type': 'application/json'
              },
              data: {
                area_id: area_id
              },
              success: function(res) {
                that.setData({
                  areaArray: res.data.result.area_name_list,
                  objectAreaArray: res.data.result.area_list
                })
              }
            });
            //获取酒楼列表
            wx.request({
              url: api_url+'/smallapp21/Hotel/recList',
              header: {
                'content-type': 'application/json'
              },
              data: {
                page: page,
                area_id: area_id,
                county_id: 0,
                food_style_id: 0,
                avg_exp_id: 0
              },
              success: function(res) {
                //console.log(res);
                that.setData({
                  hotel_list: res.data.result
                })
              }
            })
          }
        })
      },
      fail: function(e) {
        that.setData({
          cityIndex: 0
        })
        var area_id = 1;
        wx.request({
          url: api_url+'/Smallapp21/Area/getSecArea',
          header: {
            'content-type': 'application/json'
          },
          data: {
            area_id: area_id
          },
          success: function(res) {
            that.setData({
              areaArray: res.data.result.area_name_list,
              objectAreaArray: res.data.result.area_list
            })
          }
        });
        //获取酒楼列表
        wx.request({
          url: api_url+'/smallapp21/Hotel/recList',
          header: {
            'content-type': 'application/json'
          },
          data: {
            page: page,
            area_id: area_id,
            county_id: 0,
            food_style_id: 0,
            avg_exp_id: 0
          },
          success: function(res) {
            //console.log(res);
            that.setData({
              hotel_list: res.data.result
            })
          }
        })
      }
    })
    //获取菜系列表
    wx.request({
      url: api_url+'/Smallapp21/FoodStyle/getList',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.setData({
          cuisineArray: res.data.result.food_name_list,
          objectCuisineArray: res.data.result.food_list
        })
      }
    })
    //获取人均消费
    wx.request({
      url: api_url+'/Smallapp21/Hotel/getExplist',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {

        that.setData({
          perCapitaPayArray: res.data.result.agv_name,
          objectPerCapitaPayArray: res.data.result.agv_lisg
        })
      }
    })

    //获取酒楼信息
    wx.request({
      url: api_url+'/Smallapp21/Hotel/recList',
      data: {
        page: page,
        openid: openid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.data.code == 10000) {
          hotel_list = res.data.result

          that.setData({
            hotel_list: res.data.result,
          })
        }
      }
    });
  },
  //上拉刷新
  loadMore: function(e) {
    var that = this;

    page = page + 1;
    that.setData({
      hiddens: false,
    })
    var city_list = that.data.objectCityArray;
    var cityIndex = that.data.cityIndex; //城市key
    var area_id = city_list[cityIndex].id; //城市id

    var county_list = that.data.objectAreaArray;
    var areaIndex = that.data.areaIndex;
    var county_id = county_list[areaIndex].id; //区域id

    var food_style_list = that.data.objectCuisineArray;
    var cuisineIndex = that.data.cuisineIndex;
    var food_style_id = food_style_list[cuisineIndex].id; //菜系id

    var avg_exp_list = that.data.objectPerCapitaPayArray;
    var perCapitaPayIndex = that.data.perCapitaPayIndex;
    var avg_exp_id = avg_exp_list[perCapitaPayIndex].id; //人均消费id


    getHotelList(area_id, county_id, food_style_id, avg_exp_id);

    function getHotelList(area_id, county_id, food_style_id, avg_exp_id) {
      wx.request({
        url: api_url+'/smallapp21/Hotel/recList',
        header: {
          'content-type': 'application/json'
        },
        data: {
          page: page,
          area_id: area_id,
          county_id: county_id,
          food_style_id: food_style_id,
          avg_exp_id: avg_exp_id
        },
        success: function(res) {
          if (res.data.code == 10000) {
            that.setData({
              hotel_list: res.data.result,
              hiddens: true,
            })
          } else {
            that.setData({
              hiddens: true,
            })
          }

        }
      })
    }
  },
  
  previewImage: function(e) {
    var current = e.currentTarget.dataset.src;
    var urls = [];
    for (var i = 0; i < 1; i++) {
      urls[i] = current;
    }
    wx.previewImage({
      current: urls[0], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  closeHotelHind:function(e){
    var that = this;
    var openid = e.currentTarget.dataset.openid;
    wx.request({
      url: api_url+'/Smallapp3/user/closeHotelHind',
      header: {
        'content-type': 'application/json'
      },
      data:{
        openid:openid
      },
      success:function(res){
        that.setData({
          close_hotel_hint:1
        })
      }
    })
    
  },
  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_url+'/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({
      showControl: true,
      qrcode_img: qrcode_url
    })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({
      showControl: false,
    })

  },
  //遥控退出投屏
  exitForscreen: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function (e) {
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function (e) {
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(box_mac, change_type);
  },
  modalConfirm: function (e) {
    console.log(e);
    var that = this;
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, that);
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