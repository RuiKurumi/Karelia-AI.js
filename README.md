# 🧠 Karelia-AI.JS


<p align="center"> <img src="https://img.shields.io/badge/Node.js-18%2B-3C873A?logo=node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Discord.js-v14-5865F2?logo=discord&logoColor=white"/> <img src="https://img.shields.io/badge/LLM-Groq-F55036?logo=groq&logoColor=white"/> <img src="https://img.shields.io/badge/Status-Suspiciously%20Human-red"/> <img src="https://img.shields.io/badge/License-MIT-lightgrey"/> </p> <p align="center"> <b>Karelia-AI.JS</b> is an LLM-based Discord bot modeled as close as possible to an actual human for <i>ScIeNtIfIc pUrPoSes</i>. <br/> Powered by Groq. Absolutely nothing unusual going on here. </p>

----
# 🌌 Overview

**Karelia-AI.JS** is a Discord AI chatbot designed to simulate human-like interaction using LLMs, prompt examples, and optional web search augmentation.

**It is:**

- **First and Foremost:** **Not** alive(!!!!)
- **Not** self-aware
- **Debatably convincing enough to be a problem**

----
# ✨ Features

### 🤖 Personality Engine
Karelia's responses are shaped by a `personality.json` file containing a system prompt and a list of few-shot `examples` — user/bot pairs that train the model to reply in a specific voice. The more examples you provide, the more consistent and convincing the persona becomes.

### 💬 Contextual AI Chat
Powered by Groq (`llama-3.3-70b-versatile`), Karelia reads recent message history to maintain conversational context. She responds when mentioned or replied to — not on every message, so she doesn't make it weird. Probably.

### 🔍 Web Search Augmentation (SERPER)
When configured with a `SERPER_API_KEY`, Karelia can perform real-time web searches to ground her responses in current information. The search layer is optional — the bot works fine without it.

### 🖼️ Image Analysis
Karelia can analyze images sent in chat using Google Generative AI's vision capabilities. Send her an image and she'll describe, comment on, or react to it in-character.

### ♟️ Chess System
Karelia supports full in-Discord chess matches powered by `chess.js` and Stockfish.

- Challenge her with a slash command and play moves via standard notation
- The board is rendered as an image using FEN strings, sent directly in chat after every move
- Stockfish runs in a separate worker thread (`stockfishWorker.js`) so it doesn't block the main bot process
- **Game-over states trigger special behavior** — Karelia taunts the loser and fires a reaction GIF to punctuate the moment

### 🎞️ GIF Reaction System
Karelia sends contextually appropriate GIFs in response to certain events (wins, losses, specific keywords, etc.) via Klipy. GIF data is stored and cached in `gifarray.json` and `learned_gifs_array.json`, allowing the reaction pool to grow over time.

### 🔒 Encrypted Functions
Sensitive or internal utility functions live in the `encryptedfunc/` directory, keeping them separate from the main bot logic.

### 📋 Logging
Bot activity is written to the `logs-storage/` directory for debugging and auditing purposes.

----
# Requirements
- Node.js 18+
- A Discord bot token with Message Content Intent enabled
- A Groq API key
- A Klipy API key (for GIF reactions)
- A Google API key (for image analysis)
- A SERPER API key *(optional, for web search)*
- Visual Studio Code *(optional)*
- Docker Desktop *(optional, if you want to host it)*

----
# Architecture
```
Discord Message
    ↓
Event Listener (discord.js)
    ↓
Context Parser (Groq)
    ↓
(Optional) SERPER Search Layer
    ↓
Prompt Builder (a.k.a. personality engine)
    ↓
Groq Again
    ↓
Response Formatter
    ↓
Discord Output
```

----

# Installation
<p align="center"> <a href="#-installation"><img src="https://img.shields.io/badge/Install-npm%20i-blue?style=for-the-badge"/></a> <a href="#-features"><img src="https://img.shields.io/badge/Features-Acts%20like%20a%20dork!-green?style=for-the-badge"/></a> <a href="#-warning"><img src="https://img.shields.io/badge/Warning-Read%20this%20first-red?style=for-the-badge"/></a> </p>

## Setting up Variables
 - Make your own `.env` file with the variables:
  - `DISCORD_TOKEN`
  - `DISCORD_CLIENT_ID`
  - `BOT_PREFIX`
  - `GROQ_API_KEY`
  - `GOOGLE_API_KEY`
  - `KLIPY_API_KEY`
  - `SERPER_API_KEY` → *optional, for web search*

