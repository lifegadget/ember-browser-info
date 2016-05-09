import Ember from 'ember';

const { keys, create } = Object; // jshint ignore:line
const { RSVP: {Promise} } = Ember; // jshint ignore:line
const { inject: {service} } = Ember; // jshint ignore:line
const { computed, observe, $, run, on, typeOf } = Ember;  // jshint ignore:line
const { get, set, debug } = Ember; // jshint ignore:line
const a = Ember.A; // jshint ignore:line
const GET_IP = 'https://api.ipify.org?format=text';

export default Ember.Service.extend({
  lookup() {
    return new Promise((resolve, reject) => {
      this.getIpAddress()
        .then(this.getGeoInfo())
        .then(resolve)
        .catch(reject);
    });
  },
  info: computed('ip', 'geo', function() {
    const {ip, geo, browser, os} = this.getProperties('ip', 'geo', 'browser', 'os');
    if(!ip) {
      run.scheduleOnce('afterRender', () => {
        this.lookup().catch(console.error);
      });
    }
    return {
      os: os,
      browser: browser,
      ip: ip || {error: 'unresolved', message: 'use the lookup() method to get ip and geo'},
      geo: geo || {error: 'unresolved', message: 'use the lookup() method to get ip and geo'},
    };
  }),
  os: computed(function() {
    const appVersion = window.navigator.appVersion;
    let os = "Unknown";
    if (appVersion.indexOf("Win") !== -1) { os = "Windows"; }
    if (appVersion.indexOf("Mac") !== -1) { os = "MacOS"; }
    if (appVersion.indexOf("X11") !== -1) { os = "UNIX"; }
    if (appVersion.indexOf("Linux") !== -1) { os = "Linux"; }

    return os;
  }),
  browser: computed(function() {
    const nAgt = window.navigator.userAgent;
    let browserName  = window.navigator.appName;
    let browserCode;
    let fullVersion  = ''+parseFloat(window.navigator.appVersion);
    let majorVersion = parseInt(window.navigator.appVersion,10);
    let nameOffset,verOffset,ix;

    // In Opera, the true version is after "Opera" or after "Version"
    if ((verOffset = nAgt.indexOf("Opera")) !== -1) {
     browserName = 'Opera';
     browserCode = 'opera';
     fullVersion = nAgt.substring(verOffset+6);
     if ((verOffset = nAgt.indexOf('Version')) !== -1) {
       fullVersion = nAgt.substring(verOffset+8);
     }
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset=nAgt.indexOf("MSIE")) !== -1) {
     browserName = "Microsoft Internet Explorer";
     browserCode = 'ie';
     fullVersion = nAgt.substring(verOffset+5);
    }
    // In Chrome, the true version is after "Chrome"
    else if ((verOffset=nAgt.indexOf("Chrome")) !== -1) {
     browserName = "Chrome";
     browserCode = 'chrome';
     fullVersion = nAgt.substring(verOffset+7);
    }
    // In Safari, the true version is after "Safari" or after "Version"
    else if ((verOffset=nAgt.indexOf("Safari")) !== -1) {
     browserName = "Safari";
     browserCode = 'safari';
     fullVersion = nAgt.substring(verOffset+7);
     if ((verOffset=nAgt.indexOf("Version"))!==-1) {
       fullVersion = nAgt.substring(verOffset+8);
     }
    }
    // In Firefox, the true version is after "Firefox"
    else if ((verOffset=nAgt.indexOf("Firefox")) !== -1) {
     browserName = 'Firefox';
     browserCode = 'firefox';
     fullVersion = nAgt.substring(verOffset+8);
    }
    // In most other browsers, "name/version" is at the end of userAgent
    else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
              (verOffset=nAgt.lastIndexOf('/')) )
    {
     browserName = nAgt.substring(nameOffset,verOffset);
     browserCode = 'other';
     fullVersion = nAgt.substring(verOffset+1);
     if (browserName.toLowerCase() === browserName.toUpperCase()) {
      browserName = navigator.appName;
     }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix=fullVersion.indexOf(";"))!==-1) {
      fullVersion = fullVersion.substring(0,ix);
    }
    if ((ix=fullVersion.indexOf(" "))!==-1) {
      fullVersion=fullVersion.substring(0,ix);
    }

    majorVersion = parseInt(''+fullVersion,10);
    if (isNaN(majorVersion)) {
     fullVersion  = ''+parseFloat(navigator.appVersion);
     majorVersion = parseInt(navigator.appVersion,10);
    }

    return {
      browserName: browserName,
      browserCode: browserCode,
      version: fullVersion,
      majorVersion: majorVersion,
      appName: window.navigator.appName,
      appVersion: window.navigator.appVersion,
      userAgent: window.navigator.userAgent
    };
  }),
  ip: null,
  geo: null,

  getIpAddress() {
    const ip = this.get('ip');
    if(ip) {
      return Promise.resolve(ip);
    }

    return new Promise((resolve, reject) => {
      $.ajax({
        url: GET_IP,
        method: 'GET'
      })
        .done(ip => {
          this.set('ip', ip);
          resolve(ip);
        })
        .fail(error => {
          this.set('ip', 'unknown');
          this.set('ipError', error);
          reject(error);
        });
    });
  },

  getGeoInfo() {
    const geo = this.get('geo');
    if(geo) {
      return Promise.resolve(geo);
    }

    return new Promise((resolve, reject) => {
      this.getIpAddress().then(() => {
        $.ajax({
          url: this.geoServiceUrl('ipinfo'),
          method: 'GET'
        })
          .done(geo => {
            this.set('geo', geo);
            resolve(geo);
          })
          .fail(error => {
            this.set('geo', 'unknown');
            this.set('geoError', error);
            reject(error);
          });
      }).catch(reject);
    });
  },

  geoServiceUrl(service) {
    const ip = this.get('ip');
    switch(service) {
      case 'ipinfo':
        return `http://ipinfo.io/${ip}/json`;
      case 'freegeoip':
        return `http://freegeoip.net/json/${ip}`;
    }
  }
});
