import Video from "../../js/models/video.js";
import {it, assert, setTestSubject} from "../test-utils.js";

export function testAll(){
    setTestSubject('Video');
    _shouldConstructWithoutParams();
    _shouldConstructWithParams()
}


function _shouldConstructWithoutParams(){
    let video = new Video();
    it('should construct without parameters', ()=> {
        assert(video.id === null && video.title === null && video.thumbnail === null);
    });
}
function _shouldConstructWithParams(){
    const id = "id";
    const title = "title";
    const thumbnail = "thumbnail";

    let video = new Video({id, title, thumbnail});
    it('should construct with parameters', ()=> {
        assert(video.id === id && video.title === title && video.thumbnail === thumbnail);
    });
}