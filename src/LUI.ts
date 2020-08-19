namespace LUI{

    export enum cssClasses {
        hidden = 'lui-hidden'
    };

    export enum sortingOrder {
        none = 0,
        descending = 1,
        ascending = 2
    }

    export enum sortingType {
        TEXT = 0,
        DATE = 1,
        NUMBER = 2
    }

    export const sortAsText = (a : string, b : string) : number => {
        return a.localeCompare(b);
    };

    export const sortAsNumber = (a : number, b : number) : number => {
        return a - b;
    }

    export const sortAsDate = (a : Date, b : Date) : number => {
        if(a > b){
            return 1;
        }
        else if ( b > a){
            return -1;
        }
        
        return 0;
    }

    export interface IOrderedSet<T> extends Set<T>{

        add(element) : any;
        remove(element : T) : number;
        has(element : T) : boolean;
        elementAt(index : number) : T;
        insert(index : number, element : T);
        //filter<S extends T>(callbackfn: (value: T, index: number, IOrderedSet: IOrderedSet<T>) => value is S, thisArg?: any): IOrderedSet<S>;
        filter(callbackfn: (value: T, index: number, iOrderedSet : IOrderedSet<T>) => unknown, thisArg? : any): IOrderedSet<T>;

    }

    export class OrderedSet<T> implements IOrderedSet<T>{
        
        public static from<S>(arr : Array<S>) : OrderedSet<S>{
            let result = new OrderedSet<S>();
            result.__data__ = arr; 
            return result;
        }
        
        private __data__ : Array<T> = new Array<T>();
        private __iteratingCurrent__: any;

        insert(index : number, element : T) : boolean{
            if(this.size <= index)
                return false;

            if(this.__data__.indexOf(element))
                return false;
        
            this.__data__.splice(index, 0, element);
            return true;
        }

        add(element: T) : number{
            let existingIndex = this.__data__.indexOf(element);
            if(existingIndex > -1)
                return -1;
            this.__data__.push(element);
            return this.size - 1;
        }
        remove(element: T): number {
            let index = this.__data__.indexOf(element);

            if(index > -1)
                this.__data__.splice(index, 1);

            return index;
        }
        has(element: T): boolean {
            return this.__data__.indexOf(element) > -1;
        }
        clear(): void {
            this.__data__ = new Array<T>();
        }
        delete(value: T): boolean {
            return this.remove(value) > -1;
        }

        elementAt(index : number) : T{
            if(index > this.size || index < 0)
                throw new Error(`The index specified must be within the values of 0 and size ${this.size}`);
            
            return this.__data__[index];
        }

        filter(callbackfn: (value: T, index: number, iOrderedSet : IOrderedSet<T>) => unknown, thisArg?: any): IOrderedSet<T>{
            let filtered = new Array<T>();
            let filteredSet = new OrderedSet<T>();

            filteredSet.__data__ = filtered;
            for(let i = 0; i < this.size; i++){
                if(callbackfn(this.elementAt(i), i, this))
                    filtered.push(this.elementAt(i));
            }
            
            return filteredSet;
        }

        /*filter<S extends T>(callbackfn: (value: T, index: number, IOrderedSet: IOrderedSet<T>) => value is S, thisArg?: any): IOrderedSet<S> {
            let filtered = new Array<S>();
            let filteredSet = new OrderedSet<S>();
            filteredSet.__data__ = filtered;
            for(let i = 0; i < this.size; i++){
                if(callbackfn(this.elementAt(i), i, this))
                    filtered.push(this.elementAt(i) as S);
            }
            
            return filteredSet;
        }/*/

        forEach(callbackfn: (value: T, value2: T, set: IOrderedSet<T>) => void, thisArg?: any): void {
            for(let i = 0; i < this.size; i++){
                callbackfn(
                    this.elementAt(i),
                    this.elementAt(i),
                    this
                );
            }
        }

        public get size(){
            return this.__data__.length;
        }

        [Symbol.iterator](): IterableIterator<T> {
            return this;
        }
        
        keys(): IterableIterator<T> {
            return this;
        }
        values(): IterableIterator<T> {
            return this;
        }
        entries(): IterableIterator<[T, T]> {
            throw new Error("Method not implemented.");
        }
        [Symbol.toStringTag]: string;

        next(){
            if(this.__iteratingCurrent__ < this.size)
                return {
                    value: this.elementAt(this.__iteratingCurrent__++),
                    done: false
                };
            
            this.__iteratingCurrent__ = 0;
            return {
                value: undefined,
                done: true
            };

        }

        

    }

    export class ElementChildren<T extends ILuiElement> extends OrderedSet<T>{
        private __element__: HTMLElement;
        private __parent__ : ILuiElement;

        constructor(element : ILuiElement){
            super();
            this.__element__ = element.domElement;
            this.__parent__ = element;
        }

        add(child : T) : number{
            let index = super.add(child);

            if(!this.__element__.contains(child.domElement) && index > -1)
                this.__element__.appendChild(child.domElement);

            if(child.parent != this.__parent__)
                child.parent = this.__parent__;
            
            return index;
        }

        remove(child : T) : number{
            let index = super.remove(child);

            if(index < 0)
                return index;
               
            child.domElement.remove();
            delete child.parent;

            return index;
        }

        insert(index : number, child : T) : boolean{
            let result = super.insert(index, child);
            if(result)
                this.__element__.insertBefore(
                    child.domElement,
                    this.__element__.children[index + 1]
                );

            return result;
        }

        clear() : void{
            this.forEach(c => c.remove());
            super.clear();
        }

    }


}

