import video1 from '../assets/videos/0001V1.mp4';
import video2 from '../assets/videos/0002v2.mp4';
import video3 from '../assets/videos/0003V3.mp4';
import video4 from '../assets/videos/0004V4.mp4';
import video5 from '../assets/videos/0005V5.mp4';
import video6 from '../assets/videos/0006V6.mp4';
import video7 from '../assets/videos/0007V7.mp4';
import video8 from '../assets/videos/0008V8.mp4';
import video9 from '../assets/videos/0009V9.mp4';

interface VideoData {
    video: string;
    filename: string;
}

export const videos: VideoData[] = [
    { video: video1, filename: '0001V1.mp4' },
    { video: video2, filename: '0002v2.mp4' },
    { video: video3, filename: '0003V3.mp4' },
    { video: video4, filename: '0004V4.mp4' },
    { video: video5, filename: '0005V5.mp4' },
    { video: video6, filename: '0006V6.mp4' },
    { video: video7, filename: '0007V7.mp4' },
    { video: video8, filename: '0008V8.mp4' },
    { video: video9, filename: '0009V9.mp4' }
];