# Claude Code Mastery Curriculum v2
## February 2026 Edition

**Duration:** 12 Weeks
**Goal:** From zero coding knowledge to Claude Code expert
**Prerequisites:** None. This curriculum assumes you have never written code or opened a terminal.
**Cost:** Free. You need a computer (Mac, Windows, or Linux), an internet connection, and an Anthropic API key or Claude Pro/Max subscription.

---

## Phase I: Foundation (Weeks 1–3)

### WEEK 1: The Terminal & File System
**Subtitle:** Your gateway to Claude Code
**Objective:** Master command-line navigation, file management, and install Node.js.

**Topics:**
- What is a terminal and why we use it
- Opening the terminal on Mac, Windows, and Linux
- Navigation commands: pwd, ls, cd
- File management commands: mkdir, touch, cp, mv, rm
- Reading files: cat, less, head, tail
- Environment basics: echo, export, PATH
- Installing Node.js and npm
- Package managers: Homebrew (Mac)

**Activities:**
- Open the terminal for the first time and type `pwd` to see where you are
- Navigate to your home directory (`cd ~`) and explore with `ls`
- Create your first project folder: `mkdir my-first-project`
- Inside `my-first-project`, create subfolders: `mkdir notes`, `mkdir scripts`
- Create, move, copy, and delete practice files to build muscle memory
- Install Node.js using Homebrew (Mac) or nvm (any platform)
- Verify installation with `node --version` and `npm --version`

**Deliverable:** A `my-first-project` folder (with subfolders) created entirely from the terminal, and Node.js installed and verified.
**Skills:** Terminal navigation, file management, reading error messages, Node.js setup

#### Learning Objectives

By the end of this week, you will be able to:

1. Open a terminal on your operating system and explain what it does
2. Navigate the file system using `pwd`, `ls`, and `cd`
3. Create, copy, move, and delete files and folders from the command line
4. Read file contents using `cat`, `less`, `head`, and `tail`
5. Install Node.js and verify the installation with version commands

#### Lesson

**What Is a Computer? (The 30-Second Version)**

A computer has two parts: hardware (the physical machine — screen, keyboard, processor, memory) and software (the instructions that tell the hardware what to do). Every app you use — your web browser, your music player, your calculator — is software. When you write code, you are writing software.

**What Is a File System?**

Every computer organizes information in a tree structure, like folders inside folders. Picture it like this:

```
/  (root — the very top)
├── Users/
│   └── yourname/         ← your "home" folder
│       ├── Desktop/
│       ├── Documents/
│       ├── Downloads/
│       └── my-first-project/   ← we will create this
│           ├── notes/
│           └── scripts/
├── Applications/
└── System/
```

Every file on your computer lives somewhere in this tree. When someone says "navigate to a folder," they mean "move to a specific location in this tree."

**What Is a Terminal?**

Think of your computer as a house with many rooms (folders) full of drawers (files). Normally you click through windows and icons to open those rooms — that is the **graphical interface**. The terminal is a different door into the same house: instead of clicking, you type short text commands. It looks like a blank screen with a blinking cursor. That is all it is — a text-based way to talk to your computer.

Why use it? Because Claude Code lives in the terminal. To use Claude Code, you need to be comfortable typing commands. The good news: you only need about 15 commands to get started, and we will learn them one at a time.

**How to Open the Terminal**

- **Mac:** Open Finder → Applications → Utilities → Terminal. Or press Cmd+Space, type "Terminal", and press Enter.
- **Windows:** Press the Windows key, type "PowerShell", and press Enter. (We recommend installing Windows Subsystem for Linux — called WSL — for the best experience with Claude Code. Search "install WSL" in your browser for a step-by-step guide.)
- **Linux:** Press Ctrl+Alt+T, or search for "Terminal" in your applications menu.

When you open the terminal, you will see something like this:

```
yourname@computer ~ %
```

That blinking cursor is waiting for you to type a command. Let us start.

**Navigation Commands — Finding Your Way Around**

**`pwd` — Print Working Directory**

Think of `pwd` as asking "Where am I right now?" It prints the full path to your current folder.

```
$ pwd
/Users/yourname
```

The `$` symbol is just the prompt — you do not type it. You type `pwd` and press Enter. The computer responds with your location.

Common mistake: Typing `PWD` (uppercase). Commands are case-sensitive. Always use lowercase.

**`ls` — List**

Think of `ls` as opening a drawer to see what is inside. It shows everything in your current folder.

```
$ ls
Desktop    Documents    Downloads    Music    Pictures
```

Try `ls -la` to see hidden files (files starting with a dot) and extra details like file sizes and dates:

```
$ ls -la
total 0
drwxr-xr-x  12 yourname  staff  384 Feb 10 09:00 .
drwxr-xr-x   5 root      staff  160 Jan  1 00:00 ..
-rw-r--r--   1 yourname  staff   45 Feb 10 09:00 .bashrc
drwx------   4 yourname  staff  128 Feb 10 09:00 Desktop
drwx------   3 yourname  staff   96 Feb 10 09:00 Documents
```

Do not worry about the letters on the left (those are permissions — we will cover them much later). For now, just notice the file and folder names on the right.

**`cd` — Change Directory**

Think of `cd` as walking from one room to another. You type `cd` followed by the folder name.

```
$ cd Documents
$ pwd
/Users/yourname/Documents
```

Three special shortcuts:
- `cd ..` — go back one level (step out of the room into the hallway)
- `cd ~` — go straight to your home folder (like pressing a "home" button)
- `cd /` — go to the root of the file system (the very top of the tree)

```
$ cd ..
$ pwd
/Users/yourname

$ cd ~
$ pwd
/Users/yourname
```

Common mistake: Forgetting the space between `cd` and the folder name. `cdDocuments` will not work. It must be `cd Documents`.

**File Management Commands — Creating and Organizing**

**`mkdir` — Make Directory**

Creates a new folder. Think of it as adding a new room to the house.

```
$ mkdir my-first-project
$ ls
Desktop    Documents    Downloads    Music    Pictures    my-first-project
```

You just created your first folder from the terminal! Navigate into it:

```
$ cd my-first-project
$ pwd
/Users/yourname/my-first-project
```

Common mistake: Using spaces in folder names. `mkdir my project` creates TWO folders: "my" and "project". If you need spaces, use quotes: `mkdir "my project"`. Better yet, use hyphens: `mkdir my-project`.

**`touch` — Create an Empty File**

Creates a new, empty file. Think of it as placing a blank sheet of paper in a drawer.

```
$ touch notes.txt
$ ls
notes.txt
```

The file exists but has nothing in it yet. We will learn how to put content in files shortly.

**`cp` — Copy**

Copies a file or folder. Think of it as photocopying a document.

```
$ cp notes.txt notes-backup.txt
$ ls
notes-backup.txt    notes.txt
```

To copy a folder and everything inside it, add `-r` (recursive):

```
$ cp -r notes notes-copy
```

**`mv` — Move (or Rename)**

Moves a file to a different location, or renames it. Think of it as picking something up and putting it somewhere else.

```
$ mv notes-backup.txt notes/
$ ls
notes.txt    notes/
$ ls notes/
notes-backup.txt
```

To rename a file, "move" it to a new name in the same folder:

```
$ mv notes.txt my-notes.txt
```

**`rm` — Remove (Delete)**

Deletes a file. **Be very careful — there is no undo. There is no trash can. Once removed, it is gone.**

```
$ rm my-notes.txt
```

To remove a folder and everything inside it:

```
$ rm -r notes-copy
```

Common mistake: Running `rm -r` on the wrong folder. Always double-check which folder you are in with `pwd` before deleting anything.

**Reading Files**

**`cat` — Display Entire File**

Prints the full contents of a file to the screen. Good for short files.

```
$ cat notes.txt
Hello, this is my first file!
```

**`less` — Scroll Through a File**

Opens a file in a scrollable viewer. Good for long files. Press `q` to quit, arrow keys to scroll, and `/` followed by a word to search.

```
$ less long-document.txt
```

**`head` and `tail` — First or Last Lines**

`head` shows the first 10 lines. `tail` shows the last 10 lines. Useful for peeking at a file without loading the whole thing.

```
$ head notes.txt
$ tail notes.txt
```

**Environment Basics**

**`echo` — Print Text**

`echo` prints whatever you type after it. Think of it as a "say this" command.

```
$ echo "Hello World"
Hello World
```

**`export` — Set a Variable**

Variables are named containers that hold a value. `export` creates a variable that other programs can read.

```
$ export MY_NAME="Claude Student"
$ echo $MY_NAME
Claude Student
```

The `$` sign before the variable name means "give me the value stored in this variable."

**`PATH` — The Command Search List**

When you type a command like `node`, your computer does not magically know where the `node` program lives. It checks a list of folders called `PATH` — think of it as a phonebook your computer consults. If the program is in one of those folders, it runs. If not, you get "command not found."

```
$ echo $PATH
/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

Each folder is separated by a colon. When you install new tools (like Node.js), the installer usually adds its folder to PATH automatically.

**Installing Node.js**

Node.js is the engine that Claude Code runs on. You need it installed before you can use Claude Code. npm (Node Package Manager) comes bundled with Node.js — think of npm as an app store for code libraries.

**Mac (using Homebrew):**

Homebrew is a package manager for Mac — an app store you use from the terminal. First, install Homebrew if you do not have it:

```
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Node.js:

```
$ brew install node
```

**Windows (using the installer):**

Go to https://nodejs.org and download the LTS version. Run the installer and follow the prompts. Restart your terminal afterward.

**Linux (using nvm):**

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
$ nvm install --lts
```

**Verify the installation:**

```
$ node --version
v22.13.1

$ npm --version
10.9.2
```

If you see version numbers (the exact numbers may differ), you are ready. If you see "command not found," close your terminal, reopen it, and try again — some installations need a terminal restart.

#### Practice Exercises

**Exercise 1 (Guided): Build Your Project Folder**

Follow these steps exactly and check your output after each command:

```
$ cd ~
$ pwd
/Users/yourname

$ mkdir my-first-project
$ cd my-first-project
$ pwd
/Users/yourname/my-first-project

$ mkdir notes
$ mkdir scripts
$ ls
notes    scripts

$ touch README.txt
$ touch notes/day1.txt
$ touch scripts/hello.sh
$ ls -la
total 0
drwxr-xr-x  5 yourname  staff  160 Feb 10 10:00 .
drwxr-xr-x  3 yourname  staff   96 Feb 10 10:00 ..
-rw-r--r--  1 yourname  staff    0 Feb 10 10:00 README.txt
drwxr-xr-x  3 yourname  staff   96 Feb 10 10:00 notes
drwxr-xr-x  3 yourname  staff   96 Feb 10 10:00 scripts
```

Verification: Run `ls notes` — you should see `day1.txt`. Run `ls scripts` — you should see `hello.sh`.

**Exercise 2 (Independent): File Organization Challenge**

Goal: Create the following folder structure entirely from the terminal:

```
~/practice/
├── documents/
│   ├── report.txt
│   └── summary.txt
├── images/
│   └── placeholder.txt
└── backups/
```

Hints:
- Start with `cd ~` then `mkdir practice`
- Use `cd` to navigate into folders before creating files
- Use `ls -R practice` from your home folder to verify the full tree (`-R` lists contents recursively)

Verification: `ls -R ~/practice` should show all three subfolders and three files.

**Exercise 3 (Challenge): The Cleanup Mission**

Create a messy folder with 5 files and 3 subfolders. Then reorganize it:
- Move all `.txt` files into a `documents` subfolder
- Copy (not move) one important file to a `backups` subfolder
- Delete any files you do not need
- End with a clean, organized structure

Document every command you used in a file called `cleanup-log.txt` (use `echo "command here" >> cleanup-log.txt` to append lines to the file).

#### Self-Assessment Quiz

**1. What does `pwd` stand for, and what does it do?**

**2. What is the difference between `mv` and `cp`?**

**3. Why is `rm` considered dangerous? What safety step should you always take before using it?**

**4. What is PATH, and what happens when you type a command that is not in any PATH folder?**

**5. After running `node --version` and getting "command not found," what should you try first?**

> **Answers:**
>
> 1. `pwd` stands for "print working directory." It displays the full path to the folder you are currently in.
>
> 2. `mv` moves a file (the original disappears from its old location). `cp` copies a file (the original stays where it is, and a duplicate is created).
>
> 3. `rm` permanently deletes files with no undo and no trash can. You should always run `pwd` first to confirm you are in the correct folder, and double-check the file name before pressing Enter.
>
> 4. PATH is a list of folders your computer searches when you type a command. If the command is not found in any PATH folder, you get a "command not found" error.
>
> 5. Close the terminal completely, reopen it, and try again. Many installations require a terminal restart to update the PATH.

#### Terminal & Environment Updates (Feb 2026)
- **Terminal rendering performance** improved significantly (v2.1.39)
- **Fatal errors** are now properly displayed instead of being swallowed (v2.1.39)
- **Process hanging** after session close fixed (v2.1.39)
- **Vim normal mode** now supports arrow key history navigation when cursor cannot move further (v2.1.20)
- **External editor shortcut** (Ctrl+G) added to the help menu (v2.1.20)
- **Customizable spinner verbs** via `spinnerVerbs` setting (v2.1.23)
- **mTLS and proxy connectivity** fixed for corporate proxies and client certificates (v2.1.23)
- **Installation change:** npm installations are deprecated — use `claude install` instead (v2.1.15)

**Exercise:**
- Run `claude install` if you previously installed via npm
- Try Ctrl+G to open an external editor from within Claude Code
- Customize your spinner verbs in settings

#### Maintaining Your Claude Code Environment
- The `~/.claude` directory stores session data, memories, and settings. It can grow to 1GB+ after a few weeks of daily use.
- There is no built-in auto-cleanup — periodically review and prune old session data.
- Key space consumers: session transcripts, tool outputs, and cached context.

#### Token Optimization: Reducing Context Noise

- **The problem:** Claude Code sends raw terminal output (passing tests, verbose logs, status bars) into the LLM context window — most of it is noise you're paying tokens for
- **Impact:** Unoptimized sessions can use 10x+ more tokens than necessary
- **Strategies:**
  1. **Keep commands focused:** Use targeted commands (`grep`, `head`, `tail`) instead of dumping entire files or logs
  2. **Filter test output:** Run specific test files/cases instead of full suites when debugging
  3. **Use `.claudeignore`:** Exclude build artifacts, node_modules, and generated files from context
  4. **Leverage subagents:** Claude Code's Task tool offloads exploration to subagents, keeping the main context clean
  5. **Community tools:** Projects like CLI proxies (e.g., rtk) can filter terminal output before it reaches context

**Exercise:** Run a Claude Code session on a project. Check token usage with `/cost`. Then repeat the same task using focused commands and `.claudeignore` — compare the token difference.

**Discussion:** [Community thread on token savings](https://www.reddit.com/r/ClaudeAI/comments/1r2tt7q/i_saved_10m_tokens_89_on_my_claude_code_sessions/)


**Claude Code npm 2.1.41 (latest)** (added 2026-02-13)
@anthropic-ai/claude-code@2.1.41 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.41


**Claude Code npm 2.1.42 (latest)** (added 2026-02-13)
@anthropic-ai/claude-code@2.1.42 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.42


#### Claude Code v2.1.43–2.1.49 Release Notes (Feb 13–19, 2026)

Several Claude Code releases shipped this week:

| Version | Date | Highlights |
|---------|------|------------|
| 2.1.44 | Feb 16 | Fixed auth refresh errors |
| 2.1.45 | Feb 17 | Added **Claude Sonnet 4.6** support; `spinnerTipsOverride` setting for custom spinner tips; support for `enabledPlugins` and `extraKnownMarketplaces` from `--add-dir` directories |
| 2.1.47 | Feb 18 | Fixed FileWriteTool to preserve trailing blank lines; fixed Windows terminal line count display bugs |
| 2.1.49 | Feb 19 | Fixed Ctrl+C / ESC being silently ignored when background agents are running; fixed prompt suggestion cache regression; fixed `plugin enable` |

> **Key takeaway:** v2.1.45 is the most significant — it adds Sonnet 4.6 model support and a new `spinnerTipsOverride` setting. Run `claude update` to get the latest.


**Claude Code npm 2.1.76 (latest)** (added 2026-03-14)
@anthropic-ai/claude-code@2.1.76 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.76


**Claude Code npm 2.1.81 (latest)** (added 2026-03-20)
@anthropic-ai/claude-code@2.1.81 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.81


> **Deprecation Notice (2026-03-24):** Claude Code didn't replace me — it made my decade of experience ship faster. I've been doing DevOps and SRE work for years. I knew exactly what terminal I wanted to exist. I just couldn't build it alone in any reasonable... [Source](https://www.reddit.com/r/ClaudeAI)


**Claude Code npm 2.1.87 (latest)** (added 2026-03-29)
@anthropic-ai/claude-code@2.1.87 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.87


**Claude Code npm 2.1.92 (latest)** (added 2026-04-04)
@anthropic-ai/claude-code@2.1.92 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.92


**Claude Code npm 2.1.104 (latest)** (added 2026-04-12)
@anthropic-ai/claude-code@2.1.104 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.104


**Claude Code npm 2.1.114 (latest)** (added 2026-04-17)
@anthropic-ai/claude-code@2.1.114 published to...
Source: https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.114

---

### WEEK 2: Git & Version Control
**Subtitle:** Never lose your work again
**Objective:** Understand how professional developers track changes and collaborate.

**Topics:**
- What is Git and why every developer uses it
- git init, git add, git commit — the core cycle
- git log, git diff, git status — understanding your history
- Branches: git branch, git checkout, git merge
- GitHub: creating repos, pushing code, pull requests
- GitHub Personal Access Tokens for Claude Code integration

**Activities:**
- Inside your `my-first-project` folder, run `git init` to start tracking changes
- Practice the add → commit cycle with clear messages
- Create a branch, make changes, then merge it back
- Create a free GitHub account and push your project to the cloud
- Open and merge your first pull request
- Generate a GitHub Personal Access Token

**Deliverable:** Your `my-first-project` published on GitHub with at least 5 meaningful commits and 1 merged pull request.
**Skills:** Git fundamentals, GitHub, branching, pull requests, authentication tokens

#### Learning Objectives

By the end of this week, you will be able to:

1. Explain what version control is and why it matters
2. Initialize a Git repository and make commits with meaningful messages
3. View your project history using `git log`, `git diff`, and `git status`
4. Create branches, switch between them, and merge changes
5. Push code to GitHub and open a pull request

#### Lesson

**The Problem Git Solves**

Imagine you are writing an important essay. You save copies: "essay-draft1", "essay-draft2", "essay-final", "essay-FINAL-final", "essay-REALLY-final-v3". Sound familiar? Now imagine you need to go back to draft 2 because you accidentally deleted a paragraph in draft 4. Which file was it? When did you change it?

Git solves this problem elegantly. Instead of saving multiple copies, Git takes a **snapshot** of your entire project every time you tell it to. Each snapshot is called a **commit**. You can go back to any snapshot, compare changes between snapshots, and even work on different versions at the same time.

Think of Git like Google Docs version history, but for your entire project folder — and it works offline.

**Why Git?**

Git is the industry standard. Every professional developer uses it. Every company uses it. And Claude Code works best when your project is tracked by Git, because it can see your history, create branches, and help you collaborate.

**The Three Areas: Working Directory → Staging → Repository**

This is the most important concept in Git. Your files live in three areas:

```
┌─────────────────┐     git add     ┌──────────────┐    git commit    ┌────────────┐
│ Working         │ ──────────────► │ Staging Area │ ───────────────► │ Repository │
│ Directory       │                 │ (Index)      │                  │ (History)  │
│                 │                 │              │                  │            │
│ Your files as   │                 │ Files ready  │                  │ Permanent  │
│ you see them    │                 │ to be saved  │                  │ snapshots  │
└─────────────────┘                 └──────────────┘                  └────────────┘
```

1. **Working Directory** — Your actual files on disk. This is what you see when you run `ls`.
2. **Staging Area** — A holding area for changes you want to include in the next snapshot. Think of it as a loading dock where you place boxes before the truck leaves.
3. **Repository** — The permanent history of all your snapshots (commits). This is stored in a hidden `.git` folder.

Why the staging area? Because you might change 10 files but only want to save 3 of them in this particular snapshot. The staging area lets you choose.

**Starting a Repository: `git init`**

Navigate to your project folder and tell Git to start watching it:

```
$ cd ~/my-first-project
$ git init
Initialized empty Git repository in /Users/yourname/my-first-project/.git/
```

This creates a hidden `.git` folder inside your project. Git is now tracking this folder. You only run `git init` once per project.

**Checking Status: `git status`**

This is the command you will use most often. It tells you what has changed.

```
$ git status
On branch main
No commits yet
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.txt
        notes/
        scripts/
