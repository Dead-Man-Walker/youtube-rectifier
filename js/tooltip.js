
function Tooltip(props){
    return {
        tooltip: props.tooltip ?? '',
        delayMs: props.delayMs ?? 1000,

        mounted(){
            console.log(this);
            //this.$refs.el.addEventListener('click', () => this.toggle());
        },

        show(){
            console.log("Tooltip show", this)
        },

        hide(){
            console.log("Tooltip hide", this)

        },

        toggle(){
            console.log("Tooltip toggle", this)

        }
    };
}

PetiteVue.createApp({Tooltip}).mount();

/*
class _Tooltip{

    static DATA_ATTRIBUTE = 'tooltip';
    static DEFAULT_STYLES = `
        padding: 5px;
        color: black;
        background: rgba(150,150,150,0.7);
        border-radius: 8px;
    `;
    static OPTIONS = {
        tooltipClass: 'tooltip',
        enableDefaultStyles: true,
        delayMs: 1000
    };

    constructor(options={}){
        this.options = Object.assign(Tooltip.OPTIONS, options);

        this._elementToTooltip = {};
        this._appendStyles();

    }

    applyOnElement(element){
        element.addEventListener('mouseenter', this.createTooltip)
        element.addEventListener('mouseleave', this.removeTooltip)
    }
    applyOnElementAndChildren(element){
        document.querySelectorAll(`[data-${Tooltip.DATA_ATTRIBUTE}]`).forEach(this.applyOnElement.bind(this));
    }
    applyAll(){
        this.applyOnElementAndChildren(document.body);
    }

    _appendStyles(){
        const style_el = document.createElement('STYLE');
        const default_styles = this.options.enableDefaultStyles ? Tooltip.DEFAULT_STYLES : '';
        style_el.innerText = `
            .${this.options.tooltipClass}{
                position: absolute;
                ${default_styles}
            }
        `;
        document.body.appendChild(style_el);
    }

    createTooltip = (event) => {
        const source_el = event.currentTarget;
        const timeout_id = window.setTimeout(()=>{
            this.showTooltip(source_el, [event.layerX, event.layerY])
        }, this.options.delayMs);
        this._elementToTooltip[source_el] = {
            tooltipElement: null,
            timeoutId: timeout_id
        };
    }
    showTooltip = (source_el, xy_position) => {
        const tt_el = document.createElement('DIV');
        tt_el.innerHTML = source_el.dataset[Tooltip.DATA_ATTRIBUTE];
        tt_el.className = 'tooltip';
        const [x, y] = xy_position;
        tt_el.style.left = x.toString() + 'px';
        tt_el.style.top = y.toString() + 'px';

        const data = this._elementToTooltip[source_el];
        if(typeof data === 'undefined')
            return;
        data.tooltipElement = tt_el;
        data.timeoutId = null;
        source_el.appendChild(tt_el);
    }
    removeTooltip = (event) => {
        const source_el = event.currentTarget;
        const data = this._elementToTooltip[source_el];
        if(typeof data === 'undefined')
            return;
        if(data.tooltipElement !== null) {
            data.tooltipElement.remove();
        }
        if(data.timeoutId !== null){
            window.clearTimeout(data.timeoutId);
        }
        delete this._elementToTooltip[source_el];
    }
}
 */