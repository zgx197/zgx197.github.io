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
    "yuyue-2023-11": {
      "replaceContent": true,
      "replaceHighlights": true,
      "content": {
        "summary": [
          {
            "id": "experience-override-yuyue-2023-11-summary-1",
            "dedupeKey": "独立承担桌宠软件和塔防游戏改造项目重点解决遗留工程恢复与快速交付",
            "text": "独立负责虚拟桌宠与联机塔防游戏脱壳两个项目，其中塔防项目在服务端缺失与无文档前提下完成恢复、单机化和安卓化改造。"
          }
        ],
        "refined": [
          {
            "id": "experience-override-yuyue-2023-11-refined-1",
            "dedupeKey": "在北京愉悦非凡这段经历里独立推进两个方向不同的项目交付既要从零完成桌宠产品也要恢复并改造遗留塔防工程",
            "text": "在北京愉悦非凡这段经历里，我独立推进了两个方向不同的项目交付，既要从零完成桌宠产品，也要恢复并改造遗留塔防工程。"
          },
          {
            "id": "experience-override-yuyue-2023-11-refined-2",
            "dedupeKey": "虚拟桌宠项目覆盖透明窗口拖拽交互多角色配置商店和本地存档等完整链路联机塔防项目则在服务端服务丢失原开发离职且无文档的情况下先恢复关键流程再完成单机化安卓化与接入工作",
            "text": "虚拟桌宠项目覆盖透明窗口、拖拽交互、多角色配置、商店和本地存档等完整链路；联机塔防项目则在服务端服务丢失、原开发离职且无文档的情况下，先恢复关键流程，再完成单机化、安卓化与接入工作。"
          },
          {
            "id": "experience-override-yuyue-2023-11-refined-3",
            "dedupeKey": "虚拟桌宠独立制作一款支持多角色的桌宠软件作为公司新发行独立游戏的附赠产品补齐属性系统商店系统交互系统与本地数据链路",
            "text": "虚拟桌宠：独立制作一款支持多角色的桌宠软件，作为公司新发行独立游戏的附赠产品，补齐属性系统、商店系统、交互系统与本地数据链路。"
          },
          {
            "id": "experience-override-yuyue-2023-11-refined-4",
            "dedupeKey": "联机塔防游戏脱壳2023.11-2024.01在仅有遗留代码可参考的情况下恢复项目关键功能将联机对战塔防游戏改造成单机安卓版本并完成taptap登录防沉迷接入及交付准备",
            "text": "联机塔防游戏脱壳（2023.11 - 2024.01）：在仅有遗留代码可参考的情况下恢复项目关键功能，将联机对战塔防游戏改造成单机安卓版本，并完成 TapTap 登录、防沉迷接入及交付准备。"
          }
        ],
        "original": [
          {
            "id": "experience-override-yuyue-2023-11-original-1",
            "dedupeKey": "虚拟桌宠独立制作一款支持多角色的桌宠软件作为公司新发行独立游戏的附赠产品桌宠软件包含属性系统商店系统交互系统等",
            "text": "虚拟桌宠：独立制作一款支持多角色的桌宠软件，作为公司新发行独立游戏的附赠产品，桌宠软件包含属性系统、商店系统、交互系统等。"
          },
          {
            "id": "experience-override-yuyue-2023-11-original-2",
            "dedupeKey": "联机塔防游戏脱壳将一款联机对战塔防游戏改造成一款单机安卓游戏在服务端服务丢失且缺少文档的情况下恢复关键流程后进行二次开发",
            "text": "联机塔防游戏脱壳：将一款联机对战塔防游戏改造成一款单机安卓游戏，在服务端服务丢失且缺少文档的情况下恢复关键流程后进行二次开发。"
          }
        ]
      },
      "highlights": [
        {
          "id": "experience-override-yuyue-2023-11-highlight-1",
          "dedupeKey": "完成虚拟桌宠的透明窗口拖拽交互多角色配置本地存档与商店系统",
          "text": "完成虚拟桌宠的透明窗口、拖拽交互、多角色配置、本地存档与商店系统。"
        },
        {
          "id": "experience-override-yuyue-2023-11-highlight-2",
          "dedupeKey": "在服务端服务丢失人员离职且无文档的情况下恢复塔防项目关键功能并改造成单机安卓版本",
          "text": "在服务端服务丢失、人员离职且无文档的情况下恢复塔防项目关键功能，并改造成单机安卓版本。"
        },
        {
          "id": "experience-override-yuyue-2023-11-highlight-3",
          "dedupeKey": "虚拟桌宠独立制作一款支持多角色的桌宠软件补齐属性交互商店与本地数据配置链路",
          "text": "虚拟桌宠：独立制作一款支持多角色的桌宠软件，补齐属性、交互、商店与本地数据配置链路。"
        },
        {
          "id": "experience-override-yuyue-2023-11-highlight-4",
          "dedupeKey": "联机塔防游戏脱壳2023.11-2024.01梳理遗留工程架构与场景流程完成登录战斗等级奖励ui适配taptap接入与安卓打包测试",
          "text": "联机塔防游戏脱壳（2023.11 - 2024.01）：梳理遗留工程架构与场景流程，完成登录、战斗、等级奖励、UI 适配、TapTap 接入与安卓打包测试。"
        }
      ]
    },
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
    "desktop-pet": {
      "storySections": [
        {
          "kind": "story",
          "title": "项目背景",
          "paragraphs": [
            "项目定位不是单纯的小工具，而是配合公司新发行独立游戏一同交付的桌面 companion，用来延长产品触达时间并增强角色陪伴感。",
            "因此实现重点既包括桌面层面的透明窗口与拖拽体验，也包括多角色、属性成长、商店和本地配置等可持续扩展能力。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "核心实现",
          "items": [
            {
              "title": "透明窗口方案",
              "detail": "通过 Win32 API 获取 Unity 窗口句柄，结合窗口参数调整与摄像机设置，隐藏窗口背景并保留角色可见区域。"
            },
            {
              "title": "拖拽与屏幕约束",
              "detail": "监听鼠标拖拽行为并处理越界情况，让桌宠拖动过程更自然，同时保证窗口不会丢失到屏幕可视区域之外。"
            },
            {
              "title": "多角色与本地配置",
              "detail": "搭建支持多角色的资源和参数组织方式，使角色切换、后续扩展和运营内容补充不需要重做底层逻辑。"
            },
            {
              "title": "属性、交互与商店",
              "detail": "补齐桌宠的属性系统、交互反馈、商品购买与本地存档，让应用从演示原型变成可持续迭代的桌面产品。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "工程方式",
          "items": [
            {
              "title": "配置数据组织",
              "detail": "使用 Excel、JSON 与 Luban 组织配置，降低后续补角色、调参数和扩玩法时的维护成本。"
            },
            {
              "title": "独立推进交付",
              "detail": "项目由我独立实现，既要完成程序逻辑，也要兼顾产品交互体验和后续可扩展性。"
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
                "独立制作一款支持多角色的桌宠软件作为公司新发行独立游戏的附赠产品，桌宠软件包含属性系统、商店系统、交互系统等。"
              ],
              "groups": []
            },
            {
              "title": "主要工作",
              "groups": [
                {
                  "paragraphs": [
                    "限定在屏幕窗口内，防止桌宠被拖拽到屏幕外。"
                  ],
                  "items": [
                    "透明窗口：使用 Win32 API 获取当前窗口句柄，通过重设窗口参数和调整 Unity 摄像机设置达到隐藏 Unity 窗口背景的效果。",
                    "拖拽逻辑：监控当前鼠标拖拽行为，当鼠标拖拽桌宠窗口时判断是否超出当前屏幕边界，当拖拽出边界时重设窗口位置，使其限定在屏幕窗口内，防止桌宠被拖拽到屏幕外。",
                    "数据读取 / 存储：支持本地数据存档，分别对多角色数据进行存档和读取，当玩家切换角色时存档也会随之切换。",
                    "商店系统：制作商店页面 UI，支持通过商品名称搜索商品，还可以根据不同商品类型、价格、属性对所有商品进行排序。使用 Luban 插件转化配置表，将 Excel 表格转化为程序可读的 Json 文件，方便后续修改商店数据。",
                    "交互逻辑：桌宠设置有游玩、学习、工作三种模式，当进入不同模式时会通过 FSM 播放帧动画并统计当前状态持续，根据不同的金币、经验、口渴、好感度变化公式实时统计当前角色属性变化，当状态结束或者改变时将统计的结果统一累计到角色属性中，并通知相关事件修改软件中的各类 UI。",
                    "多角色：支持多角色设置，方便后续扩展角色，目前将角色数据、依赖资源抽象成一份配置表，在游戏开始时通过 Luban 读取数据表中的数据初始化角色控制类，后续方便扩展和接入 Steam 创意工坊。"
                  ]
                }
              ],
              "paragraphs": []
            },
            {
              "title": "技术档案",
              "groups": [
                {
                  "title": "工程方式",
                  "items": [
                    "配置数据组织：使用 Excel、JSON 与 Luban 组织配置，降低后续补角色、调参数和扩玩法时的维护成本。",
                    "独立推进交付：项目由我独立实现，既要完成程序逻辑，也要兼顾产品交互体验和后续可扩展性。"
                  ]
                },
                {
                  "title": "项目角色",
                  "paragraphs": [
                    "核心开发"
                  ]
                },
                {
                  "title": "项目时间",
                  "paragraphs": [
                    "2023/11-2024/1"
                  ]
                }
              ],
              "paragraphs": []
            }
          ]
        },
        {
          "kind": "stack",
          "title": "技术栈",
          "items": [
            "Unity",
            "C#",
            "Win32 API",
            "Luban",
            "Excel",
            "JSON",
            "本地存档"
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
      ]
    },
    "tower-defense": {
      "replaceContent": true,
      "title": "联机塔防游戏脱壳",
      "cardMeta": [
        "北京愉悦非凡科技有限公司",
        "U3D（独立开发）",
        "2023.11 - 2024.01"
      ],
      "cardTags": [
        "Unity",
        "Android",
        "TapTap",
        "遗留工程恢复",
        "单机化改造",
        "脱壳"
      ],
      "heroEyebrow": "Featured Project / Recovery & Porting",
      "showcase": {
        "featuredTitle": "遗留工程恢复与单机化改造",
        "featuredDescription": "这个项目适合展示从梳理遗留工程、恢复关键流程，到完成单机安卓化与接入测试的完整闭环。",
        "note": "如果后续补素材，建议优先放登录、主界面、战斗和安卓真机测试的完整流程录屏。"
      },
      "content": {
        "summary": [
          {
            "id": "project-override-tower-defense-summary-1",
            "dedupeKey": "在服务端服务丢失原开发离职且缺少文档的前提下基于遗留代码恢复关键流程并将联机塔防项目改造成可交付的单机安卓版本",
            "text": "在服务端服务丢失、原开发离职且缺少文档的前提下，基于遗留代码恢复关键流程，并将联机塔防项目改造成可交付的单机安卓版本。"
          }
        ],
        "refined": [
          {
            "id": "project-override-tower-defense-refined-1",
            "dedupeKey": "项目的核心难点不在新增玩法而在于先读懂遗留工程并恢复可运行状态再完成单机化安卓化与接入改造",
            "text": "项目的核心难点不在新增玩法，而在于先读懂遗留工程并恢复可运行状态，再完成单机化、安卓化与接入改造。"
          }
        ],
        "original": [
          {
            "id": "project-override-tower-defense-original-1",
            "dedupeKey": "将一款联机对战塔防游戏改造成一款单机安卓游戏恢复关键功能后接入taptap登录和防沉迷系统并继续补齐后续功能",
            "text": "将一款联机对战塔防游戏改造成一款单机安卓游戏，恢复关键功能后接入 TapTap 登录和防沉迷系统，并继续补齐后续功能。"
          }
        ]
      },
      "storySections": [
        {
          "kind": "story",
          "title": "项目背景",
          "paragraphs": [
            "项目目标是将一款联机对战塔防游戏改造成单机安卓游戏，并在恢复关键功能后继续进行二次开发。",
            "项目难点在于服务端服务丢失、服务端开发人员离职且未留下文档，需要在仅有代码的情况下恢复项目功能，再完成脱壳和交付准备。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "主要工作",
          "items": [
            {
              "title": "游戏架构",
              "detail": "根据工程代码分析客户端与服务端分工，梳理角色数据、战斗数值和 buff 数据的归属关系，并尝试通过补全数据库恢复服务端能力。"
            },
            {
              "title": "场景跳转关系",
              "detail": "通过分析 Build Settings 中各场景顺序及关键脚本，梳理登录、主界面、教程和战斗之间的流程依赖。"
            },
            {
              "title": "登录场景",
              "detail": "重构登录代码，解除登录模块与原服务器的通信依赖，改为使用本地数据初始化单机版启动流程。"
            },
            {
              "title": "等级奖励",
              "detail": "新增等级奖励系统，让玩家在教程结束后能通过战斗次数获得经验、英雄和金币解锁反馈。"
            },
            {
              "title": "战斗逻辑",
              "detail": "优化战斗逻辑与 BattleManager 资源回收，修复重开残留、教程同步异常等问题，逐步调通整套战斗流程。"
            },
            {
              "title": "UI",
              "detail": "调整 UI 锚点、中心点和部分背景资源，适配常见手机屏幕比例，并梳理敏感图标和词汇，为版号申请做准备。"
            },
            {
              "title": "接入 TapTap",
              "detail": "在 Unity 中接入 TapTap SDK，完成登录功能初始化，并在程序启动和结束时上报游戏时长。"
            },
            {
              "title": "打包和测试",
              "detail": "设置包名、图标和安卓签名，将游戏锁定为横屏显示，并通过真机和 Unity Remote 进行基本功能验证。"
            }
          ]
        },
        {
          "kind": "archive",
          "title": "项目档案",
          "description": "按简历原始信息归档项目背景、难点和主要工作。",
          "sections": [
            {
              "title": "项目介绍",
              "paragraphs": [
                "将一款联机对战塔防游戏改造成一款单机安卓游戏，在恢复关键功能后接入 TapTap 登录和防沉迷系统，并继续进行二次开发。"
              ],
              "groups": []
            },
            {
              "title": "项目难点",
              "paragraphs": [
                "因为服务端服务丢失、服务端开发人员突然离职且未留下文档，游戏无法正常运行，需要在仅有代码的情况下恢复项目功能后再进行脱壳开发。"
              ],
              "groups": []
            },
            {
              "title": "主要工作",
              "groups": [
                {
                  "items": [
                    "游戏架构：根据工程代码分析游戏架构，梳理客户端与服务端的数据边界，并尝试通过补全数据库重启服务端以验证关键流程。",
                    "场景跳转关系：通过分析 Build Settings 中各个场景的顺序并进入关键脚本，梳理场景跳转关系。",
                    "登录场景：重构游戏登录代码，解除登录模块与服务器之间相互通信的逻辑，改成使用本地数据作为初始化数据启动登录场景。",
                    "等级奖励：添加等级奖励系统，玩家完成教程后可通过战斗获得经验值，逐步解锁不同英雄和金币。",
                    "战斗逻辑：优化战斗逻辑代码，补全 BattleManager 资源回收逻辑，修复教程进度同步异常和其他战斗相关问题。",
                    "UI：调整 UI 物体的锚点、中心点和部分背景图片，使其适应常见手机屏幕比例；梳理 UI 资源，调整敏感图标和词汇，为版号申请做准备。",
                    "接入 TapTap：在开发者中心完成配置后，于 Unity 中接入 SDK，使用应用中心获取的 token 初始化 SDK，并添加 TapTap 登录功能与游戏时长上报。",
                    "打包和测试：设置包名称、图标，添加安卓打包签名，将游戏锁定为横屏显示；使用真机和 Unity Remote 简单测试游戏功能。"
                  ],
                  "paragraphs": []
                }
              ],
              "paragraphs": []
            },
            {
              "title": "技术档案",
              "groups": [
                {
                  "title": "项目角色",
                  "paragraphs": [
                    "U3D（独立开发）"
                  ]
                },
                {
                  "title": "项目时间",
                  "paragraphs": [
                    "2023/11-2024/1"
                  ]
                }
              ],
              "paragraphs": []
            }
          ]
        },
        {
          "kind": "stack",
          "title": "技术栈",
          "items": [
            "Unity",
            "C#",
            "Android",
            "TapTap",
            "遗留工程恢复",
            "UI 适配"
          ]
        }
      ]
    },
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
              "detail": "参与把两千万级百科词条持续引入知识体系，补足实体与概念覆盖范围，持续扩展 TermTree 的知识底座。"
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
              "label": "项目官网",
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
        "开源框架",
        "独立开发",
        "Tauri / React / Rust",
        "外部编辑器方向"
      ],
      "cardTags": [
        "SceneBlueprint",
        "External Editor",
        "Tauri 2",
        "TypeScript",
        "Rust",
        "C#",
        "Runtime Contract",
        "Engine Integration"
      ],
      "heroEyebrow": "Open Source / SceneBlueprint 2.0",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "外部编辑器 / 契约链路展示位",
        "featuredDescription": "建议优先补充工作台界面、节点图编辑、导出契约和引擎接入效果截图，用于说明外部编辑器主入口与跨引擎工具链结构。",
        "sideBlocks": [
          {
            "title": "推荐素材",
            "items": [
              "工作台主界面截图",
              "节点图编辑区域截图",
              "Schema / 导出契约示意图",
              "Unity 或 Godot 集成截图"
            ]
          }
        ],
        "gallery": [
          {
            "title": "SceneBlueprint 编辑器工作台",
            "description": "用于说明外部编辑器主界面、工作区组织和图形化 Authoring 入口。"
          },
          {
            "title": "DSL 与节点定义",
            "description": "用于说明 `.sbdef`、代码生成与节点契约之间的衔接关系。"
          },
          {
            "title": "运行时执行与调试",
            "description": "用于说明导出契约、运行时加载、调试快照与观察链路。"
          }
        ],
        "note": "当前先以结构化示意图占位，补充真实截图或录屏封面后可直接替换。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目状态",
          "items": [
            {
              "value": "External Editor",
              "label": "当前入口形态"
            },
            {
              "value": "Tauri 2",
              "label": "桌面宿主"
            },
            {
              "value": "3",
              "label": "核心分层"
            },
            {
              "value": "Apache-2.0",
              "label": "开源协议"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "SceneBlueprint 2.0 面向游戏开发中的场景蓝图制作链路，围绕 Authoring、导出契约和引擎侧消费组织可跨引擎复用的内容工具链。",
            "项目建立在早期 com.zgx197.sceneblueprint 与 com.zgx197.nodegraph 的实践基础上，当前转向外部编辑器优先架构，由独立桌面工作台承接图形化编辑、校验、分析、调试与导出，再由引擎集成层承接资源同步与项目适配。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "项目定位",
          "items": [
            {
              "title": "外部编辑器主入口",
              "detail": "把场景蓝图制作流程从引擎内嵌工具窗口中抽离出来，由外部桌面编辑器承担 Authoring、分析、调试与导出主链路。"
            },
            {
              "title": "契约边界",
              "detail": "通过 Export / Contract 作为中间边界，把编辑器工作资产与引擎侧消费结构明确区分，降低制作层和运行时层耦合。"
            },
            {
              "title": "跨引擎接入",
              "detail": "预留 Unity、Godot 及其他引擎的接入空间，让同一份蓝图导出结果能够被不同宿主稳定消费。"
            },
            {
              "title": "工具链平台化",
              "detail": "项目关注的不只是图编辑本身，还包括工作台、导出链路、发布资产、文档体系和后续工具治理，目标是形成可持续演进的平台型内容工具。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "当前状态",
          "items": [
            {
              "title": "前端工作台",
              "detail": "TypeScript + React 负责工作台界面、图编辑交互和状态组织，承担内容制作主入口。"
            },
            {
              "title": "桌面宿主与分发",
              "detail": "Tauri 2 + Rust 负责桌面窗口、系统集成和发布产物组织，当前已经明确 setup、msi、portable 等 Windows 分发路径。"
            },
            {
              "title": "契约层",
              "detail": "Schema 与导出契约层作为编辑器和运行时之间的正式边界，负责承接蓝图导出结果的稳定消费格式。"
            },
            {
              "title": "引擎集成层",
              "detail": "C# 工具链与 integrations 目录用于承接 Unity、Godot 等引擎侧导入、资源同步、运行时接线和项目适配。"
            },
            {
              "title": "文档与发布治理",
              "detail": "项目同时维护对外文档、开发文档和 Releases 资产说明，使工程设计、使用入口和交付方式保持同步。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "技术架构",
          "items": [
            {
              "title": "前端工作台",
              "detail": "TypeScript + React 负责工作台界面、图编辑交互、状态组织和前端壳层，是内容制作主入口。"
            },
            {
              "title": "桌面宿主",
              "detail": "Rust + Tauri 负责桌面宿主、窗口能力、系统集成和安装包分发，承担工具独立运行的基础设施职责。"
            },
            {
              "title": "契约层",
              "detail": "Schema 与导出边界负责把蓝图制作结果沉淀为可被不同引擎消费的正式契约，避免宿主各自解释同一份资产。"
            },
            {
              "title": "引擎集成层",
              "detail": "C# 工具链负责承接 Unity / Godot 等引擎中的导入、同步、预览桥接、运行时接线和项目级适配。"
            }
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
              "href": "https://github.com/zgx197/SceneBlueprint",
              "external": true
            },
            {
              "label": "项目网站",
              "href": "https://zgx197.github.io/SceneBlueprint/",
              "external": true
            },
            {
              "label": "GitHub Releases",
              "href": "https://github.com/zgx197/SceneBlueprint/releases",
              "external": true
            },
            {
              "label": "早期 Unity 实践仓库",
              "href": "https://github.com/zgx197/com.zgx197.sceneblueprint",
              "external": true
            },
            {
              "label": "NodeGraph 基础仓库",
              "href": "https://github.com/zgx197/com.zgx197.nodegraph",
              "external": true
            }
          ]
        },
        {
          "kind": "stack",
          "title": "技术标签",
          "items": [
            "SceneBlueprint",
            "Tauri 2",
            "TypeScript",
            "React",
            "Rust",
            "C#",
            "Runtime Contract",
            "Engine Integration",
            "External Editor"
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-sceneblueprint-summary-1",
            "dedupeKey": "sceneblueprint2是面向游戏开发的引擎无关外部场景蓝图编辑器围绕authoringsource运行时契约和引擎集成组织完整工具链",
            "text": "SceneBlueprint 2.0 是面向游戏开发的引擎无关外部场景蓝图编辑器，围绕 Authoring Source、Runtime Contract 和 Engine Integration 组织完整工具链。"
          }
        ],
        "refined": [
          {
            "id": "project-override-sceneblueprint-refined-1",
            "dedupeKey": "项目从unity内嵌工具演进为外部编辑器优先的内容制作工具链持续验证authoringruntimecontract与引擎集成的清晰边界",
            "text": "项目从 Unity 内嵌工具演进为外部编辑器优先的内容制作工具链，持续验证 Authoring、运行时契约与引擎集成之间的边界划分。"
          },
          {
            "id": "project-override-sceneblueprint-refined-2",
            "dedupeKey": "当前以tauri加react加rust桌面宿主为主入口并保留csharp工具链接入unitygodot等引擎侧承接能力",
            "text": "当前以 Tauri + React + Rust 桌面宿主为主入口，并保留 C# 工具链承接 Unity、Godot 等引擎侧接入能力。"
          }
        ]
      }
    },
    "jieyu-text-to-knowledge": {
      "replaceContent": true,
      "cardMeta": [
        "开源项目",
        "PaddleNLP 方向",
        "TermTree / 知识标注",
        "参与建设"
      ],
      "cardTags": [
        "PaddleNLP",
        "NLP",
        "知识增强",
        "TermTree",
        "知识标注",
        "模型训练",
        "数据工程",
        "Term-Linking"
      ],
      "heroEyebrow": "Open Source / Text to Knowledge",
      "showcase": {
        "title": "作品展示",
        "featuredTitle": "知识底座 / 标注链路展示位",
        "featuredDescription": "建议优先补充 TermTree 层次结构、知识标注效果、训练评测流程和文本到知识映射图，用于说明知识底座与模型链路的协同关系。",
        "sideBlocks": [
          {
            "title": "推荐素材",
            "items": [
              "TermTree 层次结构图",
              "短文本知识标注效果图",
              "文本到知识映射流程图",
              "训练与评测链路示意图"
            ]
          }
        ],
        "gallery": [
          {
            "title": "解语项目总览",
            "description": "用于说明 TermTree、知识标注工具集与知识挖掘方案之间的关系。"
          },
          {
            "title": "TermTree 知识底座",
            "description": "用于说明 TermType、cb / eb、term 组织和 term-linking 的知识底座定位。"
          },
          {
            "title": "文本到知识链路",
            "description": "用于说明知识标注、模板生成、term-linking 与知识增强模型之间的衔接。"
          }
        ],
        "note": "当前先以结构化示意图占位，补充真实效果图后可直接替换。"
      },
      "storySections": [
        {
          "kind": "metrics",
          "title": "项目状态",
          "items": [
            {
              "value": "160+",
              "label": "TermType"
            },
            {
              "value": "7000+",
              "label": "Subtype"
            },
            {
              "value": "100 万+",
              "label": "Term 规模"
            },
            {
              "value": "PaddleNLP",
              "label": "开源落点"
            }
          ]
        },
        {
          "kind": "story",
          "title": "项目概览",
          "paragraphs": [
            "解语（Text to Knowledge）面向中文文本理解中的知识增强问题，围绕中文全词类知识体系、知识标注工具集和知识挖掘方案组织文本到知识链路。",
            "项目对外公开的能力结构包括 TermTree 百科知识树、中文知识标注工具集和中文知识挖掘方案；我的工作集中在 TermTree 知识底座建设，以及短文本知识标注方向的模型调研、训练、评测与数据流程搭建。"
          ]
        },
        {
          "kind": "capabilities",
          "title": "项目定位",
          "items": [
            {
              "title": "知识底座",
              "detail": "用 TermTree 承接中文词类、概念与实体的层次组织，为文本分类、序列标注、知识关联和模板生成提供统一先验输入。"
            },
            {
              "title": "知识增强解析",
              "detail": "通过知识标注把文本从字符串层推进到词类、概念和实体层面的可计算表示，支撑更稳定的中文理解和特征构建。"
            },
            {
              "title": "文本到知识链路",
              "detail": "在知识标注结果之上继续衔接模板生成、知识抽取、schema 化映射和 term-linking，形成从文本理解到结构化知识产出的扩展路径。"
            },
            {
              "title": "数据与评测治理",
              "detail": "项目同时覆盖训练语料、标签体系、测试集组织与评测机制，保证模型升级过程可验证、可解释。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "当前状态",
          "items": [
            {
              "title": "TermTree 知识体系",
              "detail": "开源结构中已经形成 TermType、Subtype 与 Term 的层次化知识组织，README 中给出 160+ termtype、7000+ subtype 和约 100 万 term 的试用版规模。"
            },
            {
              "title": "知识标注工具集",
              "detail": "项目提供词类知识标注、名词短语标注与中文预训练模型等能力，用于把中文句子转化为更稳定的知识特征与标注结果。"
            },
            {
              "title": "知识挖掘方案",
              "detail": "在知识标注之后继续衔接模板生成、知识抽取和结构化映射，使文本理解结果可以进一步服务下游知识生产和应用场景。"
            },
            {
              "title": "参与范围",
              "detail": "我的工作集中在 TermTree 体系建设与短文本知识标注方向，覆盖知识底座、训练数据、模型验证和评测流程相关工作。"
            },
            {
              "title": "训练与评测链路",
              "detail": "围绕主题分类、意图分类和词类序列标注，持续建设训练数据、测试集和多测试集联合评测流程，提升模型迭代质量的稳定性。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "技术架构",
          "items": [
            {
              "title": "知识底座层",
              "detail": "TermTree 负责中文词类、概念和实体的层次组织，以及 term-linking 所需的统一知识入口。"
            },
            {
              "title": "标注与模型层",
              "detail": "围绕短文本主题分类、意图分类和词类序列标注组织知识增强模型输入、训练流程与推理能力。"
            },
            {
              "title": "知识挖掘与应用层",
              "detail": "在标注结果之上继续衔接模板生成、知识抽取、结构化映射和下游应用接入，形成文本到知识的扩展链路。"
            },
            {
              "title": "数据与评测层",
              "detail": "通过样本生产、标签映射、测试集设计和多测试集联合评估，约束模型升级质量并支撑持续迭代。"
            }
          ]
        },
        {
          "kind": "capabilities",
          "title": "我的贡献",
          "items": [
            {
              "title": "TermTree 体系建设",
              "detail": "参与设计 TermTree 层次结构与知识组织方式，推动知识库从词表堆积演进为具备层次关系、类别约束和可计算性的知识体系。"
            },
            {
              "title": "知识数据生产",
              "detail": "主导高频实体、常见概念和词类知识的筛选、清洗、映射与入库流程，支撑百万级知识节点沉淀和后续知识增强特征生产。"
            },
            {
              "title": "短文本知识标注模型训练",
              "detail": "参与短文本多任务模型结构设计，围绕主题分类、意图分类和词类序列标注开展模型调研、训练与效果验证。"
            },
            {
              "title": "训练数据与评测体系",
              "detail": "从 0 到 1 构建训练集与测试集，设计样本生产、标签映射、评测集组织和多测试集联合评估流程，提升模型迭代稳定性与可解释性。"
            }
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
              "label": "GitHub TermTreeC 子目录",
              "href": "https://github.com/PaddlePaddle/PaddleNLP/tree/develop/slm/examples/text_to_knowledge/termtreec",
              "external": true
            },
            {
              "label": "项目官网",
              "href": "https://www.paddlepaddle.org.cn/textToKnowledge",
              "external": true
            }
          ]
        },
        {
          "kind": "stack",
          "title": "技术标签",
          "items": [
            "PaddleNLP",
            "Python",
            "NLP",
            "知识增强",
            "TermTree",
            "知识标注",
            "Term-Linking",
            "模型训练",
            "数据工程"
          ]
        }
      ],
      "content": {
        "summary": [
          {
            "id": "project-override-jieyu-text-to-knowledge-summary-1",
            "dedupeKey": "解语是面向中文文本理解的知识增强项目由termtree知识底座知识标注工具集和知识挖掘方案组成我主要参与termtree体系建设与短文本知识标注模型训练",
            "text": "解语是面向中文文本理解的知识增强项目，由 TermTree 知识底座、知识标注工具集和知识挖掘方案组成；我的工作集中在 TermTree 体系建设与短文本知识标注训练。"
          }
        ],
        "refined": [
          {
            "id": "project-override-jieyu-text-to-knowledge-refined-1",
            "dedupeKey": "项目围绕中文全词类知识体系与知识增强解析链路组织文本到知识的映射能力",
            "text": "项目围绕中文全词类知识体系与知识增强解析链路，组织从文本到知识的可计算映射能力。"
          },
          {
            "id": "project-override-jieyu-text-to-knowledge-refined-2",
            "dedupeKey": "我的工作重心集中在termtree知识库体系建设以及短文本知识标注方向的模型调研训练评测和数据流程建设",
            "text": "我的工作集中在 TermTree 知识库体系建设，以及短文本知识标注方向的模型调研、训练、评测和数据流程建设。"
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
            "我在这个项目里持续收敛蓝图定义、编辑工作台、场景绑定、导出契约、运行时执行和调试回放等系统边界，推动其稳定接入真实业务生产链路。"
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
              "detail": "围绕定义、编辑、分析、预览和导出建立清晰 authoring 流程，统一蓝图制作相关脚本、工具和平台能力。"
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
            "text": "统一蓝图定义、编辑工作台、场景语义绑定、导出契约与运行时执行链路，形成可接入业务生产的场景蓝图系统。"
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
              "detail": "结构化资产模型为后续技能编辑器接入、自动化校验和 AI 辅助分析提供数据基础，并降低运行时对临时配置的依赖。"
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
            "text": "统一确定性帧同步战斗场景下的技能输入、状态推进、能力调度、伤害结算与表现反馈链路。"
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
            "我在这个项目里重点解决三类问题：拆分技能基础信息与时序表达结构，建立稳定的编辑器工作流，以及在贴近真实运行时的环境里完成编辑结果验证。"
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
              "detail": "设计可扩展技能轨道体系与统一参数编辑能力，让新能力通过轨道描述进入创建、导入、提取和导出流程，并在统一编辑入口下完成配置维护。"
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
            "text": "构建具备双层结构、时间治理与沙盒验证能力的技能编辑工作台，支撑技能蓝图配置与时间轴编排。"
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
              "detail": "围绕导出、同步、命名策略和资产路由建立稳定工程流程，推动编辑器结果进入生产流水线。"
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
            "text": "统一多种场景编辑、布局构建和导出同步流程，支撑多场景类型在同一数据模型下运行。"
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
  "hiddenExperienceIds": [],
  "hiddenProjectSlugs": []
};













