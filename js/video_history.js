import {VideoIdList} from "./helper.js";

export default function VideoHistory(props){
    return {
        videoIdList: new VideoIdList(),

        mounted(){
            this.videoIdList.getVideos = () => this.Store.videoIdsPlayed.getVideos().reverse();
        },

        onClickVideo(video){
            this._playVideo(video);
        },

        _playVideo(video){
            if(!video)
                return false;

            return this.playVideo(video);
        },
    }
}