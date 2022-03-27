const fs = require("fs");
const axios = require('axios-https-proxy-fix');
const qs = require("qs")
const fileJson = JSON.parse(fs.readFileSync("./discord_message.json").toString())
const token = JSON.parse(fs.readFileSync("./account.json").toString()).token
const length = fileJson.bot.length
const autoBot = fileJson.autoBot
const enableProxy = fileJson.proxy.enable
const proxyHost = fileJson.proxy.host
const proxyPort = fileJson.proxy.port


async function main() {
    let amountBot = fileJson.config.length
    console.log('amountBot', amountBot)
    for (let index = 0; index < amountBot; index++) {

        let config_index = fileJson.config[index]
        let discordLink = config_index.discord_link
        let discordChannelID = config_index.channel_id
        let timeInterval = config_index.time_interval
        let accountToken = token
        let dc_name = config_index.dc_name
        chat(discordLink, discordChannelID, timeInterval, accountToken, dc_name)

        // 停止1+15秒
        let sleep_num = (Math.random() * 14 + 1) * 1000
        console.log(sleep_num)
        await sleep(sleep_num)
        // await sleep(5000)
    }


}

async function chat(discordLink, discordChannelID, timeInterval, token, dc_name) {
    let index = 0
    while (true) {
        try {
            let messageString = ""
            if (autoBot) {
                messageString = await getRemoteMessage(discordChannelID, token)
            }
            if (messageString === "") {
                messageString = fileJson.bot[index].message.toString()
            }
            message_data = {
                "content": messageString,
                "tts": "false",
            }
            index = (index + 1) % length
            await sendMessage(discordChannelID, message_data, token, discordLink, dc_name)
            await sleep(timeInterval * 1000)
        } catch (e) {
            console.log("出错了：" + e)
            await sleep(timeInterval * 1000)
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

async function sendMessage(channel_id, message_data, token, discordLink, dc_name) {
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
                console.log("发送成功：" + message_data.content + "  DC名称：" + dc_name)
            }).catch(err => {
                console.log(err.message + "  DC名称：" + dc_name)
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

async function getRemoteMessage(channelID, token) {

    try {

        let url = "https://discordapp.com/api/v6/channels/" + channelID + "/messages?limit=100"
        if (enableProxy) {
            return await axios.get(url, {
                headers: {
                    "content-type": "application/json",
                    "authorization": token.toString(),
                }
                //这个是代理
                , proxy: {
                    host: proxyHost,
                    port: proxyPort
                }
                //代理结束
            }).then(value => {
                return generateMessage(value)
            }).catch(err => {
                console.log(err.message)
                return ""
            })
        } else {
            return await axios.get(url, {
                headers: {
                    "content-type": "application/json",
                    "authorization": token.toString(),
                }
            }).then(value => {
                return generateMessage(value)
            }).catch(err => {
                console.log(err.message)
                return ""
            })
        }

    } catch (e) {
        console.log(e)
        return ""
    }
}

/**
 * 随机挑选一条消息
 * @param value
 * @returns {string|*}
 */
function generateMessage(value) {
    let result_list = []
    let data = value.data
    if (data === "") {
        return ""
    } else {
        let length = value.data.length
        for (let index = 0; index < length; index++) {
            let content = value.data[index].content
            if (content != ""
                && content.indexOf("<") === -1
                && content.indexOf("@") === -1
                && content.indexOf("http") === -1
                && content.indexOf("?") === -1) {
                result_list.push(content)
            }
        }
        let randormNumber = Math.ceil(Math.random() * result_list.length)
        if (randormNumber >= result_list.length) {
            randormNumber = 0;
        }
        return result_list[randormNumber]
    }
}

main()

