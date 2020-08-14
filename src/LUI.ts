class LuiElement{
    static __domMap__ = new Map<HTMLElement, LuiElement>();
    __domElement__ : HTMLElement = undefined;
    __cssName__ : string = undefined;
    __eventListeners__ = [];
    __children__ : Set<LuiElement> = new Set<LuiElement>();
    __parent__ : LuiElement = undefined;

    get domElement(){
        return this.__domElement__;
    }

    get cssName(){
        return this.__cssName__;
    }

    get children(){
        return this.__children__;
    }

    set parent(parent : LuiElement){
        
        this.__parent__ = parent;
    }

    get parent(){
        return this.__parent__;
    }

    constructor(element, cssName : string = undefined){
        if(isNodeOrElement(element))
            this.__domElement__ = element
        else if(typeof element === 'string')
            this.__domElement__ = document.createElement(element);
        else
            throw new Error('Element must be a valid HTML Tag name');
        
        if(cssName != undefined)
            this.__cssName__ = cssName;

        if(this.__cssName__ != undefined)
            this.__domElement__.classList.add(cssName);

        LuiElement.__domMap__.set(this.__domElement__, this);
    }

    on(eventname :string, handler : EventListener){
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

    addChild(child : LuiElement){
        

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
    let contentShadow = <HTMLElement>document.querySelector('.lui-content-shadowed');
    if(on){
        contentShadow.classList.contains('active') ? 
            "" :
            contentShadow.classList.add('active');
        contentShadow.style.zIndex = zIndex.toString();
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
    let et = e.target as HTMLElement;
    if(et.nodeName == 'A')
        this.querySelector('a').array.forEach(element => {
            if(element != et){
                element.classList.remove('chosen');
                element.classList.add('nchosen');
            }
            else{
                element.classList.remove('nchosen');
                element.classList.add('nchosen');
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

    __filter__ : LuiTableFilter = undefined;
    __header__ : LuiTableHeader = undefined;
    __columnFilters__ : LuiTableColumnFilters = undefined;

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
    

    constructFromDom(element : HTMLElement){
        this.columnFilters = new LuiTableColumnFilters(this, element.querySelector('.lui-table-active-filters') as HTMLElement);
        this.TableHeader = new LuiTableHeader(element.querySelector('.lui-table-header') as HTMLElement, null);
        this.FilterEntry = new LuiTableFilter(element.querySelector('.lui-filter') as HTMLElement, this);
        

    }

    constructFromJson(element){
        //Construct the table 
    }
    
    set FilterEntry(filter){
        this.__filter__ = filter;
        
    }

    set TableHeader(header){
        this.__header__ = header;
    }

    set columnFilters(filters){
        this.__columnFilters__ = filters;
    }

    get columnFilters(){
        return this.__columnFilters__;
    }

    get TableHeader(){
        return this.__header__;
    }

}

class LuiEntry extends LuiElement{
    constructor(element = null, cssName = undefined){
        super(element, cssName);
        this.domElement.type = 'text';
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

    get domElement(){
        return this.__domElement__ as HTMLInputElement;
    }

    set domElement(element : HTMLInputElement){
        this.__domElement__ = element;
    }
    
}

class LuiTableHeader{
    __headerElements__ : NodeListOf<HTMLElement> = undefined;
    headers : Array<string> = undefined;

    constructor(element, sortingFunc){
        if(element == undefined)
            throw new Error("A LuiTableHeader must be a DOM element or JSON object");

        if(isNodeOrElement(element)){
            this.constructFromDom(element);
        }else if(element.constructor === {}.constructor){
            //this.constructFromJson(element);
        }else{
            throw new Error("A LuiTableHeader must be a DOM element or JSON object");
        }
    }

    constructFromDom(element : HTMLElement){
        this.__headerElements__ = element.querySelectorAll('.lui-col-header');
        this.headers = [];
        for(var i = 0; i < this.__headerElements__.length; i++){
            this.headers.push(this.__headerElements__[i].innerText);
        }
    }

    setSortingFunc(sortingFunc : EventListenerObject){
        for(var i = 0; i < this.__headerElements__.length; i++){
            this.__headerElements__[i].addEventListener('click', sortingFunc);
        }
    }
}

class LuiTableFilterSuggestion extends LuiElement{

    __cssMarked__ = 'marked';
    __marked__ : boolean = false;

    constructor(contents){
        super('li', undefined);
        this.domElement.innerText = contents;
    }

    set marked(bool : boolean){
        this.__marked__ = bool;
        if(this.__marked__)
            this.domElement.classList.add(this.__cssMarked__);
        else
            this.domElement.classList.remove(this.__cssMarked__);
    }

    get marked(){
        return this.__marked__;
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

        if(!this.domElement.classList.contains(this.cssInactive))
            this.domElement.classList.add(this.cssInactive);
        
        this.filterOptions = filterOptions;
    }

    set state(active){

        if(active != this.__state__ && active)
            this.domElement.classList.remove(this.cssInactive);
        else
            this.domElement.classList.add(this.cssInactive);

        this.__state__ = active;
    }

    get state(){
        return this.__state__;
    }

    set filterOptions(filters : Array<string>){
        let suggestions = this;
        this.__options__ = [];
        super.clearChildren();
        this.domElement.innerHTML = '';
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
            let child = this.domElement.children[i] as HTMLElement;
            child.style.display = '';
        }
    }

    get children(){
        return this.__children__ as Set<LuiTableFilterSuggestion>;
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

    constructor(parentTable, element : string | HTMLElement = 'div'){
            super(element, 'lui-table-active-filters');
            this.parent = parentTable;
            this.on('click', (e) => {
                let element = LuiElement.__domMap__.get(e.target as HTMLElement);
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

    set parent(parent : LuiTable){
        this.__parent__ = parent;
    }

    get parent(){
        return this.__parent__ as LuiTable;
    }

}

class LuiTableFilter extends LuiElement{

    table : LuiTable = undefined;
    __entry__ : LuiEntry = undefined;
    __button__ : LuiElement = undefined;
    __suggestions__ : LuiTableFilterSuggestions = undefined;



    constructor(element, parentTable : LuiTable){
        super(
            isNodeOrElement(element) ? element : 'div', 
            'lui-filter'
        );

        this.table = parentTable;

        if(isNodeOrElement(element)){
            this.constructFromDom(element);
        }else{
            throw new Error("A LuiTableHeader must be a DOM element");
        }
    }

    constructFromDom(element){
        this.__entry__ = new LuiEntry(element.querySelector('input'));
        this.__button__ = new LuiElement(element.querySelector('div'));
        this.__suggestions__ = new LuiTableFilterSuggestions(element.querySelector('ul'));
        this.__entry__.onInputChange = (e) => {
            //check if key is direction up, down or enter
            switch(e.code)
            {
                case 'ArrowUp':
                    this.__suggestions__.markedIndex = this.__suggestions__.markedIndex - 1;
                break;
                case 'ArrowDown':
                    this.__suggestions__.markedIndex = this.__suggestions__.markedIndex + 1;
                break;
                case 'Enter':
                    if(e.target.value == '')
                        return;
                    else
                        this.table.columnFilters.add(
                            this.__suggestions__.markedIndex,
                            e.target.value
                        );
                        e.target.value = 0;
                        this.__suggestions__.clearMarking();
                        //apply filter
                break;
                default:
                    //this.__suggestions__.filter = e.target.value;
            }
        };
        this.__entry__.getsFocus = (e) => {
            this.__suggestions__.state = true;
        };
        this.__entry__.lostFocus = (e) => {
            this.__suggestions__.state = false;
            this.__suggestions__.clearMarking();
        };
        this.__suggestions__.filterOptions = this.table.TableHeader.headers;
    }

}

class LuiTableColumn{
    __width__ = 5;
    __cells__ = new Set<LuiTableRowCell>();

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

    addCell(cell : LuiTableRowCell){
        
        this.__cells__.add(cell);
        cell.width = this.width;
    }

    removeCell(cell : LuiTableRowCell){
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
        this.domElement.classList.forEach((c) => {
            this.domElement.classList.remove(c);
        });
        this.domElement.classList.add(`${this.__cssName__}${integer}`);
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




