
/* YouTubbe Iframe API: https://developers.google.com/youtube/iframe_api_reference */

class Controler{

    constructor(model, view, yt_api_key){
        this.model = model;
        this.view = view;
        this.api_key = yt_api_key;
        this.filter_controller = new FilterController(this.model);
        this.player = null;
        this.current_video_index = null;

        this.SEARCH_MIN_CHARACTERS = 3;

        this._bindEvents();
        this._loadYouTubeAPI(); // calls "onYouTubeIframeAPIReady"
    }

    _bindEvents(){
        window["onYouTubeIframeAPIReady"] = this.onYouTubeIframeAPIReady;
        const ve = this.view.constructor.EVENTS;
        const me = this.model.constructor.EVENTS;

        this.view.addEventListener(ve.LOAD_VIDEOS_CLICKED, this.onLoadVideos);
        this.view.addEventListener(ve.CLEAR_VIDEOS_CLICKED, this.onClearVideos);
        this.view.addEventListener(ve.VIDEO_CONTROLS_RANDOMIZED_CLICKED, this.onVideoControlsRandomizedClicked);
        this.view.addEventListener(ve.VIDEO_CONTROLS_ORDERED_CLICKED, this.onVideoControlsOrderedClicked);
        this.view.addEventListener(ve.VIDEO_CONTROLS_PREVIOUS_CLICKED, this.onVideoControlsPreviousClicked);
        this.view.addEventListener(ve.VIDEO_CONTROLS_NEXT_CLICKED, this.onVideoControlsNextClicked);
        this.view.addEventListener(ve.VIDEO_LIST_ITEM_CLICKED, this.onVideoListItemClicked);
        this.view.addEventListener(ve.SEARCH_VIDEOS_CHANGED, this.onSearchVideos);

        this.model.addEventListener(me.VIDEOS_CHANGED, this.onVideosChanged)
        this.model.addEventListener(me.VIDEO_QUEUE_CHANGED, this.onVideoQueueChanged);
        this.model.addEventListener(me.IDENTIFIERS_CHANGED, this.onIdentifiersChanged);
        this.model.addEventListener(me.SHUFFLE_CHANGED, this.onShuffleChanged);

    }

