export default function VideoList(props){
    return {
        $template: '#video-list-template',
        videoIdList: props.videoIdList,
    }
}