export class CacheGetter {
    static _instanceCache;


    static runPyScript(input){
        var jqXHR = $.ajax({
            type: "POST",
            url: "/createCache.py",
            async: false,
            data: { param: input }
        });
    
        return jqXHR.responseText;
    }

    static get_instance() {
        if (!this._instanceCache) {
            this._instanceCache = "xd";
            this._instanceCache = this.runPyScript();
        }

        return this._instanceCache;
    }

    invoke() {};
}