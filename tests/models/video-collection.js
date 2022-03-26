import Video from "../../js/models/video.js";
import VideoCollection from "../../js/models/video-collection.js";
import {it, assert, setTestSubject} from "../test-utils.js";



class _MockVideoListController{
    constructor() {
        this._testVideos = new Map();
        this.model = {
            getVideo: videoId => {
                return this._testVideos.get(videoId) || null;
            }
        }
    }
    _testSetVideos(videos){
        this._testVideos = new Map();
        videos.forEach(video => this._testVideos.set(video.id, video));
    }
}

function _getSetup(){
    const _mock = new _MockVideoListController();
    return {
        mockVideoListController: _mock,
        videoCollection: new VideoCollection(_mock),
        demoVideos: ["1","2","11","10"].map(id => new Video({id}))
    }
}

export function testAll(){
    setTestSubject('VideoCollection');
    _shouldHaveLength();
    _shouldIterVideoIds();
    _shouldIterVideos();

    _shouldGetVideoIds();
    _shouldGetVideos();
    _shouldHaveVideosId();
    _shouldHaveVideos();

    _shouldPushVideo();
    _shouldPushVideoId();
    _shouldPushVideos();
    _shouldPushVideoIds();
    _shouldClear();
    _shouldRemoveVideo();
    _shouldRemoveVideoId();
    _shouldPopVideo();
}


function _shouldHaveLength(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    it('should have length 0', ()=>assert(videoCollection.length === 0));
    mockVideoListController._testSetVideos(demoVideos);
    videoCollection.pushVideos(demoVideos);
    it('should have length of pushed videos', ()=>assert(videoCollection.length === demoVideos.length));
}

function _shouldIterVideoIds(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    it('should iterate empty collection of video ids', ()=>assert(Array.from(videoCollection.iterVideoIds()).length === 0));
    mockVideoListController._testSetVideos(demoVideos);
    videoCollection.pushVideos(demoVideos);
    it('should iterate non-empty collection of video ids', ()=> {
        let counter = 0;
        for(const video_id of videoCollection.iterVideoIds()){
            assert(video_id === demoVideos[counter++].id);
        }
        assert(demoVideos.length === counter);
    });

}
function _shouldIterVideos(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    it('should iterate videos of empty collection', ()=>assert(Array.from(videoCollection.iterVideos()).length === 0));
    mockVideoListController._testSetVideos(demoVideos);
    videoCollection.pushVideos(demoVideos);
    it('should iterate videos of non-empty collection', ()=> {
        let counter = 0;
        for(const video of videoCollection.iterVideos()){
            assert(video.id === demoVideos[counter++].id);
        }
        assert(demoVideos.length === counter);
    });
}

function _shouldGetVideoIds(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    it('should get video ids of empty collection', ()=>assert(videoCollection.getVideosIds().length === 0));
    mockVideoListController._testSetVideos(demoVideos);
    videoCollection.pushVideos(demoVideos);
    it('should get video ids of correct length', ()=>assert(videoCollection.getVideosIds().length === demoVideos.length));
    it('should get video ids in pushed order', ()=> {
        let counter = 0;
        for(const video_id of videoCollection.getVideosIds()){
            assert(video_id === demoVideos[counter++].id);
        }
        assert(demoVideos.length === counter);
    });

}
function _shouldGetVideos(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    it('should get videos of empty collection', ()=>assert(videoCollection.getVideos().length === 0));
    mockVideoListController._testSetVideos(demoVideos);
    videoCollection.pushVideos(demoVideos);
    it('should get videos of correct length', ()=>assert(videoCollection.getVideos().length === demoVideos.length));

    it('should get videos in pushed order', ()=> {
        let counter = 0;
        for(const video of videoCollection.getVideos()){
            assert(video.id === demoVideos[counter++].id);
        }
        assert(demoVideos.length === counter);
    });
}
function _shouldHaveVideosId(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    let unusedDemoVideo = demoVideos.pop();
    mockVideoListController._testSetVideos(demoVideos);
    it('should not have video id', ()=>{
        demoVideos.forEach(video => assert(videoCollection.hasVideoId(video.id) === false));
    });
    videoCollection.pushVideos(demoVideos);
    it('should have pushed video id', ()=>{
        demoVideos.forEach(video => console.assert(videoCollection.hasVideoId(video.id) === true));
        assert(videoCollection.hasVideoId(unusedDemoVideo.id) === false);
    });
}
function _shouldHaveVideos(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    let unusedDemoVideo = demoVideos.pop();
    mockVideoListController._testSetVideos(demoVideos);
    it('should not have video', ()=>{
        demoVideos.forEach(video => assert(videoCollection.hasVideo(video.id) === false));
    });
    videoCollection.pushVideos(demoVideos);
    it('should have pushed video', ()=>{
        demoVideos.forEach(video => console.assert(videoCollection.hasVideo(video) === true));
        assert(videoCollection.hasVideo(unusedDemoVideo) === false);
    });
}

