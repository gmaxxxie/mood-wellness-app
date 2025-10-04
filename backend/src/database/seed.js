const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const sqlFiles = ['init.sql', 'seed_psychology_data.sql', 'seed_solutions.sql'];

function ensurePsql() {
  const result = spawnSync('psql', ['--version'], { stdio: 'ignore' });
  return result.status === 0;
}

function parseDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || '5432',
      user: decodeURIComponent(parsed.username || ''),
      password: decodeURIComponent(parsed.password || ''),
      database: parsed.pathname.replace(/^\//, ''),
    };
  } catch (error) {
    throw new Error(`无效的 DATABASE_URL: ${error.message}`);
  }
}

function runSqlFile(connection, filePath) {
  const args = [
    '-h',
    connection.host,
    '-p',
    connection.port,
    '-U',
    connection.user,
    '-d',
    connection.database,
    '-v',
    'ON_ERROR_STOP=1',
    '-f',
    filePath,
  ];

  const env = {
    ...process.env,
    PGPASSWORD: connection.password,
  };

  console.log(`执行 SQL 脚本: ${path.basename(filePath)}`);
  const result = spawnSync('psql', args, { stdio: 'inherit', env });

  if (result.status !== 0) {
    throw new Error(`执行 ${path.basename(filePath)} 失败，退出码 ${result.status}`);
  }
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL 未配置，无法执行数据库种子脚本');
    process.exit(1);
  }

  if (!ensurePsql()) {
    console.error('未找到 psql 命令，请确保已安装 PostgreSQL 客户端工具');
    process.exit(1);
  }

  const connection = parseDatabaseUrl(databaseUrl);

  try {
    for (const fileName of sqlFiles) {
      const filePath = path.resolve(__dirname, '../../database', fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`跳过缺失的 SQL 文件: ${fileName}`);
        continue;
      }

      if (!fs.readFileSync(filePath, 'utf8').trim()) {
        console.warn(`SQL 文件为空，跳过: ${fileName}`);
        continue;
      }

      runSqlFile(connection, filePath);
    }

    console.log('✅ 数据库种子数据加载完成');
  } catch (error) {
    console.error('❌ 数据库种子执行失败:', error.message);
    process.exit(1);
  }
}

run();
