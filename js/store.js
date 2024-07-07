import { reactive } from 'https://unpkg.com/petite-vue?module'
import {Observable, VideoIdList} from "./helper.js";

const Store = reactive({
    _videos: {},
    _identifiers: {},
    videoIdsPlayed: new VideoIdList(),
    videoIdsUnplayed: new VideoIdList(),
    videoIdsQueued: new VideoIdList(),
    videoIds: new VideoIdList(),
    onVideoAdded: new Observable(),

    addVideo(id, title, thumbnail){
        const video = {
            id,
            title,
            thumbnail
        };
        if(!this._videos[id]){
            this.videoIdsUnplayed._videos.push(id);
        }
        this._videos[id] = video;
        this.onVideoAdded.fire(video);

        return video;
    },

    getVideo(id){
        return this._videos[id] ?? null;
    },

    addIdentifier(identifier){
        this._identifiers[identifier] = true;
    },

    get videosCount(){
        return this.videoIds.getVideos().length;
    },

    get identifiers(){
        return Object.keys(this.identifiers);
    },
});

Store.videoIds.getVideos = () => Object.keys(Store._videos);
export default Store;