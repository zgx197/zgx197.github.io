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
      replaceContent?: boolean;
      replaceHighlights?: boolean;
    }
  >;
  projects?: Record<
    string,
    Partial<Omit<ResumeSourceProject, "slug" | "dedupeKey">> & {
      content?: Partial<ResumeSourceLayeredText>;
      showcase?: Partial<ResumeSourceProject["showcase"]>;
      storySections?: ResumeSourceProjectStorySection[];
      replaceContent?: boolean;
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
    "yaoxiang-2024-02": {
      "replaceContent": true,
      "replaceHighlights": true,
      "content": {
        "summary": [
          {
            "id": "experience-override-yaoxiang-2024-02-summary-1",
            "dedupeKey": "负责2d沙盒修仙游戏的核心系统与底层架构开发",
            "text": "负责 2D 俯视角沙盒修仙原型项目的核心系统与底层架构研发，覆盖基础框架、世界生成、玩法系统与性能优化。"
          },
          {
            "id": "experience-override-yaoxiang-2024-02-summary-2",
            "dedupeKey": "2d俯视角沙盒修仙模拟类游戏项目的设计深受《环世界》启发其核心特色是通过程序化生成的开放世界深度模拟的角色行为与社会关系以及由ai驱动的动态故事系统为玩家每一次游戏都创造出独一无二的修仙宗门经营体验离职前项目仍属于初期开发阶段各项内容都只有基础功能",
            "text": "项目方向受《环世界》启发，目标是将程序化开放世界、角色社会关系与动态事件系统组合成可持续演化的宗门经营体验。"
          }
        ],
        "refined": [
          {
            "id": "experience-override-yaoxiang-2024-02-refined-1",
            "dedupeKey": "负责2d沙盒修仙项目的底层框架核心玩法系统和性能优化工作覆盖框架选型数据流设计配置管线世界生成与存档方案",
            "text": "负责基础框架、数据驱动流程、配置方案、世界生成、法宝策略背包、随机事件、社会关系与存档优化。"
          },
          {
            "id": "experience-override-yaoxiang-2024-02-refined-2",
            "dedupeKey": "项目阶段仍处于早期原型验证更强调先搭出可持续迭代的demo再为后续复杂系统预留清晰边界",
            "text": "项目处于早期原型验证阶段，已完成基础框架、数据驱动流程和多系统联动骨架搭建。"
          },
          {
            "id": "experience-override-yaoxiang-2024-02-refined-3",
            "dedupeKey": "2d俯视角沙盒修仙模拟类游戏项目的设计深受《环世界》启发其核心特色是通过程序化生成的开放世界深度模拟的角色行为与社会关系以及由ai驱动的动态故事系统为玩家每一次游戏都创造出独一无二的修仙宗门经营体验离职前项目仍属于初期开发阶段各项内容都只有基础功能",
            "text": "已实现配置方案、世界生成、法宝策略背包、随机事件、社会关系与存档优化等核心模块。"
          }
        ],
        "original": [
          {
            "id": "experience-override-yaoxiang-2024-02-original-1",
            "dedupeKey": "2d俯视角沙盒修仙模拟类游戏项目的设计深受《环世界》启发其核心特色是通过程序化生成的开放世界深度模拟的角色行为与社会关系以及由ai驱动的动态故事系统为玩家每一次游戏都创造出独一无二的修仙宗门经营体验离职前项目仍属于初期开发阶段各项内容都只有基础功能",
            "text": "项目设计深受《环世界》启发，其核心特色是通过程序化生成的开放世界、深度模拟的角色行为与社会关系，以及由 AI 驱动的动态故事系统，为玩家创造独一无二的修仙宗门经营体验。"
          }
        ]
      },
      "highlights": [
        {
          "id": "experience-override-yaoxiang-2024-02-highlight-1",
          "dedupeKey": "基于gameframework搭建基础框架并用mvc思路重组核心数据流",
          "text": "基于 GameFramework 做二次开发，并用 MVC 思路搭建核心数据流和基础框架。"
        },
        {
          "id": "experience-override-yaoxiang-2024-02-highlight-2",
          "dedupeKey": "实现世界生成社会关系随机事件与策略背包等关键系统",
          "text": "从零实现 Hex Grid 世界生成、法宝策略背包、随机事件与社会关系等关键系统。"
        },
        {
          "id": "experience-override-yaoxiang-2024-02-highlight-3",
          "dedupeKey": "通过protobufnet对象池分帧执行和动态lod优化存档与运行时性能",
          "text": "主导 protobuf-net 存档优化，并结合预加载、对象池、分帧执行和动态 LOD 提升运行时性能。"
        },
        {
          "id": "experience-override-yaoxiang-2024-02-highlight-4",
          "dedupeKey": "2d俯视角沙盒修仙模拟类游戏项目的设计深受《环世界》启发其核心特色是通过程序化生成的开放世界深度模拟的角色行为与社会关系以及由ai驱动的动态故事系统为玩家每一次游戏都创造出独一无二的修仙宗门经营体验离职前项目仍属于初期开发阶段各项内容都只有基础功能",
          "text": "搭建混合配置方案与上下文输入管理框架，支撑策划迭代与复杂交互场景。"
        },
        {
          "id": "experience-override-yaoxiang-2024-02-highlight-5",
          "dedupeKey": "设计人口热力图首都定位与国家边界扩张等文明演化模拟逻辑",
          "text": "设计人口热力图、首都定位与国家边界扩张等文明演化模拟逻辑。"
        }
      ]
    },
    "北京百度网讯科技有限公司-2018-09": {
      "replaceContent": true,
      "replaceHighlights": true,
      "content": {
        "summary": [
          {
            "id": "experience-override-北京百度网讯科技有限公司-2018-09-summary-1",
            "dedupeKey": "负责两千万级百科词条入库与知识库扩充聚焦流程设计分类关联策略和天级数据更新链路建设",
            "text": "负责两千万级百科词条入库与知识库扩充，聚焦流程设计、分类关联策略和天级数据更新链路建设。"
          }
        ],
        "refined": [
          {
            "id": "experience-override-北京百度网讯科技有限公司-2018-09-refined-1",
            "dedupeKey": "这段实习经历主要聚焦知识库扩充基础设施建设目标是把海量百科词条稳定转换成可进入知识库的实体与概念词",
            "text": "工作内容聚焦知识库扩充基础设施建设，将海量百科词条转换为可进入知识库的实体与概念词。"
          },
          {
            "id": "experience-override-北京百度网讯科技有限公司-2018-09-refined-2",
            "dedupeKey": "我的工作集中在流程设计分类与关联策略以及例行数据生产链路搭建三个部分更偏向底层能力建设而不是单次离线任务",
            "text": "负责流程设计、分类与关联策略，以及例行数据生产链路搭建，支撑大规模知识入库与日常更新。"
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
    },
    "北京畅聊天下科技有限公司-2025-07": {
      "content": {
        "summary": [
          {
            "id": "experience-override-北京畅聊天下科技有限公司-2025-07-summary-1",
            "dedupeKey": "工作内容负责公司核心unity编辑器平台与战斗基础设施研发主导stagedesignersnapgridflowsceneblueprintframesync技能逻辑编辑器framesync技能释放与执行系统等核心模块建设覆盖场景设计工具链场景级蓝图框架确定性技能编辑技能运行时主链路及相关导入导出调试验证和资产收口流程持续推动内容生产工具与运行时系统的平台化结构化演进除核心系统研发外持续推动aiagent与大模型辅助研发工作流在游戏工具链中的落地围绕复杂系统分析知识辅助工",
            "text": "负责公司核心 Unity 编辑器平台与战斗基础设施研发，主导场景设计平台、场景蓝图框架、Framesync 技能编辑器与技能运行时等核心模块建设，推动工具链与运行时系统的平台化演进。"
          }
        ],
        "refined": [
          {
            "id": "experience-override-北京畅聊天下科技有限公司-2025-07-refined-1",
            "dedupeKey": "工作内容负责公司核心unity编辑器平台与战斗基础设施研发主导stagedesignersnapgridflowsceneblueprintframesync技能逻辑编辑器framesync技能释放与执行系统等核心模块建设覆盖场景设计工具链场景级蓝图框架确定性技能编辑技能运行时主链路及相关导入导出调试验证和资产收口流程持续推动内容生产工具与运行时系统的平台化结构化演进除核心系统研发外持续推动aiagent与大模型辅助研发工作流在游戏工具链中的落地围绕复杂系统分析知识辅助工",
            "text": "工作内容覆盖 Unity 编辑器平台与战斗基础设施两条主线，包括场景设计、场景蓝图、技能编辑工具链，以及确定性技能运行时主链路建设。"
          },
          {
            "id": "experience-override-北京畅聊天下科技有限公司-2025-07-refined-2",
            "dedupeKey": "除核心系统研发外也持续推动aiagent与大模型辅助研发工作流在游戏工具链中的落地围绕复杂系统分析知识辅助和研发提效预留结构化接入能力",
            "text": "除核心系统研发外，也持续推动 AI Agent 与大模型辅助研发工作流在游戏工具链中的落地，围绕复杂系统分析、知识辅助和研发提效预留结构化接入能力。"
          }
        ],
        "original": [
          {
            "id": "experience-override-北京畅聊天下科技有限公司-2025-07-original-1",
            "dedupeKey": "工作内容负责公司核心unity编辑器平台与战斗基础设施研发主导stagedesignersnapgridflowsceneblueprintframesync技能逻辑编辑器framesync技能释放与执行系统等核心模块建设覆盖场景设计工具链场景级蓝图框架确定性技能编辑技能运行时主链路及相关导入导出调试验证和资产收口流程持续推动内容生产工具与运行时系统的平台化结构化演进除核心系统研发外持续推动aiagent与大模型辅助研发工作流在游戏工具链中的落地围绕复杂系统分析知识辅助工",
            "text": "工作内容：负责公司核心 Unity 编辑器平台与战斗基础设施研发，主导 StageDesigner、SnapGridFlow、SceneBlueprint、Framesync 技能逻辑编辑器、Framesync 技能释放与执行系统等核心模块建设，覆盖场景设计工具链、场景级蓝图框架、确定性技能编辑、技能运行时主链路及相关导入导出、调试验证和资产收口流程，持续推动内容生产工具与运行时系统的平台化、结构化演进。除核心系统研发外，持续推动 AI Agent 与大模型辅助研发工作流在游戏工具链中的落地，围绕复杂系统分析、知识辅助和研发提效预留结构化接入能力。"
          }
        ]
      },
      "highlights": [
        {
          "id": "experience-override-北京畅聊天下科技有限公司-2025-07-highlight-1",
          "dedupeKey": "工作内容负责公司核心unity编辑器平台与战斗基础设施研发主导stagedesignersnapgridflowsceneblueprintframesync技能逻辑编辑器framesync技能释放与执行系统等核心模块建设覆盖场景设计工具链场景级蓝图框架确定性技能编辑技能运行时主链路及相关导入导出调试验证和资产收口流程持续推动内容生产工具与运行时系统的平台化结构化演进除核心系统研发外持续推动aiagent与大模型辅助研发工作流在游戏工具链中的落地围绕复杂系统分析知识辅助工",
          "text": "主导 StageDesigner / SnapGridFlow 场景设计平台架构演进，统一场景身份、会话入口、模块装配与构建配置，支撑多场景类型在一致生命周期下运行。"
        },
        {
          "id": "experience-override-北京畅聊天下科技有限公司-2025-07-highlight-2",
          "dedupeKey": "设计并落地sceneblueprint场景蓝图框架打通dsl定义可视化编辑场景语义绑定导出契约运行时解释执行与调试回放链路",
          "text": "设计并落地 SceneBlueprint 场景蓝图框架，打通 DSL 定义、可视化编辑、场景语义绑定、导出契约、运行时解释执行与调试回放链路。"
        },
        {
          "id": "experience-override-北京畅聊天下科技有限公司-2025-07-highlight-3",
          "dedupeKey": "主导framesync技能逻辑编辑器建设沉淀技能蓝图资产时间轴编排沙盒预览导入导出与自动收口能力提升技能内容生产闭环效率",
          "text": "主导 Framesync 技能逻辑编辑器建设，沉淀技能蓝图资产、时间轴编排、沙盒预览、导入导出与自动收口能力，提升技能内容生产闭环效率。"
        },
        {
          "id": "experience-override-北京畅聊天下科技有限公司-2025-07-highlight-4",
          "dedupeKey": "负责framesync技能释放与执行系统架构拆分释放控制层与技能执行层统一多来源释放入口状态推进能力调度伤害结算与表现联动链路",
          "text": "负责 Framesync 技能释放与执行系统架构，拆分释放控制层与技能执行层，统一多来源释放入口、状态推进、能力调度、伤害结算与表现联动链路。"
        },
        {
          "id": "experience-override-北京畅聊天下科技有限公司-2025-07-highlight-5",
          "dedupeKey": "持续推动aiagent与大模型辅助研发工作流接入游戏工具链围绕复杂系统分析知识辅助与流程提效预留结构化能力入口",
          "text": "持续推动 AI Agent 与大模型辅助研发工作流接入游戏工具链，围绕复杂系统分析、知识辅助与流程提效预留结构化能力入口。"
        }
      ]
    },
    "北京百度网讯科技有限公司-2020-07": {
      "replaceContent": true,
      "replaceHighlights": true,
      "content": {
        "summary": [
          {
            "id": "experience-override-北京百度网讯科技有限公司-2020-07-summary-1",
            "dedupeKey": "围绕中文短文本理解建设知识底座标注模型数据工程和服务部署能力",
            "text": "围绕中文短文本理解建设知识底座、知识标注模型、数据工程和服务部署能力，支撑搜索、广告、AIGC 等业务方向。"
          }
        ],
        "refined": [
          {
            "id": "experience-override-北京百度网讯科技有限公司-2020-07-refined-1",
            "dedupeKey": "这段经历重点不是单点模型优化而是知识增强文本理解基础设施建设",
            "text": "工作内容覆盖知识库、模型、训练数据、评测和服务部署等环节，面向中文短文本理解能力建设。"
          },
          {
            "id": "experience-override-北京百度网讯科技有限公司-2020-07-refined-2",
            "dedupeKey": "我的工作横跨termtree知识底座模型训练标签体系term-linking和服务落地",
            "text": "负责 TermTree 知识底座、标签体系与模型训练、term-linking 策略、评测体系和服务落地，覆盖从知识生产到业务使用的完整链路。"
          }
        ],
        "original": [
          {
            "id": "experience-override-北京百度网讯科技有限公司-2020-07-original-1",
            "dedupeKey": "短文本知识标注工具集研发项目从词汇理解和句子理解两个层面探索中文通用知识表征与应用通过构建中文全词类知识库并将短文本与通用词汇知识体系进行关联提升模型对中文语句的概念实体意图和主题理解能力从而实现通用域中文文本的精准解析与知识挖掘",
            "text": "短文本知识标注工具集研发：项目从词汇理解和句子理解两个层面探索中文通用知识表征与应用，通过构建中文全词类知识库并将短文本与通用词汇知识体系相关联，提升模型对中文语句的概念、实体、意图和主题理解能力。"
          }
        ]
      },
      "highlights": [
        {
          "id": "experience-override-北京百度网讯科技有限公司-2020-07-highlight-1",
          "dedupeKey": "建设termtree知识底座并沉淀百万级知识节点支撑多项在线离线理解任务",
          "text": "建设 TermTree 知识底座并沉淀百万级知识节点，支撑多项在线、离线知识理解任务。"
        },
        {
          "id": "experience-override-北京百度网讯科技有限公司-2020-07-highlight-2",
          "dedupeKey": "参与多任务短文本知识标注模型与标签体系设计服务搜索广告aigc等场景",
          "text": "参与多任务短文本知识标注模型与标签体系设计，服务搜索、广告、AIGC 等场景。"
        },
        {
          "id": "experience-override-北京百度网讯科技有限公司-2020-07-highlight-3",
          "dedupeKey": "从0到1构建训练样本测试集和评测流程降低模型升级风险",
          "text": "从 0 到 1 构建训练样本、测试集和评测流程，降低模型升级风险。"
        },
        {
          "id": "experience-override-北京百度网讯科技有限公司-2020-07-highlight-4",
          "dedupeKey": "研发termlinking和知识挖掘策略提升文本到知识节点映射稳定性",
          "text": "研发 term-linking 和知识挖掘策略，提升文本到知识节点映射的稳定性与可解释性。"
        },
        {
          "id": "experience-override-北京百度网讯科技有限公司-2020-07-highlight-5",
          "dedupeKey": "负责gpu和cpu集群部署形成稳定业务支撑能力",
          "text": "负责 GPU 和 CPU 集群部署，形成面向多业务线的稳定服务支撑能力。"
        }
      ]
    }
  },
  "projects": {
    "xiuxian-game": {
      "replaceContent": true,
      "title": "2D 沙盒修仙模拟游戏",
      "cardMeta": [
        "遥响动漫设计（北京）有限公司",
        "U3D 游戏开发工程师",
        "核心开发",
        "4人团队",
        "2024.02-2025.06"
      ],
      "cardTags": [
        "Unity",
        "GameFramework",
        "程序化生成",
        "Hex Grid",
        "社会关系图",
        "随机事件",
        "策略背包",
        "protobuf-net",
        "性能优化"
      ],
      "heroEyebrow": "Featured Project / Game Systems",
      "content": {
        "summary": [
          {
            "id": "project-override-xiuxian-game-summary-1",
            "dedupeKey": "受环世界启发的2d沙盒修仙原型项目负责基础框架世界生成玩法系统与性能优化",
            "text": "受《环世界》启发的 2D 沙盒修仙原型项目，负责基础框架、Hex Grid 世界生成、玩法系统联动与性能优化。"
          }
        ],
        "refined": [
          {
            "id": "project-override-xiuxian-game-refined-1",
            "dedupeKey": "负责gameframework二次开发mvc数据流hexgrid世界生成法宝策略背包社会关系随机事件和存档优化",
            "text": "负责 GameFramework 二次开发、MVC 数据流、Hex Grid 世界生成、法宝策略背包、社会关系与随机事件系统，以及存档优化。"
          },
          {
            "id": "project-override-xiuxian-game-refined-2",
            "dedupeKey": "项目处于早期原型阶段重点是先搭出可持续迭代的系统骨架和多系统联动方式",
            "text": "项目处于早期原型阶段，重点是先搭出可持续迭代的系统骨架和多系统联动方式。"
          }
        ],
        "original": [
          {
            "id": "project-override-xiuxian-game-original-1",
            "dedupeKey": "项目设计深受环世界启发通过程序化生成开放世界深度模拟角色行为与社会关系以及ai驱动动态故事系统构建修仙宗门经营体验",
            "text": "项目设计深受《环世界》启发，目标是通过程序化生成的开放世界、深度模拟的角色行为与社会关系，以及 AI 驱动的动态故事系统，构建可持续演化的修仙宗门经营体验。"
          }
        ]
      },
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "2D 沙盒修仙模拟游戏 展示位",
        "featuredDescription": "适合补世界生成结果、法宝背包界面、社会关系调试视图或大地图演化截图。",
        "sideBlocks": [
          {
            "title": "推荐素材",
            "items": [
              "Hex Grid 世界生成结果",
              "法宝策略背包与属性联动截图",
              "社会关系 / 随机事件调试视图"
            ]
          },
          {
            "title": "展示重点",
            "description": "优先展示系统之间的联动关系，而不是孤立 UI。"
          }
        ],
        "gallery": [
          {
            "title": "世界生成与文明演化",
            "description": "Hex Grid 地形、生物群落、人口热力图与国家边界生成结果"
          },
          {
            "title": "玩法与叙事系统",
            "description": "法宝策略背包、随机事件与社会关系闭环"
          },
          {
            "title": "工程与性能",
            "description": "预加载、对象池、分帧执行、VisibilityManager 与存档优化"
          }
        ],
        "note": "后续如果补图，优先补世界生成链路和法宝背包界面，这两类最能体现项目差异化。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目侧重点",
          "items": [
            {
              "value": "4人",
              "label": "核心团队"
            },
            {
              "value": "60%+",
              "label": "存档体积压缩"
            },
            {
              "value": "数倍",
              "label": "存档读写提升"
            },
            {
              "value": "Hex Grid",
              "label": "世界生成底座"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "这是一个 2D 俯视角沙盒修仙模拟原型项目，方向上受到《环世界》启发，目标是把程序化开放世界、角色社会关系和动态事件系统组合成可持续演化的宗门经营体验。离职前项目仍处于早期开发阶段，各项内容主要完成了基础骨架与核心系统验证。",
            "我在项目中主要负责基础框架、数据驱动流程、配置方案、程序化世界生成、法宝策略背包、随机事件、社会关系系统，以及存档和运行时性能优化。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "基础架构与数据流",
          "items": [
            {
              "title": "GameFramework 二次开发",
              "detail": "在对比多个常见框架后，选择基于成熟的 GameFramework 做二次开发，充分利用其模块化、事件驱动与资源管理能力，并按项目需求定制核心组件，加快原型推进速度。"
            },
            {
              "title": "MVC 数据驱动流程",
              "detail": "用 MVC 思路拆分核心数据、业务逻辑和表现层，构建清晰数据流，提升复杂模拟系统的可扩展性、可维护性与玩法迭代效率。"
            },
            {
              "title": "混合配置方案",
              "detail": "高频表格数据走 Excel + EPPlus 工具链，复杂结构模板走 ScriptableObject，可变对话流和事件内容走 JSON，在表达力、可视化与解析效率之间做平衡。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "核心玩法与模拟系统",
          "items": [
            {
              "title": "程序化世界生成",
              "detail": "从零构建 Hex Grid 多通道生成管线，结合多层 Perlin 噪声、BFS 河流生成、海拔温湿度计算与生物群落分配，并在上层继续做人口热力图、首都定位和国家边界扩张模拟。"
            },
            {
              "title": "法宝策略背包",
              "detail": "参考《背包乱斗》设计二维法宝布局系统，让不同形状法宝在有限空间内通过旋转和组合触发元素联动效果，把库存管理转成核心策略构筑玩法。"
            },
            {
              "title": "随机事件与社会关系",
              "detail": "构建 Excel 驱动的随机事件系统和基于图的社会关系系统，让角色关系变化、AI 行为和事件结果形成动态闭环，支撑涌现式叙事。"
            },
            {
              "title": "上下文输入管理",
              "detail": "基于 Unity 新输入系统实现上下文感知输入框架，通过 Action Map 状态切换、阻塞式 UI 输入栈和服务注册模式治理复杂交互场景。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "工程与性能",
          "items": [
            {
              "title": "预加载与异步工作流",
              "detail": "通过 Preload 阶段异步预加载核心数据表、配置文件和常用资源，把高成本加载集中到启动阶段，减少运行时卡顿。"
            },
            {
              "title": "对象池与分帧执行",
              "detail": "对高频实体统一做对象池管理，并将程序化生成等重任务拆成多帧执行，降低 GC 峰值与单帧耗时过长导致的卡顿。"
            },
            {
              "title": "动态 LOD 与智能剔除",
              "detail": "实现 VisibilityManager，根据对象与主摄像机距离和可见性动态启停渲染与更新逻辑，降低大规模场景下的渲染开销。"
            },
            {
              "title": "高效存档",
              "detail": "主导用 protobuf-net 替代原生 JSON 大地图存档，为 Unity 类型补充包装支持，并采用分离式存档策略，使读写速度提升数倍、文件体积压缩 60% 以上。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "我负责的重点模块",
          "items": [
            "GameFramework 二次开发、MVC 数据驱动流程与混合配置工具链。",
            "Hex Grid 世界生成、人口热力图、首都定位与国家边界扩张模拟。",
            "法宝策略背包、上下文输入管理与复杂交互状态治理。",
            "随机事件系统与基于图的社会关系系统联动。",
            "protobuf-net 存档优化、预加载、对象池、分帧执行与 VisibilityManager。"
          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            },
            {
              "label": "Steam 主页",
              "href": "https://steamcommunity.com/profiles/76561198340584094",
              "external": true
            }
          ]
        }
      ]
    },
    "baike-knowledge-base": {
      "replaceContent": true,
      "cardMeta": [
        "百度实习",
        "知识图谱 / NLP",
        "主要RD",
        "项目团队 3 人"
      ],
      "cardTags": [
        "知识图谱",
        "百科词条分类",
        "知识关联",
        "深度学习分类",
        "候选召回",
        "类别细化",
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
              "value": "6阶段",
              "label": "主流程拆解"
            },
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
          "title": "项目概览",
          "paragraphs": [
            "这个项目面向两千万级百度百科词条引入场景，目标是把开放百科页面稳定映射到内部知识库中的实体与概念节点，持续扩充知识库覆盖范围，并为后续知识理解任务提供更完整的基础底座。",
            "负责整体计算流程设计、分类与关联策略落地，以及例行数据流搭建，覆盖大规模开放页面处理、多义项消歧和知识节点映射的数据生产链路。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "流程拆解",
          "items": [
            {
              "title": "端到端计算链路",
              "detail": "将百科词条关联流程拆成预处理、粗分类、关键词召回、类别细化、知识库关联、知识库更新六个阶段，明确各阶段输入输出与收口标准，让两千万级词条处理能够以稳定的分层流程持续运行。"
            },
            {
              "title": "预处理输入规整",
              "detail": "在预处理阶段结合标题、义项、定义句、结构化字段等页面元素做筛选、整合和规范化处理，提取后续分类与关联所需的核心信息，提升整条链路的输入质量。"
            },
            {
              "title": "多阶段候选空间收缩",
              "detail": "重点处理大规模开放页面、多义项、分类不确定和节点歧义问题，通过多阶段策略逐步压缩候选空间，避免把复杂关联问题粗暴压成单步分类或单步匹配。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "分类与关联策略",
          "items": [
            {
              "title": "粗分类模型",
              "detail": "设计粗分类阶段的分类策略与模型方案，利用深度学习分类模型对输入百科词条做第一层类别判断，为后续类别细化和知识节点匹配提供候选范围，降低直接开放关联带来的搜索空间和计算复杂度。"
            },
            {
              "title": "漏召回补强",
              "detail": "针对粗分类阶段的漏召问题，引入百科消歧词和相关规则进行重召回，在效果与召回之间取得更稳平衡，减少高质量百科页面在早期阶段被错误过滤的风险。"
            },
            {
              "title": "类别细化",
              "detail": "利用百科定义句中的句首句尾特征、关键词模式和页面语义特征，对粗分类结果进一步细分，得到可直接用于知识库关联的细粒度语义标签。"
            },
            {
              "title": "知识节点映射",
              "detail": "在细分类结果基础上，将百科义项与知识库概念节点做字符串计算、规则匹配和类别约束收缩，提升义项到知识节点映射的准确性与稳定性。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "数据生产与交付",
          "items": [
            {
              "title": "天级更新数据流",
              "detail": "基于公司内部 Airflow 建设天级更新流水线，完成百科数据定期拉取、处理、结果产出和推送，保证知识库扩充与业务侧数据使用具备较好的时效性。"
            },
            {
              "title": "业务方数据库同步",
              "detail": "推动结果向业务方数据库同步，将百科词条关联结果作为结构化知识特征稳定输出，为后续业务系统调用、特征融合和数据使用提供可靠来源。"
            },
            {
              "title": "结构化数据价值",
              "detail": "与部门其他团队及百科团队协作，将关联结果作为重要特征融合进百科结构化数据中，支撑百度百科实体卡片及其他直接或间接依赖百科词条计算的重点业务。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "我负责的重点工作",
          "items": [
            "设计六阶段端到端处理链路，并明确各阶段输入输出与收口标准。",
            "基于页面多元素做预处理规整，提升后续分类与关联策略的输入质量。",
            "设计粗分类模型、消歧词补召回和类别细化策略，逐步收缩开放词条候选空间。",
            "参与百科义项到知识库概念节点的字符串计算、规则匹配与类别约束映射。",
            "搭建 Airflow 天级更新流水线并将结果稳定同步到业务方数据库。"
          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-baike-knowledge-base-summary-1",
            "dedupeKey": "面向两千万级百科词条引入场景设计从预处理分类细化到知识节点映射和天级更新的完整链路为知识库扩充提供稳定的数据生产能力",
            "text": "面向两千万级百科词条引入场景，设计从预处理、分类细化到知识节点映射和天级更新的完整链路，为知识库扩充提供稳定的数据生产能力。"
          }
        ],
        "refined": [
          {
            "id": "project-override-baike-knowledge-base-refined-1",
            "dedupeKey": "负责整体流程设计分类与关联策略落地以及airflow天级更新数据流搭建",
            "text": "负责整体流程设计、分类与关联策略落地，以及 Airflow 天级更新数据流搭建。"
          },
          {
            "id": "project-override-baike-knowledge-base-refined-2",
            "dedupeKey": "通过多阶段候选空间收缩提升百科义项到知识节点映射的可控性可解释性和稳定性",
            "text": "通过多阶段候选空间收缩，提升百科义项到知识节点映射的可控性、可解释性和稳定性。"
          }
        ]
      }
    },
    "knowledge-graph": {
      "replaceContent": true,
      "cardMeta": [
        "百度",
        "知识增强文本理解",
        "主要 RD",
        "项目团队 4 人",
        "2020.07-2023.04"
      ],
      "cardTags": [
        "NLP",
        "知识图谱",
        "TermTree",
        "知识标注",
        "Prompt Learning",
        "序列标注",
        "Term-Linking",
        "GPU / CPU 部署"
      ],
      "heroEyebrow": "Featured Project / Knowledge Infrastructure",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "知识标注链路与评测结果展示位",
        "featuredDescription": "如果后续补图，优先展示知识底座结构、训练样本链路、评测看板和 term-linking 策略示意，能更直观体现这不是单点模型，而是一整套知识增强文本理解基础设施。",
        "sideBlocks": [
          {
            "title": "推荐素材",
            "items": [
              "TermTree 知识结构图",
              "训练样本生产与评测流程图",
              "知识标注结果样例或指标看板"
            ]
          },
          {
            "title": "展示重点",
            "description": "重点说明“知识库 + 模型 + 数据工程 + 服务部署”的完整闭环，而不是只展示某一个模型结果。"
          }
        ],
        "gallery": [
          {
            "title": "知识底座",
            "description": "TermTree、知识表示与百科词条关联"
          },
          {
            "title": "模型与数据工程",
            "description": "多任务模型、标签体系、训练集与评测集建设"
          },
          {
            "title": "服务落地",
            "description": "知识关联、服务部署与业务调用"
          }
        ],
        "note": "当前项目还没有补图，后续如果整理知识结构图和指标截图，这个页面会更完整。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目影响",
          "items": [
            {
              "value": "30+",
              "label": "支持上线项目"
            },
            {
              "value": "亿级",
              "label": "年度辐射收入"
            },
            {
              "value": "95%+",
              "label": "分类 F1"
            },
            {
              "value": "93%+",
              "label": "序列标注切分准确率"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "这个项目从词汇理解和句子理解两个层面探索中文通用知识表征与应用，目标是把中文短文本稳定映射到概念、实体、意图和主题等可计算知识结构上，形成可解释、可扩展的文本理解基础设施。",
            "负责 TermTree 知识底座建设、模型与标签体系设计、训练样本和评测体系搭建、term-linking 策略研发，以及服务部署侧工程落地，覆盖知识生产、模型训练和业务使用链路。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "知识底座建设",
          "items": [
            {
              "title": "TermTree 知识体系",
              "detail": "负责 TermTree 知识库维护与体系建设，参与设计整体层次结构和知识组织方式，主导知识数据生产流程，完成高频实体、常见概念和词类知识的筛选、清洗、映射与入库，最终沉淀出百万级知识节点。"
            },
            {
              "title": "知识表示与组织方案",
              "detail": "推动知识库从“词表堆积”演进为具备层次关系、类别约束和可计算性的知识体系，让它既能用于召回和检索，也能作为下游分类、序列标注和知识关联任务的重要先验输入。"
            },
            {
              "title": "百科词条知识引入",
              "detail": "参与把两千万级百科词条持续引入知识体系，补足实体与概念覆盖范围，使 TermTree 不只是静态词库，而是能随着知识生产链路不断扩展。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "模型与数据工程",
          "items": [
            {
              "title": "多任务知识标注模型",
              "detail": "参与短文本多任务模型结构设计，基于 prompt-learning 同时完成主题分类、意图分类和词类序列标注，并利用类别与词类之间的相关性增强概念与实体识别效果。"
            },
            {
              "title": "标签体系设计",
              "detail": "辅助设计模型标签体系，从通用知识理解视角对短文本进行多层次划分；分类侧覆盖 20+ 个大类、600+ 个小类，序列标注侧对中文词汇空间做系统划分，并细化常见复合词。"
            },
            {
              "title": "训练样本与评测体系",
              "detail": "负责从 0 到 1 构建训练集与测试集，基于搜索日志和多个垂类业务样本建立百万级训练语料，并从通用文本、特殊垂类、重点业务和典型恶劣 case 四个维度建设评测集，约束模型升级质量。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "知识应用与服务落地",
          "items": [
            {
              "title": "Term-Linking 与知识挖掘",
              "detail": "参与知识关联、知识挖掘和知识判定策略研发，在 term-linking 场景下结合模型输出与知识库结构设计两阶段关联策略，让文本到知识节点的映射更稳定、可控且更高效。"
            },
            {
              "title": "样本工程化与迭代效率",
              "detail": "抽象训练数据构建过程中的通用模块，将样本采样、规则过滤、样本清洗、标签映射和数据拼装流程工程化，提升训练样本补充和版本迭代效率。"
            },
            {
              "title": "服务部署与业务支撑",
              "detail": "负责上层服务开发及模型、策略模块在 GPU 集群和 CPU 集群上的部署，支撑内部多个业务线的大规模高频调用，并在效果、吞吐与稳定性之间做好平衡。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "我负责的重点工作",
          "items": [
            "建设 TermTree 知识底座，沉淀百万级知识节点和可计算的层次知识体系。",
            "参与短文本多任务知识标注模型设计，统一主题、意图与词类序列标注任务。",
            "设计 20+ 大类、600+ 小类标签体系，并细化中文词汇空间的序列标注标签。",
            "从 0 到 1 建设百万级训练语料、评测集与质量控制流程，降低模型迭代风险。",
            "研发 term-linking、知识挖掘和服务部署链路，支撑广告、搜索、AIGC 等方向调用。"
          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            },
            {
              "label": "相关开源项目：解语",
              "href": "/projects/jieyu-text-to-knowledge"
            },
            {
              "label": "官方介绍页",
              "href": "https://www.paddlepaddle.org.cn/textToKnowledge",
              "external": true
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-knowledge-graph-summary-1",
            "dedupeKey": "围绕短文本知识增强文本理解建设termtree知识底座多任务标注模型数据工程和服务部署链路",
            "text": "围绕短文本知识增强文本理解，建设 TermTree 知识底座、多任务标注模型、数据工程和服务部署链路。"
          }
        ],
        "refined": [
          {
            "id": "project-override-knowledge-graph-refined-1",
            "dedupeKey": "负责知识底座模型训练样本工程评测与服务落地形成完整闭环",
            "text": "负责知识底座、模型训练、样本工程、评测体系与服务落地，形成从知识生产到业务使用的完整闭环。"
          },
          {
            "id": "project-override-knowledge-graph-refined-2",
            "dedupeKey": "项目不是单点模型优化而是知识模型数据工程共同演进的基础设施",
            "text": "项目内容覆盖知识、模型和数据工程协同建设，形成可持续迭代的文本理解能力。"
          }
        ]
      }
    },
    "sceneblueprint": {
      "replaceContent": true,
      "cardMeta": [
        "GitHub 开源",
        "独立开发",
        "Unity Package",
        "2.0 版本"
      ],
      "cardTags": [
        "Unity",
        "Scene Blueprint",
        "Editor Tooling",
        "DSL",
        "Code Generation",
        "Runtime Interpreter",
        "调试快照"
      ],
      "heroEyebrow": "Open Source / Blueprint Framework",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "编辑器工作台与运行时链路展示位",
        "featuredDescription": "后续如果补图，优先放 `.sbdef` 定义、编辑器工作台、导出契约和运行时调试视图，能最快说明这不是单点节点工具，而是一套完整蓝图框架。",
        "sideBlocks": [
          {
            "title": "推荐素材",
            "items": [
              "`.sbdef` 定义示例",
              "节点图与专项工作台截图",
              "运行时快照或调试回放录屏"
            ]
          },
          {
            "title": "展示重点",
            "description": "重点展示从定义、编辑、导出到解释执行的完整分层，而不是只展示“能画图”。"
          }
        ],
        "gallery": [
          {
            "title": "定义层",
            "description": "DSL、Importer 与代码生成"
          },
          {
            "title": "制作层",
            "description": "节点图工作台、分析视图和绑定流程"
          },
          {
            "title": "运行层",
            "description": "加载、执行、快照与调试视图"
          }
        ],
        "note": "当前开源项目页已经具备稳定结构，后续只需要补充真实截图即可进一步增强说服力。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目结构",
          "items": [
            {
              "value": "2.0",
              "label": "版本定位"
            },
            {
              "value": "双子系统",
              "label": "编辑器 / 运行时"
            },
            {
              "value": "`.sbdef`",
              "label": "单一事实来源"
            },
            {
              "value": "Package",
              "label": "开源交付形态"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "SceneBlueprint 2.0 不是单纯的节点编辑器，而是一套面向 Unity 的场景级蓝图框架。它希望把蓝图的定义、制作、导出和运行时执行拆成明确边界，让蓝图资产真正成为可维护、可扩展的正式工程能力。",
            "我在这个版本中重点收敛的是结构边界：用 DSL 与代码生成统一定义来源，用工作台体系承接编辑器复杂度，用稳定导出契约衔接运行时解释执行，并补上快照、调试和知识辅助等工程能力。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "定义与制作链路",
          "items": [
            {
              "title": "`.sbdef` DSL + 代码生成",
              "detail": "以 `.sbdef` 作为单一事实来源，通过 Importer 与生成链路统一 Action、Marker、Annotation、Signal 等定义，降低手写注册、多端漂移和维护成本。"
            },
            {
              "title": "Window + Session + Services 工作台",
              "detail": "将编辑器拆分为可组合的工作台结构，统一承接图编辑、分析、预览、导出、子图、Inspector 和状态管理，避免主窗口持续膨胀。"
            },
            {
              "title": "场景语义绑定",
              "detail": "建立 Marker、Annotation、Spatial 等场景语义绑定体系，并补充绑定收集、恢复与场景快照恢复能力，提升蓝图和真实场景对象之间的接线稳定性。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "运行时与调试能力",
          "items": [
            {
              "title": "稳定导出契约",
              "detail": "将编辑器图结构统一导出为稳定契约，明确工作资产、导出数据和运行时帧状态之间的数据边界，减少 authoring 与 runtime 的相互污染。"
            },
            {
              "title": "Loader + Runner + Systems",
              "detail": "围绕控制流、信号、黑板和组合条件设计分层解释执行框架，让运行时具备清晰的加载、调度、执行与观察结构。"
            },
            {
              "title": "快照与知识辅助",
              "detail": "补充状态快照、回放、测试窗口与知识辅助能力，增强系统可观察性，并为 AI Agent 参与复杂蓝图分析与维护预留结构化入口。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "这版开源聚焦的重点",
          "items": [
            "把蓝图系统正式拆为编辑器制作子系统与运行时解释执行子系统。",
            "用 `.sbdef`、Importer 和代码生成统一定义来源，减少注册漂移。",
            "把编辑器复杂度收进 Window + Session + Services 工作台结构。",
            "建立场景语义绑定、场景快照和恢复机制，提升编辑稳定性。",
            "通过 Loader + Runner + Systems 组织运行时执行、调试与扩展。"
          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            },
            {
              "label": "GitHub 仓库",
              "href": "https://github.com/zgx197/com.zgx197.sceneblueprint",
              "external": true
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-sceneblueprint-summary-1",
            "dedupeKey": "面向unity的场景级蓝图框架通过dsl工作台导出契约和解释执行构建完整工具链",
            "text": "面向 Unity 的场景级蓝图框架，通过 DSL、编辑器工作台、导出契约和解释执行构建完整工具链。"
          }
        ],
        "refined": [
          {
            "id": "project-override-sceneblueprint-refined-1",
            "dedupeKey": "这一版重点收敛定义制作执行三层边界",
            "text": "这一版重点收敛定义层、制作层和执行层边界，让蓝图资产从工具草稿升级为可维护的正式工程能力。"
          },
          {
            "id": "project-override-sceneblueprint-refined-2",
            "dedupeKey": "除框架设计外还强化调试快照与知识辅助能力",
            "text": "除框架设计外，还补强了调试快照、回放和知识辅助能力，提升复杂蓝图系统的可观察性。"
          }
        ]
      }
    },
    "jieyu-text-to-knowledge": {
      "replaceContent": true,
      "cardMeta": [
        "PaddleNLP",
        "知识增强文本理解",
        "参与建设",
        "TermTree / 短文本知识标注"
      ],
      "cardTags": [
        "PaddleNLP",
        "TermTree",
        "知识标注",
        "Text to Knowledge",
        "知识增强",
        "Term-Linking",
        "README 驱动"
      ],
      "heroEyebrow": "Open Source / PaddleNLP",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "README 结构化解读",
        "featuredDescription": "项目结构图、TermTree 知识底座图和文本到知识链路图，用于说明 README 中三段能力结构及其关键衔接关系。",
        "sideBlocks": [
          {
            "title": "展示重点",
            "items": [
              "TermTree 中文知识底座",
              "短文本知识标注能力",
              "从文本到知识的组织链路"
            ]
          },
          {
            "title": "核心内容",
            "description": "内容聚焦 TermTree 体系建设、短文本知识标注能力，以及文本到知识的组织链路。"
          }
        ],
        "gallery": [
          {
            "title": "项目总览",
            "description": "README 三段结构与能力边界"
          },
          {
            "title": "TermTree 知识底座",
            "description": "TermType、term 与 term-linking 的承接关系"
          },
          {
            "title": "文本到知识链路",
            "description": "知识标注、模板生成与知识增强模型之间的衔接"
          }
        ],
        "note": "本组配图是基于 README 结构手工绘制的说明图，适合在缺少真实业务截图时稳定表达项目边界。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "README 规模信息",
          "items": [
            {
              "value": "3部分",
              "label": "README 主结构"
            },
            {
              "value": "160+",
              "label": "TermType"
            },
            {
              "value": "7000+",
              "label": "Subtype"
            },
            {
              "value": "100万",
              "label": "Term 规模"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "解语（Text to Knowledge）是 PaddleNLP 中面向中文文本理解的知识增强项目。README 对它的定义不是单点模型，而是“中文全词类知识库 + 中文知识标注工具集 + 中文知识挖掘方案”的组合能力。",
            "项目内容主要围绕两条主线展开：一条是 TermTree 知识库体系建设，另一条是短文本知识标注方向的模型调研、训练和评测验证。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "README 能力结构",
          "items": [
            {
              "title": "TermTree 百科知识树",
              "detail": "作为中文知识底座，承接 TermType 词类体系、term 层次组织以及 term-linking 的知识入口。README 中给出的试用版规模包括 160+ termtype、7000+ subtype 和约 100 万 term。"
            },
            {
              "title": "中文知识标注工具集",
              "detail": "围绕短文本的知识理解、知识标注和知识增强模型输入组织能力，让文本不只是被分词，而是能进一步映射到概念、实体和类别结构。"
            },
            {
              "title": "中文知识挖掘方案",
              "detail": "承接模板生成、term-linking、样本优化和文本到知识的扩展抽取链路，让知识底座与实际理解任务形成可迭代组合。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "我参与的工作",
          "items": [
            {
              "title": "TermTree 体系建设",
              "detail": "参与中文知识底座建设，围绕词类体系、概念组织和知识入库链路做结构整理与持续完善，让知识树能更稳定地承接下游知识标注与链接任务。"
            },
            {
              "title": "短文本知识标注模型调研与训练",
              "detail": "围绕短文本知识标注方向参与模型调研、训练与效果验证，关注模型输入如何更好吸收知识体系信息，以及结果如何对下游任务保持解释性。"
            },
            {
              "title": "训练数据与评测理解",
              "detail": "结合内部知识增强文本理解经验，关注数据构建、评测和任务设计如何共同支撑知识增强模型的稳定迭代，而不是只追求单点指标。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "项目要点",
          "items": [
            "解语是 README 明确定义的组合能力，不是单点模型仓库。",
            "我主要参与 TermTree 知识底座建设和短文本知识标注模型调研训练。",
            "这个开源方向与内部“短文本知识标注系统”属于同一知识增强文本理解主线。",

          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            },
            {
              "label": "GitHub 项目目录",
              "href": "https://github.com/PaddlePaddle/PaddleNLP/tree/develop/slm/examples/text_to_knowledge",
              "external": true
            },
            {
              "label": "GitHub TermTree 子目录",
              "href": "https://github.com/PaddlePaddle/PaddleNLP/tree/develop/slm/examples/text_to_knowledge/termtree",
              "external": true
            },
            {
              "label": "官方介绍页",
              "href": "https://www.paddlepaddle.org.cn/textToKnowledge",
              "external": true
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-jieyu-text-to-knowledge-summary-1",
            "dedupeKey": "参与百度知识图谱方向对外开源能力建设工作集中在termtree知识库体系建设以及短文本知识标注方向的模型调研与训练",
            "text": "参与百度知识图谱方向对外开源能力建设，工作重点集中在 TermTree 知识库体系建设以及短文本知识标注方向的模型调研与训练。"
          }
        ],
        "refined": [
          {
            "id": "project-override-jieyu-text-to-knowledge-refined-1",
            "dedupeKey": "README定义的是知识底座标注工具集和知识挖掘方案的组合能力",
            "text": "项目由知识底座、标注工具集和知识挖掘方案构成，围绕 TermTree 与短文本知识标注组织核心能力。"
          },
          {
            "id": "project-override-jieyu-text-to-knowledge-refined-2",
            "dedupeKey": "该条目强调真实参与范围而非夸大为完整项目负责人",
            "text": "项目内容围绕 TermTree 知识底座与短文本知识标注能力展开。"
          }
        ]
      }
    },
    "sceneblueprint-work": {
      "replaceContent": true,
      "cardMeta": [
        "北京畅聊天下科技有限公司",
        "Unity 编辑器平台",
        "核心建设",
        "2025.07-至今"
      ],
      "cardTags": [
        "Unity",
        "SceneBlueprint",
        "Editor Tooling",
        "DSL",
        "Runtime Interpreter",
        "场景语义绑定",
        "调试回放"
      ],
      "heroEyebrow": "Featured Project / Editor Platform",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "SceneBlueprint 公司内项目展示位",
        "featuredDescription": "现有截图覆盖编辑工作台、场景语义绑定、导出契约与运行时解释执行链路。",
        "sideBlocks": [
          {
            "title": "展示重点",
            "items": [
              "蓝图编辑工作台与专项面板",
              "场景语义绑定与快照恢复",
              "导出契约、运行时执行与调试回放"
            ]
          },
          {
            "title": "内容结构",
            "description": "内容覆盖公司内业务版本的编辑工作台、场景语义绑定、导出契约与运行时链路。"
          }
        ],
        "gallery": [
          {
            "title": "编辑工作台",
            "description": "蓝图定义、图编辑、分析与预览一体化"
          },
          {
            "title": "场景绑定",
            "description": "Marker / Annotation / Spatial 与场景对象接线"
          },
          {
            "title": "运行时链路",
            "description": "导出契约、解释执行、状态快照与调试回放"
          }
        ],
        "note": "该条目对应公司内业务版本，覆盖编辑器平台与运行时系统建设。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目结构",
          "items": [
            {
              "value": "双子系统",
              "label": "编辑器 / 运行时"
            },
            {
              "value": "DSL",
              "label": "定义入口"
            },
            {
              "value": "契约导出",
              "label": "数据边界"
            },
            {
              "value": "调试回放",
              "label": "可观察性"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "SceneBlueprint 公司内项目版定位为场景级蓝图系统，用于统一承接蓝图制作、导出契约、运行时解释执行和调试回放链路，是内容生产工具链中的核心基础设施。",
            "我在这个项目里做的不是单独一两个功能点，而是把蓝图定义、编辑工作台、场景绑定、导出契约、运行时执行和调试回放逐步收敛成完整系统边界，让它能够稳定接入真实业务生产链路。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "定义与编辑工作台",
          "items": [
            {
              "title": "DSL 与代码生成体系",
              "detail": "通过 `.sbdef`、Importer 与生成链路统一 Action、Marker、Annotation、Signal 等定义来源，降低手写注册与多端不一致问题。"
            },
            {
              "title": "Window + Session + Services",
              "detail": "将编辑器拆分为可扩展工作台结构，统一承接图编辑、分析、预览、导出、子图、Inspector 和状态管理，避免功能继续堆到单一大窗口。"
            },
            {
              "title": "结构化作者工作流",
              "detail": "围绕定义、编辑、分析、预览和导出建立清晰 authoring 流程，让蓝图不再依赖分散脚本和零散工具，而是成为正式平台能力。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "场景绑定与运行时链路",
          "items": [
            {
              "title": "场景语义绑定",
              "detail": "建立 Marker、Annotation、Spatial 等语义绑定机制，并补充绑定收集、绑定恢复和场景快照恢复能力，提升蓝图与真实场景对象接线的稳定性。"
            },
            {
              "title": "稳定导出契约",
              "detail": "将编辑器图结构统一导出为稳定契约，明确工作资产、导出数据和运行时状态之间的边界，让运行链路更容易维护和验证。"
            },
            {
              "title": "解释执行结构",
              "detail": "设计 Loader + Runner + Systems 解释执行结构，承接控制流、信号、黑板和组合条件等蓝图基础语义，使运行时具备稳定分层的执行框架。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "调试与后续扩展",
          "items": [
            {
              "title": "快照、回放与测试窗口",
              "detail": "补充状态快照、回放与测试窗口能力，让蓝图执行路径和状态演化可观察、可复盘，降低复杂系统维护成本。"
            },
            {
              "title": "知识辅助接入",
              "detail": "结合蓝图语义定义、节点关系和运行时状态，持续探索 AI Agent 与大模型在蓝图理解、上下文检索、节点语义解释和复杂流程分析中的落地方式。"
            },
            {
              "title": "业务版工程化收口",
              "detail": "公司内项目版本覆盖工具链协作、真实场景接入和后续平台化演进空间。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "我负责的重点工作",
          "items": [
            "围绕蓝图定义、编辑工作台、场景绑定、导出契约和运行时执行建立完整系统边界。",
            "设计 DSL 与代码生成体系，统一 Action、Marker、Annotation、Signal 等定义来源。",
            "将编辑器拆成 Window + Session + Services 工作台结构，治理持续膨胀的问题。",
            "建立场景语义绑定、快照恢复和调试回放能力，提升蓝图接线与运行稳定性。",
            "围绕蓝图语义和运行时状态探索 AI 辅助理解与复杂流程分析入口。"
          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            },
            {
              "label": "相关开源项目：SceneBlueprint 2.0",
              "href": "/projects/sceneblueprint"
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-sceneblueprint-work-summary-1",
            "dedupeKey": "主导公司内sceneblueprint场景蓝图系统建设打通蓝图定义可视化编辑场景语义绑定导出契约与运行时执行链路",
            "text": "主导公司内 SceneBlueprint 场景蓝图系统建设，打通蓝图定义、可视化编辑、场景语义绑定、导出契约与运行时执行链路。"
          }
        ],
        "refined": [
          {
            "id": "project-override-sceneblueprint-work-refined-1",
            "dedupeKey": "项目重点是将分散脚本和零散工具收敛为正式平台系统",
            "text": "项目重点是把原本分散脚本和零散工具收敛为正式平台系统，而不是继续堆功能点。"
          },
          {
            "id": "project-override-sceneblueprint-work-refined-2",
            "dedupeKey": "除工具链外也补足运行时解释执行和调试回放能力",
            "text": "除编辑器链路外，也同步补足运行时解释执行、快照和调试回放能力，让制作与执行两侧真正闭环。"
          }
        ]
      }
    },
    "framesync-skill-runtime": {
      "replaceContent": true,
      "cardMeta": [
        "北京畅聊天下科技有限公司",
        "战斗基础设施",
        "主导建设",
        "2025.07-至今"
      ],
      "cardTags": [
        "Unity",
        "Framesync",
        "Gameplay",
        "战斗系统",
        "状态机",
        "Damage Pipeline",
        "结构化资产"
      ],
      "heroEyebrow": "Featured Project / Combat Runtime",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "技能执行链路展示位",
        "featuredDescription": "如果后续补图，优先展示释放入口、实例状态机、子弹生命周期和伤害结算链路，这四类内容最能说明该系统的运行边界。",
        "sideBlocks": [
          {
            "title": "推荐素材",
            "items": [
              "技能释放主链路图",
              "实例状态机或能力调度示意",
              "伤害结算与表现联动流程"
            ]
          },
          {
            "title": "展示重点",
            "description": "重点不是单个技能效果，而是确定性帧同步场景下技能从输入到表现反馈的完整运行主链路。"
          }
        ],
        "gallery": [
          {
            "title": "释放控制层",
            "description": "多来源入口、条件校验和冷却治理"
          },
          {
            "title": "技能执行层",
            "description": "实例状态推进、能力调度与子弹系统"
          },
          {
            "title": "伤害与表现链路",
            "description": "DamageInfo、属性计算与 Timeline 联动"
          }
        ],
        "note": "当前还没有补图，但这类项目后续补结构图的收益会明显高于补界面截图。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目结构",
          "items": [
            {
              "value": "双层架构",
              "label": "释放 / 执行"
            },
            {
              "value": "多入口",
              "label": "输入来源统一"
            },
            {
              "value": "按帧推进",
              "label": "确定性执行"
            },
            {
              "value": "结构化资产",
              "label": "配置演进方向"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "Framesync 技能释放与执行系统面向确定性帧同步战斗场景，统一承接技能释放、实例创建、按帧能力执行、命中检测、伤害结算和表现联动流程，是战斗运行时的核心主链路之一。",
            "我在这个项目中重点解决的是系统边界和扩展问题：把释放控制和技能执行拆开，把多来源入口统一起来，把能力执行器模块化，并让伤害结算、状态推进和 Timeline 表现之间建立稳定接口。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "运行时边界设计",
          "items": [
            {
              "title": "释放控制层 / 技能执行层",
              "detail": "将运行链路拆成释放控制层和技能执行层，前者负责冷却、公 CD、同组技能、释放条件和触发校验，后者负责实例创建、状态推进和能力调度，建立清晰稳定的系统边界。"
            },
            {
              "title": "多来源释放入口统一",
              "detail": "统一玩家输入、AI、Buff、状态技、机关交互及子技能继续施放等入口，避免技能逻辑散落在多个模块中各自演化，提高战斗系统一致性。"
            },
            {
              "title": "技能实例状态机",
              "detail": "设计技能实例状态机与能力实例运行模型，支持启动、阻塞、依赖、打断、中断、取消和链式触发等复杂控制关系。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "能力执行与战斗子系统",
          "items": [
            {
              "title": "能力执行器模块化",
              "detail": "将攻击、冲锋、瞬移、子弹发射、加 Buff、信号触发及机关类能力拆成独立执行器，通过统一接口接入技能执行系统，避免主循环持续膨胀。"
            },
            {
              "title": "子弹与持续性能力",
              "detail": "完成子弹发射、弹道推进、碰撞检测、命中判定、穿透统计和销毁流程设计，同时覆盖冲锋、持续攻击等持续性能力的生命周期与频率控制。"
            },
            {
              "title": "结构化技能资产",
              "detail": "推动技能配置从分散表结构向结构化资产模型演进，使技能数据形成“基础元信息 + 逻辑能力分组 + 表现能力分组 + 查询索引”的组织方式。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "伤害结算与系统联动",
          "items": [
            {
              "title": "统一 DamageInfo 链路",
              "detail": "围绕 DamageInfo 串联属性计算、血量变化、死亡判定及客户端反馈事件，让技能逻辑层与战斗反馈层保持一致。"
            },
            {
              "title": "与 Timeline 表现联动",
              "detail": "将伤害结算链路与 Timeline 表现系统打通，在保持逻辑确定性的前提下完成视觉反馈联动。"
            },
            {
              "title": "编辑器与 AI 预留能力",
              "detail": "结构化资产模型为后续技能编辑器接入、自动化校验和 AI 辅助分析打下数据基础，而不是让运行时继续被临时配置绑死。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "我负责的重点工作",
          "items": [
            "拆分技能系统为释放控制层和技能执行层，建立清晰运行边界。",
            "统一玩家输入、AI、Buff、机关交互和子技能继续施放等多来源释放入口。",
            "设计技能实例状态机、能力执行器和子弹生命周期等核心运行模型。",
            "建立以 DamageInfo 为核心的统一伤害结算链路，并联动 Timeline 表现系统。",
            "推动技能配置向结构化资产演进，为编辑器接入和 AI 分析预留基础。"
          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            },
            {
              "label": "相关项目：Framesync 技能逻辑编辑器",
              "href": "/projects/framesync-skill-editor"
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-framesync-skill-runtime-summary-1",
            "dedupeKey": "主导设计并实现确定性帧同步战斗场景下的技能释放与执行系统提升战斗系统一致性和扩展效率",
            "text": "主导设计并实现确定性帧同步战斗场景下的技能释放与执行系统，提升战斗系统一致性和扩展效率。"
          }
        ],
        "refined": [
          {
            "id": "project-override-framesync-skill-runtime-refined-1",
            "dedupeKey": "重点是把复杂技能运行逻辑从散点规则收拢为稳定主链路",
            "text": "重点是把复杂技能运行逻辑从散点规则收拢成稳定主链路，而不是继续在零散功能点上累加补丁。"
          },
          {
            "id": "project-override-framesync-skill-runtime-refined-2",
            "dedupeKey": "该系统同时为技能编辑器自动化校验和ai辅助分析提供数据基础",
            "text": "该系统同时为后续技能编辑器、自动化校验和 AI 辅助分析提供了结构化数据基础。"
          }
        ]
      }
    },
    "framesync-skill-editor": {
      "replaceContent": true,
      "cardMeta": [
        "北京畅聊天下科技有限公司",
        "技能制作工具链",
        "主导建设",
        "2025.07-至今"
      ],
      "cardTags": [
        "Unity",
        "Framesync",
        "技能编辑器",
        "Timeline",
        "确定性沙盒",
        "Editor Tooling",
        "自动收口"
      ],
      "heroEyebrow": "Featured Project / Skill Tooling",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "Framesync 技能逻辑编辑器",
        "featuredDescription": "现有图片覆盖整体面板、轨道展开、侧边设置、资源预览和数据库面板，内容围绕技能蓝图资产、时间轴编排和确定性沙盒联调展开。",
        "sideBlocks": [
          {
            "title": "展示重点",
            "items": [
              "整体工作台与双层结构",
              "轨道编排与统一参数编辑",
              "确定性沙盒联调与资源收口"
            ]
          },
          {
            "title": "内容结构",
            "description": "图片按整体面板、轨道编排、侧边配置、资源预览、数据库和资产收口顺序组织。"
          }
        ],
        "gallery": [
          {
            "title": "工作台结构",
            "description": "整体面板、轨道区与侧边配置面板"
          },
          {
            "title": "编辑与预览",
            "description": "时间轴编排、预览场景和确定性沙盒联调"
          },
          {
            "title": "收口与兼容",
            "description": "资源预览、数据库面板和旧配置迁移"
          }
        ],
        "note": "该项目已补入真实截图，图片顺序与正文叙事保持一致。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目结构",
          "items": [
            {
              "value": "双层结构",
              "label": "蓝图资产 / 时间轴"
            },
            {
              "value": "确定性沙盒",
              "label": "运行验证"
            },
            {
              "value": "统一时间驱动",
              "label": "预览一致性"
            },
            {
              "value": "自动收口",
              "label": "资产治理"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "Framesync 技能逻辑编辑器面向确定性帧同步技能系统，承接技能蓝图配置、时间轴编排、预览验证、沙盒接入和导出收口流程，是技能内容生产闭环中的核心工具。",
            "我在这个项目里重点解决的是三类问题：如何把技能基础信息和时序表达拆出清晰结构，如何让编辑器工作流不再依赖人工步骤，以及如何让编辑结果在贴近真实运行时的环境里稳定验证。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "工作台与编辑结构",
          "items": [
            {
              "title": "技能蓝图资产 + 时间轴双层结构",
              "detail": "将技能编辑拆为“技能蓝图资产”和“时间轴可视化编排”双层结构，使基础信息、预览配置和能力调度稳定沉淀，而具体时序表达通过统一 Timeline 体系完成。"
            },
            {
              "title": "统一编排入口",
              "detail": "把技能逻辑、表现、阶段信息以及部分机关行为纳入同一编排入口，减少逻辑配置与表现时序割裂问题。"
            },
            {
              "title": "工作台机制",
              "detail": "围绕蓝图选择、进入编辑、预览场景初始化、Timeline 锁定、角色恢复和退出回写等关键流程建立稳定工作台机制，让技能编辑从依赖人工步骤转变为系统化闭环。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "预览验证与时间治理",
          "items": [
            {
              "title": "确定性沙盒接入",
              "detail": "直接接入确定性沙盒，支持播放、暂停、逐帧步进、回退、快照和角色技能释放测试，使编辑结果可在贴近真实运行环境的条件下验证。"
            },
            {
              "title": "统一权威时间驱动",
              "detail": "协调 Timeline、碰撞预览、角色预览和沙盒回放之间的时间推进与状态同步，解决多模块各自维护时间逻辑导致的预览不一致问题。"
            },
            {
              "title": "可扩展轨道体系",
              "detail": "设计可扩展技能轨道体系与统一参数编辑能力，让新能力能够通过轨道描述进入创建、导入、提取和导出流程，而不是在多个窗口重复改动。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "资产收口与兼容演进",
          "items": [
            {
              "title": "旧配置迁移",
              "detail": "打通旧配置反向导入、当前蓝图导出回写、资产索引、自动标签、增量监听和自动收口流程，为新旧资产兼容和后续迁移提供基础。"
            },
            {
              "title": "与运行时系统对齐",
              "detail": "编辑器结构、轨道参数和导出结果都围绕 Framesync 技能运行时做对齐，避免编辑器成为脱离运行时的独立玩具。"
            },
            {
              "title": "后续自动化空间",
              "detail": "双层结构、结构化资产和一致的时间推进模型，为自动校验、批量分析和 AI 辅助理解技能蓝图预留了较好的工程入口。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "我负责的重点工作",
          "items": [
            "主导技能编辑器整体架构设计，沉淀技能蓝图资产与时间轴双层结构。",
            "建立稳定工作台机制，覆盖进入编辑、预览初始化、锁定、恢复和退出回写流程。",
            "接入确定性沙盒，实现技能编辑结果的播放、步进、回退和快照验证。",
            "建立统一权威时间驱动，解决 Timeline、碰撞预览、角色预览和沙盒回放不一致问题。",
            "打通旧配置迁移、导出回写、资产索引与自动收口链路。"
          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            },
            {
              "label": "相关项目：Framesync 技能释放与执行系统",
              "href": "/projects/framesync-skill-runtime"
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-framesync-skill-editor-summary-1",
            "dedupeKey": "主导开发确定性帧同步技能系统的可视化编辑与预览平台实现技能蓝图配置与时间轴编排的系统化闭环",
            "text": "主导开发确定性帧同步技能系统的可视化编辑与预览平台，实现技能蓝图配置与时间轴编排的系统化闭环。"
          }
        ],
        "refined": [
          {
            "id": "project-override-framesync-skill-editor-refined-1",
            "dedupeKey": "重点是将技能编辑从零散配置改造成结构化工作台",
            "text": "重点是把技能编辑从零散配置堆叠，改造成有双层结构、有时间治理、有沙盒验证的正式工作台。"
          },
          {
            "id": "project-override-framesync-skill-editor-refined-2",
            "dedupeKey": "现有截图可直接支撑整体工作流展示",
            "text": "现有截图已覆盖整体工作流、轨道编排和资源收口过程。"
          }
        ]
      }
    },
    "stage-designer": {
      "replaceContent": true,
      "cardMeta": [
        "北京畅聊天下科技有限公司",
        "场景设计平台",
        "主导建设",
        "2025.07-至今"
      ],
      "cardTags": [
        "Unity",
        "StageDesigner",
        "SnapGridFlow",
        "Editor Tooling",
        "模块化关卡",
        "BuildProfile",
        "AI 辅助"
      ],
      "heroEyebrow": "Featured Project / Stage Toolchain",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "StageDesigner / SnapGridFlow 场景设计平台",
        "featuredDescription": "现有图片覆盖平台入口、Cell 编辑、模块导入、功能展示、寻路烘焙、导出同步和布局效果，内容围绕“统一平台入口 -> 手工布局工具链 -> 构建与导出”展开。",
        "sideBlocks": [
          {
            "title": "展示重点",
            "items": [
              "统一场景入口与平台框架",
              "Cell / SnapGridFlow 手工布局工具链",
              "BuildProfile、导出同步与布局构建"
            ]
          },
          {
            "title": "内容结构",
            "description": "内容按入口与基础编辑、布局模块预处理与数据生成、布局效果、同步导出和项目设置顺序组织。"
          }
        ],
        "gallery": [
          {
            "title": "平台入口与基础编辑",
            "description": "统一入口、Cell 编辑、模块编辑与模块导入"
          },
          {
            "title": "手工布局工具链",
            "description": "布局模块预处理、数据生成、设置窗口与布局效果"
          },
          {
            "title": "导出与工程协同",
            "description": "寻路烘焙、同步导出、Git 快捷操作和项目设置"
          }
        ],
        "note": "该条目已补入较完整的截图素材，正文结构与图片顺序保持一致。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目结构",
          "items": [
            {
              "value": "统一入口",
              "label": "多场景类型承接"
            },
            {
              "value": "Cell / SGF",
              "label": "核心编辑模型"
            },
            {
              "value": "BuildProfile",
              "label": "构建配置层"
            },
            {
              "value": "AI 预留",
              "label": "后续增强方向"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "StageDesigner 是一套面向多场景类型的 Unity 场景设计平台，通过统一入口承接多类场景编辑流程；其中 SnapGridFlow 手动布局工具链承担模块化关卡的手工拓扑布局、校验、模块匹配和构建调优任务。",
            "我在这个项目里重点做的是平台化收敛：让不同场景类型在一致生命周期和接线方式下运行，让手工布局、自动布局和后续构建进入统一数据模型，同时为 AI 辅助场景制作预留结构化入口。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "平台化框架",
          "items": [
            {
              "title": "统一场景身份模型",
              "detail": "建立统一场景身份模型、会话入口和模块装配机制，使不同场景类型能够在一致的生命周期与接线方式下运行，推动工具从单点关卡编辑器演进为通用场景设计平台。"
            },
            {
              "title": "模式系统与交互状态机",
              "detail": "构建模式系统、工具关系矩阵与交互状态机，治理复杂 SceneView 编辑行为、多工具切换和状态冲突问题，并打通导出、同步、命名策略与资产路由流程。"
            },
            {
              "title": "多源内容接入",
              "detail": "支持基于 Cell 的场景构建、区域可视化、多源外部数据导入、美术模板场景接线及相关工具链协同，让工具真正进入内容生产主流程。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "SnapGridFlow 手工布局工具链",
          "items": [
            {
              "title": "中间层布局数据模型",
              "detail": "将手工布局抽象为 TileShape、旋转、方向码和功能标签组成的中间层数据，让布局编辑与具体美术模块资源解耦，并建立统一方向码与拓扑建模体系。"
            },
            {
              "title": "BuildProfile 构建配置层",
              "detail": "设计 BuildProfile 构建配置层与模块匹配缓存机制，支持节点级模块替换、主题、种子、确定性随机选择和单节点增量重建，在保证自动化能力的同时支持设计师精细化调优。"
            },
            {
              "title": "统一构建主链路",
              "detail": "补充导出前连接冲突校验与模块覆盖率检查，并将手工布局正式导入既有构建主链路，使手工布局、自动布局和后续场景构建在统一数据模型下协同工作。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "工程协同与后续扩展",
          "items": [
            {
              "title": "导出、同步与资产路由",
              "detail": "围绕导出、同步、命名策略和资产路由建立稳定工程流程，让编辑器结果能够进入生产流水线，而不是停留在本地试验工具层。"
            },
            {
              "title": "工具链协同",
              "detail": "与项目中的场景搭建、模板接线、寻路烘焙等环节做结构化对接，提升设计侧与工程侧之间的协作效率。"
            },
            {
              "title": "AI 辅助预留",
              "detail": "在场景设计平台建设过程中持续探索 AI 与内容生产工具链的结合，围绕复杂场景结构理解、编辑知识辅助和工作流优化预留结构化接入点。"
            }
          ]
        },
        {
          "kind": "bullets",
          "title": "我负责的重点工作",
          "items": [
            "主导 StageDesigner 平台架构设计，统一场景身份模型、会话入口和模块装配机制。",
            "构建模式系统、工具关系矩阵与交互状态机，治理复杂编辑行为和状态冲突。",
            "把 SnapGridFlow 手工布局抽象为中间层数据模型，解耦布局编辑和美术模块资源。",
            "设计 BuildProfile 与模块匹配缓存机制，兼顾自动化构建与设计师精细调优。",
            "围绕场景结构理解、知识辅助和工作流优化预留 AI 接入能力。"
          ]
        },
        {
          "kind": "links",
          "title": "相关链接",
          "items": [
            {
              "label": "返回项目列表",
              "href": "/about"
            },
            {
              "label": "返回简历",
              "href": "/resume"
            },
            {
              "label": "相关项目：SceneBlueprint 场景蓝图系统",
              "href": "/projects/sceneblueprint-work"
            }
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-stage-designer-summary-1",
            "dedupeKey": "主导unity场景设计平台stagedesigner架构设计实现多场景类型统一生命周期与接线方式提升场景编辑效率与稳定性",
            "text": "主导 Unity 场景设计平台 StageDesigner 架构设计，实现多场景类型统一生命周期与接线方式，提升场景编辑效率与稳定性。"
          }
        ],
        "refined": [
          {
            "id": "project-override-stage-designer-refined-1",
            "dedupeKey": "平台重点是让多种场景编辑和构建流程在统一数据模型下运行",
            "text": "平台重点是让多种场景编辑和构建流程在统一数据模型下运行，而不是继续扩散成多个彼此割裂的小工具。"
          },
          {
            "id": "project-override-stage-designer-refined-2",
            "dedupeKey": "现有完整截图可以支撑平台入口布局工具链和导出流程展示",
            "text": "现有截图已覆盖平台入口、布局工具链和导出同步流程。"
          }
        ]
      }
    }
  },
  "skills": {},
  "hiddenExperienceIds": [
    "yuyue-2023-11"
  ],
  "hiddenProjectSlugs": [
    "desktop-pet",
    "tower-defense"
  ]
};











