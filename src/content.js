/**
 * Content for Threshold: the reasons people reach for the app, a few
 * research-backed facts for each, and one tiny activity per reason.
 *
 * Full citations live in docs/research-sources.md. Facts are paraphrased
 * and kept short on purpose: they need to land in about five seconds.
 */
window.ThresholdContent = {
  reasons: [
    {
      id: 'bored',
      label: 'Bored',
      facts: [
        'In one study, people who first did a dull task (copying phone numbers) then came up with more creative ideas than people who hadn’t. Boredom can be a runway.',
        'When asked to sit alone with their thoughts for 15 minutes, many participants chose to give themselves a mild electric shock instead. Sitting with nothing is genuinely hard; it’s not just you.',
        'Researchers describe boredom as a signal, not a void: it tells you your current activity isn’t meeting your goals, and nudges you to switch.',
      ],
      activity: 'reaction',
    },
    {
      id: 'lonely',
      label: 'Lonely',
      facts: [
        'A large review of 148 studies found that people with stronger social relationships had about a 50% greater likelihood of survival over the study periods.',
        'In experiments, passively scrolling a feed lowered how good people felt, while actively talking to someone did not have that effect.',
        'Even small chats with “weak ties” (a barista, a neighbour) are linked to feeling happier and more connected that day.',
      ],
      activity: 'reachOut',
    },
    {
      id: 'avoiding',
      label: 'Avoiding something',
      facts: [
        'Psychologists increasingly see procrastination as a mood-repair move: we dodge the task to dodge the feeling it gives us.',
        'Students who forgave themselves for procrastinating before one exam procrastinated less before the next one. Kindness works better than guilt.',
        '“When X happens, I will do Y” plans (implementation intentions) reliably help people actually start.',
      ],
      activity: 'nameIt',
    },
    {
      id: 'comparing',
      label: 'Comparing myself',
      facts: [
        'Social comparison theory (1954) says we judge ourselves by looking at others. Feeds hand us an endless supply of people to compare against.',
        'Studies link frequent upward comparison on social media (looking at people who seem better off) with lower self-esteem.',
        'You’re comparing your behind-the-scenes to everyone else’s highlight reel. The feed is edited; your day isn’t.',
      ],
      activity: 'didWell',
    },
    {
      id: 'habit',
      label: 'Just habit',
      facts: [
        'Roughly 40% of what people do each day is done out of habit, often while thinking about something else.',
        'In one study, forming a new habit took a median of 66 days, with a huge range (18 to 254). Missing a day didn’t derail it.',
        'Habits are cued by context. Changing the cue (like the icon you tap) is one of the most effective ways to break the loop. That’s what you just did.',
      ],
      activity: 'stretch',
    },
  ],

  targets: {
    instagram: { label: 'Instagram', openUrl: 'https://www.instagram.com/', verb: 'open Instagram' },
    series: { label: 'your series', openUrl: null, verb: 'start the next episode' },
  },
};