    _loadYouTubeAPI(){ // calls "onYouTubeIframeAPIReady"
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        let firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    async _fetchVideosById(id){
        const YT_VIDEO_ID_LENGTH = 11;
        if(id.length === YT_VIDEO_ID_LENGTH){
            let video = await this._fetchVideo(id);
            return video ? [video] : [];
        }else{
            return await this._fetchPlaylist(id);
        }
    }

    async _fetchVideo(video_id){
        let request_url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&part=status&videoEmbeddable=true&fields=items(id,status,snippet(title,thumbnails/default/url))&id=";
        request_url += video_id + "&key=" + this.api_key;

        const response = await fetch(request_url);
        if(response.status !== 200)
            throw new Error("Response status " + response.status);

        const resp_json = await response.json()
        let videos = this._createVideoDataFromJsonApiResponse(resp_json);
        if(videos.length !== 1)
            return false
        return videos[0];
    }

    async _fetchPlaylistPage(playlist_id, page_token=null, max_results=50){
        let request_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&part=status&videoEmbeddable=true&fields=items(status,snippet(resourceId/videoId,title,thumbnails/default/url)),nextPageToken&playlistId=";
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
        let current_page = null;
        let videos = [];

        while(true){
            const response = await this._fetchPlaylistPage(playlist_id, current_page);
            videos = [...videos, ...this._createVideoDataFromJsonApiResponse(response)];
            current_page = response.nextPageToken;
            if (!current_page) break;
        }

        return videos;
    }

    _createVideoDataFromJsonApiResponse(json_response){
        let videos = [];
        let videoId;
        json_response.items.forEach(item => {
            videoId = item.id || item.snippet.resourceId.videoId;
            if(item.status.privacyStatus !== "public"){
                this.model.addFailedVideo(videoId);
                return false;
            }

            videos.push({
                "id": videoId,
                "title": item.snippet.title,
                "thumbnail": item.snippet.thumbnails.default ? item.snippet.thumbnails.default.url : null
            })
        });
        return videos;
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
            return id;
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

        return identifier;
    }


    async addVideosByIdentifier(identifier){
        const id = this._getIdFromIdentifier(identifier);
        if(id == null)
            return;
        if(this.model.hasIdentifier((id)))
            return;
        const videos = await this._fetchVideosById(id);
        this.model.addIdentifier(id);
        this.model.addVideos(videos);
    }

    async addVideosFromUrl(){
        const identifiers = this.view.getUrlIdentifiers();
        if(identifiers.length === 0)
            return;

        this.view.enableLoadVideosForm(false);
        try{
            const promises = identifiers.map(this.addVideosByIdentifier.bind(this));
            await Promise.all(promises);
        }finally {
            this.view.enableLoadVideosForm(true);
        }
    }

    playVideo = (video) => {
        if(!video || !video.id){
            this.playNextVideo();
            return;
        }
        this.current_video_index = video.idx;
        this.view.setIframeTitle(video.title);
        this.view.setUrlVideoId(video.id);
	    this.player.loadVideoById({
            "videoId" : video.id,
            "suggestedQuality" : "large"
        });
        this.player.playVideo();
    }

    playNextVideo = () => {
        if(this.current_video_index !== null)
            this.model.pushVideoHistory(this.current_video_index);
        if(this.model.getVideoQueue().length >= 1)
            this.playVideo(this.model.shiftVideoQueue(false));
    }
    playPreviousVideo = () => {
        const video = this.model.popVideoHistory(false);
        if(video === null)
            return;
        this.model.insertVideoQueue(this.current_video_index, 0);
        this.playVideo(video);
    }

    //
    // Handlers
    //

    onLoadVideos = (event) => {
        this.view.enableLoadVideosForm(false);
        this.addVideosByIdentifier(event.data.id).finally(() => {
            this.view.enableLoadVideosForm(true);
        });
    }

    onClearVideos = (event) => {
        this.model.removeVideos();
        this.model.removeIdentifiers();
    }

    onVideoControlsRandomizedClicked = (event) => {
        this.model.setShuffle(true)
    }
    onVideoControlsOrderedClicked = (event) => {
        this.model.setShuffle(false)
    }
    onVideoControlsPreviousClicked = (event) => {
        this.playPreviousVideo();
    }
    onVideoControlsNextClicked = (event) => {
        this.playNextVideo();
    }

    onVideoListItemClicked = (event) => {
        const idx = event.data.idx;
        this.model.insertVideoQueue(idx, 0);
        this.playNextVideo();
    }

    onSearchVideos = (event) => {
        const data = event.data.data;
        if(data.length < this.SEARCH_MIN_CHARACTERS) {
            this.view.displayVideos(this.model.getVideoQueue(false));
            return;
        }
        const filtered_videos = this.filter_controller.fitlerBy(data);
        this.view.displayVideos(filtered_videos);
    }



    onVideosChanged = () => {
        // Load and play the very first video
        if(this.model.shuffle)
            this.model.shuffleVideoQueue();
        if(this.current_video_index === null)
            this.playNextVideo()
    }
    onVideoQueueChanged = () => {
        this.view.displayVideos(this.model.getVideoQueue(false));
        this.view.enableVideoControls( (this.model.video_queue.length > 0) );
    }
    onIdentifiersChanged = () => {
        this.view.setUrlIdentifiers(this.model.identifiers);
    }
    onShuffleChanged = () => {
        const state = this.model.shuffle;
        this.view.setUrlShuffle(state);
        this.view.setVideoOrdered(!state);
        if(state)
            this.model.shuffleVideoQueue();
        else
            this.model.resetVideoQueue();
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
    }
    onYouTubePlayerReady = async (event) => {
        this.view.enableLoadVideosForm(true);
        const shuffle_state = this.view.getUrlShuffle()
        this.model.setShuffle(shuffle_state);
        this.view.setVideoOrdered(!shuffle_state);
        let urlVideoId = this.view.getUrlVideoId();
        await this.addVideosFromUrl();
        if(urlVideoId){
            let urlVideo = this.model.getVideos().filter(video => video.id === urlVideoId);
            if(urlVideo.length === 1){
                this.playVideo(urlVideo[0]);
            }
        }

    }
    onYouTubePlayerStateChange = (event) => {
        if(event.data === YT.PlayerState.ENDED) {
            this.playNextVideo();
        }
    }
    onYouTubePlayerError = (event) => {
        switch(event.data){
            case 2: // Invalid parameter value
                console.log("Invalid parameter value");
                break;
            case 5: // HTML5-Player related error
                console.log("HTML5-Player failed to handle this video");
                alert("[Error] HTML5-Player failed to handle this video");
                break;
            case 100: // Video not found (deleted or set private)
                console.log("Video not found (deleted or set private)");
                break;
            case 101: // Owner doesn't allow video embedding
            case 150:
                console.log("Owner doesn't allow video embedding");
                break;
        }
        this.playNextVideo();
    }
}

class FilterController{
    constructor(model){
        this.model = model;
        this.filters = [
            new FilterStatic(),
            new FilterRegEx(),
            new FilterGroupedNotAndOr(),
            new FilterCommaSeparator()
        ]
    }

