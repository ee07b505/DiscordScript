const fs = require("fs");
const axios = require('axios-https-proxy-fix');
const fileJson = JSON.parse(fs.readFileSync("./config/message_gm.json").toString())
const token = JSON.parse(fs.readFileSync("./config/account.json").toString()).token
const tokens = fs.readFileSync("./config/account.txt").toString().split("\n").filter(Boolean)
const proxys = fs.readFileSync("./config/proxy.txt").toString().split("\n").filter(Boolean)
const length = fileJson.bot.length
const enableProxy = fileJson.proxy.enable
if (!fs.existsSync('./log')) {
    fs.mkdirSync('./log');
} 


function getRandomProxy() { 
    let randomindex = Math.floor(Math.random() * proxys.length)
    const proxy = proxys.splice(proxys.indexOf(randomindex), 1)[0];
    let proxyHost = proxy.split(":")[0]
    let proxyPort = proxy.split(":")[1]
    let proxyUser = proxy.split(":")[2]
    let proxyPass = proxy.split(":")[3]
    return {
        proxyHost: proxyHost,
        proxyPort: proxyPort,
        proxyUser: proxyUser,
        proxyPass: proxyPass
    }
  


 }


 function getProxy(accountNum) { 
    const index=accountNum%proxys.length
    const proxy = proxys[index]
    let proxyHost = proxy.split(":")[0]
    let proxyPort = proxy.split(":")[1]
    let proxyUser = proxy.split(":")[2]
    let proxyPass = proxy.split(":")[3]
    return {
        proxyHost: proxyHost,
        proxyPort: proxyPort,
        proxyUser: proxyUser,
        proxyPass: proxyPass
    }
  


 }


 async function main() {
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        discord_gm_task(token.trim(),index)
        // 停止10-30秒
        let sleep_num = (Math.random() * 20 + 10) * 1000
        console.log(sleep_num)
        await sleep(sleep_num)
    }
 }


 async function discord_gm_task(token,accountNum) {
    let amountGM = fileJson.config.length
    console.log('amount of goodmorning tasks', amountGM)
    let accountToken = token

    for (let index = 0; index < amountGM; index++) {

        let config_index = fileJson.config[index]
        let discordChannelID = config_index.channel_id
        let timeInterval = config_index.time_interval
        let dc_name = config_index.dc_name
        chat(accountNum, discordChannelID, timeInterval, accountToken, dc_name,index)

        // 停止1-5秒
        let sleep_num = (Math.random() * 4 + 1) * 1000
        console.log(sleep_num)
        await sleep(sleep_num)
    }
}




// async function main() {
//     let amountGM = fileJson.config.length
//     console.log('amount of goodmorning tasks', amountGM)
//     let accountToken = token

//     for (let index = 0; index < amountGM; index++) {

//         let config_index = fileJson.config[index]
//         let discordLink = config_index.discord_link
//         let discordChannelID = config_index.channel_id
//         let timeInterval = config_index.time_interval
//         let dc_name = config_index.dc_name
//         chat(discordLink, discordChannelID, timeInterval, accountToken, dc_name,index)

//         // 停止1-21秒
//         let sleep_num = (Math.random() * 20 + 1) * 1000
//         console.log(sleep_num)
//         await sleep(sleep_num)
//     }
// }

async function chat(accountNum, discordChannelID, timeInterval, token, dc_name,no_discord) {
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
            await sendMessage(discordChannelID, message_data, token, accountNum, dc_name,no_discord)
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

async function sendMessage(channel_id, message_data, token, accountNum, dc_name,no_discord) {
    try {
        let url = "https://discordapp.com/api/v6/channels/" + channel_id + "/messages"
        if (enableProxy) {
            console.log(enableProxy)
            //let proxy = getRandomProxy()
            let proxy = getProxy(index)
            await axios.post(url, message_data, {
                headers: {
                    "content-type": "application/json",
                    "authorization": token.toString()
                }
                , proxy: {
                    host: proxy.proxyHost,
                    port: proxy.proxyPort,
                    auth: {
                        username: proxy.proxyUser,
                        password: proxy.proxyPass
                },
                protocol: 'https'
                }
            }).then(value => {
                console.log(no_discord+ "发送成功：" + message_data.content + "  DC名称：" + dc_name+ "  \n代理IP：" +proxy.proxyHost+":"+proxy.proxyPort )

            }).catch(err => {
                console.log(err.message + "  DC名称：" + dc_name+no_discord+ "  \n代理IP：" +proxy.proxyHost+":"+proxy.proxyPort)
                fs.appendFileSync('./log/error.log', "  DC：\n" + token+ "\n  代理IP：" +proxy.proxyHost+":"+proxy.proxyPort+ "  DC名称：" + dc_name+no_discord+ err.message  +"\n"  , 'utf8');

            })



        } else {
            await axios.post(url, message_data, {
                headers: {
                    "content-type": "application/json",
                    "authorization": token.toString()
                }
            }).then(value => {
                console.log("发送成功：" + message_data.content + "  DC名称：" + dc_name)
                return;
            }).catch(err => {
                console.log(err.message + "  DC名称：" + dc_name)
            })
        

    } 

    }catch (e) {
        console.log(e)
    }


}

main()

