var subMenu = document.querySelector('.submenu');
var openSubmenu = document.querySelector('.open_submenu');
openSubmenu.addEventListener('click', function() {
    subMenu.classList.toggle('show');
})

document.addEventListener('click', function(e) {
    if (subMenu.classList.contains('show')
    && !subMenu.contains(e.target)
    && !openSubmenu.contains(e.target)){

        subMenu.classList.remove('show');
    }
});