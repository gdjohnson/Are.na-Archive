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

// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('archivePage').addEventListener('click', archiveLinks)
// })

async function archiveLinks(){
    // const accessToken = document.forms['archiveNow']['code'].value
    const {arenaUserId, arenaToken} = config;
    const results = await fetchChans(arenaUserId, arenaToken);
    console.log(results["resource"])
    displayResults(results)
}

async function fetchChans(id, token){
    const arena = new Arena({token});
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

function createObject(boolean, arxLink, liveLink){
    // console.log(arxLink + ' is successfully saved! \n')
    return ({preserved: boolean, arxLink, liveLink})
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

archiveLinks()