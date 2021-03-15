// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: sync-alt;
/*
  
Setup:
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

let font = "ArialRoundedMTBold"
// Find fonts at iosfonts.com

let fontSize = 18

let showSR = true
let showTotalXP = true
let showTodaysXP = true
let showTodaysGoal = true
let showXPtoMax = true
let showXPtoNextSR = "auto"  // accepts "always", "never", or "auto." Auto will show it unless you are SR 151 or 152
let showEmblem = true
let showArmor = true
let useBackgroundImage = false
let checkForUpdates = true


/*-----------------------------------------*/
/*  Check if script needs to be set up     */
/*-----------------------------------------*/


// Retrieve the stored XP from the shortcut, and the background image from iCloud


let BG1, storedXP
let BGImageName = "H5-XP-BG.png"
let fm = FileManager.iCloud()

let iCloudShortcutLink = "https://www.icloud.com/shortcuts/67731c5a806843fabff1c16f8998b24a"

if (!fm.bookmarkExists("H5-XP.json")) {
   let detectionAlert = new Alert()
   detectionAlert.title = "No \"H5-XP.json\" Bookmark Detectd"
   detectionAlert.message = "The script won't work without it. This probably means you just haven't gotten the Shortcut yet. Get it, then run it once."
   detectionAlert.addAction("Add Shortcut")
   detectionAlert.addCancelAction("Cancel")
   let alertIndex = await detectionAlert.presentAlert()
   log(alertIndex)
   if (alertIndex >= 0) {
      Safari.open(iCloudShortcutLink)
   } else {

   }
}

if (useBackgroundImage && !fm.fileExists(fm.documentsDirectory() + "/" + BGImageName)) {
   log(fm.fileExists(fm.documentsDirectory() + "/" + BGImageName))
   let img = await new Request("https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/H5-XP-BG.png").loadImage()
   fm.writeImage(fm.documentsDirectory() + "/" + BGImageName, img)
}

if (showTodaysGoal || showTodaysXP) {
   storedXP = fm.readString(fm.bookmarkedPath("H5-XP.json"))
   storedXP = JSON.parse(storedXP)["Stored XP"]
}


/*-----------------------------------------*/
/*  HTTP + iCloud Requests                 */
/*-----------------------------------------*/


// Retrieve stuff from the Halo API


gamertag = gamertag.replace(" ", "%20")

let currentXP, currentSR, emblemImage, armorImage, XPGain
let nf = new Intl.NumberFormat

if (showTodaysGoal || showTodaysXP || showTotalXP || showXPtoMax || showSR || showXPtoNextSR) {

   let XPREQ = new Request("https://www.haloapi.com/stats/h5/servicerecords/campaign?players=" + gamertag)
   XPREQ.headers = { "Ocp-Apim-Subscription-Key": apiKey }

   let XPRES = await XPREQ.loadJSON()

   currentXP = XPRES["Results"][0]["Result"]["Xp"]

   if (showSR || showXPtoNextSR) {
      currentSR = XPRES["Results"][0]["Result"]["SpartanRank"]
   }
}

if (showEmblem) {
   let emblemREQ = new Request("https://www.haloapi.com/profile/h5/profiles/" + gamertag + "/emblem")
   emblemREQ.headers = { "Ocp-Apim-Subscription-Key": apiKey }
   emblemImage = await emblemREQ.loadImage()
}

if (showArmor) {
   let armorREQ = new Request("https://www.haloapi.com/profile/h5/profiles/" + gamertag + "/spartan")
   armorREQ.headers = { "Ocp-Apim-Subscription-Key": apiKey }
   armorImage = await armorREQ.loadImage()
}


/*-----------------------------------------*/
/*  Set Up Draw Contexts                   */
/*-----------------------------------------*/


let widget = new ListWidget()
widget.setPadding(0, 0, 0, 0)


let dc = new DrawContext()
dc.opaque = false
dc.size = new Size(675, 275)


font = new Font(font, fontSize)
dc.setFont(font)
dc.setTextColor(new Color("#ffffff"))


let leftOffset = 95
let topOffset = 16
let rightOffset = 452
let rectHeight = 30


/*-----------------------------------------*/
/*  Fuctions                               */
/*-----------------------------------------*/


let elementIndex = 0
function addElement(left, right, isFooter) {
   let textContainer
   if (isFooter) {
      textContainer = new Rect(leftOffset, topOffset + 225, (rightOffset - leftOffset), rectHeight)
   } else {
      textContainer = new Rect(leftOffset, topOffset + elementIndex * rectHeight, (rightOffset - leftOffset), rectHeight)
   }
   dc.setTextAlignedLeft()
   dc.drawTextInRect(left, textContainer)
   dc.setTextAlignedRight()
   dc.drawTextInRect(right, textContainer)
   elementIndex += 1
}