interface ILuiElement{
    domElement : HTMLElement;
    cssName : string;
    children : LUI.ElementChildren<ILuiElement>;
    remove();
    parent : ILuiElement;
}

class LuiElement<Tparent extends ILuiElement> implements ILuiElement{
    static __domMap__ = new Map<HTMLElement, ILuiElement>();

    private __eventListeners__ = [];
    private __parent__ : Tparent;
    private __domElement__ : HTMLElement; 
    private __cssName__ : string;
    protected __children__ : LUI.ElementChildren<ILuiElement> = undefined;

    constructor(element : string | HTMLElement, cssName : string = undefined){
        if(element instanceof HTMLElement)
            this.__domElement__ = element
        else if(typeof element === 'string')
            this.__domElement__ = document.createElement(element);
        else
            throw new Error('Element must be a valid HTML Tag name');
        
        if(cssName != undefined)
            this.__cssName__ = cssName;

        if(this.__cssName__ != undefined)
            this.__domElement__.classList.add(cssName);

        this.__children__ = new LUI.ElementChildren<ILuiElement>(this);

        LuiElement.__domMap__.set(this.__domElement__, this);
    }

    public get parent(){
        return this.__parent__;
    }

    public set parent(element : Tparent){
        this.__parent__ = element;
        if(this.__parent__ != null)
            this.__parent__.children.add(this);
    }

    public get children(){
        return this.__children__;
    }

    public get cssName(){
        return this.__cssName__;
    }

    public get domElement(){
        return this.__domElement__;
    }

    public remove(){
        
        this.children.clear();

        if(this.parent != null || this.parent != undefined)
            this.parent.children.delete(this);
        
        LuiParentElement.__domMap__.delete(this.domElement);

        this.domElement.remove();
    }

    on(eventname :string, handler : EventListener){
        this.__eventListeners__.push({
            selector: undefined,
            event: eventname,
            handler: handler
        });

        this.__domElement__.addEventListener(eventname, handler);
    }

    clearEventListenersFor(eventname : string){
        this.__eventListeners__.forEach(e => {
            if(eventname === e.event)
                this.__domElement__.removeEventListener(
                    e.event,
                    e.handler
                );
        });
    }

    clearEventHandlers(){
        this.__eventListeners__.forEach(function(item, index){
            this.domElement.removeEventListener(item.event, item.handler);
        });        
    }

}

class LuiParentElement<Tparent extends ILuiElement, Tchild extends ILuiElement> extends LuiElement<Tparent>{

    protected __children__ : LUI.ElementChildren<Tchild>;

    get children(){
        return this.__children__ as LUI.ElementChildren<Tchild>;
    }


