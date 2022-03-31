const fs = require("fs");
const axios = require('axios-https-proxy-fix');
const fileJson = JSON.parse(fs.readFileSync("./config/message_gm.json").toString())
const token = JSON.parse(fs.readFileSync("./config/account.json").toString()).token
const length = fileJson.bot.length
const enableProxy = fileJson.proxy.enable
const proxyHost = fileJson.proxy.host
const proxyPort = fileJson.proxy.port


async function main() {
    let amountGM = fileJson.config.length
    console.log('amountGM', amountGM)
    for (let index = 0; index < amountGM; index++) {

        let config_index = fileJson.config[index]
        let discordLink = config_index.discord_link
        let discordChannelID = config_index.channel_id
        let timeInterval = config_index.time_interval
        let accountToken = token
        let dc_name = config_index.dc_name
        chat(discordLink, discordChannelID, timeInterval, accountToken, dc_name,index)

        // 停止1-15秒
        let sleep_num = (Math.random() * 14 + 1) * 1000
        console.log(sleep_num)
        await sleep(sleep_num)
    }
}

async function chat(discordLink, discordChannelID, timeInterval, token, dc_name,no_discord) {
    let index = 0
    while (true) {
        try {
            let messageString = ""
          
            if (messageString === "") {
                messageString = fileJson.bot[index].message.toString()
            }
            message_data = {
                "content": messageString,
                "tts": "false",
            }
            index = (index + 1) % length
            await sendMessage(discordChannelID, message_data, token, discordLink, dc_name,no_discord)
            await sleep((timeInterval-Math.random() * 1000) * 1000)
        } catch (e) {
            console.log("出错了：" + e)
            await sleep((timeInterval-Math.random() * 1000) * 1000)
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
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
                console.log(no_discord+ "发送成功：" + message_data.content + "  DC名称：" + dc_name)
            }).catch(err => {
                console.log(err.message + "  DC名称：" + dc_name+no_discord)
            })
            console.log(22)


        } else {
            await axios.post(url, message_data, {
                headers: {
                    "content-type": "application/json",
                    "authorization": token.toString()
                }
            }).then(value => {
                console.log("发送成功：" + message_data.content + "  DC名称：" + dc_name)
            }).catch(err => {
                console.log(err.message + "  DC名称：" + dc_name)
            })
        }

    } catch (e) {
        console.log(e)
    }
}


main()

