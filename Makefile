#!make

# default:
# 	echo "No default goal defined"


tests:
	npm test

tests.continuous:
	npm test -- -w
	# npm test -- -w --grep 'lists files recursively'

tests.report:
	npm run test:report


lint:
	npm run lint


release: tests
	npm version patch

release.minor: tests
	npm version minor

release.major: tests
	npm version major