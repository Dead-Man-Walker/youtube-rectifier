import { reactive } from 'https://unpkg.com/petite-vue?module'

const Store = reactive({
    _videos: {},

    addVideo(id, title, thumbnail){
        const video = {
            id,
            title,
            thumbnail
        };
        this._videos[id] = video;
        return video;
    },

    get videosCount(){
        return Object.keys(this._videos).length;
    },

    get videos(){
        return this._videos;
    },

    getVideo(id){
        return this._videos[id] ?? null;
    },
});

export default Store;