export type QueueEntry = {
    id: string;
    singerId: string;
    singerName: string;
    isLeader: boolean;
    videoId: string;
    title: string;
};

export type QueueSnapshot = {
    current: QueueEntry | null;
    upcoming: QueueEntry[];
};
