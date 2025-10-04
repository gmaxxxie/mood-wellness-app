# 开发续作记录

## 本地验证步骤
1. 进入前端目录：`cd frontend`。
2. 首次运行或依赖更新后执行 `npm install`。
3. 运行 Playwright 测试：`npm run test:e2e -- --reporter=dot`。
4. 若提示缺少浏览器，追加执行 `npx playwright install --with-deps`，再重跑步骤 3。
5. 快速冒烟可用 `npm run test:e2e -- --project=chromium --reporter=dot`。

## 提交准备
1. 若尚未初始化 Git，返回仓库根目录执行 `git init`（存在仓库可跳过）。
2. 使用 `git status` 查看变更；暂存目标文件：`git add .github/workflows/ci.yml AGENTS.md`。
3. 提交信息：`git commit -m "chore: add ci workflow with playwright e2e"`。
4. 若 git 未设置用户信息，先运行 `git config user.name "<你的名字>"` 与 `git config user.email "<邮箱>"`。
5. 如未关联远程：`git remote add origin <远程仓库地址>`。

## 推送与 CI 检查
1. 推送到主分支（或目标分支）：`git push origin main`。
2. 登录 GitHub，打开仓库 “Actions” 标签，确认最新工作流触发。
3. 检查 `Backend Lint & Test` 与 `Frontend Lint, Type Check & Build`（含 Playwright 步骤）均为绿色。
4. 若出现失败，展开日志定位问题，在本地修复并重复提交/推送。

> 明日继续时，先参考上述流程确认本地与 CI 状态保持一致。