> [!TIP]
> You have been provided with an env example. 
> *It's not like I wanted you to have an easier time or anything*.
> <img width="355" height="375" alt="image" src="https://github.com/user-attachments/assets/8e53a2db-2692-48ee-8a41-f59ffd50cd1b" />

> [!NOTE]
> ### an .env file must look like this;
> https://github.com/RuiKurumi/Karelia-AI.js/blob/d15e85800ea05c9b9841081d860f91ab01a6df56/.env.example#L1-L6

> [!TIP]
> ### This is incredibly helpful for making your projects secure, especially when using hosting, or ***uploading your random shenanigans on github*** *(Yes, I'm staring at myself.)*

## Installing Dependencies

Navigate to the project directory and run:

```bash
npm install
```

This will pull in all required packages — `discord.js`, `groq-sdk`, `chess.js`, `@google/generative-ai`, `dotenv`, and others.

## Deploying Slash Commands

Before running the bot for the first time, register its slash commands with Discord:

```bash
node deploy-command.js
```

You only need to do this once, or whenever you add or modify commands.

## Setting up your Personality
Edit `personality.json` to define Karelia's character. The `system` field sets her core behavior; the `examples` field is where you train her voice with user/bot prompt pairs.

> ### In the `examples` field, you may use as many prompts as you like to make the bot reply in a more accurate, or convincing way.
```json
 "examples": [
  {
   "user" : "Hello there!",
   "bot" : "The missile knows where it is at all times. It knows this because it knows where it isn't. By subtracting where it is from where it isn't, or where it isn't from where it is (whichever is greater),
it obtains a difference, or deviation. The guidance subsystem uses deviations to generate corrective commands to drive the missile from a position where it is to a position where it isn't,
and arriving at a position where it wasn't, it now is. Consequently, the position where it is, is now the position that it wasn't, and it follows that the position that it was, is now the position that it isn't.
In the event that the position that it is in is not the position that it wasn't,
the system has acquired a variation, the variation being the difference between where the missile is, and where it wasn't. If variation is considered to be a significant factor, it too may be corrected by the GEA.
However, the missile must also know where it was. The missile guidance computer scenario works as follows. Because a variation has modified some of the information the missile has obtained,
it is not sure just where it is. However, it is sure where it isn't, within reason, and it knows where it was. It now subtracts where it should be from where it wasn't,
or vice-versa, and by differentiating this from the algebraic sum of where it shouldn't be, and where it was, it is able to obtain the deviation and its variation, which is called error."
  },
  {
   "user": "are you auti-",
   "bot" : "lock tuah, AIM-9 on that thang!"
  }
]
```


### Initialization 
Running with an IDE is preferred. However, if you want to run from the Command Line, navigate to your target location with your copy of `index.js` using `cd <path>`, then run:

```bash
node index.js
```

Or use the provided npm script:

```bash
npm start
```

> [!TIP]
> You can verify the bot's files for syntax errors before running with:
> ```bash
> npm test
> ```

# [OPTIONAL] Docker Setup
## Requirements:
- [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Windows Subsystem for Linux](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Virtualization Enabled in BIOS](https://support.microsoft.com/en-us/windows/enable-virtualization-on-windows-c5578302-6e43-4b4b-a449-8ced115f58e1)

## Setting up:
- Install WSL and Docker Desktop.
- Open Docker Desktop to run Docker Engine.
- create your "homebase" folder.
- open Command Prompt, cd to your homebase folder and run `git clone https://github.com/RuiKurumi/Karelia-AI.js.git`
- create your dockerfile:
  - ```
    FROM node:20-alpine

    WORKDIR /app

    COPY package*.json ./
    RUN npm install

    COPY . .

    CMD ["node", "index.js"]
    ```
- Create .dockerignore
  - ```
    node_modules
    temp
    .env
    *.log
    ```
- and then build (on Powershell) with:
  - ```
    docker build -t karelia .
    docker run -d --name karelia --restart unless-stopped --env-file .env -v $(pwd)/data:/app/data -v $(pwd)/logs-storage:/app/logs-storage karelia
    ```  
- enjoy.
> [!CAUTION]
> # WARNING: 
> # DO **NOT** CREEP OUT YOUR FRIENDS WITH ~~THEIR REFLECTION~~ THIS 

> [!NOTE]
> - Yes, the missile quote is intentional
> - No, it will not be removed
> - Yes, the bot can become weird if you try hard enough (X to doubt, really)
> - No, I don't recommend testing that last one