```

"Untracked files" means Git sees these files but is not tracking them yet. They are in your Working Directory but not in the Staging Area.

**Adding Files: `git add`**

Move files from the Working Directory to the Staging Area:

```
$ git add README.txt
$ git status
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   README.txt

Untracked files:
        notes/
        scripts/
```

To add everything at once:

```
$ git add .
```

The `.` means "everything in the current folder." Now all your files are staged.

**Saving a Snapshot: `git commit`**

Create a permanent snapshot of everything in the Staging Area:

```
$ git commit -m "Add project structure with notes and scripts folders"
[main (root-commit) a1b2c3d] Add project structure with notes and scripts folders
 3 files changed, 0 insertions(+), 0 deletions(-)
```

The `-m` flag lets you write a message describing what changed. Good commit messages explain **why** you made the change, not just what. Compare:
- Bad: "Update files"
- Good: "Add project structure with notes and scripts folders"
- Bad: "Fix bug"
- Good: "Fix task list not showing completed items"

**The Core Cycle**

This is the rhythm of working with Git. You will repeat this hundreds of times:

```
1. Make changes to your files
2. git add .          (stage the changes)
3. git commit -m "Describe what and why"   (save a snapshot)
```

That is it. Three steps. Let us practice it.

**Viewing History: `git log`**

See all your commits (snapshots):

```
$ git log
commit a1b2c3d (HEAD -> main)
Author: Your Name <you@email.com>
Date:   Mon Feb 10 10:30:00 2026

    Add project structure with notes and scripts folders
```

For a compact view:

```
$ git log --oneline
a1b2c3d Add project structure with notes and scripts folders
```

**Seeing Changes: `git diff`**

Shows what changed since the last commit. Edit a file first, then run:

```
$ echo "This is my first project" > README.txt
$ git diff
diff --git a/README.txt b/README.txt
--- a/README.txt
+++ b/README.txt
@@ -0,0 +1 @@
+This is my first project
```

Lines starting with `+` are additions (green in most terminals). Lines starting with `-` are deletions (red). This is called a **diff** — you will see diffs constantly when working with Claude Code.

**Branches: Parallel Timelines**

A branch is a parallel copy of your project where you can experiment without affecting the original. Think of it as a forking road — you take one path, try something new, and if it works, you merge it back into the main road.

```
         main:        A ── B ── C ── D ── E (merged)
                              \           /
         feature:              F ── G ── H
```

Create a new branch and switch to it:

```
$ git branch add-description
$ git checkout add-description
Switched to branch 'add-description'
```

Or in one command:

```
$ git checkout -b add-description
```

Now any commits you make happen only on this branch. The `main` branch stays untouched. When you are done:

```
$ git checkout main
$ git merge add-description
```

This brings all the changes from `add-description` into `main`.

**GitHub: Your Code in the Cloud**

GitHub is a website that stores your Git repositories online. It is like a cloud backup for your code, plus a social platform where developers share and collaborate.

1. Go to https://github.com and create a free account.
2. Click "New repository" (the green button).
3. Name it `my-first-project`. Leave it public. Do NOT add a README (you already have one).
4. Follow the instructions to push your existing project:

```
$ git remote add origin https://github.com/yourusername/my-first-project.git
$ git branch -M main
$ git push -u origin main
```

`git remote add origin` tells Git where to push. `git push` sends your commits to GitHub. Refresh the GitHub page — your code is now online.

**Pull Requests: Proposing Changes**

A pull request (PR) is how you propose changes for review before they become official. Even when working alone, PRs are good practice:

1. Create a branch: `git checkout -b improve-readme`
2. Make changes and commit them
3. Push the branch: `git push -u origin improve-readme`
4. On GitHub, click "Compare & pull request"
5. Write a description of what you changed and why
6. Click "Create pull request"
7. Review the changes, then click "Merge pull request"

This is exactly how teams work in the real world. Claude Code can create branches and PRs for you automatically.

**GitHub Personal Access Tokens**

A Personal Access Token (PAT) is a special password that lets Claude Code interact with GitHub on your behalf. To generate one:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Claude Code"
4. Select scopes: `repo` (full control of repositories)
5. Click "Generate token"
6. **Copy the token immediately** — you will never see it again

Store it as an environment variable:

```
$ export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

#### Practice Exercises

**Exercise 1 (Guided): Your First Five Commits**

Follow these steps exactly:

```
$ cd ~/my-first-project
$ git status
(should show clean working tree if you completed Week 1)

$ echo "# My First Project" > README.txt
$ git add README.txt
$ git commit -m "Add project title to README"

$ echo "Created during Week 1 of Claude Code Mastery" >> README.txt
$ git add README.txt
$ git commit -m "Add course reference to README"

$ echo "Learning: Terminal, Git, Claude Code" >> README.txt
$ git add README.txt
$ git commit -m "Add learning topics to README"

$ touch notes/week1.txt
$ echo "Week 1: Learned terminal commands" > notes/week1.txt
$ git add notes/week1.txt
$ git commit -m "Add Week 1 learning notes"

$ touch notes/week2.txt
$ echo "Week 2: Learning Git and version control" > notes/week2.txt
$ git add notes/week2.txt
$ git commit -m "Add Week 2 learning notes"
```

Verification: Run `git log --oneline` — you should see 5 commits (plus the initial one from Week 1).

**Exercise 2 (Independent): Branch and Merge**

Goal: Create a branch called `add-scripts`, add a file called `scripts/greet.sh`, commit it on the branch, then merge it back into `main`.

Hints:
- Use `git checkout -b add-scripts` to create and switch
- The file content can be anything (try `echo 'echo Hello World' > scripts/greet.sh`)
- Switch back to main with `git checkout main`
- Merge with `git merge add-scripts`

Verification: After merging, run `ls scripts/` on the `main` branch — `greet.sh` should be there. Run `git log --oneline` to see the branch merge.

**Exercise 3 (Challenge): Push to GitHub and Open a PR**

Push your project to GitHub, then create a pull request:
1. Create a GitHub repository
2. Push your `main` branch
3. Create a new branch locally, make a change, push it
4. Open a pull request on GitHub
5. Merge the pull request

Document the GitHub URL in your `notes/week2.txt` file.

#### Self-Assessment Quiz

**1. What is a commit in Git?**

**2. Explain the difference between `git add` and `git commit`.**

**3. What is a branch, and why would you use one?**

**4. What is a pull request?**

**5. What does `git push` do?**

> **Answers:**
>
> 1. A commit is a permanent snapshot of your project at a specific point in time. It records what every tracked file looked like when you ran `git commit`.
>
> 2. `git add` moves changes from your Working Directory to the Staging Area (preparing them to be saved). `git commit` takes everything in the Staging Area and saves it as a permanent snapshot in the Repository.
>
> 3. A branch is a parallel copy of your project where you can make changes without affecting the main version. You use branches to experiment, develop new features, or fix bugs safely before merging them back.
>
> 4. A pull request is a proposal to merge changes from one branch into another. It lets you (or others) review the changes before they become official. On GitHub, you create a PR by pushing a branch and clicking "Compare & pull request."
>
> 5. `git push` sends your local commits to a remote repository (like GitHub). It uploads your snapshots so they are backed up online and accessible to others.

#### Git Workflow Updates (Feb 2026)
- **`--from-pr` flag** added to resume sessions linked to a specific GitHub PR number (v2.1.27)
- **Debug logs** now include tool call failures and denials (v2.1.27)
- **Community tip — Token optimization:** The `rtk` (Rust Token Killer) CLI proxy can sit between Claude Code and terminal commands, filtering noise from raw command output before it reaches the LLM context (reported 89% token savings)
- **Community tip — Cleaner PR reviews:** When using `claude-code-action` in GitHub workflows, configure it to reduce comment noise and clean up old comments

**Exercise:**
- Try `claude --from-pr 42` to resume a session tied to a specific PR
- Explore token-saving strategies for long-running sessions


**Anthropic Python SDK 0.79.0** (added 2026-02-07)
New release of the anthropic Python package: version...
Source: https://pypi.org/project/anthropic/0.79.0/


#### Git Worktrees with Claude Code (v2.1.49)

Claude Code v2.1.49 introduced native **git worktree** support, allowing you to run Claude in an isolated copy of your repo without affecting your working branch.

- **`--worktree` (`-w`) flag:** Start Claude Code in a temporary git worktree — perfect for experimental changes, parallel tasks, or risky refactors.
- **Subagent isolation:** Subagents can also run in their own worktrees using the `"worktree"` isolation mode, preventing file conflicts during parallel sessions.
- **`EnterWorktree` tool:** A new built-in tool that creates and enters a git worktree mid-session.

**When to use worktrees:**
- You want to try a risky refactor without touching your current branch
- You're running multiple Claude Code sessions on the same repo
- You want subagents to work on separate branches simultaneously

**Example:**
```bash
# Start Claude Code in an isolated worktree
claude --worktree

# Or use the short flag
claude -w
```

> **Note:** Worktrees require a git repository. The worktree is temporary and cleaned up when the session ends.

---

### WEEK 3: Claude Code — First Contact
**Subtitle:** Your AI coding partner is online
**Objective:** Install Claude Code, run your first session, and understand the core interaction model.

**Topics:**
- Installing Claude Code
- Authentication: API key vs. Claude Pro/Max subscription
- Anatomy of a session: prompt → plan → execute → review
- Plan mode: always start here
- Reading diffs: understanding what Claude changed
- Essential commands: /help, /compact, /clear, /model, /context
- Introduction to CLAUDE.md
- Understanding context window and token usage

**Activities:**
- Install Claude Code and authenticate
- Run your first session: ask Claude to build a simple to-do list app
- Practice Plan mode: describe what you want before Claude codes
- Review a diff and understand every change
- Use /compact during a long session
- Create your first CLAUDE.md file

**Deliverable:** Claude Code installed and configured. First working script built entirely through Claude Code with a CLAUDE.md file.
**Skills:** Claude Code basics, Plan mode, diff reading, /compact, CLAUDE.md creation

#### Learning Objectives

By the end of this week, you will be able to:

1. Install and authenticate Claude Code on your computer
2. Explain the session model: prompt → plan → execute → review
3. Write effective prompts that give Claude clear context and constraints
4. Read a diff to understand exactly what Claude changed in your files
5. Use essential slash commands (/help, /compact, /clear, /model) and create a CLAUDE.md file

#### Lesson

**What Is Claude Code?**

Claude Code is an AI coding assistant that lives in your terminal. Unlike ChatGPT or Claude.ai (where you chat in a browser window and copy-paste code), Claude Code can **directly read, write, and run code on your actual computer**. When you ask Claude Code to "create a to-do list app," it does not just show you the code — it creates the actual files, writes the actual code, and can even run it for you.

Think of it this way:
- **Claude.ai** = a smart friend you text. They give advice, but you do all the work.
- **Claude Code** = a smart colleague sitting at your computer. You describe what you want, they do the work, and you review it.

This makes Claude Code incredibly powerful — and is also why we spent Weeks 1 and 2 learning the terminal and Git. You need to understand the environment Claude Code works in.

**Installing Claude Code**

Make sure Node.js is installed (you did this in Week 1). Then run:

```
$ claude install
```

If that does not work, you can also install via npm:

```
$ npm install -g @anthropic-ai/claude-code
```

Verify the installation:

```
$ claude --version
```

If you see a version number, you are ready.

**Authentication: Getting Permission to Use Claude**

Claude Code needs to know you have permission to use it. There are two ways:

1. **API Key** — A personal password from Anthropic. Go to https://console.anthropic.com, create an account, and generate an API key. Then set it:

```
$ export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

2. **Claude Pro/Max Subscription** — If you have a paid Claude subscription, you can authenticate directly:

```
$ claude auth login
```

This opens a browser window where you log in. Once authenticated, Claude Code connects to your account automatically.

**Your First Session**

Navigate to your project folder and launch Claude Code:

```
$ cd ~/my-first-project
$ claude
```

You will see a welcome screen with a blinking cursor. This is where you type your prompts — plain English descriptions of what you want Claude to do.

Try this prompt:

```
Create a simple HTML page called index.html that says "Hello World"
with a heading and a paragraph describing what this project is about.
```

Watch what happens. Claude will:
1. **Think** about what you asked (you might see it planning)
2. **Create** the file `index.html`
3. **Write** the HTML code into it
4. **Show you** what it did (a diff — the changes it made)

**The Session Model: Prompt → Plan → Execute → Review**

Every interaction with Claude Code follows this cycle:

```
   You write        Claude thinks       Claude makes       You check
   a prompt    →    and plans       →   the changes   →    the result

   "Create a        "I'll create        Creates files,      You see a diff
    to-do app"      index.html with     writes code,        showing what
                    React components"   runs commands        changed
```

**Step 1: Prompt** — You describe what you want in plain English. Be specific:
- Vague: "Make an app" (Claude does not know what kind)
- Better: "Create a to-do list where I can add and remove tasks"
- Best: "Create a to-do list using HTML and JavaScript where I can add tasks with a text input, mark them as complete with a checkbox, and delete them with a button"

**Step 2: Plan** — Claude thinks about your request and decides what to do. In Plan mode (which we will cover next), it tells you its plan before doing anything.

**Step 3: Execute** — Claude creates files, writes code, and runs commands on your computer.

**Step 4: Review** — Claude shows you a **diff** — a before-and-after view of what changed. You approve or ask for changes.

**Plan Mode: Think Before You Code**

Plan mode is one of the most important features of Claude Code. When you start in Plan mode, Claude tells you what it plans to do **before making any changes**. You can review the plan, ask questions, and request modifications before Claude writes a single line of code.

To enter Plan mode, use the slash command:

```
/plan
```

Or start Claude with Plan mode:

```
$ claude --permission-mode plan
```

In Plan mode, Claude will analyze your request and present a plan like:

```
I'll create a to-do list app. Here's my plan:

1. Create index.html with the page structure
2. Add a text input and "Add Task" button
3. Create a task list that displays tasks
4. Add JavaScript to handle adding, completing, and deleting tasks
5. Style it with CSS to look clean and professional

Shall I proceed?
```

You can then say "yes," or modify the plan: "Sounds good, but use a modern design with rounded corners and a dark mode."

**Rule of thumb:** Always use Plan mode for anything non-trivial. It prevents Claude from going in a direction you did not want.

**Reading Diffs: Understanding What Changed**

When Claude makes changes, it shows you a diff. This is the same format Git uses:

```diff
+ Added lines appear in green with a + prefix
- Removed lines appear in red with a - prefix
  Unchanged lines appear normally (for context)
```

Example diff:

```diff
--- a/index.html
+++ b/index.html
@@ -1,3 +1,5 @@
 <html>
   <body>
-    <h1>Hello</h1>
+    <h1>Hello World</h1>
+    <p>This is my first project.</p>
   </body>
 </html>
```

Reading this diff: The line `<h1>Hello</h1>` was removed (red), and two new lines were added (green): `<h1>Hello World</h1>` and `<p>This is my first project.</p>`.

Learning to read diffs is essential. Every time Claude makes a change, you should read the diff to understand what happened. If something looks wrong, you can say "Undo that" or "Change the heading back."

**Essential Slash Commands**

Slash commands are special instructions you type during a Claude Code session. They start with `/`:

| Command | What It Does |
|---------|-------------|
| `/help` | Shows all available commands |
| `/compact` | Compresses the conversation to save memory. Use this during long sessions when Claude starts to slow down or forget earlier context |
| `/clear` | Clears the entire conversation and starts fresh |
| `/model` | Switch between AI models (Opus, Sonnet, Haiku) mid-session |
| `/context` | Shows how much of Claude's memory (context window) is being used |
| `/cost` | Shows how many tokens (and dollars) this session has used |
| `/init` | Creates a CLAUDE.md file for your project |

**The Context Window: Claude's Working Memory**

Claude has a limited "working memory" called the **context window**. Think of it like a desk — Claude can only keep so many documents on the desk at once. As the conversation gets longer, older information falls off the desk.

This is why `/compact` is important. When you run `/compact`, Claude summarizes the conversation so far, freeing up space on the desk without losing important information.

Signs you need to use `/compact`:
- Claude starts forgetting things you told it earlier
- Claude repeats work it already did
- The `/context` command shows usage above 80%

**CLAUDE.md: Project Memory**

CLAUDE.md is a special file that Claude reads at the start of every session. It is your project's instruction manual for Claude. Create one with:

```
/init
```

Or create it manually. Here is a starter template:

```markdown
# CLAUDE.md

## Project Overview
This is a to-do list application built during the Claude Code Mastery course.

## Tech Stack
HTML, CSS, JavaScript

## Commands
- Open index.html in a browser to view the app
- No build step needed

## Architecture
- index.html — Main page with app structure
- style.css — Styling
- app.js — Application logic

