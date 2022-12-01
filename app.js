const express = require('express')
const { Telegraf, session, Scenes } = require('telegraf')
const fs = require('fs')
const path = require('path')
const svg2img = require('svg2img')
const svgCaptcha = require('svg-captcha')
const mongoose = require('mongoose')

const user = require('./schema/userSchema')



// express init
const app = express()

// telegraf init 5488413860:AAFbGwuOncngkJO24IJNpuKD3eq4VzyjiHE
const bot = new Telegraf('5601540755:AAGHIr4Kb9tpPFCas_OX-A6a_aSInIDopfM')


// mongoose connect
mongoose.connect("mongodb+srv://rasedul20:rasedul20@telegrambot.9mrl3p4.mongodb.net/escrowbot?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Database connected"))
.catch(e => console.log(e))

// session init
bot
.use(session())

// a variable
const chooseOption = `<b>Choose a option</b> \n
1. <b><u>I am an online vendor</u></b>, ready to sell my products/services on Web3 while my profits appreciate!

>>I will bring my clientele with me to build this community!

2. <b><u>I am an online shopper</u></b>, ready to browse and buy my favorite products/services on Web3, while my money appreciates in my wallet!

>>I will bring my favorite vendors with me to build this community!

3. <b><u>I am an artist/musician</u></b>, ready to sell my artworks on Web3 while my profits and royalties appreciate!

>>I will bring my audience with me to build this community!

4. <b><u>I am a crypto/NFT enthusiast</u></b>, ready to collect and trade while my profits appreciate!

>>I will help build this community!
`

const groupRules = `Rules of Zwap Meet: \n

No Spamming! Only 5 ads per day!\n

No Disrespect! Those in violation will be silenced for a day.\n

Buyers are required to do due diligence when buying from sellers!\n

Neither the Zwap Meet, Zwap Shop Channel, Zulu Lab, BW3 NFT Channel, Bazaar Web3 NFT project team, nor Mods/Admins are responsible nor liable for any product or service bought on Zwap Meet or Zwap Shop Channel, being illegal, unethical, or inappropriate.\n

We are not responsible for what our members sell nor buy.\n

Use the BW3Escrow bot for all purchases to avoid any rippers or scammers!\n

Type "/start" to get familiar with the Zwap Shop and start selling and shopping!\n

Please respect all members like family!
`



// start command
bot.start(ctx => {
    ctx.reply("This is made for private group")
})
    .catch(e => console.log(e))


