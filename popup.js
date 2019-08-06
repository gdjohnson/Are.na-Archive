const Arena = require('are.na');
const fetch = require('node-fetch');
const config = require('./config.json');

// FLOW
// archiveLinks() kicks off with access and userId, invokes fetchChans
// fetchChans() takes userId, extracts chanId/title/contents, isolates link blocks with findLinks(chan)
// fetchChans() then invokes extractSources(chan) to get the URLs from each link block
// fetchChans() then invokes async checkArchive(chan), which sends links one at a time to fetch Archive URL with 
//      singleCheck(url) 


// 503 ISSUE
// I can run the same fetch on the same URL ten times, and it'll 503 nine of the times but work once, 
// or another URL 200s and returns JSON just fine nine times out of ten, but every once and a while 503s? 
// Like it's not just random, there's a clear pattern of some links' Archive availability resource 503ing more often than others
// I should probably just have a function that recursively tries 503 responses until they succeed, w/ upper limit like 20 fetches


var allChans = [];

// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('archivePage').addEventListener('click', archiveLinks)
// })

function archiveLinks(){
    // const accessToken = document.forms['archiveNow']['code'].value
    const accessToken = config.arenaToken;
    arena = new Arena({accessToken});
    
    let id=13854;
    fetchChans(id)
}

async function fetchChans(id){
    let chans = await arena.user(id).channels()
    chans = chans.map(chan => {
                const {id, title, contents} = chan;
                return ({id, title, contents});
            })
    let linkBlocks = chans.map(chan => findLinks(chan)).filter(arr => arr.length > 0);
    let sources = linkBlocks.map(chan => extractSources(chan)).filter(arr => arr.length > 0);
    let classification = await Promise.all(sources.map(chan => checkArchive(chan)));
    // console.log(classification)
    return classification;
}

function findLinks(chan){
    return chan.contents.map(block => {
        if (block.class = 'Link') { return block; }
    })
}

function extractSources(chan) {
    let sources = chan.map(block => {
        if (block.source) {
            return block.source.url;
        }
    })

    return sources.filter(Boolean)        
}

async function checkArchive(chan) {
    let results = await Promise.all(chan.map(source => singleCheck(source)))
    // RIGHT NOW ALL RESULTS ARE RETURNING UNDEFINED
    return results
}

// [{preserved:true, arxLink:'', originalUrl:''}]

async function singleCheck(url) {
    const options = { headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json', }}

    let json; let tries=0; let obj={};
    try {
        // Try fetch to 10 times to sidestep 503 issue
        while(!json && tries < 10){
            let res = await fetch(`http://archive.org/wayback/available?url=${url}`, options)
                        .catch(err => { console.log(err) });
            try {
                json = await res.json() 
            } catch {
                tries++
            }
        }
        
        obj.preserved = true;
        obj.arxLink = json.archived_snapshots.closest.url;
        obj.liveLink = url;
        console.log(obj.arxLink + ' is successfully saved! \n')
        
    } catch {
        // obj = await savePage(url)
    }

    return obj;
}

function filterWaybackLinks(str) {
    if (str.includes('web.archive.org')) {
		return true;
    }
    return false;
} 

async function savePage(url) {
    let obj = {};
    
    let res;
    try {
        // console.log(`Saving ${url} now.`)
        res = await fetch(`https://web.archive.org/save/${url}`);
        res = await res.json();
        console.log(`LINE 92 Results: `)
        console.log(res)
        // NEEDS TO CREATE OBJ FOR SUCCESSES
    }
    catch {
        console.log(`The page at ${url} can't be archived. \n`)
        obj.preserved = false;
        obj.arxLink = '';
        obj.liveLink = url;
    }
    
    return obj;
}

function appendToPage(obj) {
    let graf = document.createElement('p');
    graf.innerText =    `Preserved: ${obj.preserved}   
                         Archival link: ${obj.arxLink}   
                         Live link: ${obj.liveLink}`
    document.querySelector('archiveNow').append(graf);
}

archiveLinks()