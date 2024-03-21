document.getElementById('radio1').checked = true;
const manualBtns = document.querySelectorAll('.manual-btn');

let counter = 2
const autoSlidesTimer = setInterval(function () {
    document.getElementById('radio' + counter).checked = true;
    counter++;
    if (counter > 3) {
        counter = 1;
    }
}, 5000);

const radioBtns = document.querySelectorAll('.radio-btn');

function getCheckedRadio() {
    for (const radioBtn of radioBtns) {
        if (radioBtn.checked) {
            return document.getElementById(radioBtn.id);
        };
    }
};

function setSlideTransitionTime(setTime) {
    document.querySelectorAll('.slide').forEach((slide) => {
        slide.style.transition = setTime;
    })
}

manualBtns.forEach((manualBtn) => {
    manualBtn.addEventListener('click', () => {
        clearInterval(autoSlidesTimer);
        setSlideTransitionTime('1s');
    })

    manualBtn.addEventListener('mouseenter', () => {
        manualBtn.style.backgroundColor = '#FD798C'
    })

    manualBtn.addEventListener('mouseleave', () => {
        manualBtn.style.backgroundColor = 'initial'
    })
})


const slider = document.querySelector('.slides');

slider.addEventListener('touchstart', startTouch, { passive: false });
slider.addEventListener('touchend', endTouch, { passive: false });

slider.addEventListener('mousedown', startMouseDown);
slider.addEventListener('mouseup', startMouseUp);
slider.addEventListener('wheel', wheelFunc, { passive: false });

let canSwipe = true;
function wheelFunc(e) {
    console.log(e.deltaX)
    if (canSwipe) {
        if (e.deltaX >= 30 && getCheckedRadio().id !== 'radio3') {
            canSwipe = false;
            setSlideTransitionTime('.5s');
            clearInterval(autoSlidesTimer);
            manualBtns.forEach((manualBtn) => manualBtn.style.backgroundColor = 'initial');
            getCheckedRadio().nextElementSibling.checked = true;
            setTimeout(() => {
                canSwipe = true;
            }, 500)
        }

        if (e.deltaX <= -30 && getCheckedRadio().id !== 'radio1') {
            canSwipe = false;
            setSlideTransitionTime('.5s');
            clearInterval(autoSlidesTimer);
            manualBtns.forEach((manualBtn) => manualBtn.style.backgroundColor = 'initial');
            getCheckedRadio().previousElementSibling.checked = true;
            setTimeout(() => {
                canSwipe = true;
            }, 500)
        }
    }
}

let initialStart = 0;
let initialEnd = 0;

let initialX = 0;
let endX = 0;

function startMouseDown(e) {
    initialStart = Date.now();
    initialX = e.clientX;
    slider.style.cursor = 'grabbing';
}

function startMouseUp(e) {
    initialEnd = Date.now();
    endX = e.clientX;
    console.log(initialEnd - initialStart);
    slider.style.cursor = 'grab';
    if (initialEnd - initialStart < 800) {
        swipe();
    }
}

function swipe() {
    if (endX - initialX < -50 && getCheckedRadio().id !== 'radio3') {
        setSlideTransitionTime('.5s');
        clearInterval(autoSlidesTimer);
        manualBtns.forEach((manualBtn) => manualBtn.style.backgroundColor = 'initial');
        getCheckedRadio().nextElementSibling.checked = true;

    } else if (endX - initialX > 50 && getCheckedRadio().id !== 'radio1') {
        setSlideTransitionTime('.5s');
        clearInterval(autoSlidesTimer);
        manualBtns.forEach((manualBtn) => manualBtn.style.backgroundColor = 'initial');
        getCheckedRadio().previousElementSibling.checked = true;
    }
}

function startTouch(e) {
    initialStart = Date.now();
    initialX = e.touches[0].clientX;
}

function endTouch(e) {
    initialEnd = Date.now();
    endX = e.changedTouches[0].clientX;
    if (initialEnd - initialStart < 800) {
        swipe();
    }
}

const navBtn = document.getElementById('navBtn');
const navArrow = navBtn.lastElementChild;
const navMenu = document.getElementById('navMenu');

navBtn.addEventListener('click',() => {
    toggleNavOpen();
})

document.body.addEventListener('touchstart', (e) => {
    if(!navBtn.contains(e.target)){
        closeNavMenu();
    }
})

document.body.addEventListener('mousedown',(e) => {
    if(!navBtn.contains(e.target)){
        closeNavMenu();
    }
})

function toggleNavOpen(){
    navArrow.classList.toggle('open')
    navMenu.classList.toggle('open')
}

function closeNavMenu(){
    navArrow.classList.remove('open');
    navMenu.classList.remove('open');
}