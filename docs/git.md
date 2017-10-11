There are 5 major branchlines:
1. develop
2. feature
3. release
4. hotfix
5. master

## Develop
Branch *develop* is a long-running branch.
Branch *develop* should be stable.
Never push a commit to develop directly.
Branches *feature-M* start from branch *develop*.

## Feature
Branch *feature-M* should define a certain feature.
After work on a feature is completed, branch *feature-M* is merged into branch *develop*.
Once merged, the branch *feature-M* is deleted.

## Release
Branch *master* is a long-running branch.
Once all features are completed for a relase, branch *release-N* starts from branch *develop*.
Never create branch *feature-M* in branch *release-N*.
Never merge branch *relase* into branch *develop*.

## Hotfix
Branch *hotfix-M* should define a certain fix.
After work on a fix is completed, branch *hotfix-M* is merged into branch *release*.
Once merged, the branch *hotfix-M* is deleted.

# FAQ

1. How to get latest changes from develop branch?
```
git rebase develop
```

2. How to get latest changes from another feature branch?
```
git cherry-pick HASH
```

3. How to get fixes from hotfix branch?
```
git checkout develop
git cherrypick HASH
```

4. How to create a new feature branch?
```
git checkout develop
git pull --rebase
git checkout -b FEATURE_NAME
```

5. Oh, i mistakenly committed in master/develop. What to do?

    - If you haven’t pushed
    ```bash
    # Make new branch with the new commits
    git checkout -b new-branch
    # Push new branch with the new commits
    git push --set-upstream origin new-branch
    # Go back to develop
    git checkout develop
    # Rest develop back to original state
    git reset --hard HEAD~1

    # You can also use --soft and stash the changes to new branch
    # but you have to re-commit
    ```
    - Else, Notify your project manager.


6. Got conflict on rebase, What to do?
```bash
# Look for conflit files [both modified section]
git status -u
# Fix the conflict on *both modified files*
vim conflicts-files.extension
# Make sure all the files are ready to add (don’t add unwanted files, update .gitignore)
git status -u
# Add all the files
git add .   # (Update .gitignore for unrelated repo files)
# Continue rebase patch
git rebase --continue
# Push
git push
# if your branch is diverged, you can use use `git push --force`
# But make sure others are not in that branch
```
