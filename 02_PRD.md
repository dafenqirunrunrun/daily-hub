# PRD — Daily Hub

Version: MVP 1.0  
Date: 2026-08-28

## 1. Product Summary

Daily Hub 是一个纯本地、local-first 的个人每日学习工作台。

它让用户每天在一个轻量桌面应用中：

- 看到今天做什么
- 知道完成多少
- 捕获突然出现的想法
- 结束一天时留下可恢复的上下文
- 查看和编辑历史日期记录

## 2. Problem

当前工作流的问题不是“没有 Todo 工具”。

真正的问题是：

1. 学习任务存在于多个地方。
2. 一天开始时容易忘记当天优先级。
3. 学习过程中的小想法常散落在聊天、文本和临时窗口里。
4. 第二天重新进入任务时，需要重新回忆昨天做到哪里。
5. 打开完整的 Notion / Todo 软件增加切换成本。

## 3. Product Thesis

最好的个人学习计划工具，不一定功能最全，而应该记录成本接近零，并且默认本地可用。

## 4. Target User

MVP 用户是高频进行学习与开发的个人用户。

典型行为：

- 每天推进多个学习 / 开发主题
- 需要简单任务清单
- 会产生临时想法
- 不想维护复杂项目管理系统

## 5. Jobs To Be Done

### JTBD-1

当我早上开始工作时，我希望马上看到今天最重要的学习任务，这样不用重新想“今天该干什么”。

### JTBD-2

当我完成一项学习任务时，我希望马上勾掉它并看到进度变化，这样我知道今天实际推进了多少。

### JTBD-3

当我学习过程中突然想到一个点时，我希望几秒内记下来，这样不会因为切换软件而打断当前工作。

### JTBD-4

当我结束一天时，我希望留下“完成 / 卡点 / 明日第一步”，这样第二天能直接继续。

## 6. Product Principles

### P1. Local First

学习记录不依赖网络，不上传，不需要账号。

### P2. Capture > Organize

先保证能快速记，暂时不追求复杂分类。

### P3. Derived State

能自动计算的数据不要求用户重复填写。

### P4. Quiet UI

它应该存在，但不能抢走主要注意力。

### P5. Small Surface

MVP 只覆盖每日学习记录的最短闭环。

## 7. MVP Feature Set

### P0 — 必须有

| 功能 | 优先级 |
|---|---|
| 学习记录区 | P0 |
| 今日计划 | P0 |
| Task 完成状态 | P0 |
| 自动学习完成度 | P0 |
| 随手想法 Quick Add | P0 |
| 今日三问复盘 | P0 |
| SQLite 持久化 | P0 |
| 历史日期查看 | P0 |
| 折叠学习记录区域 | P0 |

### P1 — MVP 后

| 功能 |
|---|
| 本周目标 |
| 复制昨日未完成任务 |
| Task 标签 |
| Markdown 导出 |
| 周复盘 |
| 简单学习时长 |
| 搜索想法 |

### P2 — 暂不开发

| 功能 |
|---|
| AI 自动生成今日计划 |
| 自动分析聊天 |
| AI 周报 |
| 日历 |
| Pomodoro |
| 云同步 |
| 手机 App |
| 游戏化 |
| 多用户 |
| 团队协作 |
| 知识图谱 |

## 8. User Experience

### 8.1 Sidebar State

学习记录默认展开。

```text
Daily Hub

学习记录                   ˄
今日计划                 2 / 4
学习进度                 50%
随手想法                   +
今日复盘                 未填写
```

用户可以折叠：

```text
Daily Hub

学习记录                   ˅
```

折叠状态本地记忆。

## 9. Core Flow 1 — Morning Planning

```text
打开 App
↓
看到今日计划为空
↓
输入 3–5 个任务
↓
开始当天学习
```

首次规划 5 个任务应 ≤ 60 秒。

## 10. Core Flow 2 — Complete Task

```text
进入今日计划
↓
勾选 Task
↓
本地立即保存
↓
侧栏 2/4 → 3/4
↓
Progress 50% → 75%
```

