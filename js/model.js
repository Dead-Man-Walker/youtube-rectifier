
class Model extends EventTarget{
    /*
    Events:
        - videosChanged
        - videoQueueChanged
        - videoHistoryChanged

    */
    constructor(){
        super();

        this.videos = [];
        this.video_queue = [];
        this.video_history = [];
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
        [].push.apply(this.videos, videos);
        [].push.apply(this.video_queue, [...Array(videos.length).keys()]);

        this.dispatchEvent(new Event("videosChanged"));
        this.dispatchEvent(new Event("videoQueueChanged"));
    }
    removeVideos(){
        this.videos = [];
        this.videos_queue = [];
        this.videos_history = [];

        this.dispatchEvent(new Event("videosChanged"));
        this.dispatchEvent(new Event("videoQueueChanged"));
        this.dispatchEvent(new Event("videoHistoryChanged"));
    }

    getVideoQueue(index_only=true){
        if(index_only)
            return this.video_queue;
        return this.video_queue.map(v_idx => this.videos[v_idx])
    }
    pushVideoQueue(v_idx){
        this.video_queue.push(this.videos[v_idx]);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }
    shiftVideoQueue(index_only=true){
        const v_idx = this.video_queue.shift();
        this.dispatchEvent(new Event("videoQueueChanged"));
        return index_only ? v_idx : this.videos[v_idx];
    }
    insertVideoQueue(v_idx, idx){
        this.video_queue.splice(idx, 0, v_idx);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }
    shuffleVideoQueue(){
        shuffle(this.video_queue);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }

    pushVideoHistory(v_idx){
        this.video_history.push(v_idx);
        this.dispatchEvent(new Event("videoHistoryChanged"));
    }
    popVideoHistory(index_only=true){
        const v_idx = this.video_history.pop();
        this.dispatchEvent(new Event("videoHistoryChanged"));
        return index_only ? v_idx : this.videos[v_idx];
    }
}