// new userscene
const newUserScene = new Scenes.WizardScene('newUserScene',

    async ctx => {

        try {

            ctx.session.newUser = {}

            ctx.session.newUser.userId = ctx.from.id

            const cap = svgCaptcha.create()

            const svg = cap.data
            const captchaValue = cap.text

            ctx.session.newUser.type_captcha = ctx.update.message.text

            svg2img(svg, (e, b) => {
                fs.writeFileSync(ctx.from.id + ".png", b)
                ctx.session.newUser.gen_captcha = captchaValue
                ctx.telegram.sendPhoto(ctx.chat.id, { source: fs.readFileSync(ctx.from.id + '.png') }, {
                    caption: `Prove you are not robot`
                })
                .catch(e => {
                    console.log(e)
                    ctx.reply("Something is wrong")
                    return ctx.scene.leave()
                })
            })

            return ctx.wizard.next()
            
        } catch (e) {
            console.log(e)
            ctx.reply("Something is wrong")
            return ctx.scene.leave()
        }

    },
    async ctx => {

        try {

            if (ctx.session.newUser.userId == ctx.from.id) {

                ctx.session.newUser.type_captcha = ctx.update.message.text
    
                const type = ctx.session.newUser.type_captcha
                const gen = ctx.session.newUser.gen_captcha
    
                if (type == gen) {

                    fs.rmSync(ctx.chat.id + ".png", { force: true })
    
                    ctx.telegram.sendMessage(ctx.chat.id, chooseOption, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "1", callback_data: '1' }, { text: "2", callback_data: '2' }, { text: "3", callback_data: '3' }, { text: "4", callback_data: '4' }]
                            ]
                        },
                        parse_mode: "HTML"
                    })
                    .catch(e =>{
                        console.log(e)
                        ctx.reply("Something is wrong")
                        return ctx.scene.leave()
                    })
    
                    return ctx.wizard.next()
    
                } else {
                    //image delete
                    fs.rmSync(ctx.chat.id + ".png", { force: true })
                    return ctx.scene.reenter()
    
                }
            }
            
        } catch (e) {
            console.log(e)
            ctx.reply("Something is wrong")
            return ctx.scene.leave()
        }

    },
    async ctx=>{
        try {

            ctx.deleteMessage()
            
            ctx.session.user_clicked_option = ctx.update.callback_query.data

            if(ctx.session.newUser.userId == ctx.from.id){
                ctx.telegram.sendMessage(ctx.chat.id , groupRules , {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: "I am agree", callback_data: "tos_agree"}]
                        ]
                    }
                })
                .catch((e)=>{
                    console.log(e)
                    ctx.reply("Something is wrong")
                    return ctx.scene.leave()
                })

                return ctx.wizard.next()
            }

        } catch (e) {
            console.log(e)
            ctx.reply("Something is wrong")
            return ctx.scene.leave()
        }
    },
    async ctx => {

        try {

            ctx.deleteMessage()
           
            if (ctx.session.newUser.userId == ctx.from.id) {
    
                ctx.telegram.sendMessage(ctx.chat.id, `Please join the channel \n\nhttps://t.me/BazaarWeb3NFTChannel`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "I HAVE JOINED THE BAZAAR WEB3 CHANNEL", callback_data: "joined" }]
                        ]
                    }
                })
                .catch(e => {
                    console.log(e)
                    ctx.reply("Something is wrong")
                    return ctx.scene.leave()
                })
    
                return ctx.wizard.next()
            }

        } catch (e) {
            console.log(e)
            ctx.reply("Something is wrong")
            return ctx.scene.leave()
        }

    },
    async ctx => {

        try {

            ctx.deleteMessage()
            
            if (ctx.session.newUser.userId == ctx.from.id) {

                const findUser = await user.find({userId : ctx.from.id })
                if (findUser.length > 0) {
    
                    ctx.reply("Welcome back in our group")
                    return ctx.scene.leave()
    
                } else {
                    const userInfo = new user({
                        userId: ctx.from.id,
                        name: ctx.from.first_name + " " + ctx.from.last_name || ' ',
                        userName: ctx.from.username,
                        user_clicked_option: ctx.session.user_clicked_option
                    })
    
                    const storeUserData = await userInfo.save()
                    if (storeUserData) {
                        ctx.reply("Thanks for joining our group")
                        return ctx.scene.leave()
                    }
                }
                
            }

        } catch (e) {
            console.log(e)
            ctx.reply("Something is wrong")
            return ctx.scene.leave()
        }


    }

)



// scene stage 
const stage = new Scenes.Stage([newUserScene])

// create stage middlewere
bot.use(stage.middleware())


// new user join command
bot.on('new_chat_members', async ctx => {
    try {
        ctx.scene.enter('newUserScene')
    } catch (e) {
        console.log(e)
    }
})
.catch(e => console.log(e))


// test command
bot.command('stest',ctx=>{
    try {
        ctx.scene.enter('newUserScene')
    } catch (e) {
        console.log(e)
    }
})
.catch(e => console.log(e))



// wehhook implement


app.use(bot.webhookCallback('/'))


app.get('/', (req, res) => {
    res.json({ "Status": "The site is running" })
})



const PORT = process.env.PORT || 4888

app.listen(PORT, () => {
    console.log("The site is running")
})
