import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === "production" });

import { Octokit, App } from "octokit";
import fs from "fs";
import readline from "readline";

// vars
// const REPO_LIST_FILE = "repo-list-small.txt";
const REPO_LIST_FILE = "sorted_repos.txt";
const OUTPUT_JSON_FILE = "./sorted.json";
// const OUTPUT_JSON_FILE = "./sorted-small.json";

const repo_array = [];
// [{repo,stars},...]
const repo_stars = [];

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH,
});

const {
  data: { login },
} = await octokit.rest.users.getAuthenticated();

// run and log
(async function () {
  await read_repo_list_to_array();
  await gen_repo_stars();
  sort_repo_stars();
  write_sorted_repo_stars();
})();

//////////////////////////////////////

async function getStargazersCount(owner, repo) {
  try {
    const res = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });
    return res.data.stargazers_count;
  } catch (e) {
    console.log(e);
  }
  return 0;
}

async function read_repo_list_to_array() {
  const fileStream = fs.createReadStream(REPO_LIST_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    repo_array.push(line);
  }
}

async function gen_repo_stars() {
  for (const repo of repo_array) {
    const a = repo.split("/");
    const stars = await getStargazersCount(a[0], a[1]);
    repo_stars.push({ repo, stars });
  }
}

function sort_repo_stars() {
  repo_stars.sort(({ stars: a }, { stars: b }) => b - a);
}

function write_sorted_repo_stars() {
  const jsonContent = JSON.stringify(repo_stars);
  fs.writeFile(OUTPUT_JSON_FILE, jsonContent, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}
