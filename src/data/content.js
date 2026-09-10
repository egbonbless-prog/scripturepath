export const LESSONS = [
  {
    id: "daily-grace",
    title: "Grace That Teaches Us",
    category: "Faith",
    book: "Ephesians",
    passage: "Ephesians 2:8-10",
    difficulty: "beginner",
    keyVerses: ["Ephesians 2:8-10"],
    summary: "God's grace is received by faith and leads to a life shaped by good works.",
    scripture: "Scripture focus: Paul teaches that salvation is a gift from God, not a trophy earned by human effort.",
    explanation: "This passage separates the root and the fruit of Christian life. Grace is the root: God acts generously first. Good works are the fruit: believers respond with a changed life.",
    application: "Today, notice where you are trying to earn worth. Practice receiving God's grace with humility, then choose one concrete act of love.",
    reflection: "Where do I need to move from proving myself to trusting God's grace?",
    tags: ["grace", "faith", "salvation", "identity"],
    quizId: "quiz-grace"
  },
  {
    id: "daily-prayer",
    title: "Learning to Pray Simply",
    category: "Prayer",
    book: "Matthew",
    passage: "Matthew 6:9-13",
    difficulty: "beginner",
    keyVerses: ["Matthew 6:9-13"],
    summary: "Jesus teaches prayer that begins with God, asks for daily needs, seeks forgiveness, and depends on protection.",
    scripture: "Scripture focus: The Lord's Prayer gives a pattern for honest, God-centered prayer.",
    explanation: "The prayer is not only words to repeat. It is a structure for relationship: worship, surrender, dependence, confession, and trust.",
    application: "Pray in five short movements today: praise, surrender, request, confession, and trust.",
    reflection: "Which part of prayer do I usually rush past?",
    tags: ["prayer", "jesus", "discipleship"],
    quizId: "quiz-prayer"
  },
  {
    id: "daily-wisdom",
    title: "The Beginning of Wisdom",
    category: "Wisdom",
    book: "Proverbs",
    passage: "Proverbs 1:1-7",
    difficulty: "beginner",
    keyVerses: ["Proverbs 1:7"],
    summary: "Biblical wisdom begins with reverence for God and grows through teachability.",
    scripture: "Scripture focus: Proverbs presents wisdom as skill for faithful living before God.",
    explanation: "Wisdom in the Bible is practical. It shapes speech, money, relationships, work, anger, and choices. Reverence for God gives wisdom its direction.",
    application: "Before one decision today, pause and ask: What choice would be wise, humble, and faithful?",
    reflection: "Where do I need to become more teachable?",
    tags: ["wisdom", "proverbs", "choices"],
    quizId: "quiz-wisdom"
  },
  {
    id: "daily-forgiveness",
    title: "Forgiveness and Mercy",
    category: "Forgiveness",
    book: "Luke",
    passage: "Luke 15:11-32",
    difficulty: "intermediate",
    keyVerses: ["Luke 15:20", "Luke 15:32"],
    summary: "The parable of the lost son shows mercy for the repentant and a challenge to the resentful.",
    scripture: "Scripture focus: Jesus tells of a father who runs toward a returning son and pleads with an angry older son.",
    explanation: "The story addresses two kinds of lostness: obvious rebellion and hidden resentment. The father moves toward both sons with mercy.",
    application: "Ask whether you identify more with the younger son, the older son, or the father in this season.",
    reflection: "What would mercy look like in one relationship this week?",
    tags: ["forgiveness", "mercy", "parables", "jesus"],
    quizId: "quiz-forgiveness"
  },
  {
    id: "daily-jesus",
    title: "Who Jesus Is",
    category: "Jesus",
    book: "John",
    passage: "John 1:1-18",
    difficulty: "intermediate",
    keyVerses: ["John 1:14"],
    summary: "John introduces Jesus as the Word who reveals God and brings grace and truth.",
    scripture: "Scripture focus: John says the Word became flesh and lived among us.",
    explanation: "John connects Jesus with creation, light, life, revelation, and God's presence. The passage invites readers to see Jesus as more than a teacher.",
    application: "Read the passage slowly and note every image used for Jesus: Word, life, light, Son, grace, truth.",
    reflection: "Which image of Jesus in John 1 stands out to me, and why?",
    tags: ["jesus", "john", "gospel", "incarnation"],
    quizId: "quiz-jesus"
  }
];

export const TOPICS = [
  "Faith",
  "Prayer",
  "Jesus",
  "Wisdom",
  "Forgiveness",
  "Old Testament",
  "New Testament",
  "Parables"
];

