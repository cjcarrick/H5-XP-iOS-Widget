# H5 XP
Scriptable widget to show Halo 5 XP Progress

![preview.png](https://github.com/sac396/H5-XP/blob/main/preview.png?raw=true)

Takes your armor and emblem from the game.
Takes your XP and SR too. There's no delay between the time you finish a match and gain XP and when the widget can access the data. All data comes direct from 343. The widget itself takes ≈3 seconds to refresh. You can see exactly how long it took in the log.

## Installation

1. Download [Scriptable from the App Store](https://apps.apple.com/us/app/scriptable/id1405459188).
2. Make a new script in Scriptable, and paste in the code [here](https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/H5-XP.js). 
3. Run the script. It should detect everything you are missing and download the things it can along the way. It will ask you for the things it doesn't know. If you get confused, maybe read through the rest of this page and you'll understand.
   - You may need to run it a few times. Just run it until it completes without asking you for anything.
5. Add a medium size Scriptable widget and set it to this script. In the configurator, set the script to the one we just set up, and the "When Interacting" to "Run Script."

You will need to get the following too:
- An API key from developer.haloapi.com to access XP and SR information.
  - Sign up for the API [here](https://developer.haloapi.com/signin?ReturnUrl=%2Fproducts%2F560af1e42109182040fb56fc).
  - Subscribe (it's free and they don't spam you I promise), then you will see your keys. Either will work.
- A shortcut to automatically reset Daily XP part of the widget each night
  - The [Shortcuts app](https://apps.apple.com/us/app/shortcuts/id1462947752)
  - [This shortcut](https://www.icloud.com/shortcuts/ca90d07d2b9e4fc6b0ab86685038a8ca)

#### Setting the Shortcut to Run on its Own (Important):

In order for the daily XP to _automatically_ reset _every night_ you need to set an **automation**. Here's how:

1. With the shortcut already installed, run it one time (tap its icon), and go to the automation tab (looks like a clock).
2. Make a new Personal Automation and set it to "Time of Day."
3. Set the time to something like 2:00 am, or a time when you are usually asleep. Make sure it repeats daily.
4. Tap Next then add the action "Run Shortcut" and select the H5-XP-Background one.
5. Tap Next, **_uncheck "Ask Before Running"_**, then tap Done.

#### Some things to note:

- When the shortcut is run, you won't see anything. This is normal. All that is happening is a file is being updated at /iCloud/Shortcuts/H5-XP-StoredXP.json.
- For the first day, the Today part of the widget will be wrong. This is normal too. Assuming you set up the automation and everything is correctly, it will fix itself.
- I'm pretty sure the widget doesn't update on its own. If you did step 4 correctly, you should be able to tap the widget and it will open the Scriptable app and run the script. Then go back home and it should be refreshed.
- Open the script before running it and you can see the log. This isn't necessary, but if there's a problem you can see what step the script is stuck on which makes debugging much easier.

## Prefs File

Once you run the script, a Preferences file called "H5-XP-Prefs.json" will be saved to /iCloud/Scriptable/. You shouldn't _need_ to go in there (default settings are fine), but you can if you wish. Here is what each thing does:

##### ```apiKey```, ```gamertag```, ```targetCompletionDate```

These are set the first couple times you run the script. They are in the preferences file so you can change them later if you need.

##### ```font```, ```fontSize```

To see what fonts you can use, visit [iosfonts.com](http://iosfonts.com). These are the ones that come with iOS and that Scriptable can access. They are all case sensitive. For font size I recommend something between 12 and 24.

##### ```showXPtoNextSR```

Accepts ```auto```,```always```, or ```never```. Auto will only show it if you are below SR 151.

##### ```showTotalXP```, ```showEmblem```, ```showSR```, ```showTodaysGoal```, ```showArmor```

Accept ```true``` or ```false```. Self explanatory; it hides or shows certain elements.

##### ```showXPtoMax```

Accepts ```true``` or ```false```. If you are SR 152 already, it will show the remaining XP to 100 million, the hard cap.

##### ```checkForUpdates```

Accepts ```true``` or ```false```. If ```true```, each time you run the script it will check for new H5-XP updates in the Log from this Github. 

##### ```resetPrefs```

Accepts  ```true``` or ```false```. If ```true```, it will reset everything in H5-XP-Prefs.json to the defaults the next time you run the script. This means you will be asked for your API Key, Gamertag, and Target Completion Date again.
