# Ember-browser-info

This README outlines the details of collaborating on this Ember addon.

## Overview

This addon provides os and browser metrics but also looks up the user's IP address and then geographic information based on that IP address.

## Install

```sh
ember install ember-browser-info
```

## Dependencies

No npm or bowser packages needed. It does leverage API's to get the browser IP address and geographical info:

- **IP Address**: uses [`ipify.org`'s](http://ipify.org) API for looking up IP addresses
- **Geo**: uses [IpInfo's](http://ipinfo.io) API by default but if can also use [FreeGeoIP's](http://freegeoip.net) if you'd prefer.

  > To use **FreeGeoIP**, you'll need to set your the `ENV[ember-browser-info].geoService` property to "freegeoip" in your `environment.js` file.

## Demo

Check out the online demo:
- [https://ember-browser-info.firebaseapp.com](https://ember-browser-info.firebaseapp.com)

## License

Copyright (c) 2016 LifeGadget Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
