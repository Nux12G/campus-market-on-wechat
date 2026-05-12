校园闲置交换平台 - 使用说明

1. 项目结构

- campus-market-mp
  微信小程序前端
- campus-market-server
  Node/Nest 后端原型
- campus-market-docs
  文档目录

2. 上传到 GitHub 后，使用者需要自己配置的内容

2.1 微信小程序

- 自己的小程序 AppID
- 小程序项目根目录：
  d:\beta2\campus-market-mp
- 需要自行修改文件：
  campus-market-mp/project.config.json
  把 appid 改成自己的

2.2 后端环境变量

本仓库不包含真实环境变量，只保留模板：

- campus-market-server/.env.example
- campus-market-server/.env.dev.example
- campus-market-server/.env.test.example
- campus-market-server/.env.prod.example

需要自行复制并填写真实值，例如：

- 数据库地址
- 数据库账号密码
- JWT_SECRET
- 管理员编号白名单

3. 本地启动方式

3.1 后端

进入目录：
cd d:\beta2\campus-market-server

安装依赖：
npm install

启动开发服务：
npm run dev

3.2 小程序前端

微信开发者工具导入目录：
d:\beta2\campus-market-mp

注意不要导入 d:\beta2 根目录。

4. 当前项目状态

- 当前仓库仍然是原型版
- 已完成大部分前台业务链路
- 已完成管理员第一版能力
- 正在规划迁移到微信云开发 CloudBase

5. 当前默认说明

- 前端请求地址目前仍是本地地址：
  http://127.0.0.1:3000/api
- 如果要在真机、测试环境或生产环境使用，需要自行改成真实服务地址

6. 当前管理员逻辑说明

- 当前原型阶段管理员身份仍是 mock 方式
- 正式版计划改为：
  使用 openid 白名单识别管理员

7. 图片与头像说明

- 用户头像：
  当前使用系统内置头像选择
- 商品图片：
  当前支持上传
  后续正式版建议接入云存储与图片审核

8. GitHub 上传前建议再次确认

- 不要上传 node_modules
- 不要上传 dist
- 不要上传真实 .env 文件
- 不要上传 project.private.config.json
- 确认 project.config.json 中没有真实 AppID

9. 推荐下一步

如果继续开发正式版，建议优先做：

- 迁移到微信云开发 CloudBase
- 使用 openid 建立真实登录体系
- 数据从 mock 改为数据库/云数据库持久化