## Conventions
- Use clear variable names
- Add comments explaining complex logic
```

Why does this matter? Without CLAUDE.md, Claude starts every session knowing nothing about your project. With CLAUDE.md, Claude immediately understands what your project is, how it is organized, and what conventions to follow.

**Token Usage and Cost**

Every interaction with Claude uses **tokens** — small units of text. Longer conversations use more tokens, and tokens cost money (if you are on API billing). Use `/cost` to check:

```
/cost
Session tokens: 12,450
Estimated cost: $0.12
```

Tips for managing token usage:
- Use `/compact` during long sessions
- Be specific in your prompts (less back-and-forth = fewer tokens)
- Use Plan mode to avoid wasted work
- Switch to a cheaper model (Haiku) for simple tasks with `/model`

#### Practice Exercises

**Exercise 1 (Guided): Your First Claude Code Session**

Follow these steps exactly:

```
$ cd ~/my-first-project
$ claude
```

At the Claude prompt, type:

```
Create a file called index.html with a simple webpage that has:
- A heading that says "My First Project"
- A paragraph introducing yourself
- A list of three things you are learning
```

After Claude creates the file:
1. Read the diff Claude shows you — identify what was added
2. Type `/cost` to see token usage
3. Type `/context` to see context window usage
4. Open the file in a browser to see the result (on Mac: `open index.html`)

Verification: `index.html` should exist with the content you described. The browser should display a formatted webpage.

**Exercise 2 (Independent): Plan Mode Practice**

Goal: Use Plan mode to build a simple to-do list.

1. Start Claude in Plan mode: `claude --permission-mode plan`
2. Ask: "Create a to-do list app where I can add tasks, mark them complete, and delete them. Use HTML, CSS, and JavaScript in separate files."
3. Review Claude's plan carefully before approving
4. After Claude builds it, test it in your browser
5. Ask Claude to make one improvement (your choice — better styling, a search feature, etc.)

Hints:
- If the plan seems too complex, ask Claude to simplify it
- If you do not understand part of the plan, ask Claude to explain
- After testing, commit your changes with Git: `git add . && git commit -m "Add to-do list app"`

Verification: Three files should exist (`.html`, `.css`, `.js`). The app should work in the browser. Git log should show a new commit.

**Exercise 3 (Challenge): Create Your CLAUDE.md**

Write a complete CLAUDE.md for your `my-first-project` that includes:
- Project overview (what it does)
- Tech stack (what technologies it uses)
- File structure (what each file does)
- How to run the project
- Any conventions you want Claude to follow

Test it by starting a new Claude session and asking: "What do you know about this project?" Claude should be able to describe your project accurately based on CLAUDE.md.

#### Self-Assessment Quiz

**1. What is the difference between Claude.ai and Claude Code?**

**2. What is Plan mode, and why should you use it?**

**3. In a diff, what do lines starting with `+` and `-` mean?**

**4. What is CLAUDE.md, and why is it important?**

**5. When should you use the `/compact` command?**

> **Answers:**
>
> 1. Claude.ai is a chat interface in your browser — you type questions and get text responses that you copy-paste manually. Claude Code runs in your terminal and can directly create, edit, and run files on your computer. Claude Code is an active collaborator; Claude.ai is an advisor.
>
> 2. Plan mode makes Claude describe its plan before making any changes. You should use it for anything non-trivial so you can review, modify, and approve the plan before Claude writes code. This prevents wasted work and misunderstandings.
>
> 3. Lines starting with `+` are additions (new content that was added). Lines starting with `-` are deletions (old content that was removed). Lines without a prefix are unchanged context lines.
>
> 4. CLAUDE.md is a file in your project root that Claude reads at the start of every session. It tells Claude about your project: what it does, what technologies it uses, how files are organized, and what conventions to follow. Without it, Claude starts each session knowing nothing about your project.
>
> 5. Use `/compact` when your session is getting long and Claude starts to slow down, forget earlier context, or repeat itself. Check with `/context` — if usage is above 80%, it is time to compact.

#### Current Model Lineup (February 2026)

| Model | Released | Model ID | Best For |
|-------|----------|----------|----------|
| **Claude Opus 4.6** | Feb 2026 | `claude-opus-4-6` | Agentic coding, complex tool use, multi-step reasoning |
| **Claude Sonnet 4.5** | Sep 2025 | `claude-sonnet-4-5-20250929` | Everyday coding, balanced speed/capability |
| **Claude Haiku 4.5** | Oct 2025 | `claude-haiku-4-5-20251001` | Quick tasks, high-volume operations, cost-sensitive workflows |

- **Opus 4.6** leads across agentic coding, computer use, tool use, search, and finance benchmarks. Available in Claude Code since v2.1.32; fast mode enabled in v2.1.36.
- **Sonnet 4.5** sets benchmark records in coding, reasoning, and computer use. The default workhorse model. Released alongside the **Claude Agent SDK** for building custom agents programmatically.
- **Haiku 4.5** matches prior state-of-the-art coding with unprecedented speed and cost-efficiency. Used internally by Claude Code for fast subagent operations.

**Key takeaway:** Switch models mid-session with `/model` or set `ANTHROPIC_MODEL`. Use Opus 4.6 for complex architecture, Sonnet 4.5 for everyday coding, Haiku 4.5 for rapid iteration. Fast mode (`/fast`) is available for Opus 4.6.

**Exercise:** Run the same prompt with all three models and compare response time, token cost, and output quality. Identify which tasks are "Haiku-appropriate" vs those that need Sonnet or Opus.

**References:**
- [Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6) | [Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5) | [Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5)
- [Agent SDK docs](https://docs.anthropic.com/en/docs/agents/agent-sdk)

#### Claude Code Feature Updates (Feb 2026)

**Task Management System:**
A new task management system with dependency tracking was added (v2.1.16). Tasks can be created, updated, and tracked with `blockedBy`/`blocks` relationships. Disable with `CLAUDE_CODE_ENABLE_TASKS=false` to use the old system temporarily.

**Auto Memory:**
Claude now automatically records and recalls memories as it works (v2.1.32). Memories persist in `~/.claude/` and are loaded into the system prompt for future sessions.

**Session Resume:**
On exit, Claude Code now shows a session resume hint so you can continue your conversation later (v2.1.31).

**Exercise:**
- Toggle `/fast` mode and compare response speed vs. quality
- Let Claude build up auto memories across a few sessions, then review what it stored in `~/.claude/`
- Use the task management system on a multi-step project to track progress

#### Community Tools: ClaudeDesk

- **ClaudeDesk v4.4.0** — An open-source Electron desktop app wrapping the Claude Code CLI. Provides multi-session terminals, split views, and agent team visualization.
- Features: full git workflow (status, staging, commits) without leaving the app, 233+ automated tests.
- Useful as a GUI alternative when you prefer a desktop interface over the raw terminal.
- **Reference:** https://github.com/anthropics/claudedesk

#### Token Usage Awareness

- **Opus 4.6 uses more tokens** than previous models due to deeper planning and longer autonomous runs. Monitor your usage with `/cost` during sessions.
- Community reports suggest token consumption can spike significantly when using Opus 4.6 for design-heavy or test-heavy workflows.
- **Tip:** Use Sonnet 4.5 or Haiku 4.5 for routine tasks, and reserve Opus 4.6 for complex architecture and multi-step reasoning where quality matters most.

#### Claude Sonnet 4.6 (Released Feb 17, 2026)

Anthropic released **Claude Sonnet 4.6**, a new model delivering frontier performance across coding, agentic tasks, and professional work at scale. Key points for Claude Code users:

- **Claude Code support:** Added in v2.1.45. You can select Sonnet 4.6 using `/model` or by setting it in your configuration.
- **Performance:** Optimized for coding and agent workflows — faster and more capable than Sonnet 4.5 for most tasks.
- **Model ID:** `claude-sonnet-4-6` — use this when building applications with the Anthropic API.
- **When to use:** Sonnet 4.6 is ideal for everyday Claude Code work where you want strong performance with lower cost than Opus. It excels at code generation, debugging, and multi-step agent tasks.

> **Try it:** Run `/model` in Claude Code and switch to Sonnet 4.6. Try a coding task you've done before and compare the output quality and speed.

#### Claude Opus 4.6 (February 2026)

Anthropic upgraded its most capable model to **Opus 4.6**, achieving industry-leading performance across agentic coding, computer use, tool use, search, and finance benchmarks.

- **Model ID:** `claude-opus-4-6` — the default model for Claude Code when available.
- **Strengths:** Best-in-class for complex, multi-step coding tasks, large refactors, and tasks requiring deep reasoning.
- **Claude Code integration:** Claude Code automatically uses Opus 4.6 when your plan supports it. You can verify with `/model`.
- **When to choose Opus vs Sonnet:** Use Opus 4.6 for complex architecture decisions, large-scale refactors, and tasks requiring extensive reasoning. Use Sonnet 4.6 for faster, everyday coding tasks where speed matters more than depth.

> **Exercise:** Compare Opus 4.6 and Sonnet 4.6 on the same task — ask Claude Code to explain a complex function. Note differences in depth and speed.


#### System Prompt Changes in v2.1.48–2.1.49

Recent Claude Code releases included significant system prompt updates:

- **v2.1.48:** Removed 1,082 tokens from the system prompt, including the old MCP CLI instructions (replaced by native MCP integration).
- **v2.1.49:** Added the `EnterWorktree` tool description (237 tokens) to the system prompt, enabling Claude to create git worktrees mid-session.

> **Why this matters:** Claude Code's system prompt defines what tools and behaviors are available. Tracking these changes helps you understand what Claude can and can't do in each version.


#### Opencode: Claude Subscription Support Removed

**Opencode**, a third-party open-source CLI for Claude, has dropped support for Claude subscriptions (Pro/Max). This means you can no longer use your Anthropic subscription credentials with Opencode.

- **Impact:** If you were using Opencode as an alternative to Claude Code, you now need an API key instead.
- **Recommendation:** Use the official **Claude Code CLI** (`@anthropic-ai/claude-code`) which fully supports both API keys and Claude subscriptions.

> **Takeaway:** Third-party tools can change their integration support at any time. The official Claude Code CLI is the most reliable way to access Claude from the terminal.


**Introducing Claude Opus 4.7** (added Apr 16, 20)
Our latest Opus model brings stronger performance across coding, agents, vision, and multi-step tasks, with greater thoroughness and consistency on...
Source: https://www.anthropic.com/news/claude-opus-4-7

---

## Phase II: Building (Weeks 4–8)

### WEEK 4: Your First Full Application
**Subtitle:** From idea to deployed tool
**Objective:** Build a complete, working web application from scratch using Claude Code.

**Topics:**
- What is a web application and how it works
- React and Next.js overview
- Project scaffolding with Claude Code
- Components: building blocks of modern web apps
- Styling with Tailwind CSS
- Deployment to Vercel
- Environment variables and configuration

**Activities:**
- Ask Claude Code to scaffold a Next.js project for a personal task manager
- Build a task list component that displays all your tasks with their status
- Add search and filter functionality
- Style the application with Tailwind CSS
- Deploy to Vercel for the first time
- Share the live URL with a friend or family member

**Deliverable:** A deployed personal task manager on Vercel where you can add, complete, search, and delete tasks.
**Skills:** React/Next.js basics, component thinking, Tailwind CSS, Vercel deployment

#### Learning Objectives

By the end of this week, you will be able to:

1. Explain what a web application is and how browsers, servers, and APIs work together
2. Describe what React components are and why they matter
3. Use Claude Code to scaffold, build, and style a Next.js application
4. Deploy a working application to Vercel and share it with others

#### Lesson

**What Is a Web Application?**

A web application is a program that runs in a web browser. When you use Gmail, Google Docs, or Twitter, you are using web applications. Unlike apps you download from an app store, web apps live on the internet — anyone with the URL can use them.

Here is how they work, using a restaurant analogy:

```
┌──────────────────────┐          ┌──────────────────────┐
│      BROWSER          │          │       SERVER          │
│   (The Dining Room)   │  ◄────► │   (The Kitchen)       │
│                       │  HTTP    │                       │
│ - You see the menu    │ requests │ - Cooks prepare food  │
│ - You place orders    │          │ - Stores recipes      │
│ - You eat the food    │          │ - Manages ingredients │
└──────────────────────┘          └──────────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────────┐
                                  │      DATABASE         │
                                  │   (The Pantry)        │
                                  │                       │
                                  │ - Stores all data     │
                                  │ - Ingredients ready   │
                                  └──────────────────────┘
```

- **Browser** (dining room) — What the user sees and interacts with. This is the "front end."
- **Server** (kitchen) — The behind-the-scenes logic that processes requests. This is the "back end."
- **API** (the waiter) — Carries orders from the dining room to the kitchen and brings food back. API stands for "Application Programming Interface" — it is how the front end talks to the back end.
- **Database** (the pantry) — Where all the data is stored permanently. We will add a database in Week 5.

This week, we are building just the dining room (front end). The food will disappear when you close the restaurant (no database yet), but the experience will be real.

**HTML, CSS, and JavaScript in 30 Seconds**

Every web page is built with three languages:

- **HTML** (HyperText Markup Language) — The structure. Think of it as the skeleton of a building: walls, rooms, doors. HTML defines what is on the page: headings, paragraphs, buttons, images.

- **CSS** (Cascading Style Sheets) — The appearance. Think of it as paint, wallpaper, and furniture. CSS makes things look good: colors, fonts, spacing, layouts.

- **JavaScript** — The behavior. Think of it as the electrical wiring: lights turn on when you flip switches, doors open when you push them. JavaScript makes pages interactive: clicks do things, data updates, animations play.

You do not need to learn these languages in depth. Claude Code knows them deeply. But understanding what each one does helps you give Claude better instructions.

**React: Building with LEGO Bricks**

React is a popular toolkit for building web pages. The key idea is **components** — small, reusable pieces that snap together like LEGO bricks.

Imagine you are building a to-do list app. Instead of one giant page, you break it into components:

```
┌─────────────────────────────────────────┐
│              App Component               │
│  ┌───────────────────────────────────┐  │
│  │        Header Component           │  │
│  │  "My Task Manager"  [Search Box]  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │      AddTask Component            │  │
│  │  [Type a task...] [Add Button]    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │       TaskList Component          │  │
│  │  ┌────────────────────────────┐   │  │
│  │  │  TaskItem: "Buy groceries" │   │  │
│  │  │  [✓] [Delete]             │   │  │
│  │  └────────────────────────────┘   │  │
│  │  ┌────────────────────────────┐   │  │
│  │  │  TaskItem: "Read chapter"  │   │  │
│  │  │  [✓] [Delete]             │   │  │
│  │  └────────────────────────────┘   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

Each box is a component. The `TaskItem` component is reused for every task — you build it once, and React repeats it for each item in your list. When you want to change how tasks look, you edit one component and every task updates automatically.

**Next.js: The Project Wrapper**

Next.js is a framework built on top of React. Think of React as the LEGO bricks and Next.js as the instruction manual plus the baseplate. Next.js handles:

- **Routing** — Deciding which page to show when you click a link. If someone visits `/about`, Next.js shows the About page.
- **Server rendering** — Pre-building pages on the server so they load faster.
- **File-based routing** — You create a file called `about/page.tsx`, and Next.js automatically makes it available at `/about`. No configuration needed.

**Tailwind CSS: Styling Made Simple**

Tailwind CSS is a styling system that lets you describe how things look using short class names directly in your code:

```html
<button class="bg-blue-500 text-white px-4 py-2 rounded">
  Add Task
</button>
```

Reading this: `bg-blue-500` = blue background, `text-white` = white text, `px-4` = horizontal padding, `py-2` = vertical padding, `rounded` = rounded corners.

You do not need to memorize these classes. Claude Code knows all of them. When you say "make the button blue with rounded corners," Claude writes the correct Tailwind classes.

**Vercel: Free Hosting**

Vercel is a free platform that puts your app on the internet. When you "deploy" to Vercel, your app gets a real URL like `https://my-task-manager.vercel.app` that anyone in the world can visit.

Vercel works especially well with Next.js (the same company makes both). Deployment takes about 60 seconds.

**Environment Variables: App Settings**

Environment variables are settings your app needs to run — like API keys, database URLs, or feature flags. They are stored outside your code (so they are not visible in Git) and loaded at runtime.

```
# .env.local file (not committed to Git)
NEXT_PUBLIC_APP_NAME="My Task Manager"
DATABASE_URL="https://..."
```

Why not just put these values in the code? Because:
1. Secrets (API keys) should never be in Git — anyone could see them
2. Different environments (development, production) need different values
3. Changing a setting should not require changing code

**Building the Task Manager: Step by Step**

Here is how to direct Claude Code to build your first real app:

**Step 1: Scaffold the project**

```
$ mkdir ~/task-manager
$ cd ~/task-manager
$ claude
```

Prompt:

```
Create a new Next.js project in this directory with Tailwind CSS.
Use TypeScript. Set up the basic folder structure.
```

Claude will run `npx create-next-app@latest` with the right options and configure Tailwind.

**Step 2: Build the main component**

```
Build the main task manager page. I need:
- A text input where I can type a new task
- An "Add" button that adds the task to a list
- Each task should have a checkbox to mark it complete
- Each task should have a delete button
- Completed tasks should appear with a strikethrough
Store tasks in React state (no database yet).
```

**Step 3: Add styling**

```
Style the task manager with Tailwind CSS to look modern and clean.
Use a centered layout with a max width. Add hover effects on buttons.
Make it look professional.
```

**Step 4: Add search and filter**

```
Add a search bar at the top that filters tasks as I type.
Add filter buttons: All, Active, Completed.
```

**Step 5: Deploy**

```
Help me deploy this to Vercel. Walk me through the steps.
```

Claude will guide you through:
1. Installing the Vercel CLI: `npm install -g vercel`
2. Running `vercel` and following the prompts
3. Getting your live URL

#### Practice Exercises

**Exercise 1 (Guided): Scaffold and Run Locally**

Follow these steps:

```
$ mkdir ~/task-manager && cd ~/task-manager
$ claude
```

Ask Claude to create a Next.js project with Tailwind CSS. After it finishes:

```
$ npm run dev
```

Open your browser to `http://localhost:3000`. You should see the Next.js default page.

Verification: The page loads in your browser without errors. The terminal shows "Ready" with no red error messages.

**Exercise 2 (Independent): Build the Task Manager**

Goal: Use Claude Code to build a complete task manager with:
- Add tasks
- Mark tasks complete
- Delete tasks
- Search/filter tasks

Use Plan mode. Review every diff. Commit after each major feature with Git.

Hints:
- Start with the simplest version (just add and display tasks), then add features one at a time
- If Claude's code does not work, paste the error message and ask Claude to fix it
- Test in your browser after every change

Verification: The app works in the browser. You can add, complete, delete, and search tasks. Git log shows at least 3 commits.

**Exercise 3 (Challenge): Deploy to Vercel**

Deploy your task manager to Vercel and share the URL:
1. Ask Claude to help you deploy
2. Visit the live URL on your phone
3. Share the URL with someone and ask them to add a task
4. Add the live URL to your project README

Document any deployment issues you encountered and how you resolved them.

#### Self-Assessment Quiz

**1. In the restaurant analogy, what does the "waiter" (API) do?**

**2. What is a React component? Give an example from a to-do list app.**

**3. What is the difference between React and Next.js?**

**4. Why should you NOT put API keys directly in your code?**

> **Answers:**
>
> 1. The API (waiter) carries requests from the browser (dining room) to the server (kitchen) and brings responses back. For example, when you click "Add Task," the API sends that request to the server, which processes it and sends back a confirmation.
>
> 2. A React component is a small, reusable piece of a web page. In a to-do list app, `TaskItem` could be a component that displays one task with its checkbox and delete button. It is built once and reused for every task in the list.
>
> 3. React is a library for building user interface components (the LEGO bricks). Next.js is a framework built on React that adds routing, server rendering, and project structure (the instruction manual and baseplate). You need Next.js to create a complete web application; React alone gives you the building blocks.
>
> 4. API keys should not be in code because: (1) Anyone who sees your Git repository could steal them, (2) Different environments (development vs production) need different keys, and (3) Changing a key should not require changing and redeploying code. Instead, use environment variables stored in `.env` files that are excluded from Git.

