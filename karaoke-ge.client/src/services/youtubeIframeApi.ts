import type { YouTubePlayerConstructor } from '../types/youtube';

type YouTubeWindow = Window & {
    YT?: { Player: YouTubePlayerConstructor };
    onYouTubeIframeAPIReady?: () => void;
};

const API_SCRIPT_URL = 'https://www.youtube.com/iframe_api';

let apiPromise: Promise<YouTubePlayerConstructor> | null = null;

export function loadYouTubeIframeApi(): Promise<YouTubePlayerConstructor> {
    apiPromise ??= new Promise(resolve => {
        const youTubeWindow = window as YouTubeWindow;

        if (youTubeWindow.YT?.Player) {
            resolve(youTubeWindow.YT.Player);
            return;
        }

        youTubeWindow.onYouTubeIframeAPIReady = () => resolve(youTubeWindow.YT!.Player);

        const script = document.createElement('script');
        script.src = API_SCRIPT_URL;
        document.head.append(script);
    });

    return apiPromise;
}
