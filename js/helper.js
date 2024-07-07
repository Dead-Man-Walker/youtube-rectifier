
/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

export class Observable{
    _subscriptions;
    constructor(props) {
        this._subscriptions = [];
    }


    subscribe(callable){
        this._subscriptions.push(callable);
    }

    fire(...args){
        for(const subscription of this._subscriptions){
            subscription(...args);
        }
    }
}

export class VideoIdList{
    _videos = [];
    getVideos(){
        return this._videos;
    }
}