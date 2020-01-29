PREFIX=whisk
IMG=action-typescript-v3.7
INVOKE=python3 invoke.py

start:
	docker run -p 8080:8080 -ti -v $(PWD):/mnt $(IMG)

debug:
	docker run -p 8080:8080 -p 8081:8081 -ti --entrypoint=/bin/bash \
	-v $(PWD):/mnt -e OW_COMPILER=/mnt/bin/compile $(IMG) 

build:
	docker build . -t $(IMG)
	docker tag $(IMG) whisk/$(IMG)
	docker images | grep $(IMG)

## You need to execute make start in another terminal 
test:
	$(INVOKE) init main test/$(IN).js
	#$(INVOKE) run '{}'
	#$(INVOKE) run '{"name":"Mike"}'

.PHONY: start debug test
