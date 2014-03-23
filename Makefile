REPORTER ?= spec

test:
	mocha test.js --reporter $(REPORTER)

doc:
	npm run-script doc

.PHONY: test, doc