# 瀬戸浦たそがれナイトマーケット アンケート

GitHub Pagesで公開できる静的フォームです。

## ローカル確認

```bash
cd tasogare-survey
python3 -m http.server 4173
```

ブラウザで `http://localhost:4173` を開きます。

## GitHub Pages公開

1. GitHubで新しい公開リポジトリを作成する
2. この `tasogare-survey` フォルダの中身をリポジトリにアップロードする
3. GitHubの `Settings > Pages` を開く
4. `Deploy from a branch` を選ぶ
5. `main` ブランチ、`/root` を選んで保存する

数分後に `https://ユーザー名.github.io/リポジトリ名/` で公開されます。

## Googleスプレッドシート保存

回答先スプレッドシート:

https://docs.google.com/spreadsheets/d/17LkpQ3nOngEGmZFwQJXcMkbYIdd7Sx2vGDQ2lB0hdLQ

現在はデモ送信です。`apps-script/Code.gs` をGoogle Apps Scriptに貼り付けてWebアプリとしてデプロイし、発行されたWebアプリURLを `script.js` の先頭に入れます。

```js
const SUBMIT_ENDPOINT = "Google Apps ScriptのWebアプリURL";
```

URLを入れると、回答データをJSONで送信する仕様になります。

デプロイ設定:

- 種類: ウェブアプリ
- 次のユーザーとして実行: 自分
- アクセスできるユーザー: 全員
