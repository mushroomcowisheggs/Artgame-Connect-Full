# Artgame Connect (Full Stack)

English
-------

Artgame Connect is a collaborative creation platform that connects creators and requesters. This repository contains the full-stack version: a PHP backend (API and helper classes) plus a static frontend.

Project layout (important folders)
- `api/` - PHP API endpoints (e.g. `auth.php`, `projects.php`, `login.php`)
- `backend/` - backend helpers and server-side code
- `classes/` - PHP helper classes (e.g. `DatabaseInitializer.php`, `FileUploader.php`)
- `config/` - configuration files (`database.php`, `admin_account.env`)
- `database/` - SQL dumps or DB migration files (if present)
- `frontend/` - static client (HTML/CSS/JS) served to users

Requirements
- PHP 7.4+ (or compatible PHP runtime)
- MySQL / MariaDB (or compatible RDBMS)
- A web server (Apache, Nginx) or the PHP built-in server for development

Quick development setup
1. Configure DB credentials: edit `config/database.php` with your database host, name, user, and password.
2. Create the database and import SQL files from `database/` if provided.
3. Ensure any upload directories (e.g. `frontend/assets/uploads`) are writable by the webserver/PHP process.
4. For a quick local server (development only) you can run:

```powershell
cd {Your Path}\Artgame-Connect-v14
php -S localhost:8000 -t .
```

Then open `http://localhost:8000/frontend/index.html` or configure your web server to serve the project root.

Notes and tips
- API endpoints are under `api/`. Secure `config/` files for production (do not commit credentials).
- The frontend uses `frontend/assets/js/i18n-config.js` and `frontend/assets/js/lang.js` for translations. The demo account password is referenced as `demo123` in the translations.
- For production, use a proper web server (Nginx/Apache), enable HTTPS, and follow PHP hardening recommendations.

Known issues (short)
- `frontend/assets/js/lang.js`: English translation key `errorSearchingCreators` has a wrong value (copy/paste). This may display an incorrect message for that error.
- `toggleLanguage()` in `lang.js` references `currentProject` and calls `loadWorkbench(currentProject)`; ensure `currentProject` is defined in the global scope before use.

Where to look next
- Frontend entry: `frontend/index.html` and `frontend/assets/js/`
- Backend/API: `api/` and `classes/`

Would you like me to create a `docker-compose.yml` or a simple dev script to run both services locally?

中文（简体）
----------------

Artgame Connect 是一个连接创作者与需求方的协作创作平台。本仓库为全栈版本：包含 PHP 后端（API 与辅助类）和静态前端。

项目结构（主要目录）
- `api/` - PHP API 接口（例如 `auth.php`, `projects.php`, `login.php`）
- `backend/` - 后端代码
- `classes/` - PHP 工具类（例如 `DatabaseInitializer.php`, `FileUploader.php`）
- `config/` - 配置文件（`database.php`, `admin_account.env`）
- `database/` - 数据库导出/迁移文件（如存在）
- `frontend/` - 客户端静态文件（HTML/CSS/JS）

运行与开发环境要求
- PHP 7.4+
- MySQL / MariaDB
- Web 服务器（Apache、Nginx），或用于开发的 PHP 内置服务器

快速开发步骤
1. 编辑 `config/database.php` 填写数据库信息（host、name、user、password）。
2. 创建数据库并导入 `database/` 下的 SQL 文件（如果提供）。
3. 确保上传目录（如 `frontend/assets/uploads`）对 Web 服务器/PHP 进程可写。
4. 开发环境快速启动（仅用于本地测试）：

```powershell
cd {Your Path}\Artgame-Connect-v14
php -S localhost:8000 -t .
```

然后打开 `http://localhost:8000/frontend/index.html`。

注意事项
- API 接口位于 `api/`，请在生产环境中保护 `config/` 配置，不要在版本控制中泄露凭据。
- 前端的国际化文件位于 `frontend/assets/js/i18n-config.js` 和 `frontend/assets/js/lang.js`，演示账号密码在翻译中标注为 `demo123`。

已知问题（简述）
- `frontend/assets/js/lang.js`：英文翻译键 `errorSearchingCreators` 的值被误设为另一个键名，可能导致错误信息显示不正确。
- `toggleLanguage()` 调用 `loadWorkbench(currentProject)`，请确保全局存在 `currentProject` 变量以避免运行时报错。

下一步探索
- 前端入口：`frontend/index.html`，以及 `frontend/assets/js/`
- 后端/API：`api/` 与 `classes/`
