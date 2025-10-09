# 情绪舒缓应用 (Mood Wellness App)

一个基于科学心理学理论的情绪评估和舒缓应用，帮助用户快速识别情绪状态并提供个性化的即时解决方案。

## 🎯 核心功能

- **多维情绪评估**：通过选择题、情绪标签、语音输入识别用户当前情绪状态
- **智能分析**：基于PANAS量表、情绪调节理论等心理学框架进行科学分析
- **即时解决方案**：提供音乐疗法、呼吸练习、正念冥想等具体可行的舒缓方法
- **个性化推荐**：根据用户反馈和历史数据优化推荐算法

## 🏗️ 技术栈

### 前端
- React 18 + TypeScript
- Material-UI (MUI)
- Redux Toolkit
- Web Speech API

### 后端
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Redis (缓存)

### 部署
- Docker
- Docker Compose

## 📁 项目结构

```
mood-wellness-app/
├── frontend/          # React前端应用
├── backend/           # Node.js后端服务
├── database/          # 数据库迁移和种子数据
├── docker-compose.yml # 容器化配置
└── README.md
```

## 🚀 快速开始

### 开发环境设置

1. 克隆项目
```bash
git clone <repository-url>
cd mood-wellness-app
```

2. 安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

3. 启动数据库
```bash
docker-compose up -d postgres redis
```

4. 运行数据库迁移
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. 启动开发服务器
```bash
# 后端 (端口 3001)
cd backend
npm run dev

# 前端 (端口 3000)
cd ../frontend
npm start
```

## 📊 心理学理论基础

本应用基于以下科学理论和量表：

- **PANAS量表**：测量积极和消极情绪
- **Gross情绪调节理论**：情绪管理框架
- **Ekman六基本情绪**：快乐、悲伤、愤怒、恐惧、惊讶、厌恶
- **正念疗法(MBSR)**：即时舒缓技术
- **认知行为疗法(CBT)**：认知重构技术

## 🧠 评估方法论概览

我们基于“身体-行为-认知-情绪”联动构建两轮引导式评估流程，核心设计要点如下：

- **身心互动理论**：吸收James-Lange与双因素情绪理论的观点，先记录身体与行为信号，再推断情绪体验。
- **CBT认知框架**：在第二轮追问中增加认知评价题组，识别灾难化、回避等思维模式。
- **生物-心理-社会视角**：纳入环境影响（噪音、社交、工作负荷等），避免单向因果假设。
- **量表化基线**：保留PANAS、PHQ-2、GAD-2风格题目，兼顾科学性与可比较性。

### 两轮引导流程

1. **第一轮初筛**：围绕情境触发、精力水平、情绪控制力等问题，快速确定身心状态与主要触发源。
2. **第二轮定向追问**：根据第一轮答案触发配置化规则，自动组合情绪、焦虑、抑郁、认知或环境题目，并在界面给出聚焦说明。

前端会在提交时携带阶段元数据，辅助后端分析与个性化推荐形成闭环。

## 🔒 隐私和安全

- 用户数据加密存储
- 不记录敏感个人信息
- 匿名化数据分析
- 符合数据保护法规

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议。请查看 [贡献指南](CONTRIBUTING.md)。

## 📄 许可证

MIT License
