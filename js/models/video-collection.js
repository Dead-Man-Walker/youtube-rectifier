
export default class VideoCollection extends EventTarget{

    static EVENTS = class{
        static VIDEO_QUEUE_CHANGED = "videoQueueChanged";
    }

    constructor(videoListController){
        super();
        this._videoListController = videoListController;
        this._videoIdQueue = [];
    }

    get length(){
        return this._videoIdQueue.length;
    }

    *iterVideos(){
        let video;
        for(const videoId of this._videoIdQueue) {
            video = this._videoListController.model.getVideo(videoId);
            if(video)
                yield video;
        }
    }
    *iterVideoIds(){
        for(const videoId of this._videoIdQueue)
            yield videoId;
    }

    getVideos(){
        return Array.from(this.iterVideos());
    }
    getVideosIds(){
        return Array.from(this._videoIdQueue);
    }
    hasVideo(video){
        return this._videoIdQueue.includes(video.id);
    }
    hasVideoId(videoId){
        return this._videoIdQueue.includes(videoId);
    }


    pushVideo(video){
        this._videoIdQueue.push(video.id);
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    pushVideoId(videoId){
        this._videoIdQueue.push(videoId);
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    pushVideos(videos){
        for(const video of videos)
            this._videoIdQueue.push(video.id);
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    pushVideoIds(videoIds){
        for(const videoId of videoIds)
            this._videoIdQueue.push(videoId);
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
    }

    clear(){
        if(!this._videoIdQueue.length)
            return;
        this._videoIdQueue = [];
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    removeVideo(video){
        let queueLength = this._videoIdQueue.length;
        this._videoIdQueue = this._videoIdQueue.filter(videoId => videoId !== video.id);
        if(queueLength !== this._videoIdQueue.length)
            this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    removeVideoId(videoId){
        let queueLength = this._videoIdQueue.length;
        this._videoIdQueue = this._videoIdQueue.filter(queuedVideoId => queuedVideoId !== videoId);
        if(queueLength !== this._videoIdQueue.length)
            this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    popVideo(){
        if(!this._videoIdQueue.length)
            return null;

        let video = null;
        while(this.length > 0 && video === null) {
            video = this._videoListController.model.getVideo(this._videoIdQueue.pop());
        }

        if(video === true)
            return null;

        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEO_QUEUE_CHANGED));
        return video;
    }
}

