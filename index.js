

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

    getVideoQueue(return_index=true){
        if(return_index)
            return this.video_queue;
        return this.video_queue.map(v_idx => this.videos[v_idx])
    }
    pushVideoQueue(v_idx){
        this.video_queue.push(this.videos[v_idx]);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }    
    shiftVideoQueue(return_index=true){
        const v_idx = this.video_queue.shift();
        this.dispatchEvent(new Event("videoQueueChanged"));
        return return_index ? v_idx : this.videos[v_idx];
    }
    insertVideoQueue(v_idx, idx){
        this.video_queue.splice(idx, 0, this.video[v_idx]);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }
    shuffleVideoQueue(){
        shuffle(this.video_queue);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }
    
    pushVideoHistory(v_idx){
        this.video_history.push(v_idx);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }
    popVideoHistory(return_index=true){
        const v_idx = this.video_history.pop();
        this.dispatchEvent(new Event("videoHistoryChanged"));
        return return_index ? v_idx : this.videos[v_idx];
    }
}


class View extends EventTarget{
    /*
    Events:
        - loadVideos
        - controlVideosShuffleClicked
        - controlVideosPreviousClicked
        - controlVideosNextClicked
    */
    constructor(){
        super();
        
        this.load_videos_form = document.getElementById("load-videos-form");
        this.load_videos_fieldset = document.getElementById("load-videos-fieldset");
        this.load_videos_input = document.getElementById("load-videos-input");
        
        this.iframe_placeholder = document.getElementById("iframe-placeholder");
        
        this.control_videos_shuffle = document.getElementById("control-videos-shuffle");
        this.control_videos_previous = document.getElementById("control-videos-previous");
        this.control_videos_next = document.getElementById("control-videos-next");
        
        this.video_list = document.getElementById("video-list");
 
        this._bindEvents();
    }
    
    _bindEvents(){
        this.load_videos_form.addEventListener("submit", event => {
            event.preventDefault();
            const id = this.load_videos_input.value;
            let new_event = new Event("loadVideos");
            new_event.data =  {"id" : id};
            this.dispatchEvent(new_event);
        });
        
        this.control_videos_shuffle.addEventListener("click", event => {
            this.dispatchEvent(new Event("controlVideosShuffleClicked"));
        });
        
        this.control_videos_previous.addEventListener("click", event => {
            this.dispatchEvent(new Event("controlVideosPreviousClicked"));
        });
        
        this.control_videos_next.addEventListener("click", event => {
            this.dispatchEvent(new Event("controlVideosNextClicked"));
        });
    
    }
    
   
    
    
    enableLoadVideosForm(state){
        this.load_videos_fieldset.disabled = !state;
    }
    
    removeVideos(){
        while(this.video_list.firstChild){
            this.video_list.removeChild(this.video_list.firstChild);
        }
    }
    
    displayVideos(videos){
        this.removeVideos();
        
        videos.forEach(vid => {
            const div = document.createElement("DIV");
            const img = document.createElement("IMG");
            img.src = vid.thumbnail;
            const span = document.createElement("SPAN");
            span.innerHTML = vid.title;
            
            div.appendChild(img);
            div.appendChild(span);
            this.video_list.appendChild(div);
        })
    }
}



class controler{
    constructor(model, view, yt_api_key){
        this.model = model;
        this.view = view;
        this.api_key = yt_api_key;
        this.player = null;
        this.current_video_index = null;
        
        this._bindEvents();
        this._loadYouTubeAPI(); // calls "onYouTubeIframeAPIReady"
    }
    
