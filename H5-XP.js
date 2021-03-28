// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: sync-alt;

/*

Detailed setup instructions and more info avalible at https://github.com/sac396/H5-XP-iOS-Widget.

*/

/*-----------------------------------------*/
/*  Initial Script Setup                   */
/*-----------------------------------------*/

let prefs = {

	"apiKey": "",
	"gamertag": "",
	// used to determine goal
	"targetCompletionDate": "November 20, 2021",

	// visit iosfonts.com to see more fonts
	"font": "DamascusBold",
	"fontSize": 18,
	// adjust heightOffset if the lines of text are too close together or too far apart.
	"heightOffset": 8,

	"useBackgroundImage": true,

	"showSR": true,
	"showTotalXP": true,
	"showTodaysXP": true,
	"showXPtoMax": true,
	"showLifetimeRate": true,
	"showTodaysGoal": true,
	// accepts "auto", true, or false.
	"showXPtoNextSR": "auto",

	"showCustomAverageRate": true,
	"customAverageRateDays": 7,

	"showCustomDaysGains": true,
	"customDaysGainsDays": 7,

	"showArmor": true,
	"showEmblem": true,

	// the "hard cap" for XP is actually 100,000,000; but there is no SR 153. This overrides the script to set goals and everything else based on this 100 mil scale. If you are already at or above 50 mil, this will be true no matter what.
	"use100MilInstead": false,

	"updateStoredValuesOnEachRun": true,

	"checkForUpdates": true,

	// resets the storedValues.json file. This cannot be undone
	"resetStoredValues": false,

	"useLog": true

}


/*-----------------------------------------*/
/*  Initial Script Setup                   */
/*-----------------------------------------*/


let startDate
if (prefs.useLog) { startDate = new Date() }

let currentVer = 1.5
// Used for checking for updates. pls don't change :-)

let xpAtDayStart
let fm = FileManager.iCloud()


let httpRequestDependecies = {
	"emblem": [prefs.showEmblem],
	"armor": [prefs.showArmor],
	"sr": [prefs.showXPtoMax, prefs.showSR, prefs.showXPtoNextSR],
	"xp": [prefs.showTotalXP, prefs.showTodaysXP, prefs.showXPtoMax, prefs.showXPtoNextSR],
	"storedXP": [prefs.showTodaysGoal, prefs.showTodaysXP],
	"timePlayed": [prefs.showLifetimeRate, prefs.showCustomAverageRate]
}

if (fm.fileExists(fm.documentsDirectory() + "/H5-XP-Prefs.json")) { log("🟠 There is a \"H5-XP-Prefs.json\" file located in /iCloud/Scriptable/. This file is not needed as of H5-XP version 2.0 and can be removed.") }
if (fm.bookmarkExists("H5-XP-StoredXP.json")) { log("🟠 There is a Scriptable bookmark named \"H5-XP-StoredXP.json\". This is not needed as of H5-XP version 2.0 and can be removed. There may also be a \"H5-XP-StoredXP.json\" file in /iCloud/Shortcuts/. This is no longer needed either and can be removed.") }

/*-----------------------------------------*/
/*  Functions                              */
/*-----------------------------------------*/


// create JSON element for the http results 
let resultsList = {}

// this function also makes as few API calls as possible, by saving each resposne to resultsList. If you call this function for the same URL twice, it will go back to the first API call you made.
async function smartHTTPRequest(url, prefsValue, isImage) {

	if (prefsValue === undefined) { prefsValue = true }

	// reformat gamertag and url
	let gamertag = encodeURI(prefs["gamertag"])
	url = url.replace(/!gamertag/i, gamertag)

	// check if we have actually made a request to this url before
	if (resultsList.hasOwnProperty(url)) {

		if (prefs.useLog) { log("🟢 retrieving stored response for " + url) }
		return (resultsList[url])

	} else if (prefsValue) {

		if (prefs.useLog) { log("🟢 fetching " + url) }

		// contact server
		request = new Request(url)

		// check if it's the halo API and provide the api key if it is
		if (url.includes("haloapi.com")) { request.headers = { "Ocp-Apim-Subscription-Key": prefs.apiKey } }

		// determine how to parse response
		let response
		if (isImage) {
			response = await request.loadImage()
		} else {
			response = await request.loadJSON()
		}

		// save this response to an array so we know we don't have to make redundant requests later
		resultsList[url] = response
		return (response)

	}
}


// this is important for finding how many hours you have in arena and warzone
function durationToHours(duration) {
	let result = 0
	if (duration.includes("D")) { result += (duration.match(/[0-9.]*(?=D)/) * (24)) }
	if (duration.includes("H")) { result += (duration.match(/[0-9.]*(?=H)/) / (1)) }
	if (duration.includes("M")) { result += (duration.match(/[0-9.]*(?=M)/) / (60)) }
	if (duration.includes("S")) { result += (duration.match(/[0-9.]*(?=S)/) / (3600)) }
	return (result)
}


