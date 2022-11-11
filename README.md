## 快速挑诗歌

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### 介绍
通过对诗歌关键词的挑选，找出诗歌敬拜中想要的歌曲。
> * 后端：[Label Studio](https://github.com/heartexlabs/label-studio)
> * 前端：React

### 安装
> * ```shell
>   # 启动 Label Studio 容器
>   docker run --rm -p 8080:8080 -v `pwd`/hymns_picker:/label-studio/hymns_picker --name label-studio heartexlabs/label-studio:latest
>   ```
> * 在 Label Studio 界面上注册并新建项目
> * 拷贝 Label Studio 中的 token 并设置其为本地环境变量 REACT_APP_HYMNS_PICKER_TOKEN
> * ```shell
>   export REACT_APP_HYMNS_PICKER_TOKEN=123456
>   ```
> * ```shell
>   # 导入诗歌标签等数据
>   curl -H "Content-Type: application/json" -H "Authorization: Token 123456" -X PATCH -d @./dep/basic_labels.json http://localhost:8080/api/projects/1 -v
>   curl -H "Content-Type: application/json" -H "Authorization: Token 123456" -X POST -d @./dep/new_labels.json http://localhost:8080/api/labels -v
>   curl -H 'Authorization: Token 123456' -X POST 'http://localhost:8080/api/projects/1/import' -F 'file=@./dep/song_names.csv'
>   ```

### 目标
> * 1 ~ 3 分钟内找出诗歌

### 注意事项
> * 当前本项目中的资源仅适用浸信会诗歌的挑选
> * 鉴于 Label Studio API 的有限性，本项目通过遍历来查找目标，故有性能问题，且随着关键词增多而更明显。

### 一些脚本
#### `npm start`

#### `npm test`

#### `npm run build`

