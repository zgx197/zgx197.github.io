import type { Education } from "./resume-schema";
import type {
  ResumeSourceExperience,
  ResumeSourceHonor,
  ResumeSourceLayeredText,
  ResumeSourceProfile,
  ResumeSourceProject,
  ResumeSourceProjectStorySection,
  ResumeSourceTextEntry,
} from "./resume-source";

export type ResumeSourceOverrides = {
  profile?: Partial<ResumeSourceProfile>;
  experiences?: Record<
    string,
    Partial<Omit<ResumeSourceExperience, "id" | "dedupeKey">> & {
      content?: Partial<ResumeSourceLayeredText>;
      highlights?: ResumeSourceTextEntry[];
    }
  >;
  projects?: Record<
    string,
    Partial<Omit<ResumeSourceProject, "slug" | "dedupeKey">> & {
      content?: Partial<ResumeSourceLayeredText>;
      showcase?: Partial<ResumeSourceProject["showcase"]>;
      storySections?: ResumeSourceProjectStorySection[];
    }
  >;
  skills?: Record<string, string[]>;
  honors?: ResumeSourceHonor[];
  education?: Partial<Education>;
  hiddenExperienceIds?: string[];
  hiddenProjectSlugs?: string[];
};

export const resumeOverrides: ResumeSourceOverrides = {
  "profile": {
    "contacts": [
      {
        "label": "简历",
        "href": "/resume"
      },
      {
        "label": "GitHub",
        "href": "https://github.com/zgx197",
        "external": true
      },
      {
        "label": "Steam",
        "href": "https://steamcommunity.com/profiles/76561198340584094",
        "external": true
      },
      {
        "label": "Email",
        "href": "mailto:guoxin_zhang@outlook.com"
      }
    ]
  },
  "experiences": {
    "北京百度网讯科技有限公司-2018-09": {
      "content": {
        "summary": [
          {
            "id": "experience-override-北京百度网讯科技有限公司-2018-09-summary-1",
            "dedupeKey": "围绕两千万百科词条入库与知识库扩充负责流程设计分类策略与天级数据更新链路建设",
            "text": "围绕两千万百科词条入库与知识库扩充，负责流程设计、分类策略与天级数据更新链路建设。"
          }
        ],
        "refined": [
          {
            "id": "experience-override-北京百度网讯科技有限公司-2018-09-refined-1",
            "dedupeKey": "这段实习经历主要聚焦知识库扩充基础设施建设目标是把海量百科词条稳定转换成可进入知识库的实体与概念词",
            "text": "这段实习经历主要聚焦知识库扩充基础设施建设，目标是把海量百科词条稳定转换成可进入知识库的实体与概念词。"
          },
          {
            "id": "experience-override-北京百度网讯科技有限公司-2018-09-refined-2",
            "dedupeKey": "我的工作集中在流程设计分类与关联策略以及例行数据生产链路搭建三个部分更偏向底层能力建设而不是单次离线任务",
            "text": "我的工作集中在流程设计、分类与关联策略、以及例行数据生产链路搭建三个部分，更偏向底层能力建设而不是单次离线任务。"
          }
        ],
        "original": [
          {
            "id": "experience-override-北京百度网讯科技有限公司-2018-09-original-1",
            "dedupeKey": "百度百科词条与知识库关联项目本项目是将两千万百科词条收录入知识库中以扩充知识库里的实体和概念词数量主要通过多种分类策略对输入的百科页面进行分类细化得到一个精准的词条类别进而将该词条与知识库中的概念节点相关联",
            "text": "百度百科词条与知识库关联项目：本项目是将两千万百科词条收录入知识库中以扩充知识库里的实体和概念词数量，主要通过多种分类策略对输入的百科页面进行分类细化，得到一个精准的词条类别，进而将该词条与知识库中的概念节点相关联。"
          }
        ]
      },
      "highlights": [
        {
          "id": "experience-override-北京百度网讯科技有限公司-2018-09-highlight-1",
          "dedupeKey": "设计从预处理到知识库更新的完整计算链路明确各阶段输入输出与迭代边界",
          "text": "设计从预处理到知识库更新的完整计算链路，明确各阶段输入输出与迭代边界。"
        },
        {
          "id": "experience-override-北京百度网讯科技有限公司-2018-09-highlight-2",
          "dedupeKey": "结合分类模型消歧重召回与定义句特征细化提升词条类别判定与知识节点映射质量",
          "text": "结合分类模型、消歧重召回与定义句特征细化，提升词条类别判定与知识节点映射质量。"
        },
        {
          "id": "experience-override-北京百度网讯科技有限公司-2018-09-highlight-3",
          "dedupeKey": "搭建airflow天级更新流程并将结果推送到业务方数据库支撑百科结构化数据能力",
          "text": "搭建 Airflow 天级更新流程，并将结果推送到业务方数据库，支撑百科结构化数据能力。"
        }
      ]
    }
  },
  "projects": {
    "baike-knowledge-base": {
      "cardMeta": [
        "百度实习",
        "知识图谱 / NLP",
        "主要RD"
      ],
      "cardTags": [
        "知识图谱",
        "百科词条分类",
        "知识关联",
        "深度学习分类",
        "Airflow",
        "数据工程"
      ],
      "heroEyebrow": "Featured Project / Internship",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "流程图 / 数据链路展示位",
        "featuredDescription": "这里适合放一张覆盖预处理、分类、关联、更新的整体流程图，或者用录屏讲清楚从百科词条到知识库概念节点的映射过程。",
        "sideBlocks": [
          {
            "title": "推荐素材",
            "items": [
              "端到端计算流程图",
              "分类与召回策略示意",
              "关联结果样例或数据看板"
            ]
          },
          {
            "title": "展示重点",
            "description": "优先让读者看到这是一条可持续运行的数据生产链路，而不是一次性的离线分类任务。"
          }
        ],
        "gallery": [
          {
            "title": "预处理与粗分类",
            "description": "从百科页面信息抽取到首轮类别判断"
          },
          {
            "title": "细分类与知识关联",
            "description": "结合定义句特征与知识节点完成精细映射"
          },
          {
            "title": "例行更新数据流",
            "description": "天级更新、结果推送与业务消费"
          }
        ],
        "note": "如果后续补展示素材，建议优先放流程图、策略拆解和结果样例，比抽象说明更能体现项目价值。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目影响",
          "items": [
            {
              "value": "98%",
              "label": "整体准确率"
            },
            {
              "value": "98%+",
              "label": "召回率"
            },
            {
              "value": "2.6kw+",
              "label": "高质量结果"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目介绍",
          "paragraphs": [
            "项目目标是把两千万百科词条稳定收录进知识库，用来扩充实体与概念词覆盖范围，并为后续知识理解任务提供更完整的底座。",
            "从工程视角看，这不是单点模型优化，而是一条从页面预处理、分类细化到知识库关联和持续更新的完整生产链路。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "流程设计",
          "items": [
            {
              "title": "端到端计算链路",
              "detail": "负责设计整体处理流程，将任务拆成预处理、粗分类、关键词召回、类别细化、知识库关联、知识库更新六个阶段，让各环节职责清晰且便于持续迭代。"
            },
            {
              "title": "知识节点映射",
              "detail": "围绕词条类别判定与知识库概念节点匹配组织中间结果，使百科义项能够更稳定地映射到知识库中的目标概念。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "分类与关联策略",
          "items": [
            {
              "title": "粗分类与补召回",
              "detail": "在粗分类阶段结合深度学习分类模型与百科消歧词重召回，先扩大标签覆盖，再进入后续细分类阶段。"
            },
            {
              "title": "定义句特征细化",
              "detail": "利用百科定义句的句首句尾特征进一步压缩候选类别，使词条类别结果更适合后续知识库关联。"
            },
            {
              "title": "字符串计算关联",
              "detail": "在细分类结果基础上，通过字符串计算等方式判断百科义项与知识节点的对应关系，形成可落库的关联结果。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "数据生产与交付",
          "items": [
            {
              "title": "天级更新数据流",
              "detail": "利用公司内部 Airflow 搭建天级更新流程，保证词条关联结果能够持续刷新，并及时推送到业务方数据库。"
            },
            {
              "title": "结构化数据价值",
              "detail": "与百科团队协作，将关联结果作为重要特征融合进百科结构化数据中，支撑百度百科实体卡片及其他直接或间接使用百科词条计算的重要业务。"
            }
          ]
        },
        {
          "kind": "archive",
          "title": "项目档案",
          "description": "按统一栏目保留项目原始信息，并补充必要的结构化归档。",
          "sections": [
            {
              "title": "项目介绍",
              "paragraphs": [
                "本项目是将两千万百科词条收录入知识库中以扩充知识库里的实体和概念词数量，主要通过多种分类策略对输入的百科页面进行分类细化，得到一个精准的词条类别，进而将该词条与知识库中的概念节点相关联。"
              ]
            },
            {
              "title": "主要工作",
              "groups": [
                {
                  "title": "简历原文",
                  "items": [
                    "整体流程：负责设计整体计算流程，目前整个流程分为预处理、粗分类、关键词召回、类别细化、知识库关联、知识库更新。",
                    "策略设计：设计各个流程中相关策略及搭建分类模型。在预处理阶段使用百科词条中各项元素筛选整合百科词表中的内容；在粗分类阶段利用深度学习分类模型对输入的百科词表进行粗分类，并利用百科消歧词对模型漏召结果进行重召回，提升粗分类标签整体覆盖；使用百科定义句中的句首句尾特征对百科粗分类结果进行细化，得到更精确的类别；在以上基础上将百科细分类结果与知识库知识节点进行字符串计算，进而得知每条百科义项对应的知识库概念节点。",
                    "例行数据流搭建：利用公司内部 Airflow 搭建天级更新数据流，保证数据更新时效性，并将数据及时推送到业务方数据库中。"
                  ]
                }
              ]
            },
            {
              "title": "技术档案",
              "groups": [
                {
                  "title": "项目角色",
                  "paragraphs": [
                    "主要RD"
                  ]
                },
                {
                  "title": "项目时间",
                  "paragraphs": [
                    "2018.09 - 2020.07"
                  ]
                },
                {
                  "title": "项目影响",
                  "paragraphs": [
                    "与部门其他团队及百科团队一起合作，将百科词条关联结果作为一个重要特征融合进百科结构化数据中，以支持百度百科实体卡片及其他直接或间接使用百科词条计算的公司重要业务。百科词条与知识库关联整体准确率 98%，召回 98%+，共生成 2.6kw+ 高质量结果（基本能覆盖高质量百科页面）。"
                  ]
                }
              ]
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-baike-knowledge-base-summary-1",
            "dedupeKey": "围绕两千万百科词条入库搭建从页面分类到知识库关联的完整链路为知识库扩充提供稳定的数据生产能力",
            "text": "围绕两千万百科词条入库，搭建从页面分类到知识库关联的完整链路，为知识库扩充提供稳定的数据生产能力。"
          }
        ],
        "refined": [
          {
            "id": "project-override-baike-knowledge-base-refined-1",
            "dedupeKey": "在百度实习阶段参与知识库扩充基础设施建设目标是把海量百科词条稳定转成可进入知识库的实体与概念词",
            "text": "在百度实习阶段参与知识库扩充基础设施建设，目标是把海量百科词条稳定转成可进入知识库的实体与概念词。"
          }
        ]
      }
    }
  },
  "skills": {},
  "hiddenExperienceIds": [],
  "hiddenProjectSlugs": []
};


