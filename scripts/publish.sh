#!/usr/bin/env bash

set -o errexit -o nounset

# When running this script on TRAVIS, first run the "setup-git-env.sh" script to set the git username accordingly

setUserInfo () {
  git config --global user.name "patternfly-build"
  git config --global user.email "patternfly-build@redhat.com"
  git config --global push.default simple
}

checkRepoSlug () {
  REPO_SLUG="${1:-patternfly/patternfly}"
  REPO_BRANCH="${2:-master}"
  echo "$TRAVIS_REPO_SLUG $REPO_SLUG $REPO_BRANCH"
  if [ "${TRAVIS_REPO_SLUG}" = "${REPO_SLUG}" ]; then
    echo "This action is running against ${REPO_SLUG}."
    if [ -z "${TRAVIS_TAG}" -a "${TRAVIS_BRANCH}" != "${REPO_BRANCH}" ]; then
      echo "This commit was made against ${TRAVIS_BRANCH} and not the ${REPO_BRANCH} branch. Aborting."
      exit 1
    fi
  else
    echo "This action is not running against ${REPO_SLUG}. Aborting."
    exit 1
  fi
}

deploySite () {
  git add -f public
  git commit -m'Added public folder'
  git push origin `git subtree split --prefix public master`:gh-pages --force
}

main () {
  checkRepoSlug "patternfly/patternfly-atomic" "master"
  setUserInfo
  deploySite
}
