# H5 XP
Scriptable widget to show Halo 5 XP Progress from the Home Screen

![preview.png](https://github.com/sac396/H5-XP/blob/main/preview.jpeg?raw=true)

Takes your armor and emblem from the game.
Takes your XP and SR too. There's no delay between the time you finish a match and gain XP and when the widget can access the data. All data comes direct from 343. The widget itself takes ≈3 seconds to refresh. You can see exactly how long it took in the log.

## Installation 

<details>
   
<summary>Version 1.5 and Newer</summary>

1. On your iOS device, go [here](https://downgit.github.io/#/home?url=https://github.com/sac396/H5-XP-iOS-Widget/blob/main/H5-XP.scriptable) to download the script. You can also view the source code [here](https://github.com/sac396/H5-XP-iOS-Widget/blob/main/H5-XP.js)
2. A Zip file will be downloaded. Open it, and it should bring you to the files app. Tap the Zip file to unzip it, and a H5-XP.scriptable file will appear.
3. Open it, tap the share on the bottom, thrn tap Scriptable.

You will need to get the following too:
- An API key from developer.haloapi.com to access XP and SR information.
  - Sign up for the API [here](https://developer.haloapi.com/signin?ReturnUrl=%2Fproducts%2F560af1e42109182040fb56fc).
  - Subscribe (it's free and they don't spam you), then you will see your keys. Either will work.
- A shortcut to automatically reset Daily XP part of the widget each night. This includes:
  - The [Shortcuts app](https://apps.apple.com/us/app/shortcuts/id1462947752).
  - [This shortcut](https://www.icloud.com/shortcuts/fab57f744cac480bb9faedbf754b0dca).
    - Run this a few times. It may ask for permissions; just run it until it finishes completely with no prompts or alerts.

</details>

<details>
   
<summary>Version 1.1 and Older</summary>

I tried to make this as easy to set up as possible. It shouldn't take more than 5-10 minutes at the most. As you run the script, it should guide you through the process as well, and these instructions are really only a supplement.

1. Download [Scriptable from the App Store](https://apps.apple.com/us/app/scriptable/id1405459188).
2. Make a new script in Scriptable, and paste in the code [here](https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/H5-XP.js). 
3. Run the script. It should detect everything you are missing and download the things it can along the way. It will ask you for the things it doesn't know. If you get confused, maybe read through the rest of this page and you'll understand.
   - You may need to run it a few times. Just run it until it completes without asking you for anything.
5. Add a medium size Scriptable widget and set it to this script. In the configurator, set the script to the one we just set up, and the "When Interacting" to "Run Script."

You will need to get the following too:
- An API key from developer.haloapi.com to access XP and SR information.
  - Sign up for the API [here](https://developer.haloapi.com/signin?ReturnUrl=%2Fproducts%2F560af1e42109182040fb56fc).
  - Subscribe (it's free and they don't spam you), then you will see your keys. Either will work.
- A shortcut to automatically reset Daily XP part of the widget each night. This includes:
  - The [Shortcuts app](https://apps.apple.com/us/app/shortcuts/id1462947752).
  - [This shortcut](https://www.icloud.com/shortcuts/f00ad74cf1d943e09c120585b4aa2e78).
    - Run this a few times. It may ask for permissions; just run it until it finishes completely with no prompts or alerts.

</details>

#### Setting the Shortcut to Run on its Own (Important):

In order for the daily XP to _automatically_ reset _every night_ you need to set an **automation**. Here's how:

1. With the shortcut already installed, run it one time (tap its icon), then go to the automation tab (looks like a clock).
2. Make a new Personal Automation and set it to "Time of Day."
3. Set the time to something like 2:00 am, or a time when you are usually asleep. Make sure it repeats daily.
4. Tap Next then add the action "Run Shortcut" and select the one we just made.
5. Tap Next, **_uncheck "Ask Before Running"_**, then tap Done.

#### Common Issues and Some things to note 

###### All Versions

- The date must be formatted like this: "November 20, 2021" (with the month written out, the comma, and in that order).
- When the shortcut is run, you won't see anything. This is normal. All that is happening is a JSON file is being updated at /iCloud/Shortcuts/.
- For the first day, the Today part of the widget will be wrong. This is normal too. Assuming you set up the automation and everything is correctly, it will fix itself.
- I'm pretty sure the widget doesn't update on its own. If set up correctly, you should be able to tap the widget and it will open the Scriptable app and run the script. Then go back home and it should be refreshed.
- Open the script before running it and you can see the log. This isn't necessary, but if there's a problem you can see what step the script is stuck on which makes debugging much easier.

<details>
   
<summary>Version 1.1 and older</summary>

- A lot of problems can be caused by incorrectly entering you gamertag, API key, or target completion date. Head to /iCloud/Scriptable/H5-XP-Prefs.json and check that "apiKey", "gamertag", and "targetCompletionDate" are all right. The best way to fix it if they aren't is to delete the prefs file and start over.
- If you want to access the ```.js```, ```.json```, or ```.png``` files, get [the Files app](https://apps.apple.com/us/app/files/id1232058109) from the app store. This isn't required, but you need it if you want to see all the files the script creates. Not all of the files will be there until you have successfully run the script and shortcut at least once.
  - For version 1.1 and older, one of the files is in /iCloud Drive/Shortcuts/
  - The rest are in /iCloud Drive/Scriptable/

</details>

<details>

## Prefs



### Editing Prefs

<details>
   
   <summary> Version 1.5 and Newer</summary>
   
   
   
   </details>

<details>
   
   <summary>Version 1.1 and Older</summary>

Once you run the script, a Preferences file called "H5-XP-Prefs.json" will be saved to /iCloud/Scriptable/. You shouldn't _need_ to go in there (default settings are fine), but you can if you wish. Here is what each thing does:

The best way to edit the prefs is to do so _indirectly_. Around lines 40-50 in the script, there is a "Modify Prefs Here" section. For each thing you want to change, add in the code like this:

```
/*-----------------------------------------*/
/*  Modify Prefs Here                      */
/*-----------------------------------------*/


let prefsSource.showEmblem = false
let prefsSource.apiKey = "12345"

```

### Here is an explanation of each property:

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


### Resetting Prefs

You con reset the preferences to defaults by opening the files app and deleting the file at /iCloud/Scriptable/H5-XP-Prefs.json. The next time you run the script, it will download the defualt prefs file from this Github. This means you will be asked for your API Key, Gamertag, and Target Completion Date again.

</details>

##  Version History

### v1.5
- Preferences are now more "normal" and easier to edit. They are directly in the code.
- New features: **XP to next SR**, **Lifteime XP/Hr rate**, **_n_ days XP/Hr rate**, and **Gains last _n_ days**.
  - There might actually be more that I'm forgetting
- Code cleanup
- Improved Logging

### v1.1

- Updated the broken iCloud Shortcut link. Previously, you might get an error saying you need to get a Shortcut, but then you wouldn't be able to get it. This should be fixed now
- An update is not necessary if the script was already working fine for you. This is only for people setting up the widget for the first time.

### v1.0

- Initial Release

