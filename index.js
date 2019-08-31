const Arena = require('are.na');
const fetch = require('node-fetch');
const config = require('./config.json');

const options = { 
    mode: 'no-cors',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded!')
    document.getElementById('archivePage').addEventListener('click', requestAuth)
    authenticateUser();
})

function authenticateUser(){
    token = getToken()
    if (token) {
        requestAccess(token)
    }
}

function getToken() {
	//substring(1) to remove the '#'
	hash = parseParms(document.location.hash.substring(1));
	return hash.access_token;
}

function requestAuth(){
    const {appId, localCallback} = config;
    window.location = `http://dev.are.na/oauth/authorize?client_id=${appId}&redirect_uri=${localCallback}&response_type=code`
}

function requestAccess(token){
    const {appId, appSecret, localCallback} = config;
    const url = `https://dev.are.na/oauth/token?client_id=${appId}&client_secret=${appSecret}&code=${token}&grant_type=authorization_code&redirect_uri=${localCallback}`
    fetch(url, {method: 'POST'})
}

function parseParms(str) {
	var pieces = str.split("&"), data = {}, i, parts;
	// process each query pair
	for (i = 0; i < pieces.length; i++) {
		parts = pieces[i].split("=");
		if (parts.length < 2) {
			parts.push("");
		}
		data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	}
	return data;
}

async function archiveLinks(){
    // const accessToken = document.forms['archiveNow']['code'].value
    const {arenaUserId, arenaToken} = config;
    const results = await fetchChans(arenaUserId, arenaToken).catch(err => { console.error(err)});
    displayResults(results)
}

async function fetchChans(id, accessToken){
    const arena = new Arena({accessToken});
    let chans = await arena.user(id).channels()
    chans = chans.map(chan => {
                const {id, title, contents} = chan;
                return ({id, title, contents});
            })
    let linkBlocks = chans.map(chan => findLinks(chan)).filter(arr => arr.length > 0);
    let sources = linkBlocks.map(chan => extractSources(chan)).filter(arr => arr.length > 0);
    let classification = await Promise.all(sources.map(chan => checkArchive(chan)));
    return classification;
}

function findLinks(chan){
    const { title } = chan;
    return chan.contents.map(resource => {
        if (resource.class = 'Link') return {title, resource}
    })
}

function extractSources(chan) {
    const { title } = chan[0];
    let sources = chan.map(block => {
        if (block["resource"].source) {
            return {title, "resource": block["resource"].source.url};
        }
    })
    return sources.filter(Boolean)        
}

async function checkArchive(chan) {
    const { title } = chan[0];
    let results = await Promise.all(chan.map(async source => {
        let resource = await singleCheck(source["resource"]);
        return ({ title, resource})
    }))
    return results
}

async function singleCheck(url) {
    if (url.includes('web.archive.org')) {
        createObject(true, url, false)
    }

    let json; let tries=0;
    let object = await async function (){
        try {
            // Try fetch up to 12 times to sidestep 503 issue
            while(!json && tries < 12){
                let res = await fetch(`http://archive.org/wayback/available?url=${url}`, options)
                            .catch(err => { console.log(err) });
                try {
                    json = await res.json() 
                } catch {
                    tries++
                }
            }    
            const arxLink = await json.archived_snapshots.closest.url;
            return createObject(true, arxLink, url) 
        } catch {
            let result = await savePage(url)
            return result;
        }
    }()

    return object;
}

async function savePage(url) {    
    let res;
    let object = await async function (){
        try {
            // console.log(`Saving ${url} now.`)
            res = await fetch(`https://web.archive.org/save/${url}`, options);
            json = await res.json();
            const arxLink = json.archived_snapshots.closest.url;
            return createObject(true, arxLink, url)
        }
        catch {
            // console.log(`The page at ${url} can't be archived. \n`)
            return createObject(false, '', url)
        }
    }()
    return object;
}

function createObject(preserved, arxLink, liveLink){
    return ({preserved, arxLink, liveLink})
}

function displayResults(results) {
    for(let i=0; i<results.length; i++){
        for(let j=0; j<results[i].length; j++){
            const { resource, title } = results[i][j];
            
            if(resource.preserved === false){
                const { liveLink } = resource;
                console.log(`The resource ${liveLink} from the channel "${title}" cannot be backed up. \n`)
            }
        }
    }
    console.log("Consider backing these resources up manually and uploading them to the channel.")
}

function appendToPage(obj) {
    let graf = document.createElement('p');
    graf.innerText =    `Preserved: ${obj.preserved}   
                         Archival link: ${obj.arxLink}   
                         Live link: ${obj.liveLink}`
    document.querySelector('archiveNow').append(graf);
}