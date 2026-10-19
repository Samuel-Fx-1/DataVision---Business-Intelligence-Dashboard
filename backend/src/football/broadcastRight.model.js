'use strict';

const mongoose = require('mongoose');
const { keys } = require('./leagues');

const PROVIDER_TYPES = ['tv', 'streaming', 'free-to-air', 'official-youtube'];

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: PROVIDER_TYPES, default: 'tv' },
    // Official page or app of the broadcaster. https only.
    url: { type: String, trim: true, maxlength: 500, default: null },
    // Official embeddable stream (e.g. a league's own YouTube Live). Allow-listed hosts only.
    embedUrl: { type: String, trim: true, maxlength: 500, default: null },
    requiresSubscription: { type: Boolean, default: true },
    notes: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { _id: false },
);

const broadcastRightSchema = new mongoose.Schema(
  {
    competition: { type: String, required: true, enum: keys },
    countryCode: { type: String, required: true, uppercase: true, trim: true, match: /^[A-Z]{2}$/ },
    providers: { type: [providerSchema], default: [] },
    lastVerifiedAt: { type: Date, default: Date.now },
    verifiedBy: { type: String, trim: true, maxlength: 80, default: '' },
  },
  { timestamps: true },
);

// One document per competition + country.
broadcastRightSchema.index({ competition: 1, countryCode: 1 }, { unique: true });

module.exports = mongoose.models.BroadcastRight || mongoose.model('BroadcastRight', broadcastRightSchema);
module.exports.PROVIDER_TYPES = PROVIDER_TYPES;
