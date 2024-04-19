const container = document.querySelector('#portfolioContainer');

async function getArtData() {
    const request = new Request('../art.json');
    const response = await fetch(request);
    const data = await response.json();

    return data;
}

async function createTimeline() {
    let art = await getArtData();
    art.forEach((drawing) => {
        if (!document.getElementById(drawing.year)) {
            const yearContainer = document.createElement('div');
            yearContainer.id = drawing.year;
            yearContainer.innerHTML = `<h2>${drawing.year}</h2>`;
            container.appendChild(yearContainer);
        }
    })
}

createTimeline();