/*-----------------------------------------*/
/*  Check if script needs to be set up     */
/*-----------------------------------------*/


if (!prefs.apiKey) {

	if (prefs.useLog) { log("🔴 No API Key Found") }

	apiKeyAlert = new Alert()
	apiKeyAlert.title = "No API Key Found"
	apiKeyAlert.message = "Head to developer.haloapi.com to get a key. Copy it and paste it in the \"apiKey\" part of the prefs. Then come back, and run the script again."
	apiKeyAlert.addAction("Go to developer.haloapi.com")
	apiKeyAlert.addAction("Cancel")
	let alertIndex = await apiKeyAlert.presentAlert()

	if (alertIndex == 0) {
		Safari.open("https://developer.haloapi.com/signin?ReturnUrl=%2Fproducts%2F560af1e42109182040fb56fc")
		throw new Error("Script aborted")
	} else {
		throw new Error("Script aborted")
	}

} else {
	if (prefs.useLog) { log("🟢 Running with API Key \"" + prefs.apiKey + "\"") }
}

if (!prefs.gamertag) {

	if (prefs.useLog) { log("🔴 No Gamertag Found") }

	gamertagAlert = new Alert()
	gamertagAlert.title = "No Gamertag Found"
	gamertagAlert.message = "Enter it in the \"gamertag\" field in the prefs section at the top."
	gamertagAlert.addAction("Cancel")
	let alertIndex = await gamertagAlert.presentAlert()

	if (alertIndex == 0) { throw new Error("Script aborted") }

} else {
	if (prefs.useLog) { log("🟢 Running with gamertag \"" + prefs.gamertag + "\"") }
}

if (!prefs.targetCompletionDate) {

	if (prefs.useLog) { log("🔴 No Target Completion Date Set") }

	targetCompletionDateAlert = new Alert()
	targetCompletionDateAlert.title = "No Target Completion Date Set"
	targetCompletionDateAlert.message = "This is used to determine the Goal, how much XP you need per day. Enter it below then tap Return on your keyboard."
	targetCompletionDateAlert.addAction("Cancel")
	let alertIndex = await targetCompletionDateAlert.presentAlert()

	if (alertIndex == 0) { throw new Error("Script aborted") }

} else {
	if (prefs.useLog) { log("🟢 Running with Target Completion Date \"" + prefs.targetCompletionDate + "\"") }
}


if (prefs.useBackgroundImage && !fm.fileExists(fm.documentsDirectory() + "/H5-XP-bgImage.png")) {

	if (prefs.useLog) { log("🟡 BG Image not found. Downloading and saving to iCloud...") }

	let img = await new Request("https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/H5-XP-bgImage.png").loadImage()
	fm.writeImage(fm.documentsDirectory() + "/H5-XP-bgImage.png", img)
}


/*-----------------------------------------*/
/*  Check for Updates                   */
/*-----------------------------------------*/


if (prefs.checkForUpdates) {
	let newestVer = await new Request("https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/version.json").loadJSON()
	if (newestVer[0] > currentVer) {
		log("🟡 Version " + newestVer[0] + " of H5-XP avalible at https://raw.githubusercontent.com/sac396/H5-XP-iOS-Widget/main/H5-XP.js. You have version " + currentVer)
	} else {
		log("🟢 H5-XP is up to date. You have version " + currentVer)
	}
}


/*-----------------------------------------*/
/*  Come up with the values to display     */
/*	and retrieve storedValues              */
/*-----------------------------------------*/


// retrieve storedValues
let storedValues = fm.documentsDirectory() + "/H5-XP-storedValues.json"
fm.downloadFileFromiCloud(storedValues)
storedValues = (JSON.parse(fm.readString(storedValues)))


// write new values to storedValues
if (prefs.updateStoredValuesOnEachRun) {

	if (!fm.fileExists(fm.documentsDirectory() + "/H5-XP-storedValues.json") || prefs["resetStoredValues"]) {
		log("🟡 Creating new H5-XP-storedValues.json file...")
		let storedValues = { "xp": {}, "hours": {} }
		fm.writeString(fm.documentsDirectory() + "\/H5-XP-storedValues.json", JSON.stringify(storedValues, null, 4))
	}

	let currentXP = (await smartHTTPRequest("https://www.haloapi.com/stats/h5/servicerecords/arena?players=!gamertag"))["Results"][0]["Result"]["Xp"]

	let WZDuration = (await smartHTTPRequest("https://www.haloapi.com/stats/h5/servicerecords/warzone?players=!gamertag"))["Results"][0]["Result"]["WarzoneStat"]["TotalTimePlayed"]
	let ArenaDuration = (await smartHTTPRequest("https://www.haloapi.com/stats/h5/servicerecords/arena?players=!gamertag"))["Results"][0]["Result"]["ArenaStats"]["TotalTimePlayed"]
	let currentHours = durationToHours(WZDuration) + durationToHours(ArenaDuration)

	let now = new Date()

	storedValues["xp"][now] = currentXP
	storedValues["hours"][now] = currentHours

	fm.writeString(fm.documentsDirectory() + "\/H5-XP-storedValues.json", JSON.stringify(storedValues, null, 4))
}


