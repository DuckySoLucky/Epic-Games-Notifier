const config = require('./config.json');
const { getGames } = require('epic-free-games');
const { MessageEmbed, Client, Intents } = require('discord.js');
const moment = require('moment')
const fs = require('fs')

const client = new Client({intents: new Intents(32767)})

client.once('ready', () => {
    console.log('Client ready, logged in as ' + client.user.tag);
    checkGames(client);
})

function checkGames(client) {
    setInterval(() => {
        getGames("US", true).then(res => {
            for (let i = 0; i < res.currentGames.length; i++) {
                fs.readFile(`data/${res.currentGames[i].title}.txt`, (err) => {
                    if (err) {

                        offerEmbed = new MessageEmbed()
                            .setColor(config.embeds.gameColor)
                            .setTitle(res.currentGames[i].title)
                            .setURL(`https://store.epicgames.com/p/${res.currentGames[i].catalogNs.mappings[0].pageSlug}`)
                            .setDescription(res.currentGames[i].description + `\n \n**Expiry Date**\n<t:${Math.floor(new Date(moment(res.currentGames[i].promotions.promotionalOffers[0].promotionalOffers[0].endDate).utc().format('MM/DD/YYYY')).getTime() / 1000)}:D> \n \n**Release Date**\n <t:${Math.floor(new Date(moment(res.currentGames[i].effectiveDate).utc().format('MM/DD/YYYY')).getTime() / 1000)}:D>\n \n**Provided By**\n` + res.currentGames[i].seller.name)            
                            .setImage(res.currentGames[i].keyImages[2].url)
                            .setFooter({ text: '© Made by DuckySoLucky', iconURL: 'https://cdn.discordapp.com/avatars/486155512568741900/31cabcf3c42823f8d8266fd22babb862.png?size=4096' });

                        client.channels.cache.get(config.discord.channel).send({embeds: [ offerEmbed ]})
                        console.log('Found New Game: ' + res.currentGames[i].title)

                        fs.writeFile(`data/${res.currentGames[i].title}.txt`, `${res.currentGames[i].title}`, (err) => {
                            if (err) {
                                const errorEmbed = new MessageEmbed()
                                    .setColor(config.embeds.errorColor)
                                    .setAuthor({ name: 'An Error has occured!'})
                                    .setDescription(`${err}`)
                                    .setFooter({ text: '© Made by DuckySoLucky', iconURL: 'https://cdn.discordapp.com/avatars/486155512568741900/31cabcf3c42823f8d8266fd22babb862.png?size=4096' });
                                client.channels.cache.get(config.discord.channel).send({embeds: [ errorEmbed ]})
                                return;
                            }
                        });
                    }
                });
        }}).catch(err => {
            console.log(err)
            const errorEmbed = new MessageEmbed()
                .setColor(config.embeds.errorColor)
                .setAuthor({ name: 'An Error has occured!'})
                .setDescription(`${err}`)
                .setFooter({ text: '© Made by DuckySoLucky', iconURL: 'https://cdn.discordapp.com/avatars/486155512568741900/31cabcf3c42823f8d8266fd22babb862.png?size=4096' });
            client.channels.cache.get(config.discord.channel).send({embeds: [ errorEmbed ]})
        });
    }, (config.discord.channel*1000));
}

client.login(config.discord.token)
