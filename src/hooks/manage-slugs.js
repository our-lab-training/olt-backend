// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const { BadRequest } = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const { id, data, existing, service } = context;
    const { slugs=[] } = (existing || {});
    let groups = null;
    if(data.slugs) delete data.slugs;

    if (!data.name) return context;

    //generate a unique slug, the one at index 0 is considered "reserved"
    let nameSlug = data.name.trim().toLowerCase().replace(/[^\w- ]/g, '').replace(/[ ]/g, '_');
    let slug = nameSlug;
    for(let i = 1; i < 100; i++){
      groups = await service.find({query: {'slugs[0]': slug, _id: {$ne: id}}, paginate: false});
      if(groups.length < 1) break;
      slug = `${nameSlug}_${i}`;
    }

    // move slug to the 0 index  
    const ind = slugs.indexOf(slug);
    if(ind === 0) return context;
    if(ind !== -1) slugs.splice(ind, 1);
    slugs.unshift(slug);
    context.data.slugs = slugs;

    // find any groups with the slug, and remove it from their list as well.
    groups = await service.find({query: {slugs: slug, _id: {$ne: id}}, paginate: false});
    await Promise.all(groups.reduce((a, group) => {
      const gslugs = group.slugs;
      const i = gslugs.indexOf(slug);
      if(i === -1) return a;
      // if 0, then the unique gen above never found an answer, throw an error.
      if(i === 0) throw new BadRequest('Too many groups sharing the same name, cannot generate slug');
      gslugs.splice(i, 1);
      a.push(service.patch(group._id, {slugs: gslugs}));
      return a; 
    } , []));

    return context;
  };
};