let storedXPs = storedValues["xp"]
let storedHours = storedValues["hours"]

let dates = Object.keys(storedXPs)
let datesString = dates.toString()


if (httpRequestDependecies["storedXP"]) {
	// get the XP you started with today
	let bottomMostDate = (new Date(dates[dates.length - 1])).toDateString()
	let key = datesString.match(new RegExp(bottomMostDate + "[^,]*"))
	xpAtDayStart = storedXPs[key]
}

let customAverageXPRate
if (prefs.showCustomAverageRate) {

	let customAverageXPArray = []
	let customAverageHoursArray = []
	let failedMatches = 0

	let bottomMostDateTime = new Date(dates[dates.length - 1])

	// generate array of xp
	for (i = 0; i < prefs.customAverageRateDays; i++) {

		// not sure why i need this, but for some reason the script doesn't work without it
		bottomMostDateTime = new Date(dates[dates.length - 1])

		let key = bottomMostDateTime.setDate(bottomMostDateTime.getDate() - i)
		key = datesString.match(new RegExp(new Date(key).toDateString() + "[^,]*"))

		if (storedXPs[key] == undefined || storedHours[key] == undefined || storedHours[key] == null || storedHours[key] == null) {
			failedMatches += 1
		} else {
			customAverageXPArray.push(storedXPs[key])
			customAverageHoursArray.push(storedHours[key])
		}
	}

	if (!failedMatches == 0) { log("🟠 The number set for \"customAverageRateDays\" is " + prefs.customAverageRateDays + " days, but there are only " + (prefs.customAverageRateDays - failedMatches) + " data points to include in this calculation.") }

	// finally get the average rate for the given time period
	customAverageXPRate = (Math.max(...customAverageXPArray) - Math.min(...customAverageXPArray)) / (Math.max(...customAverageHoursArray) - Math.min(...customAverageHoursArray))
}

let customDaysGains
if (prefs.showCustomDaysGains) {

	let customAverageXPArray = []
	let failedMatches = 0

	let bottomMostDateTime = new Date(dates[dates.length - 1])

	// generate array of xp
	for (i = 0; i < prefs.customDaysGainsDays; i++) {

		// not sure why i need this, but for some reason the script doesn't work without it
		bottomMostDateTime = new Date(dates[dates.length - 1])

		let key = bottomMostDateTime.setDate(bottomMostDateTime.getDate() - i)
		key = datesString.match(new RegExp(new Date(key).toDateString() + "[^,]*"))

		if (storedXPs[key] == undefined || storedHours[key] == undefined || storedHours[key] == null || storedHours[key] == null) {
			failedMatches += 1
		} else {
			customAverageXPArray.push(storedXPs[key])
		}
	}

	if (!failedMatches == 0) { log("🟠 The number set for \"customDaysGainsDays\" is " + prefs.customDaysGainsDays + " days, but there are only " + (prefs.customDaysGainsDays - failedMatches) + " data points to include in this calculation.") }

	// finally get the average rate for the given time period
	customDaysGains = Math.max(...customAverageXPArray) - Math.min(...customAverageXPArray)
}

/*-----------------------------------------*/
/*  HTTP Requests                          */
/*-----------------------------------------*/


let emblemImage = (await smartHTTPRequest("https://www.haloapi.com/profile/h5/profiles/!gamertag/emblem", httpRequestDependecies["armor"], true))

let armorImage = (await smartHTTPRequest("https://www.haloapi.com/profile/h5/profiles/!gamertag/spartan", httpRequestDependecies["emblem"], true))

let totalXP = (await smartHTTPRequest("https://www.haloapi.com/stats/h5/servicerecords/arena?players=!gamertag", httpRequestDependecies["xp"]))["Results"][0]["Result"]["Xp"]

let currentSR = (await smartHTTPRequest("https://www.haloapi.com/stats/h5/servicerecords/arena?players=!gamertag", httpRequestDependecies["sr"]))["Results"][0]["Result"]["SpartanRank"]

let WZDuration = (await smartHTTPRequest("https://www.haloapi.com/stats/h5/servicerecords/warzone?players=!gamertag", httpRequestDependecies["timePlayed"]))["Results"][0]["Result"]["WarzoneStat"]["TotalTimePlayed"]

