window.SALESFORCE_GLOSSARY = [
  {
    term: "オブジェクト",
    english: "Object",
    category: "基本",
    aliases: ["標準オブジェクト", "カスタムオブジェクト"],
    definition: "同じ種類の情報をまとめる箱です。表計算のシートやデータベースの表に近い考え方です。"
  },
  {
    term: "レコード",
    english: "Record",
    category: "基本",
    aliases: [],
    definition: "オブジェクトに保存される1件分のデータです。取引先オブジェクトなら、1社分の情報が1レコードです。"
  },
  {
    term: "項目",
    english: "Field",
    category: "基本",
    aliases: ["フィールド"],
    definition: "レコードを構成する入力欄です。会社名、電話番号、金額などを保存します。"
  },
  {
    term: "取引先",
    english: "Account",
    category: "基本",
    aliases: ["Account", "アカウント"],
    definition: "取引相手となる企業や組織を管理する標準オブジェクトです。"
  },
  {
    term: "取引先責任者",
    english: "Contact",
    category: "基本",
    aliases: ["Contact", "コンタクト"],
    definition: "取引先に所属する担当者や個人を管理する標準オブジェクトです。"
  },
  {
    term: "リード",
    english: "Lead",
    category: "基本",
    aliases: ["Lead"],
    definition: "まだ取引先や商談として確定していない、見込み顧客の情報です。"
  },
  {
    term: "商談",
    english: "Opportunity",
    category: "基本",
    aliases: ["Opportunity"],
    definition: "成立を目指して進めている販売案件を、金額やフェーズとともに管理する標準オブジェクトです。"
  },
  {
    term: "ケース",
    english: "Case",
    category: "基本",
    aliases: ["Case"],
    definition: "顧客からの問い合わせやサポート依頼を管理する標準オブジェクトです。"
  },
  {
    term: "キャンペーン",
    english: "Campaign",
    category: "基本",
    aliases: ["Campaign"],
    definition: "展示会やメール施策などのマーケティング活動と、その成果を管理します。"
  },
  {
    term: "キャンペーンメンバー",
    english: "Campaign Member",
    category: "基本",
    aliases: [],
    definition: "キャンペーンに参加しているリードまたは取引先責任者です。"
  },
  {
    term: "プロファイル",
    english: "Profile",
    category: "アクセス",
    aliases: ["Profile"],
    definition: "ユーザーが利用できるオブジェクト、項目、アプリ、ログイン条件などの基本権限をまとめたものです。"
  },
  {
    term: "権限セット",
    english: "Permission Set",
    category: "アクセス",
    aliases: ["Permission Set", "権限セットグループ"],
    definition: "プロファイルの権限に追加して、特定のユーザーへ必要な権限を付与する仕組みです。"
  },
  {
    term: "ロール",
    english: "Role",
    category: "アクセス",
    aliases: ["ロール階層", "Role Hierarchy"],
    definition: "主にレコードの参照範囲を組織階層に沿って広げるための仕組みです。職務権限そのものではありません。"
  },
  {
    term: "組織の共有設定",
    english: "Organization-Wide Defaults",
    category: "アクセス",
    aliases: ["OWD", "デフォルトの内部アクセス", "共有設定"],
    definition: "レコードをどこまで非公開にするかを決める、共有の基準となる設定です。"
  },
  {
    term: "共有ルール",
    english: "Sharing Rule",
    category: "アクセス",
    aliases: ["Sharing Rule"],
    definition: "組織の共有設定よりも広い範囲へ、条件や所有者に基づいてレコードを共有します。"
  },
  {
    term: "公開グループ",
    english: "Public Group",
    category: "アクセス",
    aliases: ["Public Group"],
    definition: "ユーザー、ロール、ほかのグループをまとめ、共有ルールなどの対象にできる集合です。"
  },
  {
    term: "キュー",
    english: "Queue",
    category: "アクセス",
    aliases: ["Queue"],
    definition: "対応前のレコードを複数ユーザーで共有し、メンバーが引き受けられるようにする仕組みです。"
  },
  {
    term: "項目レベルセキュリティ",
    english: "Field-Level Security",
    category: "アクセス",
    aliases: ["FLS", "項目権限"],
    definition: "ユーザーが特定の項目を参照または編集できるかを制御します。"
  },
  {
    term: "レコードタイプ",
    english: "Record Type",
    category: "アクセス",
    aliases: ["Record Type"],
    definition: "同じオブジェクトで、業務プロセス、選択リスト値、ページレイアウトを使い分ける仕組みです。"
  },
  {
    term: "ページレイアウト",
    english: "Page Layout",
    category: "アクセス",
    aliases: ["Page Layout"],
    definition: "レコード画面に表示する項目、関連リスト、ボタンなどを設定します。"
  },
  {
    term: "フロー",
    english: "Flow",
    category: "自動化",
    aliases: ["Flow Builder", "フロービルダー"],
    definition: "画面案内やレコード更新など、Salesforce上の処理を自動化する中心的な機能です。"
  },
  {
    term: "レコードトリガーフロー",
    english: "Record-Triggered Flow",
    category: "自動化",
    aliases: ["レコードトリガー型フロー", "レコードトリガフロー"],
    definition: "レコードの作成、更新、削除をきっかけに自動実行されるフローです。"
  },
  {
    term: "画面フロー",
    english: "Screen Flow",
    category: "自動化",
    aliases: ["スクリーンフロー"],
    definition: "ユーザーに入力画面を表示し、手順に沿って処理を進めるフローです。"
  },
  {
    term: "承認プロセス",
    english: "Approval Process",
    category: "自動化",
    aliases: ["承認申請"],
    definition: "申請、承認、却下の流れと、各段階で行う処理を定義します。"
  },
  {
    term: "入力規則",
    english: "Validation Rule",
    category: "自動化",
    aliases: ["Validation Rule", "検証ルール"],
    definition: "保存時に条件を確認し、不正な値ならエラーメッセージを表示して保存を止めます。"
  },
  {
    term: "数式項目",
    english: "Formula Field",
    category: "自動化",
    aliases: ["数式フィールド", "クロスオブジェクト数式"],
    definition: "ほかの項目などを使って値を自動計算し、結果を表示する読み取り専用の項目です。"
  },
  {
    term: "積み上げ集計項目",
    english: "Roll-Up Summary Field",
    category: "自動化",
    aliases: ["積み上げ集計"],
    definition: "主従関係にある子レコードの件数、合計、最小値、最大値を親レコードへ集計します。"
  },
  {
    term: "メールアラート",
    english: "Email Alert",
    category: "自動化",
    aliases: ["Email Alert"],
    definition: "テンプレートと宛先を指定し、自動化からメールを送るアクションです。"
  },
  {
    term: "ワークフロールール",
    english: "Workflow Rule",
    category: "自動化",
    aliases: ["Workflow"],
    definition: "条件に応じて処理を実行する旧来の自動化機能です。新しい自動化では通常フローを検討します。"
  },
  {
    term: "プロセスビルダー",
    english: "Process Builder",
    category: "自動化",
    aliases: ["Process Builder"],
    definition: "条件分岐を使う旧来の自動化機能です。新規の自動化では通常フローを使用します。"
  },
  {
    term: "Lightning Experience",
    english: "Lightning Experience",
    category: "画面",
    aliases: ["Lightning", "LEX"],
    definition: "現在のSalesforceの標準ユーザーインターフェースです。"
  },
  {
    term: "Lightningアプリケーションビルダー",
    english: "Lightning App Builder",
    category: "画面",
    aliases: ["アプリケーションビルダー"],
    definition: "コンポーネントを配置して、アプリページ、ホームページ、レコードページを作成します。"
  },
  {
    term: "Lightningレコードページ",
    english: "Lightning Record Page",
    category: "画面",
    aliases: ["レコードページ"],
    definition: "Lightning Experienceでレコードを表示する画面です。コンポーネントの配置や表示条件を設定できます。"
  },
  {
    term: "動的フォーム",
    english: "Dynamic Forms",
    category: "画面",
    aliases: ["Dynamic Forms"],
    definition: "項目やセクションをLightningページ上に直接配置し、条件に応じて表示を変えられる機能です。"
  },
  {
    term: "パス",
    english: "Path",
    category: "画面",
    aliases: ["Salesforce Path"],
    keywords: ["Salesforce パス", "パスを設定", "パスの設定", "販売フェーズ"],
    definition: "商談などの段階を上部に表示し、各段階で重要な項目やガイダンスを示します。"
  },
  {
    term: "クイックアクション",
    english: "Quick Action",
    category: "画面",
    aliases: ["グローバルアクション", "オブジェクト固有のアクション"],
    definition: "レコード作成、更新、メール送信などを少ない操作で実行できるボタンです。"
  },
  {
    term: "ユーティリティバー",
    english: "Utility Bar",
    category: "画面",
    aliases: ["Utility Bar"],
    definition: "Lightningアプリの画面下部から、メモや履歴などのツールをすぐ開ける領域です。"
  },
  {
    term: "データローダ",
    english: "Data Loader",
    category: "データ",
    aliases: ["Data Loader"],
    definition: "大量のレコードをインポート、更新、エクスポート、削除できるクライアントツールです。"
  },
  {
    term: "データインポートウィザード",
    english: "Data Import Wizard",
    category: "データ",
    aliases: ["インポートウィザード"],
    definition: "ブラウザ上の案内に従い、対応オブジェクトへ比較的少量のデータを取り込む機能です。"
  },
  {
    term: "外部ID",
    english: "External ID",
    category: "データ",
    aliases: ["External ID"],
    definition: "外部システムの識別子を保存し、照合や更新時のキーとして利用できる項目です。"
  },
  {
    term: "重複ルール",
    english: "Duplicate Rule",
    category: "データ",
    aliases: ["Duplicate Rule"],
    definition: "重複候補が見つかったときに、保存を許可するかブロックするかを決めます。"
  },
  {
    term: "一致ルール",
    english: "Matching Rule",
    category: "データ",
    aliases: ["照合ルール", "Matching Rule"],
    definition: "どの項目をどう比較して重複候補と判断するかを定義します。"
  },
  {
    term: "一括処理",
    english: "Mass Action",
    category: "データ",
    aliases: ["一括更新", "一括削除"],
    definition: "複数のレコードに対して、同じ更新や削除などをまとめて行う操作です。"
  },
  {
    term: "レポート",
    english: "Report",
    category: "分析",
    aliases: ["Report"],
    definition: "条件に合うレコードを一覧、集計、グループ化して分析する機能です。"
  },
  {
    term: "ダッシュボード",
    english: "Dashboard",
    category: "分析",
    aliases: ["Dashboard"],
    definition: "複数のレポート結果をグラフや数値として1画面にまとめます。"
  },
  {
    term: "レポートタイプ",
    english: "Report Type",
    category: "分析",
    aliases: ["カスタムレポートタイプ"],
    definition: "レポートで利用できるオブジェクト、関連、項目の範囲を決めます。"
  },
  {
    term: "バケット項目",
    english: "Bucket Field",
    category: "分析",
    aliases: ["バケット列"],
    definition: "レポート内で値を独自の区分にまとめるための項目です。元データは変更しません。"
  },
  {
    term: "結合レポート",
    english: "Joined Report",
    category: "分析",
    aliases: ["Joined Report"],
    definition: "異なるレポートタイプの情報を複数のブロックとして1つのレポートに表示します。"
  },
  {
    term: "割り当てルール",
    english: "Assignment Rule",
    category: "サービス",
    aliases: ["リード割り当てルール", "ケース割り当てルール"],
    definition: "条件に基づいて、新しいリードやケースの所有者を自動決定します。"
  },
  {
    term: "自動レスポンスルール",
    english: "Auto-Response Rule",
    category: "サービス",
    aliases: ["自動応答ルール"],
    definition: "受け付けたリードやケースに対して、条件に応じた自動返信メールを送ります。"
  },
  {
    term: "エスカレーションルール",
    english: "Escalation Rule",
    category: "サービス",
    aliases: ["Escalation Rule"],
    definition: "未解決のケースを一定時間後に別の担当者や上位担当へ引き継ぎます。"
  },
  {
    term: "Web-to-Lead",
    english: "Web-to-Lead",
    category: "サービス",
    aliases: ["Web-to-リード"],
    definition: "Webフォームから送信された見込み顧客情報をSalesforceのリードとして登録します。"
  },
  {
    term: "Web-to-Case",
    english: "Web-to-Case",
    category: "サービス",
    aliases: ["Web-to-ケース"],
    definition: "Webフォームから送信された問い合わせをSalesforceのケースとして登録します。"
  },
  {
    term: "Email-to-Case",
    english: "Email-to-Case",
    category: "サービス",
    aliases: ["メール-to-ケース"],
    definition: "指定アドレスに届いたメールからケースを自動作成します。"
  },
  {
    term: "Chatter",
    english: "Chatter",
    category: "サービス",
    aliases: ["チャター", "フィード"],
    definition: "Salesforce内で投稿、コメント、ファイル共有などを行うコラボレーション機能です。"
  },
  {
    term: "ナレッジ",
    english: "Salesforce Knowledge",
    category: "サービス",
    aliases: ["Knowledge", "ナレッジ記事"],
    definition: "よくある質問や解決手順などの記事を作成、公開、検索する機能です。"
  },
  {
    term: "サンドボックス",
    english: "Sandbox",
    category: "環境",
    aliases: ["Sandbox"],
    definition: "本番組織の設定やデータを複製して、開発、テスト、研修に使う別環境です。"
  },
  {
    term: "本番組織",
    english: "Production Organization",
    category: "環境",
    aliases: ["本番環境", "Production"],
    definition: "実際の業務でユーザーが利用し、本番データを保存するSalesforce組織です。"
  },
  {
    term: "変更セット",
    english: "Change Set",
    category: "環境",
    aliases: ["送信変更セット", "受信変更セット"],
    definition: "関連するSalesforce組織間で、設定内容をまとめて移送する仕組みです。"
  },
  {
    term: "AppExchange",
    english: "AppExchange",
    category: "環境",
    aliases: ["アプリエクスチェンジ"],
    definition: "Salesforce向けのアプリやコンポーネントなどを探して導入できるマーケットプレイスです。"
  },
  {
    term: "多要素認証",
    english: "Multi-Factor Authentication",
    category: "セキュリティ",
    aliases: ["MFA", "2要素認証"],
    definition: "パスワードに加えて別の確認手段を使い、本人確認を強化する仕組みです。"
  },
  {
    term: "信頼済みIP範囲",
    english: "Trusted IP Range",
    category: "セキュリティ",
    aliases: ["ログインIP範囲", "IP範囲"],
    definition: "ログイン元として信頼する、またはログインを許可するIPアドレスの範囲です。"
  },
  {
    term: "ログイン時間",
    english: "Login Hours",
    category: "セキュリティ",
    aliases: ["ログイン可能時間"],
    definition: "プロファイルごとに、ユーザーがSalesforceへログインできる曜日と時間帯を制限します。"
  },
  {
    term: "監査証跡",
    english: "Setup Audit Trail",
    category: "セキュリティ",
    aliases: ["設定変更履歴", "Setup Audit Trail"],
    definition: "管理者が行った設定変更の内容、実行者、日時を確認できる履歴です。"
  },
  {
    term: "ごみ箱",
    english: "Recycle Bin",
    category: "データ",
    aliases: ["Recycle Bin"],
    definition: "削除したレコードを一定期間保管し、必要に応じて復元できる場所です。"
  }
];
