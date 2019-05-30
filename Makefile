#!make

# default:
# 	echo "No default goal defined"


tests:
	npm run test

tests.watch:
	npm run test:watch

tests.coverage: test
	npm run test:coverage


lint:
	npm run lint


release: tests
	npm version patch

release.minor: tests
	npm version minor

release.major: tests
	npm version major

publish:
	npm publish --access public