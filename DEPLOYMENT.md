# 🧠 心情舒缓应用部署指南

## 🚀 快速开始

### 前置要求
- Node.js 18+
- PostgreSQL 13+  
- Redis 6+
- Docker & Docker Compose (推荐)

### 🐳 使用Docker Compose部署（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd mood-wellness-app
```

2. **启动所有服务**
```bash
docker-compose up -d
```

3. **数据库初始化**
```bash
# 等待PostgreSQL启动后执行
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npm run db:seed
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- API健康检查: http://localhost:3001/api/health

### 🛠️ 手动部署

#### 1. 数据库设置

**PostgreSQL:**
```bash
createdb mood_wellness
psql -d mood_wellness -f database/init.sql
psql -d mood_wellness -f database/seed_psychology_data.sql  
psql -d mood_wellness -f database/seed_solutions.sql
```

**Redis:**
```bash
redis-server
```

#### 2. 后端设置

```bash
cd backend
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件中的数据库连接信息

# 数据库迁移
npx prisma migrate dev
npx prisma generate

# 启动开发服务器
npm run dev
```

#### 3. 前端设置

```bash
cd frontend
npm install

# 启动开发服务器
npm run dev
```

## 📊 核心功能验证

### 1. 情绪评估测试
- 访问 `/assessment` 页面
- 尝试问答模式和语音识别模式
- 验证情绪分析结果

### 2. 解决方案推荐测试
- 完成情绪评估后查看推荐
- 测试解决方案定时器功能
- 提交使用反馈

### 3. 历史记录测试
- 访问 `/history` 页面
- 查看情绪趋势图表
- 验证数据统计准确性

## 🧪 心理学理论验证

### PANAS量表验证
应用基于积极消极情绪量表(PANAS)进行情绪评估:
- **积极情绪**: 热情、警觉、坚定、兴奋、启发等
- **消极情绪**: 痛苦、紧张、易怒、敌对、恐惧等

### 情绪调节技术验证
包含经过科学验证的干预方法:
- **呼吸练习**: 4-7-8呼吸法、方形呼吸法
- **正念技术**: 身体扫描、慈爱冥想
- **认知重构**: CBT思维记录技术
- **身体活动**: 瑜伽、有氧运动

## 🔧 开发指南

### API接口文档
核心API端点:
```
GET  /api/assessment/questions     # 获取评估问题
POST /api/assessment/submit        # 提交评估
POST /api/assessment/voice-analysis # 语音情绪分析
POST /api/solution/recommendations # 获取推荐方案
POST /api/solution/usage          # 记录使用情况
GET  /api/emotion/stats           # 情绪统计数据
```

### 数据库结构
主要数据表:
- `users` - 用户信息
- `emotion_categories` - 情绪分类
- `assessment_questions` - 评估问题库  
- `solutions` - 解决方案库
- `user_assessments` - 用户评估记录
- `recommendations` - 推荐记录

### 前端架构
- **React 18** + **TypeScript**
- **Material-UI** 设计系统
- **Redux Toolkit** 状态管理
- **Framer Motion** 动画效果
- **Recharts** 数据可视化

## 📈 监控与维护

### 健康检查
```bash
curl http://localhost:3001/api/health
```

### 日志监控
```bash
# 查看后端日志
docker-compose logs -f backend

# 查看数据库连接
docker-compose logs postgres
```

### 性能优化
- 数据库查询索引优化
- Redis缓存策略
- 前端代码分割
- 图片懒加载

## 🔒 安全考虑

- JWT token认证
- API请求频率限制
- 用户数据加密存储
- CORS跨域安全配置
- 语音数据隐私保护

## 📱 移动端支持

应用已优化支持移动设备:
- 响应式设计
- 触摸友好界面
- PWA离线支持(可选)
- 语音识别移动适配

## 🤝 贡献指南

1. Fork项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

## 📄 许可证

本项目基于MIT许可证开源，详见 [LICENSE](LICENSE) 文件。

---

💡 **提示**: 如遇到问题，请查看 [故障排除指南](TROUBLESHOOTING.md) 或提交Issue。