let ArenaDuration = (await smartHTTPRequest("https://www.haloapi.com/stats/h5/servicerecords/arena?players=!gamertag", httpRequestDependecies["timePlayed"]))["Results"][0]["Result"]["ArenaStats"]["TotalTimePlayed"]


/*-----------------------------------------*/
/*  Set Up Draw Contexts                   */
/*-----------------------------------------*/

if (prefs.useLog) { log("🟢 Setting up widget...") }


let widget = new ListWidget()
widget.setPadding(0, 0, 0, 0)


let dc = new DrawContext()
dc.opaque = false
dc.size = new Size(675, 275)


font = new Font(prefs.font, prefs.fontSize)
dc.setFont(font)
dc.setTextColor(new Color("#ffffff"))


let leftOffset = 95
let topOffset = 16 + prefs.heightOffset
let rightOffset = 452
let rectHeight = 30


let elementIndex = 0
function addTextElement(left, right, isFooter) {
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
	if (prefs.useLog) { log("🟢 Successfully drew \"" + left + " : " + right + "\"") }
	elementIndex += 1
}


/*-----------------------------------------*/
/*  Draw Things                            */
/*-----------------------------------------*/


// Right side : Armor + Emblem

if (prefs.showEmblem) {
	let emblemImageScale = .75
	dc.drawImageInRect(emblemImage, new Rect(455, 30, 256 * emblemImageScale, 256 * emblemImageScale))
	if (prefs.useLog) { log("🟢 Successfully drew emblem image") }
}

if (prefs.showArmor) {
	let armorImageScale = .4
	dc.drawImageInRect(armorImage, new Rect(510, 50, 512 * armorImageScale, 672 * armorImageScale))
	if (prefs.useLog) { log("🟢 Successfully drew armor image") }
}


// Left side : Stats


let nf = new Intl.NumberFormat


if (prefs.showSR) { addTextElement("SR " + currentSR, "") }

if (prefs.showTotalXP) { addTextElement("TOTAL", nf.format(totalXP) + " (" + Math.round(totalXP / 50000) / 10 + "%)") }

if (prefs.showTodaysXP) { addTextElement("TODAY", nf.format(totalXP - xpAtDayStart)) }

if (prefs.showLifetimeRate) { addTextElement("LIFETIME AVERAGE", nf.format(Math.round(totalXP / (durationToHours(WZDuration) + durationToHours(ArenaDuration)))) + " XP/HR") }

if (prefs.showCustomAverageRate) { addTextElement(prefs.customAverageRateDays + " DAY AVERAGE", nf.format(Math.round(customAverageXPRate)) + " XP/HR") }

if (prefs.showCustomDaysGains) { addTextElement("GAINS LAST " + prefs.customDaysGainsDays + " DAYS", nf.format(Math.round(customDaysGains))) }


if (prefs.showTodaysGoal) {
	let daysUntilTarget = Math.ceil((new Date(prefs.targetCompletionDate) - new Date()) / (1000 * 60 * 60 * 24))
	if (xpAtDayStart >= 50000000 || prefs.use100MilInstead) {
		addTextElement("GOAL", nf.format(Math.ceil((100000000 - xpAtDayStart) / daysUntilTarget)))
	} else {
		addTextElement("GOAL", nf.format(Math.ceil((50000000 - xpAtDayStart) / daysUntilTarget)))
	}
}


let showXPtoNextSRBool
if (prefs["showXPtoNextSR"] == "auto") {
	if (currentSR <= 151) { showXPtoNextSRBool = true }
	else { showXPtoNextSRBool = false }
} else { showXPtoNextSRBool = prefs["showXPtoNextSR"] }

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
	let XPtoNextSR = XPperSR[currentSR] - totalXP
	addTextElement("XP TO SR " + (currentSR += 1), nf.format(XPtoNextSR))
}

if (prefs.showXPtoMax) {
	if (currentSR >= 152) { addTextElement("XP TO 100 MIL", nf.format(100000000 - totalXP), true) }
	else { addTextElement("XP SR 152", nf.format(50000000 - totalXP), true) }
}


/*-----------------------------------------*/
/*  Assemble Widget                        */
/*-----------------------------------------*/

if (prefs.useLog) { log("🟢 Assembling final widget...") }


widget.backgroundImage = Image.fromFile(fm.documentsDirectory() + "/H5-XP-bgImage.png")


let dcImage = dc.getImage()
dcImage = widget.addImage(dcImage)
dcImage = dcImage.centerAlignImage()


Script.setWidget(widget)


if (prefs.useLog) { log("🟢 Done. Completed in " + ((new Date() - startDate) / 1000) + " seconds.") }
