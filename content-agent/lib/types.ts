export type IdeaStatus = "idea" | "research" | "draft" | "approved" | "scheduled" | "published";

export type Idea = {
  id: string;
  title: string;
  angle: string;
  rationale: string;
  pillar: string;
  format: "artigo" | "linkedin" | "instagram" | "experimento";
  score: number;
  status: IdeaStatus;
};

export type ContentBundle = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  article: string;
  linkedin: string;
  instagram: {
    caption: string;
    slides: Array<{ title: string; body: string }>;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    primaryKeyword: string;
  };
  validationNotes: string[];
};
