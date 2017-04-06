import Ember from 'ember';
import fetch from 'ember-network/fetch';

const { Service, computed, run, RSVP: {Promise} } = Ember;
const GET_IP = 'https://api.ipify.org?format=text';

const parseFetch = ( response ) => {
  if (response.headers.get('Content-Type') === 'application/json') {
    return response.json();
  }
  return response.text();
};

export default Service.extend({
  ip: null,
  geo: null,

  lookup() {
    return this.getIpAddress()
      .then( () => { return this.getGeoInfo(); })
      .then( () => { return this.get('info'); })
  },

  getIpAddress() {
    const ip = this.get('ip');
    if(ip) { return Promise.resolve(ip); }

    return fetch( GET_IP )
      .then( parseFetch )
      .then( ip => { return this.set( 'ip', ip ); return ip; })
      .catch( error => {
        this.set( 'ip', 'unknown');
        this.set( 'ipError', error);
      });
  },

  getGeoInfo() {
    const geo = this.get('geo');
    if(geo) { return Promise.resolve(geo); }

    return fetch( this.geoServiceUrl() )
      .then( parseFetch )
      .then( geo => { this.set( 'geo', geo ); return geo; })
      .catch( error => {
        this.set( 'geo', 'unknown' );
        this.set( 'geoError', error );
      });
  },

  geoServiceUrl( ) {
    const ip = this.get('ip');
    const protocol = this.get( 'protocol' );
    const geoService = this.get( 'geoService' );

    switch( geoService ) {
      case 'ipinfo':
        return `${protocol}//ipinfo.io/${ip}/json`;
      case 'freegeoip':
        return `${protocol}//freegeoip.net/json/${ip}`;
      default:
        return `${protocol}//freegeoip.net/json/${ip}`;
    }
  },

  protocol: computed({
    set(_, value) {
      return value;
    },
    get() {
      return 'https';
    }
  }),

  info: computed( 'ip', 'geo', function() {
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
  })

});