---

### WEEK 5: Databases & APIs
**Subtitle:** Where your data lives
**Objective:** Connect your application to a real database and understand data flow.

**Topics:**
- What is a database and why you need one
- Supabase: your backend-as-a-service
- SQL basics: SELECT, INSERT, UPDATE, DELETE
- Database schema design
- API routes in Next.js
- CRUD operations (Create, Read, Update, Delete)
- Row Level Security basics

**Activities:**
- Set up a free Supabase project
- Design a schema for your task manager
- Ask Claude Code to create API routes
- Build forms to add and edit tasks
- Implement all CRUD operations
- Add basic data validation

**Deliverable:** Your task manager connected to Supabase with full CRUD operations — tasks are now saved permanently.
**Skills:** Database concepts, Supabase, SQL basics, API routes, CRUD operations

#### Learning Objectives

By the end of this week, you will be able to:

1. Explain what a database is and why web applications need one
2. Write basic SQL queries: SELECT, INSERT, UPDATE, DELETE
3. Design a simple database schema (tables, columns, data types)
4. Connect a Next.js application to Supabase
5. Implement full CRUD operations so data persists between sessions

#### Lesson

**Why Your Data Disappears**

Right now, your task manager from Week 4 has a problem: close the browser tab and all your tasks vanish. That is because the tasks only live in your browser's temporary memory (called "state" in React). When the page closes, the memory is wiped clean.

A database stores your data permanently on a server. It is like the difference between writing notes on a whiteboard (browser memory — erased when someone wipes the board) and writing them in a notebook (database — saved until you explicitly delete them).

**What Is a Database?**

A database is a super-powered spreadsheet. If you have ever used Google Sheets or Excel, you already understand the basic concept:

```
Tasks Table (like a spreadsheet tab)
┌────┬──────────────────┬───────────┬────────────┬─────────────────────┐
│ id │ title            │ completed │ priority   │ created_at          │
├────┼──────────────────┼───────────┼────────────┼─────────────────────┤
│  1 │ Buy groceries    │ false     │ high       │ 2026-02-10 09:00:00 │
│  2 │ Read chapter 3   │ true      │ medium     │ 2026-02-10 10:30:00 │
│  3 │ Call dentist     │ false     │ low        │ 2026-02-11 08:00:00 │
│  4 │ Write report     │ false     │ high       │ 2026-02-11 14:00:00 │
└────┴──────────────────┴───────────┴────────────┴─────────────────────┘
```

Key vocabulary:
- **Table** = A spreadsheet tab. Each table stores one type of thing (tasks, users, etc.)
- **Row** = One entry (one task, one user). Also called a "record."
- **Column** = One property of every entry (title, completed, priority). Also called a "field."
- **Schema** = The design of your tables — which columns exist, what type of data each holds.

**SQL: Talking to Your Database**

SQL (Structured Query Language, pronounced "sequel") is the language you use to talk to a database. It has four essential commands, and each one maps to something you do naturally:

**SELECT — Reading data** ("Show me...")

```sql
-- Show me all tasks
SELECT * FROM tasks;

-- Show me only incomplete tasks
SELECT * FROM tasks WHERE completed = false;

-- Show me task titles, sorted by priority
SELECT title, priority FROM tasks ORDER BY priority;
```

The `*` means "all columns." `WHERE` is a filter. `ORDER BY` sorts the results.

**INSERT — Adding data** ("Create a new...")

```sql
-- Add a new task
INSERT INTO tasks (title, completed, priority)
VALUES ('Buy groceries', false, 'high');
```

You specify the table, the columns, and the values. The `id` and `created_at` are usually generated automatically.

**UPDATE — Changing data** ("Change this to...")

```sql
-- Mark task 1 as completed
UPDATE tasks SET completed = true WHERE id = 1;

-- Change the priority of task 3
UPDATE tasks SET priority = 'high' WHERE id = 3;
```

Always include `WHERE` in an UPDATE — without it, you would change every row in the table.

**DELETE — Removing data** ("Get rid of...")

```sql
-- Delete task 4
DELETE FROM tasks WHERE id = 4;
```

Like UPDATE, always use `WHERE`. Running `DELETE FROM tasks` without WHERE deletes everything.

**CRUD: The Four Operations**

CRUD is an acronym for the four basic things you can do with data:

| Operation | SQL Command | What It Does | Example |
|-----------|-------------|-------------|---------|
| **C**reate | INSERT | Add new data | Add a new task |
| **R**ead | SELECT | View existing data | Show all tasks |
| **U**pdate | UPDATE | Change existing data | Mark a task complete |
| **D**elete | DELETE | Remove data | Delete a task |

Every data-driven application does these four things. Your task manager needs all four.

**Supabase: Your Database in the Cloud**

Supabase is a free service that gives you a database, an API, and authentication — all in one place. Think of it as a pre-built kitchen (from our restaurant analogy) that you can start using immediately, without building anything from scratch.

**Setting up Supabase:**

1. Go to https://supabase.com and create a free account
2. Click "New Project"
3. Choose a name (e.g., "task-manager") and a strong database password
4. Select a region close to you
5. Wait about 60 seconds for the project to set up

**Getting your keys:**

In your Supabase dashboard, go to Settings → API. You need two values:
- **Project URL** — Where your database lives (e.g., `https://abcdef.supabase.co`)
- **Anon Key** — A public key that lets your app talk to the database

Add these to your project's `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**Designing Your Schema**

Before writing code, design your database. For the task manager:

```sql
CREATE TABLE tasks (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  completed   BOOLEAN DEFAULT false,
  priority    TEXT DEFAULT 'medium',
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

Translation:
- `id` — A unique number for each task, generated automatically
- `title` — The task name, required (NOT NULL means it cannot be empty)
- `completed` — True or false, defaults to false (new tasks start incomplete)
- `priority` — Text like "high", "medium", "low", defaults to "medium"
- `created_at` — When the task was created, auto-filled with the current time

You can run this SQL in the Supabase dashboard under "SQL Editor."

**API Routes: The Waiter Between Your App and Database**

In Next.js, API routes are files in the `app/api/` folder that handle requests from your front end. They are the "waiter" carrying orders between the browser and the database.

When a user clicks "Add Task," the flow is:

```
Browser (click button)
    → API Route (/api/tasks)
        → Database (INSERT INTO tasks...)
        → Response (new task data)
    → Browser (update the list)
```

Ask Claude Code to create these API routes for you:

```
Create API routes for my task manager that connect to Supabase.
I need endpoints for:
- GET /api/tasks — list all tasks
- POST /api/tasks — create a new task
- PUT /api/tasks/[id] — update a task (mark complete, change title)
- DELETE /api/tasks/[id] — delete a task
Use the Supabase client library.
```

**Row Level Security**

Row Level Security (RLS) is a safety feature that controls who can see and modify which rows. Without RLS, anyone who knows your API URL could read or delete all your data.

For now, you can enable RLS on your tasks table and add a simple policy that allows all operations (since you do not have user authentication yet — that comes in Week 6):

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

In Week 6, you will replace this with proper user-based policies.

#### Practice Exercises

**Exercise 1 (Guided): Create Your Database Table**

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the CREATE TABLE statement from the lesson above
4. Go to Table Editor — you should see an empty "tasks" table
5. Manually insert a row using the Table Editor (click "Insert Row")
6. Run `SELECT * FROM tasks;` in the SQL Editor — your row should appear

Verification: The tasks table exists with 5 columns and at least 1 test row.

**Exercise 2 (Independent): Connect Your App to Supabase**

Goal: Modify your Week 4 task manager to load and save tasks from Supabase instead of browser memory.

1. Install the Supabase client: ask Claude "Add Supabase to my project"
2. Create API routes for all CRUD operations
3. Update the front end to fetch tasks from the API on page load
4. Update the "Add Task" button to send a POST request
5. Update the checkbox to send a PUT request
6. Update the delete button to send a DELETE request

Hints:
- Use Plan mode — this is a multi-step change
- Test each operation in the browser after implementing it
- Check the Supabase Table Editor to verify data is actually being saved

Verification: Close the browser, reopen it, and your tasks are still there. Check Supabase Table Editor — you should see all your tasks.

**Exercise 3 (Challenge): Add Data Validation**

Add validation so users cannot create invalid tasks:
- Task title must not be empty
- Task title must be at least 3 characters
- Priority must be one of: "high", "medium", "low"
- Show a user-friendly error message when validation fails

Implement validation on both the front end (before sending the request) and the API route (before inserting into the database). Why both? Because the front end can be bypassed — someone could send a request directly to your API.

#### Self-Assessment Quiz

**1. What is the difference between a table, a row, and a column in a database?**

**2. Write a SQL query that selects all tasks where `completed` is false, sorted by `created_at` from newest to oldest.**

**3. What does CRUD stand for, and what SQL command corresponds to each letter?**

**4. What is an API route in Next.js, and what role does it play?**

**5. Why is Row Level Security important, even for a simple app?**

> **Answers:**
>
> 1. A table is like a spreadsheet tab — it stores one type of thing (e.g., tasks). A row is one entry in the table (one specific task). A column is one property that every entry has (e.g., title, completed, priority).
>
> 2. `SELECT * FROM tasks WHERE completed = false ORDER BY created_at DESC;` — The `DESC` keyword means descending (newest first).
>
> 3. CRUD stands for Create (INSERT), Read (SELECT), Update (UPDATE), Delete (DELETE). These are the four basic operations you can perform on data.
>
> 4. An API route is a file in `app/api/` that handles requests from the browser. It acts as the "waiter" between the front end (browser) and the back end (database), processing requests and returning responses.
>
> 5. Without Row Level Security, anyone who discovers your API URL could read, modify, or delete all your data. RLS ensures that each user can only access their own data, even if someone bypasses your front-end code.

#### Cowork: Claude Code for Desktop
- **Cowork** brings Claude Code's agentic capabilities to the Claude desktop app. Give Claude access to a folder, set a task, and let it work — it loops you in along the way.
- Useful when you want Claude Code-style workflows without opening a terminal.
- Try it at [claude.com/download](https://claude.com/download).

#### Shell & Input Fixes (Feb 2026)

- **Shell completion cache** files no longer get truncated on exit (v2.1.21)
- **Full-width (zenkaku) input** from Japanese IME now works correctly in option selection prompts (v2.1.21, v2.1.31)
- **Tab key** fixed to properly autocomplete instead of queueing slash commands (v2.1.38)

---

### WEEK 6: Authentication & Dashboards
**Subtitle:** Real apps need real security
**Objective:** Add user authentication and build a professional dashboard.

**Topics:**
- Authentication concepts: login, sessions, tokens
- Supabase Auth integration
- Protected routes and middleware
- Dashboard design principles
- Data visualization with charts
- Responsive design (mobile + desktop)
- The /code-review workflow

**Activities:**
- Add Supabase Auth to your task manager
- Create login and signup pages
- Protect dashboard routes from unauthorized access
- Build a dashboard showing task statistics
- Add charts visualizing your productivity
- Make the dashboard responsive
- Run /code-review on your codebase

**Deliverable:** A secure, authenticated dashboard with data visualization.
**Skills:** Authentication, dashboards, error handling, /code-review, responsive design

#### Learning Objectives

By the end of this week, you will be able to:

1. Explain authentication vs authorization and why both matter
2. Implement user login and signup using Supabase Auth
3. Protect routes so only logged-in users can access them
4. Design and build a dashboard that displays meaningful data
5. Use /code-review to improve code quality

#### Lesson

**Authentication vs Authorization**

These two words sound similar but mean different things:

- **Authentication** = "Who are you?" — Proving your identity. Like showing your ID at the door. The login screen is authentication.
- **Authorization** = "What can you do?" — Checking what you are allowed to access. Like having a VIP wristband at a concert — you proved who you are (authentication), now the wristband determines which areas you can enter (authorization).

Why does this matter? Without authentication, anyone can see everyone's tasks. Without authorization, a logged-in user could delete someone else's data.

**How Login Works Under the Hood**

When you log in to a website, here is what happens behind the scenes:

```
1. You type your email and password
2. The browser sends them to the server
3. The server checks: "Does this email exist? Does the password match?"
4. If yes, the server creates a SESSION TOKEN — a long random string
5. The server sends the token back to the browser
6. The browser stores the token (usually in a cookie)
7. Every future request includes this token
8. The server checks the token: "Is this valid? Who does it belong to?"
```

A **session token** is like a wristband at a concert. You show your ID once at the entrance (login), get a wristband (token), and then just flash the wristband to enter different areas (make requests) without showing your ID again.

**Why Security Matters**

Without authentication:
- Anyone can see all users' private tasks
- Anyone can delete any task
- There is no way to know who created what
- Your app cannot be used by multiple people

**Supabase Auth: Adding Login to Your App**

Supabase includes a complete authentication system. Ask Claude Code:

```
Add Supabase Auth to my task manager. I need:
- A signup page with email and password
- A login page with email and password
- A logout button on the main page
- Only logged-in users should see the task list
- Each user should only see their own tasks
```

Supabase Auth handles:
- Storing passwords securely (hashed, never plain text)
- Creating session tokens
- Verifying tokens on every request
- Password reset emails

**Protected Routes: The Security Guard**

A protected route is a page that only logged-in users can see. If someone who is not logged in tries to visit `/dashboard`, they get redirected to `/login`.

In Next.js, you implement this with **middleware** — code that runs before a page loads, checking if the user has a valid session:

```
User visits /dashboard
    → Middleware checks: "Do they have a valid session token?"
        → Yes: Show the dashboard
        → No: Redirect to /login
```

Ask Claude Code to create this middleware for you. You do not need to write it from scratch.

**Updating Row Level Security**

Now that you have authentication, update your database security so each user can only see their own tasks:

```sql
-- First, add a user_id column to tasks
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Drop the old "allow all" policy
DROP POLICY "Allow all operations" ON tasks;

-- Create proper policies
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

`auth.uid()` is a Supabase function that returns the ID of the currently logged-in user. These policies mean: "You can only see, create, update, and delete tasks where `user_id` matches your own ID."

**Dashboard Design Principles**

A dashboard is a single page that shows the most important information at a glance. Good dashboards follow these principles:

1. **Hierarchy** — The most important information is biggest and most prominent
2. **Clarity** — Every number has a label; every chart has a title
3. **Actionable** — Data should lead to action ("You have 5 overdue tasks" → click to see them)
4. **No clutter** — Show only what matters; hide everything else

For your task manager dashboard, consider showing:
- Total tasks, completed tasks, pending tasks (stat cards)
- Tasks completed per day/week (line chart)
- Tasks by priority (pie or bar chart)
- Overdue tasks (highlighted list)

**Responsive Design: One App, Every Screen**

Responsive design means your app looks good on both a large desktop monitor and a small phone screen. The layout adjusts automatically based on screen size.

With Tailwind CSS, you use prefixes like `md:` and `lg:` to apply styles at different screen sizes:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- 1 column on phone, 2 on tablet, 4 on desktop -->
</div>
```

Ask Claude Code: "Make my dashboard responsive so it looks good on mobile and desktop."

**The /code-review Workflow**

Now that your project is getting larger, use Claude Code's built-in code review:

```
/code-review
```

Claude will analyze your codebase and provide feedback on:
- Code quality and readability
- Potential bugs or security issues
- Naming conventions
- Performance concerns
- Suggestions for improvement

Make it a habit to run `/code-review` after each major feature.

#### Practice Exercises

**Exercise 1 (Guided): Add Login and Signup**

1. Open your task manager project in Claude Code
2. Use Plan mode and ask: "Add Supabase Auth with login and signup pages"
3. Review Claude's plan — it should include creating auth pages, setting up middleware, and updating the database
4. Approve and let Claude implement
5. Test: Create an account, log out, log back in

Verification: You can create an account, log out, and log back in. When logged out, visiting the main page redirects to login.

**Exercise 2 (Independent): Build the Dashboard**

Goal: Create a `/dashboard` page that shows:
- Three stat cards (Total Tasks, Completed, Pending)
- At least one chart (tasks completed over time, or tasks by priority)
- A responsive layout that works on mobile

Hints:
- Ask Claude to recommend a charting library (Recharts works well with Next.js)
- Start with the stat cards, then add charts
- Test on mobile by resizing your browser window

Verification: The dashboard shows accurate statistics. Resizing the browser below 768px wide rearranges the layout to a single column.

**Exercise 3 (Challenge): Complete Code Review**

Run `/code-review` on your entire project. For each issue Claude identifies:
1. Understand why it is an issue
2. Decide if you agree with the suggestion
3. Fix at least 3 issues
4. Commit the fixes with descriptive messages

Document what you learned in a `notes/week6-review.md` file.

#### Self-Assessment Quiz

**1. What is the difference between authentication and authorization?**

**2. What is a session token, and what analogy describes how it works?**

**3. What does a "protected route" do?**

**4. Name two principles of good dashboard design.**

> **Answers:**
>
> 1. Authentication is proving who you are (like showing your ID). Authorization is determining what you are allowed to do (like having a VIP wristband). Authentication happens first — you must prove your identity before the system can check your permissions.
>
> 2. A session token is a long random string that the server creates after you log in successfully. It works like a wristband at a concert — you show your ID once at the entrance (login), get a wristband (token), and then flash the wristband for access to areas without showing your ID again.
>
> 3. A protected route is a page that only logged-in users can access. If someone without a valid session tries to visit it, they are automatically redirected to the login page.
>
> 4. Any two of: (1) Hierarchy — most important info is biggest, (2) Clarity — every number has a label, (3) Actionable — data should lead to action, (4) No clutter — show only what matters.

#### Authentication & Dashboard Updates (Feb 2026)
- **PDF page-range reading:** The Read tool now accepts a `pages` parameter for PDFs (e.g., `pages: "1-5"`). Large PDFs (>10 pages) return a lightweight reference when `@` mentioned instead of being inlined into context (v2.1.30)
- **Task management in VS Code:** Native plugin management support added, plus OAuth users can browse and resume remote Claude sessions from the Sessions dialog (v2.1.16)

**Exercise:**
- Use `@` to reference a large PDF in a Claude Code session and observe how it handles pagination
- Try resuming a remote session from VS Code's Sessions dialog

---

### WEEK 7: Testing & Quality
**Subtitle:** Maintaining code quality at scale
**Objective:** Understand why testing matters and how to direct Claude to write tests.

**Topics:**
- What are tests and why they matter
- Unit tests, integration tests, end-to-end tests
- The verification loop: instruct → code → test → verify
- Using Claude to write tests
- Reading test output
- The /code-review workflow

**Activities:**
- Ask Claude to write tests for your task manager
- Run the tests and read the output
- Find a bug → write a test → fix the bug
- Use /code-review to audit your project
- Add test commands to CLAUDE.md

**Deliverable:** Your task manager app with a test suite that runs automatically.
**Skills:** Testing concepts, verification loops, quality assurance

#### Learning Objectives

By the end of this week, you will be able to:

1. Explain what a test is and why software projects need them
2. Distinguish between unit tests, integration tests, and end-to-end tests
3. Read test output to understand what passed, what failed, and why
4. Direct Claude Code to write meaningful tests for your application
5. Follow the red-green-refactor cycle to fix bugs systematically

#### Lesson

**What Is a Test?**

A test is code that checks if your other code works correctly. Think of it like a smoke detector — you install it once, and it alerts you whenever something goes wrong, even when you are not paying attention.

Without tests, the only way to know if your app works is to manually click through every feature after every change. That might work when your app has 2 features, but what about 20? Or 200? You will miss something. Tests check automatically, every time, without getting tired or distracted.

**Why Code Breaks**

Code breaks for three main reasons:

1. **Edge cases** — Situations you did not think of. What happens if a user submits an empty task? What if they paste in 10,000 characters? What if they click "Delete" twice quickly?

2. **Regressions** — You fix one thing and accidentally break something else. You change how tasks are saved, and now the search filter stops working. This is the most common type of bug in growing applications.

3. **Typos and logic errors** — Simple mistakes like writing `>` when you meant `<`, or forgetting to handle the case where the task list is empty.

Tests catch all three. Once you write a test for a feature, that feature is protected forever.

**Types of Tests**

There are three main types, each checking at a different level:

**Unit Tests — Testing One Brick**

A unit test checks one small piece of code in isolation. Like testing a single LEGO brick to make sure it is the right shape and color.

```
Test: "formatDate should return a human-readable date"
Input: "2026-02-10T09:00:00Z"
Expected: "February 10, 2026"
```

Unit tests are small, fast, and numerous. A project might have hundreds of unit tests.

**Integration Tests — Testing Bricks Together**

An integration test checks that multiple pieces work correctly together. Like testing that two LEGO bricks actually snap together properly.

```
Test: "Adding a task should save to the database and appear in the task list"
Steps: Call the API to create a task → Query the database → Check the task exists
```

Integration tests are slower but catch problems that unit tests miss — like miscommunication between your front end and your API.

**End-to-End Tests — Testing the Whole House**

An end-to-end (E2E) test simulates a real user using your app. Like moving into the LEGO house and checking if the doors open, the lights turn on, and the plumbing works.

```
Test: "A user can sign up, create a task, mark it complete, and delete it"
Steps: Open the browser → Fill in signup form → Click Create Task → Check the checkbox → Click Delete → Verify it is gone
```

E2E tests are the slowest but most realistic. They catch bugs that only appear when everything runs together.

**The Testing Pyramid**

```
        /\
       /  \      End-to-End
      / E2E\     (few, slow, realistic)
     /------\
    /        \   Integration
   / Integr.  \  (some, medium speed)
  /------------\
 /              \ Unit
