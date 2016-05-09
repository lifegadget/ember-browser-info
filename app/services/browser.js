import browser from 'ember-browser-info/services/browser';
import ENV from '../config/environment';
const config = ENV['ember-browser-info'] || {};

export default browser.extend({
  geoService: config.geoService || 'ipinfo',
});
