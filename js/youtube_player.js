
/* YouTubbe Iframe API: https://developers.google.com/youtube/iframe_api_reference */

export default function YoutubePlayer(props){
    return {
        _youtubeApiKey: props.youtubeApiKey,
        _$rootEl: null,
        _youtubePlayer: null,

        isReady: false,
        videoIdentifier: '',
        currentVideo: null,

        mounted($el) { // calls "onYouTubeIframeAPIReady"
            this._$rootEl = $el;
            window.onYouTubeIframeAPIReady = this._onYouTubeIframeAPIReady;
            let tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            let firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        },

        playVideo(video){
            this.currentVideo = video;
            //this.view.setIframeTitle(video.title);
            //this.view.setUrlVideoId(video.id);
            this._youtubePlayer.loadVideoById({
                "videoId" : video.id,
                "suggestedQuality" : "large"
            });
            this._youtubePlayer.playVideo();
        },

        async fetchVideosByIdentifier(identifier){
            const id = this._getIdFromIdentifier(identifier);
            if(id == null)
                return;
            await this._fetchVideosById(id);
            this.videoIdentifier = '';
        },

        async _fetchVideosById(id) {
            const YT_VIDEO_ID_LENGTH = 11;
            if (id.length === YT_VIDEO_ID_LENGTH) {
                let video = await this._fetchVideo(id);
                return video ? [video] : [];
            } else {
                return await this._fetchPlaylist(id);
            }
        },

        async _fetchVideo(video_id) {
            let request_url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&part=status&videoEmbeddable=true&fields=items(id,status,snippet(title,thumbnails/default/url))&id=";
            request_url += video_id + "&key=" + this._youtubeApiKey;

            const response = await fetch(request_url);
            if (response.status !== 200)
                throw new Error("Response status " + response.status);

            const resp_json = await response.json()
            let videos = this._createVideoDataFromJsonApiResponse(resp_json);
            if (videos.length !== 1)
                return false
            return videos[0];
        },

        async _fetchPlaylistPage(playlist_id, page_token = null, max_results = 50) {
            let request_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&part=status&videoEmbeddable=true&fields=items(status,snippet(resourceId/videoId,title,thumbnails/default/url)),nextPageToken&playlistId=";
            request_url += playlist_id + "&key=" + this._youtubeApiKey + "&maxResults=" + max_results;
            if (page_token) {
                request_url += "&pageToken=" + page_token;
            }

            const response = await fetch(request_url);
            if (response.status !== 200)
                throw new Error("Response status " + response.status);

            return await response.json();
        },

        async _fetchPlaylist(playlist_id) {
            let current_page = null;
            let videos = [];

            while (true) {
                const response = await this._fetchPlaylistPage(playlist_id, current_page);
                videos = [...videos, ...this._createVideoDataFromJsonApiResponse(response)];
                current_page = response.nextPageToken;
                if (!current_page) break;
            }

            return videos;
        },

        _getIdFromIdentifier(identifier){
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
        },

        _createVideoDataFromJsonApiResponse(json_response) {
            const videos = [];

            json_response.items.forEach(item => {
                if (item.status.privacyStatus !== "public") {
                    return false;
                }

                videos.push(
                    this.Store.addVideo(
                        item.id || item.snippet.resourceId.videoId,
                        item.snippet.title,
                        item.snippet.thumbnails.default ? item.snippet.thumbnails.default.url : null
                    )
                );
            });

            return videos;
        },

        // Called by YouTube Iframe API
        _onYouTubeIframeAPIReady(){
            this._youtubePlayer = new YT.Player(this._$rootEl, {
                height: "360",
                width: "640",
                playerVars: {
                    "autoplay": 0,
                    "controls": 1
                },
                events: {
                    "onReady": this._onYouTubePlayerReady,
                    "onStateChange": this._onYouTubePlayerStateChange,
                    "onError": this._onYouTubePlayerError
                }
            });
        },

        _onYouTubePlayerReady(event){
            this.isReady = true;
        },

        _onYouTubePlayerStateChange(event){
            if (event.data === YT.PlayerState.ENDED) {
                //this.playNextVideo();
            }
        },

        _onYouTubePlayerError(event){
            switch(event.data){
                case 2: // Invalid parameter value
                    console.error("Invalid parameter value", event);
                    break;
                case 5: // HTML5-Player related error
                    console.error("HTML5-Player failed to handle this video", event);
                    break;
                case 100: // Video not found (deleted or set private)
                    console.error("Video not found (deleted or set private)", event);
                    break;
                case 101: // Owner doesn't allow video embedding
                case 150:
                    console.error("Owner doesn't allow video embedding", event);
                    break;
            }

            //this.playNextVideo();
        }
    }
};