/    Unit Tests  \ (many, fast, focused)
/________________\
```

Most of your tests should be unit tests (fast, cheap), some should be integration (medium), and a few should be E2E (slow, expensive). This is called the "testing pyramid."

**The Red-Green-Refactor Cycle**

This is a systematic way to fix bugs and add features using tests:

1. **Red** — Write a test that describes what SHOULD happen. Run it. It fails (red) because the feature does not exist or the bug is present. This proves your test actually detects the problem.

2. **Green** — Write the minimum code to make the test pass. Run it. It passes (green). The feature works or the bug is fixed.

3. **Refactor** — Clean up the code you just wrote, making it more readable or efficient. Run the tests again to make sure they still pass.

```
RED:      Write a failing test     →  ✗ FAIL (expected)
GREEN:    Write code to fix it     →  ✓ PASS (feature works)
REFACTOR: Clean up the code        →  ✓ PASS (still works)
```

Example: Your search filter does not handle uppercase letters. A user searches "BUY" but the task "Buy groceries" does not appear.

1. Red: Write a test — `search("BUY")` should return "Buy groceries". Run it. It fails.
2. Green: Fix the search to be case-insensitive. Run the test. It passes.
3. Refactor: Clean up the search function code. Run the test again. Still passes.

**Test Syntax Basics**

Most JavaScript testing uses a framework called Jest or Vitest. The syntax looks like this:

```javascript
describe('Task Manager', () => {
  it('should add a new task', () => {
    const tasks = [];
    const newTask = addTask(tasks, 'Buy groceries');
    expect(newTask.title).toBe('Buy groceries');
    expect(newTask.completed).toBe(false);
  });

  it('should mark a task as completed', () => {
    const task = { title: 'Buy groceries', completed: false };
    const updated = completeTask(task);
    expect(updated.completed).toBe(true);
  });
});
```

Reading this:
- `describe` — Groups related tests together ("Task Manager")
- `it` — One individual test ("should add a new task")
- `expect` — States what the result SHOULD be
- `.toBe()` — Checks that the actual result matches the expected result

**Reading Test Output**

When you run tests, the output looks like this:

```
 PASS  tests/tasks.test.js
  Task Manager
    ✓ should add a new task (3ms)
    ✓ should mark a task as completed (1ms)
    ✓ should delete a task (2ms)
    ✗ should filter tasks by search term (5ms)

  3 passed, 1 failed

  FAIL: should filter tasks by search term
    Expected: ["Buy groceries"]
    Received: []
```

Green ✓ means pass. Red ✗ means fail. The failure message tells you exactly what went wrong: the search returned an empty array instead of finding "Buy groceries."

**How to Prompt Claude for Good Tests**

When asking Claude to write tests, be specific:

```
Write tests for my task manager that cover:
1. Adding a new task (title, default completed=false)
2. Marking a task as completed
3. Deleting a task
4. Searching tasks (case-insensitive)
5. Filtering tasks (all, active, completed)
6. Edge cases: empty title, very long title, special characters

Use Vitest. Put tests in a __tests__ folder.
```

The more scenarios you describe, the better the tests will be.

**Adding Test Commands to CLAUDE.md**

Update your CLAUDE.md so Claude knows how to run tests:

```markdown
## Commands
- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm test` — Run all tests
- `npm test -- --watch` — Run tests in watch mode (re-runs on file changes)
```

This way, Claude can run tests as part of its workflow without you telling it every time.

#### Practice Exercises

**Exercise 1 (Guided): Your First Test**

1. Ask Claude: "Set up Vitest for my project and write a simple test"
2. Run the tests: `npm test`
3. Read the output — identify which tests passed and which failed (if any)
4. Ask Claude to add 3 more tests for your task creation function

Verification: Running `npm test` shows at least 4 passing tests. The output clearly shows test names and results.

**Exercise 2 (Independent): Red-Green-Refactor**

Goal: Use the red-green-refactor cycle to fix a real bug.

1. Find something in your app that does not work correctly (or intentionally introduce a bug — for example, make the search case-sensitive)
2. Write a test that exposes the bug — it should fail (RED)
3. Fix the code — the test should now pass (GREEN)
4. Clean up your code — the test should still pass (REFACTOR)
5. Commit with a message like: "Fix case-sensitive search with test"

Hints:
- If you cannot find a real bug, try these intentional ones: search does not handle uppercase, deleting the last task causes an error, empty task titles are allowed

Verification: Git log shows a commit with a test fix. Running `npm test` shows all tests passing.

**Exercise 3 (Challenge): Comprehensive Test Suite**

Ask Claude to write a comprehensive test suite covering:
- All CRUD operations (create, read, update, delete tasks)
- Search and filter functionality
- Edge cases (empty inputs, special characters, very long inputs)
- API route responses (correct status codes, error handling)

Run `/code-review` afterward and fix any issues Claude identifies.

Target: At least 10 tests covering different scenarios.

#### Self-Assessment Quiz

**1. What is a unit test? Give an example from a to-do list app.**

**2. Explain the red-green-refactor cycle in your own words.**

**3. What is a regression, and how do tests prevent them?**

**4. In test output, what does a failing test tell you?**

**5. Why should you add test commands to your CLAUDE.md file?**

> **Answers:**
>
> 1. A unit test checks one small piece of code in isolation. Example: testing that the `addTask` function creates a new task with the correct title and `completed` set to false.
>
> 2. Red-green-refactor is a three-step cycle: (1) Write a test that fails, proving the bug exists or the feature is missing (red). (2) Write the minimum code to make the test pass (green). (3) Clean up the code while keeping the test passing (refactor).
>
> 3. A regression is when fixing or changing one thing accidentally breaks something else. Tests prevent regressions because once you write a test for a feature, that test runs every time you make any change. If your change breaks the feature, the test immediately fails and alerts you.
>
> 4. A failing test shows: (1) The test name — what was being tested, (2) The expected result — what should have happened, (3) The actual result — what actually happened. This tells you exactly where and how the code is wrong.
>
> 5. Adding test commands to CLAUDE.md tells Claude how to run your tests. Claude can then automatically run tests as part of its workflow — for example, running tests after making changes to verify nothing broke. Without these commands in CLAUDE.md, you would need to tell Claude how to run tests every session.

---

### WEEK 8: Second Project — Domain Deep Dive
**Subtitle:** Building something only YOU could design
**Objective:** Apply everything learned to build a second, more complex application.

**Topics:**
- Project scoping: defining requirements
- Breaking complex projects into phases
- Working with external APIs
- Data visualization: charts, maps
- Progressive enhancement
- Documentation: READMEs that matter

**Activities:**
- Choose your second project — pick something you personally care about
- Write a detailed project brief
- Build in phases: data first, then logic, then UI, then polish
- Deploy to Vercel with a professional README
- Self-review using /code-review

**Deliverable:** A second deployed application solving a real problem that matters to you.
**Skills:** Project scoping, phased development, external APIs, data visualization

#### Learning Objectives

By the end of this week, you will be able to:

1. Scope a project by defining an MVP (minimum viable product)
2. Write user stories that describe features from the user's perspective
3. Work with external APIs (understand API keys, rate limits, and documentation)
4. Build in phases, shipping a working version at each stage
5. Write a professional README that helps others understand and use your project

#### Lesson

**Project Scoping: What to Build**

This week you will build a second application — one you choose yourself. The best projects are ones you will actually use. Here are some ideas:

- **Habit Tracker** — Track daily habits (exercise, reading, water intake) with streaks and charts
- **Book Reading Log** — Record books you have read, want to read, with ratings, notes, and recommendations
- **Local Weather Dashboard** — Pull real-time weather data for your city with forecasts and historical charts
- **Recipe Collection** — Store, search, and organize your favorite recipes by ingredient, cuisine, or meal type
- **Expense Tracker** — Log daily expenses, categorize them, and visualize spending patterns
- **Workout Logger** — Track exercises, sets, reps, and progress over time

Or pick anything that excites you. The goal is genuine motivation — you will work harder and learn more building something you actually want.

**Scoping: From Dream to MVP**

The biggest mistake beginners make is trying to build everything at once. The solution is an **MVP (Minimum Viable Product)** — the smallest version of your app that is actually useful.

Ask yourself: "If I could only build 3 features, which ones would make this app worth using?"

Example for a Habit Tracker:
- Dream version: Custom habits, daily tracking, weekly/monthly charts, friend challenges, push notifications, AI-powered suggestions, social feed...
- MVP: Create habits. Check them off daily. See a 7-day streak count.

The MVP is version 1.0. Everything else is version 2.0, 3.0, etc. Ship the MVP first, then iterate.

**User Stories: Describing Features**

User stories describe features from the user's perspective. They follow a simple format:

```
As a [type of user], I want to [do something], so that [benefit].
```

Examples for a Habit Tracker:
- "As a user, I want to create a new habit with a name, so I can track it daily."
- "As a user, I want to check off a habit for today, so I can record my progress."
- "As a user, I want to see my current streak for each habit, so I stay motivated."

Write 5-8 user stories for your MVP. These become your checklist during development.

**Working with External APIs**

Many interesting apps pull data from external services. An external API is someone else's server that provides data you can use in your app.

**What is an API key?**
Most APIs require a key — a unique string that identifies you. It is like a library card: the library (API) needs to know who you are and how much you are using their resources.

To get an API key:
1. Sign up on the API provider's website
2. Navigate to their developer dashboard
3. Generate an API key
4. Store it in your `.env.local` file (never commit it to Git!)

**Rate limits:**
APIs limit how many requests you can make per minute/hour/day. This prevents abuse. A free tier might allow 100 requests per day. If you hit the limit, you get an error.

**Reading API documentation:**
Every API has docs explaining what data is available and how to request it. Ask Claude Code: "Read the OpenWeather API docs and show me how to get the current weather for a city."

Popular free APIs for projects:
- **OpenWeather** — Weather data (free tier: 1,000 calls/day)
- **Open Library** — Book data (no key needed)
- **Spoonacular** — Recipe data (free tier: 150 calls/day)
- **NewsAPI** — News articles (free tier: 100 calls/day)

**Building in Phases**

Build your project in this order:

1. **Phase 1: Data** — Design your database schema. What tables do you need? What columns? Set up Supabase tables.

2. **Phase 2: Logic** — Build your API routes. Create, read, update, delete your data. Test each endpoint.

3. **Phase 3: Interface** — Build the user-facing pages. Connect them to your API. Make the basic flow work.

4. **Phase 4: Polish** — Improve styling, add animations, handle edge cases, fix bugs. Make it professional.

At the end of each phase, you should have a working (if incomplete) app. This is called **progressive enhancement** — your app gets better layer by layer, and it works at every layer.

**Writing READMEs That Matter**

A README is the front door of your project. When someone visits your GitHub repository, the README is the first thing they see. A good README answers:

1. **What is this?** — One sentence explaining the project
2. **Why does it exist?** — The problem it solves
3. **What does it look like?** — A screenshot or demo link
4. **How do I set it up?** — Step-by-step installation instructions
5. **How do I use it?** — Key features and how to access them
6. **What technologies does it use?** — Tech stack list

Ask Claude Code: "Write a professional README for my project that includes setup instructions, a feature list, and a tech stack section."

#### Practice Exercises

**Exercise 1 (Guided): Project Brief and Schema**

1. Choose your project from the ideas above (or your own)
2. Write 5 user stories for your MVP
3. Design the database schema (tables and columns)
4. Ask Claude Code to create the Supabase tables
5. Insert 3-5 test rows of data manually

Verification: Your Supabase dashboard shows the tables with test data. Your user stories are documented in a `docs/project-brief.md` file.

**Exercise 2 (Independent): Build the MVP**

Goal: Build and deploy a working MVP with at least these features:
- User can create new items (habits, books, recipes, etc.)
- User can view all items in a list
- User can update or delete items
- Data is saved permanently in Supabase
- App is deployed to Vercel

Use Plan mode for the overall architecture, then build phase by phase. Commit after each phase.

Hints:
- Reuse patterns from your task manager (CRUD, auth, Tailwind)
- Ask Claude to help you integrate any external API you need
- Test thoroughly after each phase before moving to the next

Verification: The app is live on Vercel. You can perform all CRUD operations. Data persists after closing the browser.

**Exercise 3 (Challenge): Professional Polish**

Take your deployed MVP and make it professional:
- Add a chart or visualization (use Recharts or similar)
- Write a complete README with screenshots
- Add authentication (if not already done)
- Run `/code-review` and fix all issues
- Share the GitHub link and live URL

Document your development process in a `docs/build-log.md` — what went well, what was hard, what you would do differently.

#### Self-Assessment Quiz

**1. What is an MVP, and why should you build one before the "full" version?**

**2. Why should you scope a project before building it?**

**3. What is an API rate limit, and what happens if you exceed it?**

**4. What are the essential sections of a good README?**

> **Answers:**
>
> 1. MVP stands for Minimum Viable Product — the smallest version of your app that is actually useful. You build the MVP first because trying to build everything at once leads to overwhelm, unfinished projects, and wasted effort. Ship the MVP, get feedback, then add features iteratively.
>
> 2. Scoping means defining exactly what you will build before you start. Without scoping, you might start building, realize the project is too big, and abandon it. Scoping helps you identify the MVP, set realistic goals, and build in an organized sequence.
>
> 3. A rate limit is the maximum number of API requests you can make in a given time period (e.g., 100 requests per day). If you exceed it, the API returns an error instead of data. You should handle rate limit errors gracefully in your code and cache responses when possible.
>
> 4. A good README includes: (1) What the project is (one sentence), (2) Why it exists (the problem it solves), (3) What it looks like (screenshot or demo link), (4) How to set it up (installation steps), (5) How to use it (key features), (6) What technologies it uses (tech stack).

#### Claude Developer Platform & Web Access

