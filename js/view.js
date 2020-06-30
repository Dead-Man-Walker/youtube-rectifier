
class View extends EventTarget{
    /*
    Events:
        - loadVideos
        - clearVideos
        - videoControlsShuffleClicked
        - videoControlsPreviousClicked
        - videoControlsNextClicked
        - videoListItemClicked
    */
    constructor(){
        super();

        this.load_videos_fieldset = document.getElementById("load-videos-fieldset");
        this.load_videos_input = document.getElementById("load-videos-input");
        this.load_videos_submit = document.getElementById("load-videos-submit");
        this.clear_videos_submit = document.getElementById("clear-videos-submit");

        this.iframe_placeholder = document.getElementById("iframe-placeholder");

        this.video_controls_fieldset = document.getElementById("video-controls-fieldset");
        this.video_controls_shuffle = document.getElementById("video-controls-shuffle");
        this.video_controls_previous = document.getElementById("video-controls-previous");
        this.video_controls_next = document.getElementById("video-controls-next");

        this.video_list = document.getElementById("video-list");

        this._bindEvents();
    }

    _bindEvents(){
        this.load_videos_submit.addEventListener("click", event => {
            event.preventDefault();
            const id = this.load_videos_input.value;
            let new_event = new Event("loadVideos");
            new_event.data =  {"id" : id};
            this.dispatchEvent(new_event);
        });

        this.clear_videos_submit.addEventListener("click", event => {
            event.preventDefault();
            this.dispatchEvent(new Event("clearVideos"));
        })

        this.video_controls_shuffle.addEventListener("click", event => {
            this.dispatchEvent(new Event("videoControlsShuffleClicked"));
        });

        this.video_controls_previous.addEventListener("click", event => {
            this.dispatchEvent(new Event("videoControlsPreviousClicked"));
        });

        this.video_controls_next.addEventListener("click", event => {
            this.dispatchEvent(new Event("videoControlsNextClicked"));
        });

    }




    enableLoadVideosForm(state){
        this.load_videos_fieldset.disabled = !state;
    }
    enableVideoControls(state){
        this.video_controls_fieldset.disabled = !state;
    }

    removeVideos(){
        while(this.video_list.firstChild){
            this.video_list.removeChild(this.video_list.firstChild);
        }
    }

    displayVideos(videos){
        this.removeVideos();

        for(let i=0; i<videos.length; i++){
            const item = this._createVideoListItemElement(videos[i]);
            this.video_list.appendChild(item);
        }
    }

    _createVideoListItemElement(video){
        const div = document.createElement("DIV");
        div.setAttribute("data-idx", video.idx);
        const img = document.createElement("IMG");
        img.src = video.thumbnail;
        const span = document.createElement("SPAN");
        span.innerHTML = video.title;

        div.appendChild(img);
        div.appendChild(span);
        let that = this;
        div.addEventListener("click", function(event){
            let new_event = new Event("videoListItemClicked");
            new_event.data = {"idx": this.getAttribute("data-idx")};
            that.dispatchEvent(new_event);
        });

        return div;
    }
}


