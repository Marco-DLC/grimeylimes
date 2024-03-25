const navBtn = document.getElementById('navBtn');
const navArrow = navBtn.lastElementChild;
const navMenu = document.getElementById('navMenu');
const nav = document.querySelector('header .right');

navBtn.addEventListener('click',() => {
    toggleNavOpen();
})

document.body.addEventListener('touchstart', (e) => {
    if(!nav.contains(e.target)){
        closeNavMenu();
    }
})

document.body.addEventListener('mousedown',(e) => {
    if(!nav.contains(e.target)){
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