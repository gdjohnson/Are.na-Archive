const Arena = require('are.na');
const fetch = require('node-fetch');


var allChans = [];

// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('archivePage').addEventListener('click', archiveLinks)
// })

function archiveLinks(){
    // const accessToken = document.forms['archiveNow']['code'].value
    const accessToken = '';
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
    debugger
    let sources = linkBlocks.map(chan => extractSources(chan)).filter(arr => arr.length > 0);
    debugger
    let classification = await sources.map(chan => checkArchive(chan));
    console.log(classification)
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
    debugger
    let results = await chan.map(async (source) => {
        await singleCheck(source);
    })
    debugger
    // RIGHT NOW ALL RESULTS ARE RETURNING UNDEFINED
    return results
}

// [{preserved:true, arxLink:'', originalUrl:''}]

async function singleCheck(url) {
    let obj = {};
    if (filterWaybackLinks(url)) { return ({preserved: true, arxLink: url})}
    let res = await fetch(`http://archive.org/wayback/available?url=${url}*&output=json`);
    debugger
    try { 
        res = await res.json() 
        if (res["archived_snapshots"]) { 
            obj.preserved = true;
            obj.arxLink = res.archived_snapshots.closest.url;
            obj.liveLink = url;
        } 
        else { 
            console.error("LINE 75") 
        }
    }
    // ALL THE OBJS ARE FAILING
    catch { obj = await savePage(url) }
        
    // appendToPage(obj);
    // console.log(obj)
    debugger
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
        // console.log(`LINE 92 Results: ` + res)
        // NEEDS TO CREATE OBJ FOR SUCCESSES
    }
    catch {
        // console.log(`The page at ${url} can't be archived.`)
        obj.preserved = false;
        obj.arxLink = '';
        obj.liveLink = url;
        // console.log(obj)
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