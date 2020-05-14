// components/modal/CascadeSelection.js
/**
 * [组件] 级联选择
 */

/**
 * 
 * 使用方法：
 * 
 * 首先，在对应页面的.json文件的usingComponents属性中加入子属性"CascadeSelection": "/components/modal/CascadeSelection"
 * 然后，在对应页面的.wxml文件中按如下方式使用：
 *     格式：<CascadeSelection show="真值" titleText="弹窗标题" chosedList="['已经选择的列表']" hotedTitle="热门标题" hotedList="[{name:'热门列表'}]" list="[{name:'列表'}]" bindClickMask="点击蒙层" bindClickCloseBtton="点击关闭按钮" bindClickHotedItem="选择热门条目" bindClickItem="选择条目"/>
 *     例子：<CascadeSelection show="{{CascadeSelectionShow}}" titleText="选择城市" chosedList="{{['北京市','北京市','朝阳区','请选择']}}" hotedTitle="热门城市" hotedList="{{[{id:'001',name:'北京'},{id:'002',name:'上海'},{id:'003',name:'广州'},{id:'004',name:'深圳'},{id:'005',name:'杭州'},{id:'006',name:'南京'},{id:'007',name:'苏州'},{id:'008',name:'天津'}]}}" list="{{[{id:'001',name:'北京'},{id:'002',name:'上海'},{id:'003',name:'天津'},{id:'004',name:'重庆'},{id:'005',name:'河北省'},{id:'006',name:'山西省'}]}}" bindClickMask="cMask" bindClickCloseBtton="cClose" bindClickHotedItem="cHotItem" bindClickItem="cItem" />
 
属性说明：
 show ：             Boolean          控制弹窗显示与隐藏。默认：false
 titleText :         String           弹窗的标题。默认：级联选择
 chosedList ：       Array<String>    已经选择的城市列表。默认：['请选择']
 hotedTitle ：       String           热门城市面板标题。默认：热门标题
 hotedList ：        Array<Object>    热门城市列表，每个元素中必须有name属性。默认：[]
 list ：             Array<Object>    城市列表，每个元素中必须有name属性。默认：[]

事件说明：
 bindClickMask :         点击遮盖层的回调函数。
 bindClickCloseBtton :   点击弹窗关闭按钮的回调函数。
 bindClickHotedItem :    点击热门城市的回调函数。通过e.detail获取选中对象。
 bindClickItem ：        点击城市的回调函数。通过e.detail获取选中对象。
 

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
    titleText: {
      type: String,
      value: '级联选择'
    },
    chosedList: {
      type: Array,
      value: ['请选择']
    },
    hotedTitle: {
      type: String,
      value: '热门标题'
    },
    hotedList: {
      type: Array,
      value: []
    },
    list: {
      type: Array,
      value: []
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    SystemInfo: app.SystemInfo,
    statusBarHeight: app.globalData.statusBarHeight,
    maskShow: false,
    windowShow: false
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
    clickHotedItem: function (e) {
      let self = this;
      let index = e.target.dataset.index;
      let item = self.data.hotedList[index];
      self.triggerEvent('ClickHotedItem', {
        event: e,
        dataset: {
          index: index,
          bean: item
        }
      });
    },
    clickItem: function (e) {
      let self = this;
      let index = e.target.dataset.index;
      let item = self.data.list[index];
      self.triggerEvent('ClickItem', {
        event: e,
        dataset: {
          index: index,
          bean: item
        }
      });
    }
  }
});