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
        buddy: null,
    },
    onLoad: function (options) {
        var that = this
        that.buddy = getApp().globalData.buddy
        console.log(that.buddy)
        that.buddy.sendMsg("hello", "")
    },
    onShow: function () {
        var that = this
        this.setData({
            inputMessage: ''
        })
    },
    bindMessage: function (e) {
        this.setData({
            userMessage: e.detail.value
        })
    },
    cleanInput: function () {
        var that = this
        var setUserMessage = {
            sendInfo: that.data.userMessage
        }
        that.setData(setUserMessage)
    },
    sendMessage: function () {

        if (!this.data.userMessage.trim()) return;


        var that = this
        // console.log(that.data.userMessage)
        // console.log(that.data.sendInfo)
        var myName = wx.getStorageSync('myUsername')
        // var id = WebIM.conn.getUniqueId();
        // var msg = new WebIM.message('txt', id);
        msg.set({
            msg: that.data.sendInfo,
            to: that.data.yourname,
            roomType: false,
            success: function (id, serverMsgId) {
                console.log('send text message success')
            }
        });
        // //console.log(msg)
        console.log("Sending textmessage")
        msg.body.chatType = 'singleChat';
        WebIM.conn.send(msg.body);
        if (msg) {
            var value = WebIM.parseEmoji(msg.value.replace(/\n/mg, ''))
            var time = WebIM.time()
            var msgData = {
                info: {
                    to: msg.body.to
                },
                username: that.data.myName,
                yourname: msg.body.to,
                msg: {
                    type: msg.type,
                    data: value
                },
                style: 'self',
                time: time,
                mid: msg.id
            }
            that.data.chatMsg.push(msgData)
            // console.log(that.data.chatMsg)

            wx.setStorage({
                key: that.data.yourname + myName,
                data: that.data.chatMsg,
                success: function () {
                    //console.log('success', that.data)
                    that.setData({
                        chatMsg: that.data.chatMsg,
                        emojiList: [],
                        inputMessage: ''
                    })
                    setTimeout(function () {
                        that.setData({
                            toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
                        })
                    }, 100)
                }
            })
            that.setData({
                userMessage: ''
            })
        }
    },

    // receiveMsg: function (msg, type) {
    //     var that = this
    //     var myName = wx.getStorageSync('myUsername')
    //     if (msg.from == that.data.yourname || msg.to == that.data.yourname) {
    //         if (type == 'txt') {
    //             var value = WebIM.parseEmoji(msg.data.replace(/\n/mg, ''))
    //         } else if (type == 'emoji') {
    //             var value = msg.data
    //         } else if(type == 'audio'){
    //             // 如果是音频则请求服务器转码
    //             console.log('Audio Audio msg: ', msg);
    //             var token = msg.accessToken;
    //             console.log('get token: ', token)
    //             var options = {
    //                 url: msg.url,
    //                 header: {
    //                     'X-Requested-With': 'XMLHttpRequest',
    //                     'Accept': 'audio/mp3',
    //                     'Authorization': 'Bearer ' + token
    //                 },
    //                 success: function(res){
    //                     console.log('downloadFile success Play', res);
    //                     // wx.playVoice({
    //                         // filePath: res.tempFilePath
    //                     // })
    //                     msg.url = res.tempFilePath
    //                     var msgData = {
    //                         info: {
    //                             from: msg.from,
    //                             to: msg.to
    //                         },
    //                         username: '',
    //                         yourname: msg.from,
    //                         msg: {
    //                             type: type,
    //                             data: value,
    //                             url: msg.url
    //                         },
    //                         style: '',
    //                         time: time,
    //                         mid: msg.type + msg.id
    //                     }

    //                     if (msg.from == that.data.yourname) {
    //                         msgData.style = ''
    //                         msgData.username = msg.from
    //                     } else {
    //                         msgData.style = 'self'
    //                         msgData.username = msg.to
    //                     }

    //                     var msgArr = that.data.chatMsg;
    //                     msgArr.pop();
    //                     msgArr.push(msgData);

    //                     that.setData({
    //                         chatMsg: that.data.chatMsg,
    //                     })
    //                     console.log("New audio");
    //                 },
    //                 fail: function(e){
    //                     console.log('downloadFile failed', e);
    //                 }
    //             };
    //             console.log('Download');
    //             wx.downloadFile(options);
    //         }
    //         //console.log(msg)
    //         //console.log(value)
    //         var time = WebIM.time()
    //         var msgData = {
    //             info: {
    //                 from: msg.from,
    //                 to: msg.to
    //             },
    //             username: '',
    //             yourname: msg.from,
    //             msg: {
    //                 type: type,
    //                 data: value,
    //                 url: msg.url
    //             },
    //             style: '',
    //             time: time,
    //             mid: msg.type + msg.id
    //         }
    //         console.log('Audio Audio msgData: ', msgData);
    //         if (msg.from == that.data.yourname) {
    //             msgData.style = ''
    //             msgData.username = msg.from
    //         } else {
    //             msgData.style = 'self'
    //             msgData.username = msg.to
    //         }
    //         //console.log(msgData, that.data.chatMsg, that.data)
    //         that.data.chatMsg.push(msgData)
    //         wx.setStorage({
    //             key: that.data.yourname + myName,
    //             data: that.data.chatMsg,
    //             success: function () {
    //                 if(type == 'audio')
    //                     return;
    //                 //console.log('success', that.data)
    //                 that.setData({
    //                     chatMsg: that.data.chatMsg,
    //                 })
    //                 setTimeout(function () {
    //                     that.setData({
    //                         toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
    //                     })
    //                 }, 100)
    //             }
    //         })
    //     }
    // },
    // testInterfaces: function(){
    //     var option = {
    //         roomId: '21873157013506',
    //         success: function(respData){
    //             wx.showToast({
    //                 title: "JoinChatRoomSuccess",
    //             });
    //             console.log('Response data: ', respData);
    //         }
    //     };

    //     WebIM.conn.joinChatRoom(option);
    // },
    // quitChatRoom: function(){
    //     console.log('ScareCrow');
    //     var option = {
    //         roomId: '21873157013506',
    //         success: function(){
    //             console.log("quitChatRoom");
    //         }
    //     }
    //     WebIM.conn.quitChatRoom(option);
    // },
})