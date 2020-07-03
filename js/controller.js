
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

        this.view.addEventListener("loadVideos", this.onLoadVideos);
        this.view.addEventListener("clearVideos", this.onClearVideos);
        this.view.addEventListener("videoControlsShuffleClicked", this.onVideoControlshuffleClicked);
        this.view.addEventListener("videoControlsPreviousClicked", this.onVideoControlsPreviousClicked);
        this.view.addEventListener("videoControlsNextClicked", this.onVideoControlsNextClicked);
        this.view.addEventListener("videoListItemClicked", this.onVideoListItemClicked);

        this.model.addEventListener("videosChanged", this.onVideosChanged)
        this.model.addEventListener("videoQueueChanged", this.onVideoQueueChanged);
        this.model.addEventListener("identifiersChanged", this.onIdentifiersChanged);
        this.model.addEventListener("shuffleChanged", this.onShuffleChanged);
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
        if(id == null){
            console.log("Invalid identifier! " + id);
            return;
        }
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
        this.view.setIframeTitle(video.title);
	    this.player.loadVideoById({
            "videoId" : video.id,
            "suggestedQuality" : "large"
        });
        this.player.playVideo();
    }

    playNextVideo = () => {
        if(this.current_video_index !== null)
            this.model.pushVideoHistory(this.current_video_index);
        this.current_video_index = this.model.shiftVideoQueue();
        this.playVideo(this.model.videos[this.current_video_index]);
    }
    playPreviousVideo = () => {
        const video = this.model.popVideoHistory(false);
        this.playVideo(video);
    }
    shuffleVideos = () => {
        this.model.setShuffle(true)
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

    onVideoControlshuffleClicked = (event) => {
        this.shuffleVideos();
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
        if(state)
            this.model.shuffleVideoQueue();
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
    onYouTubePlayerReady = (event) => {
        this.view.enableLoadVideosForm(true);
        this.model.setShuffle(this.view.getUrlShuffle());
        this.addVideosFromUrl();
    }
    onYouTubePlayerStateChange = (event) => {
        if(event.data === 0) {
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

