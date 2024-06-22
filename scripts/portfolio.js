const mainContentContainer = document.querySelector('#portfolioContainer');
let reverseTimelineOrder = true;


const yearFilterSel = document.getElementById('yearFilter');
const mainFilterSel = document.getElementById('mainFilter');
const seriesOptGroup = document.getElementById('seriesOpts');

const orderSortBtn = document.getElementById('orderSortBtn');
let filteredArt = [];
let currentlySelectedArt;

const galleryModal = document.querySelector('.gallery-modal');
const modalContent = document.querySelector('.modal-content');
const modalArtWrapper = document.querySelector('.modal-art-wrapper');
const previousModalBtn = document.querySelector('.previous-art-btn');
const nextModalBtn = document.querySelector('.next-art-btn');
let switchingModalL;
let switchingModalR;

let modalArtSlider;
const scrollIndicator = document.querySelector('.scroll-indicator');
let indicatorFlashTimer;

let comicModalPageIds = [];
let currentComicPageId;
let currentComicLength;

let initialModalOpening = true;

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
        artImage.src = artObj.url || artObj.pages[0]; // If artObj is a collection of images (comic),
        // uses the first image of the comic, since the 'pages' property is an array of the comic's urls only existent for artObjs that are comics.
        artImage.oncontextmenu = function (event) {
            event.preventDefault();
        };
        artImage.draggable = false;
        artImage.addEventListener('click', () => {
            currentlySelectedArt = artImage;
            styleModalBtns();
            openModal(artObj);
        });

        if (artObj.pages) {
            artImage.classList.add('comic-art-image');
            yearCreatedContainer.appendChild(createComicContainer(artImage, artObj));
        } else {
            artImage.classList.add('art', 'drawing');
            filteredArt.push(artImage);
            yearCreatedContainer.appendChild(artImage);
        }
    })

    toggleOrder();
}

function createComicContainer(artImage, artObj) {
    const comicContainer = document.createElement('div');
    comicContainer.classList.add('comic-container', 'art', 'comic');
    filteredArt.push(comicContainer);
    comicContainer.value = artObj.series;

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
        currentlySelectedArt = comicContainer;
        styleModalBtns();
        openModal(artObj);
    });

    return comicContainer;
}

function styleModalBtns() {
    previousModalBtn.classList.remove('cycle-back-btn');
    nextModalBtn.classList.remove('cycle-back-btn');
    previousModalBtn.innerHTML = '&#10094';
    nextModalBtn.innerHTML = '&#10095';
    if (currentlySelectedArt === filteredArt[0]) {
        previousModalBtn.classList.add('cycle-back-btn');
        previousModalBtn.innerHTML = '&#171';
    } else if (currentlySelectedArt === filteredArt[filteredArt.length - 1]) {
        nextModalBtn.classList.add('cycle-back-btn');
        nextModalBtn.innerHTML = '&#187';
    }
}

function openModal(artObj) {
    modalArtWrapper.classList.remove('comic-modal');
    modalContent.classList.remove('comic-modal');
    modalArtWrapper.innerHTML = '';

    if (artObj.url) {
        const modalImage = document.createElement('img');
        modalImage.src = artObj.url;
        modalImage.oncontextmenu = function (event) {
            event.preventDefault();
        };
        modalImage.draggable = false;
        modalArtWrapper.appendChild(modalImage);

        if (initialModalOpening) {
            modalArtWrapper.classList.add('initial-modal');
            initialModalOpening = false;
            const cycleIndicator = scrollIndicator.cloneNode(true);
            cycleIndicator.textContent = 'Scroll/swipe/drag left or right to browse';
            cycleIndicator.style.display = "block";
            galleryModal.appendChild(cycleIndicator);
            
            setTimeout(() => {
                modalArtWrapper.classList.remove('initial-modal');
            }, 4000)
            setTimeout(() => {
                galleryModal.removeChild(cycleIndicator);
            }, 2800)
        }
    } else { openComicModal(artObj); }

    galleryModal.querySelector('#dateCreated').textContent =
        `${monthsArray[artObj.month - 1]} ${artObj.day}, ${artObj.year}`;
    galleryModal.querySelector('#seriesName').textContent = artObj.series;

    galleryModal.style.display = 'flex';

    if (switchingModalR) {
        modalArtWrapper.classList.add('enter-right');
    } else if (switchingModalL) {
        modalArtWrapper.classList.add('enter-left');
    }

    setTimeout(() => {
        modalArtWrapper.classList.remove('enter-left', 'enter-right');
    }, 200)

    switchingModalL = false;
    switchingModalR = false;

}

