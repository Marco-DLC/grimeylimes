const mainContentContainer = document.querySelector('#portfolioContainer');

async function getArtData() {
    const request = new Request('../art.json');
    const response = await fetch(request);
    const data = await response.json();

    return data;
}

async function createTimeline() {
    let artObjectArray = await getArtData();
    artObjectArray.forEach((artObj) => {
        if (!document.getElementById(artObj.year)) {
            const yearCreatedContainer = document.createElement('div');
            yearCreatedContainer.id = artObj.year;
            yearCreatedContainer.classList.add('year-container');
            yearCreatedContainer.innerHTML = `<h2>${artObj.year}</h2>`;
            mainContentContainer.appendChild(yearCreatedContainer);
        }
    })
    createArtGrids(artObjectArray);
}

function createArtGrids(artObjectArray) {
    artObjectArray.forEach((artObj) => {
        const yearCreatedContainer = document.getElementById(artObj.year);
        const artImage = document.createElement('img');
        artImage.src = artObj.url || artObj.pages[0]; // If artObj is a collection of images (comic),
        // uses the first image of the comic, since the 'pages' property is an array of the comic's urls only existent for artObjs that are comics.
        artImage.oncontextmenu = function (event) {
            event.preventDefault();
        };
        artImage.draggable = false;
        artImage.addEventListener('click', () => {
            openModal(artObj);
        });

        if (artObj.pages) {
            artImage.classList.add('comic-art-image');
            yearCreatedContainer.appendChild(createComicContainer(artImage, artObj));
        } else {
            yearCreatedContainer.appendChild(artImage);
        }
    })
}

function createComicContainer(artImage, artObj) {
    const comicContainer = document.createElement('div');
    comicContainer.classList.add('comic-container');

    const comicIconContainer = document.createElement('div');
    comicIconContainer.classList.add('comic-icon-container');

    const comicLabel = document.createElement('span');
    comicLabel.textContent = `Comic: ${artObj.pages.length} pages`;
    comicIconContainer.appendChild(comicLabel);

    const comicIcon = document.createElement('img');
    comicIconContainer.appendChild(comicIcon);
    comicIcon.src = '../images/comic-icon.svg';

    comicContainer.appendChild(artImage);
    comicContainer.appendChild(comicIconContainer);

    comicContainer.addEventListener('click', () => {
        openModal(artObj);
    });

    return comicContainer;
}

function openModal(artObj) {
    galleryModal.querySelector('img').src = artObj.url || artObj.pages[0];
    galleryModal.querySelector('#dateCreated').textContent = 
        `${monthsArray[artObj.month - 1]} ${artObj.day}, ${artObj.year}`;
    galleryModal.querySelector('#seriesName').textContent = artObj.series;

    galleryModal.style.display = 'block';
}

function closeModal() {
    galleryModal.style.display = 'none';
}

const galleryModal = document.querySelector('.gallery-modal');
galleryModal.querySelector('.close-modal-btn').addEventListener('click', () => closeModal());

document.body.addEventListener('click', (e) => {
        if (!galleryModal.contains(e.target)) {
            closeModal();
        }
}, true);

const monthsArray = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

createTimeline();