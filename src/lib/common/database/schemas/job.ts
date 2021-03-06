import { Schema } from 'mongoose';

export const JobSchema: Schema = new Schema({
    config: {},
    error: [{}],
    finished: Date,
    id: String,
    investigated: Boolean,
    queued: Date,
    rules: [{}],
    sonarVersion: String,
    started: Date,
    status: {},
    url: String
});
