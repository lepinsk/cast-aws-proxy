# cast-aws-proxy

## What.

CloudFront caches the first reponse it gets when it gets a cache miss. This is [problematic](https://forums.aws.amazon.com/thread.jspa?messageID=555417#555417) with CORS, because the first request may be missing the ```Origin``` header, which would cause CloudFront to cache a response that has no ```Access-Control-Allow-Origin``` header. This is a [known issue](http://stackoverflow.com/a/21371500/903936), and the suggested fix is to run a server like this one right here. (Edit: You may also find that CloudFront's [forward custom headers](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/forward-custom-headers.html) feature helps here.)

**cast-aws-proxy** is a tiny middleware proxy server that runs in between CloudFront and your origin (probably S3?) and can forcibly add these headers to *every* response, ensuring the CloudFront cache has the headers you need it to have.

## How do I use this?

1. Deploy this server to Heroku by clicking the button below
	
	[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)
2. Configure your ```ORIGIN_URI``` environment variable, and any other [optional variables](#optional-variables) as needed
3. (Optional) Override the [```forced-headers.json```](#forced-headers) file locally or by pointing to an external file with ```REMOTE_FORCED_HEADERS```
4. Point your Cloudfront bucket to your Heroku server URL instead of your S3 url

## Configuration

**cast-aws-proxy** expects some configuration variables, either in ```.local-config.json``` or in your environment (```process.env```). If it doesn't find a ```process.env.PORT``` variable (which is present on all Heroku servers), it will attempt to load ```.local-config.json``` and use it to populate ```process.env``` for the lifetime of the server.

### Required variables

The server definitely won't start if these aren't present.

* ```ORIGIN_URI```: the origin server that you'd like to proxy requests to; for example: ```https://s3.amazonaws.com/your-bucket```
* ```PORT```: the port your server should bind to (this is pre-configured in production on Heroku)

### Optional variables

* ```VERBOSE_LOGS```: true if present; this will force the server to verbosely log requests and header modifications
* ```OVERWRITE_EXISTING```: true if present; this will set headers from ```forced-headers.json``` even if the response already contains the same header
* ```REMOTE_FORCED_HEADERS```: a URL to a remote ```forced-headers.json``` file, which will take priority over the local ```forced-headers.json``` file and be loaded at run-time. The server will ignore this value if it contains an empty string.

### Forced headers

```forced-headers.json``` is your header configuration file; the headers as defined in this file will be appended to each request proxied through this server. (By default, they won't overwrite preexisting headers if a matching header is *already* present; the ```OVERWRITE_EXISTING``` environment variable changes this behaviour) Here's the contents of the ```forced-headers.json``` file found in the root of this project:

```js
{
	"Access-Control-Allow-Origin": "*",
	"Vary": "Origin",
	"x-cast-aws-proxy": "heckyeah"
}
```

### ```.local-config.json```

If you'd like to store your env vars in a file locally, the server will attempt to load them from ```.local-config.json``` if it doesn't find a ```PORT``` environment variable. Here's a sample of what this file might look like:

```js
{
	"ORIGIN_URI": "https://s3.amazonaws.com/your-s3-bucket",
	"PORT": 3000
}
```

By default the server will load these values from the ```forced-headers.json``` file found in the project root. If you'd like to host this file elsewhere (useful for a one-click deploy on Heroku), add a ```REMOTE_FORCED_HEADERS``` environment variable that contains a URL to your remote headers file.

## Tests

Run:

```bash
$ npm test
```

## Credits

This project was built as part of [Cast](https://tryca.st/?ref=castawsproxy), a platform that makes it easy and fun to record, edit and publish podcasts from your browser.
