### cast-aws-proxy

CloudFront caches the first reponse it gets when it gets a cache miss. This is particularly tricky with CORS, because the first request may be missing the ```Origin``` header, which would cause CloudFront to cache a response that has no ```Access-Control-Allow-Origin``` header.

**cast-aws-proxy** is a tiny middleware proxy server that runs in between CloudFront and your origin (probably S3?) and can forcibly add these headers to *every* response, ensuring the CloudFront cache has the headers you need it to have.

#### Configuration

**cast-aws-proxy** expects some configuration variables, either in ```.local-config.json``` or ```process.env```. If it doesn't find a ```process.env.PORT``` variable, it will attempt to load ```.local-config.json``` and use it to populate ```process.env``` for the lifetime of the server.

Required variables:

* ```ORIGIN_URI```: the origin server that you'd like to proxy requests to; for example: ```https://s3.amazonaws.com/your-bucket```
* ```PORT```: the port your server should bind to

Optional variables:

* ```VERBOSE_LOGS```: true if present – will force the server to verbosely log requests and header modifications
* ```OVERWRITE_EXISTING```: true if present – will set headers from ```forced-headers.json``` even if the response already contains the same header

```forced-headers.json``` is your header configuration file.