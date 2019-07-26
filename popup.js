const Arena = require('are.na');
const fetch = require('node-fetch');


var allChans = [];
var precarious = [];
var preserved = [];

function archiveLinks(accessToken){
    arena = new Arena({accessToken});
    
    let id=13854;
    fetchChans(id)
}

function fetchChans(id){
    arena.user(id).channels()
        .then(chans => {
            chans.map(chan => {
                const {id, title, contents} = chan;
                allChans.push({id, title, contents});
            })
        })
        .then(() => findLinks(allChans[6]))
        .then(linkBlocks => extractSources(linkBlocks))
        .then(sources => checkArchive(sources))
        .then(() => { console.log(precarious) })
        .catch(err => { console.error(err)})
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


function checkArchive(sources) {
    sources.forEach(source => {
        singleCheck(source);
    })
}

function singleCheck(source) {
    source = source.replace(/(^\w+:|^)\/\//, '');
    console.log("The source is " + source)
    fetch(`http://archive.org/wayback/available?url=${source}`)
        .then(data => data.json())
        .then(json => {
            console.log("THE JSON IS " + json)
            if (!json.archived_snapshots) { 
                // console.log(source + " is precarious.")
                precarious.push(source);
            } else {
                // console.log(json.archived_snapshots.closest.url + " is preserved");
                preserved.push(json.archived_snapshots.closest.url);
            }
        })
        .catch(err => console.error(err))
    }

// function savePage(data, url) {
//     fetch(`https://web.archive.org/save/${url}`).then(
//                 fetch(`http://archive.org/wayback/available?url=${url}`)).then(
//                     () => { archiveLink = data.archived_snapshots.closest.url;})
// }



archiveLinks('')

// data = {"url": "https://burnaway.org/feature/theory-in-studio-john-dewey-champion-of-art-as-experience/", "archived_snapshots": {"closest": {"status": "200", "available": true, "url": "http://web.archive.org/web/20171108134414/http://burnaway.org/feature/theory-in-studio-john-dewey-champion-of-art-as-experience/", "timestamp": "20171108134414"}}}
// data = JSON.stringify(data)
// console.log(data)
// console.log(JSON.parse(data))

