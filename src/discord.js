const {MessageEmbed, WebhookClient} = require("discord.js")
const MAX_MESSAGE_LENGTH = 40

module.exports.send = (id, token, repo, branch, url, commits, size, in_thread) =>
    new Promise((resolve, reject) => {
        let client
        console.log('Preparing Webhook...')
        try {
            if (repo === []) {
                return 
            }
            console.log(in_thread)
            if (in_thread) {
                if (isNaN(in_thread)) {
                    throw new Error('in_thread is not a number')
                }
                console.log('Found thread ID')               
                client = new WebhookClient({
                    id: id,
                    token: token,
                    threadId: in_thread
                })
            } else {
                client = new WebhookClient({
                    id: id,
                    token: token
                })
            }      
        } catch (error) {
            console.log('Error creating Webhook')
            reject(error.message)
            return
        }

        client.send({embeds: [createEmbed(repo, branch, url, commits, size)]}).then(() => {
            console.log('Successfully sent the message!')
            resolve()
        }, reject)
    })

function createEmbed(repo, branch, url, commits, size) {
    console.log('Constructing Embed...')
    const latest = commits[0]
    return new MessageEmbed()
        .setColor(0x00bb22)
        .setAuthor({
            name: `${size} ${size === 1 ? 'commit was ' : 'commits were'} added to ${branch}`,
            iconURL: `https://github.com/${latest.author.username}.png?size=32`,
        })
        .setDescription(`${getChangeLog(commits, size)}`)
        .setTimestamp(Date.parse(latest.timestamp))
        .setFooter({
            text: `⚡ Edited by @${latest.author.username}`,
        })
}


function getChangeLog(commits, size) {
    let changelog = ''
    for (const i in commits) {
        if (i > 7) {
            changelog += `+ ${size - i} more...\n`
            break
        }

        const commit = commits[i]
        const sha = commit.id.substring(0, 6)
        const message =
            commit.message.length > MAX_MESSAGE_LENGTH
                ? commit.message.substring(0, MAX_MESSAGE_LENGTH) + '...'
                : commit.message
        changelog += `[\`${sha}\`](${commit.url}) — ${message}\n`
    }

    return changelog
}
