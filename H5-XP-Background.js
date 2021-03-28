// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;


let fm = FileManager.iCloud()
let start = new Date()

let resetStoredValues = false
// setting this to true will delete every entry in H5-XP-storedValues.json, but add in 1 entry, for when you run the script.


/*-----------------------------------------*/
/*  Check for a storedValues file, create  */
/*  one if needed                          */
/*-----------------------------------------*/


if (!fm.fileExists(fm.documentsDirectory() + "/H5-XP-storedValues.json") || resetStoredValues) {

    let storedValues = {
        "xp": {},
        "hours": {}
    }

    fm.writeString(fm.documentsDirectory() + "\/H5-XP-storedValues.json", JSON.stringify(storedValues, null, 4))
}

/*-----------------------------------------*/
/*  Read prefs from main script, then make */
/*  the api request                        */
/*-----------------------------------------*/

let prefs = fm.documentsDirectory() + "/H5-XP.js"

fm.downloadFileFromiCloud(prefs)
prefs = fm.readString(prefs)

// find the part of the script that is the prefs
prefs = prefs.match(/let prefs = ([\s\S][^}]*})/)[1]
// remove comments from it, then convert it to JSON object
prefs = JSON.parse(prefs.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m))


let WZReq = await haloAPIJSONRequest("https://www.haloapi.com/stats/h5/servicerecords/warzone?players=!gamertag")
let WZDuration = WZReq["Results"][0]["Result"]["WarzoneStat"]["TotalTimePlayed"]

let ArenaReq = await haloAPIJSONRequest("https://www.haloapi.com/stats/h5/servicerecords/arena?players=!gamertag")
let ArenaDuration = ArenaReq["Results"][0]["Result"]["ArenaStats"]["TotalTimePlayed"]

let currentHours = durationToHours(WZDuration) + durationToHours(ArenaDuration)


let currentXP = ArenaReqResults["Results"][0]["Result"]["Xp"]


async function haloAPIJSONRequest(url) {

    url = url.replace(/!gamertag/i, encodeURI(prefs["gamertag"]))

    request = new Request(url)
    request.headers = { "Ocp-Apim-Subscription-Key": prefs.apiKey }

    return (await request.loadJSON())

}

function durationToHours(duration) {
    let result = 0
    if (duration.includes("D")) { result += (duration.match(/[0-9.]*(?=D)/) * (24)) }
    if (duration.includes("H")) { result += (duration.match(/[0-9.]*(?=H)/) / (1)) }
    if (duration.includes("M")) { result += (duration.match(/[0-9.]*(?=M)/) / (60)) }
    if (duration.includes("S")) { result += (duration.match(/[0-9.]*(?=S)/) / (3600)) }
    return (result)
}


let storedValues = fm.documentsDirectory() + "/H5-XP-storedValues.json"
fm.downloadFileFromiCloud(storedValues)
storedValues = (JSON.parse(fm.readString(storedValues)))


/*-----------------------------------------*/
/*  Write new XP and playtime value        */
/*-----------------------------------------*/

let now = new Date()

storedValues["xp"][now] = currentXP
storedValues["hours"][now] = currentHours


/*-----------------------------------------*/
/*  Save it all to iCloud        */
/*-----------------------------------------*/


fm.writeString(fm.documentsDirectory() + "\/H5-XP-storedValues.json", JSON.stringify(storedValues, null, 4))

log("Done. Completed in " + ((new Date() - start) / 1000) + " seconds.")

Script.complete()
