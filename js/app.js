import { createApp } from 'https://unpkg.com/petite-vue?module'
import Tooltip from './tooltip.js';
import Store from './store.js';
import YoutubePlayer from "./youtube_player.js";
import VideoQueue from "./video_queue.js";

createApp({
    Tooltip,
    Store,
    YoutubePlayer,
    VideoQueue
}).mount();