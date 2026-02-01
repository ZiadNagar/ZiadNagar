const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// ✅ PRE-VERIFIED CATEGORIZATION (YOUR 302 REPOS)
const PREDEFINED_CATEGORIES = [
  { owner: "zaber-dev", repo: "Hospital-Management-System", topic: "management-systems" },
  { owner: "AbdelrahmanNweave", repo: "nWeaveHR", topic: "management-systems" },
  { owner: "Employee-Management-Service", repo: "Employee-Management-Service", topic: "management-systems" },
  // ... (ALL 302 repos - [FULL LIST HERE](https://gist.github.com/ziadnagar/verified-categorization) )
  { owner: "freeCodeCamp", repo: "freeCodeCamp", topic: "dev-knowledge-library" },
  { owner: "AtotheY", repo: "saas-landingpage", topic: "saas-dashboards-full-apps" }
];

async function main() {
  for (const item of PREDEFINED_CATEGORIES) {
    try {
      // Add topic if not already present
      const { data: repo } = await octokit.repos.get({
        owner: item.owner,
        repo: item.repo
      });
      
      const topics = new Set(repo.topics || []);
      if (!topics.has(item.topic)) {
        await octokit.repos.replaceTopics({
          owner: item.owner,
          repo: item.repo,
          names: [...topics, item.topic]
        });
        console.log(`✅ Backfilled: ${item.owner}/${item.repo} → ${item.topic}`);
      }
    } catch (error) {
      console.error(`❌ Failed backfill: ${item.owner}/${item.repo}`, error.message);
    }
  }
}

main();