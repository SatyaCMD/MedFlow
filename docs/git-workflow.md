# Git Workflow Guidelines

We utilize Trunk-Based Development combined with short-lived feature branches to ensure safe, iterative deployments.

## 1. Branching Strategy

*   `main`: Protected branch representing current production state.
*   `develop`: Integration branch where features are compiled and validated.
*   `feat/*`: Feature branches (e.g. `feat/phase-1-design-system`).
*   `fix/*`: Bugfix branches.
*   `chore/*`: Configurations and dependencies maintenance.

## 2. Commit Message Standards

We enforce the Conventional Commits specification. Messages must follow this structure:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types:
*   `feat`: A new feature implementation.
*   `fix`: A bug fix.
*   `docs`: Documentation changes.
*   `style`: Code style modifications (formatting, semi-colons).
*   `refactor`: Code alterations which neither fix a bug nor add a feature.
*   `test`: Adding missing tests or correcting existing ones.
*   `chore`: Workspace build tasks or auxiliary dependency updates.

### Examples:
*   `feat(auth): integrate Argon2id password hashing`
*   `fix(billing): correct round-off parsing logic on tax lines`
