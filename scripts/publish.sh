#!/usr/bin/env bash

set -o errexit -o nounset

# When running this script on TRAVIS, first run the "setup-git-env.sh" script to set the git username accordingly

setUserInfo () {
  git config --global user.name "patternfly-build"
  git config --global user.email "patternfly-build@redhat.com"
  git config --global push.default simple
}

getDeployKey () {
  # Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
  ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
  ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
  ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
  ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
  openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in deploy_key.enc -out deploy_key -d
  chmod 600 deploy_key
  eval `ssh-agent -s`
  ssh-add deploy_key
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
  sed -i '/public/d' .gitignore
  git add -f public .gitignore
  git commit -m'Added public folder'
  REPO=`git config remote.origin.url`
  SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
  SHA=`git subtree split --prefix public master`
  echo "Pushing commit ${SHA} to repo ${SSH_REPO}."
  git push ${SSH_REPO} ${SHA}:gh-pages --force
}

main () {
  checkRepoSlug "patternfly/patternfly-atomic" "master"
  setUserInfo
  getDeployKey
  deploySite
}

main
