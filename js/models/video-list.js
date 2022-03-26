
export default class VideoList extends EventTarget{

    static EVENTS = class{
        static VIDEOS_CHANGED = "videosChanged";
    }

    constructor(){
        super();
        this._video_id_2_video = new Map();
        this._identifier_2_video_ids = {};
    }

    get length(){
        return this._video_id_2_video.size();
    }

    *iterVideos(identifier=null){
        if(identifier === null){
            for(const video of this._video_id_2_video.values())
                yield video;
            return;
        }
        for(const video_id of this._identifier_2_video_ids[identifier]||[]){
            yield this._video_id_2_video.get(video_id);
        }
    }
    *iterVideoIds(identifier=null){
        if(identifier === null){
            for(const video of this._video_id_2_video.keys())
                yield video;
            return;
        }
        for(const video_id of this._identifier_2_video_ids[identifier]||[]){
            yield video_id;
        }
    }

    getVideo(video_id){
        return this._video_id_2_video.get(video_id) || null;
    }
    getVideos(identifier=null){
        return Array.from(this.iterVideos(identifier));

    }
    getVideoIds(identifier=null){
        return (identifier === null ? Array.from(this._video_id_2_video) : this._identifier_2_video_ids[identifier] || new Set()).keys();
    }

    hasIdentifier(identifier){
        return identifier in this._identifier_2_video_ids;
    }
    hasVideo(video){
        return this.hasVideoId(video.id);
    }
    hasVideoId(video_id){
        return this._video_id_2_video.has(video_id);
    }

    addVideo(identifier, video){
        this._video_id_2_video.set(video.id, video);
        this._identifier_2_video_ids[identifier] = (this._identifier_2_video_ids[identifier]||new Set()).add(video.id);
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEOS_CHANGED));
    }
    addVideos(identifier, videos){
        let video_ids = new Set();
        for(const video of videos){
            video_ids.add(video.id);
            this._video_id_2_video.set(video.id, video);
        }
        this._identifier_2_video_ids[identifier] = union(this._identifier_2_video_ids[identifier]||new Set(), video_ids);
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEOS_CHANGED));
    }
    clear(identifier=null){
        if(identifier === null){
            this._video_id_2_video.clear();
            this._identifier_2_video_ids = {};
        }else {
            for (const video_id of this._identifier_2_video_ids[identifier] || []) {
                this._video_id_2_video.delete(video_id);
            }
        }
        this.dispatchEvent(new Event(this.constructor.EVENTS.VIDEOS_CHANGED));
    }
}

