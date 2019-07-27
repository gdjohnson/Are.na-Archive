const Arena = require('are.na');
const fetch = require('node-fetch');


var allChans = [];
var precarious = [];
var preserved = [];

async function archiveLinks(accessToken){
    arena = new Arena({accessToken});
    
    let id=13854;
    let results = await fetchChans(id);
    return results;
}

async function fetchChans(id){
    let chans = await arena.user(id).channels()
    chans.map(chan => {
                const {id, title, contents} = chan;
                allChans.push({id, title, contents});
            })
    let linkBlocks = findLinks(allChans[4])
    let sources = extractSources(linkBlocks)
    let classification = await checkArchive(sources))

    return classification;
}

function findLinks(chan){
    return chan.contents.map(block => {
        if (block.class = 'Link') { return block; }
    })
}

function extractSources(linkBlocks) {
    let sources = linkBlocks.map(block => {
        if (block.source) {
            return block.source.url;
        }
    })

    return sources.filter( Boolean )
}

async function checkArchive(sources) {
    let results = await sources.map(source => {
        singleCheck(source);
    })

    return results
}

// [{preserved:true, arxLink:'', originalUrl:''}]

async function singleCheck(url) {
    let obj = {};
    let res = await fetch(`http://archive.org/wayback/available?url=${url}*&output=json`);
    res.json()
        .then((res) => {
            if (res["archived_snapshots"]) { 
                obj[preserved] = true;
                obj[arxLink] = res.archived_snapshots.closest.url;
            } 
        }, () => { 
            savePage(url);
        })
        .then(()=>{
            console.log(`Missing links include: `); 
            console.log(precarious);
            console.log(`Preserved links include: `);
            console.log(preserved);
        })
        .then(())
}

function savePage(url) {
    console.log("SAVING PAGE NOW")
    return fetch(`https://web.archive.org/save/${url}`)
        .then(response => response.json())
        .catch(() => console.log(`The page at ${url} can't be archived.`))
        .then(() => { precarious.push(url) })
}


archiveLinks('').then(console.log("PRESERVED FINAL " + preserved))
