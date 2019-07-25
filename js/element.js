class ElementImport extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['src', 'debug'];
    }

    get src() {
        return this.getAttribute('src');
    }

    set src(value) {
        this._src = value;
    }

    get debug() {
        return this.hasAttribute('debug');
    }

    set debug(val) {
        if (val) {
            this.setAttribute('debug', '');
        } else {
            this.removeAttribute('debug');
        }
    }

    connectedCallback() {
        fetch(this.src)
            .then(data => data.text())
            .then(html => {
                this.innerHTML = html

                if (this.hasAttribute('debug')) {
                    console.log("Downloaded! ", this.src);
                }
            });
    }
}

window.customElements.define("m-import", ElementImport);