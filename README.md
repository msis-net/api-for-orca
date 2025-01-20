# API for ORCA

#### 開発

開発時は、svelte4/apps/　または　 avelte5/apps 　に遷移してからコマンドを実行してください。

```
# フォルダ構成
apiorca/
├─svelte4
│  └─apps/★
│      ├─prisma
│      ├─src
│      └─static
└─svelte5
    └─apps/★
        ├─prisma
        ├─src
        └─static
# */apps/に移動してから
# 初回
npm install

# データベースganerate
npx prisma generate
```

### Docker 検証

```
# 作業場所:apiorca/
docker-compose up -d --build

# 接続:末尾のポート番号が違います。
### svelte4
http://0.0.0.0:3004

### svelte5
http://0.0.0.0:3005
```
