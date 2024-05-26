# github submodule repo addresses without https:// prefix
BRANCH_TO_CLONE="main"
SUBMODULE_GITHUB="github.com/yinflowltda/agenda-yinflow/"
SUBMODULE_PATH=apps/api/v1
COMMIT=$VERCEL_GIT_COMMIT_SHA

if [ "$VERCEL_GIT_COMMIT_SHA" == "" ]; then
  echo "Error: VERCEL_GIT_COMMIT_SHA is empty"
  exit 0
fi

# github access token is necessary
# add it to Environment Variables on Vercel
if [ "$GITHUB_ACCESS_TOKEN" == "" ]; then
  echo "Error: GITHUB_ACCESS_TOKEN is empty"
  exit 0
fi

# We add an exception to test on staging
if [ "$VERCEL_GIT_COMMIT_REF" == "production" ]; then
  BRANCH_TO_CLONE="-b $VERCEL_GIT_COMMIT_REF"
fi
if [ "$VERCEL_GIT_COMMIT_REF" == "staging" ]; then
  BRANCH_TO_CLONE="-b $VERCEL_GIT_COMMIT_REF"
fi

# stop execution on error - don't let it build if something goes wrong
set -e

git config --global init.defaultBranch main
git config --global advice.detachedHead false

# set up an empty temporary work directory
rm -rf ..?* .[!.]* * || true

# checkout the current commit
git clone -b $BRANCH_TO_CLONE https://$GITHUB_ACCESS_TOKEN@github.com/yinflowltda/agenda-yinflow.git .

echo "Cloned"

# Ensure the submodule directory exists
mkdir -p $SUBMODULE_PATH

# set up an empty temporary work directory
rm -rf tmp || true # remove the tmp folder if exists
mkdir tmp          # create the tmp folder
cd tmp             # go into the tmp folder

# checkout the current submodule commit
git init                                                                      # initialise empty repo
git remote add $SUBMODULE_PATH https://$GITHUB_ACCESS_TOKEN@$SUBMODULE_GITHUB # add origin of the submodule
git fetch --depth=1 $SUBMODULE_PATH $COMMIT                                   # fetch only the required version
git checkout $COMMIT                                                          # checkout on the right commit

# move the submodule from tmp to the submodule path
cd ..                     # go folder up
rm -rf tmp/.git           # remove .git
# Remove existing files/directories in $SUBMODULE_PATH that also exist in tmp
for item in tmp/*; do
  if [ -e "$SUBMODULE_PATH/$(basename $item)" ]; then
    rm -rf "$SUBMODULE_PATH/$(basename $item)"
  fi
done

# Now move the contents
mv tmp/* $SUBMODULE_PATH/ # Move the submodule to the submodule path

echo "TMP Moved"

# clean up
rm -rf tmp # remove the tmp folder

echo "TMP Removed"

git diff HEAD^ HEAD ':!/apps/docs/*' ':!/apps/website/*' ':!/apps/web/*' ':!/apps/swagger/*' ':!/apps/console/*'

echo "Git Diff Done"

echo "✅ - Build can proceed"
exit 1
