//index.js
//获取应用实例
var app = getApp()
var DSA = require('../../lib/otr/lib/dsa.js')

Page({
  data: {
    motto: '正在创建房间...',
    progress: '0',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    buddyInfo: {},
    shareable: '/pages/index/index',
    myKey: null
  },
  buddy: null,
  onShareAppMessage: function () {
    return {
      title: '近默',
      desc: '邀请您加入一对一密聊，点击打开近默小程序',
      path: this.shareable
    }
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  updateProgress: function (num) {
    var that = this
    that.setData({
      progress: num
    })
    switch (num) {
      case 10: that.setData({
        motto: '正在创建房间...'
      })
        break
      case 20: that.setData({
        motto: '正在连接服务器...'
      })
        break
      case 30: that.setData({
        motto: '正在创建秘钥...'
      })
        break
      case 50: that.setData({
        motto: '正在等待对方加入...'
      })
        break
      case 100: that.setData({
        motto: '会话已建立'
      })
        wx.navigateTo({
          url: '../chatroom/chatroom'
        })
        break
    }
  },

  initAKE: function (options) {
    var that = this
    console.log('Generating DSA...')
    that.myKey = new DSA()
    console.log('Generating DSA done')
    console.log('DSA generated, fingerprint: ' + that.myKey.fingerprint())

    var OTR = require('../../lib/otr/lib/otr.js')
    var buddy = new OTR(options)
    this.buddy = buddy

    buddy.REQUIRE_ENCRYPTION = true

    buddy.on('ui', function (msg, encrypted, meta) {
      console.log("message to display to the user: " + msg)
      // encrypted === true, if the received msg was encrypted
      console.log("(optional) with receiveMsg attached meta data: " + meta)
    })

    buddy.on('io', function (msg, meta) {
      console.log("message to send to buddy: " + msg)
      console.log("(optional) with sendMsg attached meta data: " + meta)
      wx.sendSocketMessage({
        data: JSON.stringify({ "from": that.data.userInfo.nickName, "msg": msg }),
        fail: function () {
          console.error("message fail")
        },
      })
    })

    buddy.on('error', function (err, severity) {
      if (severity === 'error')  // either 'error' or 'warn'
        console.error("error occurred: " + err)
    })

    buddy.on('status', function (state) {
      switch (state) {
        case OTR.CONST.STATUS_AKE_SUCCESS:
          // sucessfully ake'd with buddy
          // check if buddy.msgstate === OTR.CONST.MSGSTATE_ENCRYPTED

          that.updateProgress(100)
          app.buddies[that.data.buddyInfo.nickName] = buddy
          break
        case OTR.CONST.STATUS_END_OTR:
          // if buddy.msgstate === OTR.CONST.MSGSTATE_FINISHED
          // inform the user that his correspondent has closed his end
          // of the private connection and the user should do the same
          break
      }
    })
    // var newmsg = "Message to userA."
    // var meta = "optional some meta data, like message id"
    // buddy.sendMsg(newmsg, meta)
    // that.updateProgress(80)
  },

  receiveMsg: function (rcvmsg) {
    var that = this
    that.buddy.receiveMsg(rcvmsg)
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  onReady: function () {
    var that = this
    // provide options

    wx.connectSocket({
      url: 'wss://wechat.iku.im/ws'
      // url: 'ws://localhost:8080/ws'
    })

    wx.onSocketOpen(function (res) {
      that.updateProgress(30)

      console.log('WebSocket connected')
      var options = {
        fragment_size: 140,
        send_interval: 200,
        priv: that.myKey
      }
      that.initAKE(options)
      that.updateProgress(50)
    })

    wx.onSocketMessage(function (res) {
      var events = res.data.split('\n');
      events.forEach(
        function (e) {
          try {
            var data = JSON.parse(e)
            if (data.from != that.data.userInfo.nickName) {
              that.setData({ buddyInfo: { nickName: data.from } })
              that.receiveMsg(data.msg)
            }
          } catch (exception) {
            console.error(res.data)
          }
        }
      )

    })

    wx.onSocketError(function (res) {
      console.error('WebSocket failed to connect ')
      wx.closeSocket()
    })
  }
})