**Current State**

Allows user to check which URIs are already backed up (or can be automatically backed up by) the Wayback Machine. URIs which are not available on the Wayback Machine (e.g. `robots.txt` cases) are logged with their channel name so they can be manually backed up.

Right now only works in terminal, and for the first batch of Are.na fetched user chans. Set up a `config.json` file with keys `arenaToken` and `arenaUserId` to run.


**FLOW**

`archiveLinks()` kicks off with access and userId from config file, invokes `fetchChans()`

`fetchChans()` hosts bulk of function invocation
* extracts chanId/title/contents
* isolates link blocks with `findLinks(chan)`
* invokes `extractSources(chan)` to get the URIs from each link block
* `fetchChans()` then invokes async `checkArchive(chan)`, which fetches one at a time w/ `singleCheck(uri)`

objects are formatted w/ props `'title'` (of chan) and `'resource'`
* `'resource'` contains obj w/ props `'preserved'` (Boolean), `'arxLink'` (Wayback URI), `'liveLink'` (live URI)


**Wayback API 503 ISSUE**

I can run the same fetch on the same URI ten times, and it'll 503 nine of the times and work once. Why? Or another URI 200s and returns JSON just fine nine times out of ten, but every once and a while 503s. There's some pattern of some links' Wayback availability resource 503ing more often than others. Perhaps different pages are hosted on different backends w/ different levels of availability?

Current fix: while loop trying the fetch up to a dozen times until success.

May be some kind of rate limiting issue? Though I'm a little surprised the iterated fetching works, in that case. 

Even more strangely, I don't even get a normal response back with a 503 status code that I can nicely process; the response 200s; I get a text body in HTML that has the words "503 Service Temporarily Unavailable." So I have to basically monitor failures of response.json() -- i.e. the HTML starts with a `<` and errors out the promise.