- **Claude Developer Platform** ([platform.claude.com](https://platform.claude.com/)) — Centralized hub for managing API keys, usage, billing, and project configuration.
  - API key management and rotation
  - Usage dashboards and token consumption tracking
  - Project and organization settings
  - Model access configuration
- **Claude Code on the Web** ([claude.ai/code](https://claude.ai/code)) — Browser-based access to Claude Code. Complements the CLI workflow for quick tasks or when terminal access isn't available.

**Exercise:** Visit the Claude Developer Platform and explore the usage dashboard. Review your API key setup and ensure your Claude Code CLI is authenticated correctly. Identify how token usage maps to the sessions you've run.

#### Claude Developer Platform (Updated Feb 2026)

The **Claude Developer Platform** (platform.claude.com) is where you manage your API keys, monitor usage, and configure settings for building applications with Claude.

- **API key management:** Create, rotate, and revoke API keys
- **Usage monitoring:** Track token consumption and costs across your projects
- **Model access:** View which models are available on your plan
- **Workspaces:** Organize projects and API keys by team or purpose

> **Bookmark it:** Visit [platform.claude.com](https://platform.claude.com) and familiarize yourself with the dashboard — you'll use it throughout your projects.

---

## Phase III: Mastery (Weeks 9–12)

### WEEK 9: Skills, Hooks & Custom Commands
**Subtitle:** Teaching Claude YOUR workflow
**Objective:** Deep dive into Claude Code's extensibility system.

**Topics:**
- Skills: SKILL.md files for project patterns
- Skill frontmatter: name, description, allowed-tools, context, agent, model, hooks
- How skills auto-invoke based on context matching
- Custom slash commands via .claude/commands/
- Hooks: 14 events covering the full Claude Code lifecycle
- Three hook types: command, prompt, agent
- Hook decision control: exit codes, JSON decision patterns
- Async hooks for non-blocking background execution

**Activities:**
- Create a custom skill for your project with supporting files
- Create a skill with `context: fork` that runs in an Explore subagent
- Write a `PreToolUse` command hook that validates Bash commands before execution
- Write a `Stop` prompt hook that checks if all tasks are complete before Claude stops
- Create a custom /deploy command with `disable-model-invocation: true`
- Test skill auto-invocation and argument passing
- Build an async `PostToolUse` hook that runs tests in the background after file edits
- Use dynamic context injection in a PR summary skill

**Deliverable:** At least 2 custom skills (one forked, one inline), 3 hooks (command, prompt, agent types), and 1 custom command.
**Skills:** Skills system, hooks (all 3 types), custom commands, workflow automation, skill forking

#### Learning Objectives

By the end of this week, you will be able to:

1. Create custom skills with SKILL.md files that automate repetitive project workflows
2. Explain the three hook types (command, prompt, agent) and when to use each
3. Write hooks that validate, log, and control Claude Code's behavior
4. Build a custom slash command for common project operations
5. Use advanced skill features like forked context and dynamic injection

#### Lesson

**Why Extensibility Matters**

So far, you have used Claude Code's built-in features. But every project and every developer has unique workflows. Maybe you always want tests to run after editing a file. Maybe you need Claude to follow specific coding standards. Maybe you want a one-command deploy workflow.

Skills, hooks, and custom commands let you teach Claude Code your specific workflow — turning it from a general-purpose assistant into a custom tool built for your project.

**Skills: Teaching Claude Project Patterns**

A **skill** is a SKILL.md file that tells Claude how to handle a specific type of task. Skills live in your project's `.claude/skills/` directory.

Think of skills as recipe cards for Claude. Instead of explaining your deployment process every time, you write a skill once and Claude follows it automatically.

**Basic skill example** (`.claude/skills/deploy.md`):

```markdown
---
name: deploy
description: Deploy the application to production
allowed-tools: ["Bash", "Read"]
---

# Deploy Workflow

1. Run `npm run build` and verify no errors
2. Run `npm test` and verify all tests pass
3. Run `npx vercel deploy --prod`
4. Verify the deployment URL is accessible
```

Now you can type `/deploy` and Claude follows these exact steps.

**Skill frontmatter** (the section between `---` marks) controls behavior:

| Field | What It Does |
|-------|-------------|
| `name` | The slash command name (e.g., `/deploy`) |
| `description` | What the skill does (shown in `/help`) |
| `allowed-tools` | Which tools Claude can use (limits scope) |
| `context: fork` | Run in a separate subagent (isolated context) |
| `model` | Which AI model to use for this skill |
| `disable-model-invocation` | If true, Claude cannot trigger this skill itself — only you can |
| `user-invocable` | If false, only Claude can trigger it (not you) |

**Auto-invocation:** Skills can match context automatically. If you describe a skill well, Claude recognizes when to use it without you typing the slash command. For example, a skill named "code-review" with description "Review code for quality and bugs" might activate when you say "review my code."

**Dynamic context injection:** Use backtick-wrapped shell commands to inject live data into skills:

```markdown
# PR Summary Skill

Current PR diff:
!`gh pr diff`

Summarize the changes above.
```

The `!`gh pr diff`` runs before Claude sees the skill, replacing itself with the actual output.

**Hooks: Automating Claude's Lifecycle**

Hooks are event handlers — code that runs automatically when specific things happen in Claude Code. Think of them as tripwires: when Claude is about to do something (or just did something), your hook fires.

**The 14 hook events:**

| Event | When It Fires | Can Block? |
|-------|---------------|------------|
| `SessionStart` | Session begins or resumes | No |
| `UserPromptSubmit` | You submit a prompt | Yes |
| `PreToolUse` | Before a tool call executes | Yes |
| `PermissionRequest` | When a permission dialog appears | Yes |
| `PostToolUse` | After a tool call succeeds | No |
| `PostToolUseFailure` | After a tool call fails | No |
| `Notification` | When Claude sends a notification | No |
| `SubagentStart` | When a subagent is spawned | No |
| `SubagentStop` | When a subagent finishes | Yes |
| `Stop` | When Claude finishes responding | Yes |
| `TeammateIdle` | When a teammate is about to go idle | Yes |
| `TaskCompleted` | When a task is marked completed | Yes |
| `PreCompact` | Before context compaction | No |
| `SessionEnd` | When a session terminates | No |

**Three Hook Types**

| Type | How It Works | Use When |
|------|-------------|----------|
| `command` | Runs a shell script. Exit 0 = proceed, exit 2 = block. | Deterministic rules (linting, logging, validation) |
| `prompt` | Sends a prompt to a Claude model for yes/no judgment. | Decisions requiring judgment |
| `agent` | Spawns a subagent that can read files and run tools (up to 50 turns). | Verification requiring codebase inspection |

**Command hook example** — Block dangerous Bash commands:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.command' | grep -q 'rm -rf' && exit 2 || exit 0"
      }]
    }]
  }
}
```

This hook fires before every Bash command. It checks if the command contains `rm -rf`. If yes, it blocks (exit 2). If no, it proceeds (exit 0).

**Prompt hook example** — Check task completeness before stopping:

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "prompt",
        "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains\"}."
      }]
    }]
  }
}
```

**Agent hook example** — Verify tests pass before stopping:

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "agent",
        "prompt": "Run the test suite and verify all tests pass. $ARGUMENTS",
        "timeout": 120
      }]
    }]
  }
}
```

**Advanced Hook Features:**
- **Async hooks**: Set `"async": true` to run in the background without blocking Claude
- **Matchers**: Regex patterns that filter when hooks fire (e.g., `Bash`, `Edit|Write`)
- **`/hooks` menu**: Type `/hooks` to interactively manage hooks
- **Stop hook loop prevention**: Check `stop_hook_active` field to prevent infinite loops

**Custom Slash Commands**

For simpler automation, create custom commands in `.claude/commands/`:

```markdown
<!-- .claude/commands/test-all.md -->
Run the full test suite with `npm test`. If any tests fail,
analyze the failures and suggest fixes. Show a summary of
pass/fail counts at the end.
```

Now typing `/test-all` runs this command. Arguments are available via `$ARGUMENTS`, `$0`, `$1`, etc.

#### Practice Exercises

**Exercise 1 (Guided): Create Your First Skill**

1. Create the directory: `mkdir -p .claude/skills`
2. Create `.claude/skills/deploy.md` with:

```markdown
---
name: deploy
description: Build, test, and deploy to Vercel
allowed-tools: ["Bash", "Read"]
disable-model-invocation: true
---

# Deploy to Production

Follow these steps exactly:
1. Run `npm run build` — stop if there are errors
2. Run `npm test` — stop if any tests fail
3. Run `npx vercel deploy --prod`
4. Report the deployment URL
```

3. Test it by typing `/deploy` in a Claude Code session

Verification: Typing `/deploy` triggers the full build-test-deploy workflow. The deployment URL is reported at the end.

**Exercise 2 (Independent): Write Three Hooks**

Goal: Create one hook of each type:

1. **Command hook** — Log every Bash command to a file (`echo "$command" >> .claude/command-log.txt`)
2. **Prompt hook** — Before stopping, ask Claude to verify the code is properly formatted
3. **Agent hook** — After file edits, verify the project still builds successfully

Add these to `.claude/settings.json`.

Hints:
- Start with the command hook (simplest)
- Use `/hooks` to verify they are registered
- Test each hook by triggering the relevant event

Verification: After a session, `.claude/command-log.txt` contains logged commands. The prompt hook prevents stopping if code is not formatted. The agent hook catches build errors.

**Exercise 3 (Challenge): Advanced Skill with Forked Context**

Create a skill that:
- Uses `context: fork` to run in an isolated subagent
- Injects dynamic context with `!`command`` syntax
- Has supporting files (a template or example file)
- Accepts arguments via `$ARGUMENTS`

Example: A "pr-summary" skill that generates a PR description from the current Git diff.

#### Self-Assessment Quiz

**1. What is a skill in Claude Code, and how is it different from a custom command?**

**2. Name the three hook types and when you would use each one.**

**3. What does `exit 2` mean in a command hook?**

**4. What does `context: fork` do in a skill's frontmatter?**

**5. How do you prevent a Stop hook from creating an infinite loop?**

> **Answers:**
>
> 1. A skill is a SKILL.md file with frontmatter that defines a reusable workflow. It can auto-invoke based on context, control which tools are available, and run in forked subagents. A custom command is a simpler `.md` file in `.claude/commands/` that defines a prompt template. Skills are more powerful — they supersede custom commands.
>
> 2. Command hooks run a shell script for deterministic rules (logging, validation). Prompt hooks send a prompt to a Claude model for judgment-based decisions. Agent hooks spawn a subagent that can read files and run tools for complex verification.
>
> 3. Exit code 2 in a command hook means "block this action." Exit 0 means "allow it to proceed."
>
> 4. `context: fork` runs the skill in an isolated subagent with its own context window, keeping the main conversation context clean.
>
> 5. Check the `stop_hook_active` field in the event data. If it is `true`, exit 0 immediately — this means the Stop hook already fired and you should let Claude stop to avoid an infinite loop.

#### Skills, Hooks & Commands Updates (Feb 2026)
- **Custom command argument shorthand:** Use `$0`, `$1`, etc. to access individual arguments in custom commands (v2.1.19)
- **`CLAUDE_CODE_ENABLE_TASKS` env var:** Set to `false` to revert to the old task system temporarily (v2.1.19)
- **`TeammateIdle` and `TaskCompleted` hook events** added for multi-agent workflows (v2.1.33)
- **Bash permission matching** fixed for commands using environment variable wrappers (v2.1.38)
- **Sandbox bypass fix:** Commands excluded from sandboxing via `sandbox.excludedCommands` or `dangerouslyDisableSandbox` no longer bypass the Bash ask permission rule when `autoAllowBashIfSandboxed` is enabled (v2.1.34)

#### Non-Interactive Mode & CI Automation

- **Structured outputs** in non-interactive (`-p`) mode are now fully supported (v2.1.22). Use `-p` with `--output-format json` to get structured responses for scripts and CI pipelines.
- **Startup performance** improved when resuming sessions with `saved_hook_context` (v2.1.29).
- **Gateway compatibility:** Users on Bedrock or Vertex can set `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` to avoid beta header validation errors (v2.1.25, v2.1.27).

**Exercise:**
- Run `claude -p "list all files" --output-format json` and parse the structured output in a bash script
- Set up a CI step that uses Claude Code in non-interactive mode

#### Auto Memory (Feb 2026)

As of v2.1.32, Claude Code **automatically records and recalls memories** as it works. This is a significant change to how context persists across sessions.

**How it works:**
- Claude maintains a persistent memory directory at `~/.claude/projects/<project>/memory/`
- `MEMORY.md` is loaded into the system prompt each session (keep it under 200 lines)
- Separate topic files (e.g., `debugging.md`, `patterns.md`) can hold detailed notes
- Memories persist across conversations automatically

**What Claude saves:**
- Stable patterns confirmed across multiple interactions
- Key architectural decisions and important file paths
- User preferences for workflow and tools
- Solutions to recurring problems

**What Claude does NOT save:**
- Session-specific or temporary state
- Unverified conclusions from a single file read
- Anything duplicating CLAUDE.md instructions

**Exercise:** After a few sessions on a project, inspect `~/.claude/projects/` to see what Claude has remembered. Try asking Claude to "remember" a preference (e.g., "always use bun instead of npm") and verify it persists in the next session.


#### Case Study: Collapsing 35,000 Lines into a Single Markdown File

A community project demonstrated an extreme approach to agent architecture: compressing a 35,000-line AI data analyst (17 agents, 30 skills) into a single 1,398-line markdown file that regenerates itself from scratch.

**Key takeaways for Claude Code users:**
- **Markdown as architecture:** Instead of complex code, the entire agent system is defined in a structured markdown file that Claude Code can read and execute.
- **Self-regenerating agents:** The system can regrow itself from the markdown specification, making it highly portable and version-controllable.
- **Skills + Hooks pattern:** The 30 skills map directly to the skills and hooks concepts covered this week.

> **Exercise:** Consider one of your projects. Could you describe its architecture in a single markdown file that Claude Code could use to rebuild it? Try writing a simplified version.

---

### WEEK 10: MCP Servers & Plugins
**Subtitle:** Connecting Claude to your toolchain
**Objective:** Learn Model Context Protocol to connect Claude Code to external tools.

**Topics:**
- What is MCP and why it matters
- MCP vs AI Agents: standards vs decision-makers
- MCP architecture: servers, tools, resources, prompts
- Transport types: stdio, sse, streamable-http
- MCP scopes: user, project, session
- Building an MCP server with Python (FastMCP)
- Tool definitions with Pydantic models
- MCP resources and prompts
- Tool Search for dynamic tool discovery
- OAuth authentication for MCP servers
- claude mcp serve: running Claude Code as an MCP server
- Connecting and managing MCP servers

**Activities:**
- Build an MCP server (weather lookup, book search, or task statistics)
- Connect it to Claude Code using `claude mcp add`
- Use MCP tools in a real workflow
- Explore community MCP servers (GitHub, Slack, etc.)
- Set up an MCP server with OAuth authentication
- Test Tool Search with `ENABLE_TOOL_SEARCH=true`
- Use `@` mentions to reference MCP resources
- Try `claude mcp serve` to expose Claude Code as an MCP server

**Deliverable:** Two working MCP servers connected to Claude Code, with OAuth on at least one.
**Skills:** MCP architecture, FastMCP, tool design, server integration, OAuth, tool search, resources

#### Learning Objectives

By the end of this week, you will be able to:

1. Explain what MCP is and why it exists as an open standard
2. Describe the difference between MCP (a protocol) and AI agents (decision-makers)
3. Build a simple MCP server using Python and FastMCP
4. Connect MCP servers to Claude Code and use them in workflows
5. Understand MCP resources, prompts, and Tool Search

#### Lesson

**What Is MCP?**

MCP (Model Context Protocol) is a standard for connecting AI assistants to external tools and services. Think of it as a **USB port for AI** — just as USB lets any device connect to any computer, MCP lets any tool connect to any AI assistant.

Before MCP, if you wanted Claude to check the weather, you would need custom integration code. With MCP, you build a weather MCP server once, and it works with Claude Code, Claude.ai, or any other MCP-compatible assistant.

**MCP vs AI Agents**

These terms often get confused:

- **MCP** is a communication standard. It defines **what tools exist** and how to use them. Like a menu at a restaurant — it lists available dishes and how to order.
- **AI Agents** are autonomous decision-makers that **use** MCP tools. Like the chef who reads the menu, decides which dishes to prepare, and executes the recipes.

MCP does not think or decide. It just describes tools. Claude Code is the agent that decides when and how to use those tools.

**MCP Architecture**

An MCP server provides three things:

```
┌──────────────────────────────────────────┐
│              MCP Server                   │
│                                           │
│  ┌─────────┐  ┌───────────┐  ┌────────┐ │
│  │  Tools   │  │ Resources │  │Prompts │ │
│  │          │  │           │  │        │ │
│  │ Actions  │  │ Data to   │  │Pre-made│ │
│  │ Claude   │  │ reference │  │command │ │
│  │ can take │  │ with @    │  │templates│ │
│  └─────────┘  └───────────┘  └────────┘ │
└──────────────────────────────────────────┘
         ▲
         │  stdio / HTTP
         ▼
┌──────────────────────────────────────────┐
│           Claude Code (Client)            │
│  Discovers tools, calls them as needed   │
└──────────────────────────────────────────┘
```

- **Tools** — Actions Claude can take. Like "get_weather(city)" or "create_issue(title, body)".
- **Resources** — Data Claude can reference using `@` mentions. Like documentation files, database records, or API responses.
- **Prompts** — Pre-made command templates that appear as slash commands.

**Transport types:**
- `stdio` — Local communication. The server runs on your computer and talks to Claude through standard input/output. Fastest, most common for personal tools.
- `sse` — HTTP streaming. The server runs remotely and sends events over HTTP. Good for shared servers.
- `streamable-http` — Newer HTTP transport. More efficient than SSE for bidirectional communication.

**Building an MCP Server with FastMCP**

FastMCP is a Python library that makes building MCP servers simple. Here is a minimal example:

```python
from fastmcp import FastMCP

mcp = FastMCP("My Weather Server")

@mcp.tool()
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    # In a real server, you would call a weather API here
    return f"The weather in {city} is 72°F and sunny."

if __name__ == "__main__":
    mcp.run()
```

That is a complete MCP server. When connected to Claude Code, you can say "What is the weather in Tokyo?" and Claude will call `get_weather("Tokyo")`.

**Connecting to Claude Code:**

```
$ claude mcp add weather-server -- python3 weather_server.py
```

Now the weather tool is available in your Claude Code sessions.

**MCP Resources:**

Resources are data that Claude can reference:

```python
@mcp.resource("docs://readme")
def get_readme():
    """The project README."""
    with open("README.md") as f:
        return f.read()
