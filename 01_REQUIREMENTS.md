# Daily Hub — 软件需求规格说明书（SRS）

Version: 1.0 MVP  
Date: 2026-08-28

## 1. 项目名称

**Daily Hub**

中文工作名：**个人每日学习工作台**

## 2. 项目目标

构建一个纯本地 Desktop App，让用户每天打开后可以在一个轻量界面中完成：

1. 查看今天要做什么。
2. 勾选完成事项。
3. 看到当天学习完成度。
4. 快速记下一条想法。
5. 完成三问复盘。
6. 通过历史日期查看和编辑过往记录。

## 3. MVP 成功定义

用户能连续 7 天只依赖这个 App 完成日计划、学习进度查看、想法捕获和每日复盘。

## 4. 技术边界

### 4.1 支持

- Windows Desktop
- 本地单用户
- 本地 SQLite
- React + TypeScript UI
- Electron Desktop App
- 日期历史查看

### 4.2 不支持

- 外部 AI 客户端集成
- 远程会话 / 审批 / 沙箱运行时
- 登录 / 注册
- 多账户
- 云同步
- Web 多端同步
- 移动端
- 团队协作
- 后端服务

## 5. 系统总体架构

```text
React Renderer
↓
Electron preload / IPC
↓
DailyHubRepository
↓
SQLite
```

React Component 不得直接执行 SQL。

## 6. 技术栈

- Electron
- React
- TypeScript
- Vite
- SQLite
- better-sqlite3
- Vitest
- React Testing Library
- Playwright

## 7. 数据模型

### 7.1 daily_tasks

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | UUID |
| date | TEXT | YYYY-MM-DD |
| title | TEXT | 任务标题 |
| completed | INTEGER | 0 / 1 |
| priority | INTEGER | 0-2，可选 |
| sort_order | INTEGER | 排序 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### 7.2 quick_ideas

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | UUID |
| date | TEXT | YYYY-MM-DD |
| content | TEXT | 想法正文 |
| created_at | TEXT | 时间 |

### 7.3 daily_reviews

| 字段 | 类型 | 说明 |
|---|---|---|
| date | TEXT | PRIMARY KEY |
| completed_summary | TEXT | 今天完成了什么 |
| blocker | TEXT | 卡在哪里 |
| next_action | TEXT | 明天第一件事 |
| updated_at | TEXT | 更新时间 |

今日完成度不单独存表，动态由任务状态计算。

## 8. 功能需求

### FR-01 学习记录栏

系统必须提供固定的“学习记录”区域，并支持折叠 / 展开。折叠状态保存在 localStorage。

### FR-02 今日计划

用户可以：

- 新增任务
- 修改任务标题
- 删除任务
- 勾选完成
- 取消完成

侧栏显示：

`已完成数 / 总任务数`

### FR-03 学习进度

进度自动计算：

```text
completedTasks / totalTasks
```

无任务时显示：

`今天还没有计划`

不得显示无意义的 `0%`。

### FR-04 随手想法

用户点击 `+` 后：

1. 出现单行输入框。
2. Enter 保存。
3. Esc 取消。

要求从点击到保存最多 2 个主要交互动作。

### FR-05 今日复盘

每日固定三项：

- 今天完成了什么？
- 卡在哪里？
- 明天第一件事是什么？

内容自动保存。侧栏状态显示：

- 未填写
- 进行中
- 已填写

### FR-06 日期切换

系统按本机 Local Time 判断当前日期。所有数据按 `YYYY-MM-DD` 隔离。

用户可以切换历史日期、编辑历史记录，并通过“回到今天”返回当天。

### FR-07 数据持久化

所有学习记录必须保存至本地 SQLite。SQLite 文件必须存放在 Electron `userData` 目录中。

重启应用后数据不得丢失。学习数据的读写不依赖互联网连接。

## 9. 非功能需求

### NFR-01 性能

- 首屏数据读取 < 200ms
- 新增任务本地反馈 < 100ms
- 勾选任务本地反馈 < 100ms
- 启动后 5 秒内可操作学习模块

### NFR-02 稳定性

- SQLite 操作失败不能让整个应用崩溃
- UI 操作错误不能导致本地数据丢失

### NFR-03 数据安全

- 数据默认只存本地
- 不上传学习记录
- 不自动读取私人文件

### NFR-04 可维护性

业务层必须分离：

```text
UI
↓
DailyHubRepository
↓
SQLite
```

## 10. UI / Design System

设计方向：**Quiet Desktop Productivity App**

保留：

- 暗色
- 平面
- 紧凑
- 低视觉噪音
- 小型 Progress
- 清晰 Focus
- 轻量 Hover

避免：

- 大面积 Card
- Gradient
- Glow
- 彩色统计图
- Hero
- Banner
- 多层嵌套 Panel

## 11. 验收标准

### A. Daily Plan

- 可新增任务
- 可修改任务
- 可删除任务
- 可完成 / 取消完成
- 重启应用状态保留

### B. Progress

- 百分比与任务完成状态完全一致
- 无任务时显示“今天还没有计划”
- 每次勾选后 UI 即时更新

### C. Idea

- 两步以内保存一条想法
- 自动记录时间
- 重启后仍存在

### D. Review

- 三问均可填写
- 自动保存
- 侧栏能显示未填写 / 进行中 / 已填写

### E. Date

- 当天数据按日期隔离
- 切换日期不会覆盖其他日期数据
- 可查看和编辑历史日期

### F. UI

在 1536×1024 和 1280×720 下：

- 学习模块不遮挡主内容
- 没有横向滚动条
- 字体、颜色、行高一致
- 折叠后仅占一行
- Hover / Focus 清晰
- 键盘操作可用

### G. Test

- `npm run lint` PASS
- `npm run typecheck` PASS
- `npm run test` PASS
- `npm run build` PASS
- `npm run test:e2e` PASS

## 12. MVP 完成定义

满足以下条件才允许标记为 MVP DONE：

1. 所有验收项通过。
2. 连续重启无学习数据丢失。
3. 创建任务 → 完成任务 → 记录想法 → 写复盘整条链路可在 3 分钟内完成。
4. 不存在任何 P1/P2 功能被偷偷加入 V1。
