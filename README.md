## 快速挑诗歌

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### 介绍
通过对诗歌关键词的挑选，找出诗歌敬拜中想要的歌曲。
> * 后端：[Label Studio](https://github.com/heartexlabs/label-studio)
> * 前端：NodeJS, React

### 构建
> * 通过 Docker 构建
> ```shell
> docker build -t hymns-picker:latest -f ./Dockerfile .
> ```

### 初始化
> * 启动 Label Studio
> ```shell
> docker run -it -d -p 8080:8080 -v $(pwd)/hymns-picker-data:/label-studio/data --name label-studio heartexlabs/label-studio:latest
> ```
> * 在 Label Studio 界面上注册并新建项目
> * 拷贝 token
> * 导入诗歌标签等数据
> ```shell
> curl -H "Content-Type: application/json" -H "Authorization: Token 123456" -X PATCH -d @./dep/basic_labels.json http://localhost:8080/api/projects/1 -v
> curl -H "Content-Type: application/json" -H "Authorization: Token 123456" -X POST -d @./dep/new_labels.json http://localhost:8080/api/labels -v
> curl -H 'Authorization: Token 123456' -X POST 'http://localhost:8080/api/projects/1/import' -F 'file=@./dep/song_names.csv'
> ```

### 运行
> * 同时启动后端（Label Studio）和前端（本项目）
> ```shell
> REACT_APP_HYMNS_PICKER_TOKEN=123456 docker-compose up -d
> ```
> * 分别启动
> ```shell
> docker run -it -d -p 8080:8080 -v $(pwd)/hymns-picker-data:/label-studio/data --name label-studio heartexlabs/label-studio:latest
> export REACT_APP_HYMNS_PICKER_TOKEN=123456
> npm start
> ```

### 目标
> * 1 ~ 3 分钟内找出诗歌

### 注意事项
> * 当前本项目中的资源仅适用浸信会诗歌的挑选
> * 鉴于 Label Studio API 的有限性且没有为之接入任何后端来处理标签数据，本项目通过遍历来查找目标，故有性能问题，且随着关键词增多而更明显。

### 一些脚本
#### `npm start`

#### `npm test`

#### `npm run build`

