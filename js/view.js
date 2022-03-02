
class View extends EventTarget{

    static EVENTS = class{
        static LOAD_VIDEOS_CLICKED = "loadVideosClicked";
        static CLEAR_VIDEOS_CLICKED = "clearVideosClicked";
        static VIDEO_CONTROLS_RANDOMIZED_CLICKED = "videoControlsRandomizedClicked";
        static VIDEO_CONTROLS_ORDERED_CLICKED = "videoControlsOrderedClicked";
        static VIDEO_CONTROLS_PREVIOUS_CLICKED = "videoControlsPreviousClicked";
        static VIDEO_CONTROLS_NEXT_CLICKED = "videoControlsNextClicked";
        static VIDEO_LIST_ITEM_CLICKED = "videoListItemClicked";
        static SEARCH_VIDEOS_CHANGED = "searchVideosChanged";
    }

    constructor(){
        super();

        this.video_list_template = ejs.compile(`
            <% videos.forEach(video => {%>
                <div data-idx="<%= video.idx %>">
                    <img src="<%= video.thumbnail %>">
                    <span><%= video.title %></span>
                </div>
            <% }); %>
        `);

        this.load_videos_fieldset = document.getElementById("load-videos-fieldset");
        this.load_videos_input = document.getElementById("load-videos-input");
        this.load_videos_submit = document.getElementById("load-videos-submit");
        this.clear_videos_submit = document.getElementById("clear-videos-submit");

	    this.iframe_title = document.getElementById("iframe-title");
        this.iframe_placeholder = document.getElementById("iframe-placeholder");

        this.video_controls_fieldset = document.getElementById("video-controls-fieldset");
        this.video_controls_randomized = document.getElementById("video-controls-randomized");
        this.video_controls_ordered = document.getElementById("video-controls-ordered");
        this.video_controls_previous = document.getElementById("video-controls-previous");
        this.video_controls_next = document.getElementById("video-controls-next");

        this.search_videos_input = document.getElementById("search-videos-input");

        this.video_list = document.getElementById("video-list");

        this._bindEvents();
    }

    _bindEvents(){
        this.load_videos_submit.addEventListener("click", event => {
            event.preventDefault();
            const id = this.load_videos_input.value;
            let new_event = new Event(View.EVENTS.LOAD_VIDEOS_CLICKED);
            new_event.data =  {"id" : id};
            this.dispatchEvent(new_event);
        });

        this.clear_videos_submit.addEventListener("click", event => {
            event.preventDefault();
            this.dispatchEvent(new Event(View.EVENTS.CLEAR_VIDEOS_CLICKED));
        })

        this.video_controls_randomized.addEventListener("click", event => {
            this.dispatchEvent(new Event(View.EVENTS.VIDEO_CONTROLS_RANDOMIZED_CLICKED));
        });

        this.video_controls_ordered.addEventListener("click", event => {
            this.dispatchEvent(new Event(View.EVENTS.VIDEO_CONTROLS_ORDERED_CLICKED));
        });

        this.video_controls_previous.addEventListener("click", event => {
            this.dispatchEvent(new Event(View.EVENTS.VIDEO_CONTROLS_PREVIOUS_CLICKED));
        });

        this.video_controls_next.addEventListener("click", event => {
            this.dispatchEvent(new Event(View.EVENTS.VIDEO_CONTROLS_NEXT_CLICKED));
        });

        this.search_videos_input.addEventListener("input", event => {
            const data = this.search_videos_input.value;
            let new_event = new Event(View.EVENTS.SEARCH_VIDEOS_CHANGED);
            new_event.data = {"data" : data};
            this.dispatchEvent(new_event);
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

        const html = this.video_list_template({"videos" : videos});
        this.video_list.innerHTML = html;

        const that = this;
        this.video_list.childNodes.forEach(node => {
            node.addEventListener("click", function(event){
                let new_event = new Event(View.EVENTS.VIDEO_LIST_ITEM_CLICKED);
                new_event.data = {"idx": this.getAttribute("data-idx")};
                that.dispatchEvent(new_event);
            });
        });

        /*
        for(let i=0; i<videos.length; i++){
            //const item = this._createVideoListItemElement(videos[i]);
            //this.video_list.appendChild(item);
            const item = template({video: videos[i]});
            this.video_list.innerHTML += item;
        }*/
    }
    /*
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
    }*/

    setVideoOrdered(state){
        this.video_controls_ordered.style.display = state ? 'none' : 'block';
        this.video_controls_randomized.style.display = state ? 'block' : 'none';
    }

    setIframeTitle(title){
	    this.iframe_title.innerHTML = title;
    }

    getUrlIdentifiers(){
        const parsed_url = new URL(window.location);
        return parsed_url.searchParams.getAll("identifiers");
    }
    setUrlIdentifiers(identifiers){
        let parsed_url = new URL(document.location);
        parsed_url.searchParams.delete("identifiers");

        identifiers.forEach(identifier => {
            parsed_url.searchParams.append("identifiers", encodeURIComponent(identifier));
        });

        window.history.pushState({}, "", parsed_url.href)
    }

    getUrlShuffle(){
        const parsed_url = new URL(window.location);
        return (parsed_url.searchParams.get("shuffle") !== null);
    }
    setUrlShuffle(state){
        const parsed_url = new URL(window.location);
        parsed_url.searchParams.delete("shuffle");

        if(state){
            parsed_url.searchParams.append("shuffle", true);
        }
        window.history.pushState({}, "", parsed_url.href);
    }

    getUrlVideoId(){
        let parsed_url = new URL(document.location);
        return parsed_url.searchParams.get("videoid");
    }
    setUrlVideoId(videoId){
        let parsed_url = new URL(document.location);
        parsed_url.searchParams.set("videoid", videoId);
        window.history.pushState({}, "", parsed_url.href);
    }
}


