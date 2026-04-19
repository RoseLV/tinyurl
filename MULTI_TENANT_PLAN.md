# URLteq 多租户方案

## 现状分析

| 组件 | 当前状态 |
|------|---------|
| Auth | 单个 `API_KEY` (Cloudflare secret)，所有人共享 |
| KV 键结构 | `link:{slug}` 存链接，`links:list` 存全局列表 (上限 200) |
| D1 | `clicks` 表只有 slug + count，无租户标识 |
| 域名 | `urlteq.com/{slug}`，slug 全局唯一 |
| 已验证规模 | roundtable4 活动，24 条短链 |

## Cloudflare Free Plan 硬限制

| 资源 | 限额 | 影响 |
|------|------|------|
| Worker 请求 | 100k/天 | 包含所有租户的重定向 + API 调用 |
| KV 读 | 100k/天 | 每次重定向 1 读，每次 list 请求 N+1 读 |
| **KV 写** | **1k/天** | **最大瓶颈** — 创建链接 = 2 写 (link + list) |
| D1 读 | 5M 行/天 | 充足 |
| D1 写 | 100k 行/天 | 充足 |
| KV 存储 | 1GB | 充足 |
| D1 存储 | 5GB | 充足 |

> **关键约束：KV 每天只有 1k 次写入。按每条链接 2 次写入算，全平台每天最多创建 ~500 条短链。** 这对你目前的使用量（一个活动 24 条）绰绰有余，支撑 5-10 个中小客户没问题。

---

## 前置优化(上多租户之前先做)

### 问题:`GET /api/links` 的 N+1 读

现状 `links:list` 只存 slug 数组,dashboard 每次加载做 1 + N 次 KV 读。24 条链接就是 25 次读。**这是你现在感到"创建链接变慢"的真正原因** —— 创建成功后前端自动触发 `loadLinks()`,这次 refresh 随链接数线性恶化。

上多租户后问题放大到平台级:

| 场景 | N+1 读成本 |
|------|-----------|
| 现在(24 条) | 25 读/次 refresh |
| 单客户 200 条 | 201 读/次 refresh |
| 100 租户 × 每天 2 次 dashboard | **~20,200 读/天**(Free Plan 20% 额度) |

### 方案:denormalize `links:list` 的值

把列表值从「slug 数组」改成「完整 link 对象数组」:

```
links:list  →  [
  { slug, url, created, campaign, channel, expireAt, notifyEmail, notified },
  ...
]
```

`link:{slug}` **保留不变**(重定向路径需要按 slug 快速查找)。相当于 list 多存一份冗余 —— KV 存储便宜,KV 写才是稀缺资源。

### 收益与代价

| 操作 | Before | After |
|------|--------|-------|
| `GET /api/links` | 1 + N KV 读 | **1 KV 读 + 1 D1 查询** |
| `POST /api/shorten` | 2 KV 写 | 2 KV 写(不变) |
| `DELETE /api/links/:slug` | 1 delete + 1 list 写 | 同 |
| 重定向(按 slug 读 link) | 1 KV 读 | 不变 |
| link 元数据改动(如 cron 设 `notified:true`) | 1 KV 写 | **+1 KV 写**(同步 list) |

**唯一代价:link mutation 时要双写。** 但 link 元数据改动极少(仅 cron expire reminder 写一次 `notified: true`),一条链接生命周期多 1 次写,成本可忽略。

**list 值大小校验:** 200 条 × 250B ≈ 50KB,远低于 KV 单值 25MB 上限。

### 实施(独立于多租户,先发一版)

| 改动点 | 说明 |
|--------|------|
| `POST /api/shorten` | `list.unshift(slug)` 改为 `list.unshift(linkData)` |
| `POST /api/shorten/batch` | 同上 |
| `GET /api/links` | 删除 N 次并行读,直接返回 list(仅保留 D1 click 合并) |
| `DELETE /api/links/:slug` | `list.filter(s => s !== slug)` 改为 `list.filter(l => l.slug !== slug)` |
| `cron.js` expire reminder | 直接从 list 读 expireAt/notifyEmail,避免 N 次 `link:{slug}` 读 |
| link metadata 修改时 | 同步回写 list |

