export type SwimAnalysisPage = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intent: string;
  uploadTips: string[];
  scoringFocus: string[];
  useCases: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const swimAnalysisPages: SwimAnalysisPage[] = [
  {
    slug: 'ai-swim-analysis',
    title: 'AI Swim Analysis - Upload Swim Photos or Videos',
    h1: 'AI Swim Analysis for Faster Technique Feedback',
    description:
      'Upload swim photos or short videos and get AI-assisted feedback on body position, stroke timing, and technique habits.',
    intent:
      'Use this page when you want a quick second opinion on swim form before booking a coach or waiting for poolside video review.',
    uploadTips: [
      'Use a clear side-view clip or photo with the full body visible.',
      'Record 5-10 seconds of steady swimming when using video analysis.',
      'Avoid heavy splash, lane ropes blocking the body, or extreme zoom.',
      'Choose freestyle or breaststroke clips first for the most useful feedback.',
    ],
    scoringFocus: [
      'Body alignment and head position',
      'Arm entry timing and extension',
      'Hip stability and rotation',
      'Kick rhythm and visible balance issues',
    ],
    useCases: [
      'Self-coached swimmers checking recurring technique problems',
      'Age-group swimmers comparing weekly progress videos',
      'Triathletes reviewing freestyle efficiency between coached sessions',
      'Parents helping young swimmers understand visual feedback',
    ],
    faqs: [
      {
        question: 'Can AI replace a swim coach?',
        answer:
          'No. AI analysis is best used as fast visual feedback between coaching sessions. A qualified coach is still important for in-person correction and safety.',
      },
      {
        question: 'What makes a good upload for AI swim analysis?',
        answer:
          'A side-view photo or short video with the swimmer clearly visible usually works best. The more visible the joints and body line are, the more useful the analysis can be.',
      },
    ],
  },
  {
    slug: 'freestyle-stroke-analysis',
    title: 'Freestyle Stroke Analysis - Check Front Crawl Technique',
    h1: 'Freestyle Stroke Analysis for Front Crawl Form',
    description:
      'Analyze freestyle swim technique with AI-assisted feedback on body line, arm entry, rotation, and kick timing.',
    intent:
      'Freestyle swimmers usually search for stroke analysis when they feel slow, tired, or unbalanced despite training more.',
    uploadTips: [
      'Record from the side so arm recovery, head position, hips, and legs are visible.',
      'Capture at least one full breathing cycle if possible.',
      'Keep the camera steady and parallel to the lane.',
      'Choose a clip where the swimmer is moving at normal training pace.',
    ],
    scoringFocus: [
      'Head position during breathing',
      'Long body line and hip height',
      'Arm entry width and extension',
      'Rotation consistency and kick support',
    ],
    useCases: [
      'Triathletes trying to reduce drag in open-water preparation',
      'Adult swimmers learning more efficient front crawl',
      'Competitive swimmers reviewing video between coached sets',
      'Beginners checking whether breathing disrupts body position',
    ],
    faqs: [
      {
        question: 'What is the most common freestyle issue visible in video?',
        answer:
          'Dropped hips, lifting the head to breathe, and crossing over at entry are common visual issues that can often be spotted from a side or front-side angle.',
      },
      {
        question: 'Should I upload underwater or above-water freestyle video?',
        answer:
          'Both can help. Above-water side view is easier to record, while underwater side view can reveal body line, kick, and catch details more clearly.',
      },
    ],
  },
  {
    slug: 'swim-video-analysis',
    title: 'Swim Video Analysis - Review Stroke Technique Online',
    h1: 'Swim Video Analysis for Stroke Technique Review',
    description:
      'Use short swim videos to review stroke mechanics, body position, and visible technique patterns with AI-assisted coaching notes.',
    intent:
      'Video gives more context than a single photo because it captures timing, rhythm, and movement patterns across multiple strokes.',
    uploadTips: [
      'Use 5-10 second clips rather than long workouts.',
      'Keep the swimmer centered in frame throughout the clip.',
      'Film one stroke type at a time for clearer feedback.',
      'Use landscape orientation when possible for side-view clips.',
    ],
    scoringFocus: [
      'Timing changes across multiple strokes',
      'Repeatable body alignment habits',
      'Breathing rhythm and balance',
      'Frame-by-frame technique checkpoints',
    ],
    useCases: [
      'Comparing before-and-after clips after a drill block',
      'Preparing focused questions for a swim coach',
      'Reviewing technique when training alone',
      'Tracking whether a correction stays consistent over time',
    ],
    faqs: [
      {
        question: 'How long should a swim analysis video be?',
        answer:
          'A short 5-10 second clip is usually enough for a focused first pass. Longer clips can be harder to interpret and slower to upload.',
      },
      {
        question: 'Can I analyze race footage?',
        answer:
          'Race footage can help if the swimmer is visible and not blocked by other lanes, but clean training footage is usually better for technique review.',
      },
    ],
  },
  {
    slug: 'swim-stroke-checker',
    title: 'Swim Stroke Checker - Online Technique Feedback',
    h1: 'Online Swim Stroke Checker for Technique Feedback',
    description:
      'Check visible swim stroke issues online with AI-assisted feedback for body position, balance, and stroke mechanics.',
    intent:
      'This page is for swimmers who want a quick form check before deciding what drill or coaching feedback to focus on next.',
    uploadTips: [
      'Upload one swimmer at a time.',
      'Use bright lighting and avoid heavy splash when possible.',
      'Choose a representative stroke rather than a push-off or finish moment.',
      'Use the same camera angle over time to compare progress.',
    ],
    scoringFocus: [
      'Visible posture and alignment',
      'Stroke symmetry and timing',
      'Common drag patterns',
      'Actionable coaching cues',
    ],
    useCases: [
      'Quick weekly form checks',
      'Remote technique review preparation',
      'Drill selection after identifying a likely issue',
      'Progress tracking for self-coached swimmers',
    ],
    faqs: [
      {
        question: 'What strokes can I check online?',
        answer:
          'StrokeLab is strongest when the uploaded media clearly shows the swimmer. Freestyle and breaststroke are the best first choices for focused analysis.',
      },
      {
        question: 'Do I need special equipment?',
        answer:
          'No. A phone camera is enough if the swimmer is visible, the angle is steady, and the clip is short and clear.',
      },
    ],
  },
];

export function getSwimAnalysisPage(slug: string) {
  return swimAnalysisPages.find((page) => page.slug === slug);
}