```

In Claude Code, type `@readme` to inject this resource into your prompt.

**Tool Search:**

When you have many MCP servers with many tools, Claude can dynamically discover the right tool instead of loading all tool descriptions upfront. Enable with `ENABLE_TOOL_SEARCH=true`.

**MCP Scopes:**

- **User scope** (`~/.claude/settings.json`) — Available in all your projects
- **Project scope** (`.claude/settings.json`) — Available only in this project
- **Session scope** (`--mcp-config file.json`) — Available only for this session

**OAuth Authentication:**

Some MCP servers need authentication (e.g., GitHub, Slack). Claude Code supports pre-configured OAuth connectors that handle the login flow:

```
$ claude mcp add github-server --oauth
```

**Claude as an MCP Server:**

You can expose Claude Code itself as an MCP server for other clients:

```
$ claude mcp serve
```

This lets other applications use Claude Code's capabilities through MCP.

#### Practice Exercises

**Exercise 1 (Guided): Build a Simple MCP Server**

1. Create a new directory: `mkdir ~/my-mcp-server && cd ~/my-mcp-server`
2. Install FastMCP: `pip install fastmcp`
3. Create `server.py` with a tool that returns a motivational quote (hardcode 5 quotes and pick randomly)
4. Test it: `python3 server.py`
5. Connect it: `claude mcp add quotes -- python3 ~/my-mcp-server/server.py`
6. In a Claude session, ask for a motivational quote — Claude should use your MCP tool

Verification: Claude calls your `get_quote` tool and returns a quote from your server.

**Exercise 2 (Independent): Build a Useful MCP Server**

Goal: Build an MCP server that solves a real problem for one of your projects. Ideas:
- A server that returns project statistics (file count, test count, lines of code)
- A server that queries your Supabase database directly
- A server that interacts with an external API (weather, books, etc.)

Connect it to Claude Code and use it in a real workflow.

Hints:
- Use Pydantic models for type safety in your tool definitions
- Add at least one resource (expose project data via `@` mentions)
- Test the server independently before connecting to Claude

Verification: The server has at least 2 tools and 1 resource. Claude can use all of them in a session.

**Exercise 3 (Challenge): MCP Server with OAuth**

Set up an MCP server that requires authentication:
1. Use a community MCP server (GitHub, Slack, or similar) that requires OAuth
2. Connect it with `claude mcp add`
3. Complete the OAuth flow
4. Use authenticated tools in a session (e.g., create a GitHub issue, send a Slack message)

#### Self-Assessment Quiz

**1. What is MCP, and what analogy describes its purpose?**

**2. What is the difference between MCP tools, resources, and prompts?**

**3. What are the three transport types, and when would you use each?**

**4. How do you connect an MCP server to Claude Code?**

**5. What is Tool Search, and why is it useful?**

> **Answers:**
>
> 1. MCP (Model Context Protocol) is an open standard for connecting AI assistants to external tools and services. It is like a USB port for AI — it provides a universal way for any tool to connect to any AI assistant without custom integration code.
>
> 2. Tools are actions Claude can take (like calling an API). Resources are data Claude can reference using `@` mentions (like documentation or database records). Prompts are pre-made command templates that appear as slash commands.
>
> 3. `stdio` — local communication, fastest, best for personal tools on your computer. `sse` — HTTP streaming, for remote/shared servers. `streamable-http` — newer HTTP transport, more efficient for bidirectional communication.
>
> 4. Use `claude mcp add <name> -- <command>` to register the server. For example: `claude mcp add weather -- python3 weather_server.py`. The server is then available in all Claude Code sessions (depending on scope).
>
> 5. Tool Search lets Claude dynamically discover the right tool from many available tools without loading all tool descriptions into context upfront. This is useful when you have many MCP servers with many tools — Claude finds the relevant one on demand instead of consuming context with all tool descriptions.

#### MCP Updates (Feb 2026)
- **Pre-configured OAuth MCP connectors** added, simplifying authentication setup for MCP servers (v2.1.30)
- **Restricted tool access:** Support added for restricting which MCP tools are available to specific contexts (v2.1.33)
- **npm deprecation:** Claude Code installation via npm is deprecated — use `claude install` or see the getting started docs (v2.1.15)
- **React Compiler** now used for UI rendering performance improvements (v2.1.15)

**Exercise:**
- Set up an OAuth-based MCP connector and test authenticated access
- Experiment with restricting MCP tool availability per-project

#### MCP Origins & Design Philosophy

- **Background:** MCP was created by Anthropic and donated as an open standard for connecting AI to external tools and services
- **Core idea:** A universal protocol so AI models can discover and use tools without bespoke integrations per service
- **Why it matters for Claude Code:** MCP is the backbone of Claude Code's plugin/server ecosystem — understanding its design philosophy helps you build better integrations
- **Key design principles:**
  - Tool discovery over hardcoded integrations
  - Server-side tool definitions with client-side execution
  - Transport-agnostic (stdio, HTTP/SSE)
  - Open standard — not locked to Anthropic

**Watch:** [Why we built and donated MCP — David Soria Parra](https://www.youtube.com/watch?v=kQRu7DdTTVA)

**Exercise:** After watching the video, write a short summary of why Anthropic chose to open-source MCP rather than keep it proprietary. How does this decision affect the Claude Code ecosystem?

#### MCP Origins — Why Anthropic Built and Donated MCP

Anthropic's Stuart Ritchie interviews MCP co-creator **David Soria Parra** about the development and open-sourcing of the Model Context Protocol:

- **Why open-source:** MCP was donated as an open standard so any AI system can connect to external tools and services — not just Claude.
- **Design goals:** Standardize how AI models interact with tools, databases, and APIs so developers build integrations once and use them everywhere.
- **Impact on Claude Code:** MCP is the backbone of Claude Code's plugin and tool ecosystem. Understanding its design philosophy helps you build better MCP servers.

> **Watch:** [Why we built and donated the Model Context Protocol](https://www.youtube.com/watch?v=kQRu7DdTTVA)

---

### WEEK 11: Agent Teams & Parallel Sessions
**Subtitle:** Orchestrating AI workers
**Objective:** Use Claude Code's multi-agent capabilities for complex projects.

**Topics:**
- Subagents: 6 built-in types and how they work
- Foreground vs background subagents
- Custom subagents in .claude/agents/
- Agent frontmatter and persistent memory
- Agent Teams: multi-agent collaboration
- Display modes: in-process vs tmux
- Orchestration patterns: fan-out, pipeline, supervisor

**Activities:**
- Create a custom subagent with persistent memory enabled
- Use `--agents` CLI flag to define session-level subagents
- Test foreground vs background subagents (Ctrl+B)
- Resume a completed subagent to continue its work
- Set up an agent team with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Assign frontend and backend to separate agents
- Use headless mode for automated testing
- Build an orchestration workflow for your capstone project

**Deliverable:** A project built using custom subagents and agent teams with at least 3 coordinated agents, including one with persistent memory.
**Skills:** Subagents (built-in + custom), agent teams, persistent memory, parallel sessions, headless mode, orchestration

#### Learning Objectives

By the end of this week, you will be able to:

1. Explain what subagents are and how Claude Code uses them automatically
2. Create custom subagents with specific tools, models, and permissions
3. Configure persistent memory for subagents that learn across sessions
4. Set up and orchestrate an agent team for a multi-part project
5. Choose the right orchestration pattern for different types of work

#### Lesson

**What Are Subagents?**

When you give Claude Code a complex task, it often breaks it into smaller pieces and delegates them to **subagents** — specialized workers that handle specific subtasks. Think of it like a manager (Claude) delegating work to team members (subagents).

Claude Code has 6 built-in subagent types:

| Type | Model | What It Does | Can Modify Files? |
|------|-------|-------------|-------------------|
| **Explore** | Haiku | Fast codebase exploration, file searching | No (read-only) |
| **Plan** | Default | Design implementation strategies | No (read-only) |
| **general-purpose** | Default | Complex multi-step tasks | Yes (all tools) |
| **Bash** | Default | Command execution | Yes (Bash only) |
| **statusline-setup** | Default | Configure status line | Yes (Read + Edit) |
| **Claude Code Guide** | Default | Answer questions about Claude Code | No (read-only) |

Claude automatically chooses which subagent to use based on the task. You can also explicitly request one: "Use an Explore agent to find all API endpoints in this project."

**Foreground vs Background Subagents**

By default, subagents run in the foreground — you see their work in real-time. But you can background a running task with **Ctrl+B**, which lets you continue working while the subagent finishes in the background.

Background subagents:
- Run independently without blocking your main session
- Have pre-approved permissions (asked upfront)
- Auto-deny anything not pre-approved (no interactive permission prompts)
- Report results when finished

**Custom Subagents**

You can create project-specific agents in `.claude/agents/` or personal agents in `~/.claude/agents/`. A custom agent is a markdown file with frontmatter:

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and best practices
tools: ["Read", "Glob", "Grep"]
model: claude-sonnet-4-5-20250929
permissionMode: plan
maxTurns: 20
memory: project
---

# Code Reviewer Agent

You are a code review specialist. When given code to review, you should:
1. Check for security vulnerabilities
2. Identify performance issues
3. Suggest improvements to readability
4. Verify test coverage for changed code
```

Key frontmatter fields:

| Field | What It Does |
|-------|-------------|
| `tools` | Which tools this agent can use |
| `disallowedTools` | Tools explicitly blocked |
| `model` | Which AI model to use |
| `permissionMode` | How permissions work (plan, acceptEdits, etc.) |
| `maxTurns` | Maximum number of actions before stopping |
| `memory` | Persistent memory scope: `user`, `project`, or `local` |
| `skills` | Which skills this agent has access to |
| `mcpServers` | Which MCP servers this agent can use |
| `hooks` | Agent-specific hooks |

**Persistent Agent Memory**

When you set `memory: project`, the agent remembers information across sessions. It learns patterns, preferences, and project-specific knowledge over time.

For example, a code-reviewer agent with persistent memory might learn:
- "This project uses camelCase for variables and PascalCase for components"
- "The team prefers explicit error handling over try-catch blocks"
- "Tests should use the AAA pattern (Arrange, Act, Assert)"

**Agent Teams (Experimental)**

Agent teams enable multi-agent collaboration where multiple Claude instances work together on a project. One agent leads, others implement.

Enable with:
```
$ export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

**Display modes:**
- `in-process` — All agents share one terminal window. You see interleaved output.
- `tmux` — Each agent gets its own terminal pane. Requires tmux installed.

**How teams work:**

```
┌──────────────────────┐
│     Team Lead         │
│  (delegate mode)      │
│                       │
│  Creates tasks,       │
│  assigns teammates,   │
│  reviews results      │
└──────────┬───────────┘
           │ assigns tasks
    ┌──────┴──────┐
    ▼             ▼
┌─────────┐ ┌─────────┐
│Frontend │ │Backend  │
│ Agent   │ │ Agent   │
│         │ │         │
│ Builds  │ │ Builds  │
│ UI      │ │ API     │
└─────────┘ └─────────┘
```

The team lead uses `delegate` permission mode — it can only coordinate, not modify files directly. Teammates handle implementation.

**Direct teammate messaging:** Use Shift+Up/Down to switch between teammates and send messages.

**Orchestration Patterns:**

1. **Fan-out** — The lead assigns independent tasks to multiple agents simultaneously (e.g., "Agent A: build the UI. Agent B: build the API. Agent C: write tests.")

2. **Pipeline** — Work flows from one agent to the next (e.g., "Agent A designs the schema → Agent B implements it → Agent C tests it.")

3. **Supervisor** — The lead reviews each agent's work before it proceeds (e.g., "Agent A: implement feature. Lead: review. Agent A: fix issues. Lead: approve.")

#### Practice Exercises

**Exercise 1 (Guided): Create a Custom Subagent**

1. Create `.claude/agents/researcher.md`:

```markdown
---
name: researcher
description: Research questions about the codebase
tools: ["Read", "Glob", "Grep"]
model: claude-haiku-4-5-20251001
permissionMode: plan
maxTurns: 15
memory: project
---

# Researcher Agent

You explore the codebase to answer questions. Use Glob to find files,
Grep to search content, and Read to examine files in detail.
Provide concise, factual answers with file paths as references.
```

2. Test it: Ask Claude to "use the researcher agent to find all API routes in this project"
3. Check that it runs with the Haiku model and only reads files (no modifications)

Verification: The researcher agent finds and lists API routes without modifying any files. Memory is stored in `.claude/projects/`.

**Exercise 2 (Independent): Agent Team Workflow**

Goal: Set up a 3-agent team for a project task:

1. Enable agent teams: `export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
2. Start Claude with tmux mode: `claude --teammate-mode tmux`
3. Assign tasks: "Create a frontend agent for UI work and a backend agent for API work"
4. Give each agent a task from your project
5. Monitor both agents working in parallel

Hints:
- The team lead should use `delegate` mode
- Each teammate should have appropriate tools (frontend: Edit, Write; backend: Edit, Write, Bash)
- Use Shift+Up/Down to communicate with teammates

Verification: Both agents complete their tasks. The combined work is committed to Git.

**Exercise 3 (Challenge): Orchestrated Build**

Design and execute an orchestrated workflow using agent teams:
1. Define 3 agents with different specializations
2. Create a task list with dependencies (task B depends on task A)
3. Run the workflow using the pipeline pattern
4. Monitor progress using TeammateIdle hooks
5. Review and merge all work

Document the orchestration in a `docs/agent-workflow.md` file.

#### Self-Assessment Quiz

**1. What are subagents, and how does Claude Code decide which one to use?**

**2. What does `memory: project` do in a custom agent's frontmatter?**

**3. Explain the difference between the `delegate` permission mode and normal permission modes.**

**4. What are the three orchestration patterns, and when would you use each?**

> **Answers:**
>
> 1. Subagents are specialized workers that Claude Code delegates subtasks to. Claude automatically chooses based on the task: Explore for searching code, Plan for designing strategies, general-purpose for complex multi-step work, Bash for command execution. You can also explicitly request a specific type.
>
> 2. `memory: project` enables persistent memory scoped to the current project. The agent remembers information (patterns, preferences, decisions) across sessions. This memory is stored in `.claude/projects/` and loaded automatically in future sessions.
>
> 3. `delegate` mode restricts the agent to coordination only — it can assign tasks and communicate with teammates but cannot directly modify files or run commands. Normal modes (like `acceptEdits` or `dontAsk`) allow direct file modifications. The team lead uses `delegate` to orchestrate, while teammates use normal modes to implement.
>
> 4. Fan-out: Assign independent tasks to multiple agents simultaneously. Use when tasks do not depend on each other. Pipeline: Work flows from one agent to the next. Use when each step depends on the previous step. Supervisor: The lead reviews each agent's work before proceeding. Use when quality control is critical.

#### Claude Agent SDK

