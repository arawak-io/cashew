#! /bin/bash

grunt build
git config user.name ${GIT_USER_NAME}
git config user.email ${GIT_USER_EMAIL}
git commit -am "Building for deployment"
git remote add production ${SERVER_ADDRESS}
git push production master -f
