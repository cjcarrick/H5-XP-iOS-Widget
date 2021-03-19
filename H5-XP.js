// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: sync-alt;

/*

Detailed setup instructions and more info avalible at https://github.com/sac396/H5-XP-iOS-Widget.

*/


/*-----------------------------------------*/
/*  Initial Script Setup                   */
/*-----------------------------------------*/


let useLog = true

let startDate
if (useLog) { startDate = new Date() }

let currentVer = 1.0
// Used for checking updates. Do not change.

let storedXP
let BGImageName = "H5-XP-BG.png"
let fm = FileManager.iCloud()

let prefsSource
if (!fm.fileExists(fm.documentsDirectory() + "/H5-XP-Prefs.json")) {
   prefsSource = await new Request("https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/Default-Prefs").loadJSON()
   fm.writeString(fm.documentsDirectory() + "\/H5-XP-Prefs.json", JSON.stringify(prefsSource, null, 4))
} else {
   prefsSource = fm.documentsDirectory() + "/H5-XP-Prefs.json"
   fm.downloadFileFromiCloud(prefsSource)
   prefsSource = JSON.parse(fm.readString(prefsSource))
}


/*-----------------------------------------*/
/*  Modify Prefs Here                      */
/*-----------------------------------------*/


// example: let prefsSource.showEmblem = false
//          let prefsSource.apiKey = "12345"


/*-----------------------------------------*/
/*  Check if script needs to be set up     */
/*-----------------------------------------*/


if (!prefsSource.apiKey) {

   if (useLog) { log("No API Key Found") }

   apiKeyAlert = new Alert()
   apiKeyAlert.title = "No API Key Found"
   apiKeyAlert.message = "Head to developer.haloapi.com to get a key. Copy it to your clipboard. Then come back, run the script again, and tap \"Paste my Key.\""
   apiKeyAlert.addAction("Go to developer.haloapi.com")
   apiKeyAlert.addAction("Paste my key")
   apiKeyAlert.addAction("Cancel")
   let alertIndex = await apiKeyAlert.presentAlert()

   if (alertIndex == 1) {

      prefsSource.apiKey = Pasteboard.paste()
      fm.writeString(fm.documentsDirectory() + "\/H5-XP-Prefs.json", JSON.stringify(prefsSource, null, 4))

      if (useLog) { log("Saved API Key \"" + prefsSource.apiKey + "\" to H5-XP-Prefs.json") }

   } else if (alertIndex == 0) {
      Safari.open("https://developer.haloapi.com/signin?ReturnUrl=%2Fproducts%2F560af1e42109182040fb56fc")
      throw new Error("Script aborted")
   } else {
      throw new Error("Script aborted")
   }

} else {

   if (useLog) { log("Running with API Key \"" + prefsSource.apiKey + "\"") }

}

if (!prefsSource.gamertag) {

   if (useLog) { log("No Gamertag Found") }

   gamertagAlert = new Alert()
   gamertagAlert.title = "No Gamertag Found"
   gamertagAlert.message = "Enter it below then tap the Return key on the keyboard. Don't worry, this is the only time you'll have to enter it manually."
   gamertagAlert.addTextField()
   gamertagAlert.addAction("Cancel")
   let alertIndex = await gamertagAlert.presentAlert()

   if (gamertagAlert.textFieldValue(0) == "") {

      throw new Error("Script aborted")

   } else {

      prefsSource.gamertag = gamertagAlert.textFieldValue(0)
      log(prefsSource.gamertag)
      fm.writeString(fm.documentsDirectory() + "\/H5-XP-Prefs.json", JSON.stringify(prefsSource, null, 4))

      if (useLog) { log("Saved Gamertag \"" + prefsSource.gamertag + "\" to H5-XP-Prefs.json") }

   }

} else {

   if (useLog) { log("Running with gamertag \"" + prefsSource.gamertag + "\"") }

}

