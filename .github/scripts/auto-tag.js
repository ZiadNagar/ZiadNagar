const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 🔑 YOUR CATEGORIZATION RULES (NO CHANGES NEEDED - PRE-VERIFIED)
const RULES = [
  { topic: "management-systems", keywords: ["hrm", "management", "employee", "hospital", "pos", "restaurant"] },
  { topic: "ai-lab-agent-stack", keywords: ["agent", "llm", "ai", "langchain", "prompt", "mcp", "claud", "agent framework"] },
  { topic: "profile-branding-assets", keywords: ["profile", "branding", "icon", "gif", "portfolio", "cv"] },
  { topic: "ui-kits-page-builders", keywords: ["ui kit", "component", "design system", "shadcn", "framer motion", "tailwind", "gsap"] },
  { topic: "dev-knowledge-library", keywords: ["book", "learning", "tutorial", "course", "cheat sheet", "reference"] },
  { topic: "dev-setup-power-tools", keywords: ["cli", "tool", "setup", "starter", "vscode", "editor", "zsh"] },
  { topic: "motion-portfolio-playgrounds", keywords: ["animation", "motion", "slider", "3d", "interactive", "playground"] },
  { topic: "career-job-launchpad", keywords: ["interview", "career", "job", "resume", "leetcode"] },
  { topic: "saas-dashboards-full-apps", keywords: ["saas", "dashboard", "app", "production", "e-commerce", "crm"] },
  { topic: "personal-apps-media-stack", keywords: ["personal", "media", "music", "video", "streaming"] }
];

async function main() {
  const { data: user } = await octokit.users.getAuthenticated();
  const starredRepos = [];
  
  // Fetch ALL starred repos (handles pagination)
  let page = 1;
  while (true) {
    const { data } = await octokit.activity.listReposStarredByUser({
      username: user.login,
      per_page: 100,
      page
    });
    if (data.length === 0) break;
    starredRepos.push(...data);
    page++;
  }

  for (const repo of starredRepos) {
    try {
      // Skip if already tagged
      const { data: repoDetails } = await octokit.repos.get({
        owner: repo.owner.login,
        repo: repo.name
      });
      
      const existingTopics = new Set(repoDetails.topics || []);
      if (RULES.some(r => existingTopics.has(r.topic))) continue;

      // Categorize using your verified rules
      const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
      const matchedRule = RULES.find(rule => 
        rule.keywords.some(kw => text.includes(kw.toLowerCase()))
      );

      if (matchedRule) {
        await octokit.repos.replaceTopics({
          owner: repo.owner.login,
          repo: repo.name,
          names: [...existingTopics, matchedRule.topic]
        });
        console.log(`✅ Tagged: ${repo.owner.login}/${repo.name} → ${matchedRule.topic}`);
      }
    } catch (error) {
      console.error(`❌ Failed: ${repo.owner.login}/${repo.name}`, error.message);
    }
  }
}

main();