### 前端顺手优化

去掉 `src/frontend/index.js` 第 881-882 行 create 成功后的 `loadLinks()` 自动触发,改成**乐观 UI**:把新创建的 link 直接 prepend 到内存数组重渲染。这样即使走 denormalized list,创建后 UI 也**完全不发 GET 请求**,体感瞬时。

### 上线顺序建议

这个优化**独立于多租户**,建议分两次部署:

1. **Release 1:denormalize + 乐观 UI**(1-2 天工作量,零 schema 改动)
2. **Release 2:多租户改造**(见下文方案设计)

两次解耦的好处:Release 1 立即改善你目前的创建体验;Release 2 上线时所有客户从一开始就走高效路径。

---

## 方案设计

### 0. 角色模型

所有调用方都是一条 **Tenant 记录**，记录上挂 `role` 字段决定权限：

| Role | 能做什么 | 不能做什么 | 典型用途 |
|------|---------|-----------|---------|
| `admin` | CRUD tenant 记录（增删改查租户） | **不能直接操作 link 数据** | 平台管理，接入新客户 |
| `owner` | CRUD 自己名下的链接 | 不能操作 tenant 记录 | 所有客户账号（包括你自己） |

> **设计原则：admin 与数据完全解耦。** admin 不能直接创建/删除链接，避免"上帝账号"误操作破坏业务数据。admin 要查某客户数据需显式调 `POST /api/tenants/:id/impersonate` 换一把临时 owner key（操作写 audit log）。

#### 初始的三个预置租户

迁移后系统里预置：

| Tenant ID | Role | 数据 | 用途 |
|-----------|------|------|------|
| `admin` | `admin` | 无 | 平台管理（创建新客户、轮换 key） |
| `self` | `owner` | 继承现有 24 条 roundtable4 链接 | 你自己的数据，和未来客户完全平等 |
| `test` | `owner` | 空 | 测试/QA，不污染 self |

> 你现在的账号"降级"成 `self`，和 `acme`/`newcorp` 等未来客户地位平等。好处：你遇到的 bug 就是客户遇到的 bug，代码里不存在特权分支。

### 1. 租户数据模型

在 KV 中新增租户注册表：

```
tenant:{tenantId}  →  {
  "id": "self",
  "name": "URLteq Owner",
  "role": "owner",                   // "admin" | "owner"
  "apiKeyHashes": ["<sha256>"],      // 数组,支持不停机轮换
  "created": 1713400000000,          // tenant 创建时间(Unix ms)
  "quota": {
    "maxLinks": 200,                 // 总链接数上限
    "maxLinksPerDay": 30             // 每日创建上限(防 noisy neighbor)
  },
  "contact": "you@example.com"       // 可选,用于到期提醒/通知
}
```

API key 反查索引（hash → tenantId）：
```
apikey:{sha256(apiKey + env.KEY_PEPPER)}  →  "self"
```

> **几点说明：**
> 1. **只存 hash，不存明文 apiKey** —— KV dump 泄露时不会直接泄露可用 key。
> 2. **Hash 加 pepper** —— pepper 存在 `env.KEY_PEPPER` secret 里，彩虹表失效。
> 3. **apiKeyHashes 是数组** —— 支持同一租户持有多个 key（便于不停机轮换）。

#### Quota 字段设计依据(针对 10-100 用户、Free Plan)

| 字段 | 默认值 | 为什么是这个数 |
|------|-------|---------------|
| `maxLinks` | 200 | 配合现有 `links:list` 的 200 上限。每条 ~200B,200 条 = 40KB,KV 单值远低于 25MB 上限,读 list 性能可控 |
| `maxLinksPerDay` | 30 | KV 写额度 **1000/天 是全平台共享的**。30/天意味着 30 个活跃租户同时跑满,每个仍占 6% 额度,有缓冲 |
| ~~`maxCampaigns`~~ | ❌ 删除 | "campaign" 只是 link 上的字符串字段,enforce 需读全部 link 记录(200+ KV 读/请求),成本远高于价值。未来若需按活动收费,改用 D1 表 `campaigns` 显式存储 |