if (!prefsSource.targetCompletionDate) {

   if (useLog) { log("No Target Completion Date Set") }

   targetCompletionDateAlert = new Alert()
   targetCompletionDateAlert.title = "No Target Completion Date Set"
   targetCompletionDateAlert.message = "This is used to determine the Goal, how much XP you need per day. Enter it below then tap Return on your keyboard."
   targetCompletionDateAlert.addTextField("e.g. November 20, 2021")
   targetCompletionDateAlert.addAction("Cancel")
   let alertIndex = await targetCompletionDateAlert.presentAlert()

   if (alertIndex == 0) {

      prefsSource.targetCompletionDate = targetCompletionDateAlert.textFieldValue(0)
      log(prefsSource.targetCompletionDate)
      fm.writeString(fm.documentsDirectory() + "\/H5-XP-Prefs.json", JSON.stringify(prefsSource, null, 4))

      if (useLog) { log("Saved Target Completion Date \"" + prefsSource.targetCompletionDate + "\" to H5-XP-Prefs.json") }

   } else {
      throw new Error("Script aborted")
   }

} else {

   if (useLog) { log("Running with Target Completion Date \"" + prefsSource.targetCompletionDate + "\"") }

}

if (!fm.bookmarkExists("H5-XP-StoredXP.json")) {

   if (useLog) { log("Fetching saved XP from iCloud...") }

   let bookmarkDetectionAlert = new Alert()
   bookmarkDetectionAlert.title = "No \"H5-XP-StoredXP.json\" Bookmark Detectd"
   bookmarkDetectionAlert.message = "The script won't work without it. This probably means you just haven't gotten the Shortcut yet. Get it, then run it once."
   bookmarkDetectionAlert.addAction("Download Shortcuts")
   bookmarkDetectionAlert.addAction("Add Shortcut")
   bookmarkDetectionAlert.addCancelAction("Cancel")
   let alertIndex = await bookmarkDetectionAlert.presentAlert()

   if (alertIndex == 1) {
      Safari.open("https://www.icloud.com/shortcuts/f00ad74cf1d943e09c120585b4aa2e78")
   } else if (alertIndex == 0) {
      Safari.open("https://apps.apple.com/us/app/shortcuts/id1462947752")
   } else {
      throw new Error("Script aborted")
   }
}

if (prefsSource.useBackgroundImage && !fm.fileExists(fm.documentsDirectory() + "/" + BGImageName)) {

   if (useLog) { log("BG Image not found. Downloading and saving to iCloud...") }

   let img = await new Request("https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/H5-XP-BG.png").loadImage()
   fm.writeImage(fm.documentsDirectory() + "/" + BGImageName, img)
}

if (prefsSource.showTodaysGoal || prefsSource.showTodaysXP) {
   storedXP = fm.readString(fm.bookmarkedPath("H5-XP-StoredXP.json"))
   storedXP = JSON.parse(storedXP)["Stored XP"]
}


/*-----------------------------------------*/
/*  Check for Updates                   */
/*-----------------------------------------*/


if (prefsSource.checkForUpdates) {
   let newestVer = await new Request("https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/version.json").loadJSON()
   if (newestVer[0] > currentVer) {
      log("Version " + newestVer[0] + " of H5-XP avalible at https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/H5-XP.js.")
   } else {
      log("H5-XP is up to date.")
   }
   log("You have version " + currentVer)
}


/*-----------------------------------------*/
/*  HTTP + iCloud Requests                 */
/*-----------------------------------------*/


// Retrieve stuff from the Halo API


let gamertag = prefsSource.gamertag
gamertag = gamertag.replace(" ", "%20")

let currentXP, currentSR, emblemImage, armorImage, XPGain
let nf = new Intl.NumberFormat

if (prefsSource.showTodaysGoal || prefsSource.showTodaysXP || prefsSource.showTotalXP || prefsSource.showXPtoMax || prefsSource.showSR || prefsSource.showXPtoNextSR) {

   if (useLog) { log("Fetching current XP data from haloapi.com...") }

   let XPREQ = new Request("https://www.haloapi.com/stats/h5/servicerecords/campaign?players=" + gamertag)
   XPREQ.headers = { "Ocp-Apim-Subscription-Key": prefsSource.apiKey }

   let XPRES = await XPREQ.loadJSON()

   currentXP = XPRES["Results"][0]["Result"]["Xp"]

   if (prefsSource.showSR || prefsSource.showXPtoNextSR) {
      currentSR = XPRES["Results"][0]["Result"]["SpartanRank"]
   }
}

