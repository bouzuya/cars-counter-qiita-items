'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = main;

var _url = require('url');

var url = _interopRequireWildcard(_url);

var _moment = require('./moment');

var _moment2 = _interopRequireDefault(_moment);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function buildUrl(page) {
    var uri = 'https://qiita.com/api/v2/authenticated_user/items';
    var urlObj = url.parse(uri);
    urlObj.query = { per_page: 100, page: page };
    return url.format(urlObj);
}
function main(callback) {
    var since = (0, _moment2.default)().subtract(1, 'day').startOf('year');
    var token = process.env.QIITA_TOKEN;
    var f = function f() {
        var result = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
        var page = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
        return (0, _nodeFetch2.default)(buildUrl(page), { headers: { Authorization: 'Bearer ' + token } }).then(function (response) {
            return response.json();
        }).then(function (items) {
            var filtered = items.filter(function (i) {
                var d = (0, _moment2.default)(i.created_at);
                return d.isSame(since) || d.isAfter(since);
            });
            return items.length === 100 && items.length === filtered.length ? f(result.concat(items), page + 1) : result.concat(filtered);
        });
    };
    f().then(function (items) {
        return callback(null, { 'qiita-items': items.length });
    }, callback);
}