- Released alongside Sonnet 4.5, the **Claude Agent SDK** enables building custom agents with Claude.
- Allows developers to build custom agents with tool use, define agent workflows, and integrate Claude as an autonomous agent into existing applications.
- Relevant to agent teams and parallel session workflows covered this week.
- **References:** [Announcement](https://www.anthropic.com/news/claude-sonnet-4-5) | [Agent SDK docs](https://docs.anthropic.com/en/docs/agents/agent-sdk)

#### Agent Teams Updates (Feb 2026)
- **Agent teams research preview** launched — multi-agent collaboration feature requiring `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (v2.1.32). Note: this is token-intensive.
- **tmux integration** fixed for agent teammate sessions to properly send and receive messages (v2.1.33)
- **`TeammateIdle` and `TaskCompleted` hook events** added for orchestrating multi-agent workflows (v2.1.33)
- **Agent teams crash fix** when settings change between renders (v2.1.34)
- **Sandbox security fix** preventing excluded commands from bypassing Bash ask permission rules (v2.1.34)

**Exercise:**
- Enable agent teams with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` and try a multi-agent task
- Set up a `TeammateIdle` hook to monitor agent collaboration
- Test agent teams in a tmux session

---

### WEEK 12: Capstone & Portfolio
**Subtitle:** Putting it all together
**Objective:** Build a production-quality project showcasing everything you've learned.

**Topics:**
- Capstone project planning and architecture
- Professional Git workflow: feature branches, PRs, code review
- CI/CD: automated testing and deployment
- Production readiness: error handling, logging, monitoring
- Portfolio presentation: GitHub profile, README, live demos
- CLAUDE.md mastery: comprehensive project documentation

**Activities:**
- Plan your capstone project architecture
- Build using agent teams and MCP integrations
- Implement full Git workflow with feature branches
- Set up CI/CD pipeline
- Write professional documentation
- Deploy production version
- Create portfolio page showcasing all projects

**Deliverable:** A production-deployed capstone project with full documentation, CI/CD, and a portfolio page linking all 12 weeks of work.
**Skills:** Full-stack development, professional workflows, CI/CD, portfolio presentation

#### Learning Objectives

By the end of this week, you will be able to:

1. Plan and architect a production-quality application from scratch
2. Use a professional Git workflow with feature branches, PRs, and code review
3. Set up a CI/CD pipeline that automatically tests and deploys your code
4. Prepare a capstone project that demonstrates everything you have learned
5. Present your work in a professional portfolio

#### Lesson

**The Capstone: Your Graduation Project**

This week is different. There is no new technology to learn. Instead, you combine everything from the past 11 weeks into one impressive project. Think of it as your graduation thesis — proof that you can build real software with Claude Code.

Your capstone should demonstrate:
- Terminal and Git proficiency (Weeks 1-2)
- Claude Code mastery (Week 3)
- Full-stack web development (Weeks 4-6)
- Testing and quality (Week 7)
- Independent project scoping (Week 8)
- Skills and hooks (Week 9)
- MCP integration (Week 10)
- Agent teams (Week 11)

You do not need to use every single technology. Choose the ones that make sense for your project. A great capstone showcases depth over breadth.

**Planning Your Capstone**

Spend significant time planning before writing any code. Use Claude Code in Plan mode:

```
I want to build [your idea]. Help me plan the architecture:
1. What pages/features does it need?
2. What database tables are required?
3. What external APIs or MCP servers would be useful?
4. What should the Git branching strategy look like?
5. What tests should I write?
6. What hooks or skills would improve the workflow?
```

Write the plan in a `docs/architecture.md` file. Include:
- System diagram (you can use ASCII art)
- Database schema
- API endpoints
- Page/route list
- Technology choices and reasoning

**Professional Git Workflow**

For the capstone, use a professional branching strategy:

```
main (production — always deployable)
  └── develop (integration branch)
       ├── feature/auth (authentication feature)
       ├── feature/dashboard (dashboard feature)
       ├── feature/api-routes (API routes)
       └── bugfix/search-filter (search bug fix)
```

The workflow:
1. Create a feature branch from `develop`: `git checkout -b feature/auth develop`
2. Build the feature with Claude Code
3. Push and open a PR to `develop`
4. Review the PR (use `/code-review`)
5. Merge to `develop`
6. When all features are ready, merge `develop` to `main`
7. Deploy from `main`

**CI/CD: Automated Testing and Deployment**

CI/CD stands for Continuous Integration / Continuous Deployment. It means:
- **CI** — Every time you push code, tests run automatically. If tests fail, the PR is blocked.
- **CD** — Every time code is merged to `main`, it deploys automatically.

With GitHub Actions, you create a workflow file:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm test
      - run: npm run build
```

Ask Claude Code: "Set up a GitHub Actions CI pipeline that runs tests and builds on every PR."

**Vercel handles CD automatically.** When you connect your GitHub repo to Vercel, every push to `main` triggers a deployment. Every PR gets a preview deployment with its own URL.

**Production Readiness**

Before calling your project "production ready," check:

1. **Error handling** — Does the app show helpful error messages instead of crashing?
2. **Loading states** — Does the user see a spinner while data loads?
3. **Empty states** — What does the user see when there is no data yet?
4. **Input validation** — Can users break the app with unexpected input?
5. **Responsive design** — Does it work on mobile, tablet, and desktop?
6. **Performance** — Does the app load in under 3 seconds?
7. **Security** — Are API keys hidden? Is authentication required? Is data validated server-side?

Ask Claude: "Run /code-review and check for production readiness issues."

**Portfolio Presentation**

Your portfolio is how you show the world what you can build. Create a portfolio that includes:

1. **GitHub Profile README** — A special README.md in a repository named after your username that appears on your GitHub profile page. Include a brief bio, your tech stack, and links to your projects.

2. **Project READMEs** — Each project should have a professional README with screenshots, a live demo link, and setup instructions.

3. **Portfolio Page** — A simple website listing all your projects. This can be one of your Vercel deployments. Include:
   - Your name and a brief introduction
   - Cards for each project with title, description, screenshot, and links
   - Tech stack used in each project
   - Links to GitHub repos and live demos

**CLAUDE.md Mastery**

By now, your CLAUDE.md should be comprehensive. A great CLAUDE.md for the capstone includes:

```markdown
# CLAUDE.md

## Project Overview
[1-2 sentence description]

## Tech Stack
- Next.js 16 with TypeScript
- Tailwind CSS for styling
- Supabase for database and auth
- Vitest for testing
- Vercel for deployment

## Commands
- npm run dev — Start development server
- npm test — Run all tests
- npm run build — Production build
- npm run lint — Check code quality
- npx vercel deploy --prod — Deploy to production

## Architecture
- app/ — Next.js app router pages
- components/ — Reusable React components
- lib/ — Utility functions and database client
- app/api/ — API routes
- __tests__/ — Test files

## Git Workflow
- main: production (auto-deploys to Vercel)
- develop: integration branch
- feature/*: feature branches

## Conventions
- Use TypeScript strict mode
- Components use PascalCase, utilities use camelCase
- Every API route has input validation
- Tests follow AAA pattern (Arrange, Act, Assert)
- Commit messages follow conventional commits format
```

#### Practice Exercises

**Exercise 1 (Guided): Plan Your Capstone**

1. Choose your capstone idea (or enhance your Week 8 project)
2. Use Claude in Plan mode to design the architecture
3. Create `docs/architecture.md` with the full plan
4. Set up the Git branching strategy: create `develop` branch, create your first feature branch
5. Write a comprehensive CLAUDE.md

Verification: `docs/architecture.md` exists with system diagram, schema, and API list. Git has a `develop` branch and at least one feature branch. CLAUDE.md covers all sections.

**Exercise 2 (Independent): Build and Ship**

Goal: Build your capstone in phases using feature branches:
1. Phase 1: Database schema and API routes (feature branch → PR → merge)
2. Phase 2: Core UI and functionality (feature branch → PR → merge)
3. Phase 3: Authentication and security (feature branch → PR → merge)
4. Phase 4: Testing and polish (feature branch → PR → merge)

Use agent teams if your project is complex enough. Run `/code-review` after each phase.

Verification: At least 4 merged PRs. All tests pass. The app is deployed and working.

**Exercise 3 (Challenge): CI/CD and Portfolio**

1. Set up GitHub Actions CI (tests + build on every PR)
2. Connect your repo to Vercel for automatic deployments
3. Create a portfolio page showcasing all your projects from Weeks 4, 8, and 12
4. Write a GitHub Profile README
5. Share your portfolio URL

Run at least one PR through the full pipeline: push → CI passes → preview deploy → review → merge → production deploy.

#### Self-Assessment Quiz

**1. What is the professional Git workflow for feature development?**

**2. What does CI/CD stand for, and what does each part do?**

**3. Name three things to check for "production readiness."**

**4. What should a comprehensive CLAUDE.md include?**

> **Answers:**
>
> 1. Create a feature branch from `develop`, build the feature, push and open a PR, review the code, merge to `develop`. When all features are ready, merge `develop` to `main` and deploy. This keeps `main` always deployable and lets multiple features develop in parallel.
>
> 2. CI = Continuous Integration — automatically runs tests every time you push code, blocking PRs if tests fail. CD = Continuous Deployment — automatically deploys code when it is merged to the main branch. Together, they ensure quality and speed.
>
> 3. Any three of: error handling (helpful messages instead of crashes), loading states (spinners while data loads), empty states (what users see with no data), input validation (preventing broken input), responsive design (mobile + desktop), performance (fast load times), security (hidden keys, authentication, server-side validation).
>
> 4. A comprehensive CLAUDE.md includes: project overview, tech stack, commands (dev, test, build, deploy), architecture (file structure), Git workflow, and conventions (naming, patterns, testing approach).

---

## Appendices

### Appendix A: Daily Practice Checklist
- [ ] Open terminal and navigate to project folder
- [ ] Pull latest changes (git pull)
- [ ] Review yesterday's work (git log, git diff)
- [ ] Start Claude Code session with clear objective
- [ ] Use Plan mode before coding
- [ ] Commit progress with meaningful messages
- [ ] Push to GitHub
- [ ] Update CLAUDE.md if needed

### Appendix B: Essential Commands & CLI Reference

**Terminal:**
pwd, ls, cd, mkdir, touch, cp, mv, rm, cat, less, head, tail, echo, grep, find

**Git:**
git init, git add, git commit, git push, git pull, git branch, git checkout, git merge, git log, git diff, git status, git stash

**Claude Code Slash Commands:**
/help, /compact, /clear, /model, /context, /init, /code-review, /cost, /permissions, /hooks, /agents, /add-dir, /statusline, /fast

**npm:**
npm install, npm run dev, npm run build, npx

#### CLI Flags Reference (Key Flags)

| Flag | Description |
|------|-------------|
| `-p "query"` | Print mode — non-interactive, for scripts/CI |
| `-c` | Continue most recent conversation |
| `-r <session>` | Resume a specific session by ID or name |
| `--model <name>` | Set model (alias: `sonnet`, `opus`, `haiku`, or full model ID) |
| `--permission-mode <mode>` | Start in a permission mode: `plan`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `delegate` |
| `--agents '<json>'` | Define session-level subagents via JSON |
| `--agent <name>` | Run a named agent as the main thread |
| `--add-dir <path>` | Add additional working directories |
| `--mcp-config <file>` | Load MCP servers from JSON file |
| `--strict-mcp-config` | Only use MCP servers from `--mcp-config` |
| `--tools "Bash,Edit,Read"` | Restrict which built-in tools Claude can use |
| `--disallowedTools "Task(Explore)"` | Deny specific tools |
| `--allowedTools "Bash(npm run *)"` | Pre-approve specific tools without prompting |
| `--system-prompt "..."` | Replace the entire system prompt |
| `--append-system-prompt "..."` | Append to the default system prompt |
| `--output-format json` | Output format for `-p` mode: `text`, `json`, `stream-json` |
| `--json-schema '<schema>'` | Get validated JSON output matching a schema (`-p` only) |
| `--max-turns <n>` | Limit agentic turns (`-p` only) |
| `--max-budget-usd <n>` | Maximum dollar spend before stopping (`-p` only) |
| `--fallback-model <name>` | Auto-fallback when default model is overloaded (`-p` only) |
| `--from-pr <number>` | Resume sessions linked to a GitHub PR |
| `--fork-session` | Create new session ID when resuming |
| `--chrome` | Enable Chrome browser integration |
| `--remote "task"` | Create a web session on claude.ai |
| `--teleport` | Resume a web session in local terminal |
| `--teammate-mode <mode>` | Agent team display: `auto`, `in-process`, `tmux` |
| `--plugin-dir <path>` | Load plugins from a directory |
| `--verbose` | Enable verbose logging |
| `--debug` | Debug mode with optional category filter |
| `--dangerously-skip-permissions` | Skip all permission prompts (use with extreme caution) |

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current generation |
| `Ctrl+B` | Background a running task |
| `Ctrl+O` | Toggle verbose mode (see hook output) |
| `Ctrl+G` | Open external editor |
| `Shift+Up/Down` | Switch between agent team teammates |
| `Escape` | Clear current input / exit mode |

### Appendix C: CLAUDE.md Starter Template
```markdown
# CLAUDE.md

## Project Overview
[What this project does in 1-2 sentences]

## Tech Stack
[List key technologies]

## Commands
[How to install, run, test, deploy]

## Architecture
[Key files and their roles]

## Conventions
[Code style, naming, patterns to follow]
```

### Appendix D: Recommended Resources
- Claude Code Docs: https://code.claude.com/docs/en
- Claude Developer Platform: https://platform.claude.com
- Agent SDK Docs: https://platform.claude.com/docs/en/agent-sdk/overview
- Anthropic Documentation: https://docs.anthropic.com
- Boris Cherny on X: https://x.com/anthropaboris
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- MDN Web Docs: https://developer.mozilla.org

### Appendix E: Real-World Workflows — Claude + Obsidian

Claude Code works exceptionally well with markdown-based knowledge systems like Obsidian. This pattern extends beyond engineering into product management, documentation, and knowledge work.

#### The Pattern
1. **Knowledge lives in `.md` files** — PRDs, specs, meeting notes, decision logs stored in an Obsidian vault
2. **Claude Code operates on the vault** — Point Claude Code at your Obsidian folder to query, summarize, update, and cross-reference documents
3. **Bidirectional workflow** — Edit in Obsidian for thinking, delegate to Claude Code for synthesis and automation

#### Use Cases
- Summarize a week's meeting notes into action items
- Cross-reference PRDs against technical specs for consistency
- Generate status reports from scattered notes
- Draft RFC documents from rough bullet points

**Discussion:** [Community thread on Claude + Obsidian workflows](https://www.reddit.com/r/ClaudeAI/comments/1r2puy0/product_managers_using_claude_obsidian_what_does/)

### Appendix F: Maintaining Your ~/.claude Directory

The `~/.claude` directory stores session data, conversation history, memories, and configuration. Without periodic cleanup, it can grow to 1GB+ within weeks of daily use.

#### What takes up space
| Directory | Contents |
|-----------|----------|
| `projects/` | Per-project session data and memory files |
| `sessions/` | Full conversation transcripts |
| `memory/` | Auto-memory files persisted across sessions |

#### Cleanup strategies
1. **Manual cleanup:** Remove old session directories older than 30 days
   ```bash
   find ~/.claude/sessions -type d -mtime +30 -exec rm -rf {} +
   ```
2. **Check your usage:** `du -sh ~/.claude/*/  | sort -rh`
3. **Preserve what matters:** Back up your `memory/` and `CLAUDE.md` files before cleaning
4. **Automate it:** Add a cleanup cron job or shell alias for periodic maintenance

**Tip:** Session data accumulates fastest — if you run many long sessions daily, check monthly.

**Discussion:** [Community thread on ~/.claude cleanup](https://www.reddit.com/r/ClaudeAI/comments/1r2snly/cleanup_script_for_claude_mine_grew_to_13gb_in_4/)

### Appendix G: Permissions, Sandbox & Security

#### Permission Modes

| Mode | Description |
|------|-------------|
| `default` | Standard behavior — prompts for permission on first use of each tool |
| `plan` | Plan Mode — Claude can analyze but not modify files or execute commands |
| `acceptEdits` | Auto-accepts file edit permissions for the session |
| `dontAsk` | Auto-denies tools unless pre-approved via `/permissions` or `permissions.allow` rules |
| `delegate` | Coordination-only mode for agent team leads. Restricts to team management tools |
| `bypassPermissions` | Skips ALL permission prompts. Only use in isolated environments (containers/VMs) |

Set via `defaultMode` in settings, `--permission-mode` flag, or toggle with `/permissions`.

#### Permission Rule Syntax

Rules follow the format `Tool` or `Tool(specifier)`. Evaluated in order: **deny → ask → allow** (first match wins).

**Bash rules** — glob patterns with `*`:
- `Bash(npm run *)` — any npm run command
- `Bash(git commit *)` — any git commit
- `Bash(* --version)` — any version check

**Read/Edit rules** — gitignore-style paths:
- `Read(./.env)` — deny reading .env (relative to cwd)
- `Edit(/src/**/*.ts)` — relative to settings file
- `Read(~/.zshrc)` — home directory
- `Edit(//tmp/scratch.txt)` — absolute path (`//` prefix)

**MCP rules**: `mcp__server__tool` or `mcp__server__*`
**Subagent rules**: `Task(Explore)`, `Task(my-custom-agent)`

#### Sandbox

Provides OS-level enforcement restricting Bash tool filesystem and network access:
- `sandbox.enabled: true` — enable sandbox
- `sandbox.autoAllowBashIfSandboxed: true` — auto-approve Bash when sandboxed
- `sandbox.excludedCommands: ["docker"]` — commands that bypass sandbox
- `sandbox.network.allowedDomains: ["github.com", "*.npmjs.org"]` — network allowlist
- Filesystem restrictions use Read/Edit deny rules (not separate config)
- Permissions + sandbox = defense-in-depth (two complementary layers)

#### Managed Settings (Enterprise)

Deployed to system directories by IT administrators. Cannot be overridden by user/project settings.
- **macOS**: `/Library/Application Support/ClaudeCode/managed-settings.json`
- **Linux/WSL**: `/etc/claude-code/managed-settings.json`

Managed-only settings:
- `disableBypassPermissionsMode` — prevent `bypassPermissions` mode
- `allowManagedPermissionRulesOnly` — only managed permission rules apply
- `allowManagedHooksOnly` — block user/project/plugin hooks
- `strictKnownMarketplaces` — control plugin marketplace access

**Exercise:** Configure a project settings file with permission rules that allow `Bash(npm *)` and `Bash(git *)` while denying `Read(./.env*)` and `Read(./secrets/**)`. Test that Claude respects the rules.

---

### Appendix H: Environment Variables Reference

Claude Code uses 85+ environment variables. Here are the most important by category:

#### Authentication & Model
| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | API key for Claude SDK |
| `ANTHROPIC_MODEL` | Model to use (e.g., `claude-opus-4-6`) |
| `CLAUDE_CODE_EFFORT_LEVEL` | `low`, `medium`, `high` (Opus 4.6 only) |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model for subagents |
| `CLAUDE_CODE_USE_BEDROCK` | Use AWS Bedrock |
| `CLAUDE_CODE_USE_VERTEX` | Use Google Vertex AI |
| `CLAUDE_CODE_USE_FOUNDRY` | Use Microsoft Foundry |

#### Context & Token Management
| Variable | Purpose |
|----------|---------|
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Context % at which auto-compaction triggers (default ~95) |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Max output tokens (default 32,000, max 64,000) |
| `MAX_THINKING_TOKENS` | Extended thinking budget (default 31,999, 0 to disable) |
| `MAX_MCP_OUTPUT_TOKENS` | Max tokens in MCP responses (default 25,000) |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Character budget for skill metadata in context |

#### Feature Flags
| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable agent teams (`1`) |
| `CLAUDE_CODE_ENABLE_TASKS` | Task system (`false` to revert to TODO list) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Disable auto memory (`1`) |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Disable background tasks (`1`) |
| `ENABLE_TOOL_SEARCH` | MCP tool search: `auto`, `true`, `false` |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | Disable beta headers for LLM gateways |

#### Bash Configuration
| Variable | Purpose |
|----------|---------|
| `BASH_DEFAULT_TIMEOUT_MS` | Default bash command timeout |
| `BASH_MAX_TIMEOUT_MS` | Maximum bash timeout |
| `BASH_MAX_OUTPUT_LENGTH` | Max chars before middle-truncation |
| `CLAUDE_CODE_SHELL` | Override automatic shell detection |
| `CLAUDE_CODE_SHELL_PREFIX` | Wrap all bash commands (e.g., for logging) |

#### Networking & Proxy
| Variable | Purpose |
|----------|---------|
| `HTTP_PROXY` / `HTTPS_PROXY` | Proxy servers |
| `NO_PROXY` | Domains to bypass proxy |
| `CLAUDE_CODE_CLIENT_CERT` | mTLS client certificate path |
| `CLAUDE_CODE_CLIENT_KEY` | mTLS client key path |

#### MCP
| Variable | Purpose |
|----------|---------|
| `MCP_TIMEOUT` | MCP server startup timeout (ms) |
| `MCP_TOOL_TIMEOUT` | MCP tool execution timeout (ms) |
| `MCP_CLIENT_SECRET` | OAuth client secret for MCP servers |

#### UI & Telemetry
| Variable | Purpose |
|----------|---------|
| `DISABLE_TELEMETRY` | Opt out of Statsig telemetry |
| `DISABLE_AUTOUPDATER` | Disable auto-updates |
| `CLAUDE_CODE_HIDE_ACCOUNT_INFO` | Hide email/org from UI (for streaming) |
| `CLAUDE_CONFIG_DIR` | Custom config directory |
| `CLAUDE_CODE_TMPDIR` | Custom temp directory |

---

### Appendix I: IDE Integrations, Environments & CI/CD

Claude Code runs in multiple environments beyond the terminal:

#### VS Code Integration
- Native extension for VS Code with inline Claude Code panel
- Plugin management support for MCP servers
- OAuth users can browse and resume remote sessions from the Sessions dialog
- Set `CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL=1` to skip auto-install of IDE extensions

#### JetBrains Integration
- Extension available for IntelliJ-based IDEs (WebStorm, PyCharm, etc.)
- Integrates Claude Code directly into the IDE workflow

#### Chrome Extension (`--chrome`)
- Enables browser automation and web testing
- Claude can interact with web pages, take screenshots, fill forms
- Enable with `--chrome` flag, disable with `--no-chrome`

#### Desktop App (Cowork)
- Claude Code's capabilities in the Claude desktop app
- Give Claude access to a folder, set a task, and let it work
- Download at [claude.com/download](https://claude.com/download)

#### Claude Code on the Web
- Browser-based Claude Code at [claude.ai/code](https://claude.ai/code)
- `--remote "task"` creates a web session from CLI
- `--teleport` resumes a web session in your local terminal

#### Slack Integration
- Claude Code available as a Slack bot for team workflows
- Enables code assistance directly in Slack conversations

#### GitHub Actions CI/CD
- Use Claude Code in GitHub Actions workflows for automated code review, PR creation, and issue resolution
- Key flags for CI: `-p` (print mode), `--permission-mode acceptEdits`, `--allowedTools`, `--max-turns`, `--max-budget-usd`
- Authentication via `ANTHROPIC_API_KEY` secret or cloud provider credentials (Bedrock/Vertex)

#### GitLab CI/CD
- Native integration with GitLab pipelines
- Trigger with `@claude` mentions in issues and MRs
- Supports Claude API, AWS Bedrock (OIDC), and Google Vertex AI (WIF)
- Claude can create MRs, fix bugs, implement features, and respond to review comments
- Example `.gitlab-ci.yml` configuration available in official docs

**Exercise:** Set up Claude Code in at least two environments (terminal + VS Code or Chrome). Try `--remote` to create a web session, then `--teleport` to resume it locally.

---

*Curriculum Version: 2.1 — February 2026*
*Model: Claude Opus 4.6*
*Last Updated: 2026-02-13*


### Prompt Reuse: Building Efficient Workflows

As you start using Claude Code regularly, you'll notice yourself typing similar prompts repeatedly. This is a common friction point.

- **Recognize repetition:** Track which prompts you reuse across sessions (debugging, refactoring, explaining code)
- **Community example:** [Prompttu](https://www.reddit.com/r/ClaudeAI/comments/1r3br8i/) — a desktop app built entirely with Claude Code to manage reusable prompts
- **Built-in solution:** Claude Code's custom slash commands (covered in Week 9) solve this natively
- **Takeaway:** Identifying workflow friction early helps you build better habits as you progress through the curriculum


### Claude Code CLI Authentication Commands (v2.1.41)

Claude Code now includes dedicated auth subcommands for managing your session directly from the terminal:

- `claude auth login` — Authenticate with your Anthropic account
- `claude auth status` — Check your current authentication state
- `claude auth logout` — End your session

These replace the need to manage authentication through the web interface and are especially useful when working across multiple machines or switching accounts.


### Autonomous Cowork Workflow: Self-Revising Agents

An emerging community pattern uses Claude's **Cowork** mode for fully autonomous project execution:

1. Have Claude write its own autonomous instructions
2. Execute those instructions with zero human input
3. Steelman and revise the output iteratively
4. Achieve complex, clean-running projects in a single shot

- **Key insight:** Letting the agent define its own execution plan (then critique and refine it) produces higher-quality results than hand-writing every instruction
- **When to use:** Complex multi-file projects where the overall architecture matters more than individual line-level decisions
- **Reference:** [Community discussion](https://www.reddit.com/r/ClaudeAI/comments/1r3d1vk/)

This pattern complements the agent orchestration and parallel session techniques covered earlier in this week.

---

### Appendix J: Cowork — Claude Code for Desktop

**Cowork** brings Claude Code's agentic capabilities to the Claude desktop app, making agentic workflows accessible without a terminal.

**How it works:**
1. Open the Claude desktop app (download at claude.com/download)
2. Give Claude access to a folder on your computer
3. Set a task and let Claude work autonomously
4. Claude loops you in along the way for decisions and approvals

**When to use Cowork vs Claude Code CLI:**
- **Cowork:** Great for non-terminal users, quick file tasks, and when you want a visual interface
- **Claude Code CLI:** More powerful for developers — supports hooks, MCP servers, plugins, and full terminal integration

> **Source:** [Introducing Cowork](https://www.youtube.com/watch?v=kQRu7DdTTVA)


---

### Appendix: Product

**Product** (added Feb 17, 20)
Sonnet 4.6 delivers frontier performance across coding, agents, and professional work at scale.
Source: https://www.anthropic.com/news/claude-sonnet-4-6
