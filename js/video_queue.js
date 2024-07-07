import {VideoIdList} from "./helper.js";

export default function VideoQueue(props){
    return {
        autoplay: true,
        videoIdList: new VideoIdList(),

        mounted(){
            //this.Store.onVideoAdded.subscribe(this._onVideoAdded.bind(this));
            this.onPlayerStateChange.subscribe(this._onPlayerStateChange.bind(this));
            this.videoIdList.getVideos = () => {
                return this.Store.videoIdsQueued.getVideos().concat(this.Store.videoIdsUnplayed.getVideos());
            };
        },


        _onPlayerStateChange(state){
            switch(state){
                case 'ENDED':
                    if(this.autoplay)
                        this.playNext();
            }
        },

        _onQueueEnded(){

        },

        onClickVideo(video){
            this._playVideo(video);
        },

        playNext(){
            const nextVideo = this.Store.videoIdsQueued._videos.shift() || this.Store.videoIdsUnplayed._videos.shift();

            if(nextVideo){
                this._playVideo(nextVideo);
            }else{
                this._onQueueEnded();
            }
        },

        playPrevious(){
            const previousVideo = this.Store.videoIdsPlayed._videos.pop();

            if(previousVideo){
                if(this.currentVideo)
                    this.Store.videoIdsQueued._videos.unshift(this.currentVideo.id)

                this._playVideo(previousVideo, false);
            }
        },

        _playVideo(video, addToHistory=true){
            if(addToHistory)
                this._addCurrentVideoToHistory();

            if(!video)
                return false;

            return this.playVideo(video);
        },

        _addCurrentVideoToHistory(){
            if(this.currentVideo){
                this.Store.videoIdsPlayed._videos.push(this.currentVideo.id);
            }
        },
    }
}