let toggleContentShadow = function(on = true, zIndex = 900){
    let contentShadow = document.getElementsByClassName('lui-content-shadowed')[0];
    if(on){
        contentShadow.classList.contains('active') ? 
            "" :
            contentShadow.classList.add('active');
        contentShadow.style.zIndex = zIndex;
    }else{
        contentShadow.classList.remove('active');
    }
}




//enables activation/deactivation of the navigation menu by pressing the burgermenu (before area of the lui-nav-bar-menu)
document.getElementsByClassName('lui-nav-bar-menu')[0].addEventListener('click', function(e){
    let toggleNavMenu = function(){
        this.classList.contains('active') ?
            this.classList.remove('active') :
            this.classList.add('active');

    }

    if(this.classList.contains('active')){
        this.classList.remove('active');
        toggleContentShadow(false);
    }else{
        this.classList.add('active');
        toggleContentShadow(true);
    }
});



//Prevents activation/deactivation of the nav menu by clicking the navigation area
document.getElementsByClassName('lui-nav-bar-link-area')[0].addEventListener('click', function(e){
    e.stopPropagation();
});


document.getElementsByClassName('lui-nav-bar-link-area')[0].addEventListener('click', function(e){
    if(e.target.nodeName == 'A')
        Array.from(this.getElementsByTagName('a')).forEach(element => {
                if(element != e.target){
                    element.classList.remove('chosen');
                    element.classList.add('nchosen');
                }else{
                    element.classList.remove('nchosen');
                    element.classList.add('chosen');
                }
        });
});