#### 未来可选的分层(目前不实现)

| Tier | maxLinks | maxLinksPerDay | 适合 |
|------|---------|----------------|------|
| trial | 50 | 10 | 试用客户、单次活动 |
| basic | 200 | 30 | 中小客户(默认) |
| pro | 500 | 60 | 活跃客户 |
| custom | ∞ | ∞ | 升级 Workers Paid 后无 KV 写限制 |

当前阶段:`quota` 字段保留灵活性,admin 可以为单个客户单独调整,无需实现 tier 概念。

### 2. KV 键结构改造

| 现有键 | 新键 | 说明 |
|--------|------|------|
| `link:{slug}` | `link:{slug}` | **不变** — slug 全局唯一，重定向不需要知道租户 |
| `links:list` | `links:{tenantId}` | 每个租户独立的链接列表 |
| — | `tenant:{tenantId}` | 租户配置 |
| — | `apikey:{hash}` | API key 反查索引 |

链接数据增加 `tenantId` 字段：
```json
{
  "slug": "abc123",
  "tenantId": "acme",
  "url": "https://...",
  "campaign": "roundtable4",
  "channel": "wechat",
  "created": 1713400000000,
  "clicks": 0,
  "expireAt": null,
  "notifyEmail": "bob@acme.com",
  "notified": false
}
```

### 3. D1 表结构改造

```sql
-- 新迁移: 0002_multi_tenant.sql
ALTER TABLE clicks ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'self';
CREATE INDEX idx_clicks_tenant ON clicks(tenant_id);
```

> DEFAULT 是 `'self'`（不是 `'default'`），与 KV 里的 `tenant:self` 对齐。所有存量 clicks 行自动归属 self 租户，无需补脚本。

**redirect.js 隐性改动**：写 clicks 时需从 `link:{slug}` 读出 `tenantId` 一起写入。否则新创建的链接点击数会全部归属 `'self'`（默认值），而非真正的 owner。

### 4. Auth 改造

**现有逻辑（api.js 第 19-22 行）：**
```js
function checkAuth(request, env) {
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${env.API_KEY}`;
}
```

**改为「解析身份 + 检查角色」两步：**
```js
async function resolveTenant(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  const apiKey = header.slice(7);

  // 迁移期向后兼容：旧 env.API_KEY 仍能识别为 admin 租户
  // 部署后 30 天移除此分支（见步骤 5）
  if (apiKey === env.API_KEY) {
    const raw = await env.URLS.get('tenant:admin');
    return raw ? JSON.parse(raw) : null;
  }

  const hash = await sha256(apiKey + env.KEY_PEPPER);
  const tenantId = await env.URLS.get(`apikey:${hash}`);
  if (!tenantId) return null;

  const raw = await env.URLS.get(`tenant:${tenantId}`);
  return raw ? JSON.parse(raw) : null;
}

function requireRole(tenant, role) {
  return tenant != null && tenant.role === role;
}
```

每个端点入口处显式声明所需角色：
```js
const tenant = await resolveTenant(request, env);
if (!tenant) return json({ error: 'Unauthorized' }, 401);

// 例：link 操作要求 owner
if (!requireRole(tenant, 'owner')) return json({ error: 'Forbidden' }, 403);