function openComicModal(artObj) {
    modalArtWrapper.classList.add('comic-modal');
    modalContent.classList.add('comic-modal');
    modalArtWrapper.innerHTML = '<div class="slides"></div>';
    modalArtSlider = document.querySelector('.slides');
    if (indicatorFlashTimer) {
        clearTimeout(indicatorFlashTimer);
    }
    comicModalPageIds = [];
    currentComicPageId = 0;
    currentComicLength = artObj.pages.length;

    artObj.pages.forEach((pageUrl) => {
        const pageImage = document.createElement('img');
        pageImage.src = pageUrl;
        pageImage.style.height = `${1 / artObj.pages.length * 100}%`;
        pageImage.id = artObj.pages.indexOf(pageUrl);
        comicModalPageIds.push(pageImage.id);
        pageImage.oncontextmenu = function (event) {
            event.preventDefault();
        };
        pageImage.draggable = false;
        modalArtSlider.appendChild(pageImage);
    })

    modalArtSlider.style.height = `${artObj.pages.length}00%`;

    scrollIndicator.style.display = 'block';

    indicatorFlashTimer = setTimeout(function () {
        scrollIndicator.style.display = 'none';
    }, 2800)

}

nextModalBtn.addEventListener('click', () => { selectAdjacentArt('next') });
previousModalBtn.addEventListener('click', () => { selectAdjacentArt('previous') });

modalArtWrapper.addEventListener('touchstart', startTouch, { passive: false });
modalArtWrapper.addEventListener('touchend', endTouch, { passive: false });

modalArtWrapper.addEventListener('mousedown', startMouseDown);
modalArtWrapper.addEventListener('mouseup', startMouseUp);
modalArtWrapper.addEventListener('wheel', wheelFunc, { passive: false });

let canSwipeHor = true;

function selectAdjacentArt(direction) {
    if (canSwipeHor) {
        canSwipeHor = false;
        void modalArtWrapper.offsetWidth;

        if (direction === 'next') {
            modalArtWrapper.classList.add('enter-left', 'exit');
            switchingModalR = true;

            setTimeout(() => {
                modalArtWrapper.classList.remove('enter-left', 'exit');

                if (currentlySelectedArt === filteredArt[filteredArt.length - 1]) {
                    filteredArt[0].click();
                } else {
                    filteredArt[filteredArt.indexOf(currentlySelectedArt) + 1].click();
                }
            }, 200)

        } else if (direction === 'previous') {
            modalArtWrapper.classList.add('enter-right', 'exit');
            switchingModalL = true;

            setTimeout(() => {
                modalArtWrapper.classList.remove('enter-right', 'exit');

                if (currentlySelectedArt === filteredArt[0]) {
                    filteredArt[filteredArt.length - 1].click();
                } else {
                    filteredArt[filteredArt.indexOf(currentlySelectedArt) - 1].click();
                }
            }, 200)
        }

        setTimeout(() => {
            canSwipeHor = true;
        }, 400)
    }
}

function orderFilteredArt() {
    filteredArt = filteredArt.sort((a, b) => {
        const orderA = parseInt(a.style.order, 10);
        const orderB = parseInt(b.style.order, 10);

        return orderA - orderB;
    })
}

function closeModal() {
    galleryModal.style.display = 'none';
    if (indicatorFlashTimer) {
        clearTimeout(indicatorFlashTimer);
    }
    scrollIndicator.style.display = 'none';
    currentlySelectedArt = '';
}

galleryModal.querySelector('.close-modal-btn').addEventListener('click', () => closeModal());

document.body.addEventListener('click', (e) => {
    if (!galleryModal.contains(e.target)) {
        closeModal();
    }
}, true);

galleryModal.addEventListener('wheel', (e) => {
    e.preventDefault();
}, false);
galleryModal.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, false);

