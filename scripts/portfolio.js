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
    createArtGrids(art);
}

function createArtGrids(art) {
    art.forEach((drawing) => {
        const yearContainer = document.getElementById(drawing.year);
        const imageContainer = document.createElement('div');
        yearContainer.appendChild(imageContainer);

        const image = document.createElement('img');
        image.src = drawing.url || drawing.pages[0];

        if (drawing.pages) {
            const imageOverlay = document.createElement('img');
            imageOverlay.src = '../images/comic-icon.webp'
            imageOverlay.classList.add('comic-icon');
            imageContainer.appendChild(imageOverlay);
        }

        image.addEventListener('click', (e) => {
            openFullImage(image, drawing);
        })

        image.oncontextmenu = function (event) {
            event.preventDefault();
        };
        image.draggable = false;

        imageContainer.appendChild(image);
    })
}

const dialog = document.querySelector('.art-popup');
const imageInfoContainer = dialog.querySelector('div');
const imageWrapper = document.querySelector('.image-wrapper');

dialog.oncontextmenu = function (e) {
    e.preventDefault();
};
dialog.draggable = false;

const closeDialogBtn = document.getElementById('dialogClose');
const nextImageBtn = document.getElementById('dialogRight');
const previousImageBtn = document.getElementById('dialogLeft');

const dateCreated = imageInfoContainer.querySelector('ul').firstElementChild;
const seriesName = imageInfoContainer.querySelector('ul').lastElementChild;

closeDialogBtn.addEventListener('click', () => dialog.close());

document.body.addEventListener('mousedown', (e) => {
    if (!imageInfoContainer.contains(e.target)) {
        dialog.close();
    }
})

function openFullImage(image, drawing) {
    const fullImage = image.cloneNode(true);
    imageWrapper.innerHTML = '';
    dateCreated.innerHTML = `<span>Created on: </span>
        ${convertMonthToString(drawing.month)} ${drawing.day}, ${drawing.year}`
    seriesName.innerHTML = `<span>Series: </span>${drawing.series}`;

    dialog.showModal();
    imageWrapper.appendChild(fullImage);
}

function convertMonthToString(month) {
    if (month === '01') month = 'January';
    else if (month === '02') month = 'February';
    else if (month === '03') month = 'March';
    else if(month === '04') month = 'April';
    else if(month === '05') month = 'May';
    else if(month === '06') month = 'June';
    else if(month === '07') month = 'July';
    else if(month === '08') month = 'August';
    else if(month === '09') month = 'September';
    else if(month === '10') month = 'October';
    else if(month === '11') month = 'November';
    else month = 'December';
    return month;
}

createTimeline();