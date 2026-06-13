export interface DripEmail {
  id: string;
  dayOffset: number;
  subject: string;
  preheader: string;
  html: string;
}

const BASE_URL = "https://agentcodeacademy.com";

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; }
  a { color: #2563eb; }
  .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  h1, h2 { color: #0f172a; }
  .highlight { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
</style>
</head>
<body>${body}
<div class="footer">
  <p>Agent Code Academy &mdash; Learn AI-assisted coding with Claude Code</p>
  <p><a href="${BASE_URL}">agentcodeacademy.com</a></p>
</div>
</body></html>`;
}

export const DRIP_SEQUENCE: DripEmail[] = [
  {
    id: "welcome",
    dayOffset: 0,
    subject: "Your AI Coding Cheat Sheet is ready",
    preheader: "Plus: start Week 1 of the course right now",
    html: wrap(`
<h1>Welcome to Agent Code Academy!</h1>
<p>Thanks for joining. Here's your cheat sheet:</p>
<p><a class="btn" href="${BASE_URL}/ai-coding-cheat-sheet.pdf">Download Cheat Sheet (PDF)</a></p>
<p>This covers the essential Claude Code commands, shortcuts, and workflows you'll use every day.</p>

<h2>Your next step</h2>
<p>Week 1 is free and takes about 2 hours. By the end, you'll have Claude Code installed and writing real code:</p>
<p><a class="btn" href="${BASE_URL}/week/1">Start Week 1 &rarr;</a></p>

<p>Over the next few weeks, I'll send you practical tips and insights to help you get the most out of AI-assisted coding. No spam, just useful stuff.</p>
<p>Talk soon,<br>Agent Code Academy</p>`),
  },
  {
    id: "mistake",
    dayOffset: 2,
    subject: "The #1 mistake new Claude Code users make",
    preheader: "It costs hours of frustration (and it's easy to avoid)",
    html: wrap(`
<h1>The #1 mistake with Claude Code</h1>
<p>After teaching hundreds of developers, I see the same pattern:</p>
<div class="highlight">
  <strong>They treat Claude Code like a search engine.</strong><br>
  They type vague prompts like "make this better" and wonder why the output is generic.
</div>
<p>The fix is simple: <strong>give Claude Code context.</strong></p>
<ul>
  <li>Use <code>CLAUDE.md</code> files to tell Claude about your project</li>
  <li>Reference specific files: "refactor the auth middleware in <code>src/auth.ts</code>"</li>
  <li>State the <em>why</em>, not just the what: "this function is slow because it queries the DB in a loop"</li>
</ul>
<p>Week 2 of the course covers this in depth with hands-on exercises:</p>
<p><a class="btn" href="${BASE_URL}/week/2">Read Week 2: Effective Prompting &rarr;</a></p>
<p>This one change will 10x your productivity with Claude Code.</p>`),
  },
  {
    id: "story",
    dayOffset: 5,
    subject: "From \"I can't code\" to shipping a SaaS in 3 weeks",
    preheader: "What's possible when you learn AI-assisted coding",
    html: wrap(`
<h1>What AI-assisted coding actually looks like</h1>
<p>A month ago, a student started Week 1 with zero coding experience.</p>
<p>Three weeks later, they had:</p>
<ul>
  <li>A working SaaS app with user authentication</li>
  <li>Stripe payments integrated</li>
  <li>Deployed to production on Vercel</li>
  <li>Their first paying customer</li>
</ul>
<p>This isn't an outlier. It's what happens when you combine structured learning with the most powerful AI coding tool available.</p>
<div class="highlight">
  <strong>The curriculum is auto-updated weekly</strong> with the latest Claude Code features. You're always learning the current best practices, not last year's tutorials.
</div>
<p>Weeks 1-4 are free. See for yourself:</p>
<p><a class="btn" href="${BASE_URL}/week/1">Start the Free Weeks &rarr;</a></p>`),
  },
  {
    id: "preview",
    dayOffset: 8,
    subject: "What you'll build in Weeks 5-12 (preview)",
    preheader: "MCP servers, AI agents, production apps, and more",
    html: wrap(`
<h1>Here's what's behind the Pro paywall</h1>
<p>If you've finished (or started) the free weeks, here's what comes next:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px"><strong>Week 5-6</strong></td><td style="padding:8px">Full-stack app with auth, database, and API routes</td></tr>
  <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px"><strong>Week 7-8</strong></td><td style="padding:8px">Production testing, CI/CD, and deployment pipelines</td></tr>
  <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px"><strong>Week 9-10</strong></td><td style="padding:8px">Build MCP servers that extend Claude Code's capabilities</td></tr>
  <tr><td style="padding:8px"><strong>Week 11-12</strong></td><td style="padding:8px">Multi-agent AI systems with sub-agent nesting</td></tr>
</table>
<p>Each week includes hands-on projects, exercises, and quizzes. By Week 12, you'll have built a portfolio of production-grade projects.</p>
<div class="highlight">
  <strong>Launch pricing: $49</strong> (one-time, lifetime access). This will increase to $99 once we reach 200 students.
</div>
<p><a class="btn" href="${BASE_URL}/pricing">See Full Details &rarr;</a></p>`),
  },
  {
    id: "roi",
    dayOffset: 12,
    subject: "Is the Pro course worth $49?",
    preheader: "Let's do the math together",
    html: wrap(`
<h1>Let's talk ROI</h1>
<p>A few numbers:</p>
<ul>
  <li><strong>Coding bootcamps</strong> charge $5,000-15,000 for similar content</li>
  <li><strong>AI coding skills</strong> command $150+/hour freelance rates</li>
  <li><strong>One hour saved</strong> by knowing the right Claude Code workflow pays for the entire course</li>
</ul>
<p>And unlike bootcamps, this course:</p>
<ul>
  <li>Updates automatically every week with the latest features</li>
  <li>Is self-paced &mdash; learn on your schedule</li>
  <li>Comes with a 30-day money-back guarantee</li>
  <li>Includes lifetime access and all future content</li>
</ul>
<div class="highlight">
  <strong>The question isn't whether you can afford $49.</strong><br>
  It's whether you can afford to spend months figuring out AI coding through scattered YouTube videos and outdated tutorials.
</div>
<p><a class="btn" href="${BASE_URL}/pricing">Get Pro Access &mdash; $49 &rarr;</a></p>`),
  },
  {
    id: "urgency",
    dayOffset: 16,
    subject: "Launch pricing won't last",
    preheader: "Lock in $49 before it becomes $99",
    html: wrap(`
<h1>Quick update on pricing</h1>
<p>When we launched Agent Code Academy, we set the Pro course at <strong>$49</strong> &mdash; half the regular price of $99.</p>
<p>That launch pricing is still available, but it won't last forever. Once we reach 200 students, the price goes up.</p>
<p><strong>What you get for $49:</strong></p>
<ul>
  <li>All 12 weeks (Weeks 5-12 are Pro-only)</li>
  <li>Lifetime access &mdash; including every future update</li>
  <li>Certificate of completion</li>
  <li>Priority email support</li>
  <li>30-day money-back guarantee</li>
</ul>
<p>No subscription. No upsells. One payment, done.</p>
<p><a class="btn" href="${BASE_URL}/pricing">Lock In $49 Now &rarr;</a></p>
<p style="font-size:13px;color:#64748b">If you've already purchased Pro, thank you! Ignore this email.</p>`),
  },
  {
    id: "final",
    dayOffset: 21,
    subject: "Quick question about your coding goals",
    preheader: "I'd genuinely like to know",
    html: wrap(`
<h1>What's holding you back?</h1>
<p>I noticed you signed up for Agent Code Academy a few weeks ago, but haven't gone Pro yet.</p>
<p>I'm curious &mdash; is there something specific holding you back?</p>
<ul>
  <li>Not sure if the course is right for your level?</li>
  <li>Wondering if AI coding is worth learning?</li>
  <li>Need to see more of what's included?</li>
  <li>Something else entirely?</li>
</ul>
<p><strong>Just reply to this email.</strong> I read every response and I'm happy to help figure out if this is right for you.</p>
<p>Either way, the free weeks (1-4) are yours forever. And if you do decide to go Pro, the launch price of $49 is still available:</p>
<p><a class="btn" href="${BASE_URL}/pricing">View Pro Details &rarr;</a></p>
<p>Best,<br>Agent Code Academy</p>`),
  },
];
