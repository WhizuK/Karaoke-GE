export type YouTubeSearchResult = {
    videoId: string;
    title: string;
    channelTitle: string;
};

export type YouTubeSearchPage = {
    results: YouTubeSearchResult[];
    nextPageToken: string | null;
};
