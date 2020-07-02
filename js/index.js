
const MIN_VIDEO_LIST_COLUMN_WIDTH = 500;

function ready(){
    const YT_API_KEY = "AIzaSyCt7PkKtIlJl_uVw-lRpymNR49lD919gFQ";
    const app = new controler(new Model(), new View(), YT_API_KEY);

    updateVideoListLayout();
    window.addEventListener("resize", updateVideoListLayout);
}


document.addEventListener("DOMContentLoaded", ready, false);



function updateVideoListLayout(){
    const columns = Math.max(1, parseInt(window.innerWidth / MIN_VIDEO_LIST_COLUMN_WIDTH));
    document.documentElement.style.setProperty("--video-list-columns", columns);
}