// 例：tenant 管理要求 admin
if (!requireRole(tenant, 'admin')) return json({ error: 'Forbidden' }, 403);
```

> **关键变化：**
> - **没有 `?tenant=xxx` query 参数 hack 了。** admin 想查某租户数据必须显式调 `POST /api/tenants/:id/impersonate` 换一把临时 owner key。原方案的 query 参数会进访问日志，是 PII 泄露源。
> - **admin 不能调 `POST /api/shorten`。** 角色边界从一开始就严格，避免后期补丁式加锁。
> - **现有 `env.API_KEY` 在迁移期等价于 admin key**，老脚本/curl 命令继续工作。

### 5. API 端点变化

| 端点 | 要求角色 | 变化 |
|------|---------|------|
| `POST /api/shorten` | `owner` | linkData 加 `tenantId`;写入 `links:{tenantId}`;配额检查 |
| `POST /api/shorten/batch` | `owner` | 同上 |
| `GET /api/links` | `owner` | 只返回当前租户的 `links:{tenantId}` |
| `DELETE /api/links/:slug` | `owner` | 读 `link:{slug}` 比对 tenantId 后才删(不匹配返 404,避免枚举) |
| `GET /{slug}` (重定向) | 公开 | **URL 路径不变**;写 D1 clicks 时从 link 记录读 tenantId 一起写入 |

新增管理端点(仅 `admin` 角色):

| 端点 | 用途 |
|------|------|
| `POST /api/tenants` | 创建租户,生成首 API key(仅返回一次) |
| `GET /api/tenants` | 列出所有租户(不含 hash) |
| `GET /api/tenants/:id` | 查看单个租户详情 + 使用情况 |
| `PATCH /api/tenants/:id` | 修改配额/联系人 |
| `DELETE /api/tenants/:id` | 删除租户(仅删认证;link 数据保留便于追溯) |
| `POST /api/tenants/:id/rotate-key` | 增加一把新 key(旧 key 保留至手动撤销,不停机轮换) |
| `DELETE /api/tenants/:id/keys/:hash` | 撤销特定 key |
| `POST /api/tenants/:id/impersonate` | 签发短期(24h)临时 owner key 供 admin 调试 |

> **越权拦截:** admin 调 `POST /api/shorten` → 403;owner 调 `POST /api/tenants` → 403。角色边界从上线第一天就强制,避免后期打补丁。

### 6. Slug 命名空间策略

两种选择：

**方案 A — 全局共享 slug（推荐）：**
所有租户共享 slug 空间。优点是简单，`/{slug}` 重定向逻辑零改动。
缺点是租户不能用同一个 customSlug。

**方案 B — 租户前缀 slug：**
slug 自动带租户前缀如 `acme-abc123`。优点是命名空间隔离。
缺点是 URL 变长，不美观。

> 推荐方案 A。24 条 × 10 个客户 = 240 条链接，在 62^6 ≈ 568 亿的空间里碰撞概率为零。customSlug 冲突时返回 409 让客户换一个即可。

### 7. 配额与限流

每次写操作前做两层检查(总量 + 今日):

```js
async function checkQuota(env, tenant) {
  // 第 1 层:总量上限(读 KV list,已经是常规路径)
  const list = await getList(env, tenant.id);
  if (list.length >= (tenant.quota?.maxLinks ?? 200)) {
    return { ok: false, error: 'Total link quota exceeded' };
  }

  // 第 2 层:今日速率(D1 计数器,便宜)
  const today = new Date().toISOString().slice(0, 10);  // "2026-04-18"
  const row = await env.DB.prepare(
    'SELECT count FROM daily_writes WHERE tenant_id=? AND date=?'
  ).bind(tenant.id, today).first();
  const todayCount = row?.count ?? 0;
  if (todayCount >= (tenant.quota?.maxLinksPerDay ?? 30)) {
    return { ok: false, error: 'Daily link quota exceeded' };
  }

  return { ok: true };
}

