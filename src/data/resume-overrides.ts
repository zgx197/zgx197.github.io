import type { Education } from "./resume-schema";
import type {
  ResumeSourceExperience,
  ResumeSourceProfile,
  ResumeSourceProject,
  ResumeSourceProjectStorySection,
} from "./resume-source";

export type ResumeSourceOverrides = {
  profile?: Partial<ResumeSourceProfile>;
  experiences?: Record<string, Partial<Omit<ResumeSourceExperience, "id">>>;
  projects?: Record<
    string,
    Partial<Omit<ResumeSourceProject, "slug">> & {
      showcase?: Partial<ResumeSourceProject["showcase"]>;
      storySections?: ResumeSourceProjectStorySection[];
    }
  >;
  skills?: Record<string, string[]>;
  honors?: string[];
  education?: Partial<Education>;
  hiddenExperienceIds?: string[];
  hiddenProjectSlugs?: string[];
};

export const resumeOverrides: ResumeSourceOverrides = {
  profile: {
    contacts: [
      { label: "简历", href: "/resume" },
      { label: "GitHub", href: "https://github.com/zgx197", external: true },
      { label: "Steam", href: "https://steamcommunity.com/profiles/76561198340584094", external: true },
      { label: "Email", href: "mailto:guoxin_zhang@outlook.com" },
    ],
  },
  experiences: {},
  projects: {},
  skills: {},
  hiddenExperienceIds: [],
  hiddenProjectSlugs: [],
};