    constructor(element : string | HTMLElement, cssName : string = undefined){
        super(element, cssName);
    
        this.__children__ = new LUI.ElementChildren<Tchild>(this);
    }

    

    addChild(child : Tchild, index : number = undefined){
        
        if(child.parent == undefined)
            child.parent = this;
        else if(child.parent != this)
            

        if(this.__children__.has(child))
            return;
        
        this.__children__.add(child);
        child.parent = this;
        super.domElement.appendChild(child.domElement);
    }

    clearChildren(){
        this.children.forEach((e) => {
            e.remove();
        });
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
class LuiTable extends LuiParentElement<ILuiElement, ILuiElement>{
    static get cssName(){
        return 'lui-table';
    }

    __filter__ : LuiTableFilter = undefined;
    __header__ : LuiTableHeader = undefined;
    __columnFilters__ : LuiTableColumnFilters = undefined;
    __body__ : LuiTableBody = undefined;

    constructor(element){
        super(element, LuiTable.cssName);

        if(element instanceof HTMLElement){
            this.constructFromDom(element);
        }else if(element.constructor === {}.constructor){
            this.constructFromJson(element);
        }else{
            throw new Error("A LuiTable must be a DOM element or JSON object");
        }
    }
    

    constructFromDom(element : HTMLElement){
        this.columnFilters = new LuiTableColumnFilters(this, element.querySelector('.lui-table-active-filters') as HTMLElement);
        this.TableHeader = new LuiTableHeader(element.querySelector('.lui-table-header') as HTMLElement, this);
        this.FilterEntry = new LuiTableFilter(element.querySelector('.lui-filter') as HTMLElement, this);
        this.__body__ = new LuiTableBody(element.querySelector('.lui-table-body') as HTMLElement, this);

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

    get rows() {
        return this.__body__.children;
    }

}

class LuiEntry extends LuiElement<ILuiElement>{
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
        return super.domElement as HTMLInputElement;
    }
    
}

class LuiTableHead extends LuiElement<LuiTableHeader>{
    private __sorting__ : LUI.sortingOrder = LUI.sortingOrder.none;

    constructor(element : HTMLElement | string, parent : LuiTableHeader){
        super(element);
        this.parent = parent;

        this.on('click', (e) => {
            switch(this.sorting){
                case LUI.sortingOrder.descending:
                    this.sorting = LUI.sortingOrder.ascending;
                    break;
                default:
                    this.sorting = LUI.sortingOrder.descending;
                    
            }
        });
    }

    public get parent(){
        return super.parent as LuiTableHeader;
    }

    public set parent(parent : LuiTableHeader){
        super.parent = parent;
    }

    public set sorting(order : LUI.sortingOrder | number){
        switch(order){
            case 1:
                order = LUI.sortingOrder.descending;
                this.domElement.classList.remove('sort-asc');
                this.domElement.classList.add('sort-desc');
                this.parent.sortedColumn = this;
                break;
            case 2:
                order = LUI.sortingOrder.ascending;
                this.domElement.classList.remove('sort-desc');
                this.domElement.classList.add('sort-asc');
                this.parent.sortedColumn = this;
                break;
            default:
                order = LUI.sortingOrder.none;
                this.domElement.classList.remove('sort-desc');
                this.domElement.classList.remove('sort-asc');
        }
        this.__sorting__ = order;
    }

    public get sorting(){
        return this.__sorting__;
    }

}

class LuiTableHeader extends LuiParentElement<LuiTable, LuiTableHead>{
    __headerElements__ : NodeListOf<HTMLElement> = undefined;
    headers : Array<string> = undefined;


    constructor(element : HTMLElement | string, parentTable : LuiTable){
        super(element);
        this.parent = parentTable;

        if(element instanceof HTMLElement)
            this.constructFromDom(element);

        
    }

    constructFromDom(element : HTMLElement){
        this.__headerElements__ = element.querySelectorAll('.lui-col-header');
        this.headers = [];
        for(var i = 0; i < this.__headerElements__.length; i++){
            this.headers.push(this.__headerElements__[i].innerText);
        }
        this.domElement.querySelectorAll('.lui-col-header').forEach(e => {
            this.children.add(
                new LuiTableHead(e as HTMLElement, this)
            );
        });
    }

    public set sortedColumn(header : LuiTableHead){
        this.children.forEach(e => {
            if(e === header)
                return;

            e.sorting = LUI.sortingOrder.none;
        });
    }

    public get children(){
        return super.children;
    }
    
}

class LuiTableFilterSuggestion extends LuiElement<LuiTable>{

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

class LuiTableFilterSuggestions extends LuiParentElement<LuiTableFilter, LuiTableFilterSuggestion>{
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

    set filterOptions(filters : Array<string>){
        let suggestions = this;
        this.__options__ = [];
        super.children.clear();
        super.domElement.innerHTML = '';
        filters.forEach(function(item, index){
            suggestions.children.add(
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
            this.children.elementAt(this.__markedIndex__).marked = true;
        
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
        return super.children as LUI.ElementChildren<LuiTableFilterSuggestion>;
    }

}

class LuiTableColumnFilter extends LuiElement<LuiTableColumnFilters>{
    __header__ = '';
    __filter__ : string = '';

    constructor(header : string, filter : string){
        super('div');
        this.__header__ = header;
        this.__filter__ = filter;

        this.domElement.innerText = `${this.__header__}:${this.__filter__}`;
    }

    public get filter() {
        return this.__filter__;
    }
}

class LuiTableColumnFilters extends LuiParentElement<LuiTable, LuiTableColumnFilter>{

    __filterMap__ : Map<number, LuiTableColumnFilter> = new Map<number, LuiTableColumnFilter>();

    constructor(parentTable, element : string | HTMLElement = 'div'){
            super(element, 'lui-table-active-filters');
            this.parent = parentTable;
            this.on('click', (e) => {
                let element = LuiParentElement.__domMap__.get(e.target as HTMLElement);

                if(element == this)
                    return;

                this.__filterMap__.forEach((v, k) =>{
                    if(v == element){
                        this.__filterMap__.delete(k);
                        this.parent.rows.forEach(r => 
                            r.children.elementAt(k).filtered = false
                        );
                    }
                        
                        
                });

                element.remove();
            });
    }

    add(index : number, filter : string){
        let newFilter = new LuiTableColumnFilter(
            this.parent.TableHeader.headers[index],
            filter
        );

        this.__filterMap__.set(index, newFilter);
        this.children.add(
            newFilter
        );

        this.parent.rows.forEach(
            r => r.children
                .elementAt(index)
                .tryApplyFilter(newFilter.filter)
        );
    }

}

class LuiTableFilter extends LuiParentElement<LuiTable, ILuiElement>{

    __entry__ : LuiEntry = undefined;
    __button__ : LuiElement<LuiTableFilter> = undefined;
    __suggestions__ : LuiTableFilterSuggestions = undefined;



    constructor(element, parentTable : LuiTable){
        super(
            isNodeOrElement(element) ? element : 'div', 
            'lui-filter'
        );

        super.parent = parentTable;

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
                        this.parent.columnFilters.add(
                            this.__suggestions__.markedIndex,
                            e.target.value
                        );
                        e.target.value = '';
                        this.__suggestions__.clearMarking();
                        (e.target as HTMLInputElement).blur();
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
        this.__suggestions__.filterOptions = this.parent.TableHeader.headers;
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

class LuiTableRowCell extends LuiElement<LuiTableRow>{
    __column__ = undefined;
    __cssNameC__ = 'lui-table-col-';
    private __filtered__ : boolean = false;

    get column(){
        return this.__column__;
    }

    set width(integer){
        this.domElement.classList.forEach((c) => {
            this.domElement.classList.remove(c);
        });
        this.domElement.classList.add(`${this.__cssNameC__}${integer}`);
    }

    constructor(row : LuiTableRow, element){
        super(element, ); //TODO: add class based on column width

        this.parent = row;
        //this.__column__ = column;
        //column.addCell(this);
    }

    remove(){
        this.column.removeCell(this);
        super.remove();
    }

    tryApplyFilter(filter) : boolean{
        let rex = new RegExp(filter);
        if(rex.test(this.domElement.innerText))//(rex.test(lowCase) || rex.test(upCase)))
            return false;
        
        return this.filtered = true;
    }

    public get filtered(){
        return this.__filtered__;
    }

    public set filtered(on){
        let causeChange = on != this.__filtered__;
        this.__filtered__ = on;

        if(causeChange)
            this.filterChange();
    }

    public get content(){
        return this.domElement.innerText;
    }

    public set content(content : string | any){
        if(! (typeof content === 'string'))
            content = content.toString();
        
        this.domElement.innerText = content;
    }

    filterChange(){
        let pChildren = this.parent.children;
        if(this.parent.children.filter((c, i, pChildren) => c.filtered).size)
            this.parent.collapse();
        else
            this.parent.unfold();
    }
}

class LuiTableRow extends LuiParentElement<LuiTableBody, LuiTableRowCell>{

    __collapsed__ = false;
    private __removeOnCollapse__: boolean;

    constructor(element, parentBody : LuiTableBody){
        super(element, 'lui-table-row');

        this.parent = parentBody;

        if(element instanceof HTMLElement)
            this.constructFromDom();
    }

    private constructFromDom() : void{
        this.domElement.querySelectorAll('div').forEach(d => {
            new LuiTableRowCell(this, d);
        });
    }

    set collapsed(col : boolean ){
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
            this.on('transitionend', () => {
                this.domElement.classList.add(LUI.cssClasses.hidden)
                this.domElement.classList.remove('collapse');
                this.clearEventListenersFor('transitionend');
                if(this.__removeOnCollapse__){
                    this.domElement.remove();
                    this.__removeOnCollapse__ = false;
                }
            });
            this.domElement.classList.add('collapse');
            this.__collapsed__ = true;
        }
    }

    unfold(){
        if(this.__collapsed__){
            this.on('transitionend', () => {
                this.domElement.classList.remove('collapse');
                this.clearEventListenersFor('transitionend');
            });
            this.domElement.classList.add('collapse');
            this.domElement.classList.remove(LUI.cssClasses.hidden);
            this.domElement.classList.remove('collapse');
            
            this.__collapsed__ = false;
        }
    }

    addChild(child : LuiTableRowCell){
        super.addChild(child);
    }

    public set collapseAndRemove(active : boolean){
        this.__removeOnCollapse__ = active;
        this.collapsed = true;
    }

}

class LuiTableBody extends LuiParentElement<LuiTable, LuiTableRow>{

    constructor(element : HTMLElement, parentTable : LuiTable){
        let css = 'lui-table-body';
        if(element == undefined || element == null)
            super('div', css);
        else
            super(element, css);
        
        this.parent = parentTable;

        this.domElement.querySelectorAll('.lui-table-row').forEach((r) => {
            this.__children__.add(
                new LuiTableRow(r, this)
            );
        });
    }


    public sortBy(cellIndex : number, order : LUI.sortingOrder, dataType : LUI.sortingType = LUI.sortingType.TEXT) : void{

        //fadeout all rows 
        this.children.forEach( r => r.collapseAndRemove = true);

        //rearrange by order
        let sortable = Array.from<LuiTableRow>(this.children);
        this.children.clear();

        let sorted = sortable.sort((a, b) => {

            let aContent = Array.from<LuiTableRowCell>(a.children)[cellIndex].content;
            let bContent = Array.from<LuiTableRowCell>(b.children)[cellIndex].content;

            let sortingFunc = (a, b) : number => {
                switch(dataType){
                    case LUI.sortingType.DATE:
                        return LUI.sortAsDate(a, b);
                    case LUI.sortingType.NUMBER:
                        return LUI.sortAsNumber(a, b);
                    default:
                        return LUI.sortAsText(a, b);
                }
            };
            
            switch(order){
                case LUI.sortingOrder.descending:
                    return sortingFunc(aContent, bContent);
                default:
                    return -1 * sortingFunc(aContent, bContent);
            }

            return 0;
        });

        //sorted.forEach()

        //insert them in correct order in dom, and in the child set of body

    }
}