export const BOOKS = [
  {
    name: "Genesis",
    testament: "Old Testament",
    summary: "Genesis introduces creation, human rebellion, covenant, and the family of Abraham through whom blessing is promised.",
    themes: ["creation", "covenant", "promise", "family"],
    keyPassages: ["Genesis 1", "Genesis 12", "Genesis 50:20"]
  },
  {
    name: "Exodus",
    testament: "Old Testament",
    summary: "Exodus tells how God delivers Israel from slavery, forms them as a covenant people, and dwells among them.",
    themes: ["deliverance", "law", "presence", "worship"],
    keyPassages: ["Exodus 3", "Exodus 12", "Exodus 20"]
  },
  {
    name: "Psalms",
    testament: "Old Testament",
    summary: "Psalms is Israel's prayer book, giving language for praise, lament, trust, confession, and hope.",
    themes: ["prayer", "worship", "lament", "hope"],
    keyPassages: ["Psalm 1", "Psalm 23", "Psalm 51"]
  },
  {
    name: "Proverbs",
    testament: "Old Testament",
    summary: "Proverbs gathers wisdom sayings that train readers in faithful, practical living.",
    themes: ["wisdom", "speech", "discipline", "justice"],
    keyPassages: ["Proverbs 1", "Proverbs 3", "Proverbs 31"]
  },
  {
    name: "Matthew",
    testament: "New Testament",
    summary: "Matthew presents Jesus as Messiah and teacher, emphasizing the kingdom of heaven and fulfilled promise.",
    themes: ["kingdom", "messiah", "teaching", "discipleship"],
    keyPassages: ["Matthew 5-7", "Matthew 13", "Matthew 28"]
  },
  {
    name: "Luke",
    testament: "New Testament",
    summary: "Luke highlights Jesus' compassion, the work of the Spirit, prayer, and good news for outsiders and the poor.",
    themes: ["mercy", "spirit", "prayer", "salvation"],
    keyPassages: ["Luke 4", "Luke 10", "Luke 15"]
  },
  {
    name: "John",
    testament: "New Testament",
    summary: "John invites readers to believe in Jesus as the Son of God who gives life.",
    themes: ["belief", "life", "light", "love"],
    keyPassages: ["John 1", "John 3", "John 20"]
  },
  {
    name: "Romans",
    testament: "New Testament",
    summary: "Romans explains sin, grace, faith, righteousness, life in the Spirit, and transformed community.",
    themes: ["gospel", "grace", "faith", "spirit"],
    keyPassages: ["Romans 3", "Romans 8", "Romans 12"]
  }
];

export const READING_PLANS = [
  {
    id: "john-seven",
    title: "Seven Days in John",
    durationDays: 7,
    difficulty: "beginner",
    description: "Meet Jesus through seven short readings in John's Gospel.",
    days: [
      "John 1:1-18",
      "John 2:1-11",
      "John 3:1-21",
      "John 4:1-26",
      "John 10:1-18",
      "John 15:1-17",
      "John 20:1-31"
    ]
  },
  {
    id: "wisdom-seven",
    title: "Seven Days of Wisdom",
    durationDays: 7,
    difficulty: "beginner",
    description: "A simple path through Proverbs and practical wisdom.",
    days: [
      "Proverbs 1:1-7",
      "Proverbs 3:1-12",
      "Proverbs 4:20-27",
      "Proverbs 10:1-12",
      "Proverbs 15:1-18",
      "Proverbs 16:1-9",
      "Proverbs 31:8-9"
    ]
  }
];

export const QUIZZES = [
  {
    id: "quiz-grace",
    title: "Grace Quiz",
    lessonId: "daily-grace",
    questions: [
      {
        prompt: "According to Ephesians 2:8-10, grace is received through what?",
        choices: ["Faith", "Status", "Wealth", "Family background"],
        answerIndex: 0,
        explanation: "Paul says grace is received through faith, and even this is God's gift."
      }
    ]
  },
  {
    id: "quiz-prayer",
    title: "Prayer Quiz",
    lessonId: "daily-prayer",
    questions: [
      {
        prompt: "The Lord's Prayer begins by focusing on whom?",
        choices: ["Enemies", "God the Father", "Personal success", "Religious leaders"],
        answerIndex: 1,
        explanation: "Jesus begins with God: Our Father in heaven, hallowed be your name."
      }
    ]
  },
  {
    id: "quiz-wisdom",
    title: "Wisdom Quiz",
    lessonId: "daily-wisdom",
    questions: [
      {
        prompt: "In Proverbs, wisdom is best understood as what?",
        choices: ["Trivia", "Practical faithful living", "Winning arguments", "Secret knowledge"],
        answerIndex: 1,
        explanation: "Biblical wisdom is skill for living faithfully before God."
      }
    ]
  },
  {
    id: "quiz-forgiveness",
    title: "Forgiveness Quiz",
    lessonId: "daily-forgiveness",
    questions: [
      {
        prompt: "In Luke 15, the father shows mercy to which son?",
        choices: ["Only the younger son", "Only the older son", "Both sons", "Neither son"],
        answerIndex: 2,
        explanation: "The father runs to the younger son and pleads with the older son."
      }
    ]
  },
  {
    id: "quiz-jesus",
    title: "Jesus Quiz",
    lessonId: "daily-jesus",
    questions: [
      {
        prompt: "John 1 describes Jesus with which image?",
        choices: ["The Word", "A Roman governor", "A temple tax", "A city wall"],
        answerIndex: 0,
        explanation: "John opens by describing Jesus as the Word who was with God and became flesh."
      }
    ]
  }
];
