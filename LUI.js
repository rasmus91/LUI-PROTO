//Returns true if it is a DOM node
function isNode(o){
return (
    typeof Node === "object" ? o instanceof Node : 
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
);
}

//Returns true if it is a DOM element    
function isElement(o){
return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
);
}

let isNodeOrElement = function(o){
    return isElement(o) || isNode(0);
}

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

let navigateBack = function(){
    
    let emphArr = document.getElementsByClassName('lui-emphasized');
    let fadeOut = emphArr[emphArr.length - 1];
    let fadeIn = emphArr.length > 1 ? emphArr[emphArr.length - 2] : undefined;
    if(emphArr.length <= 1)
        return;
        
    if(emphArr.length <= 2){ //TODO: hiding/showing the back button should be accomplished some other way thats more general ( maybe MutationObserver )
        document.getElementsByClassName('lui-nav-back')[0].classList.add('inactive');
        document.getElementsByClassName('lui-focused-shadow')[0].classList.remove('active');
    }

    if(fadeIn != undefined) 
        fadeIn.classList.add('fadein');

    fadeOut.addEventListener('transitionend', function(){
        this.remove();

        if(fadeIn != undefined)
            fadeIn.classList.remove('fadeIn');
    });
    fadeOut.classList.add('fadeout');
    
}

//Handle back button
document.getElementsByClassName('lui-nav-back')[0].addEventListener('click', function(e){
    navigateBack();
});


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

//Handle 'modal' unfocus (back in desktop style)
document.getElementsByClassName('lui-focused-shadow')[0].addEventListener('click', navigateBack);
document.addEventListener("keyup", function(e){
    if(e.key == 'Escape')
        navigateBack();
});

// Table Logic

class LuiTableHeader{
    constructor(element, sortingFunc){
        if(element == undefined)
            throw new Error("A LuiTableHeader must be a DOM element or JSON object");

        if(isNodeOrElement(element)){
            this.constructFromDom(element, sortingFunc);
        }else if(element.constructor === {}.constructor){
            this.constructFromJson(element);
        }else{
            throw new Error("A LuiTableHeader must be a DOM element or JSON object");
        }
    }

    constructFromDom(element){
        this._headerElements = element.getElementsByClassName('lui-col-header');
        this.headers = [];
        for(var i = 0; i < this._headerElements.length; i++){
            this.headers.push(this._headerElements[i].innerText);
        }
    }

    setSortingFunc(sortingFunc){
        for(var i = 0; i < this._headerElements.length; i++){
            this._headerElements[i].addEventListener('click', sortingFunc(e, i));
        }
    }
}

class LuiTable{
    constructor(element){
        if(element == undefined)
            throw new Error("A LuiTable must be a DOM element or JSON object");

        if(isNodeOrElement(element)){
            this.constructFromDom(element);
        }else if(element.constructor === {}.constructor){
            this.constructFromJson(element);
        }else{
            throw new Error("A LuiTable must be a DOM element or JSON object");
        }
    }
    //TODO: Finish this method, and test it thorougly
    suggestFilters(element){
        if(this.filterSuggestions == null || this.filterSuggestions == undefined){
            this.filterSuggestions = document.createElement('ul');
            this.filterSuggestions.classList.add('lui-table-filter-suggestions');
        }

        if(element.value == ''){
            this.filterSuggestions.classList.add('inactive');
            return;
        }

        this.filterSuggestions.classList.remove('inactive');

        let val = element.value;
        let regex = new RegExp('/' + val + '/').compile();
        let matches = [];
        this.header.headers.forEach(function(item, index){
            let capText = item.toUpperCase();
            let lowText = item.toLowerCase();
            //normalize text, and then match via regex
            if(regex.test(capText) || regex.test(lowText)){
                //if match, create div and add to matches
                this.filterSuggestions.append(
                )
            }
            
            
        });

        //if matches is empty, show element with 'no available filters'

        //if match is not empty, show list with available filters
    }

    constructFromDom(element){
        this.setTableHeader(element.getElementsByClassName('lui-table-header')[0]);
        this.setFilterEntry(element.getElementsByClassName('lui-filter')[0]);
    }

    constructFromJson(element){
        //Construct the table 
    }
    
    setFilterEntry(filter){
        let table = this;
        this.filterSuggestions = filter.getElementsByTagName('ul')[0];
        filter.getElementsByTagName('input')[0].addEventListener('keyup',  function(){
            table.suggestFilters(this);
        });
    }

    setTableHeader(header){
        this.header = new LuiTableHeader(header, function(){});
    }


}


