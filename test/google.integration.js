/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */
/* eslint-disable no-underscore-dangle */
import assert from 'assert';
import fse from 'fs-extra';
import path from 'path';
import { CLI } from '@adobe/helix-deploy';
import { GoogleDeployer } from '../src/index.js';

describe('Google Integration Test', () => {
  let testRoot;
  let origPwd;

  beforeEach(async () => {
    testRoot = await fse.mkdtemp(path.resolve(__rootdir, 'test', 'tmp', 'test-'));
    origPwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(origPwd);
    await fse.remove(testRoot);
  });

  it.skip('Deploy an older version to Google', async () => {
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'simple-but-older'), testRoot);
    process.chdir(testRoot);
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--plugin', '@adobe/helix-deploy-plugin-google',
        '--target', 'google',
        '--google-key-file', `${process.env.HOME}/.helix-google.json`,
        '--google-email', 'cloud-functions-dev@helix-225321.iam.gserviceaccount.com',
        '--google-project-id', 'helix-225321',
        '--google-region', 'us-central1',
        '--package.params', 'HEY=ho',
        '--update-package', 'true',
        '-p', 'FOO=bar',
        '--test', '/foo',
        '--directory', testRoot,
        '--entryFile', 'index.js',
      ]);
    builder.cfg._logger = { output: '' };

    const res = await builder.run();
    assert.ok(res);
  }).timeout(10000000);

  it.skip('Deploy a newer version to Google and clean up', async () => {
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'simple'), testRoot);
    process.chdir(testRoot);
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--plugin', '@adobe/helix-deploy-plugin-google',
        '--target', 'google',
        '--google-key-file', `${process.env.HOME}/.helix-google.json`,
        '--google-email', 'cloud-functions-dev@helix-225321.iam.gserviceaccount.com',
        '--google-project-id', 'helix-225321',
        '--google-region', 'us-central1',
        '--package.params', 'HEY=ho',
        '--update-package', 'true',
        '-p', 'FOO=bar',
        '--test', '/foo',
        '--directory', testRoot,
        '--entryFile', 'index.js',
        '--cleanup-minor', '1s',
      ]);
    builder.cfg._logger = { output: '' };

    const res = await builder.run();
    assert.ok(res);
  }).timeout(10000000);

  it('Plugin exports GoogleDeployer', () => {
    assert.ok(GoogleDeployer);
    assert.equal(typeof GoogleDeployer.filterFunctions, 'function');
  });
});
