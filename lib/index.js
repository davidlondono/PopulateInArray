const _ = require('lodash');
const _debug = require('debug');
const Promise = require('bluebird');

const debugInfo = _debug('p-in-array');

const isThenable = obj => !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
/**
 * populate the objects
 * @param objects - objects to be populated
 * @param path - key path where to find the id to populate
 * @param placeIn - key path where to put the populated Object
 * @param id - key path to the id of population
 * @param readInArray - function to request results of key values
 * @return {Promise.<Array>}
 */
const populate = ({
  objects,
  path,
  placeIn = path,
  id = 'id',
  readInArray,
}) => {
  debugInfo({ path, placeIn, id, objects });
  const list = _.cloneDeep(objects, true);
  const mapEntities = objs => _.keyBy(objs, id);
  // get values of objects by key
  const keyValues = _.chain(list).uniq().map(path).value();
  debugInfo('keyValues', keyValues);

  // request the objects to populate by ids
  let readInArrayResult = readInArray(keyValues);
  if (!isThenable(readInArrayResult)) {
    readInArrayResult = Promise.resolve(readInArrayResult);
  }
  return readInArrayResult.then((resultObjects) => {

    // map array to object using id as key
    const mappedResults = mapEntities(resultObjects);
    // map objects to add corresponding result
    return _.map(list, obj =>
      _.set(
        obj,
        placeIn,
        _.get(mappedResults, _.get(obj, path))
      ));
  });
};

exports = module.exports = populate;
