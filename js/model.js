
class Model extends EventTarget{

    static EVENTS = class{
        static VIDEOS_CHANGED = "videosChanged";
        static VIDEO_QUEUE_CHANGED = "videoQueueChanged";
        static VIDEO_HISTORY_CHANGED = "videoHistoryChanged";
        static IDENTIFIERS_CHANGED = "identifiersChanged";
        static SHUFFLE_CHANGED = "shuffleChanged";
    }

    constructor(){
        super();

        this.videos = [];
        this.video_queue = [];
        this.video_history = [];
        this.failed_videos = [];
        this.identifiers = new Set();

        this.shuffle = false;
    }


    getVideos(){
        return this.videos;
    }
    addVideos(videos){
        const start_index = this.videos.length;
        for(let i=0; i<videos.length; i++){
            const video_idx = start_index + i;
            const video = {
                ...videos[i],
                "idx": video_idx
            }
            this.videos.push(video);
            this.video_queue.push(video_idx);
        }

        this.dispatchEvent(new Event(Model.EVENTS.VIDEOS_CHANGED));
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    removeVideos(){
        this.videos = []; // [{idx: <index>, ...}]
        this.videos_queue = []; // [<videos.idx>]
        this.videos_history = []; // [<videos.idx>]

        this.dispatchEvent(new Event(Model.EVENTS.VIDEOS_CHANGED));
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_QUEUE_CHANGED));
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_HISTORY_CHANGED));
    }


    getVideoQueue(index_only=true){
        if(index_only)
            return this.video_queue;
        return this.video_queue.map(v_idx => this.videos[v_idx])
    }
    pushVideoQueue(v_idx){
        this.video_queue.push(v_idx);
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    shiftVideoQueue(index_only=true){
        const v_idx = this.video_queue.shift();
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_QUEUE_CHANGED));
        return index_only ? v_idx : this.videos[v_idx];
    }
    insertVideoQueue(v_idx, idx){
        this.video_queue.splice(idx, 0, v_idx);
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    shuffleVideoQueue(){
        shuffle(this.video_queue);
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_QUEUE_CHANGED));
    }
    resetVideoQueue(){
        this.video_queue = [...Array(this.videos.length).keys()];
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_QUEUE_CHANGED));
    }


    pushVideoHistory(v_idx){
        this.video_history.push(v_idx);
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_HISTORY_CHANGED));
    }
    popVideoHistory(index_only=true){
        const v_idx = this.video_history.pop();
        if(typeof v_idx === 'undefined')
            return null;
        this.dispatchEvent(new Event(Model.EVENTS.VIDEO_HISTORY_CHANGED));
        return index_only ? v_idx : this.videos[v_idx];
    }

    getFailedVideos(){
        return this.failed_videos;
    }
    addFailedVideo(videoId){
        this.failed_videos.push(videoId);
    }

    removeIdentifiers(){
        this.identifiers.clear();
        this.dispatchEvent(new Event(Model.EVENTS.IDENTIFIERS_CHANGED));
    }
    addIdentifier(identifier){
        const len = this.identifiers.size;
        this.identifiers.add(identifier);
        if(len !== this.identifiers.size)
            this.dispatchEvent(new Event(Model.EVENTS.IDENTIFIERS_CHANGED));
    }
    hasIdentifier(identifier){
        return this.identifiers.has(identifier);
    }

    setShuffle(state){
        if(this.shuffle === state)
            return;
        this.shuffle = state;
        this.dispatchEvent(new Event(Model.EVENTS.SHUFFLE_CHANGED));
    }
}

