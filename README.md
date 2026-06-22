# 🧠 Karelia-AI.JS


<p align="center"> <img src="https://img.shields.io/badge/Node.js-18%2B-3C873A?logo=node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Discord.js-v14-5865F2?logo=discord&logoColor=white"/> <img src="https://img.shields.io/badge/LLM-Google%20Generative%20AI-8A2BE2"/> <img src="https://img.shields.io/badge/Status-Suspiciously%20Human-red"/> <img src="https://img.shields.io/badge/License-MIT-lightgrey"/> </p> <p align="center"> <b>Karelia-AI.JS</b> is an LLM-based Discord bot modeled as close as possible to an actual human for <i>ScIeNtIfIc pUrPoSes</i>. <br/> Powered by Google Generative AI. Absolutely nothing unusual going on here. </p>

----
# 🌌 Overview

**Karelia-AI.JS** is a Discord AI chatbot designed to simulate human-like interaction using LLMs, prompt examples, and optional web search augmentation.

**It is:**

- **First and Foremost:** **Not** alive(!!!!)
- **Not** self-aware
- **Debatably convincing enough to be a problem**
----
# Requirements
- latest version of node.js
- latest version of discord.js
- Visual Studio Code (Optional)
- Maybe Docker Desktop (if you wanted to host it)
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
  - bot_token
  - prefix
  - bot_id
  - g_ApiKey | GROQ_API_KEY
  - SERPER_API_KEY -> `this is for search querying`

> [!TIP]
> You have been provided with an env example. 
> *It's not like I wanted you to have an easier time or anything*.
> <img width="355" height="375" alt="image" src="https://github.com/user-attachments/assets/8e53a2db-2692-48ee-8a41-f59ffd50cd1b" />


### Note: an .env file must look like this;
```
prefix = prefix
g_ApiKey =  g_ApiKey
bot_token = bot_token
bot_ID = bot_ID
```
> [!TIP]
> This is incredibly helpful for making your projects secure, especially when using hosting, or ***uploading your random shenanigans on github*** *(Yes, I'm staring at myself.)*

4. Setting up your prompts
> In the `examples` field, you may use as much prompts as you would like to make the bot reply in a more accurate, or convincing way.
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
Running with an IDE is preferred. However, if you want to run from the Command Line, navigate to your target location with your copy of index.js with `cd <path>`, before running `node index.js`

> [!CAUTION]
> # WARNING: 
> DO NOT CREEP OUT YOUR FRIENDS WITH ~~THEIR REFLECTION~~ THIS 

> [!NOTE]
> - Yes, the missile quote is intentional
> - No, it will not be removed
> - Yes, the bot can become weird if you try hard enough (X to doubt)
> - No, I don’t recommend testing that last one
