import VideoCollection from "./video-collection.js";
import {shuffle} from "../utility/datastructure-operations.js";

export default class VideoQueue extends VideoCollection{

    static EVENTS = class extends VideoCollection.EVENTS{
        static SHUFFLE_CHANGED = "shuffleChanged";
    }

    constructor(video_list_controller){
        super(video_list_controller);
        this._isShuffled = false;
    }

    shuffle(){
        this._shuffleArray(this._videoIdQueue);
        this._isShuffled = true;
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
        this.dispatchEvent(new Event(this.constructor.EVENTS.SHUFFLE_CHANGED));
    }
    restoreOrder(){
        let orderedQueue = new Array(this._videoIdQueue.length);
        let i = 0;
        for(const videoId of this._videoListController.model.iterVideoIds()){
            if(this.hasVideoId(videoId))
                orderedQueue[i++] = videoId;
        }
        this._videoIdQueue = orderedQueue;
        this._isShuffled = false;
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
        this.dispatchEvent(new Event(this.constructor.EVENTS.SHUFFLE_CHANGED));
    }
    isShuffled(){
        return this._isShuffled;
    }
    isOrdered(){
        return !this._isShuffled;
    }

    _shuffleArray(array){
        shuffle(array);
    }
}

