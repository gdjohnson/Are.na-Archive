const fetch = require('node-fetch');
const wayback = require('wayback-machine');



URLs = ['https://www.are.na/blog/sarah-hamerman', 'https://charlottelennox.livejournal.com/887.html', 'http://slatestarcodex.com/2016/07/25/how-the-west-was-won/']

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
                console.log('trying')
                json = await res.json() 
            } catch {
                console.log('catching')
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

    
    

//     // ALL THE OBJS ARE FAILING
//     
        
//     // appendToPage(obj);
//     // console.log(obj)
//     debugger
//     return obj;


URLs.forEach(URL => { singleCheck(URL) })

// URLs.forEach(url => { 
//     wayback.getClosest(url, function(err, closest) {
//         if (err) {
//         console.error(err);
//         return;
//         }
    
//         console.log('The closest snapshot for <%s>:', url);
//         console.log(closest);
//     });
// })