// 创建链接成功后,递增计数器
async function bumpDailyCounter(env, tenantId) {
  const today = new Date().toISOString().slice(0, 10);
  await env.DB.prepare(
    `INSERT INTO daily_writes (tenant_id, date, count) VALUES (?, ?, 1)
     ON CONFLICT(tenant_id, date) DO UPDATE SET count = count + 1`
  ).bind(tenantId, today).run();
}
```

对应的 D1 schema(并入 `0002_multi_tenant.sql`):
```sql
CREATE TABLE daily_writes (
  tenant_id TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, date)
);
```

> **为什么用 D1 而不是 KV 存计数器?** KV 写额度是要保护的稀缺资源(1k/天);D1 写额度 100k/天,用 D1 存计数器本身不消耗 KV 写。
>
> **并发竞态:** 上面的 `checkQuota` 存在 TOCTOU(check → create 之间可能有第二个请求也通过检查)。两种解法:
> - **宽松派**:允许 +1~2 的超额,不影响大局;
> - **严格派**:把 list insert 和计数器 bump 都放在 D1 用事务,失败时回滚 KV 删 link。对 Free Plan 的 10-100 用户场景,宽松派完全够用。

---

## 迁移步骤(零数据丢失、零停机)

核心原则:**双读兼容 → 一次性种子 → 懒迁移链接 → 验收后关闭兼容**。每一步都幂等、可回滚。

### 步骤 0:部署"双读兼容"版本代码

新代码具备以下兼容特性(部署后现有数据/现有 API_KEY 继续工作,行为零变化):

- **List 键双读**:读 `links:{tenantId}` 不存在时退回 `links:list`(仅 self 用)
- **Link 记录兼容**:读 `link:{slug}` 发现无 `tenantId` 字段时视为 `tenantId: "self"`
- **旧 API_KEY 兼容**:`Authorization: Bearer {env.API_KEY}` 自动识别为 `admin` 租户(临时)

### 步骤 1:跑 D1 迁移

```sql
ALTER TABLE clicks ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'self';
CREATE INDEX idx_clicks_tenant ON clicks(tenant_id);

CREATE TABLE daily_writes (
  tenant_id TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, date)
);
```

存量 clicks 行 `DEFAULT 'self'` 自动回填。

### 步骤 2:种三个租户(一次性管理脚本)

```js
// scripts/seed-tenants.js —— 只跑一次
async function seed(env) {
  const SELF_KEY  = generateApiKey('self');   // 打印到 console,你存好
  const TEST_KEY  = generateApiKey('test');   // 打印到 console,你存好
  const pepper    = env.KEY_PEPPER;
  const now       = Date.now();

  // tenant 记录
  await env.URLS.put('tenant:admin', JSON.stringify({
    id: 'admin', role: 'admin', name: 'Platform Admin', created: now,
    apiKeyHashes: [await sha256(env.API_KEY + pepper)],  // 复用现有 secret
  }));
  await env.URLS.put('tenant:self', JSON.stringify({
    id: 'self', role: 'owner', name: 'URLteq Owner', created: now,
    apiKeyHashes: [await sha256(SELF_KEY + pepper)],
    quota: { maxLinks: 200, maxLinksPerDay: 30 },
  }));
  await env.URLS.put('tenant:test', JSON.stringify({
    id: 'test', role: 'owner', name: 'Test Account', created: now,
    apiKeyHashes: [await sha256(TEST_KEY + pepper)],
    quota: { maxLinks: 20, maxLinksPerDay: 5 },
  }));

  // apikey 反查索引
  await env.URLS.put(`apikey:${await sha256(env.API_KEY + pepper)}`, 'admin');
  await env.URLS.put(`apikey:${await sha256(SELF_KEY  + pepper)}`, 'self');
  await env.URLS.put(`apikey:${await sha256(TEST_KEY  + pepper)}`, 'test');

  // 把现有 links:list 复制到 links:self
  const oldList = await env.URLS.get('links:list');
  if (oldList) await env.URLS.put('links:self', oldList);

  console.log('SELF_KEY =', SELF_KEY);
  console.log('TEST_KEY =', TEST_KEY);
  // env.API_KEY 仍然有效,现在等价于 ADMIN_KEY
}
```

**总消耗:8 次 KV 写**(3 tenant + 3 apikey + 1 links:self + 1 备),占 Free Plan 日额度 0.8%。

### 步骤 3:Lazy 迁移 link 记录(不主动重写)

**不要**一次性遍历 24 条链接批量改写。改成按需迁移 —— 哪条链接被访问,哪条就顺手补 `tenantId`:

```js
// 在 redirect.js / api.js 读 link 的地方统一加:
const raw = await env.URLS.get(`link:${slug}`);
if (!raw) return null;
const data = JSON.parse(raw);
if (!data.tenantId) {
  data.tenantId = 'self';
  // 异步回写,不阻塞当前请求
  ctx.waitUntil(env.URLS.put(`link:${slug}`, JSON.stringify(data)));
}
```

24 条链接几天内全部被访问过就全迁移完了,写额度消耗被分摊到多日。

### 步骤 4:切换你的工作流

| 场景 | 迁移前 | 迁移后 |
|------|--------|--------|
| Dashboard 登录 | 粘贴 `API_KEY` | 粘贴 `SELF_KEY`(步骤 2 生成) |
| 创建新客户 | 不存在此流程 | `ADMIN_KEY` 调 `POST /api/tenants` |
| 功能测试 | 在 self 数据上测 | 用 `TEST_KEY`,不污染 self |

旧的 `env.API_KEY`(值不变)此时语义变了:它不再是"万能 key",而是 **admin 租户的第一把 key**,只能操作 tenant 记录,不能创建链接。

### 步骤 5:关闭向后兼容(部署后 30 天)

确认所有自己的脚本/书签都切到 `SELF_KEY` 后,移除 `resolveTenant` 里的"旧 API_KEY 自动映射 admin"分支。此时 `env.API_KEY` 完全靠 `apikey:{hash}` 索引被识别为 admin,语义干净。

### 回滚策略

任何一步失败:
- 步骤 0-2 失败:回滚 Worker deploy,数据完全不变(旧代码读 `links:list`,旧 API_KEY 继续用)
- 步骤 3 失败:lazy migration 是每请求独立的,单次失败只影响该请求
- 步骤 5 回滚:重新加上兼容分支即可

**任何时候都不删除旧 `links:list` 键**,保留至少 90 天作为灾备。

---

## 新客户接入流程

```
你(用 ADMIN_KEY)调用:
POST /api/tenants
Authorization: Bearer {ADMIN_KEY}
{
  "id": "newcorp",
  "name": "New Corp",
  "contact": "alice@newcorp.com",
  "quota": { "maxLinks": 200, "maxLinksPerDay": 30 }
}

