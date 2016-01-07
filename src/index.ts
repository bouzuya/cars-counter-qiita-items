import * as url from 'url';
import moment from 'moment';
import fetch from 'node-fetch';

function buildUrl(page) {
  const uri = 'https://qiita.com/api/v2/authenticated_user/items';
  const urlObj = url.parse(uri);
  urlObj.query = { per_page: 100, page };
  return url.format(urlObj);
}

export default function main(callback: (error: Error, counts: any) => void) {
  const since = moment().subtract(1, 'day').startOf('year');
  const token = process.env.QIITA_TOKEN;
  const f = (result = [], page = 1) =>
    fetch(buildUrl(page), { headers: { Authorization: `Bearer ${token}` } })
    .then(response => response.json())
    .then(items => {
      const filtered = items
        .filter(i => {
          const d = moment(i.created_at);
          return d.isSame(since) || d.isAfter(since);
        });
      return items.length === 100 && items.length === filtered.length
        ? f(result.concat(items), page + 1)
        : result.concat(filtered);
    });

  f()
  .then((items => callback(null, { 'qiita-items': items.length })), callback);
}
