const markdownpdf = require('markdown-pdf');
const merge = require('easy-pdf-merge');
const { withDir } = require('tmp-promise');
const request = require('request-promise');
const fs = require('fs').promises;
const hbs = require('handlebars');
require('handlebars-helpers')();
// const _ = require('lodash');

const md2pdf = (md) => {
  return new Promise((resolve, reject) => {
    markdownpdf({
      cssPath: `${__dirname}/doc-gen/custom.css`,
      remarkable: {
        linkify: true,
      },
    }).from.string(md).to.buffer({encoding: 'buffer'}, (err, buff) => {
      if(err) reject(err);
      else resolve(buff);
    });
  });
};

const mergePdf = (files, output) => {
  return new Promise((resolve, reject) => {
    merge(files, output, (err) => {
      if(err) reject(err);
      else resolve();
    });
  });
};

const s3Upload = (app, key, buff) => {
  return new Promise((resolve) => {
    app.buckets.private.putObject({
      Key: key,
      Body: buff,
      ContentType: 'application/pdf',
    }, resolve);
  });
};

const ensurePath = async (app, groupId, path) => {
  const content = app.service('content');
  const folders = path.split('/');
  const name = folders.pop();
  let parent;
  if (folders.length) parent = await ensurePath(app, groupId, folders.join('/'));
  else parent = (await content.find({ query: { groupId, name: '.directory', parent: {$exists: false} } }))[0]._id;

  let folder = (await content.find({ query: { groupId, parent, name } }))[0];
  if (!folder) folder = await content.create({ groupId, parent, name, type: 'text/x-directory', ext: 'directory' });

  return folder._id;
};

module.exports = (app) => app.docGen = async (source, data, options) => {
  const template = hbs.compile(source);
  const opts = {
    appendix: [],
    path: '/',
    filename: `${Date.now()}.pdf`,
    ...options,
  };
  
  const md = template(data);
  let fileBuff = await md2pdf(md);

  if (opts.appendix.length) await withDir(async (o) => {
    const appendixContent = await Promise.all(opts.appendix.map(fileId => app.service('content').get(fileId)));
    const buffs = await Promise.all(appendixContent.map(cont => request({ uri: cont.presign.url, encoding: null })));
    buffs.unshift(fileBuff);
    const files = buffs.map((buff, i) => `${o.path}/${i}.pdf`);
    await Promise.all(buffs.map((buff, i) => fs.writeFile(`${o.path}/${i}.pdf`, buff)));
    await mergePdf(files, `${o.path}/output.pdf`);
    fileBuff = await fs.readFile(`${o.path}/output.pdf`);
  }, { unsafeCleanup: true });


  const parent = await ensurePath(app, opts.groupId, opts.path);
  const doc = await app.service('content').create({
    groupId: opts.groupId,
    parent,
    name: opts.filename,
    type: 'application/pdf',
    ext: 'pdf',
  });
  await s3Upload(app, doc.key, fileBuff);

  return {md, doc};
};
