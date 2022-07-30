# Tomb Raider Marathon Bundle

TRM bundle for NodeCG with built in Tiltify. This bundle was used during TRM IX.

Marathon colour is: #ffa301 / #fe5100

---

## Installation

1. Download the latest [NodeCG Release](https://github.com/nodecg/nodecg/releases) (1.8 is used currently)
2. Copy this folder to `<nodecg>/bundles/` and then run `install.bat`
3. Run NodeCG

## Development Rules

Development for this bundle should **never** be done on the `main` branch. Always create a new branch with a brief description of the changes you wish to make.

Once you are happy with your changes then you can push them to GitHub and [create a new Pull Request](https://github.com/Forceh91/trm-viii/pulls).

### Before pushing your branch to GitHub

You need to make sure that your branch is inline with the `main` branch before you push it up to GitHub. To do this, you will need to do the following:

```cmd
git checkout main
git pull
git checkout -
git rebase main
git push
```

You may encounter merge conflicts during the rebase process. You will have to fix the merge conflicts manually before continuing. Once the merge conflicts have been fixed and staged, you can do `git rebase --continue`.

It is important that rebasing is done so that no merge conflicts appear once you have created the pull request. This makes the PR process much more streamlined.

### When creating a new Pull Request

Make sure you add a new reviewer using the `Reviewers` cog on the right column.
