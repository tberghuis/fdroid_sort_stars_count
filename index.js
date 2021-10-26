import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === "production" });

import { Octokit, App } from "octokit";
import fs from "fs";
import readline from "readline";

let repos_to_sort = [];

sort_owner_repo();

////////////////////////////////////////

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH,
});

// Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
const {
  data: { login },
} = await octokit.rest.users.getAuthenticated();
// console.log("Hello, %s", login);

async function getStargazersCount(owner, repo) {
  const res = await octokit.request("GET /repos/{owner}/{repo}", {
    owner,
    repo,
  });
  console.log(`${owner}/${repo}, ${res.data.stargazers_count}`);
}

// getStargazersCount("jdmonin", "anstop");

async function sort_owner_repo() {
  const fileStream = fs.createReadStream("url-list.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const a = line.split("/");
    repos_to_sort.push(`${a[3]}/${a[4]}`);
  }

  repos_to_sort.sort();
  repos_to_sort = [...new Set(repos_to_sort)];

  write_sorted_repos();
}

function write_sorted_repos() {
  var file = fs.createWriteStream("sorted_repos.txt");
  file.on("error", function (err) {
    console.log("error");
    /* error handling */
  });
  repos_to_sort.forEach(function (v) {
    file.write(v + "\n");
  });
  file.end();
}
