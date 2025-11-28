# Artgame Connect (Full Stack)

English
-------

Artgame Connect is a collaborative creation platform that connects creators and requesters. This repository contains the full-stack version: a PHP backend (API and helper classes) plus a static frontend.

Note about versions
- This repository contains the full server (PHP) version. There is also a separate frontend-only version in `../Artgame-Connect-v14-Frontend-Only` that uses a mock backend for demos and UI work. The final user-facing effect (UI and most client behaviour) is essentially the same between the full-stack and frontend-only versions; the frontend-only copy simply simulates the backend for local demos.

Project layout (important folders)
- `api/` - PHP API endpoints (e.g. `auth.php`, `projects.php`, `login.php`)
- `backend/` - backend helpers and server-side code
- `classes/` - PHP helper classes (e.g. `DatabaseInitializer.php`, `FileUploader.php`)
- `config/` - configuration files (`database.php`, `admin_account.env`)
- `database/` - SQLite database files
- `frontend/` - static client (HTML/CSS/JS) served to users

Requirements
- PHP 7.4+ (or compatible PHP runtime)
- A web server or the PHP built-in server for development

PHP ini note
- When using the PHP built-in server or any PHP runtime, ensure your `php.ini` is adjusted if extensions are not enabled by default: uncomment `extension_dir = "ext"` and enable the `mbstring` and `pdo_sqlite` extensions by uncommenting their `extension=` lines (for example `extension=mbstring` and `extension=pdo_sqlite`). This is required for string handling and SQLite database support on many systems.

Quick development setup
1. Configure DB credentials: edit `config/database.php` with your database host, name, user, and password.
2. Create the database and import SQL files from `database/`.
3. Ensure any upload directories (e.g. `frontend/assets/uploads`) are writable by the webserver/PHP process.
4. For a quick local server (development only) you can run:

```powershell
cd {Your Path}\Artgame-Connect-v14
php -S localhost:8000 -t .
```

Then open `http://localhost:8000/frontend/index.html` or configure your web server to serve the project root. (You can replace 8000 with any free port.)

Notes and tips
- API endpoints are under `api/`. Secure `config/` files for production (do not commit credentials).
- The frontend uses `frontend/assets/js/i18n-config.js` and `frontend/assets/js/lang.js` for translations. The demo account password is referenced as `demo123` in the translations.
- For production, use a proper web server (Nginx/Apache), enable HTTPS, and follow PHP hardening recommendations.

Known issues (short)
- `frontend/assets/js/lang.js`: English translation key `errorSearchingCreators` has a wrong value (copy/paste). This may display an incorrect message for that error.
- `toggleLanguage()` in `lang.js` references `currentProject` and calls `loadWorkbench(currentProject)`; ensure `currentProject` is defined in the global scope before use.


Platform purpose — solving common pain points

- Matching: The platform is designed to make finding the right collaborators easy. A strong community layer (follow/feeds, thematic forums, curated groups and a reputation/badge system) helps creators and requesters discover and match with complementary skills. Recommendation algorithms and reputation filters reduce time spent searching and raise match quality.

- Follow-up & tracking: The Workbench organizes projects into boards, tasks, milestones and deliverables, making scope and progress explicit. Each project keeps an activity log, file attachments, and status updates so teams can follow progress, assign responsibility, and resume work with clear context.

- Communication: Task publishers(requesters) are encouraged to provide structured task descriptions (scope, deliverables, acceptance criteria, timeline, reference files). Templates and mandatory fields reduce ambiguity, while threaded comments and requirement checklists keep discussions and decisions attached to the task.

- Other pain points addressed (secondary):
	- Trust & quality: reputation badges, multi-dimensional reviewer feedback, and algorithmic prioritization of high-reputation creators.
	- Payments & risk: support for escrow-like workflows or milestone-based payment to protect both sides.
	- Onboarding & reuse: templates, examples and multi-language support to lower the barrier for international collaboration.



中文（简体）
----------------

Artgame Connect 是一个连接创作者与需求方的协作创作平台。本仓库为全栈版本：包含 PHP 后端（API 与辅助类）和静态前端。

版本说明
- 本仓库为带后端的完整版本；另有一个仅前端的演示版本位于 `../Artgame-Connect-v14-Frontend-Only`，它通过模拟后端用于演示与界面开发。最终的界面与用户体验在两者之间基本一致，仅前端版本使用模拟数据以便本地演示。

php.ini 注意
- 在使用 PHP 内置服务器或其他 PHP 运行时时，如果扩展未被默认启用，请编辑 `php.ini`：取消注释 `extension_dir = "ext"`，并通过取消注释相应的 `extension=` 行启用 `mbstring` 与 `pdo_sqlite`（例如 `extension=mbstring`、`extension=pdo_sqlite`）。这些扩展通常用于字符串处理和 SQLite 支持。

项目结构（主要目录）
- `api/` - PHP API 接口（例如 `auth.php`, `projects.php`, `login.php`）
- `backend/` - 后端代码
- `classes/` - PHP 工具类（例如 `DatabaseInitializer.php`, `FileUploader.php`）
- `config/` - 配置文件（`database.php`, `admin_account.env`）
- `database/` - SQLite 数据库文件
- `frontend/` - 客户端静态文件（HTML/CSS/JS）

运行与开发环境要求
- PHP 7.4+
- Web 服务器，或用于开发的 PHP 内置服务器

快速开发步骤
1. 编辑 `config/database.php` 填写数据库信息（host、name、user、password）。
2. 创建数据库并导入 `database/` 下的 SQL 文件。
3. 确保上传目录（如 `frontend/assets/uploads`）对 Web 服务器/PHP 进程可写。
4. 开发环境快速启动（仅用于本地测试）：

```powershell
cd {你的路径}\Artgame-Connect-v14
php -S localhost:8000 -t .
```

然后打开 `http://localhost:8000/frontend/index.html`。（或者将8000替换为你的其它空闲端口）

注意事项
- API 接口位于 `api/`，请在生产环境中保护 `config/` 配置，不要在版本控制中泄露凭据。
- 前端的国际化文件位于 `frontend/assets/js/i18n-config.js` 和 `frontend/assets/js/lang.js`，演示账号密码在翻译中标注为 `demo123`。

已知问题（简述）
- `frontend/assets/js/lang.js`：英文翻译键 `errorSearchingCreators` 的值被误设为另一个键名，可能导致错误信息显示不正确。
- `toggleLanguage()` 调用 `loadWorkbench(currentProject)`，请确保全局存在 `currentProject` 变量以避免运行时报错。


平台目的——解决常见的痛点

-匹配：该平台旨在轻松找到合适的合作者。一个强大的社区层（关注/订阅，主题论坛，策划小组和声誉/徽章系统）可以帮助创造者和请求者发现并匹配互补的技能。推荐算法和声誉过滤器减少了搜索时间，提高了匹配质量。

-跟进和跟踪：工作台将项目组织成板块、任务、里程碑和可交付成果，明确范围和进度。每个项目都保留一个活动日志、文件附件和状态更新，以便团队可以跟踪进度、分配责任，并在清晰的背景下继续工作。

-沟通：鼓励任务发布者（需求方）提供结构化的任务描述（范围、可交付成果、验收标准、时间线、参考文件）。模板和强制字段减少了歧义，而线程注释和需求检查表将讨论和决策附加到任务上。

-解决其他痛点（次要）：
-信任和质量：声誉徽章，多维度评论反馈，以及高声誉创作者的算法优先级。
-支付和风险：支持类似托管的工作流程或基于里程碑的支付，以保护双方。
-入职和重用：模板，示例和多语言支持，以降低国际协作的障碍。