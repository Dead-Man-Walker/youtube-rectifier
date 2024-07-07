import { createApp } from 'https://unpkg.com/petite-vue?module'
import Tooltip from './tooltip.js';
import Store from './store.js';
import VideoList from './video_list.js';
import YoutubePlayer from "./youtube_player.js";
import VideoQueue from "./video_queue.js";
import VideoHistory from "./video_history.js";

createApp({
    Tooltip,
    Store,
    VideoList,
    YoutubePlayer,
    VideoHistory,
    VideoQueue
}).mount();