const spaceId = "<SPACE ID>"
const token = "<TOKEN>"
const environmentId = "master"
const graphqlUrl = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environmentId}`

const isDebug = true; // toggle it to false to use contentful
const demoGuides = [
    {
        sys: {
            id: 1,
            publishedAt: new Date(),

        },
        title: "Demo guide",
        preview: {
            url: "https://picsum.photos/200"
        },
        contentfulMetadata: {
            tags: [
                {
                    name: "minecraft",
                    id: 1
                },
                {
                    name: "demo",
                    id: 2,
                }
            ]
        },
        content: {
            json: {
                nodeType: 'document',
                content: [
                    {
                        nodeType: 'paragraph',
                        content: [
                            {
                                nodeType: 'text',
                                value: 'Hello world!',
                                marks: [],
                            },
                        ],
                    },
                ],
            }


        }
    }
]

export class GuideController {
    constructor(locale) {
        const languages = {
            en: "en-US",
            ru: "ru"
        }
        this.locale = languages[locale]
    }
    /**
     * 
     * @param {string} query 
     * @param {Record<string, unknown>} variables 
     * @returns {Promise<any>}
     */
    sendQuery(query, variables) {
        return fetch(graphqlUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        }).then(res => res.json()).then(res => res.data);
    }

    async getAllGuides() {
        const variables = { locale: this.locale };
        const query = `
            query($locale: String!) {
                guidesCollection(locale: $locale) {
                    items {
                        contentfulMetadata {
                            tags {
                                name
                                id 
                            }
                        }
                        sys {
                            publishedAt
                            id
                        }
                        title
                        preview {
                            url
                        }
                    }
                }
            }
        `
        const res = isDebug ? { guidesCollection: { items: demoGuides } } : await this.sendQuery(query, variables);

        return res.guidesCollection.items.map(this.convertPreviewGuide);
    }
    /**
     * 
     * @param {string} id 
     * @returns 
     */
    async getGuide(id) {
        const variables = { locale: this.locale, id };
        const query = `
            query ($id: String!, $locale: String!) {
                guides(id: $id, locale: $locale) {
                    title
                    content {
                        json
                    }
                    preview {
                        url
                    }
                    contentfulMetadata {
                        tags {
                            name
                            id 
                        }
                    }
                    sys {
                        publishedAt
                        id
                    }
                }
            }
        `

        const res = isDebug ? { guides: demoGuides[0] } : await this.sendQuery(query, variables)

        return this.convertGuide(res.guides)
    }
    /**
     * 
     * @param {any} graphqlGuide 
     * @returns {import("./guide.js").Guide}
     */
    convertGuide(graphqlGuide) {
        return {
            id: graphqlGuide.sys.id,
            title: graphqlGuide.title,
            previewUrl: graphqlGuide.preview?.url,
            tags: graphqlGuide.contentfulMetadata.tags,
            updatedAt: new Date(graphqlGuide.sys.publishedAt),
            content: graphqlGuide.content.json,
        }
    }
    /**
     * 
     * @param {any} graphqlPreviewGuide 
     * @returns {import("./guide.js").PreviewGuide}
     */
    convertPreviewGuide(graphqlPreviewGuide) {
        return {
            id: graphqlPreviewGuide.sys.id,
            title: graphqlPreviewGuide.title,
            previewUrl: graphqlPreviewGuide.preview?.url,
            tags: graphqlPreviewGuide.contentfulMetadata.tags,
            updatedAt: new Date(graphqlPreviewGuide.sys.publishedAt),
        }
    }
    /**
     * 
     * @param {string} search 
     * @returns 
     */
    async searchGuides(search) {
        const variables = { locale: this.locale, search };
        const query = `
            query ($search: String!, $locale: String!) {
                guidesCollection(
                    where: {
                        title_contains: $search
                    },
                    locale: $locale
                ) {
                    items {
                        contentfulMetadata {
                            tags {
                                name
                                id
                            }
                        }
                        sys {
                            publishedAt
                            id
                        }
                        title
                        preview {
                            url
                        }
                    }
                }
            }
        `

        const res = isDebug ? { guidesCollection: { items: demoGuides.filter((g) => g.title.includes(search)) } } : await this.sendQuery(query, variables)

        return res.guidesCollection.items.map(this.convertPreviewGuide)
    }
}