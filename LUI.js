class LuiElement{
    static __domMap__ = new Map();
    __domElement__ = undefined;
    __cssName__ = undefined;
    __eventListeners__ = [];
    __children__ = new Set();
    __parent__ = undefined;

    get domElement(){
        return this.__domElement__;
    }

    get cssName(){
        return this.__cssName__;
    }

    get children(){
        return this.__children__;
    }

    set parent(parent){
        if(! parent instanceof LuiElement)
            throw new Error('a LUI parent must be an instance of LuiElement');
        
        this.__parent__ = parent;
    }

    get parent(){
        return this.__parent__;
    }

    constructor(element, cssName = undefined){
        if(isNodeOrElement(element))
            this.__domElement__ = element
        else if(typeof element === 'string')
            this.__domElement__ = document.createElement(element);
        else
            throw new Error('Element must be a valid HTML Tag name');
        
        if(cssName != undefined && cssName instanceof String)
            this.__cssName__ = cssName;

        if(this.__cssName__ != undefined)
            this.__domElement__.classList.add(cssName);

        LuiElement.__domMap__.set(this.__domElement__, this);
    }

    on(eventname, handler){

        this.__eventListeners__.push({
            selector: undefined,
            event: eventname,
            handler: handler
        });

        this.__domElement__.addEventListener(eventname, handler);
    }

    clearEventHandlers(){
        this.__eventListeners__.forEach(function(item, index){
            this.domElement.removeEventListener(item.event, item.handler);
        });        
    }

    addChild(child){
        if(!child instanceof LuiElement)
            throw new Error('a LuiElement child must be a LuiElement!');

        if(this.__children__.has(child))
            return;
        
        this.__children__.add(child);
        child.parent = this;
        this.__domElement__.appendChild(child.domElement);
    }

    clearChildren(){
        this.__children__.forEach((e) => {
            e.remove();
        });
    }

    remove(extraHandling = undefined){
        if(this.children.size)
            this.children.forEach((e) => {
                e.remove();
            });

        if(parent instanceof LuiElement)
            parent.children.delete(this);
        
        LuiElement.__domMap__.delete(this.domElement);

        this.domElement.remove();

        if(isFunction(extraHandling))
            extraHandling(this);
    }
}

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
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
class LuiTable extends LuiElement{
    static get cssName(){
        return 'lui-table';
    }
    constructor(element){
        super(element, LuiTable.cssName);

        if(isNodeOrElement(element)){
            this.constructFromDom(element);
        }else if(element.constructor === {}.constructor){
            this.constructFromJson(element);
        }else{
            throw new Error("A LuiTable must be a DOM element or JSON object");
        }
    }
    

    constructFromDom(element){
        this.columnFilters = element.getElementsByClassName('lui-table-active-filters')[0];
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

    set columnFilters(filters){
        this.__columnFilters__ = new LuiTableColumnFilters(this, filters);
    }

    get columnFilters(){
        return this.__columnFilters__;
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

class LuiTableColumnFilter extends LuiElement{
    __header__ = '';
    __filter__ = '';

    constructor(header, filter){
        super('div');
        this.__header__ = header;
        this.__filter__ = filter;

        this.domElement.innerText = `${this.__header__}:${this.__filter__}`;
    }
}

class LuiTableColumnFilters extends LuiElement{

    constructor(parentTable, element = 'div'){
            super(element, 'lui-table-active-filters');
            this.parent = parentTable;
            this.on('click', (e) => {
                let element = LuiElement.__domMap__.get(e.target);
                if(element != this)
                    element.remove();
            });
    }

    add(index, filter){
        this.addChild(
            new LuiTableColumnFilter(
                this.parent.TableHeader.headers[index],
                filter
            )
        );
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
                        this.table.columnFilters.add(
                            this.suggestions.markedIndex,
                            e.target.value
                        );
                        e.target.value = 0;
                        this.suggestions.clearMarking();
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

}

class LuiTableColumn{
    __width__ = 5;
    __cells__ = new Set();

    constructor(dataType){
        switch(dataType)
        {

        }
    }

    set width(integer){
        if(integer > 6)
            integer = 6;
        else if(integer < 1)
            integer = 1;
        
        this.__width__ = integer;

        this.__cells__.forEach((c) => {
            c.width = this.__width__;
        });
    }

    get width(){
        return this.__width__;
    }

    addCell(cell){
        if(!cell instanceof LuiTableRowCell)
            throw new Error('Must be a LuiTableRowCell');
        
        this.__cells__.add(cell);
        cell.width = this.width;
    }

    removeCell(cell){
        if(!cell instanceof LuiTableRowCell)
            throw new Error('Must be a LuiTableRowCell');
        this.__cells__.delete(cell);
    }

}

class LuiTableRowCell extends LuiElement{
    __column__ = undefined;
    __cssName__ = 'lui-table-col-';

    get column(){
        return this.__column__;
    }

    set width(integer){
        this.domElement.classList = `${this.__cssName__}${integer}`;
    }

    constructor(column, row, element){
        super(element); //TODO: add class based on column width

        this.parent = row;
        this.__column__ = column;
        column.addCell(this);
    }

    remove(){
        this.column.removeCell(this);
        super.remove();
    }
}

class LuiTableRow extends LuiElement{

    __collapsed__ = false;

    constructor(element, parentTable){
        super(element, 'lui-table-row');

        parent = parentTable;
    }

    set collapsed(col){
        if(this.__collapsed__ == col)
            return;

        this.__collapsed__ = col;
        if(this.__collapsed__)
            this.collapse();
        else
            this.unfold();
    }

    collapse(){
        if(!this.__collapsed__){
            this.on('transitioned', () => {
                this.domElement.style.display = 'none';
                this.domElement.classList.remove('collapse');
            });
            this.domElement.classList.add('collapse');
        }
    }

    unfold(){
        if(this.__collapsed__){
            this.on('transitioned', () => {
                this.domElement.style.display = '';
                this.domElement.classList.remove('collapse');
            });
            this.domElement.classList.add('collapse');
        }
    }

}