function _shouldPushVideo(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);
    it('should push video in order', ()=>{
        let counter = 0;
        for(const video of demoVideos){
            console.assert(videoCollection.hasVideo(video) === false);
            videoCollection.pushVideo(video);
            counter++;
            console.assert(videoCollection.length === counter);
            console.assert(videoCollection.hasVideo(video) === true);
        }
        for(let i=0; i<demoVideos.length; ++i){
            console.assert(demoVideos[i].id === videoCollection.getVideosIds()[i]);
        }
    });
}
function _shouldPushVideoId(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);
    it('should push video id in order', ()=>{
        let counter = 0;
        for(const video of demoVideos){
            console.assert(videoCollection.hasVideo(video) === false);
            videoCollection.pushVideoId(video.id);
            counter++;
            console.assert(videoCollection.length === counter);
            console.assert(videoCollection.hasVideo(video) === true);
        }
        for(let i=0; i<demoVideos.length; ++i){
            console.assert(demoVideos[i].id === videoCollection.getVideosIds()[i]);
        }
    });
}
function _shouldPushVideos(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);
    it('should push videos in order', ()=>{
        videoCollection.pushVideos(demoVideos);
        for(let i=0; i<demoVideos.length; ++i){
            assert(demoVideos[i].id === videoCollection.getVideosIds()[i]);
        }
    });
}
function _shouldPushVideoIds(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);

    it('should push video ids in order', ()=>{
        videoCollection.pushVideoIds(demoVideos.map(video => video.id));
        for(let i=0; i<demoVideos.length; ++i){
            console.assert(demoVideos[i].id === videoCollection.getVideosIds()[i]);
        }
    });
}

function _shouldClear(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);
    it('should clear', ()=> {
        videoCollection.pushVideos(demoVideos);
        assert(videoCollection.length !== 0);
        assert(videoCollection.getVideos().length !== 0);
        videoCollection.clear();
        assert(videoCollection.length === 0);
        assert(videoCollection.getVideos().length === 0);
    });
}

function _shouldRemoveVideo(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);
    it('should remove video of empty collection', ()=>{
        videoCollection.removeVideo(demoVideos[0]);
        assert(videoCollection.length === 0);
    });
    it('should remove video not contained in collection', ()=> {
        videoCollection.pushVideos(demoVideos);
        assert(videoCollection.length === demoVideos.length);
        videoCollection.removeVideo(new Video({id: "_testRemoveVideo"}));
        assert(videoCollection.length === demoVideos.length);
    });
    it('should remove video', ()=> {
        videoCollection.removeVideo(demoVideos[2]);
        assert(videoCollection.length === demoVideos.length - 1);
        assert(videoCollection.hasVideo(demoVideos[2]) === false);
    });
}
function _shouldRemoveVideoId(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);

    it('should remove video id of empty collection', ()=>{
        videoCollection.removeVideo(demoVideos[0]);
        assert(videoCollection.length === 0);
    });
    it('should remove video id not contained in collection', ()=> {
        videoCollection.pushVideos(demoVideos);
        assert(videoCollection.length === demoVideos.length);
        videoCollection.removeVideo(new Video({id: "_testRemoveVideo"}));
        assert(videoCollection.length === demoVideos.length);
    });
    it('should remove video id', ()=> {
        videoCollection.removeVideo(demoVideos[2]);
        assert(videoCollection.length === demoVideos.length-1);
        assert(videoCollection.hasVideo(demoVideos[2]) === false)
    });
}
function _shouldPopVideo(){
    let {mockVideoListController, videoCollection, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);
    it('should pop video of empty collection', ()=>assert(videoCollection.popVideo() === null));
    it('should pop video', ()=>{
        videoCollection.pushVideo(demoVideos[0]);
        assert(videoCollection.length === 1);
        let poppedVideo = videoCollection.popVideo();
        assert(poppedVideo instanceof Video);
        assert(poppedVideo.id === demoVideos[0].id);
        assert(videoCollection.length === 0);
        assert(videoCollection.popVideo() === null);
    });
}
