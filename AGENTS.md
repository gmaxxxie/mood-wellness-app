# Repository Guidelines

## Project Structure & Module Organization
- 根目录拆分出 `frontend/` (React + Vite + TypeScript 客户端)、`backend/` (Express + Prisma API)、`database/` (原始 SQL 种子) 与 `tests/` (黑盒脚本)。
- 后端源文件位于 `backend/src/`，按 `controllers/`、`routes/`、`services/`、`utils/` 分层，Prisma schema 存在 `backend/prisma/schema.prisma`；环境变量参考 `backend/.env.example`。
- 前端页面集中在 `frontend/src/pages/`，复用组件在 `frontend/src/components/`，状态与 API 封装在 `frontend/src/store/`、`frontend/src/services/`，公共资源位于 `frontend/public/`。

## Build, Test, and Development Commands
- 初始化数据库：`docker-compose up -d postgres redis`，随后执行 `cd backend && npm run db:migrate && npm run db:seed`。
- 后端开发：`cd backend && npm install && npm run dev`（nodemon 热重载，默认端口 3001）；生产模式使用 `npm start`。
- 前端开发：`cd frontend && npm install && npm run dev`（Vite 默认端口 3000），打包用 `npm run build`，本地预览执行 `npm run preview`。
- API 回归脚本：`cd tests && npm install && ./run_tests_fixed.sh`；Playwright UI 验证在 `frontend` 下运行 `npm run test:e2e -- --reporter=dot`（必要时追加 `--project=chromium`）。
- GitHub Actions (`.github/workflows/ci.yml`) 会在 push/PR 时自动运行后端 lint/测试与前端 lint/构建/e2e，请确保本地执行对应命令无误。

## Coding Style & Naming Conventions
- JavaScript/TypeScript 统一 2 空格缩进、保留分号、首选单引号；变量与函数使用 `camelCase`，React 组件使用 `PascalCase`。
- 后端使用 ESLint + Prettier（`npm run lint`、`npm run lint:fix`、`npm run format`），前端执行 `npm run lint` 与 `npm run type-check` 确保无警告。
- Prisma 迁移遵循时间戳前缀；数据库脚本需同步更新 `database/` 中的 SQL 文件并记录变更理由。

## Testing Guidelines
- 后端单元测试优先贴近源码路径（如 `backend/src/services/__tests__/recommendation.test.js`），命名为 `*.test.js`；必要集成测试放在 `tests/` 目录。
- 关键模块（情绪评分、推荐逻辑、认证）覆盖率须维持 ≥80%；PR 前附上 `npm run test` 与 Playwright/脚本运行结果摘要。
- 测试环境需使用独立数据库 URL（如 `DATABASE_URL=postgres://.../mood_test`），运行完成后执行 `npm run db:reset` 清理。

## Commit & Pull Request Guidelines
- 当前可见历史有限，但现有提交格式遵循 Conventional Commits（`feat:`、`fix:`、`chore:`、`docs:`）；请延续该前缀并保持主题不超过 70 个字符。
- PR 描述需列出变更摘要、测试结果、相关 issue，以及 UI 改动的截图或短视频；涉及配置时同步更新 `DEPLOYMENT.md` 或相关文档。
- 合并前至少获得一位维护者审核，并确认 GitHub Actions 任务绿色（必要时附截图/链接）；敏感配置更改需在团队频道提前沟通。

## Security & Configuration Tips
- 严禁提交 `.env*`、密钥或生成的证书，可使用 `.env.local` 或 CI Secret 注入；推送前执行 `git status --short` 自查。
- 默认 `docker-compose` 凭据仅限本地开发，部署前务必覆写账号并启用 SSL/TLS；完成调试后运行 `docker-compose down` 释放资源。
- 日志与备份目录（若新增）应加入 `.gitignore`；异常报警可通过 Redis key 前缀或 Prisma 中间件统一管理。
