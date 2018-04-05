// consentForms.js
// Collection for describing a consent form
// Contents:
// - text: list of consent form paragraphs as strings

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const ConsentForms = new Mongo.Collection('consentforms', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('consentforms', function consentFormPublication(){
        return ConsentForms.find();
    });
}
