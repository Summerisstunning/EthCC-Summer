# 🚀 AA Sharing 开发环境设置指南

## 📁 背景图片配置

### 图片存放位置
请将您的4张背景图片上传到以下位置：

```
frontend/public/images/
├── hero-bg.jpg          # 主页背景图 (推荐尺寸: 1920x1080)
├── gratitude-bg.jpg     # 感恩记录页背景 (推荐尺寸: 1920x1080)
├── wallet-bg.jpg        # 钱包页面背景 (推荐尺寸: 1920x1080)
└── dashboard-bg.jpg     # 仪表板背景 (推荐尺寸: 1920x1080)
```

### 图片要求
- **格式**: JPG, PNG, WebP
- **尺寸**: 建议 1920x1080 或更高
- **文件大小**: 建议小于 2MB 以确保加载速度
- **风格**: 温暖、柔和的色调，符合应用的感恩和爱的主题

### 使用方式
图片会作为背景显示，并带有渐变遮罩以确保文字的可读性：
- 自动添加半透明的粉色到紫色渐变遮罩
- 响应式设计，适配各种屏幕尺寸
- 自动优化加载性能

## 🛠️ 开发环境选项

### 选项1: 仅前端开发 (推荐)
如果您只需要测试前端功能：

```bash
cd frontend
npm run dev
```

- ✅ 所有UI功能正常工作
- ✅ Privy登录认证
- ✅ 模拟API数据
- ✅ 页面流程测试

### 选项2: 完整开发环境
如果您需要真实的后端和数据库：

#### 2.1 使用Docker (推荐)
```bash
# 安装Docker Desktop
# 然后运行：
docker-compose up
```

#### 2.2 手动安装
```bash
# 1. 安装PostgreSQL
brew install postgresql  # macOS
# 或
sudo apt-get install postgresql  # Linux

# 2. 创建数据库
createdb aa_sharing

# 3. 安装Go
brew install go  # macOS
# 或从 https://golang.org/dl/ 下载

# 4. 启动后端
cd backend
go mod tidy
go run cmd/main.go

# 5. 启动前端
cd frontend
npm run dev
```

## 🔧 环境变量配置

### 前端 (.env.local)
```bash
NEXT_PUBLIC_PRIVY_APP_ID=cmcpxoxlb0131l20n42brnl2b
NEXT_PUBLIC_FLOW_ACCESS_API=https://rest-testnet.onflow.org
NEXT_PUBLIC_API_URL=http://localhost:8080  # 仅当使用真实后端时
```

### 后端 (.env)
```bash
DATABASE_URL=postgres://user:password@localhost/aa_sharing?sslmode=disable
JWT_SECRET=your-jwt-secret-key-change-this-in-production
PORT=8080
GIN_MODE=debug
```

## 📱 测试功能

### 当前可测试的功能：
1. **Privy认证流程**
   - 邮箱注册/登录
   - 自动钱包创建
   - 用户信息显示

2. **完整用户流程**
   - 主页 → 登录 → 感恩记录 → 钱包贡献 → 仪表板

3. **数据持久化**
   - 感恩记录保存（模拟）
   - 钱包余额更新
   - 目标进度跟踪

4. **UI/UX功能**
   - 响应式设计
   - 动画效果
   - 表单验证
   - 背景图片

## 🌐 下一步集成

### 即将完成的功能：
- [ ] Flow智能合约集成
- [ ] 真实的区块链交易
- [ ] Avail Nexus跨链支持
- [ ] 实时钱包余额更新
- [ ] NFT记忆铸造

## 🐛 故障排除

### 常见问题：

1. **Privy登录失败**
   - 检查App ID是否正确
   - 确保网络连接正常

2. **图片不显示**
   - 确认图片路径正确
   - 检查文件格式和大小

3. **构建错误**
   - 清除node_modules: `rm -rf node_modules && npm install`
   - 检查Node.js版本: `node --version` (需要18+)

## 📞 支持

如遇问题，请：
1. 检查浏览器控制台错误
2. 查看终端输出
3. 在GitHub提交Issue: https://github.com/Summerisstunning/EthCC-Summer/issues