返回(apiKey 仅此一次展示,服务端只存 hash):
{
  "id": "newcorp",
  "apiKey": "utq_newcorp_a1b2c3d4e5f6...",   ← 给客户这个
  "dashboard": "https://urlteq.com/"
}
```

客户拿到 API key 后,调用方式和你一模一样,粘贴到 dashboard 或 curl 里即可:
```bash
curl -X POST https://urlteq.com/api/shorten \
  -H "Authorization: Bearer utq_newcorp_a1b2c3d4e5f6..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "campaign": "launch"}'
```

> 没有 `?tenant=xxx` 参数 —— 租户身份通过 API key 自动识别。

---

## 容量评估(Free Plan,10-100 用户目标)

### KV 存储(非瓶颈)

| 项目 | 单条大小 | 100 用户 × 200 链接 | Free Plan 上限 |
|------|---------|---------------------|---------------|
| link 记录 | ~250 B | 5 MB | 1 GB |
| tenant 记录 | ~300 B | 30 KB | — |
| apikey 索引 | ~80 B | 24 KB(100 tenant × 3 key) | — |
| links:{tenantId} | ~8 KB(1.6KB/条 × 200) | 总 800 KB | — |

存储富余 3 个数量级,不是瓶颈。

### KV 写/天(**核心瓶颈**)

| 场景 | 创建链接写 | 其他写 | 总计 | 结论 |
|------|-----------|--------|------|------|
| 10 用户,每人每天 5 条 | 100 | ~5 | 105 | ✅ 10% 额度 |
| 30 用户,每人每天 10 条 | 600 | ~15 | 615 | ✅ 62% 额度 |
| 50 用户,每人每天 10 条 | 1000 | ~25 | 1025 | ⚠️ 触顶 |
| 100 用户,每人每天 3 条 | 600 | ~30 | 630 | ✅ 63% 额度 |

> **关键设计:`maxLinksPerDay=30`** 确保任何单租户最多吃 60 写/天(6% 额度)。50 个并发活跃租户即使都跑满日配额也会自己先触限,不会吃爆平台。

### KV 读/天

| 操作 | 频率估算(100 用户) | 读/天 |
|------|-------------------|------|
| 重定向(平均每链接 5 次/天) | 20k 链接 × 5 | 100k ⚠️ |
| Dashboard 加载(N+1 读,每人每天 2 次) | 100 × 2 × 201 | 40k |
| 创建链接(slug 冲突检查 + auth) | 600 × 3 | 1.8k |

> **重定向读是真正的瓶颈。** 如果平均 >5 次/天/链接,需要升级。可选优化:
> - 用 Cache API 缓存热门 slug(重定向路径零 KV 读)
> - 把 click 计数改成 D1(已经在用 D1)

### 结论

| 用户量 | 可行性 | 何时需要升级 |
|--------|-------|-------------|
| 10-30 | ✅ Free Plan 宽裕 | — |
| 30-50 | ✅ 配额设定合理即可 | 监控 KV 写曲线 |
| 50-100 | ⚠️ 需要 `maxLinksPerDay` 限流 + 重定向缓存 | 接近 100k 重定向/天就升级 |
| 100+ | 升级 Workers Paid($5/月),KV 写变无限制 | — |

---

## Test Cases

以下用例是**多租户上线前的最小验收集**。建议其中的 P0 全部做成自动化测试；P1 至少在首轮上线时手工跑一遍。

| ID | Priority | 类别 | 场景 | 预期结果 |
|----|----------|------|------|---------|
| `MT-01` | P0 | Auth | `owner` 用自己的 key 调 `POST /api/shorten` | 返回 200；`link:{slug}` 写入 `tenantId`；slug 进入 `links:{tenantId}` |
| `MT-02` | P0 | Auth | `admin` 用 admin key 调 `POST /api/shorten` / `GET /api/links` | 返回 403；admin 不能直接读写 link 数据 |
| `MT-03` | P0 | Auth | `owner` 用 owner key 调 `POST /api/tenants` / `PATCH /api/tenants/:id` | 返回 403；owner 不能管理 tenant 记录 |
| `MT-04` | P0 | Auth | 同一 tenant 轮换 key 后，旧 key 与新 key 同时调用 owner 接口 | 两把 key 都可用；撤销旧 key 后旧 key 变 401，新 key 继续可用 |
| `MT-05` | P1 | Auth | admin 调 `POST /api/tenants/:id/impersonate` 获取临时 key | 临时 key 仅能访问目标 tenant 数据；到期后 401；产生 audit log |
| `MT-06` | P0 | Tenant Isolation | tenant A 创建 link 后，tenant B 调 `GET /api/links` | tenant B 看不到 tenant A 的 slug / url / clicks |
| `MT-07` | P0 | Tenant Isolation | tenant B 删除 tenant A 的 slug | 返回 404；tenant A 的 KV 记录、list 和 D1 点击数据不变 |
| `MT-08` | P0 | Tenant Isolation | 两个 tenant 同时申请相同 `customSlug` | 第一个成功；第二个返回 409；公开 URL 仍保持全局唯一 |
| `MT-09` | P0 | Quota | tenant 已有 `maxLinks - 1` 条 link，再创建 1 条，再创建第 2 条 | 第 1 次成功；第 2 次返回 quota exceeded；已存在 link 不被覆盖 |
| `MT-10` | P0 | Quota | tenant 今日已用 `29/30`，再调 batch 一次创建 2 条 | **整批失败**；不允许部分成功；`daily_writes` 与 KV list 不发生半写入 |
| `MT-11` | P1 | Quota | `links:{tenantId}` 里混有已过期 slug，但对应 `link:{slug}` 已被 TTL 删除 | quota 检查前会 prune 死链；不会因为脏 list 误判“已满 200 条” |
| `MT-12` | P0 | Redirect / Analytics | 新租户 link 被访问一次 | `clicks` 写入正确的 `tenant_id`；该点击只计入 link 所属 tenant |
| `MT-13` | P0 | Redirect / Analytics | 已过期 link 被访问 | 返回 404；KV 中的 `link:{slug}` 被清理；后续 list 读取会把死 slug 剔除 |
| `MT-14` | P0 | Redirect / Analytics | 删除或过期后的 slug 被重新创建 | 必须满足选定策略：若“slug 不复用”则返回 409；若允许复用则 clicks 不串线、旧 tenant 数据不泄露 |
| `MT-15` | P0 | Migration | 存量 `links:list` + 无 `tenantId` 的旧 link 在迁移后读取 | 旧 link 视为 `tenantId: "self"`；`GET /api/links` 可正常返回；旧数据不丢失 |
| `MT-16` | P1 | Migration | 旧 link 首次被 `redirect.js` / `api.js` 读取 | 请求正常完成；后台 lazy backfill 把 `tenantId: "self"` 写回 KV |
| `MT-17` | P1 | Migration | 迁移期使用旧 `API_KEY` 调用旧工作流 | 行为必须与最终确定的兼容策略一致：若映射 admin，则 owner 接口应明确失败；若要求“零行为变化”，则需先提供 `SELF_KEY` 切换窗口并验证 |
| `MT-18` | P1 | Lifecycle | 删除 tenant 后尝试复用同一个 `tenantId` 创建新 tenant | 必须满足选定策略：若 `tenantId` 不可复用则返回冲突；若允许复用则 ownership 不能继承旧 link 数据 |
| `MT-19` | P1 | Cron | cron 扫描多个 tenant 的 `links:{tenantId}`，只给 24h 内过期且 `notified=false` 的 link 发提醒 | 邮件只发一次；`notified` 正确回写；不会漏扫非 self tenant |
| `MT-20` | P1 | Rollback | 部署双读兼容版本后回滚到旧 Worker | 旧 `links:list` 与旧 `API_KEY` 仍可工作；新种下的 tenant 数据不会破坏旧路径 |

**建议的自动化拆分：**

- `unit`: `resolveTenant`、`requireRole`、`checkQuota`、`bumpDailyCounter`
- `integration`: `POST /api/shorten`、`POST /api/shorten/batch`、`GET /api/links`、`DELETE /api/links/:slug`、`GET /{slug}`、cron
- `migration smoke`: 步骤 0-5 各跑一遍最短 happy path，尤其验证 `self` 继承老数据和旧 key 兼容策略

---

## 文件改动清单

| 文件 | 改动 |
|------|------|
| `src/handlers/api.js` | `checkAuth` → `resolveTenant` + `requireRole`;所有 link 端点加租户隔离;新增 `/api/tenants` 系列;quota 检查 |
| `src/handlers/redirect.js` | **小改动** —— lazy 补 tenantId;写 D1 clicks 时带 tenantId |
| `src/handlers/cron.js` | 遍历所有租户的 `links:{tenantId}`(或改用 D1 存活跃 slug 以省 KV 读) |
| `src/utils/tenant.js` | 新文件 —— tenant CRUD、API key 生成、sha256(+pepper)、role 常量 |
| `src/utils/quota.js` | 新文件 —— `checkQuota` + `bumpDailyCounter` |
| `migrations/0002_multi_tenant.sql` | clicks 加 `tenant_id`(DEFAULT 'self');新建 `daily_writes` 表 |
| `scripts/seed-tenants.js` | 一次性迁移脚本(步骤 2);生成 self + test key 并种 admin |
| `wrangler.toml` | 新增 `KEY_PEPPER` secret 声明 |
| `src/frontend/index.js` | **MVP 阶段零改动**(租户粘贴自己的 key 就能用现有 UI) |

## 不改的文件 / 不改的行为

- **公开重定向 URL 完全不变** —— 所有现有 `urlteq.com/{slug}` 继续工作
- **现有 `API_KEY` 继续能用**(迁移期映射到 admin;30 天后语义精确化)
- **现有 KV 数据不删除不改写**(lazy migration + 保留旧 `links:list` 90 天)
- **前端 UI 不强制改动**(第 2 次评审中提到的租户名/配额显示属于增强,不阻塞多租户上线)