    _bindEvents(){
        window["onYouTubeIframeAPIReady"] = this.onYouTubeIframeAPIReady;
        
        this.view.addEventListener("loadVideos", event => {
            this.addVideosByIdentifier(event.data.id);
        });
        this.view.addEventListener("controlVideosShuffleClicked", this.onControlVideoShuffleClicked);
        this.view.addEventListener("controlVideosPreviousClicked", this.onControlVideoPreviousClicked);
        this.view.addEventListener("controlVideosNextClicked", this.onControlVideoNextClicked);

        this.model.addEventListener("videosChanged", this.onVideosChanged)
        this.model.addEventListener("videoQueueChanged", this.onVideoQueueChanged);
    }
    _loadYouTubeAPI(){ // calls "onYouTubeIframeAPIReady"
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        let firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    async _fetchVideosById(id){
        if(id.length === 11){
            return [await this._fetchVideo((id))];
        }else{
            return await this._fetchPlaylist(id);
        }
    }

    async _fetchVideo(video_id){
        let request_url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&fields=items/snippet(title,thumbnails/default/url)&id=";
        request_url += video_id + "&key=" + this.api_key;

        const response = await fetch(request_url);
        if(response.status !== 200)
            throw new Error("Response status " + response.status);

        const resp_json = await response.json()
        const snippet = resp_json.items[0].snippet;
        const thumbnail = snippet.thumbnails.default ? snippet.thumbnails.default.url : null;

        return {
            "id": video_id,
            "title" : snippet.title,
            "thumbnail": thumbnail
        };
    }

    async _fetchPlaylistPage(playlist_id, page_token=null, max_results=50){
        let request_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&fields=items/snippet(resourceId/videoId,title,thumbnails/default/url),nextPageToken&playlistId=";
        request_url += playlist_id + "&key=" + this.api_key + "&maxResults=" + max_results;
        if(page_token){
            request_url += "&pageToken=" + page_token;
        }

        const response = await fetch(request_url);
        if(response.status !== 200)
            throw new Error("Response status " + response.status);

        return await response.json();
    }

    async _fetchPlaylist(playlist_id){
        let playlist_data = [];
        let current_page = null;

        while(true){
            const response = await this._fetchPlaylistPage(playlist_id, current_page);

            response.items.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                const title = item.snippet.title;
                const thumbnail = item.snippet.thumbnails.default ? item.snippet.thumbnails.default.url : null;

                playlist_data.push({
                    "id": videoId,
                    "title": title,
                    "thumbnail": thumbnail
                })
            });

            current_page = response.nextPageToken;
            if (!current_page) break;
        }

        return playlist_data;
    }

    _getIdFromIdentifier = identifier => {
        let id;

        let split = identifier.split("list=")
        if(split.length === 2){
            id = split[1];
            let ampersand_pos = id.indexOf('&');
            if(ampersand_pos !== -1) {
                id = id.substring(0, ampersand_pos);
            }
            return id
        }

        split = identifier.split("v=");
        if(split.length === 2){
            id = split[1];
            let ampersand_pos = id.indexOf('&');
            if(ampersand_pos !== -1) {
                id = id.substring(0, ampersand_pos);
            }
            return id;
        }
    }


    addVideosByIdentifier = identifier =>{
        const id = this._getIdFromIdentifier(identifier)
        if(id === null){
            alert("Invalid identifier!");
            return;
        }
        this._fetchVideosById(id).then(videos => {
            this.model.addVideos(videos);
        });
    }

    loadVideo = (id) => {
        this.player.loadVideoById({
            "videoId" : id,
            "suggestedQuality" : "large"
        });
    }

    playNextVideo = () => {
        if(this.current_video_index !== null)
            this.model.pushVideoHistory(this.current_video_index);
        this.current_video_index = this.model.shiftVideoQueue();
        this.loadVideo(this.model.videos[this.current_video_index].id);
    }
    playPreviousVideo = () => {
        const video = this.model.popVideoHistory(false);
        this.loadVideo(video.id);
    }
    shuffleVideos = () => {
        this.model.shuffleVideoQueue();
    }

    //
    // Handlers
    //
    
    onControlVideoShuffleClicked = () => {
        this.shuffleVideos();
    }
    onControlVideoPreviousClicked = () => {
        this.playPreviousVideo();
    }
    onControlVideoNextClicked = () => {
        this.playNextVideo();
    }

    

    onVideoQueueChanged = () => {
        this.view.displayVideos(this.model.getVideoQueue(false));
    }

    // Called by YouTube Iframe API
    onYouTubeIframeAPIReady = () => {
        this.player = new YT.Player(this.view.iframe_placeholder, {
            height: "360",
            width: "640",
            playerVars: {
                "autoplay": 0,
                "controls": 1
            },
            events: {
                "onReady": this.onYouTubePlayerReady,
                "onStateChange": this.onYouTubePlayerStateChange,
                "onError" : this.onYouTubePlayerError
            }
        });
        
        this.view.enableLoadVideosForm(true);
    }
    onYouTubePlayerReady = (event) => {
    }
    onYouTubePlayerStateChange = (event) => {
        if(event.data === 0) {
            this.playNextVideo();
            this.player.playVideo();
        }
    }
    onYouTubePlayerError = (event) => {
        alert("YouTube Player Error " + event.data);
        console.log("YouTube Player Error " + event.data, event);
    }
}



function ready(){
    const YT_API_KEY = "AIzaSyCt7PkKtIlJl_uVw-lRpymNR49lD919gFQ";
    const app = new controler(new Model(), new View(), YT_API_KEY);
}


document.addEventListener("DOMContentLoaded", ready, false);

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