/*-----------------------------------------*/
/*  Draw Things                            */
/*-----------------------------------------*/


// Right side : Armor + Emblem


let emblemImageScale = .75
dc.drawImageInRect(emblemImage, new Rect(455, 30, 256 * emblemImageScale, 256 * emblemImageScale))

let armorImageScale = .4
dc.drawImageInRect(armorImage, new Rect(510, 50, 512 * armorImageScale, 672 * armorImageScale))


// Left side : Stats


if (showSR) { addElement("SR " + currentSR, "") }

if (showTotalXP) {
   let totalXP = nf.format(currentXP) + " (" + Math.round(currentXP / 50000) / 10 + "%)"
   addElement("TOTAL", totalXP)
}

if (showTodaysXP) {
   let XPGain = nf.format(currentXP - storedXP)
   addElement("TODAY", XPGain)
}

if (showTodaysGoal) {
   let daysUntilTarget = Math.ceil((new Date(targetCompletionDate) - new Date()) / (1000 * 60 * 60 * 24))
   addElement("GOAL", nf.format(Math.ceil((50000000 - currentXP) / daysUntilTarget)))
}

let showXPtoNextSRBool
if ((showXPtoNextSR == "auto" && currentSR < 151) || showXPtoNextSR == "always") {
   showXPtoNextSRBool = true
} else {
   showXPtoNextSRBool = false
}

log(showXPtoNextSRBool)

if (showXPtoNextSRBool) {
   let XPperSR =
      [
         0,
         300,
         3600,
         6600,
         10700,
         13700,
         17500,
         22500,
         28500,
         37000,
         41000,
         47000,
         54500,
         63500,
         74500,
         87000,
         101500,
         118000,
         137000,
         160000,
         167000,
         176000,
         187500,
         201000,
         217000,
         236000,
         258000,
         282500,
         310000,
         340000,
         349500,
         361500,
         376500,
         394000,
         414500,
         438000,
         464000,
         493000,
         525500,
         562000,
         574000,
         589000,
         607500,
         629000,
         654000,
         682000,
         713500,
         748500,
         786500,
         828000,
         873000,
         922000,
         975500,
         1035000,
         1100000,
         1115000,
         1135000,
         1155000,
         1180000,
         1210000,
         1245000,
         1280000,
         1320000,
         1365000,
         1415000,
         1465000,
         1520000,
         1580000,
         1645000,
         1720000,
         1735000,
         1755000,
         1780000,
         1810000,
         1845000,
         1885000,
         1930000,
         1975000,
         2025000,
         2080000,
         2140000,
         2205000,
         2275000,
         2355000,
         2440000,
         2465000,
         2490000,
         2520000,
         2555000,
         2595000,
         2640000,
         2690000,
         2745000,
         2805000,
         2870000,
         2940000,
         3015000,
         3095000,
         3180000,
         3270000,
         3300000,
         3335000,
         3375000,
         3420000,
         3470000,
         3530000,
         3595000,
         3665000,
         3740000,
         3820000,
         3905000,
         3995000,
         4090000,
         4200000,
         4320000,
         4355000,
         4395000,
         4440000,
         4495000,
         4555000,
         4620000,
         4690000,
         4765000,
         4845000,
         4935000,
         5025000,
         5120000,
         5220000,
         5330000,
         5475000,
         5520000,
         5575000,
         5640000,
         5710000,
         5790000,
         5880000,
         5980000,
         6085000,
         6200000,
         6325000,
         6460000,
         6615000,
         6800000,
         7050000,
         7750000,
         9000000,
         11050000,
         14000000,
         18000000,
         24000000,
         35000000,
         50000000
      ]
   let XPtoNextSR = XPperSR[currentSR] - currentXP
   addElement("XP TO SR " + (currentSR += 1), nf.format(XPtoNextSR))
}

if (showXPtoMax) {
   let XPtoMax = nf.format(50000000 - currentXP)
   addElement("XP TO MAX", XPtoMax, true)
}


/*-----------------------------------------*/
/*  Assemble Widget                        */
/*-----------------------------------------*/


widget.backgroundImage = Image.fromFile(fm.documentsDirectory() + "/" + BGImageName)

let dcImage = dc.getImage()
dcImage = widget.addImage(dcImage)
dcImage = dcImage.centerAlignImage()

Script.setWidget(widget)
