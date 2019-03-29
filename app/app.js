import './stylesheets'
import Ember from 'ember'
import Router from './router'

window.App = Ember.Application.create({
    rootElement: '#ember-app',
    ready() {
        document.getElementById('ember-app').innerHTML = '';
    },
    LOG_TRANSITIONS: true, // basic logging of successful transitions
    LOG_TRANSITIONS_INTERNAL: true // detailed logging of all routing steps
});

App.Router = Router;