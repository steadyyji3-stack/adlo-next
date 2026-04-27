// Path C：mock data。AI API key 到位後此檔可廢棄，由 /api/post-writer/generate 取代。

export type PostCategory =
  | '節慶'
  | '教育'
  | '客戶見證'
  | '幕後'
  | '新品'
  | '促銷'
  | 'QA';

export type Industry =
  | '餐飲'
  | '美髮美容'
  | '醫美'
  | '牙科'
  | '律師'
  | '補教'
  | '零售'
  | '其他';

export interface GeneratedPost {
  day: string; // 週一 / 週二 / ...
  category: PostCategory;
  title: string;
  content: string;
  bestTime: string;
  imageHint: string;
}

export interface PostWriterInput {
  storeName: string;
  industry: Industry;
  weekTheme?: string;
}

// 產業專屬語感詞（簡單客製化）
const industryFlavor: Record<Industry, { craft: string; signature: string; verb: string }> = {
  餐飲: { craft: '揉麵糰', signature: '一道湯一道菜', verb: '吃' },
  美髮美容: { craft: '洗剪吹', signature: '一頭好髮', verb: '剪' },
  醫美: { craft: '療程設計', signature: '一張自然臉', verb: '做' },
  牙科: { craft: '蛀牙修補', signature: '一口好牙', verb: '檢查' },
  律師: { craft: '訴狀草擬', signature: '一份穩的合約', verb: '看' },
  補教: { craft: '教案設計', signature: '一堂課的細節', verb: '上' },
  零售: { craft: '選品', signature: '一件耐用的東西', verb: '挑' },
  其他: { craft: '日常工作', signature: '一份用心做的服務', verb: '體驗' },
};

export function mockGeneratePosts(input: PostWriterInput): GeneratedPost[] {
  const name = input.storeName.trim() || '我們';
  const theme = input.weekTheme?.trim() || '';
  const f = industryFlavor[input.industry] ?? industryFlavor['其他'];

  const themeLine = theme
    ? `本週重點：${theme}。`
    : '';

  const posts: GeneratedPost[] = [
    {
      day: '週一',
      category: '節慶',
      title: '新的一週，先看一眼這個',
      content: `禮拜一通常很忙，但有件事想先讓你知道——${themeLine}${name}這週的營業時間沒變，平日 11:00–21:00、週末延長到 22:00。如果你有打算這週繞過來，提前打電話訂位最保險（連假可能客滿）。順手把這篇存起來，晚一點要找的時候就不用滑訊息。`,
      bestTime: '09:00',
      imageHint: '店面外觀 + 招牌特寫，採自然光，避免店內凌亂背景',
    },
    {
      day: '週二',
      category: '教育',
      title: `為什麼${f.craft}要當天現做`,
      content: `常被問：「${f.craft}前一晚先做好不行嗎？」答案是不行。理由很單純：放隔夜，質感差太多。我們在${name}做這行第幾年了不是重點，重點是只要走過這條捷徑一次，客人下次就會發現。${f.craft}是${f.signature}的根本，省這個等於把招牌賠掉。所以你來吃的，從凌晨就開始準備了。`,
      bestTime: '12:30',
      imageHint: '師傅工作中的手部特寫（麵糰、剪刀、儀器），不要露臉',
    },
    {
      day: '週三',
      category: '客戶見證',
      title: '謝謝這位客人寫的這段',
      content: `「來了三次，第一次是同事推薦，第二次帶家人，第三次自己一個人。每次${f.verb}完都覺得值。」——這是上週收到的 Google 評論，五顆星。我們看到的時候有點不好意思（真的有這麼好嗎），但也很感激。會被人記得三次，是${name}做這行最想要的事。如果你${f.verb}過覺得 OK，留個評論告訴我們，下次來${f.verb}就直接認得你。`,
      bestTime: '18:30',
      imageHint: '客人滿意的手勢或環境氛圍照（不露臉），暖色調為主',
    },
    {
      day: '週四',
      category: '幕後',
      title: '${name}的早晨，從這裡開始',
      content: `每天 5:00 開店之前，${name}的師傅已經開始備料。${f.craft}的步驟看起來簡單，但其實每一個動作的時間差都會影響最後的口感／效果。我們不會把這些寫在菜單上，因為說了也沒人想看。但你${f.verb}起來會感覺到差別——這就是這份工作存在的理由。${themeLine ? '本週特別忙，如果你想避開人潮，建議避開週末中午。' : ''}`,
      bestTime: '20:00',
      imageHint: '清晨/開店前的店內準備畫面，光線從窗戶斜射進來最好',
    },
    {
      day: '週五',
      category: '新品',
      title: '這週開始，多了這個選擇',
      content: `${themeLine || `${name}這週新增了一個新品項。`}說新也不是真的新，是試了三個月、改了五版才確定要放上菜單的。價格不便宜，但我們覺得值——你${f.verb}過會懂。先放在週末限定，反應好的話下個月排到固定菜單。想搶先試的人，週五晚到週日都有。記得早點來，量沒做太多。`,
      bestTime: '17:00',
      imageHint: '新品的特寫照（45 度角拍最有食慾／質感），背景單純',
    },
    {
      day: '週六',
      category: '促銷',
      title: '週末來${name}，多送這個',
      content: `週末通常是最忙的兩天，但${name}決定還是要做點不一樣的——這個週六、週日，${input.industry === '餐飲' ? '兩人同行第二份主餐打 8 折' : '預約滿一定金額加贈一個小服務'}。沒有花俏的條件，沒有要你加 LINE，沒有要你註冊會員。${themeLine}揪一下身邊的人，這週末來坐一下。座位有限，建議先打電話訂。`,
      bestTime: '11:00',
      imageHint: '兩個人/兩個位置一起的畫面，傳達「揪人」的氛圍',
    },
    {
      day: '週日',
      category: 'QA',
      title: '常被問：可以外帶／預約嗎',
      content: `每週都會被問同一題：${input.industry === '餐飲' ? '「可以外帶嗎？」答案是可以，但建議先打電話，我們會幫你預備好你${f.verb}起來才不會涼掉。' : `「可以線上預約嗎？」答案是可以，Google 商家頁面點「預約」就會跳到我們的訂位系統，3 分鐘搞定。`}另外有人問「沒預約直接過去 OK 嗎」——平日 OK，週末會等。${name}座位/時段有限，先預約最不會白跑。`,
      bestTime: '14:00',
      imageHint: '電話/手機/預約系統介面截圖，乾淨單張為佳',
    },
  ];

  return posts.map((p) => ({
    ...p,
    title: p.title.replace(/\$\{name\}/g, name),
    content: p.content.replace(/\$\{name\}/g, name),
  }));
}
