

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

    pushVideoQueue(v_idx){
        this.video_queue.push(this.videos[v_idx]);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }    
    shiftVideoQueue(){
        const video = this.video_queue.shift();
        this.dispatchEvent(new Event("videoQueueChanged"));
        return this.videos[video];
    }
    insertVideoQueue(v_idx, idx){
        this.video_queue.splice(idx, 0, this.video[v_idx]);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }
    shuffleVideoQueue(){
        shuffle(this.videos_queue);
        this.onVideoQueueChanged.dispatchEvent();
    }
    
    pushVideoHistory(v_idx){
        this.video_history.push(this.videos[v_idx]);
        this.dispatchEvent(new Event("videoQueueChanged"));
    }
    popVideoHistory(){
        const video = this.video_history.pop();
        this.dispatchEvent(new Event("videoHistoryChanged"));
        return this.videos[video];
    }
}


class View extends EventTarget{
    /*
    Events:
        - loadVideos
        - controllVideosShuffle
        - controllVideosPrevious
        - controllVideosNext    
    */
    constructor(){
        super();
        
        this.load_videos_form = document.getElementById("load-videos-form");
        this.load_videos_fieldset = document.getElementById("load-videos-fieldset");
        this.load_videos_input = document.getElementById("load-videos-input");
        
        this.iframe_placeholder = document.getElementById("iframe-placeholder");
        
        this.controll_videos_shuffle = document.getElementById("controll-videos-shuffle");
        this.controll_videos_previous = document.getElementById("controll-videos-previous");
        this.controll_videos_next = document.getElementById("controll-videos-next");
        
        this.video_list = document.getElementById("video-list");
 
        this._bindEvents();
    }
    
    _bindEvents(){
        this.load_videos_form.addEventListener("submit", event => {
            event.preventDefault();
            const id = this.load_videos_input.value;
            this.dispatchEvent(new Event("loadVideos", {"id" : id}));
        });
        
        this.controll_videos_shuffle.addEventListener("click", event => {
            this.dispatchEvent(new Event("controllVideosShuffle"));
        });
        
        this.controll_videos_previous.addEventListener("click", event => {
            this.dispatchEvent(new Event("controllVideosPrevious"));
        });
        
        this.controll_videos_next.addEventListener("click", event => {
            this.dispatchEvent(new Event("controllVideosNext"));
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



class Controller{
    constructor(model, view, yt_api_key){
        this.model = model;
        this.view = view;
        this.api_key = yt_api_key;
        this.player = null;
        
        this._bindEvents();
        this._loadYouTubeAPI(); // calls "onYouTubeIframeAPIReady"
    }
    
    _bindEvents(){
        window["onYouTubeIframeAPIReady"] = this.onYouTubeIframeAPIReady;
        
        this.view.addEventListener("loadVideos", this.addVideosById);
        this.view.addEventListener("controllVideosShuffle", this.controllVideoShuffle);
        this.view.addEventListener("controllVideosPrevious", this.controllVideoPrevious);
        this.view.addEventListener("controllVideosNext", this.controllVideoNext);
        
        this.model.addEventListener("videoQueueChanged", this.onVideoQueueChanged);
    }
    _loadYouTubeAPI(){ // calls "onYouTubeIframeAPIReady"
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        let firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    _getVideosById(id){
        if(id.length === 11){
            // Video id
            videos = [{
                "id" : id,
                "title" : "-",
                "thumbnail" : null
            }];
            return videos;
        }else{
            // Playlist id
            this.fetchPlaylistVideoIds(id, (videos)=>{
                return videos;
            });
        }
    }
     
    fetchPlaylistVideoIds(playlist, finished_cb){
        let ids = [];
        let that = this;
        
        let fetchPage = function(page, cb){
            let maxResults = 50;
            let requestUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&fields=items/snippet(resourceId/videoId,title,thumbnails/default/url),nextPageToken&playlistId=";
            requestUrl += playlist + "&key=" + that.api_key + "&maxResults=" + maxResults;
            if(page){
                requestUrl += "&pageToken=" + page;
            }
            
            let httpRequest = new XMLHttpRequest();
            httpRequest.open("GET", requestUrl, true);
            httpRequest.send(); 
            httpRequest.onload = () => {
                if(httpRequest.status === 200){
                    let response = JSON.parse(httpRequest.response);
                    cb(response);
                    
                }else{
                    console.log("ERROR", httpRequest.status, httpRequest.statusText)
                }
            }
        }
        
        let onPageFetched = function(response){
            let container = document.getElementById("video-list");
            
            for(let i=0; i<response.items.length; i++){
                let snippet = response.items[i].snippet;
                let videoId = snippet.resourceId.videoId;
                let title = snippet.title;
                
                let thumbnail;
                try{
                    thumbnail = snippet.thumbnails.default.url
                }catch(TypeError){
                    thumbnail = null;
                }
                
                ids.push({
                    "id" : videoId,
                    "title" : title,
                    "thumbnail" : thumbnail
                });
            }
            if(response.nextPageToken){
                fetchPage(response.nextPageToken, onPageFetched);
            }else{
                finished_cb(ids);
            }
        }
        
        fetchPage(null, onPageFetched);
    }
    
    
    addVideosById = id =>{
        const videos = this._getVideosById(id);
        this.model.addVideos(videos);
    }
    
    controllVideoShuffle = () => {
        this.model.shuffleVideoQueue();
    }
    controllVideoPrevious = () => {
        const video = this.model.popVideoHistory();
        //this.model.insert(0, video.idx);
        this.loadVideo(video.id);
    }
    controllVideoNext = () => {
        const video = this.model.shiftVideoQueue();
        this.model.pushVideoHistory(video.idx);
        this.loadVideo(video.id);
    }
    
    loadVideo = (id) => {
        this.player.loadVideoById({
            "videoId" : id,
            "suggestedQuality" : "large"
        });
    }
    
    
    onVideoQueueChanged = () => {
        this.view.displayVideos(this.model.video_queue);
    }
    
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
        //const state = event.data;
    }
    onYouTubePlayerError = (event) => {
        alert("YouTube Player Error " + event.data);
        console.log("YouTube Player Error " + event.data, event);
    }
}



function ready(){
    const YT_API_KEY = "AIzaSyCt7PkKtIlJl_uVw-lRpymNR49lD919gFQ";
    const app = new Controller(new Model(), new View(), YT_API_KEY);
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