if (prefsSource.showEmblem) {

   if (useLog) { log("Fetching emblem image from haloapi.com...") }

   let emblemREQ = new Request("https://www.haloapi.com/profile/h5/profiles/" + gamertag + "/emblem")
   emblemREQ.headers = { "Ocp-Apim-Subscription-Key": prefsSource.apiKey }
   emblemImage = await emblemREQ.loadImage()
}

if (prefsSource.showArmor) {

   if (useLog) { log("Fetching armor image from haloapi.com...") }

   let armorREQ = new Request("https://www.haloapi.com/profile/h5/profiles/" + gamertag + "/spartan")
   armorREQ.headers = { "Ocp-Apim-Subscription-Key": prefsSource.apiKey }
   armorImage = await armorREQ.loadImage()
}


/*-----------------------------------------*/
/*  Set Up Draw Contexts                   */
/*-----------------------------------------*/

if (useLog) { log("Setting up widget...") }

let widget = new ListWidget()
widget.setPadding(0, 0, 0, 0)


let dc = new DrawContext()
dc.opaque = false
dc.size = new Size(675, 275)


font = new Font(prefsSource.font, prefsSource.fontSize)
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
   if (useLog) { log("Successfully drew \"" + left + " : " + right + "\"") }
   elementIndex += 1
}


/*-----------------------------------------*/
/*  Draw Things                            */
/*-----------------------------------------*/


// Right side : Armor + Emblem

if (prefsSource.showEmblem) {
   let emblemImageScale = .75
   dc.drawImageInRect(emblemImage, new Rect(455, 30, 256 * emblemImageScale, 256 * emblemImageScale))
   if (useLog) { log("Successfully drew emblem image") }
}

if (prefsSource.showArmor) {
   let armorImageScale = .4
   dc.drawImageInRect(armorImage, new Rect(510, 50, 512 * armorImageScale, 672 * armorImageScale))
   if (useLog) { log("Successfully drew armor image") }
}


// Left side : Stats


if (prefsSource.showSR) { addElement("SR " + currentSR, "") }

if (prefsSource.showTotalXP) {
   let totalXP = nf.format(currentXP) + " (" + Math.round(currentXP / 50000) / 10 + "%)"
   addElement("TOTAL", totalXP)

}

if (prefsSource.showTodaysXP) {
   let XPGain = nf.format(currentXP - storedXP)
   addElement("TODAY", XPGain)

}

if (prefsSource.showTodaysGoal) {
   let daysUntilTarget = Math.ceil((new Date(prefsSource.targetCompletionDate) - new Date()) / (1000 * 60 * 60 * 24))
   addElement("GOAL", nf.format(Math.ceil((50000000 - storedXP) / daysUntilTarget)))
}

let showXPtoNextSRBool
if (prefsSource.showXPtoNextSR == "auto" && currentSR < 151) {
   log("abc")
   prefsSource.showXPtoNextSRBool = true
} else if (prefsSource.showXPtoNextSR == "always") {
   log("def")
   prefsSource.showXPtoNextSRBool = true
} else {
   log("hij")
   prefsSource.showXPtoNextSRBool = false
}
if (showXPtoNextSRBool) {
   log("klm")
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

if (prefsSource.showXPtoMax) {
   if (currentSR >= 152) {
      let XPtoMax = nf.format(100000000 - currentXP)
      addElement("XP TO 100 MIL", XPtoMax, true)
   } else {
      let XPtoMax = nf.format(50000000 - currentXP)
      addElement("XP TO MAX", XPtoMax, true)
   }
}


/*-----------------------------------------*/
/*  Assemble Widget                        */
/*-----------------------------------------*/

if (useLog) { log("Assembling final widget...") }

widget.backgroundImage = Image.fromFile(fm.documentsDirectory() + "/" + BGImageName)

let dcImage = dc.getImage()
dcImage = widget.addImage(dcImage)
dcImage = dcImage.centerAlignImage()

Script.setWidget(widget)


if (useLog) {
   log("Done. Completed in " + ((new Date() - startDate) / 1000) + " seconds")
}
