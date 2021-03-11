// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: sync-alt;
/*
  
Setup:

1. Save this image to Files/iCloud Drive/Scriptable/
   https://i.imgur.com/CXzDZkD.png

2. Fill out the User Prefs (Scroll down a bit)

4. Install this shortcut: 
   https://www.icloud.com/shortcuts/ca90d07d2b9e4fc6b0ab86685038a8ca

5. Put in your API Key and Gamertag, then run it once.

6. In shortcuts go to:
   Automations, then
   New Personal Automation
   Tap "Time of day"
   (Set time to something like 2 am)
   Tap "Next"
   Add a "Run Shortcut" Action
   Set it to the shurtcut from steps 4 & 5
   Tap "Next"
   Turn off "Ask Before Running"
   Tap "Done"

7. In Scriptable go to:
   Settings, then
   File Bookmarks
   New Bookmark
   File
   Go in the Shortcuts folder and select "H5-XP.json"
   Leave the name as "H5-XP.json"
   Tap "Save"

7. Add a medium scriptable widget to your home screen, set it to this sctipt, and you're done.

Note: For the first day, your XP for "TODAY" won't be accurate. After 1 day, assuming you set it up right, it should work.

Another note: I'm not sure if this widget updates automatically. The easiest way to run it quickly is to set the "When Interacting" for the widget, to "Run Script." Now every time you tap the widget, it runs the script and refreshes it.

DM me at u/sac396 if you need help <3

*/


/*-----------------------------------------*/
/*  User Prefs                             */
/*-----------------------------------------*/


let apiKey = "87843a9ea9204c519460ef4221e543e7"
// https://developer.haloapi.com/signin > Profile > Your Subscriptions > Copy one of the API Keys

let gamertag = "sac396"
// Include any spaces. Not case sensitive

let targetCompletionDate = "November 20, 2021"

let BGImageName = "bg1.png"
// Save to iCloud Drive/Scriptable/

let font = "Halo Font"
// Find fonts at iosfonts.com

let fontSize = 18


/*-----------------------------------------*/
/*  HTTP + iCloud Requests                 */
/*-----------------------------------------*/


// Retrieve stuff from the Halo API


gamertag = gamertag.replace(" ", "%20")

let nf = new Intl.NumberFormat


let emblemREQ = new Request("https://www.haloapi.com/profile/h5/profiles/" + gamertag + "/emblem")
emblemREQ.headers = { "Ocp-Apim-Subscription-Key": apiKey }

let emblemImage = await emblemREQ.loadImage()


let armorREQ = new Request("https://www.haloapi.com/profile/h5/profiles/" + gamertag + "/spartan")
armorREQ.headers = { "Ocp-Apim-Subscription-Key": apiKey }

let armorImage = await armorREQ.loadImage()


let XPREQ = new Request("https://www.haloapi.com/stats/h5/servicerecords/campaign?players=" + gamertag)
XPREQ.headers = { "Ocp-Apim-Subscription-Key": apiKey }

let XPRES = await XPREQ.loadJSON()
let currentXP = XPRES["Results"][0]["Result"]["Xp"]

let currentLevel = XPRES["Results"][0]["Result"]["SpartanRank"]


// Retrieve the stored XP from the shortcut, and the background image from iCloud


let fm = FileManager.iCloud()


let BG1 = fm.documentsDirectory() + "/" + BGImageName
log(BG1)


let storedXP = fm.bookmarkedPath("H5-XP.json")
storedXP = fm.readString(storedXP)
storedXP = JSON.parse(storedXP)
storedXP = storedXP["Stored XP"]


let XPGain = currentXP - storedXP

let daysUntilTarget = Math.ceil( (new Date(targetCompletionDate) - new Date() ) / (1000*60*60*24) )


/*-----------------------------------------*/
/*  Draw Contexts                          */
/*-----------------------------------------*/


// Set up draw context


font = new Font(font, fontSize)

let widget = new ListWidget()
widget.setPadding(0, 0, 0, 0)

let dc = new DrawContext()
dc.opaque = false
dc.size = new Size(675, 275)

dc.setFont(font)
dc.setTextColor(new Color("#ffffff"))


let leftOffset = 95
let topOffset = 8
let rightOffset = 452
let rectHeight = 30


// Right side : Armor + Emblem


let emblemImageScale = .75
dc.drawImageInRect(emblemImage, new Rect(455, 30, 256 * emblemImageScale, 256 * emblemImageScale))

let armorImageScale = .4
dc.drawImageInRect(armorImage, new Rect(510, 50, 512 * armorImageScale, 672 * armorImageScale))


// Left side : Labels


dc.setTextAlignedLeft()

let textContainer1 = new Rect(leftOffset, topOffset +  10, ( rightOffset - leftOffset ), rectHeight)
dc.drawTextInRect("SR 152", textContainer1)

let textContainer3 = new Rect(leftOffset, topOffset +  40, ( rightOffset - leftOffset ), rectHeight)
dc.drawTextInRect("TOTAL", textContainer3)

let textContainer2 = new Rect(leftOffset, topOffset +  70, ( rightOffset - leftOffset ), rectHeight)
dc.drawTextInRect("TODAY", textContainer2)

let textContainer4 = new Rect(leftOffset, topOffset + 100, ( rightOffset - leftOffset ), rectHeight)
dc.drawTextInRect("GOAL", textContainer4)

let textContainer5 = new Rect(leftOffset, topOffset + 235, ( rightOffset - leftOffset ), rectHeight)
dc.drawTextInRect("XP TO SR 152", textContainer5)


// Left Side : Values


dc.setTextAlignedRight()

dc.drawTextInRect(nf.format(currentXP) + " (" + Math.round(currentXP / 50000) / 10 + "%)", textContainer3)

dc.drawTextInRect(nf.format(XPGain), textContainer2)

dc.drawTextInRect(nf.format(Math.ceil( (50000000 - currentXP) / daysUntilTarget )), textContainer4)

dc.drawTextInRect(nf.format(50000000 - currentXP), textContainer5)


/*-----------------------------------------*/
/*  Assemble Widget                        */
/*-----------------------------------------*/


widget.backgroundImage = Image.fromFile(BG1)

let dcImage = dc.getImage()
dcImage = widget.addImage(dcImage)
dcImage = dcImage.centerAlignImage()

Script.setWidget(widget)