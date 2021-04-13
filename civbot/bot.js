const fs = require('fs')
const Discord = require('discord.js');
const client = new Discord.Client();
//const pino = require('pino')

const config = require('./config/config');
const prefix = global.DEVFLAG ? config.dev_prefix : config.prod_prefix;

//const PinoHttp = require('express-pino-logger');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./discord_commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./discord_commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

let cooldowns = new Discord.Collection();

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const splitArgs = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = splitArgs.shift().toLowerCase();
    let args = parseArgs(splitArgs);

    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;    

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }
    
    if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

        return message.channel.send(reply);    
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    } else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
        
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});


function parseArgs (args) {
    if(args.length == 0 || !Array.isArray(args)) {
        return null;
    }
    let regexString = args.join(" ");
    
    //Regex groups things inside ""
    let result = regexString.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
    result.forEach(function(part, index) {
        result[index] = result[index].replace(/"/g,'');
    });

    return result;
}

// login to Discord with your app's token
if(global.DEVFLAG) {
    client.login(process.env.DEV_TOKEN)
} else {
    client.login(process.env.TOKEN);
}

module.exports = client;