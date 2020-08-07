import Vue from 'vue';
import store from '@/store';
import md5 from 'crypto-js/md5';
import typedArraysLib from 'crypto-js/lib-typedarrays';
import supportedFiles from '../supportedFiles';

const contentLib = {
  async _get(id) {
    const current = store.getters['content/current'];
    const get = await store.dispatch('content/get', id);
    store.commit('content/setCurrent', (current || {})._id);
    return get;
  },
  async _patch(id, data) {
    const current = store.getters['content/current'];
    const get = await store.dispatch('content/patch', [id, data]);
    store.commit('content/setCurrent', (current || {})._id);
    return get;
  },
  _url2File(url, filename, type) {
    type = type || (url.match(/^data:([^;]+);/) || '')[1];
    return (fetch(url)
      .then(res => res.arrayBuffer())
      .then(buf => new File([buf], filename, { type }))
    );
  },
  _file2Url(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  },
  _file2MD5(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wordArray = typedArraysLib.init(evt.target.result);
        resolve(md5(wordArray).toString());
      };
      reader.readAsArrayBuffer(file);
    });
  },
  async _findFile(name, parent, opts = { createIfNotFound: false }) {
    const { Content } = Vue.$FeathersVuex;
    if (name instanceof Content) return name;

    const currGroup = store.getters['groups/current'];
    if (!currGroup) throw new Error('Not operating in the context of any group.');
    let query = { groupId: currGroup._id, name };
    if (/^[0-9abcdef]{24}$/.test(name)) query = { groupId: currGroup._id, $or: [{ _id: name }, { name }] };

    const parentContent = parent
      ? await this._findFile(parent, null, { ...opts, type: 'text/x-directory' })
      : null;
    if (parentContent) query.parent = parentContent._id;

    // check the local store
    let res = store.getters['content/find']({ query }).data;
    if (res.length === 1) return new Content(res[0]);
    if (res.length) throw new Error('File description given is too vuage.');

    // check the remote store
    res = await store.dispatch('content/find', { query });
    if (res.length === 1) return new Content(res[0]);
    if (res.length) throw new Error('File description given is too vuage.');

    // not found, so let's create
    if (!opts.createIfNotFound) throw new Error('Specified file was not found.');

    const current = store.getters['content/current'];
    let cont = new Content({
      name,
      groupId: currGroup._id,
      perms: opts.perms || [],
      type: opts.type || undefined,
      parent,
    });
    cont = await cont.save();

    store.commit('content/setCurrent', (current || {})._id);
    return cont;
  },
  async _readReq(content) {
    const { filename, presign } = content;
    const res = await fetch(presign.url);
    if (res.status !== 200) throw new Error('An issue occured and the file could not be loaded.');
    return new File([await res.blob()], filename, res.headers['Content-Type']);
  },
  async _writeReq(content, payload) {
    // convert payload to file
    const { presign, type } = content;
    const filename = content.key.split('/').pop();// name.split('/').pop();
    let file = null;
    if (typeof payload === 'string') {
      if (/^((data:)|(https{0,1}:\/\/)|(s{0,1}ftp:\/\/))/.test(payload) && type !== 'text/uri-list') {
        payload = await this._url2File(payload, filename, type);
      } else payload = new Blob([payload], { type });
    }
    if (payload instanceof File) file = payload;
    else if (payload instanceof Blob) {
      file = new File([payload], filename, { lastModified: Date.now() });
    }
    if (!file) throw new Error('Unknown payload type.');
    // gen md5
    const filemd5 = await this._file2MD5(file);

    // build request
    const fd = new FormData();
    Object.keys(presign.fields).forEach(i => fd.append(i, presign.fields[i]));
    fd.append('file', file);

    // send request
    await fetch(presign.url, {
      method: presign.method,
      headers: {
        // 'Content-Type': 'multipart/form-data',
        'Content-MD5': filemd5,
      },
      body: fd,
    });
    return file;
  },
  async _getPresign(content, method) {
    const { Content } = Vue.$FeathersVuex;
    if (method === 'read') {
      if (content.presign && content.presign.expires > Date.now() && content.presign.method === 'GET') {
        return content;
      }
      return new Content(await this._get(content._id));
    } else if (method === 'write') {
      if (content.presign && content.presign.expires > Date.now() && content.presign.method !== 'GET') {
        return content;
      }
      return new Content(await this._patch(content._id, {}));
    }
    throw new Error('Unknown Method');
  },
  async readFile(name, parent, c = 0) {
    store.commit('content/setOperationPending');
    let file = null;
    let content = null;
    try {
      content = await this._findFile(name, parent);
      content = await this._getPresign(content, 'read');
      file = await this._readReq(content);
    } catch (err) {
      if (c >= 3) file = new File([err.message], content.filename);
      else {
        file = await (() => new Promise((resolve, reject) => {
          setTimeout(() => {
            this.readFile(content || name, parent, c + 1).then(resolve).catch(reject);
          }, 1000);
        }))();
      }
    }
    store.commit('content/unsetOperationPending');
    return file;
  },
  async createFile(name, parent, payload, type, perms) {
    store.commit('content/setOperationPending');
    const parts = name.split('/');
    const fileName = parts.pop();
    let parentContent = null;
    if (parts.length) {
      const currGroup = store.getters['groups/current'];
      if (!currGroup) throw new Error('Not operating in the context of any group.');
      const root = store.getters['content/find']({
        query: {
          name: '.directory',
          groupId: currGroup._id,
          parent: { $exists: false },
        },
      }).data[0];
      parentContent = await parts.reduce(async (a, p) =>
        this._findFile(p, a ? (await a) : null, {
          createIfNotFound: true,
          type: 'text/x-directory',
          perms,
        }), (async () => root._id)());
    }
    if (payload instanceof File) type = payload.type; // eslint-disable-line prefer-destructuring
    if (!type) throw new Error('Mime-Type must be specified when creating a file, either as an arg or passing a File as the payload.');
    let content = await this._findFile(fileName, parentContent ? parentContent._id : parent, {
      createIfNotFound: true,
      type,
      perms,
    });
    let file = null;
    if (type !== 'text/x-directory') {
      content = await this._getPresign(content, 'write');
      file = await this._writeReq(content, payload);
    }
    store.commit('content/unsetOperationPending');
    return { content, file, type };
  },
  async writeFile(name, parent, payload) {
    if (typeof name !== 'string' && !payload) payload = parent;
    store.commit('content/setOperationPending');
    let content = await this._findFile(name, parent);
    content = await this._getPresign(content, 'write');
    const file = await this._writeReq(content, payload);
    store.commit('content/unsetOperationPending');
    return file;
  },
  async renameFile(name, newName) {
    store.commit('content/setOperationPending');
    const { Content } = Vue.$FeathersVuex;
    let content = await this._findFile(name);
    content = await this._patch(content._id, { name: newName });
    store.commit('content/unsetOperationPending');
    return new Content(content);
  },
  async changeFileType(name, type) {
    store.commit('content/setOperationPending');
    const { Content } = Vue.$FeathersVuex;
    let content = await this._findFile(name);
    const filename = `${content.filename.replace(/\.[\w-]+$/, '')}.${supportedFiles[type].ext[0]}`;
    const path = content.path ? `${content.path}/` : '';
    const newName = `${content.groupId}/${path}${filename}`;
    content = await this._patch(content._id, { name: newName, type });
    store.commit('content/unsetOperationPending');
    return new Content(content);
  },
  async deleteFile(name, parent) {
    store.commit('content/setOperationPending');
    let content = await this._findFile(name, parent);
    content = await content.remove();
    store.commit('content/unsetOperationPending');
    return content;
  },
  async copyFile(name, copyName, parent) {
    store.commit('content/setOperationPending');
    let content = await this._findFile(name);
    const parentContent = parent ? (await this._findFile(parent)) : content.parent;
    content.copy = content._id;
    delete content._id;
    content.name = copyName;
    if (parentContent) content.parent = parentContent._id;
    content = await content.save();
    store.commit('content/unsetOperationPending');
    return content;
  },
  async downloadFile(name, parent) {
    store.commit('content/setOperationPending');
    let content = await this._findFile(name, parent);
    content = await this._getPresign(content, 'read');
    const file = await this._readReq(content);
    const link = document.createElement('a');
    link.href = await this._file2Url(file);
    store.commit('content/unsetOperationPending');
    link.setAttribute('download', content.filename);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    return file;
  },
  _sort(arr) {
    const dir = 'text/x-directory';
    return arr.sort((a, b) => {
      if (a.type === dir && b.type !== dir) return -1;
      if (a.type !== dir && b.type === dir) return 1;
      const an = (a.type === dir ? a.path.split('/').pop() : a.filename || a.name).toLowerCase();
      const bn = (b.type === dir ? b.path.split('/').pop() : b.filename || b.name).toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return 0;
    });
  },
};


export default (() => {
  const plugin = {
    contentLib,
    install() {
      Object.defineProperty(Vue.prototype, '$content', {
        get() { return contentLib; },
      });
    },
  };
  Vue.use(plugin);
  return contentLib;
})();
