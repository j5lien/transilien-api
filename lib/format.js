const moment = require('moment');

const extractNode = (node) => node.shift();
const formatDate = (date) => new Date(moment(extractNode(date)['_'], 'DD/MM/YYYY HH:mm').format());
const formatStatus = (status) => undefined === status ? 'on-time' : ('Supprimé' === extractNode(status) ? 'deleted' : 'late');

module.exports = (trains) => trains.map(({date, num, miss, term, etat}) => ({
  date: formatDate(date),
  id: extractNode(num),
  type: extractNode(miss),
  terminus: extractNode(term),
  status: formatStatus(etat),
}));
