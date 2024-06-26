namespace LUI{

    enum httpCodes{
        OK = 200,
        BAD_REQUEST = 400,
        UNAUTHORIZED = 401,
        FORBIDDEN = 403,
        NOT_FOUND = 404,

    }

    enum httpMethod{
        GET = 'GET',
        PUT = 'PUT',
        POST = 'POST',
        DELETE = 'DELETE'
    }

    enum controlTypes{
        NAV_BAR = 'NavBarInfo',
        NAV_BAR_LINK = 'NavBarLinkInfo',
        FORM = 'Form',
        TABLE = 'Table',
    }

    enum entryTypes{
        EMAIL = 'email',
        PASSWORD = 'password',
        INTEGER = 'number',
        DECIMAL = 'decimal',
        TEXT = 'text',
        DATE = 'date'
    }

    export enum cssClasses {
        hidden = 'lui-hidden',
        ACTIVE = 'active',
        INACTIVE = 'inactive'
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

    enum side{
        RIGHT = 'right', 
        LEFT = 'left'
    };

    export interface IAjaxClient{
        onSuccess : Function;
        onError : Function;

        get(url : string) : void;
        put(url: string, data : object) : void;
        delete(url : string) : void;
        post(url : string, data : object) : void;
    }

    export class AjaxClient implements IAjaxClient{

        private __onSuccess__: Function = undefined;
        private __onError__: Function = undefined;

        protected handleCallBack(response : Response){
            if(response.status == httpCodes.OK)
                this.__onSuccess__(response.json());
            else
                this.__onError__(response.json());
        }

        public set onSuccess(method : Function){
            this.__onSuccess__ = method;
        }

        public set onError(method : Function){
            this.__onError__ = method;
        }

        protected call(url : string, method : httpMethod, data : object = undefined){
            let configuration = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            } as RequestInit;

            configuration.credentials = 'same-origin';

            if(data != undefined)
                configuration['body'] = JSON.stringify(data);

            fetch(url, configuration)
            .then(response => response.json())
            .then(this.handleCallBack)
            .catch(e => console.log(`${method} failed to reach the server`))
        }

        public get(url: string) {
            this.call(url, httpMethod.GET);
        }
        public put(url: string, data: object) {
            this.call(url, httpMethod.PUT, data);
        }
        public delete(url: string) {
            this.call(url, httpMethod.DELETE);
        }
        public post(url: string, data: object) {
            this.call(url, httpMethod.POST, data);
        }
        
    }

    export interface IOrderedSet<T> extends Set<T>{

        add(element) : any;
        remove(element : T) : number;
        has(element : T) : boolean;
        elementAt(index : number) : T;
        insert(index : number, element : T);
        //filter<S extends T>(callbackfn: (value: T, index: number, IOrderedSet: IOrderedSet<T>) => value is S, thisArg?: any): IOrderedSet<S>;
        filter(callbackfn: (value: T, index: number, iOrderedSet : IOrderedSet<T>) => unknown, thisArg? : any): IOrderedSet<T>;
        sort(compareFn?: (a: T, b: T) => number) : this;
        indexOf(element: T) : number;

    }

    export class OrderedSet<T> implements IOrderedSet<T>{
        
        
        public static from<S>(arr : Array<S>) : OrderedSet<S>{
            let result = new OrderedSet<S>();
            result.__data__ = arr; 
            return result;
        }
        
        private __data__ : Array<T> = new Array<T>();
        private __iteratingCurrent__: any;

        indexOf(element: T) : number{
            return this.__data__.indexOf(element);
        }

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

        sort(compareFn?: (a: T, b: T) => number): this {
            this.__data__ = this.__data__.sort(compareFn);
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

    export class ElementChildren<T extends LUI.ILuiElement> extends OrderedSet<T>{
        private __element__: HTMLElement;
        private __parent__ : LUI.ILuiElement;

        private __onSizeChange__ : (old : number, current : number) => any;

        constructor(element : LUI.ILuiElement){
            super();
            this.__element__ = element.domElement;
            this.__parent__ = element;
        }

        add(child : T) : number{
            let oldSize = this.size;
            let index = super.add(child);

            if(!this.__element__.contains(child.domElement) && index > -1)
                this.__element__.appendChild(child.domElement);

            if(child.parent != this.__parent__)
                child.parent = this.__parent__;
            
            this.handleSizeChange(oldSize);
            return index;
        }

        remove(child : T) : number{
            let oldSize = this.size;
            let index = super.remove(child);

            if(index < 0)
                return index;
               
            child.domElement.remove();
            delete child.parent;

            this.handleSizeChange(oldSize);

            return index;
        }

        insert(index : number, child : T) : boolean{
            let oldSize = this.size;
            let result = super.insert(index, child);
            if(result)
                this.__element__.insertBefore(
                    child.domElement,
                    this.__element__.children[index + 1]
                );

            this.handleSizeChange(oldSize);

            return result;
        }

        clear() : void{
            let oldSize = this.size;
            this.forEach(c => c.remove());
            super.clear();
            this.handleSizeChange(oldSize);
        }

        sort(compareFn?: (a: T, b: T) => number): this {

            super.sort(compareFn);

            this.__element__.childNodes.forEach(e => e.remove());
            this.forEach(e => this.__element__.appendChild(e.domElement));

            return this;
        }

        public set onSizeChange(callback : (old : number, current : number) => any){
            this.__onSizeChange__ = callback;
        }

        private handleSizeChange(oldSize : number){
            if(this.__onSizeChange__ != undefined && this.size != oldSize)
                this.__onSizeChange__(oldSize, this.size);
        }

       

    }

    export interface IControlInfo{
        Type : string;
    }

    abstract class ControlInfo implements IControlInfo{
        public abstract get Type() : string;
    }

    class NavBarInfo extends ControlInfo{
        public get Type(): string {
            return 'NavBarInfo';
        }
        
        public Links : Array<NavBarLinkInfo>;
    }

    class NavBarLinkInfo extends ControlInfo{

        public get Type() : string{
            return 'NavBarLinkInfo';
        }

        public Label : string;
        public URL : string;
    }

    class FormInfo extends ControlInfo{
        public get Type(): string {
            return 'FormInfo'
        }

        public Title : string;
        public SubmitUrl : string;
        public Entries : Array<EntryInfo>;
    }

    class EntryInfo extends ControlInfo{
        public get Type() : string{
            return 'EntryInfo';
        }

        public EntryType : entryTypes;
        public Name : string;
        public Label : string;
        public Key : boolean;
    }

    export interface ILuiElement{
        domElement : HTMLElement;
        cssName : string;
        children : LUI.ElementChildren<LUI.ILuiElement>;
        remove();
        parent : LUI.ILuiElement;
    }

    
    export class LuiElement<Tparent extends LUI.ILuiElement> implements LUI.ILuiElement{
        static __domMap__ = new Map<HTMLElement, LUI.ILuiElement>();
    
        private __active__ : boolean;
        private __eventListeners__ = [];
        private __parent__ : Tparent;
        private __domElement__ : HTMLElement; 
        private __cssName__ : string;
        protected __children__ : LUI.ElementChildren<LUI.ILuiElement> = undefined;
    
        constructor(element : string | HTMLElement, cssName : string = undefined, cssSecondaries : Array<string> = undefined){
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
    
            if(cssSecondaries != undefined)
                cssSecondaries.forEach(css => this.domElement.classList.add(css));

            this.__children__ = new LUI.ElementChildren<LUI.ILuiElement>(this);
    
            LUI.LuiElement.__domMap__.set(this.__domElement__, this);
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

        public get active(){
            return this.__active__;
        }

        public set active(active){
            if(this.__active__ != active && active)
                this.domElement.classList.add('active');
            else if(this.__active__ != active && !active)
                this.domElement.classList.remove('active');

            this.__active__ = active;
        }
    
        public hide(milliseconds : number = undefined, callback : CallableFunction = undefined) : void{
            if(milliseconds == undefined){
                this.domElement.classList.add(cssClasses.hidden)
                if(callback != undefined)
                    callback();
                return;
            }

            this.domElement.style.transition = `opacity ${milliseconds}ms`;
            let previousValue = this.domElement.style.opacity;
            this.on('transitionend', e => {
                this.domElement.style.opacity = previousValue;
                this.domElement.style.transition = '';
                this.clearEventListenersFor('transitionend');
                this.hide();
            });
            this.domElement.style.opacity = '0';
                
        }

        public show(milliseconds : number = undefined, callback : CallableFunction = undefined) : void{
            if(milliseconds == undefined){
                this.domElement.classList.remove(cssClasses.hidden);
                if(callback != undefined)
                    callback();
                return;
            }

            let previousValue = this.domElement.style.opacity;
            let previousTrans = this.domElement.style.transition;
            this.domElement.style.opacity = '0';
            this.domElement.style.transition = `opacity ${milliseconds}ms`;

            this.on('transitionend', e => {
                this.domElement.style.transition = previousTrans;
                this.clearEventListenersFor('transitionend');
            });

            this.domElement.classList.remove(cssClasses.hidden);
            this.domElement.style.opacity = previousValue;
            
            
        }

        public remove(){
            
            this.children.clear();
    
            if(this.parent != null || this.parent != undefined)
                this.parent.children.delete(this);
            
            LUI.LuiParentElement.__domMap__.delete(this.domElement);
    
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

    export class LuiParentElement<Tparent extends LUI.ILuiElement, Tchild extends LUI.ILuiElement> extends LUI.LuiElement<Tparent>{

        protected __children__ : LUI.ElementChildren<Tchild>;
    
        get children(){
            return this.__children__ as LUI.ElementChildren<Tchild>;
        }
    
    
        constructor(element : string | HTMLElement, cssName : string = undefined, cssSecondaries : Array<string> = undefined){
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

    export class App extends LuiParentElement<ILuiElement, ILuiElement>{

        private __navBarIndex__ : number;
        private __contentIndex__ : number;

        constructor(navLinks : IControlInfo){

            //let links = JSON.parse(navLinks) as IControlInfo;

            super(document.body);
            this.addNavBar();
            this.addContent();

            let links = navLinks;// as IControlInfo;

            if(typeof links === 'string')
                links = JSON.parse(links);

            switch(links.Type)
            {
                case controlTypes.NAV_BAR:
                    this.navbar.configureLinks((links as NavBarInfo).Links);
                    break;
                default:
                    let control = new Emphasized();
                    control.children.add(new Form(links as FormInfo));
                    this.content.historyStack.children.add(control);
            }


        }

        protected addNavBar() : void{
            this.__navBarIndex__ = this.children.add(new NavBar());
        }

        protected addContent() : void{
            this.__contentIndex__ = this.children.add(new Content());
        }

        public get navbar(){
            return this.children.elementAt(this.__navBarIndex__) as NavBar;
        }

        public get content(){
            return this.children.elementAt(this.__contentIndex__) as Content;
        }


    }

    class NavBar extends LuiParentElement<App, LuiElement<NavBar>>{

        private __navigationIndex__ : number;
        private __mobileBackIndex__ : number;

        constructor(title : string = 'Untitled'){
            super('div', 'lui-nav-bar');
            this.domElement.classList.add('lui-row');
            
            this.addMobileBackNavigation();
            this.addHeader(title);
            this.addNavigation();
        }

        protected addMobileBackNavigation(){
            this.__mobileBackIndex__ = this.children.add(new NavBarLeftMobile());
        }

        protected addHeader(title : string){
            this.children.add(new NavBarTitleArea(title));
        }

        protected addNavigation(){
            this.__navigationIndex__ = this.children.add(new NavBarNavigationArea());
        }

        public get mobileBack(){
            return this.children.elementAt(this.__mobileBackIndex__).children.elementAt(0) as NavBarMobileBack;
        }

        public get navigation(){
            return this.children.elementAt(this.__navigationIndex__) as NavBarNavigationArea;
        }

        public configureLinks(links : Array<NavBarLinkInfo>){
            let area = this.navigation.menu.linkArea;
            links.forEach(link => {
                if(link != undefined){
                    this.navigation.menu.linkArea.children.add(
                        new NavBarMenuLink(
                            link.Label,
                            link.URL
                        )
                    );
                }
            });
        }

        public set navigation(nav){
            
        }

    }

    class NavBarLeftMobile extends LuiParentElement<NavBar, NavBarMobileBack>{
        constructor(){
            super('div', 'lui-nav-bar-mobile-left');
            this.children.add(new NavBarMobileBack());
        }
    }

    class NavBarMobileBack extends LuiElement<NavBarLeftMobile>{
        constructor(label : string = 'Tilbage'){
            super('div', 'lui-nav-back');
            this.domElement.textContent = label;
            this.hide();
        }
    }

    class NavBarTitleArea extends LuiParentElement<NavBar, NavBarHeader>{
        constructor(label : string){
            super('div', 'lui-nav-bar-title');
            this.addHeader(label);
        }

        protected addHeader(label : string){
            this.children.add(new NavBarHeader(label));
        }
    }

    class NavBarHeader extends LuiElement<NavBarTitleArea>{

        constructor(label : string){
            super('h3', 'lui-nav-header');
            this.domElement.textContent = label;
        }
    }

    class NavBarNavigationArea extends LuiParentElement<NavBar, NavBarMenu>{

        constructor(){
            super('div', 'lui-nav-bar-navigation');
            this.addMenu();
        }

        protected addMenu(){
            this.children.add(new NavBarMenu());
        }

        public get menu(){
            return this.children.elementAt(0) as NavBarMenu;
        }
    }

    class NavBarMenu extends LuiParentElement<NavBarNavigationArea, NavBarMenuLinkArea>{

        private _linkAreaIndex__ : number;

        constructor(){
            super('div', 'lui-nav-bar-menu');
            this.addLinkArea();
            this.configureActivation();

        }

        protected configureLinks(data) : void{
            for( let page in data['pages']){
                this.linkArea.addChild(
                    new NavBarMenuLink(page['label'], page['link'] as unknown as string)
                );
            }
        }

        public get linkArea(){
            return this.children.elementAt(this._linkAreaIndex__);
        }

        protected addLinkArea() : void{
            this._linkAreaIndex__ = this.children.add(new NavBarMenuLinkArea());
        }

        protected configureActivation(){
            this.on('click', e => {
                let shadow = this.parent.parent.parent.content.contentShadow;
                
                let newState = !this.active;

                this.active = newState;
                this.parent.parent.parent.content.contentShadow.active = newState;

            });
        }
    }

    class NavBarMenuLinkArea extends LuiParentElement<NavBarMenu, NavBarMenuLink>{
        constructor(){
            super('div', 'lui-nav-bar-link-area')
            this.cancelClickPropagation();
        }

        protected cancelClickPropagation(){
            this.on('click', e => {
                e.stopPropagation();
            });
        }
    }

    class NavBarMenuLink extends LuiElement<NavBarMenuLinkArea>{
        private __inactive__ : boolean;

        constructor(label : string = '', link : string){
            super('a');
            this.domElement.setAttribute('href', `#${link}`)
            this.domElement.textContent = label;
            this.__inactive__ = false;
            this.configureNavigation();
        }

        public get inactive(){
            return this.__inactive__;
        }

        public set inactive(state : boolean){
            if(state == this.inactive)
                return;

            if(state){
                this.active = false;
                this.domElement.classList.add(cssClasses.INACTIVE);
            }
            else{
                this.domElement.classList.remove(cssClasses.INACTIVE);
            }
                

            this.__inactive__ = state;
        }

        public set active(state : boolean){
            if(state)
                this.inactive = false;
            
            super.active = state;
        }

        protected configureNavigation(){
            this.on('click', e => {

                this.parent.children.forEach(c => {
                    if(c != this)
                        c.inactive = true;
                });

                this.active = true;
            });
        }
    }

    class Content extends LuiParentElement<App, LuiElement<Content>>{

        private __leftSideBarIndex__ : number;
        private __rightSideBarIndex__ : number;
        private __historyStackIndex__ : number;
        private __focusShadowIndex__ : number;
        private __contentShadowIndex__ : number;

        constructor(){
            super('div', 'lui-content');
            this.domElement.classList.add('lui-row');

            this.addShadows();
            this.addSidebarLeft();
            this.addHistoryStack();
            this.addSidebarRight();
        }

        protected addShadows() : void{
            this.__contentShadowIndex__ = this.children.add(new ContentShadow());
            this.__focusShadowIndex__ = this.children.add(new FocusedShadow());
        }

        protected addSidebarLeft(width : number = 2) : void{
            this.__leftSideBarIndex__ = this.children.add(new SideBar(side.LEFT, width));
        }

        protected addHistoryStack() : void{
            this.__historyStackIndex__ = this.children.add(new HistoryStack());
        }

        protected addSidebarRight(width : number = 2) : void{
            this.__rightSideBarIndex__ = this.children.add(new SideBar(side.RIGHT, width));
        }

        public get leftSidebar(){
            return this.children.elementAt(this.__leftSideBarIndex__) as SideBar;
        }

        public get rightSidebar(){
            return this.children.elementAt(this.__rightSideBarIndex__) as SideBar;
        }

        public get historyStack(){
            return this.children.elementAt(this.__historyStackIndex__) as HistoryStack;
        }

        public get focusShadow(){
            return this.children.elementAt(this.__focusShadowIndex__) as FocusedShadow;
        }

        public get contentShadow(){
            return this.children.elementAt(this.__contentShadowIndex__) as ContentShadow;
        }

    }

    class ContentShadow extends LuiElement<Content>{
        
        constructor(){
            super('div', 'lui-content-shadowed');
        }

        
    }

    class FocusedShadow extends LuiElement<Content>{
        constructor(){
            super('div', 'lui-focused-shadow');
        }
    }

    class SideBar extends LuiElement<Content>{
        protected __width__ : number;
        protected __side__ : side;

        constructor(side : side, width : number){
            super('div', `lui-sidebar-${side}`);
            this.width = width;
            this.__side__ = side;
        }

        public set width(width : number){
            //let opposite = this.__side__ == side.LEFT ? this.parent.rightSidebar : this.parent.leftSidebar;
            //let maxWidth = (12 - opposite.width);

            //if(width > maxWidth)
            //    width = maxWidth;

            //if()

            this.__width__ = width;
            let rex = new RegExp('lui-col-[0-9]+');
            this.domElement.classList.forEach((c) => {
                if(rex.test(c))
                    this.domElement.classList.remove(c);
            });
            this.domElement.classList.add(`lui-col-${width}`);
        }

        public get width(){
            return this.__width__;
        }
    }

    class HistoryStack extends LuiParentElement<Content, Emphasized>{
        protected __width__ : number;

        constructor(width : number = 8){
            super('div', 'lui-history-stack');
            this.width = width;
            this.configureButtonHiding();
        }

        protected configureButtonHiding(){
            this.children.onSizeChange = (old, current) => {
                if(current < 2)
                    this.parent.parent.navbar.mobileBack.hide(100);
                else
                    this.parent.parent.navbar.mobileBack.show(100);
            };
        }

        public set width(width : number){
            if(width == this.__width__)
                return;

            let rex = new RegExp('lui-col-[0-9]+');
            this.domElement.classList.forEach(c =>  {
                if(rex.test(c))
                    this.domElement.classList.remove(c);
            });

            this.domElement.classList.add(`lui-col-${width}`)
            this.__width__ = width;
        }

        public back() : void{
            if(this.children.size <= 1)
                return;

            let fadeOut = this.children.elementAt(this.children.size - 1);
            let fadeIn = this.children.elementAt(this.children.size - 2);

            if(this.children.size <= 2){
                this.parent.parent.navbar.mobileBack.hide(100);
                this.parent.focusShadow.hide(100); //originally using class inactive
            }
            
            
            fadeOut.hide(200, () => {
                fadeIn.show(200);
                fadeOut.remove();
            });

        }
    }

    class Emphasized extends LuiParentElement<HistoryStack, ILuiElement>{

        constructor(){
            super('div', 'lui-emphasized');
        }

    }

    class Form extends LuiParentElement<Emphasized, ILuiElement>{
        constructor(info : FormInfo){
            super('form', 'lui-form', [ 'lui-centered' ]);
            this.configureTitle(info.Title);
        }

        protected configureTitle(title : string) : void{
            this.children.add(new FormHeader(title));
        }
        
        protected configureEntries(entries : Array<EntryInfo>) : void{
            entries.forEach(entry => this.children.add(new FormEntry(entry)));
        }

        public get data() : object {
            let data = {};

            this.children.filter(e => e instanceof FormEntry).forEach(e => {
                let element = e as FormEntry;
            });


            return {};
        }
    }

    class FormHeader extends LuiElement<Form>{
        constructor(title : string = 'Untitled'){
            super('h4', 'lui-header');
            this.domElement.textContent = title;
        }
    }

    class FormEntry extends LuiParentElement<Form, ILuiElement>{
        
        protected __inputIndex__ : number;

        constructor(info : EntryInfo){
            super('div', 'lui-row');
            this.configureLabel(info.Label);
        }

        public get entry() : EntryField{
            return this.children.elementAt(this.__inputIndex__) as EntryField;
        }

        public get name() : string{
            return this.entry.domElement.name;
        }

        public get value() : string | Date | number {
            if(this.entry.domElement.type == entryTypes.DATE)
                return this.entry.domElement.valueAsDate;
            else if(this.entry.domElement.type === entryTypes.DECIMAL ||
                    this.entry.domElement.type === entryTypes.INTEGER)
                return this.entry.domElement.valueAsNumber;
            else
                return this.entry.domElement.value;
        }

        protected configureLabel(text : string){
            this.children.add(new EntryLabel(text));
        }

    }

    class EntryLabel extends LuiElement<FormEntry>{
        constructor(text : string){
            super('label', 'lui-col-4');
            this.domElement.textContent = text;
        }
    }

    class EntryField extends LuiElement<FormEntry>{
        constructor(type : entryTypes, name : string, initialValue : any){
            super('input', 'lui-col-8');
            this.domElement.type = type;
            this.domElement.name = name;       
        }

        public get domElement() : HTMLInputElement{
            return super.domElement as HTMLInputElement;
        }

    }

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
/*document.getElementsByClassName('lui-nav-back')[0].addEventListener('click', function(e){
    navigateBack();
});*/


//enables activation/deactivation of the navigation menu by pressing the burgermenu (before area of the lui-nav-bar-menu)
/*document.getElementsByClassName('lui-nav-bar-menu')[0].addEventListener('click', function(e){
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
});*/



//Prevents activation/deactivation of the nav menu by clicking the navigation area
/*document.getElementsByClassName('lui-nav-bar-link-area')[0].addEventListener('click', function(e){
    e.stopPropagation();
});*/


/*document.getElementsByClassName('lui-nav-bar-link-area')[0].addEventListener('click', function(e){
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
});*/

// Table Logic
class LuiTable extends LUI.LuiParentElement<LUI.ILuiElement, LUI.ILuiElement>{
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

    get body(){
        return this.__body__;
    }

}

class LuiEntry extends LUI.LuiElement<LUI.ILuiElement>{
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

class LuiTableHead extends LUI.LuiElement<LuiTableHeader>{
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

class LuiTableHeader extends LUI.LuiParentElement<LuiTable, LuiTableHead>{
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
    //TODO: make this code call 'LuiTableBody.sort' when set.
    public set sortedColumn(header : LuiTableHead){
        this.children.forEach(e => {
            if(e === header)
                return;

            e.sorting = LUI.sortingOrder.none;
        });

        this.parent.body.sortBy(
            this.children.indexOf(header),
            header.sorting
        );
    }

    public get children(){
        return super.children;
    }
    
}

class LuiTableFilterSuggestion extends LUI.LuiElement<LuiTable>{

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

class LuiTableFilterSuggestions extends LUI.LuiParentElement<LuiTableFilter, LuiTableFilterSuggestion>{
    cssInactive = 'inactive';
    __state__ = false;
    __options__ = [];
    __markedIndex__ = -1;

    constructor(element, filterOptions = []){
        super(
            'ul',
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

class LuiTableColumnFilter extends LUI.LuiElement<LuiTableColumnFilters>{
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

class LuiTableColumnFilters extends LUI.LuiParentElement<LuiTable, LuiTableColumnFilter>{

    __filterMap__ : Map<number, LuiTableColumnFilter> = new Map<number, LuiTableColumnFilter>();

    constructor(parentTable, element : string | HTMLElement = 'div'){
            super(element, 'lui-table-active-filters');
            this.parent = parentTable;
            this.on('click', (e) => {
                let element = LUI.LuiParentElement.__domMap__.get(e.target as HTMLElement);

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

class LuiTableFilter extends LUI.LuiParentElement<LuiTable, LUI.ILuiElement>{

    __entry__ : LuiEntry = undefined;
    __button__ : LUI.LuiElement<LuiTableFilter> = undefined;
    __suggestions__ : LuiTableFilterSuggestions = undefined;



    constructor(element, parentTable : LuiTable){
        super(
            'div', 
            'lui-filter'
        );

        super.parent = parentTable;

        
        this.constructFromDom(element);
        
    }

    constructFromDom(element){
        this.__entry__ = new LuiEntry(element.querySelector('input'));
        this.__button__ = new LUI.LuiElement(element.querySelector('div'));
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

class LuiTableRowCell extends LUI.LuiElement<LuiTableRow>{
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

class LuiTableRow extends LUI.LuiParentElement<LuiTableBody, LuiTableRowCell>{

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

}

class LuiTableBody extends LUI.LuiParentElement<LuiTable, LuiTableRow>{

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


        this.children.sort((a, b) => {

            let aContent = a.children.elementAt(cellIndex).content;
            let bContent = b.children.elementAt(cellIndex).content;

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

    }
}




