export interface Tag {
    name: string;
    id: string;
}

export interface Guide {
    tags: Tag[];
    title: string[];
    previewUrl?: string;
    content: any;
    updatedAt: Date;
    createdAt: Date;
    id: string;
}

export interface PreviewGuide {
    id: string;
    previewUrl?: string;
    title: string;
    updatedAt: Date;
    tags: Tag[]
}