**FLOW**

archiveLinks() kicks off with access and userId from config file, invokes fetchChans()

fetchChans() extracts chanId/title/contents, isolates link blocks with findLinks(chan)

    * invokes extractSources(chan) to get the URIs from each link block

    * fetchChans() then invokes async checkArchive(chan), which fetches one at a time w/ singleCheck(uri)

objects are formatted w/ props 'title' (of chan) and 'resource'

    *'resource' contains obj w/ props 'preserved' (Boolean), 'arxLink' (Wayback URI), 'liveLink' (URI)



**Wayback API 503 ISSUE**

I can run the same fetch on the same URI ten times, and it'll 503 nine of the times and work once. Why? Or another URI 200s and returns JSON just fine nine times out of ten, but every once and a while 503s. There's some pattern of some links' Wayback availability resource 503ing more often than others. Current fix: while loop trying the fetch up to a dozen times until success.

May be some kind of rate limiting? Though I'm a little surprised the iterated fetching works, in that case. 

Even more strangely, I don't even get a normal response back with a 503 status code that I can nicely process; the response 200s; I get a text body in HTML that has the words "503 Service Temporarily Unavailable." So I have to basically monitor failures of response.json() -- i.e. the HTML starts with a `<` and errors out the promise.


