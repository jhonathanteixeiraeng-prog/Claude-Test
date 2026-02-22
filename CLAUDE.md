# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working with this repository.

---

## Repository Overview

**Repository:** `jhonathanteixeiraeng-prog/Claude-Test`
**Remote:** `http://local_proxy@127.0.0.1:44917/git/jhonathanteixeiraeng-prog/Claude-Test`

> This repository is currently in its initial state. This CLAUDE.md serves as a foundation document to establish conventions, workflows, and guidelines for AI assistants before and as project content is added.

---

## Current State

The repository contains no source code, build system, or configuration files yet. As the project evolves, this document should be updated to reflect:

- Project purpose and architecture
- Directory structure and key files
- Build and test commands
- Dependency management
- Code style and conventions

---

## Git Workflow

### Branch Naming

Feature branches follow this convention:

```
claude/<description>-<session-id>
```

Examples:
- `claude/add-claude-documentation-NdpH0`
- `claude/fix-login-bug-AbCd1`

### Working Branch

Always develop on the designated feature branch. Never push directly to `main` or `master` unless explicitly instructed.

### Commit Messages

Use concise, descriptive commit messages in the imperative mood:

```
Add initial CLAUDE.md documentation
Fix authentication token expiry handling
Refactor user service to use dependency injection
```

Avoid vague messages like "fix", "update", "changes", or "WIP" in final commits.

### Push Commands

```bash
git push -u origin <branch-name>
```

If push fails due to network errors, retry with exponential backoff:
- Wait 2s, retry
- Wait 4s, retry
- Wait 8s, retry
- Wait 16s, retry

### Git Operations

```bash
# Check status
git status

# Stage specific files (prefer over `git add -A`)
git add <file1> <file2>

# Commit
git commit -m "Your commit message"

# Push with upstream tracking
git push -u origin <branch-name>

# Fetch a specific branch
git fetch origin <branch-name>
```

---

## Development Guidelines for AI Assistants

### Before Making Changes

1. **Read before editing** — Always read a file before modifying it. Never propose changes to code you haven't examined.
2. **Understand context** — Explore the surrounding code and related files to understand patterns and conventions already in use.
3. **Minimize scope** — Only make changes directly required by the task. Do not refactor unrelated code, add unsolicited comments, or introduce extra features.

### Code Quality Principles

- **No over-engineering** — Write the minimum code needed. Avoid premature abstractions, unnecessary utilities, or helpers used only once.
- **No backwards-compatibility hacks** — If something is removed, delete it completely. Do not leave commented-out code, `_unused` variable suffixes, or re-exports for deleted types.
- **Trust internal guarantees** — Do not add defensive error handling for scenarios that cannot happen. Only validate at system boundaries (user input, external API responses).
- **No speculative features** — Do not design for hypothetical future requirements. Build what is needed now.

### Security

Do not introduce common vulnerabilities:
- SQL injection (always use parameterized queries or ORMs)
- Command injection (never interpolate user input into shell commands)
- XSS (always escape output in templates)
- Insecure deserialization
- Hardcoded secrets or credentials (use environment variables)

If you identify a security issue in existing code, flag it clearly.

### File Operations

- Prefer editing existing files over creating new ones.
- Never create documentation files (README, changelogs, etc.) unless explicitly asked.
- Delete unused code rather than commenting it out.

---

## Project Structure (To Be Defined)

As files are added to this repository, update this section with:

```
<repo-root>/
├── src/           # Main source code
├── tests/         # Test files
├── docs/          # Documentation
├── .github/       # CI/CD workflows
└── CLAUDE.md      # This file
```

---

## Build & Run Commands (To Be Defined)

Once a build system is established, document the key commands here. For example:

```bash
# Install dependencies
# <command>

# Run development server
# <command>

# Build for production
# <command>

# Run all tests
# <command>

# Run linter / formatter
# <command>
```

---

## Testing Conventions (To Be Defined)

Document here:
- Testing framework in use
- How to run tests (unit, integration, end-to-end)
- Where test files live relative to source files
- Coverage requirements
- How to run a single test file or test case

---

## Code Style & Conventions (To Be Defined)

Once a language and toolchain are chosen, capture here:
- Language version(s) in use
- Linter and formatter configuration
- Naming conventions (files, functions, variables, types)
- Import ordering
- Preferred patterns (async/await vs. callbacks, etc.)

---

## Environment & Configuration (To Be Defined)

Document:
- Required environment variables
- How to set up a local `.env` file
- Any secrets management approach
- External service dependencies

---

## Updating This Document

This file should be kept current. When making significant changes to the project — adding a build system, setting up CI, establishing code conventions — update the relevant sections of this document as part of the same commit or pull request.

AI assistants should update this document whenever they establish new patterns or conventions in the codebase that future assistants should follow.
