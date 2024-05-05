const mainContentContainer = document.querySelector('#portfolioContainer');
let reverseTimelineOrder = true;


const yearFilterSel = document.getElementById('yearFilter');
const mainFilterSel = document.getElementById('mainFilter');
const seriesOptGroup = document.getElementById('seriesOpts');

const orderSortBtn = document.getElementById('orderSortBtn');

const galleryModal = document.querySelector('.gallery-modal');

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

async function getArtData() {
    const request = new Request('../art.json');
    const response = await fetch(request);
    const data = await response.json();

    return data;
}

async function createTimeline() {
    artObjectArray = await getArtData();

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
    createFilter(artObjectArray);
}

function createArtGrids(artObjectArray) {
    artObjectArray.forEach((artObj) => {
        const yearCreatedContainer = document.getElementById(artObj.year);
        const artImage = document.createElement('img');
        artImage.value = artObj.series;
        artImage.classList.add('art', 'drawing');
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
    comicContainer.classList.add('comic-container', 'art', 'comic');
    comicContainer.value = artObj.series;

    const comicIconContainer = document.createElement('div');
    comicIconContainer.classList.add('comic-icon-container');

    const comicLabel = document.createElement('span');
    comicLabel.textContent = `Comic: ${artObj.pages.length} pages`;
    comicIconContainer.appendChild(comicLabel);

    const comicIcon = document.createElement('img');
    comicIconContainer.appendChild(comicIcon);
    comicIcon.src = '../images/comic-icon.svg';

    artImage.classList.remove('art');
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

galleryModal.querySelector('.close-modal-btn').addEventListener('click', () => closeModal());

document.body.addEventListener('click', (e) => {
    if (!galleryModal.contains(e.target)) {
        closeModal();
    }
}, true);

function createFilter(artObjectArray) {
    let yearIDs = [];
    let seriesNames = [];

    orderSortBtn.addEventListener('click', () => {

        if (reverseTimelineOrder == true) {
            orderSortBtn.innerHTML = 'Oldest <span class="arrow-up">&#10148;</span>';
            reverseTimelineOrder = false;
        } else {
            orderSortBtn.innerHTML = 'Newest <span class="arrow-down">&#10148;</span>';
            reverseTimelineOrder = true;
        }
    })

    mainContentContainer.childNodes.forEach((child) => {
        let yearFilterExists = false;

        for (let i = 0; i < yearFilterSel.children.length; i++) {
            if (yearFilterSel.children[i].value === child.id) {
                yearFilterExists = true;
            }
        }

        if (child.id !== undefined && child.id !== '' && yearFilterExists == false) {
            yearIDs.push(child.id);

            const option = document.createElement('option');
            option.value = child.id;
            option.innerHTML = child.id;
            yearFilterSel.appendChild(option);
        }
    })

    artObjectArray.forEach((artObj) => {
        let seriesFilterExists = false;

        for (let i = 0; i < seriesOptGroup.children.length; i++) {
            if (seriesOptGroup.children[i].value === artObj.series) {
                seriesFilterExists = true;
            }
        }

        if (seriesFilterExists == false) {
            seriesNames.push(artObj.series);

            const option = document.createElement('option');
            option.value = artObj.series;
            option.innerHTML = artObj.series;
            seriesOptGroup.appendChild(option);
        }
    })

    yearFilterSel.addEventListener('change', () => filterArt(yearIDs, seriesNames));
    mainFilterSel.addEventListener('change', () => filterArt(yearIDs, seriesNames));

}

function filterArt(allYears, allSeries) {
    document.querySelectorAll('.art').forEach((art) => {
        art.style.display = 'none';
        if (mainFilterSel.value === art.value ||
            art.classList.contains(mainFilterSel.value) ||
            mainFilterSel.value === '') {
            art.style.display = 'block';
        }
    })
    allYears.forEach((year) => {
        const yearCreatedContainer = document.getElementById(year);
        if(!hasVisibleChildren(yearCreatedContainer) || yearFilterSel.value !== year) {
            yearCreatedContainer.style.display = 'none';
        } 

        if (hasVisibleChildren(yearCreatedContainer) &&
    (yearFilterSel.value === year || yearFilterSel.value === '')) {
            yearCreatedContainer.style.display = 'grid';
        }
    })
}

function hasVisibleChildren(parent) {
    const children = parent.children;
    for (let i = 0; i < children.length; i++) {
        if (window.getComputedStyle(children[i]).display !== 'none' && children[i].nodeName !== 'H2') {
            return true;
        }
    }
    return false;
}

createTimeline();