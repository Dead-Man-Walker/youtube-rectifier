import Video from "../../js/models/video.js";
import VideoQueue from "../../js/models/video-queue.js";
import {it, assert, setTestSubject} from "../test-utils.js";



class _MockVideoListController{
    constructor() {
        let that = this;
        this._testVideos = new Map();
        this.model = {
            getVideo: videoId => {
                return this._testVideos.get(videoId) || null;
            },
            iterVideoIds: function*(){
                for(const videoId of that._testVideos.keys()){
                    yield videoId;
                }
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
        videoQueue: new VideoQueue(_mock),
        demoVideos: ["1","2","11","10"].map(id => new Video({id}))
    }
}

export function testAll(){
    setTestSubject('VideoQueue');
    _shouldShuffle();
    _shouldRestore();

}


function _shouldShuffle(){
    let shuffleShim = a => a.reverse();
    let {mockVideoListController, videoQueue, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);
    videoQueue._shuffleArray = shuffleShim;
    videoQueue.pushVideos(demoVideos);
    it('should shuffle videos', ()=>{
        videoQueue.shuffle();
        shuffleShim(demoVideos);
        let v1, v2;
        while(true){
            v1 = demoVideos.pop();
            v2 = videoQueue.popVideo();

            if(!v1 && !v2)
                break;
            assert(v1.id === v2.id);
        }
    });
}

function _shouldRestore(){
    let shuffleShim = a => a.reverse();
    let {mockVideoListController, videoQueue, demoVideos} = _getSetup();
    mockVideoListController._testSetVideos(demoVideos);
    videoQueue._shuffleArray = shuffleShim;
    videoQueue.pushVideos(demoVideos);
    it('should restore video order', ()=>{
        let originalIds = videoQueue.getVideosIds();
        videoQueue.shuffle();
        videoQueue.restoreOrder();
        let v1, vId;
        while(true){
            v1 = videoQueue.popVideo();
            vId = originalIds.pop();

            if(!v1 && !vId)
                break;
            assert(v1.id === vId);
        }
    });
}