function createFilter(artObjectArray) {
    let yearIDs = [];
    let seriesNames = [];

    orderSortBtn.addEventListener('click', () => {

        if (reverseTimelineOrder == true) {
            orderSortBtn.innerHTML = 'Oldest <span class="arrow-up">&#10148;</span>';
            reverseTimelineOrder = false;
            toggleOrder();
        } else {
            orderSortBtn.innerHTML = 'Newest <span class="arrow-down">&#10148;</span>';
            reverseTimelineOrder = true;
            toggleOrder();
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

    yearFilterSel.addEventListener('change', () => filterArt(yearIDs));
    mainFilterSel.addEventListener('change', () => filterArt(yearIDs));

}

function filterArt(allYears) {
    filteredArt = [];
    document.querySelectorAll('.art').forEach((art) => {
        art.style.display = 'none';
        if (mainFilterSel.value === art.value ||
            art.classList.contains(mainFilterSel.value) ||
            mainFilterSel.value === '') {
            art.style.display = 'block';
        }
        if (passesFilter(art)) {
            filteredArt.push(art);
        }
    })

    orderFilteredArt();

    allYears.forEach((year) => {
        const yearCreatedContainer = document.getElementById(year);
        if (!hasVisibleChildren(yearCreatedContainer) || yearFilterSel.value !== year) {
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

function toggleOrder() {
    let artArray = [];

    document.querySelectorAll('.art').forEach((art) => {
        artArray.push(art);
    })

    for (let i = 0; i < artArray.length; i++) {
        if (reverseTimelineOrder == true) {
            artArray[i].style.order = artArray.length - i;
            mainContentContainer.style.flexDirection = 'column-reverse';
        } else if (reverseTimelineOrder == false) {
            artArray[i].style.order = i;
            mainContentContainer.style.flexDirection = 'column';
        }
    }

    orderFilteredArt();
}

function passesFilter(art) {
    const yearCreatedContainer = document.getElementById(yearFilterSel.value);
    if (art.style.display === 'block' &&
        (yearFilterSel.value === '' || yearCreatedContainer.contains(art))) {
        return true;
    }
}

let canSwipeVert = true;

let wheelDeltaY;

let initialStart = 0;
let initialEnd = 0;

let initialY = 0;
let endY = 0;

let initialX = 0;
let endX = 0;

function wheelFunc(e) {
    if (e.deltaY !== 0) {
        wheelDeltaY = e.deltaY;
        swipe();
        wheelDeltaY = 0;
    } else if (e.deltaX >= 30) {
        nextModalBtn.click();
    } else if (e.deltaX <= -30) {
        previousModalBtn.click();
    }
}

function startMouseDown(e) {
    initialStart = Date.now();
    initialY = e.clientY;
    initialX = e.clientX;
    modalArtWrapper.style.cursor = 'grabbing';
}

function startMouseUp(e) {
    initialEnd = Date.now();
    endY = e.clientY;
    endX = e.clientX;
    modalArtWrapper.style.cursor = 'grab';

    if (initialEnd - initialStart < 800) {
        if (Math.abs(endY - initialY) > 60) {
            swipe();
        } else if (endX - initialX > 60) {
            previousModalBtn.click();
        } else if (endX - initialX < -60) {
            nextModalBtn.click();
        }
    }
}

function startTouch(e) {
    initialStart = Date.now();
    initialY = e.touches[0].clientY;
    initialX = e.touches[0].clientX;
}

function endTouch(e) {
    initialEnd = Date.now();
    endY = e.changedTouches[0].clientY;
    endX = e.changedTouches[0].clientX;
    console.log(endX - initialX);
    if (initialEnd - initialStart < 800) {
        if (Math.abs(endY - initialY) > 20) {
            swipe();
        } else if (endX - initialX > 20) {
            previousModalBtn.click();
        } else if (endX - initialX < -20) {
            nextModalBtn.click();
        }
    }
}


function swipe() {
    if (!canSwipeVert) return;

    if (modalArtSlider) {
        canSwipeVert = false;
        modalArtSlider.style.animation = 'none';
        void modalArtSlider.offsetHeight;

        if ((endY - initialY < -20 || wheelDeltaY >= 30) &&
            currentComicPageId !== (currentComicLength - 1)) {

            currentComicPageId++;
        } else if ((endY - initialY > 20 || wheelDeltaY <= -30) && currentComicPageId !== 0) {

            currentComicPageId--;
        }

        setTimeout(() => {
            modalArtSlider.style.transform = `translateY(-${(currentComicPageId / currentComicLength) * 100}%)`;
        }, 0);

        setTimeout(() => {
            canSwipeVert = true;
        }, 500)
    }
}


createTimeline();