    fitlerBy(str){
        str = str.trim();
        if(str.length === 0)
            return [];

        let filterFunc;
        let filterFuncs = [];
        for(let filter of this.filters){
            if(!filter.test(str))
                continue;
            filterFunc = filter.getFilter(str);
            if(filterFunc === false){
                continue;
            }
            filterFuncs.push(filterFunc);
        }

        if(!filterFuncs.length)
            return [];

        const videos = this.model.getVideos();
        return videos.filter(video_data => {
            return filterFuncs.some(filterFunc => filterFunc(video_data.title));
        });
    }

}

class FilterStatic{
    test(str){
        return true;
    }

    getFilter(str){
        let lowerCaseStr = str.toLowerCase();
        return (source) => source.toLowerCase().includes(lowerCaseStr);
    }
}

class FilterRegEx{
    test(str){
        return /^\/.*\/$/.test(str);
    }

    getFilter(str){
        str = str.slice(1, -1);
        let re = null;
        try{
            re = new RegExp(str, 'i');
        }catch (e){
            return false;
        }
        return (source) => re.test(source);
    }
}

class FilterGroupedNotAndOr{
    static AND = '&&';
    static OR = '||'
    static NOT = '!'
    static ALLOWED_GROUP_PAIRS = [
        ['(', ')'],
        ['[', ']'],
        ['{', '}']
    ];

/*
((capleton || (chronixx && jah9)) && !(bob) )


(
    values: [1,capleton]
    operators: [||,&&]
    (1
        values: [chronixx, jah9]
        operators: [&&]
    )
)
*/

    static Node = class{
        constructor() {
            this.values = [];
            this.operators = [];
        }
    }

    test(str){
        return false;
        //this.constructor.ALLOWED_GROUP_PAIRS.some(([o,c]) => str.startsWith(c) && str.endsWith(c));
    }

    getFilter(str){
        const $AND = this.constructor.AND;
        const $OR = this.constructor.OR;
        const $NOT = this.constructor.NOT;
        const [$O, $C] = [str[0], str[str.length-1]];
        const N = this.constructor.Node;

        str = str.slice(1, -1);
        const rootNode = N();
        for(let i=0; i<str.length;){

        }
        return false
    }
}

class FilterCommaSeparator{
    test(str){
        return str.includes(',');
    }

    getFilter(str){
        str = str.toLowerCase();
        const strs = str.toLowerCase().split(',').map(x=>x.trim()).filter(x=>x.length);
        return (source) => strs.some(s => source.toLowerCase().includes(s));
    }
}