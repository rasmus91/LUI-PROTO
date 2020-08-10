class LuiElement{
    __domElement__ = undefined;
    __cssName = undefined;
    __eventListeners = [];
    __children__ = new Set();

    get domElement(){
        return this.__domElement__;
    }

    get cssName(){
        return this.__cssName;
    }

    get children(){
        return this.__children__;
    }

    constructor(element, cssName = undefined){
        if(isNodeOrElement(element))
            this.__domElement__ = element
        else if(typeof element === 'string')
            this.__domElement__ = document.createElement(element);
        else
            throw new Error('Element must be a valid HTML Tag name');
        
        if(cssName != undefined && cssName instanceof String)
            this.__cssName = cssName;

        if(this.__cssName != undefined)
            this.__domElement__.classList.add(cssName);
    }

    on(eventname, handler){

        this.__eventListeners.push({
            selector: undefined,
            event: eventname,
            handler: handler
        });

        this.__domElement__.addEventListener(eventname, handler);
    }

    clearEventHandlers(){
        this.__eventListeners.forEach(function(item, index){
            this.domElement.removeEventListener(item.event, item.handler);
        });        
    }

    addChild(child){
        if(!child instanceof LuiElement)
            throw new Error('a LuiElement child must be a LuiElement!');

        if(this.__children__.has(child))
            throw new Error('a LuiElement child must only occur as a child once')
        
        this.__children__.add(child);
        this.__domElement__.appendChild(child.domElement);
    }

    removeChild(child){
        if(!child instanceof LuiElement)
            throw new Error('a LuiElement child must be a LuiElement!');
        
        this.__children__.delete(child);
        child.domElement.remove();
    }

    clearChildren(){
        this.__children__.forEach((e, i) => {
            e.domElement.remove();
        });

        this.__children__.clear();
    }
}

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
    

    constructFromDom(element){
        this.TableHeader = element.getElementsByClassName('lui-table-header')[0];
        this.FilterEntry = element.getElementsByClassName('lui-filter')[0];
    }

    constructFromJson(element){
        //Construct the table 
    }
    
    set FilterEntry(filter){
        this.filter = new LuiTableFilter(filter, this);
        
    }

    set TableHeader(header){
        this.header = new LuiTableHeader(header, function(){});
    }

    get TableHeader(){
        return this.header;
    }

}

class LuiEntry extends LuiElement{
    constructor(element = null, cssName = undefined){
        super(element, cssName);
        super.domElement.type = 'text';
    }

    set onInputChange(handler){
        super.on('keyup', handler);
    }

    set getsFocus(handler){
        super.on('focusin', handler);
    }

    set lostFocus(handler){
        super.on('focusout', handler);
    }
    
}

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

class LuiTableFilterSuggestion extends LuiElement{

    __cssMarked__ = 'marked';
    __marked__ = false;

    constructor(contents){
        super('li', undefined);
        super.domElement.innerText = contents;
    }

    set marked(bool){
        this.__marked__ = bool;
        if(this.__marked__)
            this.domElement.classList.add(this.__cssMarked__);
        else
            this.domElement.classList.remove(this.__cssMarked__);
    }

    get marked(){
        return this.__cssMarked__;
    }

}

class LuiTableFilterSuggestions extends LuiElement{
    cssInactive = 'inactive';
    __state__ = false;
    __options__ = [];
    __markedIndex__ = -1;

    constructor(element, filterOptions = []){
        super(
            isNodeOrElement(element) ? element : 'ul',
            'lui-table-filter-suggestions'
        );

        if(!super.domElement.classList.contains(this.cssInactive))
            super.domElement.classList.add(this.cssInactive);
        
        this.filterOptions = filterOptions;
    }

    set state(active){

        if(active != this.__state__ && active)
            super.domElement.classList.remove(this.cssInactive);
        else
            super.domElement.classList.add(this.cssInactive);

        this.__state__ = active;
    }

    get state(){
        return this.__state__;
    }

    set filterOptions(filters = []){
        let suggestions = this;
        this.__options__ = [];
        super.clearChildren();
        let options = this.__options__;
        super.domElement.innerHTML = '';
        filters.forEach(function(item, index){
            suggestions.addChild(
                new LuiTableFilterSuggestion(item)
            );
        });
    }

    set markedIndex(index){
        if(index < 0)
            this.__markedIndex__ = this.children.size - 1;
        else if(index > this.children.size - 1)
            this.__markedIndex__ = 0;
        else
            this.__markedIndex__ = index;
        
        this.children.forEach((e) => {
            e.marked = false;
        });

        if(this.__markedIndex__ > -1)
            [...this.children][this.__markedIndex__].marked = true;
        
    }

    get markedIndex(){
        return this.__markedIndex__;
    }

    clearMarking(){
        this.children.forEach((e) => {
            e.marked = false;
        });
        this.__markedIndex__ = -1;
    }

    showAll(){
        for(var i = 0; i < this.domElement.children.length; i++){
            this.domElement.children[i].style.display = '';
        }
    }

}

class LuiTableFilter extends LuiElement{

    constructor(element, parentTable){
        super(
            isNodeOrElement(element) ? element : 'div', 
            'lui-filter'
        );

        if(parentTable == null || ! parentTable instanceof LuiTable)
            throw new Error('parentTable must be a LuiTable class instance')

        this.table = parentTable;

        if(isNodeOrElement(element)){
            this.constructFromDom(element);
        }else{
            throw new Error("A LuiTableHeader must be a DOM element");
        }
    }

    constructFromDom(element){
        this.entry = new LuiEntry(element.getElementsByTagName('input')[0]);
        this.button = new LuiElement(element.getElementsByTagName('div')[0]);
        this.suggestions = new LuiTableFilterSuggestions(element.getElementsByTagName('ul')[0]);
        this.entry.onInputChange = (e) => {
            //check if key is direction up, down or enter
            switch(e.code)
            {
                case 'ArrowUp':
                    this.suggestions.markedIndex = this.suggestions.markedIndex - 1;
                break;
                case 'ArrowDown':
                    this.suggestions.markedIndex = this.suggestions.markedIndex + 1;
                break;
                case 'Enter':
                    if(e.target.value == '')
                        return;
                    else

                        //apply filter
                break;
                default:
                    this.suggestions.filter = e.target.value;
            }
        };
        this.entry.getsFocus = (e) => {
            this.suggestions.state = true;
        };
        this.entry.lostFocus = (e) => {
            this.suggestions.state = false;
            this.suggestions.clearMarking();
        };
        this.suggestions.filterOptions = this.table.TableHeader.headers;
    }

    //TODO: Finish this method, and test it thorougly
}




