/* eslint no-process-exit:off */

import * as url from 'url';

import { Sonar } from '@sonarwhal/sonar/dist/src/lib/sonar';

import { IJob, JobResult } from '../../types';
import * as logger from '../../utils/logging';

const moduleName: string = 'Sonar Runner';

const createErrorResult = (err): JobResult => {
    const jobResult: JobResult = {
        error: null,
        messages: null,
        ok: false
    };

    if (err instanceof Error) {
        // When we try to stringify an instance of Error, we just get an empty object.
        jobResult.error = JSON.stringify({
            message: err.message,
            stack: err.stack
        });
    } else {
        jobResult.error = JSON.stringify(err);
    }

    return jobResult;
};

process.once('uncaughtException', (err) => {
    console.log(err.message);
    console.log(err.stack);
    process.send(createErrorResult(err));
    process.exit(1);
});

process.once('unhandledRejection', (reason) => {
    console.log(reason);
    // reason can not be an instance of Error, but its behavior with JSON.stringify is the same, returns {}
    // Creating a new Error we ensure that reason is going to be an instance of Error.
    process.send(createErrorResult(new Error(reason)));
    process.exit(1);
});

/**
 * Run a Job in sonar.
 * @param {IJob} job - Job to run in sonar.
 */
const run = async (job: IJob) => {
    logger.log(`Running job: ${job.id} - Part ${job.partInfo.part} of ${job.partInfo.totalParts}`, moduleName);
    let result: JobResult = {
        error: null,
        messages: null,
        ok: null
    };

    try {
        const sonar = new Sonar(job.config[0]);

        result.messages = await sonar.executeOn(url.parse(job.url));

        result.ok = true;
    } catch (err) {
        logger.error(`Error runing job ${job.id} - Part ${job.partInfo.part} of ${job.partInfo.totalParts}`, moduleName, err);
        result = createErrorResult(err);
    }
    logger.log(`Sending result for job ${job.id} - Part ${job.partInfo.part} of ${job.partInfo.totalParts}`, moduleName);
    process.send(result);
};

process.on('message', run);
