const fs = require("fs");
const axios = require('axios-https-proxy-fix');
const fileJson = JSON.parse(fs.readFileSync("./config/message_point.json").toString())
const token = JSON.parse(fs.readFileSync("./config/account_point.json").toString()).token
const length = fileJson.bot.length
const enableProxy = fileJson.proxy.enable
const proxyHost = fileJson.proxy.host
const proxyPort = fileJson.proxy.port


async function main() {
    let amountGM = fileJson.config.length
    console.log('point', amountGM)
    for (let index = 0; index < amountGM; index++) {

        let config_index = fileJson.config[index]
        let discordLink = config_index.discord_link
        let discordChannelID = config_index.channel_id
        let timeInterval = config_index.time_interval
        let point_message_list = config_index.point_message_list
        let accountToken = token
        let dc_name = config_index.dc_name
        chat(discordLink, discordChannelID, timeInterval, accountToken, dc_name,index,point_message_list)

        // 停止1-21秒
        let sleep_num = (Math.random() * 20 + 1) * 1000
        await sleep(sleep_num)
    }
}

async function chat(discordLink, discordChannelID, timeInterval, token, dc_name,no_discord,point_message_list) {
    let index = 0
    while (true) {
        for (message_index in point_message_list){
            try {
                let messageString = ""
              
                if (messageString === "") {
                    messageString = point_message_list[message_index]
                }
                message_data = {
                    "content": messageString,
                    "tts": "false",
                }
                index = (index + 1) % length
                await sendMessage(discordChannelID, message_data, token, discordLink, dc_name,no_discord)
            } catch (e) {
                console.log("出错了：" + e)
            }
             // 停止1-6秒
            let sleep_num = (Math.random() * 5 + 1) * 1000
            await sleep(sleep_num)
        }  
        let time1=timeInterval+Math.random() * 500
        console.log(time1/60/60+'小时后下一次')
        await sleep(time1* 1000)

    }
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
function get_time(){
    var time = new Date().toLocaleString( );
    console.log(time)
}
 

async function sendMessage(channel_id, message_data, token, discordLink, dc_name,no_discord) {
    try {
        let url = "https://discordapp.com/api/v6/channels/" + channel_id + "/messages"
        if (enableProxy) {
            console.log(enableProxy)
            console.log(proxyHost, proxyPort)
            await axios.post(url, message_data, {
                headers: {
                    "content-type": "application/json",
                    "authorization": token.toString()
                }
                , proxy: {
                    host: proxyHost,
                    port: proxyPort
                }
            }).then(value => {
                get_time()
                console.log(no_discord+ "发送成功：" + message_data.content + "  DC名称：" + dc_name)
            }).catch(err => {
                get_time()

                console.log(err.message + "  DC名称：" + dc_name+no_discord)
            })
            
        } else {
            await axios.post(url, message_data, {
                headers: {
                    "content-type": "application/json",
                    "authorization": token.toString()
                }
            }).then(value => {
                get_time()
                console.log("发送成功：" + message_data.content + "  DC名称：" + dc_name)
            }).catch(err => {
                get_time()
                console.log(err.message + "  DC名称：" + dc_name)
            })
        }

    } catch (e) {
        console.log(e)
    }
}


main()


