function pimg(n,c){
  const m={"Hot Chocolate":"latte","Matcha Latte":"matcha","Fresh Orange Juice":"juice","Lemon Mint":"juice","Chocolate Brownie":"brownie","Chocolate Cookies":"cookies","Croissant":"croissant","Chicken Wrap":"wrap","Chicken Sandwich":"sandwich","Turkey & Cheese Sandwich":"sandwich","Club Sandwich":"sandwich"};
  const byCat={hot:"latte",cold:"iced",other:"matcha",dessert:"cake",snack:"sandwich"};
  return "img/"+(m[n]||byCat[c])+".jpg";
}
// بيانات البداية (تتخزن في المتصفح وتتعدل من لوحة التحكم)
const SEED = {
  settings: {
    nameEn: "RIWAQ CAFÉ", nameAr: "رِواق كافيه",
    phone: "+20 100 000 0027", whatsapp: "201000000027", email: "hello@riwaqcafe.com",
    address: "12 شارع الجامعة، الحي السابع، الشيخ زايد، الجيزة، مصر",
    hours: ["يومياً من 8 صباحاً حتى 12 منتصف الليل", "الخميس والجمعة حتى 1 صباحاً"],
    social: { instagram: "https://instagram.com/", facebook: "https://facebook.com/", tiktok: "https://tiktok.com/" },
    mapQuery: "Sheikh Zayed City Giza Egypt",
    deliveryFee: 30,
    heroTitle: "مساحة هادئة وقهوة مختلفة",
    heroText: "قهوة مختصة، حلويات طازجة، وأجواء تناسب شغلك ودراستك ولقاءاتك.",
    heroImage: "img/storefront.jpg"
  },
  categories: [
    { id: "hot", name: "القهوة الساخنة", icon: "☕" },
    { id: "cold", name: "القهوة الباردة", icon: "🧊" },
    { id: "other", name: "مشروبات أخرى", icon: "🍵" },
    { id: "dessert", name: "الحلويات", icon: "🍰" },
    { id: "snack", name: "وجبات خفيفة", icon: "🥪" }
  ],
  products: [
    ["Espresso","hot",65,"شوت إسبريسو غني بطبقة كريما ذهبية.",1],
    ["Double Espresso","hot",85,"شوتين إسبريسو لبداية قوية.",0],
    ["Americano","hot",85,"إسبريسو مع ماء ساخن، خفيف وصافي.",0],
    ["Cappuccino","hot",105,"إسبريسو وحليب مبخّر ورغوة كثيفة.",1],
    ["Flat White","hot",115,"حليب مخملي مع إسبريسو مضاعف.",0],
    ["Spanish Latte","hot",125,"لاتيه بحليب مكثف محلّى، ناعم وحلو.",1],
    ["Caramel Macchiato","hot",130,"حليب وفانيليا وإسبريسو وصوص كراميل.",0],
    ["Mocha","hot",125,"إسبريسو مع شوكولاتة وحليب.",0],
    ["Iced Americano","cold",90,"إسبريسو على تلج، منعش.",0],
    ["Iced Latte","cold",110,"إسبريسو وحليب بارد على تلج.",1],
    ["Iced Spanish Latte","cold",130,"النسخة الباردة من السبانش لاتيه.",1],
    ["Iced Caramel Latte","cold",135,"لاتيه بارد بصوص كراميل.",0],
    ["Cold Brew","cold",120,"قهوة مخمّرة على البارد 18 ساعة.",0],
    ["Iced Mocha","cold",130,"موكا باردة بشوكولاتة غنية.",0],
    ["Matcha Latte","other",135,"ماتشا يابانية مع حليب ناعم.",1],
    ["Hot Chocolate","other",110,"شوكولاتة ساخنة كثيفة.",0],
    ["Fresh Orange Juice","other",95,"برتقال طازج معصور عند الطلب.",0],
    ["Lemon Mint","other",90,"ليمون ونعناع، بارد ومنعش.",0],
    ["Classic Cheesecake","dessert",145,"تشيز كيك كلاسيك بقاعدة بسكويت.",1],
    ["Chocolate Brownie","dessert",115,"براوني شوكولاتة دافئ وغني.",0],
    ["Lotus Cake","dessert",135,"كيك لوتس بكريمة ناعمة.",1],
    ["Chocolate Cookies","dessert",75,"كوكيز بقطع الشوكولاتة.",0],
    ["Croissant","dessert",85,"كرواسون زبدة مقرمش.",0],
    ["Chicken Sandwich","snack",165,"صدور دجاج وخضار وصوص خاص.",0],
    ["Turkey & Cheese Sandwich","snack",155,"رومي مدخن وجبنة على خبز طازج.",0],
    ["Club Sandwich","snack",185,"ساندوتش كلوب بثلاث طبقات.",1],
    ["Chicken Wrap","snack",160,"راب دجاج مشوي بصوص ثوم.",0]
  ].map((p,i)=>({id:"p"+(i+1),name:p[0],cat:p[1],price:p[2],desc:p[3],popular:!!p[4],available:true,image:pimg(p[0],p[1])})),
  sizes: [{n:"صغير",add:0},{n:"وسط",add:15},{n:"كبير",add:30}],
  extras: [{n:"شوت إضافي",add:20},{n:"سيرب (فانيليا / كراميل)",add:15},{n:"حليب شوفان",add:25},{n:"كريمة مخفوقة",add:10}],
  offers: [
    {id:"o1",title:"ساعة الصباح",text:"أي قهوة ساخنة + كرواسون بسعر مميز من 8 إلى 11 صباحاً.",tag:"كل يوم"},
    {id:"o2",title:"باقة الدراسة",text:"قهوة + براوني + مكان هادئ للمذاكرة. خصم للطلبة بكارنيه الجامعة.",tag:"للطلاب"},
    {id:"o3",title:"اطلب لصحابك",text:"اطلب 4 مشروبات واحصل على الخامس مجاناً في الطلبات من الفرع.",tag:"للمجموعات"}
  ],
  events: [
    {id:"e1",title:"أمسية موسيقية هادئة",date:"الخميس القادم، 8 مساءً",text:"جلسة عود وجيتار مع قهوتك المفضلة."},
    {id:"e2",title:"ورشة تحضير القهوة المختصة",date:"السبت القادم، 5 مساءً",text:"تتعلم تحضر V60 وإسبريسو في البيت. الأماكن محدودة."},
    {id:"e3",title:"ليلة قراءة",date:"الأحد القادم، 7 مساءً",text:"هات كتابك واقرا وسط ناس بتحب القراءة."}
  ],
  gallery: [
    {id:"g1",cap:"واجهة رِواق",image:"img/storefront.jpg"},{id:"g2",cap:"قهوة بالذات",image:"img/latte.jpg"},{id:"g3",cap:"المساحة الداخلية",image:"img/interior.jpg"},
    {id:"g4",cap:"جلسة هادئة للقاءات",image:"img/lounge.jpg"},{id:"g5",cap:"حلويات طازجة",image:"img/cake.jpg"},{id:"g6",cap:"كرواسون الصباح",image:"img/croissant.jpg"},{id:"g7",cap:"مشروبات باردة",image:"img/iced.jpg"},{id:"g8",cap:"اطلب واستلم",image:"img/takeaway.jpg"}
  ],
  faq: [
    ["هل الأسعار شاملة الضريبة؟","الأسعار المعروضة بالجنيه المصري وهي نفس أسعار الفرع."],
    ["هل في توصيل؟","أيوه، متاح توصيل داخل الشيخ زايد برسوم ثابتة تظهر قبل تأكيد الطلب، أو استلام من الفرع."],
    ["إزاي أحجز طاولة؟","من صفحة حجز الطاولات اختار اليوم والوقت وعدد الأشخاص، وهنأكد معاك على الواتساب."],
    ["هل المكان مناسب للشغل والمذاكرة؟","أيوه، فيه إنترنت وأماكن هادئة وشواحن."],
    ["ممكن أحجز مناسبة خاصة؟","أكيد، ابعت طلب من صفحة الفعاليات ونرد عليك."],
    ["إزاي ألغي أو أعدل طلب؟","كلمنا واتساب على نفس رقم الطلب في أسرع وقت قبل بدء التحضير."]
  ]
};
