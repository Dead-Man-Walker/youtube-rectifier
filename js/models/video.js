
export default class Video{
    constructor(params={}){
        this.id = params.id || null;
        this.title = params.title || null;
        this.thumbnail = params.thumbnail || null;
    }
}

