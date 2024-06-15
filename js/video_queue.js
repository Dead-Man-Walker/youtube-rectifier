export default function VideoQueue(props){
    return {
        videoQueue: props.videoQueue,

        onClickVideo(video){
            this.playVideo(video);
        }
    }
}