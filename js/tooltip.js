
export default function Tooltip(props){
    return {
        tooltip: props.tooltip ?? '',
        delayMs: props.delayMs ?? 500,
        _$tooltipEl: null,
        _$parentEl: null,
        _timeoutId: null,

        mounted($parentEl){
            this._$parentEl = $parentEl;
            this._addEventListeners();
        },

        _assertInit(){
            if(!this._$parentEl)
                throw Error('Tooltip has not been initialized correctly');
        },

        _addEventListeners(){
            this._assertInit();
            this._$parentEl.classList.add('tooltip-parent')
            this._$parentEl.addEventListener('click', () => this.toggle());
            this._$parentEl.addEventListener('mouseenter', () => this.showDelayed());
            this._$parentEl.addEventListener('mouseleave', () => this.hide());
        },

        _clearTimeout(){
            if(this._timeoutId)
                window.clearTimeout(this._timeoutId);
        },

        isShown(){
            return this._$tooltipEl !== null;
        },

        show(){
            this._assertInit();

            if(this.isShown())
                return;

            this._clearTimeout();
            this._$tooltipEl = document.createElement('DIV');
            this._$tooltipEl.classList.add('tooltip');
            this._$tooltipEl.innerHTML = this.tooltip;
            this._$parentEl.appendChild(this._$tooltipEl);
        },

        showDelayed(){
            this._assertInit();
            
            if(!this.delayMs){
                this.show();
            }else{
                this._clearTimeout();
                this._timeoutId = window.setTimeout(()=>this.show(), this.delayMs);
            }
        },

        hide(){
            this._assertInit();
            this._clearTimeout();

            if(!this.isShown())
                return;

            this._$tooltipEl.remove();
            this._$tooltipEl = null;
        },

        toggle(){
            this._assertInit();

            if(this.isShown()){
                this.hide();
            }else{
                this.show();
            }
        }
    };
}