UI 不等待网络请求。

## 11. Core Flow 3 — Capture Idea

```text
看到「随手想法 +」
↓
点击 +
↓
输入一句
↓
Enter
↓
继续当前工作
```

目标操作时间：≤ 10 秒。

## 12. Core Flow 4 — End-of-Day Review

```text
点击「今日复盘」
↓
填写：
完成了什么
卡在哪里
明天第一件事
↓
自动保存
↓
侧栏状态变成「已填写」
```

目标：2–5 分钟内结束。

## 13. Information Architecture

```text
Application
├── Daily Hub Sidebar
│   ├── Today Plan
│   ├── Progress
│   ├── Ideas
│   └── Daily Review
└── Workspace
    ├── Today Plan View
    ├── Ideas View
    └── Daily Review View
```

## 14. Visual Direction

设计方向：**Quiet Desktop Productivity App**

Characteristics:

- 暗色
- 平面
- 高信息密度
- 弱边框
- 无视觉噪声
- 文字优先
- 微小图标
- 极少 Accent

Avoid:

- 大面积 Card
- Gradient
- Glow
- 彩色统计图
- Hero
- Banner
- 多层嵌套 Panel

## 15. Component Map

```text
AppShell
├── Sidebar
│   └── DailyHubSection
│       ├── SectionHeader
│       ├── TodayPlanRow
│       ├── ProgressRow
│       ├── IdeaQuickAddRow
│       └── ReviewRow
└── Workspace
    ├── TodayPlanView
    ├── IdeasView
    └── DailyReviewView
```

## 16. Interaction Details

- Hover：仅改变背景明度。
- Active：弱 Accent 指示。
- Enter：保存 Quick Add / 任务输入。
- Esc：取消 Quick Add / 任务输入。
- Space：Task checkbox。
- Tab：顺序访问所有交互控件。

## 17. Empty States

### No Plan

```text
今天还没有计划
+ 添加第一项
```

### No Ideas

不需要专门 Empty Card，保留输入入口。

### No Review

侧栏显示：`未填写`

## 18. Metrics

MVP 不建设遥测后台，仅定义手工验收指标：

- 连续 7 天是否每天产生 Daily Record。
- 新增 5 个任务 ≤ 60 秒。
- 记录一个 Idea ≤ 10 秒。
- 第二天是否可以仅看昨日 Review 的 `next_action` 恢复工作。

## 19. Risks

### Risk 1：Feature Creep

如果加入 AI、日历、统计或复杂项目管理，项目会失控。

控制：全部进入 P1/P2，不进入当前实现。

### Risk 2：侧栏越来越大

Daily Hub 可能挤压主内容。

控制：固定四个入口 + 可折叠，详情进入主内容区。

### Risk 3：本地数据损坏

SQLite schema 变更可能影响用户数据。

控制：MVP 不做 schema 迁移；数据库路径固定在 Electron `userData`。

## 20. Delivery Plan

### Milestone 1 — Static Shell

完成 Electron + React + Sidebar Layout + Daily Hub 静态 UI。

### Milestone 2 — Local Data

完成 SQLite、Tasks、Ideas、Review、Date。

### Milestone 3 — Interaction Polish

完成 Inline Add、Keyboard、Empty State、Progress、Collapse。

### Final Direction Cleanup

将项目收敛为纯本地 Daily Hub Desktop App。

## 21. Release Gate

只有同时满足：

```text
SRS Acceptance = PASS
+
Playwright Smoke = PASS
+
Windows Manual QA = PASS
+
7-Day Dogfood ready
```

才发布 MVP。

## 22. Definition of “Do Not Add”

开发过程中如果发现“顺手可以加”的功能，必须默认拒绝，除非该功能：

1. 是 P0 验收的必要依赖；或
2. 修复明确 Bug；或
3. 用户明确批准变更 PRD。

否则记录到：

```text
docs/BACKLOG.md
```

不得进入当前实现。
