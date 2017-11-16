var app = getApp()

Page({
    data: {
        chatMsg: [],
        yourname: '',
        myName: '',
        sendInfo: '',
        userMessage: '',
        inputMessage: '',
        indicatorDots: true,
        interval: 5000,
        duration: 1000,
        view: 'scroll_view',
        toView: '',
        msgView: {},
    },
    buddy: null,
    onLoad: function (options) {
      var that = this
      that.buddy = app.currentBuddy
    },
    onReady:  function () {
      var that = this
      that.buddy.on('ui', function (msg, encrypted, meta) {
        console.log("message to display to the user: " + msg)
        // encrypted === true, if the received msg was encrypted
        console.log("(optional) with receiveMsg attached meta data: " + meta)
        that.receiveMsg(msg)
      })
    },
    onShow: function () {
      var that = this
      that.setData({
          inputMessage: ''
      })
    },
    bindMessage: function (e) {
      var that = this
      that.setData({
        userMessage: e.detail.value
      })
    },
    cleanInput: function () {
      var that = this
      that.setData({
        sendInfo: that.data.userMessage
      })
    },
    sendMessage: function () {
      var that = this
      if (!that.data.userMessage.trim()) return
      that.buddy.sendMsg(that.data.userMessage, null)

      var msgData = {
        // info: {
        //   from: 'msg.from',
        //   to: 'msg.to'
        // },
        username: '',
        yourname: 'msg.from',
        msg: {
          type: 'here',
          data: that.data.userMessage,
          url: 'msg.url'
        },
        style: 'txt',
        // time: new Date().getTime(),
        mid: 'msgid-'+that.data.chatMsg.length+1
      }
      that.data.chatMsg.push(msgData)
      that.setData({
        chatMsg: that.data.chatMsg,
        toView: msgData.mid
      })
    },

    receiveMsg: function (msg) {
        var that = this
        
        // var myName = wx.getStorageSync('myUsername')
        // if (msg.from == that.data.yourname || msg.to == that.data.yourname) {
            var msgData = {
              // info: {
              //   from: 'msg.from',
              //   to: 'msg.to'
              // },
              username: '',
              yourname: 'msg.from',
              msg: {
                type: 'there',
                data: msg,
                // url: 'msg.url'
              },
              style: 'txt',
              // time: new Date().getTime(),
              mid: 'msgid-' + that.data.chatMsg.length + 1
            }
            that.data.chatMsg.push(msgData)
        // }
        this.setData({
          chatMsg: that.data.chatMsg,
          toView: msgData.mid
        })
    },
    
    quitChatRoom: function(){
        console.log('ScareCrow');
        var option = {
            roomId: '21873157013506',
            success: function(){
                console.log("quitChatRoom");
            }
        }
        WebIM.conn.quitChatRoom(option);
    },
})