export type SingerIdentity = {
    id: string;
    name: string;
};

export type Singer = SingerIdentity & {
    isLeader: boolean;
};
