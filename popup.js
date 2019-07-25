document.addEventListener('DOMContentLoaded', function() {
    var archiveButton = document.getElementById('archivePage');
    archiveButton.addEventListener('click', archivePage)
});

var archiveLink;

function archivePage() {
    const url = window.location.href;

    fetch(`http://archive.org/wayback/available?url=${url}`).then(data => {
        if (!data.archived_snapshots.closest) { 
            savePage(data, url)
        } else {
            archiveLink = archived_snapshots.closest.url;
        }
    }).catch(err => Console.error(err))

}

function savePage(data, url) {
    fetch(`https://web.archive.org/save/${url}`).then(
                fetch(`http://archive.org/wayback/available?url=${url}`)).then(
                    () => { archiveLink = data.archived_snapshots.closest.url;})
}