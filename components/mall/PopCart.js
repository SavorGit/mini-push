// components/mall/PopCart.js
/**
 * [组件] 商城购物车弹窗
 */

/**
 * 
 * 使用方法：
 * 
 * 首先，在对应页面的.json文件的usingComponents属性中加入子属性"PopAddCartWindow": "/components/mall/PopCart"
 * 然后，在对应页面的.wxml文件中按如下方式使用：
 *     格式：<PopAddCartWindow show="真值" goods="商品信息" tags="规格列表" bindClickMask="点击蒙层" bindClickCloseBtton="点击关闭按钮" bindSelectSpecs="选择规格" bindAddCount="增加数量" bindCutCount="减少数量" bindAddCart="点击加入购物车按钮" bindBuyNow="点击立即购买按钮" />
 *     例子：<PopAddCartWindow show="{{showBuyGoodsPopWindow}}" goods="{{goods_info}}" tags="{{goods_info.attrs}}" bindClickMask="closeBuyGoodsPopWindow" bindSelectSpecs="selectModel" bindAddCount="addNum" bindCutCount="cutNum" bindAddCart="addMallCart" bindBuyNow="buyOne" />
 
属性说明：
 show ：             Boolean               控制弹窗显示与隐藏。默认：false
 goods :             Object                商品信息。{
                                              amount: 购买数量
                                              gtype: "2"
                                              img_url: 无规格的商品图片
                                              model_img: 规格对应的商品图片
                                              name: 名称
                                              price: 单价
                                              stock_num: 库存量
                                           }。默认：{}
 tags ：             Array<Object>         规格列表。[{
                                              name: 类型名称
                                              attrs: [{
                                                name: 规格名称
                                              }]
                                            }]。默认：[]

事件说明：
 bindClickMask :         点击遮盖层的回调函数。
 bindClickCloseBtton :   点击弹窗关闭按钮的回调函数。
 bindSelectSpecs :       点击规格的回调函数。通过e.detail获取选中对象。
 bindAddCount ：         点击数量加号的回调函数。通过e.detail获取选中对象。
 bindCutCount ：         点击数量减号的回调函数。通过e.detail获取选中对象。
 bindAddCart ：          点击加入购物车的回调函数。通过e.detail获取选中对象。
 bindBuyNow ：           点击立即购买的回调函数。通过e.detail获取选中对象。
 

 */

let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //是否显示modal
    show: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal, propertieArray) {
        let self = this;
        if (newVal == true) {
          self.setData({
            maskShow: true,
            windowShow: true,
            openWindow: true
          });
        } else {
          self.setData({
            openWindow: false
          }, setTimeout(function () {
            self.setData({
              maskShow: false,
              windowShow: false
            });
          }, 500));
        }
      }
    },
    goods: {
      type: Object,
      value: {}
    },
    tags: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal, propertieArray) {
        let self = this;
        if (typeof (newVal) != "object" || !newVal instanceof Array) {
          newVal = [];
        }
        if (newVal.length < 1) {
          return;
        }
        let checkedTagIndexArray = self.data.checkedTagIndexArray;
        for (let index = 0; index < newVal.length; index++) {
          let tagGroup = newVal[index];
          checkedTagIndexArray[index] = -1;
          if (typeof (tagGroup) != 'object') {
            continue;
          }
          let tagArray = tagGroup.attrs;
          if (typeof (tagArray) != "object" || !tagArray instanceof Array) {
            tagArray = [];
          }
          if (tagArray.length < 1) {
            continue;
          }
          for (let index1 = 0; index1 < tagArray.length; index1++) {
            let tag = tagArray[index1];
            if (tag.is_select == 1 && checkedTagIndexArray[index] < 0) {
              checkedTagIndexArray[index] = index1;
            } else {
              tag.is_select = 0;
            }
          }
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    SystemInfo: app.SystemInfo,
    statusBarHeight: app.globalData.statusBarHeight,
    maskShow: false,
    windowShow: false,
    checkedTagIndexArray: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickMask(e) {
      let self = this;
      self.triggerEvent('ClickMask', {
        event: e,
        dataset: {}
      });
    },
    clickCloseBtton(e) {
      let self = this;
      self.setData({
        show: false
      });
      self.triggerEvent('ClickCloseBtton', {
        event: e,
        dataset: {}
      });
    },
    selectSpecs: function (e) {
      let self = this;
      let groupIndex = e.target.dataset.group_index;
      let group = self.data.tags[groupIndex];
      let itemIndex = e.target.dataset.item_index;
      let item = group.attrs[itemIndex];
      self.triggerEvent('SelectSpecs', {
        event: e,
        dataset: {
          index: groupIndex + '|' + itemIndex,
          groupIndex: groupIndex,
          itemIndex: itemIndex,
          specsGroup: group,
          specsChecked: item,
        }
      });
    },
    addCount: function (e) {
      let self = this;
      self.triggerEvent('AddCount', {
        event: e,
        dataset: {}
      });
    },
    cutCount: function (e) {
      let self = this;
      self.triggerEvent('CutCount', {
        event: e,
        dataset: {}
      });
    },
    addCart: function (e) {
      let self = this;
      console.log(e);
      self.triggerEvent('AddCart', {
        event: e,
        dataset: {
          count: self.data.goods.amount
        }
      });
    },
    buyNow: function (e) {
      let self = this;
      console.log(e);
      self.triggerEvent('BuyNow', {
        event: e,
        dataset: {
          count: self.data.goods.amount
        }
      });
    }
  }
});