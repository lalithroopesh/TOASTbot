const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity("with my code", {type: "PLAYING"});
  client.user.setStatus("online");
});

// events for when bot joins / leaves servers
client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  //client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  //client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

// helpful functions
function stagger(c, i, m0) {
    setTimeout(function(){ 
        m0.channel.send(c).then(msg => {
            msg.delete({timeout: 2000});
        });
    }, 100*i);
}

// main run
client.on("message", async message => {
    
    // ignore bots
  if(message.author.bot) return; 

  // irgnores not prefix
  if(message.content.indexOf(config.prefix) !== 0) return; 
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // commands
  switch(command) {

    // !ping
    case "ping":
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
        message.channel.send("hi");
        break;

    // !ask [question]
    case "ask":
        message.delete();
        var current = "**[Q]:** ";
        var i;
        const text = args.join(" ");
        for (i = 0; i < text.length; i += 20) {
            current += text.substring(i,i+20);
            stagger(current, i, message);
        }
        setTimeout(function(){ 
            message.channel.send(current);
            message.channel.send("*(End text)*");
        }, 100*i);
        //message.channel.send(text);
        message.reply("Initialized.");
        break;

    default:
        message.channel.send("Command not understood.");
  }
  
});

client.login(config.token);