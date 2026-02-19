# Karelia-AI.JS


# Preface:
- This branch is for Fluxer bots. Message Handling is done here with mostly discord.js/core. 

## Information: 
Beelzebul-AI.JS is an LLM-based Artificial Intelligence Discord Bot modeled as close as possible to an actual human for *ScIeNtIfIc pUrPoSes*. Uses Google Generative AI.

### Requirements
- latest version of node.js
- latest version of @discord.js/core
- Visual Studio Code (Optional)
### Installation
1. Installing Dependecies

   -`npm i` or `npm i @discord.js/core fs @google/generative-ai`
3. Setting up Variables
 - Make your own `.env` file with the variables:
  - bot_token
  - prefix
  - bot_id
  - g_ApiKey

### Note: an .env file must look like this;
```
prefix = prefix
g_ApiKey =  g_ApiKey
bot_token = bot_token
bot_ID = bot_ID
```

This is incredibly helpful for making your projects secure, especially when using hosting, or ***uploading your random shenanigans on github*** *(Yes, I'm staring at myself.)*

4. Setting up your Fluxer index file
There is a massive difference between discord.js and discord.js/core when it comes to message handling.

A normal discord bot would initiate the client like this:
```js
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});
```

While a Fluxer bot would initiate it like this:
```js
const rest = new REST({ api: "https://api.fluxer.app", version: "1" }).setToken(token);
const gateway = new WebSocketManager({
    token,
    intents: 0, // Fluxer ignores intents
    rest,
    version: "1",
});

const client = new Client({ rest, gateway });
```
Since Fluxer is still fairly new, Gateway intents are not yet a thing.

4. Setting up your prompts
> In the `examples` field, you may use as much prompts as you would like to make the bot reply in a more accurate, or convincing way.
```json
 "examples": [
  {
   "user" : "Hello there!",
   "bot" : "The missile knows where it is at all times. It knows this because it knows where it isn't. By subtracting where it is from where it isn't, or where it isn't from where it is (whichever is greater), it obtains a difference, or deviation. The guidance subsystem uses deviations to generate corrective commands to drive the missile from a position where it is to a position where it isn't, and arriving at a position where it wasn't, it now is. Consequently, the position where it is, is now the position that it wasn't, and it follows that the position that it was, is now the position that it isn't.
In the event that the position that it is in is not the position that it wasn't, the system has acquired a variation, the variation being the difference between where the missile is, and where it wasn't. If variation is considered to be a significant factor, it too may be corrected by the GEA. However, the missile must also know where it was.
The missile guidance computer scenario works as follows. Because a variation has modified some of the information the missile has obtained, it is not sure just where it is. However, it is sure where it isn't, within reason, and it knows where it was. It now subtracts where it should be from where it wasn't, or vice-versa, and by differentiating this from the algebraic sum of where it shouldn't be, and where it was, it is able to obtain the deviation and its variation, which is called error."
  },
  {
   "user": "are you auti-",
   "bot" : "lock tuah, AIM-9 on that thang!"
  }
]
```
### Initialization 
Running with an IDE is preferred. However, if you want to run from the Command Line, navigate to your target location with your copy of index.js with `cd <path>`, before running `node index.js`

# WARNING: DO NOT CREEP OUT YOUR FRIENDS WITH ~~THEIR REFLECTION~~ THIS 
