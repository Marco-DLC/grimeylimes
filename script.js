document.getElementById('radio1').checked = true;
const radioBtns = document.querySelectorAll('.manual-btn');

let counter = 2
const autoSlidesTimer = setInterval(function (){
    document.getElementById('radio' + counter).checked = true;
    counter++;
    if(counter >3){
        counter = 1;
    }
}, 5000);

radioBtns.forEach((radioBtn) => {
    radioBtn.addEventListener('click', () => {
        clearInterval(autoSlidesTimer);
    })
})